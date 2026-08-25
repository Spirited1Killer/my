import * as THREE from "three";
import { animateCalf, createCalf } from "@/lib/game/createCalf";
import {
  createFeather,
  createInkMaterials,
  createObstacle,
  createWorld,
  scrollLaneDashes,
  WORLD_COLORS,
  type InkMaterials,
} from "@/lib/game/createWorld";
import {
  HIGH_SCORE_KEY,
  LANES,
  type GameState,
  type HudListener,
  type HudSnapshot,
} from "@/lib/game/types";

type PoolItem = {
  mesh: THREE.Group;
  active: boolean;
  lane: number;
  z: number;
  kind?: string;
  jumpRequired?: boolean;
};

export class NiulaiEngine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private mats: InkMaterials;
  private world: THREE.Group;
  private calf: THREE.Group;
  private sky: THREE.Mesh;

  private state: GameState = "menu";
  private laneIndex = 1;
  private targetX = 0;
  private jumpY = 0;
  private jumpV = 0;
  private grounded = true;

  private speed = 10;
  private distance = 0;
  private score = 0;
  private feathers = 0;
  private highScore = 0;
  private isNewRecord = false;
  private spawnTimer = 0;
  private featherTimer = 0;
  private elapsed = 0;

  private obstacles: PoolItem[] = [];
  private featherPool: PoolItem[] = [];
  private hud?: HudListener;
  private raf = 0;
  private disposed = false;

  private keys = new Set<string>();
  private touchStart: { x: number; y: number; t: number } | null = null;

  private onKeyDown: (e: KeyboardEvent) => void;
  private onKeyUp: (e: KeyboardEvent) => void;
  private onTouchStart: (e: TouchEvent) => void;
  private onTouchEnd: (e: TouchEvent) => void;
  private onResize: () => void;

  constructor(private canvas: HTMLCanvasElement) {
    this.highScore = Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(WORLD_COLORS.skyBottom);

    this.camera = new THREE.PerspectiveCamera(
      55,
      canvas.clientWidth / Math.max(canvas.clientHeight, 1),
      0.1,
      200,
    );
    this.camera.position.set(0, 4.2, 8.5);
    this.camera.lookAt(0, 1.2, -6);

    this.mats = createInkMaterials();
    this.world = createWorld(this.mats);
    this.scene.add(this.world);

    // shader 渐变天空（无贴图）
    const skyGeo = new THREE.SphereGeometry(90, 24, 16);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color(WORLD_COLORS.skyTop) },
        bottomColor: { value: new THREE.Color(WORLD_COLORS.skyBottom) },
        offset: { value: 4 },
        exponent: { value: 0.7 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
    });
    this.sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.sky);

    const hemi = new THREE.HemisphereLight(0xf5f0e4, 0x6b735f, 1.05);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff4df, 1.15);
    sun.position.set(-8, 16, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -10;
    this.scene.add(sun);

    this.scene.fog = new THREE.Fog(WORLD_COLORS.fog, 28, 85);

    this.calf = createCalf();
    this.calf.position.set(0, 0, 0);
    this.scene.add(this.calf);

    this.initPools();

    this.onKeyDown = (e) => this.handleKeyDown(e);
    this.onKeyUp = (e) => this.keys.delete(e.code);
    this.onTouchStart = (e) => {
      const t = e.changedTouches[0];
      this.touchStart = { x: t.clientX, y: t.clientY, t: performance.now() };
    };
    this.onTouchEnd = (e) => this.handleTouchEnd(e);
    this.onResize = () => this.resize();

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    canvas.addEventListener("touchstart", this.onTouchStart, { passive: true });
    canvas.addEventListener("touchend", this.onTouchEnd, { passive: true });
    window.addEventListener("resize", this.onResize);

    this.emitHud();
    this.loop();
  }

  onHud(listener: HudListener) {
    this.hud = listener;
    this.emitHud();
  }

  getSnapshot(): HudSnapshot {
    return {
      state: this.state,
      score: Math.floor(this.score),
      highScore: this.highScore,
      distance: Math.floor(this.distance),
      feathers: this.feathers,
      speed: Number(this.speed.toFixed(1)),
      isNewRecord: this.isNewRecord,
    };
  }

  start() {
    this.resetRun();
    this.state = "playing";
    this.clock.start();
    this.emitHud();
  }

  pause() {
    if (this.state !== "playing") return;
    this.state = "paused";
    this.emitHud();
  }

  resume() {
    if (this.state !== "paused") return;
    this.state = "playing";
    this.clock.getDelta();
    this.emitHud();
  }

  togglePause() {
    if (this.state === "playing") this.pause();
    else if (this.state === "paused") this.resume();
  }

  restart() {
    this.start();
  }

  backToMenu() {
    this.state = "menu";
    this.resetRun();
    this.emitHud();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.canvas.removeEventListener("touchstart", this.onTouchStart);
    this.canvas.removeEventListener("touchend", this.onTouchEnd);
    window.removeEventListener("resize", this.onResize);
    this.renderer.dispose();
  }

  private initPools() {
    const kinds = ["rock", "wood", "snake", "wolf"] as const;
    for (let i = 0; i < 16; i++) {
      const kind = kinds[i % kinds.length];
      const mesh = createObstacle(kind, this.mats);
      mesh.visible = false;
      this.scene.add(mesh);
      this.obstacles.push({ mesh, active: false, lane: 1, z: 0, kind });
    }
    for (let i = 0; i < 24; i++) {
      const mesh = createFeather(this.mats);
      mesh.visible = false;
      this.scene.add(mesh);
      this.featherPool.push({ mesh, active: false, lane: 1, z: 0 });
    }
  }

  private resetRun() {
    this.laneIndex = 1;
    this.targetX = LANES[1];
    this.jumpY = 0;
    this.jumpV = 0;
    this.grounded = true;
    this.speed = 10;
    this.distance = 0;
    this.score = 0;
    this.feathers = 0;
    this.isNewRecord = false;
    this.spawnTimer = 1.3;
    this.featherTimer = 1.6;
    this.elapsed = 0;
    this.calf.position.set(0, 0, 0);
    for (const o of this.obstacles) this.deactivate(o);
    for (const f of this.featherPool) this.deactivate(f);
  }

  private deactivate(item: PoolItem) {
    item.active = false;
    item.mesh.visible = false;
  }

  private emitHud() {
    this.hud?.(this.getSnapshot());
  }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.canvas;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h, false);
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(e.code)) {
      e.preventDefault();
    }
    this.keys.add(e.code);

    if (e.code === "KeyP" || e.code === "Escape") {
      if (this.state === "playing" || this.state === "paused") this.togglePause();
      return;
    }

    if (this.state !== "playing") return;

    if (e.code === "ArrowLeft" || e.code === "KeyA") this.changeLane(-1);
    if (e.code === "ArrowRight" || e.code === "KeyD") this.changeLane(1);
    if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space") {
      this.jump();
    }
  }

  private handleTouchEnd(e: TouchEvent) {
    if (!this.touchStart || this.state !== "playing") return;
    const t = e.changedTouches[0];
    const dx = t.clientX - this.touchStart.x;
    const dy = t.clientY - this.touchStart.y;
    const dt = performance.now() - this.touchStart.t;
    this.touchStart = null;

    if (dt > 500) return;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      this.changeLane(dx > 0 ? 1 : -1);
    } else if (Math.abs(dy) > 35 && dy < 0) {
      this.jump();
    } else if (Math.abs(dx) < 18 && Math.abs(dy) < 18) {
      this.jump();
    }
  }

  private changeLane(dir: -1 | 1) {
    this.laneIndex = Math.max(0, Math.min(2, this.laneIndex + dir));
    this.targetX = LANES[this.laneIndex];
  }

  private jump() {
    if (!this.grounded || this.state !== "playing") return;
    this.jumpV = 7.2;
    this.grounded = false;
  }

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    let dt = this.clock.getDelta();
    dt = Math.min(dt, 0.05); // 防切后台穿模

    if (this.state === "playing") {
      this.updatePlaying(dt);
    } else {
      animateCalf(this.calf, this.clock.elapsedTime, false);
    }

    this.updateAtmosphere();
    this.renderer.render(this.scene, this.camera);
  };

  private updatePlaying(dt: number) {
    this.elapsed += dt;
    this.speed = Math.min(22, 10 + this.elapsed * 0.35);
    this.distance += this.speed * dt;
    this.score += this.speed * dt * 1.8;

    // 变道平滑
    this.calf.position.x += (this.targetX - this.calf.position.x) * Math.min(1, dt * 12);

    // 跳跃
    if (!this.grounded) {
      this.jumpV -= 18 * dt;
      this.jumpY += this.jumpV * dt;
      if (this.jumpY <= 0) {
        this.jumpY = 0;
        this.jumpV = 0;
        this.grounded = true;
      }
    }
    this.calf.position.y = this.jumpY;

    animateCalf(this.calf, this.clock.elapsedTime, true);
    scrollLaneDashes(this.world, this.speed, dt);

    const birds = this.world.userData.birds as THREE.Group | undefined;
    if (birds) {
      birds.position.x = Math.sin(this.elapsed * 0.15) * 0.8;
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnObstacleWave();
      this.spawnTimer = Math.max(1.15, 2.15 - this.elapsed * 0.015) + Math.random() * 0.45;
    }

    this.featherTimer -= dt;
    if (this.featherTimer <= 0) {
      this.spawnFeatherPattern();
      this.featherTimer = 2.2 + Math.random() * 1.4;
    }

    this.updateObstacles(dt);
    this.updateFeathers(dt);
    this.emitHud();
  }

  private spawnObstacleWave() {
    const pattern = Math.random();
    if (pattern < 0.62) {
      this.activateObstacle(Math.floor(Math.random() * 3), -48 - Math.random() * 8);
    } else if (pattern < 0.9) {
      const a = Math.floor(Math.random() * 3);
      let b = Math.floor(Math.random() * 3);
      while (b === a) b = Math.floor(Math.random() * 3);
      this.activateObstacle(a, -50);
      this.activateObstacle(b, -56);
    } else {
      const open = Math.floor(Math.random() * 3);
      for (let i = 0; i < 3; i++) {
        if (i !== open) this.activateObstacle(i, -52);
      }
    }
  }

  private activateObstacle(lane: number, z: number) {
    const item = this.obstacles.find((o) => !o.active);
    if (!item) return;
    item.active = true;
    item.lane = lane;
    item.z = z;
    item.mesh.visible = true;
    item.mesh.position.set(LANES[lane], 0, z);
    item.mesh.rotation.y = Math.random() * 0.4 - 0.2;
  }

  private spawnFeatherPattern() {
    const lane = Math.floor(Math.random() * 3);
    const arc = Math.random() > 0.45;
    const startZ = -42;
    const count = arc ? 5 : 4;
    for (let i = 0; i < count; i++) {
      const item = this.featherPool.find((f) => !f.active);
      if (!item) break;
      item.active = true;
      item.lane = lane;
      item.z = startZ - i * 2.2;
      item.jumpRequired = arc;
      item.mesh.visible = true;
      const y = arc ? 0.35 + Math.sin((i / (count - 1)) * Math.PI) * 1.35 : 0.85;
      item.mesh.position.set(LANES[lane], y, item.z);
      item.mesh.userData.baseY = y;
    }
  }

  private updateObstacles(dt: number) {
    for (const o of this.obstacles) {
      if (!o.active) continue;
      o.z += this.speed * dt;
      o.mesh.position.z = o.z;
      if (o.kind === "wolf" || o.kind === "snake") {
        o.mesh.position.x = LANES[o.lane] + Math.sin(this.elapsed * 4 + o.z) * 0.05;
      }
      if (o.z > 6) {
        this.deactivate(o);
        continue;
      }
      if (this.hitObstacle(o)) {
        this.gameOver();
        return;
      }
    }
  }

  private updateFeathers(dt: number) {
    for (const f of this.featherPool) {
      if (!f.active) continue;
      f.z += this.speed * dt;
      f.mesh.position.z = f.z;
      f.mesh.rotation.y += dt * 2.5;
      const baseY = (f.mesh.userData.baseY as number) || 0.9;
      f.mesh.position.y = baseY + Math.sin(this.elapsed * 5 + f.z) * 0.08;
      if (f.z > 5) {
        this.deactivate(f);
        continue;
      }
      if (this.hitFeather(f)) {
        this.deactivate(f);
        this.feathers += 1;
        this.score += 50;
      }
    }
  }

  private hitObstacle(o: PoolItem) {
    if (o.lane !== this.laneIndex) return false;
    const dz = Math.abs(o.z - this.calf.position.z);
    if (dz > 0.95) return false;
    const low = Boolean(o.mesh.userData.low);
    if (low) return this.jumpY < 0.55;
    return this.jumpY < (o.mesh.userData.height as number) * 0.55;
  }

  private hitFeather(f: PoolItem) {
    if (f.lane !== this.laneIndex) return false;
    const dz = Math.abs(f.z - this.calf.position.z);
    if (dz > 0.7) return false;
    const needJump = Boolean(f.jumpRequired);
    const fy = f.mesh.position.y;
    if (needJump) return this.jumpY + 0.9 > fy - 0.35 && this.jumpY < fy + 0.5;
    return this.jumpY < 1.2;
  }

  private gameOver() {
    this.state = "gameover";
    const finalScore = Math.floor(this.score);
    if (finalScore > this.highScore) {
      this.highScore = finalScore;
      this.isNewRecord = true;
      localStorage.setItem(HIGH_SCORE_KEY, String(this.highScore));
    }
    this.emitHud();
  }

  private updateAtmosphere() {
    // 远距离略微压暗，保持截图那种淡黄雾感
    const t = Math.min(1, this.distance / 1600);
    const top = new THREE.Color(WORLD_COLORS.skyTop).lerp(new THREE.Color(0xd5d8c8), t * 0.45);
    const bottom = new THREE.Color(WORLD_COLORS.skyBottom).lerp(
      new THREE.Color(WORLD_COLORS.fog),
      t * 0.35,
    );
    const mat = this.sky.material as THREE.ShaderMaterial;
    mat.uniforms.topColor.value.copy(top);
    mat.uniforms.bottomColor.value.copy(bottom);
    this.renderer.setClearColor(bottom.getHex());
    this.scene.fog = new THREE.Fog(bottom.getHex(), 30, 88 - t * 8);
  }
}
