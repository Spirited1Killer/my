import * as THREE from "three";

/** 「妈妈」文字弹幕 */
export function createMamaProjectile(): THREE.Group {
  const g = new THREE.Group();
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 256, 128);
    ctx.font = "bold 72px \"Noto Serif SC\", \"Songti SC\", serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#f4efe3";
    ctx.fillStyle = "#1a1c1b";
    ctx.strokeText("妈妈", 128, 64);
    ctx.fillText("妈妈", 128, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    }),
  );
  sprite.scale.set(1.6, 0.8, 1);
  g.add(sprite);
  g.userData.radius = 0.5;
  return g;
}

export function createWolfEnemy(): THREE.Group {
  const g = new THREE.Group();
  const fur = new THREE.MeshStandardMaterial({ color: 0x242624, roughness: 0.75 });
  const eye = new THREE.MeshStandardMaterial({
    color: 0xc9a227,
    emissive: 0x5a3d10,
    emissiveIntensity: 0.35,
  });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 1.25), fur);
  torso.position.y = 0.7;
  torso.castShadow = true;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.38, 0.5), fur);
  head.position.set(0, 0.9, 0.7);
  head.castShadow = true;
  for (const x of [-0.12, 0.12]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), eye);
    e.position.set(x, 0.95, 0.92);
    g.add(e);
  }
  for (const [x, z] of [
    [-0.22, 0.4],
    [0.22, 0.4],
    [-0.22, -0.4],
    [0.22, -0.4],
  ] as const) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.12), fur);
    leg.position.set(x, 0.21, z);
    g.add(leg);
  }
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.4, 5), fur);
  tail.position.set(0, 0.75, -0.75);
  tail.rotation.x = Math.PI / 2.2;
  g.add(torso, head, tail);
  g.rotation.y = 0; // 朝向玩家（+Z）

  // 血条：红底 + 绿量
  const hpRoot = new THREE.Group();
  hpRoot.name = "hpRoot";
  const barBg = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.1),
    new THREE.MeshBasicMaterial({ color: 0x4a1c1c, side: THREE.DoubleSide }),
  );
  const barHp = new THREE.Mesh(
    new THREE.PlaneGeometry(0.86, 0.07),
    new THREE.MeshBasicMaterial({ color: 0x6fbf6a, side: THREE.DoubleSide }),
  );
  barHp.position.z = 0.01;
  barHp.name = "hpBar";
  hpRoot.position.set(0, 1.55, 0);
  hpRoot.add(barBg, barHp);
  g.add(hpRoot);

  g.userData.radius = 0.65;
  g.userData.maxHp = 3;
  g.userData.hp = 3;
  g.userData.isBoss = false;
  return g;
}

/** 每 1000 米出现的墨狼首领 */
export function createBossEnemy(): THREE.Group {
  const g = createWolfEnemy();
  g.scale.set(1.7, 1.7, 1.7);
  g.userData.isBoss = true;
  g.userData.radius = 1.1;

  const fur = new THREE.MeshStandardMaterial({
    color: 0x1a0f0f,
    roughness: 0.7,
    emissive: 0x3a1010,
    emissiveIntensity: 0.25,
  });
  g.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.name !== "hpBar") {
      const mat = obj.material;
      if (mat && !(mat instanceof THREE.MeshBasicMaterial)) {
        obj.material = fur;
      }
    }
  });

  const hpRoot = g.getObjectByName("hpRoot");
  if (hpRoot) {
    hpRoot.position.y = 1.7;
    hpRoot.scale.set(1.6, 1.3, 1);
  }

  // 角冠标记 boss
  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.45, 5),
    new THREE.MeshStandardMaterial({
      color: 0xc9a227,
      emissive: 0x5a3d10,
      emissiveIntensity: 0.4,
    }),
  );
  crown.position.set(0, 1.55, 0.35);
  g.add(crown);

  return g;
}

export function createDrop(kind: "calf" | "speed"): THREE.Group {
  const g = new THREE.Group();
  const color = kind === "calf" ? 0xd4a84b : 0x5aa8c4;
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.35,
    roughness: 0.4,
  });
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), mat);
  gem.position.y = 0.45;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.35, 0.04, 8, 20),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.2;
  g.add(gem, ring);
  g.userData.kind = kind;
  g.userData.radius = 0.45;
  return g;
}

export function setEnemyHpBar(enemy: THREE.Group, hp: number, maxHp: number) {
  const bar = enemy.getObjectByName("hpBar") as THREE.Mesh | undefined;
  if (!bar) return;
  const ratio = Math.max(0, hp / maxHp);
  bar.scale.x = Math.max(0.001, ratio);
  bar.position.x = -0.43 * (1 - ratio);
  const mat = bar.material as THREE.MeshBasicMaterial;
  mat.color.setHex(ratio > 0.5 ? 0x6fbf6a : ratio > 0.25 ? 0xd4a84b : 0xc45a5a);
}
