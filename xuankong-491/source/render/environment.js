// Living Atmosphere, Four-Time-of-Day Lighting, Emerald Tangyu River Shader,
// Drifting Mountain Clouds, Courtyards Incense Smoke, Cliff Swallows, & Winter Snowfall!

import * as THREE from 'three';
import { VOXEL_SIZE, WORLD_BOUNDS } from '../world/build-world.js';

// Four curated lighting presets grounded in Hengshan Jinlong Gorge's real solar geometry:
// 1. DAWN ("一线晨曦"): Famous 2-hour morning golden sunbeam slicing cleanly from East-Southeast into the cliff recess!
// 2. NOON ("翠屏晴岚"): Crisp high-altitude northern mountain daylight, vivid glazed roof tiles & azure sky
// 3. DUSK ("赤壁残阳"): Dramatic warm crimson-amber sunset igniting the ochre dolomite cliff & warm temple lanterns
// 4. NIGHT ("寒夜燃灯"): Deep starlit winter gorge, 40 glowing paper-lattice halls, floating snow & incense embers!
export const LIGHTING_PRESETS = {
  dawn: {
    id: 'dawn',
    label: '一线晨曦',
    sub: '07:15 · 金龙破雾',
    skyTop: '#1f3b5c',
    skyMid: '#5f84a2',
    skyHorizon: '#f2be8b',
    fogColor: '#d9b596',
    fogDensity: 0.0042,
    sunColor: '#ffcf91',
    sunIntensity: 3.35,
    sunPos: [58, 36, -28], // Low morning sun shining directly onto the East-facing Hanging Temple!
    hemiSky: '#8cb4d9',
    hemiGround: '#7a4b32',
    hemiIntensity: 0.85,
    fillColor: '#6f95bd',
    fillIntensity: 0.55,
    glowIntensity: 0.42,
    snowAmount: 0.0,
    exposure: 1.08,
  },
  noon: {
    id: 'noon',
    label: '翠屏晴岚',
    sub: '11:30 · 北岳清秋',
    skyTop: '#1d4c82',
    skyMid: '#4e84b8',
    skyHorizon: '#b8d3e6',
    fogColor: '#adc5d8',
    fogDensity: 0.0032,
    sunColor: '#fff5e4',
    sunIntensity: 3.15,
    sunPos: [48, 66, -18],
    hemiSky: '#a8cef0',
    hemiGround: '#82583d',
    hemiIntensity: 1.05,
    fillColor: '#8eb6db',
    fillIntensity: 0.65,
    glowIntensity: 0.12,
    snowAmount: 0.0,
    exposure: 1.04,
  },
  dusk: {
    id: 'dusk',
    label: '赤壁残阳',
    sub: '17:40 · 丹崖流金',
    skyTop: '#1c223d',
    skyMid: '#6e4158',
    skyHorizon: '#eb7d4b',
    fogColor: '#b86c56',
    fogDensity: 0.0048,
    sunColor: '#ff8547',
    sunIntensity: 3.20,
    sunPos: [54, 25, -44],
    hemiSky: '#9c6579',
    hemiGround: '#592d22',
    hemiIntensity: 0.72,
    fillColor: '#5c6b9c',
    fillIntensity: 0.52,
    glowIntensity: 0.92,
    snowAmount: 0.0,
    exposure: 1.08,
  },
  night: {
    id: 'night',
    label: '寒夜燃灯',
    sub: '21:30 · 千仞星雪',
    skyTop: '#070c18',
    skyMid: '#101d36',
    skyHorizon: '#1f3352',
    fogColor: '#121f36',
    fogDensity: 0.0052,
    sunColor: '#7aa6e8', // Crisp silvery moonlight over snowy Hengshan!
    sunIntensity: 1.15,
    sunPos: [52, 54, 26],
    hemiSky: '#2c4670',
    hemiGround: '#1a1518',
    hemiIntensity: 0.48,
    fillColor: '#355485',
    fillIntensity: 0.42,
    glowIntensity: 1.48,
    snowAmount: 1.0,
    exposure: 1.14,
  },
};

export function createEnvironment(scene, sharedUniforms, anchors) {
  const group = new THREE.Group();
  scene.add(group);

  // 1. Gradient Sky Dome + Twinkling Starfield at Night
  const skyUniforms = {
    uTop: { value: new THREE.Color(LIGHTING_PRESETS.dawn.skyTop) },
    uMid: { value: new THREE.Color(LIGHTING_PRESETS.dawn.skyMid) },
    uHorizon: { value: new THREE.Color(LIGHTING_PRESETS.dawn.skyHorizon) },
    uNightMix: { value: 0.0 },
    uTime: sharedUniforms.uTime,
  };

  const skyGeo = new THREE.SphereGeometry(260, 40, 28);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: skyUniforms,
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uTop;
      uniform vec3 uMid;
      uniform vec3 uHorizon;
      uniform float uNightMix;
      uniform float uTime;
      varying vec3 vDir;

      float hash(vec3 p) {
        p = fract(p * 0.3183099 + 0.1);
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }

      void main() {
        float h = clamp(vDir.y, -0.15, 1.0);
        vec3 col = h < 0.28
          ? mix(uHorizon, uMid, smoothstep(-0.08, 0.28, h))
          : mix(uMid, uTop, smoothstep(0.28, 0.88, h));

        // Subtle stars in night mode
        if (uNightMix > 0.05 && vDir.y > 0.06) {
          vec3 cell = floor(vDir * 210.0);
          float r = hash(cell);
          if (r > 0.994) {
            float twinkle = 0.65 + 0.35 * sin(uTime * 2.7 + r * 90.0);
            col += vec3(0.85, 0.92, 1.0) * twinkle * uNightMix * smoothstep(0.06, 0.35, vDir.y);
          }
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  group.add(skyMesh);

  // 2. Sculpted Diorama Museum Plinth Frame (`黑胡桃木微缩展台底座`) around world bounds
  const minX = WORLD_BOUNDS.minX * VOXEL_SIZE;
  const maxX = WORLD_BOUNDS.maxX * VOXEL_SIZE;
  const minZ = WORLD_BOUNDS.minZ * VOXEL_SIZE;
  const maxZ = WORLD_BOUNDS.maxZ * VOXEL_SIZE;
  const plinthW = (maxX - minX) + 0.6;
  const plinthD = (maxZ - minZ) + 0.6;
  const plinthCenterX = (minX + maxX) * 0.5;
  const plinthCenterZ = (minZ + maxZ) * 0.5;

  const plinthGeo = new THREE.BoxGeometry(plinthW, 2.2, plinthD);
  const plinthMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1c1614'),
    roughness: 0.62,
    metalness: 0.08,
  });
  const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
  plinthMesh.position.set(plinthCenterX, -1.05, plinthCenterZ);
  plinthMesh.receiveShadow = true;
  group.add(plinthMesh);

  // Thin brass museum inlay trim around plinth top edge
  const brassGeo = new THREE.BoxGeometry(plinthW + 0.16, 0.14, plinthD + 0.16);
  const brassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#a8823e'),
    roughness: 0.32,
    metalness: 0.82,
  });
  const brassTrim = new THREE.Mesh(brassGeo, brassMat);
  brassTrim.position.set(plinthCenterX, -0.02, plinthCenterZ);
  group.add(brassTrim);

  // 3. Emerald Tangyu River Animated Voxel-Ripple Water Surface (`金龙峡唐峪河碧涧`)
  // Water sits at Y = 9.7 * VOXEL_SIZE = 2.425m, spanning river zone X = [2.5 .. 21.5], Z = [minZ+1 .. maxZ-1]
  const waterUniforms = {
    uTime: sharedUniforms.uTime,
    uSunColor: { value: new THREE.Color('#ffcf91') },
    uDeepColor: { value: new THREE.Color('#12464a') },
    uShallowColor: { value: new THREE.Color('#27756e') },
  };
  const waterGeo = new THREE.PlaneGeometry(19.5, (maxZ - minZ) - 2.2, 64, 160);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: waterUniforms,
    vertexShader: `
      uniform float uTime;
      varying vec3 vWorldPos;
      varying float vWave;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        // Stepped voxel-harmonic stream ripples flowing North -> South!
        float qx = floor(wp.x * 4.0) / 4.0;
        float qz = floor(wp.z * 4.0) / 4.0;
        float w = sin(qz * 1.4 + uTime * 2.6) * 0.035 + cos(qx * 2.1 - uTime * 1.9) * 0.025;
        wp.y += w;
        vWave = w;
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uSunColor;
      uniform vec3 uDeepColor;
      uniform vec3 uShallowColor;
      varying vec3 vWorldPos;
      varying float vWave;

      void main() {
        // Voxelized foam streaks & emerald current lines along river centerline
        vec2 cell = floor(vWorldPos.xz * 4.0);
        float stream = sin(cell.y * 0.35 + uTime * 3.2 + sin(cell.x * 0.6) * 2.0);
        float foam = smoothstep(0.86, 0.98, stream);
        // White-water foam around the stone bridge piers (z ~ -16m)
        float bridgeDist = abs(vWorldPos.z - (-16.0));
        float bridgeFoam = smoothstep(2.4, 0.3, bridgeDist) * smoothstep(0.3, 0.9, sin(cell.x * 1.7 + uTime * 4.5));

        vec3 col = mix(uDeepColor, uShallowColor, 0.5 + vWave * 8.0);
        col = mix(col, vec3(0.88, 0.94, 0.95), clamp(foam * 0.45 + bridgeFoam * 0.45, 0.0, 0.75));
        col += uSunColor * max(0.0, stream) * 0.09;

        gl_FragColor = vec4(col, 0.80);
      }
    `,
  });
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.position.set(12.0, 9.75 * VOXEL_SIZE, 0);
  group.add(waterMesh);

  // 4. Lighting Rig (Directional Sun with crisp 2048/4096 PCFSoft Shadow + Hemisphere + Gorge Bounce + Warm Temple Point Lights!)
  const sunLight = new THREE.DirectionalLight('#ffcf91', 3.3);
  sunLight.position.set(58, 36, -28);
  sunLight.target.position.set(2, 29, 2);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 165;
  sunLight.shadow.camera.left = -38;
  sunLight.shadow.camera.right = 38;
  sunLight.shadow.camera.top = 42;
  sunLight.shadow.camera.bottom = -34;
  sunLight.shadow.bias = -0.00045;
  sunLight.shadow.normalBias = 0.025;
  group.add(sunLight);
  group.add(sunLight.target);

  const hemiLight = new THREE.HemisphereLight('#8cb4d9', '#7a4b32', 0.85);
  group.add(hemiLight);

  const fillLight = new THREE.DirectionalLight('#6f95bd', 0.55);
  fillLight.position.set(36, 18, 48);
  group.add(fillLight);

  // Dedicated X-Ray Cutaway Cavity Blueprint Illumination (illuminates deep rock sockets & oak wedges in cool cyan-white when X-Ray is active!)
  const xrayCavityLight1 = new THREE.PointLight('#78c8ff', 0, 26, 1.3);
  xrayCavityLight1.position.set(-1.5, 29.0, 5.5);
  group.add(xrayCavityLight1);

  const xrayCavityLight2 = new THREE.PointLight('#78c8ff', 0, 24, 1.3);
  xrayCavityLight2.position.set(-1.5, 28.0, 12.0);
  group.add(xrayCavityLight2);

  // Warm Temple Lantern & Altar Point Lights (illuminate red columns, golden statues & cliff canopy warmly at dusk/night!)
  const templeLights = [];
  const lightSpots = [
    { pos: anchors.threeTeachings || { x: 3.2, y: 36.2, z: 13.0 }, color: '#ff9e3d', baseInt: 14 },
    { pos: anchors.skyWalkway || { x: 3.0, y: 31.8, z: 5.5 }, color: '#ff9436', baseInt: 10 },
    { pos: anchors.southPavilion || { x: 3.2, y: 29.0, z: -1.6 }, color: '#ff9838', baseInt: 12 },
    { pos: anchors.courtyardIncense || { x: 3.0, y: 22.8, z: -9.8 }, color: '#ff8c30', baseInt: 11 },
    { pos: anchors.bellTower || { x: 3.5, y: 25.0, z: -12.5 }, color: '#ffa242', baseInt: 9 },
    { pos: anchors.bridge || { x: 12.0, y: 5.5, z: -16.0 }, color: '#ffaa4c', baseInt: 11 },
    { pos: anchors.stele || { x: 7.2, y: 5.0, z: -2.0 }, color: '#ff9640', baseInt: 7 },
  ];
  for (const ls of lightSpots) {
    const pl = new THREE.PointLight(ls.color, ls.baseInt * 0.3, 18, 1.6);
    pl.position.set(ls.pos.x + 0.6, ls.pos.y, ls.pos.z);
    pl.userData.baseInt = ls.baseInt;
    group.add(pl);
    templeLights.push(pl);
  }

  // 5. Sculpted Stepped Voxel Cloud Ribbons (`恒山祥云流岚`) high near the mountain crest
  const cloudGroup = new THREE.Group();
  group.add(cloudGroup);
  const cloudBoxGeo = new THREE.BoxGeometry(0.5, 0.25, 0.5);
  const cloudMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f7f2ea'),
    roughness: 0.95,
    metalness: 0.0,
    transparent: true,
    opacity: 0.62,
  });

  const clouds = [];
  const cloudSeeds = [
    { x: 10.5, y: 54.0, z: -18, s: 1.0, speed: 0.36 },
    { x: 11.5, y: 56.8, z: 16, s: 1.15, speed: 0.30 },
    { x: 13.5, y: 49.5, z: 25, s: 0.90, speed: 0.42 },
  ];
  for (let i = 0; i < cloudSeeds.length; i++) {
    const c = cloudSeeds[i];
    const cluster = new THREE.Group();
    // Stepped voxel cloud silhouette (layered 0.25m-tall cloudlets instead of flat slabs!)
    for (let dz = -5; dz <= 5; dz++) {
      for (let dx = -2; dx <= 2; dx++) {
        const dist = (dx / 2.2) ** 2 + (dz / 5.2) ** 2;
        if (dist > 1.0) continue;
        const layers = dist < 0.35 ? 3 : dist < 0.7 ? 2 : 1;
        for (let ly = 0; ly < layers; ly++) {
          const m = new THREE.Mesh(cloudBoxGeo, cloudMat);
          m.position.set(dx * 0.5 * c.s, ly * 0.25 * c.s, dz * 0.5 * c.s);
          m.scale.setScalar(c.s);
          cluster.add(m);
        }
      }
    }
    cluster.position.set(c.x, c.y, c.z);
    cloudGroup.add(cluster);
    clouds.push({ mesh: cluster, baseZ: c.z, baseY: c.y, speed: c.speed, phase: i * 2.1 });
  }

  // 6. Soaring Cliff Swallows / Mountain Swifts (`金龙峡飞燕`) circling gracefully in front of the temple!
  const birdCount = 14;
  const birdGeo = new THREE.BoxGeometry(0.18, 0.06, 0.46);
  const birdMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#23262e'),
    roughness: 0.7,
  });
  const birdInst = new THREE.InstancedMesh(birdGeo, birdMat, birdCount);
  group.add(birdInst);
  const birdDummy = new THREE.Object3D();

  // 7. Rising Incense Smoke Voxels (`香炉袅袅青烟`) + Optional Winter Snowflakes (`北岳飞雪`)
  const smokeCount = 56;
  const smokeGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
  const smokeMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#e8dfd5'),
    transparent: true,
    opacity: 0.38,
  });
  const smokeInst = new THREE.InstancedMesh(smokeGeo, smokeMat, smokeCount);
  group.add(smokeInst);

  const snowCount = 240;
  const snowGeo = new THREE.BoxGeometry(0.13, 0.13, 0.13);
  const snowMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#f2f7ff'),
    transparent: true,
    opacity: 0.0,
  });
  const snowInst = new THREE.InstancedMesh(snowGeo, snowMat, snowCount);
  snowInst.visible = false;
  group.add(snowInst);

  const incenseOrigins = [
    anchors.courtyardIncense || { x: 2.75, y: 22.5, z: -9.75 },
    anchors.threeTeachings || { x: 1.0, y: 35.3, z: 13.0 },
  ];

  // Smooth lighting transition state
  const currentState = {
    presetId: 'dawn',
    skyTop: new THREE.Color(LIGHTING_PRESETS.dawn.skyTop),
    skyMid: new THREE.Color(LIGHTING_PRESETS.dawn.skyMid),
    skyHorizon: new THREE.Color(LIGHTING_PRESETS.dawn.skyHorizon),
    fogColor: new THREE.Color(LIGHTING_PRESETS.dawn.fogColor),
    fogDensity: LIGHTING_PRESETS.dawn.fogDensity,
    sunColor: new THREE.Color(LIGHTING_PRESETS.dawn.sunColor),
    sunIntensity: LIGHTING_PRESETS.dawn.sunIntensity,
    sunPos: new THREE.Vector3(...LIGHTING_PRESETS.dawn.sunPos),
    hemiSky: new THREE.Color(LIGHTING_PRESETS.dawn.hemiSky),
    hemiGround: new THREE.Color(LIGHTING_PRESETS.dawn.hemiGround),
    hemiIntensity: LIGHTING_PRESETS.dawn.hemiIntensity,
    fillColor: new THREE.Color(LIGHTING_PRESETS.dawn.fillColor),
    fillIntensity: LIGHTING_PRESETS.dawn.fillIntensity,
    glowIntensity: LIGHTING_PRESETS.dawn.glowIntensity,
    snowAmount: LIGHTING_PRESETS.dawn.snowAmount,
    exposure: LIGHTING_PRESETS.dawn.exposure,
  };

  let targetPreset = LIGHTING_PRESETS.dawn;
  scene.fog = new THREE.FogExp2(currentState.fogColor, currentState.fogDensity);

  function setPreset(id, instant = false) {
    if (!LIGHTING_PRESETS[id]) return;
    targetPreset = LIGHTING_PRESETS[id];
    currentState.presetId = id;
    if (instant) {
      applyBlend(1.0);
    }
  }

  function applyBlend(alpha) {
    currentState.skyTop.lerp(new THREE.Color(targetPreset.skyTop), alpha);
    currentState.skyMid.lerp(new THREE.Color(targetPreset.skyMid), alpha);
    currentState.skyHorizon.lerp(new THREE.Color(targetPreset.skyHorizon), alpha);
    currentState.fogColor.lerp(new THREE.Color(targetPreset.fogColor), alpha);
    currentState.fogDensity += (targetPreset.fogDensity - currentState.fogDensity) * alpha;
    currentState.sunColor.lerp(new THREE.Color(targetPreset.sunColor), alpha);
    currentState.sunIntensity += (targetPreset.sunIntensity - currentState.sunIntensity) * alpha;
    currentState.sunPos.lerp(new THREE.Vector3(...targetPreset.sunPos), alpha);
    currentState.hemiSky.lerp(new THREE.Color(targetPreset.hemiSky), alpha);
    currentState.hemiGround.lerp(new THREE.Color(targetPreset.hemiGround), alpha);
    currentState.hemiIntensity += (targetPreset.hemiIntensity - currentState.hemiIntensity) * alpha;
    currentState.fillColor.lerp(new THREE.Color(targetPreset.fillColor), alpha);
    currentState.fillIntensity += (targetPreset.fillIntensity - currentState.fillIntensity) * alpha;
    currentState.glowIntensity += (targetPreset.glowIntensity - currentState.glowIntensity) * alpha;
    currentState.snowAmount += (targetPreset.snowAmount - currentState.snowAmount) * alpha;
    currentState.exposure += (targetPreset.exposure - currentState.exposure) * alpha;

    skyUniforms.uTop.value.copy(currentState.skyTop);
    skyUniforms.uMid.value.copy(currentState.skyMid);
    skyUniforms.uHorizon.value.copy(currentState.skyHorizon);
    skyUniforms.uNightMix.value = targetPreset.id === 'night' ? currentState.snowAmount : 0.0;

    scene.fog.color.copy(currentState.fogColor);
    scene.fog.density = currentState.fogDensity;

    sunLight.color.copy(currentState.sunColor);
    sunLight.intensity = currentState.sunIntensity;
    sunLight.position.copy(currentState.sunPos);

    hemiLight.color.copy(currentState.hemiSky);
    hemiLight.groundColor.copy(currentState.hemiGround);
    hemiLight.intensity = currentState.hemiIntensity;

    fillLight.color.copy(currentState.fillColor);
    fillLight.intensity = currentState.fillIntensity;

    waterUniforms.uSunColor.value.copy(currentState.sunColor);
    cloudMat.color.copy(currentState.skyHorizon).lerp(new THREE.Color('#ffffff'), 0.55);

    sharedUniforms.uGlowIntensity.value = currentState.glowIntensity;
    sharedUniforms.uSnowAmount.value = currentState.snowAmount;

    const xr = sharedUniforms.uXRayMix.value;
    xrayCavityLight1.intensity = xr * 28.0;
    xrayCavityLight2.intensity = xr * 24.0;

    for (const pl of templeLights) {
      pl.intensity = pl.userData.baseInt * Math.max(0.08, currentState.glowIntensity);
    }

    snowInst.visible = currentState.snowAmount > 0.04;
    snowMat.opacity = currentState.snowAmount * 0.82;
  }

  function update(dt, elapsed, renderer, frozen = false) {
    applyBlend(Math.min(1.0, dt * 3.5));
    if (renderer) {
      renderer.toneMappingExposure = currentState.exposure;
    }

    if (frozen) return;

    // 1. Drift mountain clouds gently along Z
    for (const c of clouds) {
      const zOffset = ((elapsed * c.speed + c.phase * 8) % 64) - 32;
      c.mesh.position.z = zOffset;
      c.mesh.position.y = c.baseY + Math.sin(elapsed * 0.5 + c.phase) * 0.35;
    }

    // 2. Soaring cliff swallows circling in graceful figure-8 arcs in front of the pavilions
    for (let i = 0; i < birdCount; i++) {
      const phase = i * 0.85 + elapsed * (0.55 + (i % 3) * 0.08);
      const bx = 9.5 + Math.cos(phase) * 5.2 + (i % 4) * 0.8;
      const bz = Math.sin(phase * 0.7) * 16.0 + (i - 7) * 0.9;
      const by = 27.0 + Math.sin(phase * 1.3 + i) * 5.5 + (i % 5) * 1.4;

      const nextPhase = phase + 0.05;
      const nbx = 9.5 + Math.cos(nextPhase) * 5.2 + (i % 4) * 0.8;
      const nbz = Math.sin(nextPhase * 0.7) * 16.0 + (i - 7) * 0.9;

      birdDummy.position.set(bx, by, bz);
      birdDummy.lookAt(nbx, by, nbz);
      birdDummy.rotateZ(Math.sin(elapsed * 9.0 + i * 2.1) * 0.35);
      birdDummy.updateMatrix();
      birdInst.setMatrixAt(i, birdDummy.matrix);
    }
    birdInst.instanceMatrix.needsUpdate = true;

    // 3. Rising incense smoke wisps from temple bronze burners
    for (let i = 0; i < smokeCount; i++) {
      const orig = incenseOrigins[i % incenseOrigins.length];
      const life = ((elapsed * 0.38 + i * 0.19) % 1.0);
      const sx = orig.x + Math.sin(life * 6.0 + i) * 0.45 + life * 0.55;
      const sy = orig.y + life * 4.8;
      const sz = orig.z + Math.cos(life * 5.0 + i * 1.3) * 0.4;
      const scale = (1.0 - life) * 1.1 + 0.25;
      birdDummy.position.set(sx, sy, sz);
      birdDummy.rotation.set(0, life * 3.0, 0);
      birdDummy.scale.setScalar(scale * (1.0 - Math.pow(life, 2.2)));
      birdDummy.updateMatrix();
      smokeInst.setMatrixAt(i, birdDummy.matrix);
    }
    birdDummy.scale.setScalar(1);
    smokeInst.instanceMatrix.needsUpdate = true;

    // 4. Falling winter snow in Night mode
    if (snowInst.visible) {
      for (let i = 0; i < snowCount; i++) {
        const seed = i * 13.37;
        const fx = -4.0 + ((seed * 7.13) % 28.0) + Math.sin(elapsed * 0.8 + i) * 0.9;
        const fz = -29.0 + ((seed * 11.7) % 58.0) + Math.cos(elapsed * 0.6 + i) * 0.9;
        const fy = 58.0 - ((elapsed * (1.8 + (i % 5) * 0.25) + seed * 3.1) % 57.0);
        birdDummy.position.set(fx, fy, fz);
        birdDummy.rotation.set(elapsed + i, elapsed * 0.7, 0);
        birdDummy.updateMatrix();
        snowInst.setMatrixAt(i, birdDummy.matrix);
      }
      snowInst.instanceMatrix.needsUpdate = true;
    }
  }

  // Initialize Dawn immediately
  setPreset('dawn', true);

  return {
    group,
    sunLight,
    setPreset,
    getCurrentPreset: () => currentState.presetId,
    update,
  };
}
