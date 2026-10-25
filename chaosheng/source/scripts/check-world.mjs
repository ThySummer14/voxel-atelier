import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createWorld } from '../src/world.js';
import { VOXLoader } from 'three/addons/loaders/VOXLoader.js';

const world=createWorld(),again=createWorld();
const hash=w=>createHash('sha256').update(JSON.stringify(w.boxes)).digest('hex');
assert.equal(hash(world),hash(again),'The artwork must be reproducible');
assert.ok(world.boxes.length>19000);
assert.equal(world.stats.boats,4);
assert.equal(world.stats.buildings,19);
assert.equal(world.landmarks.length,4);
const groups=new Set(world.animations.map(a=>a.id));
assert.equal(groups.size,world.animations.length,'Duplicate animation IDs');
for(const [i,b]of world.boxes.entries()){
  assert.ok([...b.p,...b.s,...b.r].every(Number.isFinite),`Non-finite geometry at ${i}`);
  assert.ok(b.s.every(v=>v>0),`Invalid dimensions at ${i}`);
  assert.match(b.c,/^#[0-9a-f]{6}$/i);
  assert.ok(!b.g||groups.has(b.g),`Missing animation group ${b.g}`);
}
for(const a of world.animations){assert.ok(!a.parent||groups.has(a.parent));assert.ok(a.p.every(Number.isFinite));}
const vox=await readFile(new URL('../public/潮生-TIDEBORN.vox',import.meta.url));
assert.equal(vox.toString('ascii',0,4),'VOX ');assert.equal(vox.readUInt32LE(4),150);
assert.equal(vox.toString('ascii',8,12),'MAIN');assert.equal(vox.readUInt32LE(16),vox.length-20);
let dims=null,voxelCount=0,palette=false;
for(let offset=20;offset<vox.length;){
  const id=vox.toString('ascii',offset,offset+4),length=vox.readUInt32LE(offset+4),content=offset+12;
  assert.ok(content+length<=vox.length,'Truncated VOX chunk');
  if(id==='SIZE'){dims=[0,1,2].map(i=>vox.readUInt32LE(content+i*4));assert.ok(dims.every(v=>v>0&&v<=256));}
  if(id==='XYZI'){
    voxelCount=vox.readUInt32LE(content);assert.equal(length,4+voxelCount*4);const occupied=new Set();
    for(let i=0;i<voxelCount;i++){
      const p=content+4+i*4,[x,y,z,c]=vox.subarray(p,p+4);
      assert.ok(x<dims[0]&&y<dims[1]&&z<dims[2]&&c>0,'Out-of-bounds voxel');
      const key=x+256*(y+256*z);assert.ok(!occupied.has(key),'Duplicate voxel');occupied.add(key);
    }
  }
  if(id==='RGBA'){assert.equal(length,1024);palette=true;}
  offset=content+length+vox.readUInt32LE(offset+8);
}
assert.ok(palette&&voxelCount>500000,'Incomplete voxel export');
const parsed=new VOXLoader().parse(vox.buffer.slice(vox.byteOffset,vox.byteOffset+vox.byteLength)).chunks;
assert.equal(parsed.length,1,'VOXLoader must see exactly one complete model');
assert.equal(parsed[0].data.length/4,voxelCount,'Independent VOXLoader voxel count');
console.log(`World integrity passed: ${world.boxes.length.toLocaleString()} cuboids, ${world.stats.buildings} buildings, deterministic seed ${world.seed}.`);
console.log(`VOX integrity passed: ${voxelCount.toLocaleString()} unique voxels, ${dims.join(' × ')}, valid palette and chunk boundaries.`);
