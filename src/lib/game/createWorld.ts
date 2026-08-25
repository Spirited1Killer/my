import * as THREE from "three";

/** 截图风格配色：灰三车道 + 橄榄草地 + 远山淡雾 */
export const WORLD_COLORS = {
  skyTop: 0xf0ebd4,
  skyBottom: 0xe8e2c4,
  fog: 0xe5dfc4,
  grass: 0x8f9c58,
  grassDark: 0x7a8748,
  road: 0xc5c6c0,
  roadEdge: 0x6e716c,
  laneDash: 0xf4f5f2,
  mountainFar: 0xb4b8b5,
  mountainMid: 0x9aa19c,
  mountainNear: 0x878e89,
  rock: 0x5c615c,
  sun: 0xf3e8b0,
  bird: 0x3a3d3a,
};

export function createInkMaterials() {
  return {
    paper: new THREE.MeshLambertMaterial({ color: WORLD_COLORS.road }),
    grass: new THREE.MeshLambertMaterial({ color: WORLD_COLORS.grass }),
    inkDeep: new THREE.MeshLambertMaterial({ color: WORLD_COLORS.mountainNear }),
    inkMid: new THREE.MeshLambertMaterial({ color: WORLD_COLORS.mountainMid }),
    inkLight: new THREE.MeshLambertMaterial({ color: WORLD_COLORS.mountainFar }),
    gold: new THREE.MeshStandardMaterial({
      color: 0xd4a84b,
      roughness: 0.35,
      metalness: 0.45,
      emissive: 0x5a3d10,
      emissiveIntensity: 0.25,
    }),
    wood: new THREE.MeshLambertMaterial({ color: 0x4a4034 }),
    wolf: new THREE.MeshLambertMaterial({ color: 0x2a2c2a }),
  };
}

export type InkMaterials = ReturnType<typeof createInkMaterials>;

export function createWorld(_mats: InkMaterials) {
  const root = new THREE.Group();

  const grassMat = new THREE.MeshLambertMaterial({ color: WORLD_COLORS.grass });
  const roadMat = new THREE.MeshLambertMaterial({ color: WORLD_COLORS.road });
  const edgeMat = new THREE.MeshLambertMaterial({ color: WORLD_COLORS.roadEdge });
  const dashMat = new THREE.MeshLambertMaterial({ color: WORLD_COLORS.laneDash });
  const rockMat = new THREE.MeshLambertMaterial({ color: WORLD_COLORS.rock });
  const mountainMats = [
    new THREE.MeshLambertMaterial({ color: WORLD_COLORS.mountainFar }),
    new THREE.MeshLambertMaterial({ color: WORLD_COLORS.mountainMid }),
    new THREE.MeshLambertMaterial({ color: WORLD_COLORS.mountainNear }),
  ];

  // 两侧大草地
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 260), grassMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.02, -50);
  ground.receiveShadow = true;
  root.add(ground);

  // 中央三车道灰路
  const roadWidth = 8.2;
  const road = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, 260), roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.01, -50);
  road.receiveShadow = true;
  root.add(road);

  // 路边深灰压边
  for (const x of [-roadWidth / 2 - 0.12, roadWidth / 2 + 0.12]) {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 260), edgeMat);
    curb.position.set(x, 0.04, -50);
    root.add(curb);
  }

  // 白色虚线分隔三道（约在 ±1.35）
  const dashes = new THREE.Group();
  dashes.name = "laneDashes";
  for (const x of [-1.35, 1.35]) {
    for (let z = 8; z > -120; z -= 2.4) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 1.1), dashMat);
      dash.position.set(x, 0.03, z);
      dashes.add(dash);
    }
  }
  root.add(dashes);
  root.userData.dashes = dashes;

  // 草地碎石
  for (let i = 0; i < 48; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.25, 0),
      rockMat,
    );
    rock.position.set(
      side * (5.5 + Math.random() * 14),
      0.12,
      -Math.random() * 110 + 5,
    );
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.scale.set(1, 0.55 + Math.random() * 0.4, 1);
    root.add(rock);
  }

  // 圆润远山（半球叠层）
  const mountainGroup = new THREE.Group();
  const hillSpecs = [
    { z: -78, y: 0, mat: mountainMats[0], hills: [[-22, 10], [-8, 14], [6, 12], [20, 9]] },
    { z: -62, y: 0, mat: mountainMats[1], hills: [[-16, 8], [0, 11], [14, 7.5]] },
    { z: -50, y: 0, mat: mountainMats[2], hills: [[-10, 5.5], [5, 6.5]] },
  ];
  for (const layer of hillSpecs) {
    for (const [x, r] of layer.hills) {
      const hill = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), layer.mat);
      hill.scale.y = 0.55;
      hill.position.set(x, r * 0.2, layer.z);
      mountainGroup.add(hill);
    }
  }
  root.add(mountainGroup);

  // 淡黄太阳（山后）
  const sun = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 32),
    new THREE.MeshBasicMaterial({
      color: WORLD_COLORS.sun,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    }),
  );
  sun.position.set(-5, 7.5, -72);
  root.add(sun);

  // V 形飞鸟
  const birds = new THREE.Group();
  const birdMat = new THREE.MeshLambertMaterial({ color: WORLD_COLORS.bird });
  const birdSpots = [
    [-10, 11, -40],
    [-7, 12.5, -38],
    [8, 13, -42],
    [11, 11.5, -39],
    [3, 14, -46],
  ];
  for (const [x, y, z] of birdSpots) {
    const bird = createBird(birdMat);
    bird.position.set(x, y, z);
    bird.scale.setScalar(0.85);
    birds.add(bird);
  }
  root.add(birds);
  root.userData.birds = birds;
  root.userData.sun = sun;

  return root;
}

function createBird(mat: THREE.Material) {
  const g = new THREE.Group();
  const left = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.55, 3), mat);
  left.rotation.z = Math.PI / 2.5;
  left.position.x = -0.16;
  const right = left.clone();
  right.rotation.z = -Math.PI / 2.5;
  right.position.x = 0.16;
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

/** 虚线随奔跑滚动，制造前进感 */
export function scrollLaneDashes(world: THREE.Group, speed: number, dt: number) {
  const dashes = world.userData.dashes as THREE.Group | undefined;
  if (!dashes) return;
  for (const child of dashes.children) {
    child.position.z += speed * dt;
    if (child.position.z > 10) child.position.z -= 130;
  }
}
