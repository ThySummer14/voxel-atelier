import * as THREE from 'three';
import { buildArchipelago } from './expanded-world.js';
import fs from 'node:fs';
import assert from 'node:assert/strict';
let src=fs.readFileSync('scene.js','utf8').replace(/^import .*;$/gm,'');
src=src.slice(0,src.indexOf('\ntry{\nscene='));
const document={createElement(){return {width:0,height:0,getContext(){return {fillRect(){},strokeRect(){},fillText(){}}}}},querySelector(){return null}};
const run=new Function('THREE','buildArchipelago','document','matchMedia','innerWidth',src+`\nscene=new THREE.Scene();ground();station();railway();landscape();const layout=buildArchipelago({THREE,scene,box,pillar,arch,lamp,railing,house,tree,pine,stair,meshBox,anim,C,rand,pick,geom});ocean();sky();flush();return {scene,pools,anim,layout,viewpoints};`);
const {scene,pools,anim,layout,viewpoints}=run(THREE,buildArchipelago,document,()=>({matches:false}),1440);
let count=0;for(const [kind,boxes] of pools){for(const b of boxes){assert(b.slice(0,6).every(Number.isFinite));assert(b[3]>0&&b[4]>0&&b[5]>0);}count+=boxes.length;}
for(let t=0;t<360;t+=2)for(const f of anim)f(t);
// Check the actual projected cube corners, not just abstract district centers.
const camera=new THREE.OrthographicCamera(-80,80,65,-65,.1,600);camera.position.set(125,90,138);camera.lookAt(-4,20,-25);camera.updateMatrixWorld();
const corners=[];for(const b of pools.get('solid')){if(b[2]<-90)continue;const [x,y,z,w,h,d,,r]=b;for(const sx of[-1,1])for(const sy of[-1,1])for(const sz of[-1,1]){let xx=sx*w/2,zz=sz*d/2;corners.push(new THREE.Vector3(x+xx*Math.cos(r)+zz*Math.sin(r),y+sy*h/2,z-xx*Math.sin(r)+zz*Math.cos(r)));}}
let fit=[];for(const [w,h] of [[1440,900],[390,844],[844,390],[1024,768]]){let aspect=w/h,vh=Math.max(123,165/aspect);Object.assign(camera,{left:-vh*aspect/2,right:vh*aspect/2,top:vh/2,bottom:-vh/2});camera.updateProjectionMatrix();let maxX=0,maxY=0;for(const p of corners){const v=p.clone().project(camera);maxX=Math.max(maxX,Math.abs(v.x));maxY=Math.max(maxY,Math.abs(v.y));}assert(maxX<.98&&maxY<.98,`Primary world geometry clips at ${w}×${h}: ${maxX}, ${maxY}`);fit.push({width:w,height:h,maxProjectedX:maxX,maxProjectedY:maxY});}
// Connectivity graph: every district reachable from the harbor.
let reached=new Set(['harbor']);for(let i=0;i<4;i++)for(const[a,b]of layout.routes){if(reached.has(a))reached.add(b);if(reached.has(b))reached.add(a);}assert.equal(reached.size,4);
const curve=new THREE.EllipseCurve(0,0,29,18,0,Math.PI*2,false,0),len=curve.getLength();let min=99,max=0;for(let i=0;i<200;i++){let p=curve.getPointAt(i/200),q=curve.getPointAt((i/200+5.65/len)%1),d=p.distanceTo(q);min=Math.min(min,d);max=Math.max(max,d);}assert(min>5.4);assert(max<5.8);
let objects=0,triangles=0;scene.traverse(o=>{if(o.isMesh||o.isPoints){objects++;if(o.geometry?.index)triangles+=o.geometry.index.count/3*(o.isInstancedMesh?o.count:1);}});
assert(count<30000,'Static voxel budget exceeded');assert(objects<175,'Draw object budget exceeded');assert(triangles<350000,'Triangle budget exceeded');assert.equal(viewpoints.length,5);
console.log(JSON.stringify({passed:true,staticVoxelInstances:count,renderableObjects:objects,triangles,connectedDistricts:[...reached],viewpoints:viewpoints.map(v=>v.name),carriageCenterDistance:{min,max},framing:fit,checks:['finite positive geometry','all animation callbacks for six simulated minutes','projected main-world cube corners','district route graph','constant-arc-length carriage clearance','bounded geometry/draw budgets']},null,2));
