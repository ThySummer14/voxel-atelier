// Material palette. ids are indices into PALETTE; 0 is always air.
// group decides which render material/mesh a face lands in.

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

const defs = [];
export const M = {};

function def(name, hex, opts = {}) {
  const id = defs.length + 1;
  M[name] = id;
  const r = ((hex >> 16) & 255) / 255;
  const g = ((hex >> 8) & 255) / 255;
  const b = (hex & 255) / 255;
  defs.push({
    id,
    name,
    hex,
    lin: [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)],
    jitter: opts.jitter ?? 0.05,
    group: opts.group ?? 'opaque',
    seeThrough: opts.seeThrough ?? false,
  });
  return id;
}

// ground / geology
def('GRASS_DRY', 0x9a9257, { jitter: 0.09 });
def('GRASS_GREEN', 0x6f7f45, { jitter: 0.09 });
def('GRASS_GOLD', 0xb09a52, { jitter: 0.09 });
def('DIRT', 0x7a5c3e, { jitter: 0.08 });
def('ROCK', 0x8d8578, { jitter: 0.08 });
def('ROCK_DARK', 0x6b6459, { jitter: 0.08 });
def('ROCK_WARM', 0x9c8f7a, { jitter: 0.08 });
def('STRATA_A', 0x7c7264, { jitter: 0.06 });
def('STRATA_B', 0x8a8071, { jitter: 0.06 });
def('STRATA_C', 0x6e6558, { jitter: 0.06 });
def('CLIFF', 0x7f766a, { jitter: 0.09 });
def('SCREE', 0x948b7c, { jitter: 0.1 });
def('RIVERBED', 0x5f5a4e, { jitter: 0.08 });
def('SAND', 0xb7a878, { jitter: 0.07 });
def('MOSS', 0x5d6b3a, { jitter: 0.09 });

// bridge / track / tunnel
def('BRIDGE', 0x9b9384, { jitter: 0.06 });
def('BRIDGE_D', 0x857d6e, { jitter: 0.06 });
def('KEYSTONE', 0xa89f8d, { jitter: 0.05 });
def('BALLAST', 0x6e6659, { jitter: 0.12 });
def('BALLAST_L', 0x7d7566, { jitter: 0.12 });
def('SLEEPER', 0x6b4f33, { jitter: 0.07 });
def('SLEEPER_D', 0x5a4229, { jitter: 0.07 });
def('RAIL', 0x8f949c, { group: 'metal', jitter: 0.03 });
def('RAIL_TOP', 0xc8ccd4, { group: 'metal', jitter: 0.02 });
def('TUNNEL_STONE', 0x8a8172, { jitter: 0.07 });
def('TUNNEL_DARK', 0x3a352c, { jitter: 0.05 });
def('PORTAL_TRIM', 0xa29a88, { jitter: 0.05 });

// flora
def('PINE', 0x3f5a3a, { jitter: 0.09 });
def('PINE_D', 0x33492f, { jitter: 0.09 });
def('PINE_T', 0x4d6b43, { jitter: 0.09 });
def('TRUNK', 0x5d4630, { jitter: 0.07 });
def('TRUNK_D', 0x4a3726, { jitter: 0.07 });
def('BIRCH', 0xd8d2c4, { jitter: 0.05 });
def('BIRCH_MARK', 0x4a4438, { jitter: 0.05 });
def('LEAF_GOLD', 0xd99a2b, { jitter: 0.11 });
def('LEAF_ORANGE', 0xc96a24, { jitter: 0.11 });
def('LEAF_RED', 0xa83a24, { jitter: 0.11 });
def('LEAF_RUST', 0xb4552a, { jitter: 0.11 });
def('LEAF_YELLOW', 0xe0b23c, { jitter: 0.11 });
def('BUSH', 0x6d7a3f, { jitter: 0.1 });
def('FLOWER', 0xb8434a, { jitter: 0.08 });

// station
def('BRICK', 0x9c5f45, { jitter: 0.06 });
def('BRICK_D', 0x86503a, { jitter: 0.06 });
def('PLASTER', 0xd8cdb4, { jitter: 0.04 });
def('ROOF', 0x4a4f57, { jitter: 0.06 });
def('ROOF_D', 0x3c4148, { jitter: 0.06 });
def('ROOF_R', 0x5a6069, { jitter: 0.05 });
def('WOOD', 0x7a5a38, { jitter: 0.07 });
def('WOOD_D', 0x63482c, { jitter: 0.07 });
def('WOOD_P', 0xa8845a, { jitter: 0.06 });
def('PLATFORM', 0x8f8878, { jitter: 0.06 });
def('PLATFORM_E', 0xb8b0a0, { jitter: 0.05 });
def('PLATFORM_L', 0xd8d2c0, { jitter: 0.03 });
def('WINDOW', 0xffd9a0, { group: 'lamp', jitter: 0.02 });
def('LAMP_POST', 0x3c4148, { group: 'metal', jitter: 0.03 });
def('LAMP_GLOW', 0xffe2b0, { group: 'lamp', jitter: 0.02 });
def('SIGN_BOARD', 0x2f4a3c, { jitter: 0.03 });
def('SIGN_TEXT', 0xe8e4d8, { jitter: 0.02 });
def('TANK', 0x5a6068, { group: 'metal', jitter: 0.04 });
def('TANK_RUST', 0x7a5a44, { jitter: 0.06 });
def('TANK_WOOD', 0x6e5136, { jitter: 0.06 });
def('COAL', 0x23262b, { jitter: 0.14 });
def('COAL_SHINE', 0x3a3f46, { jitter: 0.14 });

// locomotive
def('LOCO_BLACK', 0x26282d, { jitter: 0.03 });
def('LOCO_BLACK2', 0x31343a, { jitter: 0.03 });
def('BOILER', 0x2b2e34, { jitter: 0.03 });
def('SMOKEBOX', 0x34373c, { jitter: 0.03 });
def('SMOKEBOX_D', 0x3d4046, { jitter: 0.03 });
def('LOCO_RED', 0xa8281e, { jitter: 0.04 });
def('LOCO_RED_D', 0x8c2018, { jitter: 0.04 });
def('WHEEL_RIM', 0xd8dade, { group: 'metal', jitter: 0.02 });
def('WHEEL_TIRE', 0xb8bcc4, { group: 'metal', jitter: 0.02 });
def('ROD', 0xb8bcc2, { group: 'metal', jitter: 0.02 });
def('ROD_D', 0x8f949a, { group: 'metal', jitter: 0.02 });
def('BRASS', 0xc9a24a, { group: 'metal', jitter: 0.03 });
def('CAB_GLASS', 0x2a3038, { group: 'glass', seeThrough: true, jitter: 0.02 });
def('TENDER', 0x4a4e54, { jitter: 0.04 });
def('TENDER_D', 0x3c4045, { jitter: 0.04 });
def('TENDER_RED', 0x8c2018, { jitter: 0.04 });
def('LINING', 0xd8d4c8, { jitter: 0.02 });
def('PLATE', 0xb8342a, { jitter: 0.03 });
def('HEADLIGHT', 0xfff4d8, { group: 'head', jitter: 0.0 });
def('FIRE', 0xff7a2a, { group: 'fire', jitter: 0.06 });
def('EMBER', 0xff4a1a, { group: 'fire', jitter: 0.1 });
def('SIGNAL_R', 0xff3b30, { group: 'sigR', jitter: 0.0 });
def('SIGNAL_G', 0x35d07a, { group: 'sigG', jitter: 0.0 });

// lineside
def('POLE', 0x6b5136, { jitter: 0.06 });
def('WIRE', 0x4a4a4a, { group: 'metal', jitter: 0.02 });
def('INSULATOR', 0x7a8a7a, { jitter: 0.04 });
def('PATH', 0xa09680, { jitter: 0.08 });
def('FENCE', 0x8a6a44, { jitter: 0.07 });

export const AIR = 0;
export const PALETTE = [null, ...defs];
export const GROUPS = ['opaque', 'metal', 'glass', 'lamp', 'head', 'fire', 'sigR', 'sigG'];

export function mat(id) {
  return PALETTE[id];
}