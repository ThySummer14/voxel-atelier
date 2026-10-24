export const M2_PERIOD = 12.4206012;

export function tideLevel(hour) {
  return 0.35 + 3.45 * Math.cos((Math.PI * 2 * (hour - 6.1)) / M2_PERIOD);
}

export function tideState(hour) {
  const level = tideLevel(hour);
  const derivative = -Math.sin((Math.PI * 2 * (hour - 6.1)) / M2_PERIOD);
  return {
    level,
    rising: derivative > 0,
    normalized: Math.max(0, Math.min(1, (level + 3.1) / 6.9)),
    causewayDry: level < 0.72,
  };
}

export function solarState(hour) {
  const angle = ((hour - 6) / 24) * Math.PI * 2;
  const elevation = Math.sin(angle);
  const daylight = Math.max(0, Math.min(1, (elevation + 0.16) / 0.42));
  const night = 1 - daylight;
  const golden = Math.max(0, 1 - Math.abs(elevation) / 0.34) * daylight;
  return { elevation, daylight, night, golden };
}

export function formatHour(hour) {
  const wrapped = ((hour % 24) + 24) % 24;
  const minutes = Math.round(wrapped * 60) % (24 * 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function nextTurn(hour) {
  const phase = ((hour - 6.1) / M2_PERIOD) % 1;
  const target = phase < 0.5 ? 0.5 : 1;
  return ((target - phase) * M2_PERIOD + 1) % 1 + Math.floor((target - phase) * M2_PERIOD);
}
