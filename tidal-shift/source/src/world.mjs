import { Blocks, container, palette as p, SWATCHES } from './voxel.mjs';
import { BRIDGE, paintBridge, paintShore } from './landscape.mjs';
import { drawHoist, drawTractor, paintTerminals, QUAY_Y, TRANSFER } from './terminal.mjs';
import { channelBuoys, feederShip, mainShip, serviceBoat } from './vessels.mjs';

export const OPENING_TIME = 13.4;

export const VIEWS = {
  harbor: {
    name: '全港', en: 'The approaches', target: [22, 30, -18],
    eye: [-79, 97, 280], mobileEye: [-74, 106, 315], mobileTarget: [42, 27, 1],
    fov: 38,
    note: '昂船洲与青衣隔水相望。货柜轮在东岸靠泊，双塔之间留出进港航道。',
  },
  berth: {
    name: '八号码头', en: 'Berth 08', target: [97, 13.4, 47],
    eye: [12, 62, 136], mobileEye: [-2, 81, 158], mobileTarget: [101, 16, 49],
    fov: 39,
    note: '顺着红色岸桥往下看，吊具在船舱与拖车之间往返，等候车道旁是分区堆放的货柜。',
  },
  bridge: {
    name: '昂船洲大桥', en: 'Stonecutters Bridge', target: [7, 43, -70],
    eye: [111, 93, 178], mobileEye: [81, 107, 225], mobileTarget: [6, 42, -72],
    fov: 34,
    note: '两座单柱桥塔立在水道两侧。斜拉索落在分离的双幅桥面上，桥下仍有通航空间。',
  },
  channel: {
    name: '引水航道', en: 'Rambler Channel', target: [15, 17, 40],
    eye: [22, 33, 185], mobileEye: [22, 39, 185], mobileTarget: [12, 17, 43],
    fov: 49,
    note: '视线降到海面附近。引水艇和拖轮各有一条尾流，航标灯标出两侧边界。',
  },
  yard: {
    name: '交接堆场', en: 'Container yard', target: [161, 6.5, 35],
    eye: [208, 71, 126], mobileEye: [218, 80, 141], mobileTarget: [163, 7, 29],
    fov: 43,
    note: '从塔台和库房之间看回泊位。橙黄色龙门吊跨过堆叠，车道把堆场分成连续的作业区。',
  },
};

export function makeWorld() {
  const terminal = new Blocks();
  const bridge = new Blocks();
  const shore = new Blocks();
  const background = new Blocks();
  const pools = [];

  paintTerminals(terminal, pools);
  drawTractor(terminal, TRANSFER.truckX, QUAY_Y, TRANSFER.z + .82, '#db9d54');
  for (const [x, z, color, loaded] of [
    [130.1, 67, '#a35147', true], [142.7, -12.1, '#7f9b96', false],
    [214.0, 89.5, '#b96f50', true], [-226.75, 16.8, '#d2a855', false],
    [205.2, -36, '#a3aa9b', false], [129.2, 18, '#a6a69b', false],
  ]) {
    drawTractor(terminal, x, QUAY_Y, z, color, loaded);
  }

  paintBridge(bridge);
  paintShore(shore, background);
  const buoys = new Blocks();
  channelBuoys(buoys);

  const trolley = new Blocks();
  const spreader = new Blocks();
  const suspended = new Blocks();
  const hoist = drawHoist();
  hoist.chassis(trolley);
  hoist.frame(spreader);
  container(suspended, -1.225, 0, -3.09, 6.18, SWATCHES[1], { lettering: 'KWT' });

  const lorry = new Blocks();
  drawTractor(lorry, 0, 0, 0, '#a35a47', true);
  const carColors = ['#cee0d8', '#a4524a', '#d1b289', '#7897a1', '#d5d0bf', '#496774'];
  const cars = carColors.map((color, i) => {
    const body = new Blocks();
    const w = i % 3 === 1 ? 2.88 : 2.17;
    body.box(-w / 2, .065, -.53, w, .46, 1.06, color);
    body.box(-.49, .49, -.46, 1.12, .35, .91, i % 3 === 1 ? color : '#9baaa2');
    body.box(.61, .30, -.42, .36, .26, .84, '#526566');
    body.box(w / 2 - .03, .24, -.41, .095, .14, .79, p.ice, .73);
    body.box(-w / 2 - .035, .22, -.41, .082, .13, .79, p.marker, .58);
    return body;
  });

  return {
    core: [terminal, bridge, shore, mainShip(), feederShip(), buoys],
    background,
    pools,
    moving: { trolley, spreader, suspended, lorry, cars, pilot: serviceBoat('pilot'), tug: serviceBoat('tug') },
  };
}

const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};
const shift = (t, start, end) => ease((t - start) / (end - start));

const RADIUS = 5.0;
const TURN = Math.PI * RADIUS / 2;
const yardLegs = [
  [135.9, -39.3,   0,  1, 116.2, Math.PI],
  [140.9,  81.9,   1,  0,  50.65, Math.PI / 2],
  [196.55, 76.9,   0, -1, 116.2, 0],
  [191.55,-44.3,  -1,  0,  50.65, -Math.PI / 2],
];
const loopDistance = yardLegs.reduce((total, leg) => total + leg[4] + TURN, 0);

function yardRoute(time) {
  let distance = (28 + time * 3.9) % loopDistance;
  for (const [startX, startZ, dx, dz, length, angle] of yardLegs) {
    if (distance <= length) {
      return { x: startX + dx * distance, z: startZ + dz * distance, y: QUAY_Y, yaw: Math.atan2(dx, dz) };
    }
    distance -= length;
    if (distance <= TURN) {
      const a = angle - distance / RADIUS;
      return {
        x: startX + dx * length + (Math.cos(a) - Math.cos(angle)) * RADIUS,
        z: startZ + dz * length + (Math.sin(a) - Math.sin(angle)) * RADIUS,
        y: QUAY_Y, yaw: Math.atan2(Math.sin(a), -Math.cos(a)),
      };
    }
    distance -= TURN;
  }
  return { x: 135.9, z: -39.3, y: QUAY_Y, yaw: 0 };
}

export function choreography(t) {
  const phase = t % 44;
  const { shipX, shipY, truckX, truckY, clearY, z, railY } = TRANSFER;
  const crossing = shift(phase, 8.0, 16.4) - shift(phase, 29.0, 37.4);
  const pickup = shift(phase, 2.1, 8.0) - shift(phase, 37.4, 43.2);
  const delivery = shift(phase, 16.4, 22.4) - shift(phase, 23.0, 29.0);
  const x = lerp(shipX, truckX, crossing);
  const y = shipY + (clearY - shipY) * pickup + (truckY - clearY) * delivery;
  const a = t * .034 - .17;
  const b = t * .030 + .42;
  const pilot = {
    x: -8 + 55 * Math.cos(a),
    z: 104 + 33 * Math.sin(a),
    yaw: Math.atan2(-55 * Math.sin(a), 33 * Math.cos(a)),
    y: .09 + Math.sin(t * 1.48) * .17,
  };
  const tug = {
    x: -32 + 37 * Math.sin(b),
    z: 22 + 29 * Math.cos(b),
    yaw: Math.atan2(37 * Math.cos(b), -29 * Math.sin(b)),
    y: .10 + Math.sin(t * 1.04 + 1.7) * .15,
  };
  const lorry = yardRoute(t);
  const traffic = Array.from({ length: 16 }, (_, i) => {
    const direction = i % 2 ? -1 : 1;
    const passed = (t * (3.30 + i % 4 * .38) + i * 76.9 + (i % 3) * 14.1) % 535;
    return {
      x: direction > 0 ? -263 + passed : 272 - passed,
      z: BRIDGE.z + (direction > 0 ? (i % 4 === 0 ? 4.25 : 6.72) : (i % 4 === 1 ? -4.3 : -6.55)),
      y: BRIDGE.deckY + .14,
      yaw: direction > 0 ? 0 : Math.PI,
    };
  });
  return { transfer: { x, y, z, railY }, pilot, tug, lorry, traffic };
}
