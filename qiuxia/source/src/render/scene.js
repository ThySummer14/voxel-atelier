// Renderer, lighting rig, environment, post chain, and mesh-group -> material mapping.

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.info.autoReset = false;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xcfd8de, 0.001);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 4000);
  camera.position.set(310, 90, 260);

  // procedural gradient environment for metal response
  const envW = 64, envH = 32;
  const data = new Uint8Array(envW * envH * 4);
  for (let y = 0; y < envH; y++) {
    const v = y / (envH - 1); // 0 top
    let r, g, b;
    if (v < 0.5) { const t = v / 0.5; r = 90 + 60 * t; g = 120 + 50 * t; b = 165 + 30 * t; }
    else if (v < 0.56) { r = 220; g = 190; b = 150; }
    else { const t = (v - 0.56) / 0.44; r = 70 - 40 * t; g = 62 - 36 * t; b = 48 - 30 * t; }
    for (let x = 0; x < envW; x++) {
      const i = (y * envW + x) * 4;
      data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255;
    }
  }
  const envTex = new THREE.DataTexture(data, envW, envH, THREE.RGBAFormat);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  envTex.colorSpace = THREE.SRGBColorSpace;
  envTex.needsUpdate = true;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromEquirectangular(envTex).texture;
  scene.environmentIntensity = 0.5;
  pmrem.dispose();

  const sun = new THREE.DirectionalLight(0xfff2dd, 2.8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.camera.left = -320;
  sun.shadow.camera.right = 320;
  sun.shadow.camera.top = 220;
  sun.shadow.camera.bottom = -220;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 1400;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.6;
  scene.add(sun);
  scene.add(sun.target);

  const moon = new THREE.DirectionalLight(0x9ab0d8, 0.0);
  scene.add(moon);
  scene.add(moon.target);

  const hemi = new THREE.HemisphereLight(0xbcd3e8, 0x8a7a5e, 0.6);
  scene.add(hemi);

  // gentle camera-side accent so the hero object never crushes to silhouette
  const fill = new THREE.DirectionalLight(0xc4ccd6, 0.5);
  scene.add(fill);
  scene.add(fill.target);

  const materials = {
    opaque: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.94, metalness: 0.0 }),
    metal: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.34, metalness: 0.85 }),
    glass: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.16, metalness: 0.1, transparent: true, opacity: 0.45 }),
    lamp: new THREE.MeshBasicMaterial({ vertexColors: true }),
    head: new THREE.MeshBasicMaterial({ vertexColors: true }),
    fire: new THREE.MeshBasicMaterial({ vertexColors: true }),
    sigR: new THREE.MeshBasicMaterial({ vertexColors: true }),
    sigG: new THREE.MeshBasicMaterial({ vertexColors: true }),
  };

  const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.34, 0.55, 0.82);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  function addMeshed(meshed, opts = {}) {
    const group = new THREE.Group();
    const meshes = {};
    for (const [gname, g] of Object.entries(meshed.groups)) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(g.position, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(g.normal, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(g.color, 3));
      geo.setIndex(new THREE.BufferAttribute(g.index, 1));
      geo.computeBoundingSphere();
      const mesh = new THREE.Mesh(geo, materials[gname]);
      mesh.castShadow = opts.castShadow !== false && gname !== 'lamp' && gname !== 'head' && gname !== 'fire' && gname !== 'sigR' && gname !== 'sigG' && gname !== 'glass';
      mesh.receiveShadow = opts.receiveShadow !== false;
      mesh.name = (opts.name || 'world') + ':' + gname;
      if (gname === 'glass') mesh.renderOrder = 3;
      group.add(mesh);
      meshes[gname] = mesh;
    }
    if (opts.parent) opts.parent.add(group);
    else scene.add(group);
    return { group, meshes };
  }

  function applyTime(p) {
    sun.color.setRGB(...p.sun);
    sun.intensity = p.sunI;
    const sd = p.sunDir;
    sun.position.set(268 + sd[0] * 600, 60 + sd[1] * 600, 100 + sd[2] * 600);
    sun.target.position.set(268, 60, 100);
    sun.visible = p.sunI > 0.02;
    moon.color.setRGB(0.62, 0.72, 0.95);
    moon.intensity = p.moonI * 0.55;
    moon.position.set(268 + p.moonDir[0] * 600, 60 + p.moonDir[1] * 600, 100 + p.moonDir[2] * 600);
    moon.target.position.set(268, 60, 100);
    hemi.color.setRGB(...p.hs);
    hemi.groundColor.setRGB(...p.hg);
    hemi.intensity = p.hi;
    fill.intensity = 0.28 + 0.34 * p.day;
    fill.position.copy(camera.position);
    fill.target.position.set(268, 70, 100);
    scene.fog.color.setRGB(...p.fog);
    scene.fog.density = p.fd * 0.18;
    scene.environmentIntensity = 0.18 + 0.42 * p.day;
    renderer.toneMappingExposure = p.exp;
    // lamp / head / fire brightness by time
    const lampK = 0.22 + 1.5 * p.lamp;
    materials.lamp.color.setRGB(lampK * 1.0, lampK * 0.82, lampK * 0.55);
    const headK = 0.25 + 2.2 * p.lamp;
    materials.head.color.setRGB(headK, headK * 0.96, headK * 0.82);
    bloom.strength = 0.26 + 0.30 * p.night;
  }

  return { renderer, scene, camera, composer, sun, moon, hemi, fill, materials, addMeshed, applyTime, resize, bloom };
}