import * as THREE from "three";

export function createInkMaterials() {
  return {
    paper: new THREE.MeshStandardMaterial({
      color: 0xf0e6d2,
      roughness: 1,
      metalness: 0,
    }),
    grass: new THREE.MeshStandardMaterial({
      color: 0xc5d2b0,
      roughness: 0.95,
    }),
    inkDeep: new THREE.MeshStandardMaterial({
      color: 0x1a1c1b,
      roughness: 0.9,
    }),
    inkMid: new THREE.MeshStandardMaterial({
      color: 0x3a403c,
      roughness: 0.92,
    }),
    inkLight: new THREE.MeshStandardMaterial({
      color: 0x6d7570,
      roughness: 0.95,
    }),
    gold: new THREE.MeshStandardMaterial({
      color: 0xd4a84b,
      roughness: 0.35,
      metalness: 0.45,
      emissive: 0x5a3d10,
      emissiveIntensity: 0.25,
    }),
    wood: new THREE.MeshStandardMaterial({
      color: 0x2b241c,
      roughness: 0.88,
    }),
    wolf: new THREE.MeshStandardMaterial({
      color: 0x222422,
      roughness: 0.75,
    }),
  };
}

export type InkMaterials = ReturnType<typeof createInkMaterials>;

export function createWorld(mats: InkMaterials) {
  const root = new THREE.Group();

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 220), mats.grass);
  ground.rotation.x = -Math.PI / 2;
  ground.position.z = -40;
  ground.receiveShadow = true;
  root.add(ground);

  const path = new THREE.Mesh(new THREE.PlaneGeometry(9.2, 220), mats.paper);
  path.rotation.x = -Math.PI / 2;
  path.position.y = 0.01;
  path.position.z = -40;
  path.receiveShadow = true;
  root.add(path);

  // 墨分五色远山
  const mountainLayers = [
    { z: -70, y: 4, color: mats.inkLight, scale: 1.4 },
    { z: -55, y: 3.2, color: mats.inkMid, scale: 1.1 },
    { z: -42, y: 2.4, color: mats.inkDeep, scale: 0.85 },
  ];
  for (const layer of mountainLayers) {
    const group = new THREE.Group();
    for (let i = -3; i <= 3; i++) {
      const peak = new THREE.Mesh(
        new THREE.ConeGeometry(3.5 * layer.scale, 6 * layer.scale, 5),
        layer.color,
      );
      peak.position.set(i * 7.5, layer.y, 0);
      peak.rotation.y = i * 0.2;
      group.add(peak);
    }
    group.position.z = layer.z;
    root.add(group);
  }

  // 留白太阳
  const sun = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 32),
    new THREE.MeshBasicMaterial({
      color: 0xf7f1e3,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    }),
  );
  sun.position.set(-8, 12, -60);
  root.add(sun);

  // V 形飞鸟
  const birds = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const bird = createBird(mats.inkDeep);
    bird.position.set(-6 + i * 1.4 + (i % 2) * 0.3, 9 + Math.abs(i - 3) * 0.35, -45);
    birds.add(bird);
  }
  root.add(birds);
  root.userData.birds = birds;
  root.userData.sun = sun;

  return root;
}

function createBird(mat: THREE.Material) {
  const g = new THREE.Group();
  const left = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.7, 3), mat);
  left.rotation.z = Math.PI / 2.4;
  left.position.x = -0.2;
  const right = left.clone();
  right.rotation.z = -Math.PI / 2.4;
  right.position.x = 0.2;
  g.add(left, right);
  return g;
}

export function createObstacle(
  kind: "rock" | "wood" | "snake" | "wolf",
  mats: InkMaterials,
): THREE.Group {
  const g = new THREE.Group();
  g.userData.kind = kind;

  if (kind === "rock") {
    const a = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 0), mats.inkDeep);
    a.scale.set(1.2, 0.9, 1);
    a.position.y = 0.45;
    a.castShadow = true;
    const b = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 0), mats.inkMid);
    b.position.set(0.35, 0.3, 0.1);
    g.add(a, b);
    g.userData.radius = 0.75;
    g.userData.height = 1.1;
  } else if (kind === "wood") {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, 1.6, 6),
      mats.wood,
    );
    trunk.position.y = 0.8;
    trunk.rotation.z = 0.25;
    trunk.castShadow = true;
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.9, 5),
      mats.wood,
    );
    branch.position.set(0.35, 1.1, 0);
    branch.rotation.z = Math.PI / 2.5;
    g.add(trunk, branch);
    g.userData.radius = 0.55;
    g.userData.height = 1.6;
  } else if (kind === "snake") {
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.12, 0.9, 4, 8),
      mats.inkMid,
    );
    body.rotation.z = Math.PI / 2;
    body.position.set(0, 0.18, 0);
    body.castShadow = true;
    g.add(body);
    g.userData.radius = 0.55;
    g.userData.height = 0.35;
    g.userData.low = true;
  } else {
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 1.1), mats.wolf);
    torso.position.y = 0.55;
    torso.castShadow = true;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.4), mats.wolf);
    head.position.set(0, 0.7, 0.55);
    const legGeo = new THREE.BoxGeometry(0.1, 0.35, 0.1);
    for (const [x, z] of [
      [-0.18, 0.35],
      [0.18, 0.35],
      [-0.18, -0.35],
      [0.18, -0.35],
    ] as const) {
      const leg = new THREE.Mesh(legGeo, mats.wolf);
      leg.position.set(x, 0.18, z);
      g.add(leg);
    }
    g.add(torso, head);
    g.userData.radius = 0.7;
    g.userData.height = 1.0;
  }

  return g;
}

export function createFeather(mats: InkMaterials): THREE.Group {
  const g = new THREE.Group();
  const vane = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.55, 5), mats.gold);
  vane.rotation.x = Math.PI;
  vane.position.y = 0.9;
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 10, 10),
    new THREE.MeshBasicMaterial({
      color: 0xffe09a,
      transparent: true,
      opacity: 0.35,
    }),
  );
  glow.position.y = 0.95;
  g.add(vane, glow);
  g.userData.radius = 0.45;
  return g;
}
