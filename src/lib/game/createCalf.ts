import * as THREE from "three";

/** 乳白小牛犊：大头大眼、淡赭角、程序化组装 */
export function createCalf(): THREE.Group {
  const calf = new THREE.Group();
  calf.name = "niulai";

  const cream = new THREE.MeshStandardMaterial({
    color: 0xf3eee4,
    roughness: 0.85,
    metalness: 0.02,
  });
  const ochre = new THREE.MeshStandardMaterial({
    color: 0xc4a574,
    roughness: 0.7,
  });
  const ink = new THREE.MeshStandardMaterial({
    color: 0x1c1a18,
    roughness: 0.55,
  });
  const nose = new THREE.MeshStandardMaterial({
    color: 0xd9b5a0,
    roughness: 0.8,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 1.05), cream);
  body.position.set(0, 0.55, 0);
  body.castShadow = true;
  calf.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.55, 0.55), cream);
  head.position.set(0, 0.95, 0.62);
  head.castShadow = true;
  calf.add(head);

  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.2, 0.22), nose);
  snout.position.set(0, 0.82, 0.92);
  calf.add(snout);

  for (const x of [-0.18, 0.18]) {
    const eyeWhite = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xfffdf8, roughness: 0.4 }),
    );
    eyeWhite.position.set(x, 1.02, 0.88);
    calf.add(eyeWhite);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), ink);
    pupil.position.set(x, 1.02, 0.95);
    calf.add(pupil);
  }

  for (const x of [-0.18, 0.18]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 8), ochre);
    horn.position.set(x, 1.28, 0.55);
    horn.rotation.x = -0.35;
    calf.add(horn);
  }

  const earL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.06), cream);
  earL.position.set(-0.4, 1.1, 0.55);
  earL.rotation.z = 0.4;
  calf.add(earL);
  const earR = earL.clone();
  earR.position.x = 0.4;
  earR.rotation.z = -0.4;
  calf.add(earR);

  const legs: THREE.Mesh[] = [];
  const legOffsets: [number, number][] = [
    [-0.22, 0.32],
    [0.22, 0.32],
    [-0.22, -0.32],
    [0.22, -0.32],
  ];
  for (const [x, z] of legOffsets) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.12), cream);
    leg.position.set(x, 0.21, z);
    leg.castShadow = true;
    calf.add(leg);
    legs.push(leg);
  }
  calf.userData.legs = legs;
  calf.userData.body = body;
  calf.userData.head = head;

  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.45, 6), cream);
  tail.position.set(0, 0.7, -0.62);
  tail.rotation.x = 0.6;
  calf.add(tail);
  calf.userData.tail = tail;

  // 模型默认朝 +Z，游戏前进方向是远山（-Z），整体掉头
  calf.rotation.y = Math.PI;

  return calf;
}

export function animateCalf(calf: THREE.Group, time: number, running: boolean) {
  const legs = calf.userData.legs as THREE.Mesh[];
  const body = calf.userData.body as THREE.Mesh;
  const head = calf.userData.head as THREE.Mesh;
  const tail = calf.userData.tail as THREE.Mesh;
  if (!legs?.length) return;

  const swing = running ? Math.sin(time * 12) * 0.45 : Math.sin(time * 2) * 0.05;
  // 对角腿：0与3、1与2
  legs[0].rotation.x = swing;
  legs[3].rotation.x = swing;
  legs[1].rotation.x = -swing;
  legs[2].rotation.x = -swing;

  body.position.y = 0.55 + (running ? Math.abs(Math.sin(time * 12)) * 0.04 : 0);
  head.rotation.y = Math.sin(time * 3) * 0.08;
  head.rotation.x = Math.sin(time * 2.2) * 0.04;
  tail.rotation.z = Math.sin(time * 8) * 0.35;
}
