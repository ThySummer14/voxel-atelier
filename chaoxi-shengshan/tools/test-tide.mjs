import assert from 'node:assert/strict';
import { M2_PERIOD, tideLevel, tideState, solarState, formatHour, nextTurn } from '../js/tide.js';

const near = (a, b, eps = 1e-8) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
near(M2_PERIOD, 12.4206012);
near(tideLevel(6.1), 3.8);
near(tideLevel(6.1 + M2_PERIOD / 2), -3.1);
near(tideLevel(6.1 + M2_PERIOD), tideLevel(6.1));
assert.equal(tideState(6.1).causewayDry, false);
assert.equal(tideState(6.1 + M2_PERIOD / 2).causewayDry, true);
assert.equal(tideState(0).rising, true);
assert.equal(tideState(8).rising, false);
assert.equal(formatHour(17.4), '17:24');
assert.equal(formatHour(-.5), '23:30');
assert.equal(solarState(12).daylight, 1);
assert.equal(solarState(0).night, 1);
assert.ok(solarState(18).golden > solarState(12).golden);
near(nextTurn(6.1), M2_PERIOD / 2, 1e-6);
console.log('✓ 潮汐周期、相位、栈桥出露、昼夜与时刻格式：13 项通过');
