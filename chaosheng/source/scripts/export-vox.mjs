import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as THREE from 'three';
import { createWorld } from '../src/world.js';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const world=createWorld();
const step=0.4;
const origin=[-47.6,-5.6,-39.6],size=[239,199,124]; // .vox is Z-up: X, depth, height.
const cells=new Uint8Array(size[0]*size[1]*size[2]);
const palette=[],paletteLookup=new Map();
const frequency=new Map();
for(const b of world.boxes)frequency.set(b.c,(frequency.get(b.c)||0)+Math.sqrt(b.s[0]*b.s[1]*b.s[2]));
for(const c of ['#536859','#387c7c','#398e8b'])frequency.set(c,1e6);
for(const [c]of [...frequency].sort((a,b)=>b[1]-a[1]).slice(0,255)){palette.push(c);paletteLookup.set(c,palette.length);}
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const paletteRGB=palette.map(rgb);
function indexFor(hex){
  if(paletteLookup.has(hex))return paletteLookup.get(hex);
  // MagicaVoxel has 255 opaque entries. Preserve the dominant colors and map
  // the remaining, closely related detail colors to their nearest palette entry.
  const color=rgb(hex);let best=0,distance=Infinity;
  paletteRGB.forEach((c,i)=>{const d=(c[0]-color[0])**2*.3+(c[1]-color[1])**2*.59+(c[2]-color[2])**2*.11;if(d<distance){distance=d;best=i;}});
  paletteLookup.set(hex,best+1);return best+1;
}
const groupMatrices=new Map();
for(const a of world.animations){
  const m=new THREE.Matrix4().compose(new THREE.Vector3(...a.p),new THREE.Quaternion().setFromEuler(new THREE.Euler(...a.r)),new THREE.Vector3(1,1,1));
  if(a.parent)m.premultiply(groupMatrices.get(a.parent));
  groupMatrices.set(a.id,m);
}
const point=new THREE.Vector3();
function rasterize(b){
  const color=indexFor(b.c);
  const m=new THREE.Matrix4().compose(new THREE.Vector3(...b.p),new THREE.Quaternion().setFromEuler(new THREE.Euler(...b.r)),new THREE.Vector3(1,1,1));
  if(b.g)m.premultiply(groupMatrices.get(b.g));
  const inverse=m.clone().invert(),bounds=new THREE.Box3();
  const half=b.s.map(v=>Math.max(v/2,step*0.45));
  for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1])bounds.expandByPoint(new THREE.Vector3(x*half[0],y*half[1],z*half[2]).applyMatrix4(m));
  const lo=[bounds.min.x,bounds.min.z,bounds.min.y].map((v,i)=>Math.max(0,Math.floor((v-origin[[0,2,1][i]])/step)));
  const hi=[bounds.max.x,bounds.max.z,bounds.max.y].map((v,i)=>Math.min(size[i]-1,Math.floor((v-origin[[0,2,1][i]])/step)));
  for(let z=lo[2];z<=hi[2];z++)for(let y=lo[1];y<=hi[1];y++)for(let x=lo[0];x<=hi[0];x++){
    point.set(origin[0]+(x+0.5)*step,origin[1]+(z+0.5)*step,origin[2]+(y+0.5)*step).applyMatrix4(inverse);
    if(Math.abs(point.x)<=half[0]+1e-5&&Math.abs(point.y)<=half[1]+1e-5&&Math.abs(point.z)<=half[2]+1e-5)cells[x+size[0]*(y+size[1]*z)]=color;
  }
}
// A closed cut-away sea is included; architectural surface voxels overwrite it.
rasterize({p:[0,-5.05,0],s:[94.7,0.65,78.7],c:'#536859',r:[0,0,0]});
rasterize({p:[0,-2.35,0],s:[94,4.7,78],c:'#387c7c',r:[0,0,0]});
rasterize({p:[0,-0.2,0],s:[94,0.4,78],c:'#398e8b',r:[0,0,0]});
for(const b of world.boxes)rasterize(b);

let count=0;for(const cell of cells)if(cell)count++;
const xyzi=Buffer.alloc(4+count*4);xyzi.writeUInt32LE(count,0);let at=4;
for(let z=0;z<size[2];z++)for(let y=0;y<size[1];y++)for(let x=0;x<size[0];x++){
  const color=cells[x+size[0]*(y+size[1]*z)];
  if(color){xyzi[at++]=x;xyzi[at++]=y;xyzi[at++]=z;xyzi[at++]=color;}
}
function chunk(name,content,children=Buffer.alloc(0)){
  const header=Buffer.alloc(12);header.write(name,0,4,'ascii');header.writeUInt32LE(content.length,4);header.writeUInt32LE(children.length,8);
  return Buffer.concat([header,content,children]);
}
const dims=Buffer.alloc(12);size.forEach((v,i)=>dims.writeUInt32LE(v,i*4));
const rgba=Buffer.alloc(1024);
palette.forEach((hex,i)=>{const n=parseInt(hex.slice(1),16);rgba[i*4]=n>>16;rgba[i*4+1]=(n>>8)&255;rgba[i*4+2]=n&255;rgba[i*4+3]=255;});
const header=Buffer.alloc(8);header.write('VOX ',0,4,'ascii');header.writeUInt32LE(150,4);
const result=Buffer.concat([header,chunk('MAIN',Buffer.alloc(0),Buffer.concat([chunk('SIZE',dims),chunk('XYZI',xyzi),chunk('RGBA',rgba)]))]);
await mkdir(path.join(root,'public'),{recursive:true});
await writeFile(path.join(root,'public','潮生-TIDEBORN.vox'),result);
await mkdir(path.join(root,'output'),{recursive:true});
await writeFile(path.join(root,'output','model-info.json'),JSON.stringify({title:'潮生 / TIDEBORN',seed:world.seed,sourceCuboids:world.boxes.length,voxelSize:step,size,voxels:count,palette:palette.length,sourceColors:frequency.size,bytes:result.length,stats:world.stats},null,2)+'\n');
console.log(JSON.stringify({file:'public/潮生-TIDEBORN.vox',size,voxels:count,colors:palette.length,bytes:result.length}));
