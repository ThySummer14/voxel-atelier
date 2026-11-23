import * as THREE from "../vendor/three.module.js";

const UNIT = 0.13;
const viewport = document.getElementById("viewport");
const statusNode = document.getElementById("status");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const CARRIAGE_NAMES = new Set(["carriage_frame", "platen", "paper", "paper_bail"]);

const state = {
  ready: false,
  exploded: false,
  explosion: 0,
  night: false,
  view: "overview",
  autoRotate: !reducedMotion,
  sound: true,
  yaw: 0.64,
  pitch: 0.34,
  zoom: 0.86,
  targetYaw: 0.64,
  targetPitch: 0.34,
  targetZoom: 0.86,
  target: new THREE.Vector3(0.3, 4.3, 0),
  targetGoal: new THREE.Vector3(0.3, 4.3, 0),
  carriage: 0,
  carriageGoal: 0,
  paperFeed: 0,
  paperFeedGoal: 0,
  roller: 0,
  rollerGoal: 0,
  lines: [["A SMALL RED REVOLUTION."], ["OLIVETTI · IVREA · 1969"], [""]],
  line: 2,
  column: 0,
  typing: false,
  frame: 0,
  fps: 60,
};

const presets = {
  overview: { yaw: 0.64, pitch: 0.34, zoom: 0.86, target: [0.3, 4.3, 0], label: "完整机身" },
  keyboard: { yaw: 0.14, pitch: 0.83, zoom: 1.7, target: [0, 2.65, 2.25], label: "键盘与字键" },
  carriage: { yaw: 0.48, pitch: 0.24, zoom: 1.62, target: [0, 5.35, -2.55], label: "字车与纸页" },
  mechanism: { yaw: 0.86, pitch: 0.66, zoom: 1.52, target: [0, 3.2, 0], label: "扇形字杆与齿轮组" },
};

let scene, camera, renderer, artworkRoot, carriageRoot, paperNode, platenMesh, printMesh, printCanvas, printTexture, strikeArm, ribbonNode, caseMesh, caseMaterial;
let keyLight, fillLight, rimLight, hemisphere;
let stats, palette, metadata;
const groupNodes = new Map();
const keyNodes = new Map();
const activePresses = new Map();
let sampleTimer = null;
let audioContext = null;
let strikeTime = -10;
let pointer = null;
let lastFrameTime = performance.now();
let fpsFrames = 0;
let fpsStamp = performance.now();

function setStatus(text) {
  statusNode.textContent = text;
}

async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`无法读取 ${path}：HTTP ${response.status}`);
  return response.json();
}

function decodeModel(buffer) {
  const view = new DataView(buffer);
  if (String.fromCharCode(...new Uint8Array(buffer, 0, 4)) !== "VXV1") throw new Error("体素数据格式无效");
  const count = view.getUint32(4, true);
  const groups = [];
  let offset = 8;
  for (let i = 0; i < count; i++) {
    const nameLength = view.getUint32(offset, true);
    offset += 4;
    const name = new TextDecoder().decode(new Uint8Array(buffer, offset, nameLength));
    offset += nameLength;
    const voxelCount = view.getUint32(offset, true);
    offset += 4;
    const voxels = [];
    for (let j = 0; j < voxelCount; j++) {
      voxels.push([
        view.getInt16(offset, true),
        view.getInt16(offset + 2, true),
        view.getInt16(offset + 4, true),
        view.getUint8(offset + 6),
      ]);
      offset += 7;
    }
    groups.push({ name, voxels });
  }
  if (offset !== buffer.byteLength) throw new Error("体素数据末尾存在未解析字节");
  return groups;
}

const FACES = [
  { normal: [1, 0, 0], shade: 0.88, corners: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]] },
  { normal: [-1, 0, 0], shade: 0.77, corners: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]] },
  { normal: [0, 1, 0], shade: 1.04, corners: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]] },
  { normal: [0, -1, 0], shade: 0.53, corners: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },
  { normal: [0, 0, 1], shade: 0.96, corners: [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]] },
  { normal: [0, 0, -1], shade: 0.70, corners: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]] },
];

function voxelKey(x, y, z) {
  return `${x},${y},${z}`;
}

function buildGeometry(voxels) {
  const occupied = new Set(voxels.map(([x, y, z]) => voxelKey(x, y, z)));
  const positions = [];
  const normals = [];
  const colors = [];
  const indices = [];
  const colorCache = palette.map((hex) => new THREE.Color(hex));

  for (const [x, y, z, colorIndex] of voxels) {
    const base = colorCache[colorIndex - 1] || colorCache[0];
    const grain = 0.965 + (((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) & 7) * 0.009;
    for (const face of FACES) {
      const [nx, ny, nz] = face.normal;
      if (occupied.has(voxelKey(x + nx, y + ny, z + nz))) continue;
      const vertexStart = positions.length / 3;
      for (const corner of face.corners) {
        positions.push((x + corner[0] - 0.5) * UNIT, (y + corner[1] - 0.5) * UNIT, (z + corner[2] - 0.5) * UNIT);
        normals.push(nx, ny, nz);
        const shade = face.shade * grain;
        colors.push(base.r * shade, base.g * shade, base.b * shade);
      }
      indices.push(vertexStart, vertexStart + 1, vertexStart + 2, vertexStart, vertexStart + 2, vertexStart + 3);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

function materialFor(kind) {
  const presets = {
    plastic: { roughness: 0.43, metalness: 0.02 },
    key: { roughness: 0.34, metalness: 0.04 },
    metal: { roughness: 0.3, metalness: 0.78 },
    rubber: { roughness: 0.86, metalness: 0.01 },
    paper: { roughness: 0.96, metalness: 0, side: THREE.DoubleSide },
  };
  const values = presets[kind] || presets.plastic;
  return new THREE.MeshStandardMaterial({ vertexColors: true, ...values });
}

function makePrintSurface() {
  printCanvas = document.createElement("canvas");
  printCanvas.width = 1024;
  printCanvas.height = 640;
  printTexture = new THREE.CanvasTexture(printCanvas);
  printTexture.colorSpace = THREE.SRGBColorSpace;
  printTexture.minFilter = THREE.LinearFilter;
  printTexture.magFilter = THREE.LinearFilter;
  printTexture.generateMipmaps = false;

  const width = 61 * UNIT;
  const height = 31 * UNIT;
  const geometry = new THREE.PlaneGeometry(width, height, 12, 24);
  const position = geometry.attributes.position;
  const centerY = 63.5 * UNIT;
  for (let i = 0; i < position.count; i++) {
    const worldY = position.getY(i) + centerY;
    const gridY = worldY / UNIT;
    const curve = Math.round(Math.max(0, gridY - 43) * 0.045);
    position.setZ(i, (-31 + curve) * UNIT + 0.075);
  }
  geometry.computeVertexNormals();
  const material = new THREE.MeshBasicMaterial({ map: printTexture, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  printMesh = new THREE.Mesh(geometry, material);
  printMesh.position.y = centerY;
  printMesh.renderOrder = 3;
  redrawPaper();
}

function redrawPaper() {
  if (!printCanvas) return;
  const ctx = printCanvas.getContext("2d");
  ctx.clearRect(0, 0, printCanvas.width, printCanvas.height);
  ctx.fillStyle = "#2b2521";
  ctx.textBaseline = "top";
  ctx.font = "25px 'Courier New', monospace";
  const visible = state.lines.slice(-5);
  visible.forEach((line, row) => {
    const text = line.join("").slice(0, 38);
    ctx.fillText(text, 58, 70 + row * 52);
  });
  if (!state.typing && state.line === state.lines.length - 1) {
    const x = 58 + state.lines[state.line].join("").length * 15;
    const y = 70 + (visible.length - 1) * 52;
    ctx.fillRect(x + 2, y + 2, 14, 26);
  }
  printTexture.needsUpdate = true;
  const preview = state.lines[state.line].join("") || "READY FOR YOUR WORDS";
  document.getElementById("paper-preview").textContent = preview;
}

function buildArtwork(groups) {
  artworkRoot = new THREE.Group();
  artworkRoot.position.y = -0.4;
  scene.add(artworkRoot);
  carriageRoot = new THREE.Group();
  artworkRoot.add(carriageRoot);
  const materials = new Map();

  for (const data of groups) {
    const meta = metadata.find((item) => item.name === data.name);
    if (!meta) continue;
    const node = new THREE.Group();
    node.name = data.name;
    node.userData.explode = new THREE.Vector3(...meta.offset);
    node.userData.basePosition = new THREE.Vector3(...meta.position).multiplyScalar(UNIT);
    node.position.copy(node.userData.basePosition);
    node.rotation.set(...meta.rotation);
    node.visible = meta.visible;
    const material = materials.get(meta.kind) || materialFor(meta.kind);
    materials.set(meta.kind, material);
    const meshMaterial = data.name === "case" ? material.clone() : material;
    if (data.name === "case") {
      caseMaterial = meshMaterial;
      caseMaterial.transparent = true;
      caseMaterial.opacity = 1;
    }
    const mesh = new THREE.Mesh(buildGeometry(data.voxels), meshMaterial);
    if (data.name === "case") caseMesh = mesh;
    if (data.name === "platen") {
      mesh.geometry.translate(0, -48 * UNIT, 27 * UNIT);
      mesh.position.set(0, 48 * UNIT, -27 * UNIT);
    }
    mesh.castShadow = meta.kind !== "paper";
    mesh.receiveShadow = true;
    mesh.name = `${data.name}_mesh`;
    node.add(mesh);
    if (CARRIAGE_NAMES.has(data.name)) carriageRoot.add(node);
    else artworkRoot.add(node);
    groupNodes.set(data.name, node);
    if (data.name === "platen") platenMesh = mesh;
    if (data.name === "paper") {
      paperNode = node;
      makePrintSurface();
      node.add(printMesh);
    }
    if (data.name === "ribbon") ribbonNode = node;
    if (meta.key) {
      keyNodes.set(meta.char, node);
      mesh.userData.keyNode = node;
      mesh.userData.char = meta.char;
    }
  }

  const cubeGeometry = new THREE.BoxGeometry(UNIT * 0.78, UNIT * 0.78, UNIT * 0.78);
  const strikeMaterial = new THREE.MeshStandardMaterial({ color: 0xaab0ac, roughness: 0.28, metalness: 0.8 });
  strikeArm = new THREE.InstancedMesh(cubeGeometry, strikeMaterial, 16);
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < 16; i++) {
    matrix.makeTranslation(0, i * UNIT * 0.82, -i * i * UNIT * 0.018);
    strikeArm.setMatrixAt(i, matrix);
  }
  strikeArm.position.set(0, 2.65, -1.1);
  strikeArm.instanceMatrix.needsUpdate = true;
  strikeArm.castShadow = true;
  groupNodes.get("mechanism").add(strikeArm);
}

function setupScene() {
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-8, 8, 8, -8, 0.1, 160);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  viewport.appendChild(renderer.domElement);

  hemisphere = new THREE.HemisphereLight(0xfff9ed, 0x5d6063, 2.25);
  scene.add(hemisphere);
  keyLight = new THREE.DirectionalLight(0xfff4df, 3.6);
  keyLight.position.set(-8, 17, 11);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.left = -13;
  keyLight.shadow.camera.right = 13;
  keyLight.shadow.camera.top = 15;
  keyLight.shadow.camera.bottom = -10;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 55;
  keyLight.shadow.bias = -0.00035;
  keyLight.shadow.normalBias = 0.025;
  scene.add(keyLight);
  fillLight = new THREE.DirectionalLight(0xffd9c6, 1.2);
  fillLight.position.set(11, 8, 2);
  scene.add(fillLight);
  rimLight = new THREE.DirectionalLight(0xddeaff, 2.1);
  rimLight.position.set(-2, 12, -14);
  scene.add(rimLight);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(180, 180),
    new THREE.ShadowMaterial({ color: 0x3c332c, opacity: 0.16 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.03;
  floor.receiveShadow = true;
  scene.add(floor);

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(7.65, 7.82, 0.18, 80),
    new THREE.MeshStandardMaterial({ color: 0xded6c8, roughness: 0.92, metalness: 0 }),
  );
  plinth.position.y = 0.06;
  plinth.receiveShadow = true;
  scene.add(plinth);

  const contact = new THREE.Mesh(
    new THREE.CircleGeometry(6.2, 64),
    new THREE.MeshBasicMaterial({ color: 0x352a24, transparent: true, opacity: 0.055, depthWrite: false }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = 0.155;
  scene.add(contact);

  new ResizeObserver(resize).observe(viewport);
  resize();
  bindPointer();
}

function resize() {
  if (!renderer) return;
  const width = Math.max(1, viewport.clientWidth);
  const height = Math.max(1, viewport.clientHeight);
  renderer.setSize(width, height, false);
  const aspect = width / height;
  const viewHeight = Math.max(14.8, 16 / aspect);
  camera.left = -viewHeight * aspect / 2;
  camera.right = viewHeight * aspect / 2;
  camera.top = viewHeight / 2;
  camera.bottom = -viewHeight / 2;
  camera.updateProjectionMatrix();
}

function bindPointer() {
  const canvas = renderer.domElement;
  canvas.addEventListener("pointerdown", (event) => {
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, moved: false };
    canvas.setPointerCapture(event.pointerId);
    viewport.classList.add("is-dragging");
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY) > 4) pointer.moved = true;
    if (pointer.moved) {
      state.targetYaw -= dx * 0.007;
      state.targetPitch = THREE.MathUtils.clamp(state.targetPitch + dy * 0.005, 0.08, 1.28);
      setAutoRotate(false);
    }
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });
  canvas.addEventListener("pointerup", (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    if (!pointer.moved) pickKey(event.clientX, event.clientY);
    pointer = null;
    viewport.classList.remove("is-dragging");
  });
  canvas.addEventListener("pointercancel", () => {
    pointer = null;
    viewport.classList.remove("is-dragging");
  });
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    state.targetZoom = THREE.MathUtils.clamp(state.targetZoom * Math.exp(-event.deltaY * 0.001), 0.62, 2.8);
  }, { passive: false });
  canvas.addEventListener("dblclick", () => setView("overview"));
  viewport.addEventListener("keydown", (event) => {
    const step = event.shiftKey ? 0.24 : 0.1;
    if (event.key === "ArrowLeft") state.targetYaw += step;
    else if (event.key === "ArrowRight") state.targetYaw -= step;
    else if (event.key === "ArrowUp") state.targetPitch = THREE.MathUtils.clamp(state.targetPitch + step, 0.08, 1.28);
    else if (event.key === "ArrowDown") state.targetPitch = THREE.MathUtils.clamp(state.targetPitch - step, 0.08, 1.28);
    else if (event.key === "+" || event.key === "=") state.targetZoom = THREE.MathUtils.clamp(state.targetZoom * 1.12, 0.62, 2.8);
    else if (event.key === "-") state.targetZoom = THREE.MathUtils.clamp(state.targetZoom / 1.12, 0.62, 2.8);
    else if (event.key === "Home" || event.key === "0") setView("overview");
    else return;
    event.preventDefault();
    setAutoRotate(false);
    setStatus("KEYBOARD VIEW · 方向键旋转，+/− 缩放");
  });
}

function isVisible(object) {
  let current = object;
  while (current) {
    if (!current.visible) return false;
    current = current.parent;
  }
  return true;
}

function pickKey(clientX, clientY) {
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObject(artworkRoot, true).find((item) => isVisible(item.object));
  let object = hit?.object;
  while (object && object.userData.char == null) object = object.parent;
  if (object?.userData.char != null) typeCharacter(object.userData.char);
}

function setAutoRotate(value) {
  state.autoRotate = value;
  const button = document.getElementById("rotate-button");
  button.setAttribute("aria-pressed", String(value));
  button.setAttribute("aria-label", value ? "暂停自动环绕" : "开启自动环绕");
}

function setView(name) {
  const preset = presets[name];
  if (!preset) return;
  state.view = name;
  state.targetYaw = preset.yaw;
  state.targetPitch = preset.pitch;
  state.targetZoom = preset.zoom;
  state.targetGoal.set(...preset.target);
  if (name === "mechanism") setExploded(true);
  document.getElementById("view-label").textContent = preset.label;
  document.querySelectorAll(".view-button").forEach((button) => {
    const active = button.dataset.view === name;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  setStatus(`${preset.label} · 拖拽可自由观察`);
}

function setExploded(value) {
  state.exploded = value;
  if (state.view === "overview") {
    state.targetZoom = value ? 0.76 : 0.86;
    state.targetGoal.set(0.3, value ? 5.25 : 4.3, 0);
  }
  const button = document.getElementById("explode-button");
  button.setAttribute("aria-pressed", String(value));
  button.querySelector("span").textContent = value ? "合上机身" : "拆解机身";
  setStatus(value ? "EXPLODED · 机芯与色带机构已展开" : "ASSEMBLED · 机身已合拢");
}

function setNight(value) {
  state.night = value;
  document.body.classList.toggle("night", value);
  const button = document.getElementById("light-button");
  button.setAttribute("aria-pressed", String(value));
  button.setAttribute("aria-label", value ? "切换白昼灯光" : "切换夜班灯光");
  document.querySelector('meta[name="theme-color"]').setAttribute("content", value ? "#151a1c" : "#ece7dd");
  setStatus(value ? "NIGHT SHIFT · 夜班灯光" : "DAYLIGHT · 白昼灯光");
}

function playClack(heavy = false) {
  if (!state.sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") audioContext.resume();
    const duration = heavy ? 0.095 : 0.052;
    const buffer = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * duration), audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * (heavy ? 32 : 55));
    }
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    const filter = audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = heavy ? 780 : 1450;
    filter.Q.value = 0.7;
    const gain = audioContext.createGain();
    gain.gain.value = heavy ? 0.16 : 0.1;
    source.connect(filter).connect(gain).connect(audioContext.destination);
    source.start();
  } catch {
    state.sound = false;
    const button = document.getElementById("sound-button");
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", "开启打字声音");
  }
}

function pressKey(char, now = performance.now()) {
  const node = keyNodes.get(char);
  if (node) activePresses.set(char, { start: now, duration: reducedMotion ? 1 : 180 });
  strikeTime = now / 1000;
  if (ribbonNode) ribbonNode.userData.strike = now / 1000;
  playClack(char === "↵" || char === " ");
}

function appendLine(text = "") {
  state.lines.push([text]);
  if (state.lines.length > 7) state.lines.shift();
  state.line = state.lines.length - 1;
  state.paperFeedGoal += 0.11;
  state.column = text.length;
  redrawPaper();
}

function typeCharacter(raw) {
  if (!state.ready) return;
  const char = raw === "Enter" ? "↵" : raw;
  pressKey(char);
  if (char === "\t") {
    setStatus("TAB · 字车定位");
    return;
  }
  if (char === "↵") {
    state.rollerGoal += Math.PI * 1.15;
    appendLine();
    state.carriageGoal = 0;
    setStatus("RETURN · 字车归位，纸页进给");
    return;
  }
  if (typeof char !== "string" || char.length !== 1 || char < " ") return;
  let line = state.lines[state.line];
  if (line.join("").length >= 34) {
    appendLine();
    line = state.lines[state.line];
  }
  line.push(char.toUpperCase());
  state.column = line.join("").length;
  state.carriageGoal = -state.column * 0.148;
  redrawPaper();
  setStatus(`TYPE · ${line.join("")}`);
}

function carriageReturn() {
  if (!state.ready) return;
  state.rollerGoal += Math.PI * 1.15;
  state.paperFeedGoal += 0.11;
  appendLine();
  state.carriageGoal = 0;
  pressKey("↵");
  setStatus("RETURN · 字车归位，纸页进给");
}

function typeSample() {
  if (!state.ready || state.typing) return;
  state.typing = true;
  const button = document.getElementById("type-button");
  button.disabled = true;
  const text = "CIAO, MONDO. MAKE IT PERSONAL.";
  let index = 0;
  const tick = () => {
    if (index >= text.length) {
      state.typing = false;
      button.disabled = false;
      carriageReturn();
      return;
    }
    typeCharacter(text[index++]);
    sampleTimer = window.setTimeout(tick, reducedMotion ? 20 : 92);
  };
  tick();
}

function resetArtwork() {
  if (sampleTimer) window.clearTimeout(sampleTimer);
  state.typing = false;
  document.getElementById("type-button").disabled = false;
  state.lines = [["A SMALL RED REVOLUTION."], ["OLIVETTI · IVREA · 1969"], [""]];
  state.line = 2;
  state.column = 0;
  state.carriageGoal = 0;
  state.paperFeedGoal = 0;
  state.rollerGoal = 0;
  state.explosion = 0;
  setExploded(false);
  setNight(false);
  setView("overview");
  setAutoRotate(!reducedMotion);
  activePresses.clear();
  redrawPaper();
  setStatus("RESET · 可以直接敲击键盘");
}

function updateTransforms(now, delta) {
  const smooth = 1 - Math.exp(-delta * 7);
  state.explosion += ((state.exploded ? 1 : 0) - state.explosion) * smooth;
  state.carriage += (state.carriageGoal - state.carriage) * (1 - Math.exp(-delta * 15));
  state.paperFeed += (state.paperFeedGoal - state.paperFeed) * (1 - Math.exp(-delta * 9));
  state.roller += (state.rollerGoal - state.roller) * (1 - Math.exp(-delta * 7));
  carriageRoot.position.x = state.carriage;
  if (caseMaterial) {
    caseMaterial.opacity = 1 - state.explosion * 0.7;
    caseMaterial.depthWrite = state.explosion < 0.04;
    if (caseMesh) caseMesh.renderOrder = state.explosion > 0.04 ? 2 : 0;
  }

  for (const [name, node] of groupNodes) {
    const explode = node.userData.explode;
    node.position.copy(node.userData.basePosition).addScaledVector(explode, state.explosion);
    if (name === "paper") node.position.y += state.paperFeed;
    if (name === "mechanism" || name === "ribbon") node.visible = state.explosion > 0.04;
  }
  for (const [char, press] of activePresses) {
    const node = keyNodes.get(char);
    const t = Math.min(1, (now - press.start) / press.duration);
    const depth = Math.sin(t * Math.PI) * 0.13;
    node.position.y -= depth;
    if (t >= 1) activePresses.delete(char);
  }
  if (platenMesh) platenMesh.rotation.x = state.roller;
  if (ribbonNode?.userData.strike) {
    const t = (now / 1000 - ribbonNode.userData.strike) / 0.18;
    ribbonNode.position.y += Math.sin(Math.min(1, t) * Math.PI) * 0.035;
    if (t >= 1) delete ribbonNode.userData.strike;
  }
  if (strikeArm) {
    const t = (now / 1000 - strikeTime) / 0.2;
    strikeArm.rotation.x = t >= 0 && t <= 1 ? -Math.sin(t * Math.PI) * 1.1 : 0;
  }

  const day = !state.night;
  hemisphere.intensity += ((day ? 2.25 : 0.48) - hemisphere.intensity) * smooth;
  keyLight.intensity += ((day ? 3.6 : 2.15) - keyLight.intensity) * smooth;
  fillLight.intensity += ((day ? 1.2 : 1.9) - fillLight.intensity) * smooth;
  rimLight.intensity += ((day ? 2.1 : 4.2) - rimLight.intensity) * smooth;
  keyLight.color.lerp(new THREE.Color(day ? 0xfff4df : 0xffc38b), smooth);
  rimLight.color.lerp(new THREE.Color(day ? 0xddeaff : 0x8fc8ff), smooth);
}

function updateCamera(delta) {
  if (state.autoRotate && !pointer && !state.typing) state.targetYaw += delta * 0.095;
  const smooth = 1 - Math.exp(-delta * 5.5);
  state.yaw += (state.targetYaw - state.yaw) * smooth;
  state.pitch += (state.targetPitch - state.pitch) * smooth;
  state.zoom += (state.targetZoom - state.zoom) * smooth;
  state.target.lerp(state.targetGoal, smooth);
  const distance = 46;
  const horizontal = Math.cos(state.pitch) * distance;
  camera.position.set(
    state.target.x + Math.sin(state.yaw) * horizontal,
    state.target.y + Math.sin(state.pitch) * distance,
    state.target.z + Math.cos(state.yaw) * horizontal,
  );
  camera.lookAt(state.target);
  camera.zoom = state.zoom;
  camera.updateProjectionMatrix();
}

function animate(now) {
  const delta = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
  lastFrameTime = now;
  updateTransforms(now, delta);
  updateCamera(delta);
  renderer.render(scene, camera);
  state.frame++;
  fpsFrames++;
  if (now - fpsStamp > 800) {
    state.fps = Math.round(fpsFrames * 1000 / (now - fpsStamp));
    fpsFrames = 0;
    fpsStamp = now;
  }
  requestAnimationFrame(animate);
}

function bindUI() {
  document.querySelectorAll(".view-button").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
  document.getElementById("explode-button").addEventListener("click", () => setExploded(!state.exploded));
  document.getElementById("type-button").addEventListener("click", typeSample);
  document.getElementById("return-button").addEventListener("click", carriageReturn);
  document.getElementById("rotate-button").addEventListener("click", () => setAutoRotate(!state.autoRotate));
  document.getElementById("light-button").addEventListener("click", () => setNight(!state.night));
  document.getElementById("reset-button").addEventListener("click", resetArtwork);
  document.getElementById("sound-button").addEventListener("click", () => {
    state.sound = !state.sound;
    const button = document.getElementById("sound-button");
    button.setAttribute("aria-pressed", String(state.sound));
    button.setAttribute("aria-label", state.sound ? "关闭打字声音" : "开启打字声音");
    if (state.sound) playClack();
    setStatus(state.sound ? "SOUND ON · 机械打字声" : "SOUND OFF · 静音模式");
  });
  window.addEventListener("keydown", (event) => {
    if (!state.ready || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName))) return;
    if (event.key === "Enter" && target instanceof HTMLElement && /BUTTON|A/.test(target.tagName)) return;
    if (event.key === " " && target instanceof HTMLElement && /BUTTON|A/.test(target.tagName)) return;
    if (event.key === " " && !(target instanceof HTMLButtonElement)) event.preventDefault();
    if (event.key.length === 1 || event.key === "Enter") typeCharacter(event.key);
  });
}

async function init() {
  try {
    const [modelMeta, colorPalette, modelStats, binary] = await Promise.all([
      loadJSON("./js/model.json"),
      loadJSON("./js/palette.json"),
      loadJSON("./js/stats.json"),
      fetch("./js/voxels.bin").then((response) => {
        if (!response.ok) throw new Error(`无法读取体素数据：HTTP ${response.status}`);
        return response.arrayBuffer();
      }),
    ]);
    metadata = modelMeta;
    palette = colorPalette;
    stats = modelStats;
    setupScene();
    buildArtwork(decodeModel(binary));
    bindUI();
    setAutoRotate(state.autoRotate);
    state.ready = true;
    document.body.classList.add("is-ready");
    document.getElementById("loading").setAttribute("aria-hidden", "true");
    document.getElementById("voxel-fact").textContent = `${stats.voxelCount.toLocaleString("en-US")} voxels`;
    setStatus("READY · 可以直接敲击键盘");
    window.__VALENTINE_READY__ = true;
    window.VALENTINE = {
      stats,
      setView,
      setExploded,
      setNight,
      setAutoRotate,
      type: typeCharacter,
      return: carriageReturn,
      reset: resetArtwork,
      setCamera(values) {
        if (values.yaw != null) state.targetYaw = values.yaw;
        if (values.pitch != null) state.targetPitch = values.pitch;
        if (values.zoom != null) state.targetZoom = values.zoom;
        if (values.target) state.targetGoal.set(...values.target);
      },
      getState() {
        return {
          ready: state.ready,
          view: state.view,
          exploded: state.exploded,
          explosion: state.explosion,
          night: state.night,
          autoRotate: state.autoRotate,
          sound: state.sound,
          carriageX: carriageRoot.position.x,
          paperFeed: state.paperFeed,
          roller: state.roller,
          lines: state.lines.map((line) => line.join("")),
          fps: state.fps,
          drawCalls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
          camera: { yaw: state.yaw, pitch: state.pitch, zoom: state.zoom },
        };
      },
      projectKey(char) {
        const node = keyNodes.get(char);
        if (!node) return null;
        const point = node.localToWorld(new THREE.Vector3(0, 2.5 * UNIT, 0)).project(camera);
        const rect = renderer.domElement.getBoundingClientRect();
        return { x: rect.left + (point.x + 1) * rect.width / 2, y: rect.top + (1 - point.y) * rect.height / 2 };
      },
    };
    lastFrameTime = performance.now();
    requestAnimationFrame(animate);
  } catch (error) {
    console.error(error);
    const fatal = document.getElementById("fatal");
    fatal.hidden = false;
    fatal.textContent = `作品装配失败：${error.message}。请通过本地 HTTP 服务打开页面，并确认 js/voxels.bin 与 model.json 已一同部署。`;
    document.getElementById("loading").hidden = true;
  }
}

init();
