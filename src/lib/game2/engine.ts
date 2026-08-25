import * as THREE from "three";
import { animateCalf, createCalf } from "@/lib/game/createCalf";
import { createInkMaterials, createWorld } from "@/lib/game/createWorld";
import { LANES } from "@/lib/game/types";
import {
  createDrop,
  createMamaProjectile,
  createBossEnemy,
  createWolfEnemy,
  setEnemyHpBar,
} from "@/lib/game2/actors";
import {
  GAME2_HIGH_SCORE_KEY,
  type Game2Hud,
  type Game2HudListener,
  type Game2State,
} from "@/lib/game2/types";

type Pool<T extends THREE.Group = THREE.Group> = {
  mesh: T;
  active: boolean;
  lane?: number;
  vz?: number;
  kind?: string;
};

export class NiulaiGame2Engine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private sky: THREE.Mesh;

  private herd = new THREE.Group();
  private calves: THREE.Group[] = [];

  private state: Game2State = "menu";
  private laneIndex = 1;
  private targetX: number = LANES[1];
  private calfCount = 1;
  private attackSpeed = 1.2;
  private fireCooldown = 0;
  private score = 0;
  private kills = 0;
  private highScore = 0;
  private distance = 0;
  private runSpeed = 10;
  private elapsed = 0;
  private spawnTimer = 0;
  private nextBossAt = 1000;
  private bossAlive = false;
  private alive = true;

  private projectiles: Pool[] = [];
  private enemies: Pool[] = [];
  private drops: Pool[] = [];

  private hud?: Game2HudListener;
  private raf = 0;
  private disposed = false;

  private onKeyDown: (e: KeyboardEvent) => void;
  private onResize: () => void;

  constructor(private canvas: HTMLCanvasElement) {
    this.highScore = Number(localStorage.getItem(GAME2_HIGH_SCORE_KEY) || 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor(0xe8dfc8);

    this.camera = new THREE.PerspectiveCamera(
      55,
      canvas.clientWidth / Math.max(canvas.clientHeight, 1),
      0.1,
      200,
    );
    this.camera.position.set(0, 5.2, 10.5);
    this.camera.lookAt(0, 1.2, -8);

    const mats = createInkMaterials();
    this.scene.add(createWorld(mats));

    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color(0xdfe8df) },
        bottomColor: { value: new THREE.Color(0xe8dfc8) },
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
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(90, 24, 16), skyMat);
    this.scene.add(this.sky);

    this.scene.add(new THREE.HemisphereLight(0xf5f0e4, 0x6b735f, 1.05));
    const sun = new THREE.DirectionalLight(0xfff4df, 1.1);
    sun.position.set(-6, 14, 6);
    sun.castShadow = true;
    this.scene.add(sun);

    this.scene.add(this.herd);
    this.rebuildHerd();
    this.initPools();

    this.onKeyDown = (e) => {
      if (["KeyA", "KeyD", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === "KeyP" || e.code === "Escape") {
        if (this.state === "playing") this.pause();
        else if (this.state === "paused") this.resume();
        return;
      }
      if (this.state !== "playing") return;
      if (e.code === "KeyA" || e.code === "ArrowLeft") this.changeLane(-1);
      if (e.code === "KeyD" || e.code === "ArrowRight") this.changeLane(1);
    };
    this.onResize = () => this.resize();

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("resize", this.onResize);

    this.scene.fog = new THREE.Fog(0xe8dfc8, 20, 75);
    this.emitHud();
    this.loop();
  }

  onHud(listener: Game2HudListener) {
    this.hud = listener;
    this.emitHud();
  }

  getSnapshot(): Game2Hud {
    return {
      state: this.state,
      score: Math.floor(this.score),
      highScore: this.highScore,
      distance: Math.floor(this.distance),
      calfCount: this.calfCount,
      attackSpeed: Number(this.attackSpeed.toFixed(1)),
      kills: this.kills,
      hp: this.alive ? this.calfCount : 0,
      maxHp: 5,
      bossIncoming: this.bossAlive || this.distance >= this.nextBossAt - 80,
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
    window.removeEventListener("resize", this.onResize);
    this.renderer.dispose();
  }

  private changeLane(dir: -1 | 1) {
    this.laneIndex = Math.max(0, Math.min(2, this.laneIndex + dir));
    this.targetX = LANES[this.laneIndex];
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

  private initPools() {
    for (let i = 0; i < 40; i++) {
      const mesh = createMamaProjectile();
      mesh.visible = false;
      this.scene.add(mesh);
      this.projectiles.push({ mesh, active: false });
    }
    for (let i = 0; i < 14; i++) {
      const mesh = createWolfEnemy();
      mesh.visible = false;
      this.scene.add(mesh);
      this.enemies.push({ mesh, active: false });
    }
    for (let i = 0; i < 10; i++) {
      const mesh = createDrop("calf");
      mesh.visible = false;
      this.scene.add(mesh);
      this.drops.push({ mesh, active: false, kind: "calf" });
    }
  }

  private resetRun() {
    this.laneIndex = 1;
    this.targetX = LANES[1];
    this.calfCount = 1;
    this.attackSpeed = 1.2;
    this.fireCooldown = 0;
    this.score = 0;
    this.kills = 0;
    this.distance = 0;
    this.runSpeed = 10;
    this.elapsed = 0;
    this.spawnTimer = 1.2;
    this.nextBossAt = 1000;
    this.bossAlive = false;
    this.alive = true;
    this.rebuildHerd();
    for (const p of this.projectiles) this.deactivate(p);
    for (const e of this.enemies) this.deactivate(e);
    for (const d of this.drops) this.deactivate(d);
  }

  private deactivate(item: Pool) {
    item.active = false;
    item.mesh.visible = false;
  }

  private rebuildHerd() {
    while (this.calves.length) {
      const c = this.calves.pop();
      if (c) this.herd.remove(c);
    }
    const count = Math.max(0, this.calfCount);
    const spacing = 0.55;
    const start = -((count - 1) * spacing) / 2;
    for (let i = 0; i < count; i++) {
      const calf = createCalf();
      calf.scale.setScalar(0.8);
      calf.position.set(start + i * spacing, 0, -i * 0.15);
      this.herd.add(calf);
      this.calves.push(calf);
    }
    this.herd.position.set(this.targetX, 0, 0);
  }

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    let dt = this.clock.getDelta();
    dt = Math.min(dt, 0.05);

    if (this.state === "playing") this.updatePlaying(dt);
    else {
      for (const c of this.calves) animateCalf(c, this.clock.elapsedTime, false);
    }

    this.renderer.render(this.scene, this.camera);
  };

  private updatePlaying(dt: number) {
    this.elapsed += dt;
    this.runSpeed = Math.min(22, 10 + this.distance / 400);
    this.distance += this.runSpeed * dt;

    this.herd.position.x += (this.targetX - this.herd.position.x) * Math.min(1, dt * 14);

    for (const c of this.calves) animateCalf(c, this.clock.elapsedTime, true);

    this.fireCooldown -= dt;
    if (this.fireCooldown <= 0 && this.alive) {
      this.fireMamas();
      this.fireCooldown = 1 / this.attackSpeed;
    }

    // 每 1000 米出 Boss
    if (!this.bossAlive && this.distance >= this.nextBossAt) {
      this.spawnBoss();
      this.nextBossAt += 1000;
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnWolf();
      this.spawnTimer = Math.max(0.85, 2.0 - this.distance / 800) + Math.random() * 0.5;
    }

    this.updateProjectiles(dt);
    this.updateEnemies(dt);
    this.updateDrops(dt);
    this.score += dt * 4 + this.runSpeed * dt * 0.5;
    this.emitHud();
  }

  /** 普通小怪血量随路程提升：约每 120 米 +1 */
  private wolfHpForDistance() {
    return Math.max(2, 2 + Math.floor(this.distance / 120) + Math.floor(Math.random() * 2));
  }

  /** Boss 血量随第几只 Boss 与路程提升 */
  private bossHpForDistance() {
    const wave = Math.max(1, Math.floor(this.nextBossAt / 1000));
    return 18 + wave * 12 + Math.floor(this.distance / 200);
  }

  private spawnWolf() {
    const item = this.enemies.find((e) => !e.active);
    if (!item) return;
    this.scene.remove(item.mesh);
    item.mesh = createWolfEnemy();
    this.scene.add(item.mesh);

    const lane = Math.floor(Math.random() * 3);
    const maxHp = this.wolfHpForDistance();
    item.mesh.userData.maxHp = maxHp;
    item.mesh.userData.hp = maxHp;
    item.mesh.userData.isBoss = false;
    setEnemyHpBar(item.mesh, maxHp, maxHp);

    item.active = true;
    item.lane = lane;
    item.mesh.visible = true;
    item.mesh.position.set(LANES[lane], 0, -42 - Math.random() * 10);
    item.vz = 3.2 + Math.min(4.5, this.distance / 500);
  }

  private spawnBoss() {
    const item = this.enemies.find((e) => !e.active);
    if (!item) return;
    this.scene.remove(item.mesh);
    item.mesh = createBossEnemy();
    this.scene.add(item.mesh);

    const lane = 1; // Boss 走中路
    const maxHp = this.bossHpForDistance();
    item.mesh.userData.maxHp = maxHp;
    item.mesh.userData.hp = maxHp;
    item.mesh.userData.isBoss = true;
    setEnemyHpBar(item.mesh, maxHp, maxHp);

    item.active = true;
    item.lane = lane;
    item.mesh.visible = true;
    item.mesh.position.set(LANES[lane], 0, -50);
    item.vz = 2.4 + Math.min(2, this.distance / 2000);
    this.bossAlive = true;
  }

  private fireMamas() {
    for (const calf of this.calves) {
      const item = this.projectiles.find((p) => !p.active);
      if (!item) continue;
      const world = new THREE.Vector3();
      calf.getWorldPosition(world);
      item.active = true;
      item.lane = this.laneIndex;
      item.mesh.visible = true;
      item.mesh.position.set(world.x, 1.15, world.z - 0.5);
      item.vz = -18;
    }
  }

  private updateProjectiles(dt: number) {
    for (const p of this.projectiles) {
      if (!p.active) continue;
      p.mesh.position.z += (p.vz || -18) * dt;
      if (p.mesh.position.z < -55) {
        this.deactivate(p);
        continue;
      }
      for (const e of this.enemies) {
        if (!e.active) continue;
        if (p.lane !== undefined && e.lane !== undefined && p.lane !== e.lane) continue;
        const hitDist = e.mesh.userData.isBoss ? 1.25 : 0.85;
        if (this.overlap(p.mesh, e.mesh, hitDist)) {
          this.deactivate(p);
          this.damageEnemy(e, 1);
          break;
        }
      }
    }
  }

  private updateEnemies(dt: number) {
    for (const e of this.enemies) {
      if (!e.active) continue;
      e.mesh.position.z += (e.vz || 3.5) * dt;
      if (e.lane !== undefined) e.mesh.position.x = LANES[e.lane];

      const hpRoot = e.mesh.getObjectByName("hpRoot");
      if (hpRoot) hpRoot.quaternion.copy(this.camera.quaternion);

      // 走过小牛身后：与碰撞一样扣牛
      if (e.mesh.position.z > 1.2) {
        if (e.mesh.userData.isBoss) this.bossAlive = false;
        this.deactivate(e);
        this.hurtCalf();
        if (!this.alive) return;
        continue;
      }

      const hitZ = e.mesh.userData.isBoss ? 1.4 : 1.1;
      if (
        e.lane === this.laneIndex &&
        e.mesh.position.z > -hitZ &&
        e.mesh.position.z < hitZ
      ) {
        if (e.mesh.userData.isBoss) this.bossAlive = false;
        this.deactivate(e);
        this.hurtCalf();
        if (!this.alive) return;
      }
    }
  }

  private hurtCalf() {
    this.calfCount -= 1;
    if (this.calfCount <= 0) {
      this.calfCount = 0;
      this.alive = false;
      this.rebuildHerd();
      this.gameOver();
      return;
    }
    this.rebuildHerd();
    this.emitHud();
  }

  private damageEnemy(e: Pool, dmg: number) {
    const mesh = e.mesh;
    const isBoss = Boolean(mesh.userData.isBoss);
    const hp = Math.max(0, (mesh.userData.hp as number) - dmg);
    mesh.userData.hp = hp;
    setEnemyHpBar(mesh, hp, mesh.userData.maxHp as number);
    if (hp <= 0) {
      this.kills += 1;
      this.score += isBoss ? 500 : 40;
      if (isBoss) this.bossAlive = false;
      const dropRoll = Math.random();
      if (isBoss || dropRoll < 0.35) {
        const kind = isBoss
          ? dropRoll < 0.5
            ? "calf"
            : "speed"
          : dropRoll < 0.18
            ? "calf"
            : "speed";
        this.spawnDropAt(mesh.position, e.lane ?? 1, kind);
        if (isBoss) {
          // Boss 额外掉一个
          this.spawnDropAt(
            mesh.position.clone().setZ(mesh.position.z - 1.2),
            e.lane ?? 1,
            kind === "calf" ? "speed" : "calf",
          );
        }
      }
      this.deactivate(e);
    }
  }

  private spawnDropAt(pos: THREE.Vector3, lane: number, kind: "calf" | "speed") {
    const item = this.drops.find((d) => !d.active);
    if (!item) return;
    this.scene.remove(item.mesh);
    item.mesh = createDrop(kind);
    this.scene.add(item.mesh);
    item.kind = kind;
    item.lane = lane;
    item.active = true;
    item.mesh.visible = true;
    item.mesh.position.set(LANES[lane], 0, pos.z);
    item.vz = 2.8;
  }

  private updateDrops(dt: number) {
    for (const d of this.drops) {
      if (!d.active) continue;
      d.mesh.position.z += (d.vz || 2.8) * dt;
      if (d.lane !== undefined) d.mesh.position.x = LANES[d.lane];
      const gem = d.mesh.children[0];
      if (gem) gem.position.y = 0.45 + Math.sin(this.elapsed * 6) * 0.08;

      if (d.mesh.position.z > 4) {
        this.deactivate(d);
        continue;
      }

      if (d.lane === this.laneIndex && Math.abs(d.mesh.position.z) < 1.2) {
        this.collectDrop(d);
      }
    }
  }

  private collectDrop(d: Pool) {
    const kind = d.kind || d.mesh.userData.kind;
    if (kind === "calf" && this.calfCount < 5) {
      this.calfCount += 1;
      this.rebuildHerd();
      this.score += 80;
    } else if (kind === "speed") {
      this.attackSpeed = Math.min(4.5, this.attackSpeed + 0.35);
      this.score += 60;
    } else {
      this.score += 30;
    }
    this.deactivate(d);
    this.emitHud();
  }

  private overlap(a: THREE.Object3D, b: THREE.Object3D, dist: number) {
    const dx = a.position.x - b.position.x;
    const dz = a.position.z - b.position.z;
    return dx * dx + dz * dz < dist * dist;
  }

  private gameOver() {
    this.state = "gameover";
    const finalScore = Math.floor(this.score);
    if (finalScore > this.highScore) {
      this.highScore = finalScore;
      localStorage.setItem(GAME2_HIGH_SCORE_KEY, String(this.highScore));
    }
    this.emitHud();
  }
}
