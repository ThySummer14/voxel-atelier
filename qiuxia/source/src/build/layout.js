// Shared spatial contract for the whole diorama. 1 voxel ~= 0.15 m.

export const NX = 536;
export const NY = 140;
export const NZ = 200;

export const TRACK_Y = 74;          // rail head height
export const TRACK_Z = 100;         // track centreline
export const RAIL_Z = [95, 105];    // rail centre lines (gauge ~1.5 m)
export const WHEEL_Y = TRACK_Y + 1; // wheel/axle centre height above rail head

export const LEFT_PORTAL = 160;     // left tunnel mouth face
export const RIGHT_PORTAL = 376;    // right tunnel mouth face
export const GORGE_X0 = 244;
export const GORGE_X1 = 376;
export const GORGE_CX = (GORGE_X0 + GORGE_X1) / 2;
export const RIVER_Y = 26;          // water surface
export const RIVER_BED = 22;

export const PLATEAU_Y = 68;        // nominal ground level beside the formation

export const STATION_X0 = 176;
export const STATION_X1 = 236;

export const TRAIN_LEN = 150;       // loco 98 + gap 2 + tender 50
export const TRAIN_P_MIN = 155;     // fully hidden in left bore
export const TRAIN_P_MAX = 530;     // fully hidden in right bore
export const TRAIN_SPEED = 9.0;     // voxels / second