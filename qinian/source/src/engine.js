import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import {
  voxelVert, voxelFrag, depthVert, depthFrag, skyVert, skyFrag, groundVert, groundFrag,
  snowVert, snowFrag, gradeFrag,
} from './shaders.js';

async function fetchBytes(url, onProgress) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  const total = Number(res.headers.get('content-length')) || 0;
  const reader = res.body.getReader();
  const chunks = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    if (onProgress) onProgress(got, total);
  }
  const out = new Uint8Array(got);
  let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
}

async function gunzip(bytes) {
  // GitHub Pages may already have inflated the body if it served Content-Encoding: gzip
  if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) return bytes;
  const ds = new DecompressionStream('gzip');
  const stream = new Blob([bytes]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function loadModel(base, onProgress) {
  const meta = await (await fetch(`${base}/model.json`)).json();
  let qBytes = 0, sBytes = 0;
  const report = () => onProgress && onProgress(qBytes + sBytes);
  const [quadsGz, skyGz] = await Promise.all([
    fetchBytes(`${base}/${meta.files.quads}`, (g) => { qBytes = g; report(); }),
    fetchBytes(`${base}/${meta.files.sky}`, (g) => { sBytes = g; report(); }),
  ]);
  const [quads, sky] = await Promise.all([gunzip(quadsGz), gunzip(skyGz)]);
  return { meta, quads: new Uint32Array(quads.buffer, quads.byteOffset, quads.byteLength / 4), sky };
}

export class Engine {
  constructor(canvas, model, opts = {}) {
    this.canvas = canvas;
    this.model = model;
    this.mobile = opts.mobile;
    const r = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
    this.renderer = r;
    this.maxDpr = this.mobile ? 1.6 : 2;
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.maxDpr));
    r.toneMapping = THREE.NeutralToneMapping;
    r.toneMappingExposure = 1.0;
    r.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.5, 4000);
    this.camera.position.set(80, 40, 118);
        this.time = 0;
    this.dirty = true;
    this.shadowDirty = true;
    this.reveal = 80;
    this.build();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  build() {
    const { meta, quads, sky } = this.model;
    const S = meta.voxel;
    const [NX, NY, NZ] = meta.dims;
    this.half = (NX * S) / 2;
    const origin = new THREE.Vector3(-(NX / 2) * S, -meta.ground * S, -(NZ / 2) * S);

    // palette → 256×2 texture: row 0 sRGB + material, row 1 jitter / snow
    const pal = new Uint8Array(256 * 2 * 4);
    meta.palette.forEach(([hex, mat, nz, sn], i) => {
      pal[i * 4] = parseInt(hex.slice(1, 3), 16);
      pal[i * 4 + 1] = parseInt(hex.slice(3, 5), 16);
      pal[i * 4 + 2] = parseInt(hex.slice(5, 7), 16);
      pal[i * 4 + 3] = mat;
      const o = (256 + i) * 4;
      pal[o] = Math.round(nz * 255);
      pal[o + 1] = sn ? 255 : 0;
    });
    const palTex = new THREE.DataTexture(pal, 256, 2, THREE.RGBAFormat, THREE.UnsignedByteType);
    palTex.needsUpdate = true;

    const [GX, GY, GZ] = meta.sky.dims;
    const skyTex = new THREE.Data3DTexture(sky, GX, GY, GZ);
    skyTex.format = THREE.RedFormat;
    skyTex.type = THREE.UnsignedByteType;
    skyTex.minFilter = skyTex.magFilter = THREE.LinearFilter;
    skyTex.wrapS = skyTex.wrapT = skyTex.wrapR = THREE.ClampToEdgeWrapping;
    skyTex.unpackAlignment = 1;
    skyTex.needsUpdate = true;
    const cell = meta.sky.cell * S;

    // shadow map
    const ss = this.mobile ? 2048 : 4096;
    const depthTexture = new THREE.DepthTexture(ss, ss);
    depthTexture.type = THREE.UnsignedIntType;
    depthTexture.compareFunction = THREE.LessEqualCompare;
    depthTexture.minFilter = depthTexture.magFilter = THREE.LinearFilter;
    this.shadowRT = new THREE.WebGLRenderTarget(ss, ss, { depthTexture, depthBuffer: true, format: THREE.RedFormat, type: THREE.UnsignedByteType });
    this.shadowCam = new THREE.OrthographicCamera(-80, 80, 80, -80, 1, 400);
    this.shadowSize = ss;

    this.uniforms = {
      uPal: { value: palTex },
      uSkyVol: { value: skyTex },
      uSkyMin: { value: origin.clone() },
      uSkySize: { value: new THREE.Vector3(GX * cell, GY * cell, GZ * cell) },
      uShadowMap: { value: depthTexture },
      uShadowMat: { value: new THREE.Matrix4() },
      uShadowTexel: { value: 1 / ss },
      uOrigin: { value: origin },
      uVoxel: { value: S },
      uSunDir: { value: new THREE.Vector3(0.3, 0.7, 0.6).normalize() },
      uSunColor: { value: new THREE.Color(3, 2.8, 2.5) },
      uZenith: { value: new THREE.Color(0.2, 0.4, 0.8) },
      uHorizon: { value: new THREE.Color(0.6, 0.7, 0.85) },
      uGround: { value: new THREE.Color(0.35, 0.33, 0.3) },
      uSkyAmb: { value: new THREE.Color(0.4, 0.5, 0.7) },
      uAmbient: { value: 1.0 },
      uCamPos: { value: this.camera.position },
      uFogColor: { value: new THREE.Color(0.7, 0.75, 0.82) },
      uFogDensity: { value: 0.0015 },
      uSnow: { value: 0 },
      uNight: { value: 0 },
      uFlood: { value: 0 },
      uTime: { value: 0 },
      uReveal: { value: 80 },
      uClip: { value: 0 },
      uClipN1: { value: new THREE.Vector3(1, 0, 0) },
      uClipN2: { value: new THREE.Vector3(0, 0, 1) },
      uSaturation: { value: 1 },
    };
    const mat = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: voxelVert,
      fragmentShader: voxelFrag,
      uniforms: this.uniforms,
    });
    this.voxelMat = mat;
    this.depthMat = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: depthVert,
      fragmentShader: depthFrag,
      uniforms: { uOrigin: this.uniforms.uOrigin, uVoxel: this.uniforms.uVoxel, uReveal: this.uniforms.uReveal },
    });

    // base quad: four corners, two triangles
    const corner = new Float32Array([0, 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0]);
    const index = [0, 1, 2, 0, 2, 3];
    this.voxelGroup = new THREE.Group();
    this.shadowGroup = new THREE.Group();
    for (const t of meta.tiles) {
      const g = new THREE.InstancedBufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(corner, 3));
      g.setIndex(index);
      const slice = quads.subarray(t.o * 2, (t.o + t.n) * 2);
      g.setAttribute('q', new THREE.InstancedBufferAttribute(slice, 2));
      g.instanceCount = t.n;
      const min = new THREE.Vector3(...t.min).multiplyScalar(S).add(origin);
      const max = new THREE.Vector3(...t.max).multiplyScalar(S).add(origin);
      g.boundingBox = new THREE.Box3(min, max);
      g.boundingSphere = g.boundingBox.getBoundingSphere(new THREE.Sphere());
      const m = new THREE.Mesh(g, mat);
      m.frustumCulled = true;
      this.voxelGroup.add(m);
      const sm = new THREE.Mesh(g, this.depthMat);
      sm.frustumCulled = false;
      this.shadowGroup.add(sm);
    }
    this.scene.add(this.voxelGroup);
    this.shadowScene = new THREE.Scene();
    this.shadowScene.add(this.shadowGroup);

    // sky dome
    this.skyUniforms = {
      uZenith: this.uniforms.uZenith, uHorizon: this.uniforms.uHorizon, uGround: { value: new THREE.Color(0.3, 0.3, 0.3) },
      uSunDir: this.uniforms.uSunDir, uSunColor: { value: new THREE.Color(1, 0.9, 0.7) }, uSunSize: { value: 1 },
      uNight: this.uniforms.uNight, uSnow: this.uniforms.uSnow, uTime: this.uniforms.uTime, uSkyBright: { value: 1.6 },
      uFogColor: this.uniforms.uFogColor,
    };
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24), new THREE.ShaderMaterial({
      vertexShader: skyVert, fragmentShader: skyFrag, uniforms: this.skyUniforms, side: THREE.BackSide, depthWrite: false,
    }));
    dome.renderOrder = -10;
    dome.frustumCulled = false;
    this.sky = dome;
    this.scene.add(dome);

    // ground plane under the diorama block
    this.groundUniforms = {
      uColor: { value: new THREE.Color(0.5, 0.48, 0.44) }, uFogColor: this.uniforms.uFogColor,
      uFogDensity: this.uniforms.uFogDensity, uCamPos: this.uniforms.uCamPos, uHalf: { value: this.half },
      uShadowMap: this.uniforms.uShadowMap, uShadowMat: this.uniforms.uShadowMat, uShadowTexel: this.uniforms.uShadowTexel,
      uShadowStrength: { value: 0.38 },
    };
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.ShaderMaterial({
      vertexShader: groundVert, fragmentShader: groundFrag, uniforms: this.groundUniforms,
    }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3.0;
    this.ground = ground;
    this.scene.add(ground);

    // falling snow
    const N = this.mobile ? 5000 : 12000;
    const sp = new Float32Array(N * 3), seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      sp[i * 3] = (Math.random() - 0.5) * 130;
      sp[i * 3 + 1] = Math.random() * 46;
      sp[i * 3 + 2] = (Math.random() - 0.5) * 130;
      seed[i] = Math.random();
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    sg.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    this.snowUniforms = { uTime: this.uniforms.uTime, uSize: { value: 70 }, uOpacity: { value: 0 } };
    this.snowPts = new THREE.Points(sg, new THREE.ShaderMaterial({
      vertexShader: snowVert, fragmentShader: snowFrag, uniforms: this.snowUniforms, transparent: true, depthWrite: false,
    }));
    this.snowPts.frustumCulled = false;
    this.snowPts.visible = false;
    this.scene.add(this.snowPts);

    // controls
    const c = new OrbitControls(this.camera, this.canvas);
    c.target.set(0, 11, 0);
    c.enableDamping = true;
    c.dampingFactor = 0.075;
    c.rotateSpeed = 0.6;
    c.zoomSpeed = 0.9;
    c.panSpeed = 0.7;
    c.minDistance = 5;
    c.maxDistance = 330;
    c.maxPolarAngle = Math.PI * 0.85;
    c.screenSpacePanning = true;
    c.addEventListener('change', () => { this.dirty = true; });
    this.controls = c;

    // post
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: this.mobile ? 2 : 4 });
    this.composer = new EffectComposer(this.renderer, rt);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.18, 0.55, 0.92);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.grade = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, uVignette: { value: 0.55 }, uGrain: { value: 0.012 }, uTime: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: gradeFrag,
    });
    this.composer.addPass(this.grade);
  }

  setSun(dir) {
    this.uniforms.uSunDir.value.copy(dir).normalize();
    this.shadowDirty = true;
    this.dirty = true;
  }

  updateShadow() {
    const L = this.uniforms.uSunDir.value;
    const cam = this.shadowCam;
    const center = new THREE.Vector3(0, 10, 0);
    cam.position.copy(center).addScaledVector(L, 180);
    cam.up.set(0, 1, 0);
    if (Math.abs(L.y) > 0.99) cam.up.set(0, 0, -1);
    cam.lookAt(center);
    // tight bounds: project the diorama box into light space
    cam.updateMatrixWorld();
    const inv = cam.matrixWorldInverse;
    const h = this.half;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9;
    for (const x of [-h - 30, h + 30]) for (const y of [-3, 38]) for (const z of [-h - 30, h + 30]) {
      const p = new THREE.Vector3(x, y, z).applyMatrix4(inv);
      x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z);
    }
    const pad = 6;
    cam.left = x0 - pad; cam.right = x1 + pad; cam.bottom = y0 - pad; cam.top = y1 + pad;
    cam.near = Math.max(0.1, -z1 - 20); cam.far = -z0 + 20;
    cam.updateProjectionMatrix();
    this.uniforms.uShadowMat.value.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    const r = this.renderer;
    r.setRenderTarget(this.shadowRT);
    r.setClearColor(0x000000, 1);
    r.clear(true, true, false);
    r.render(this.shadowScene, cam);
    r.setRenderTarget(null);
    this.shadowDirty = false;
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth, h = this.canvas.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr) * (this.scale || 1);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(dpr);
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }

  frame(dt) {
    if (!this.still) this.time += dt;
    this.uniforms.uTime.value = this.time;
    this.grade.uniforms.uTime.value = this.time % 10;
    const moved = this.controls.update();
    this.sky.position.copy(this.camera.position);
    if (this.shadowDirty) this.updateShadow();
    const animate = this.animating || (!this.still && (this.snowPts.visible || this.uniforms.uNight.value > 0));
    if (this.dirty || moved || animate) {
      this.composer.render();
      this.dirty = false;
      return true;
    }
    return false;
  }
}
