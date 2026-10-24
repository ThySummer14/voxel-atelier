import { buildMeshes } from "./sculpt/build.js";

function transferablesFor(value, list = []) {
  if (ArrayBuffer.isView(value)) list.push(value.buffer);
  else if (Array.isArray(value)) for (const item of value) transferablesFor(item, list);
  else if (value && typeof value === "object") {
    for (const item of Object.values(value)) transferablesFor(item, list);
  }
  return list;
}

function serializableParts(parts) {
  if (!parts) return null;
  const out = {};
  for (const [name, data] of Object.entries(parts)) {
    if (!data) continue;
    out[name] = {
      position: data.position,
      normal: data.normal,
      color: data.color,
      dye: data.dye,
      index: data.index,
      stats: data.stats,
    };
  }
  return out;
}

try {
  self.postMessage({ type: "progress", stage: "worker-build", progress: 0.38 });
  const built = buildMeshes();
  const chunks = built.chunks.map(({ x0, x1, faces, parts }) => ({
    x0,
    x1,
    faces,
    parts: serializableParts(parts),
  }));
  const payload = {
    type: "ready",
    built: {
      chunks,
      stats: built.stats,
      timings: built.timings,
      terrain: built.terrain,
      lamps: built.lamps ?? built.ctx?.lamps ?? [],
      mill: built.ctx?.mill ?? built.mill ?? null,
      farBands: built.ctx?.far ?? built.farBands ?? null,
    },
  };
  self.postMessage(payload, [...new Set(transferablesFor(payload))]);
} catch (error) {
  self.postMessage({
    type: "error",
    message: error?.message ?? String(error),
    stack: error?.stack ?? "",
  });
}
