import { buildArchipelago } from './expanded-world.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
const $=s=>document.querySelector(s), reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let scene,camera,renderer,controls,composer,bloom,paused=reduced,orbit=false,quality=innerWidth>650,elapsed=0,frame=0,ready=false,needsRender=true,dayMode=0,dayBlend=0,viewMode=0;
const viewpoints=[{name:'世界',target:[-4,20,-25],offset:[129,70,163],span:123,width:165},{name:'港城',target:[0,13,0],offset:[64,32,70],span:67,width:88},{name:'星门',target:[-3,37,-55],offset:[54,28,67],span:67,width:82},{name:'林镇',target:[-56,20,-25],offset:[43,27,55],span:54,width:66},{name:'水庭',target:[43,11,-46],offset:[38,25,52],span:50,width:62}];
let sunlight,moonlight,ambient,hemi,oceanMat; const instanceMeshes=new Map();
const rand=(()=>{let a=821315;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}})();
const pick=a=>a[Math.floor(rand()*a.length)], clamp=THREE.MathUtils.clamp;
const C={stone:[0x476570,0x516e76,0x5b777b,0x3b5966,0x687e80],dark:[0x182f3c,0x203d49,0x294957,0x315460],edge:0x78918b,plaster:[0x96a994,0xb6b9a0,0x7d9990,0xabb1a0,0xc3bda1],wood:0x453f36,roof:[0x245e63,0x286d6e,0x327977,0x3c8580],gold:0xbd9456,light:0xffce78,cream:0xe5cd96,leaf:[0x163f3e,0x245a4b,0x337157,0x428465,0x648d66]};
const pools=new Map(), geom=new THREE.BoxGeometry(1,1,1), dummy=new THREE.Object3D(), anim=[], lights=[];
function box(x,y,z,w,h,d,col,kind='solid',rot=0){const key=kind;if(!pools.has(key))pools.set(key,[]);pools.get(key).push([x,y,z,w,h,d,col,rot]);}
function meshBox(parent,x,y,z,w,h,d,col,em=0){const m=new THREE.Mesh(geom,new THREE.MeshStandardMaterial({color:col,roughness:.77,emissive:em?col:0,emissiveIntensity:em}));m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;}
function flush(){for(const[k,list]of pools){let material=(k==='glow'||k==='moon'||k==='stars')?new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:2.1,roughness:.8}):k==='faint'?new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.32,depthWrite:false}):new THREE.MeshStandardMaterial({color:0xffffff,roughness:.91,metalness:k==='metal'?.4:0});if(['glow','moon','stars'].includes(k)){material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance *= vColor;');};}const mesh=new THREE.InstancedMesh(geom,material,list.length);list.forEach(([x,y,z,w,h,d,c,r],i)=>{dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.rotation.set(0,r,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new THREE.Color(c));});mesh.castShadow=k==='solid';mesh.receiveShadow=k==='solid';mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();scene.add(mesh);instanceMeshes.set(k,mesh);} }
function pillar(x,z,y,h,w=1.4){box(x,y+h/2,z,w,h,w,pick(C.stone));box(x,y+.2,z,w+.45,.4,w+.45,C.edge);box(x,y+h-.15,z,w+.45,.3,w+.45,C.edge);for(let i=1;i<h;i+=1.2)box(x,y+i,z,w+.08,.08,w+.08,0x354e59);}
function lamp(x,y,z,h=2.7){box(x,y+h/2,z,.12,h,.12,C.wood);box(x,y+h,z,.63,.15,.63,C.gold);box(x,y+h-.42,z,.40,.65,.40,C.light,'glow');box(x,y+h-.8,z,.62,.12,.62,C.gold);for(let i of[-1,1])for(let j of[-1,1])box(x+i*.24,y+h-.4,z+j*.24,.055,.75,.055,C.wood);}
function point(x,y,z,power=50,dist=12,color=0xffbb69){const l=new THREE.PointLight(color,power,dist,2);l.position.set(x,y,z);scene.add(l);lights.push(l);}
function railing(x,y,z,w,d){if(w>d){for(let a=-w/2;a<=w/2;a+=1.4)box(x+a,y+.6,z,.1,1.2,.1,C.gold);box(x,y+1.15,z,w,.12,.13,C.gold)}else{for(let a=-d/2;a<=d/2;a+=1.4)box(x,y+.6,z+a,.1,1.2,.1,C.gold);box(x,y+1.15,z,.13,.12,d,C.gold)}}
function windowFront(x,y,z,w=1,h=1.6){box(x,y,z,w+.3,h+.3,.2,C.wood);box(x,y,z+.13,w,h,.08,rand()>.16?C.light:0x21454c,rand()>.15?'glow':'solid');box(x,y,z+.2,.09,h+.05,.10,C.wood);box(x,y,z+.21,w+.06,.08,.10,C.wood);box(x,y-h/2-.15,z+.26,w+.5,.22,.46,C.cream);}
function windowSide(x,y,z,w=1,h=1.6){box(x,y,z,.2,h+.3,w+.3,C.wood);box(x+.13,y,z,.08,h,w,C.light,'glow');box(x+.2,y,z,.1,h,.08,C.wood);box(x+.2,y,z,.1,.08,w,C.wood);box(x+.2,y-h/2-.15,z,.4,.2,w+.5,C.cream);}
function roof(x,y,z,w,d,color=C.roof){let n=Math.ceil(w/.7);for(let i=0;i<n;i++){let xx=-w/2+(i+.5)*w/n;let h=(1-Math.abs(xx)/(w/2))*w*.55;box(x+xx,y+h,z,w/n+.02,.4,d+.8,pick(color));for(let a=-d/2;a<d/2;a+=.65)if(rand()>.48)box(x+xx,y+h+.22,z+a,w/n*.85,.08,.5,pick(color));}box(x,y+w*.55+.25,z,.28,.35,d+1.1,C.gold);box(x,y+w*.55+.57,z+d/2+.2,.25,.6,.25,C.gold);}
function house(x,y,z,w,h,d,tone){box(x,y+h/2,z,w,h,d,tone||pick(C.plaster));box(x,y+.16,z,w+.3,.32,d+.3,pick(C.stone));for(let i=0;i<=h;i+=2.5){box(x,y+i,z+d/2+.08,w+.15,.16,.16,C.wood);box(x+w/2+.08,y+i,z,.16,.16,d,C.wood);}for(let xx of[-w/2+.12,w/2-.12])box(x+xx,y+h/2,z+d/2+.12,.16,h,.14,C.wood);for(let yy=y+1.35;yy<y+h;yy+=2.5){for(let xx=x-w/2+1.15;xx<x+w/2-.5;xx+=1.7)windowFront(xx,yy,z+d/2+.14,.8,1.3);for(let zz=z-d/2+1.2;zz<z+d/2-.5;zz+=1.9)windowSide(x+w/2+.1,yy,zz,.8,1.3);}roof(x,y+h+.25,z,w+1,d);box(x-w*.27,y+h+1.6,z-d*.23,.7,3,.8,pick(C.stone));box(x-w*.27,y+h+3.12,z-d*.23,.9,.2,1,C.cream);}
function tree(x,y,z,s=1){box(x,y+1.5*s,z,.38*s,3*s,.38*s,0x59493a);for(let i=0;i<32;i++){let a=rand()*Math.PI*2,r=Math.sqrt(rand())*1.5*s,yy=rand()*2.1*s;box(x+Math.cos(a)*r,y+2*s+yy,z+Math.sin(a)*r,.65*s,.7*s,.65*s,pick(C.leaf));}}
function pine(x,y,z,s=1){box(x,y+2*s,z,.25*s,4*s,.25*s,0x514535);for(let j=0;j<6;j++){let w=(3-j*.4)*s;box(x,y+(1.2+j*.5)*s,z,w,.6*s,w,pick(C.leaf));box(x,y+(1.48+j*.5)*s,z,w*.7,.4*s,w*.7,pick(C.leaf));}}
function stair(x,y,z,w,count,dir=1){for(let i=0;i<count;i++)box(x,y+(i+1)*.16,z-i*.48*dir,w,(i+1)*.32,.5,pick(C.stone));}
function arch(x,y,z,w,h,depth,rot=0){const rows=Math.ceil(h/.48),step=h/rows;for(let j=0;j<rows;j++){let yy=(j+.5)*step;let gap=yy<h-w/2?w/2:Math.sqrt(Math.max(0,(w/2)**2-(yy-(h-w/2))**2));const sides=(w/2+.8)-gap;for(let sign of[-1,1]){let xx=sign*(gap+sides/2),wx=x+xx*Math.cos(rot),wz=z-xx*Math.sin(rot);box(wx,y+yy,wz,sides+.025,step+.025,depth,pick(C.stone),'solid',rot);}}}
function ground(){// Salt-worn, terraced foundations; irregular boundaries remain visible from all sides.
for(let x=-23;x<=23;x+=1.25)for(let z=-16;z<=14;z+=1.25){let r=(x/24)**2+(z/17)**2;if(r>1+(rand()-.5)*.1)continue;let h=3.5+(1-r)*2+rand()*.8;box(x,h/2-1.5,z,1.26,h,1.26,pick(C.dark));if(r<.92)box(x,h-1.4,z,1.27,.35,1.27,pick(C.stone));if(r>.8&&rand()>.5)box(x,h-1.1,z,.6,.18,.65,pick(C.leaf));}
box(-2,3.1,-3,35,6.2,20,C.stone[1]);box(-2,6.05,9.4,35,.8,5,C.stone[1]);box(-2,6.3,-3,35,.24,20,C.edge);box(-4,9.4,-7,21,6.2,11,C.stone[0]);box(-4,12.65,-7,21,.35,11,C.edge);
// Lower harbor retaining wall with true open arches.
for(let x=-19;x<21;x+=5.6){arch(x,.1,11.5,3.7,5.6,2);box(x,6,11.5,5.65,.6,2.3,C.edge);if(x<17)lamp(x+2.1,6.3,12,2);}
for(let i=0;i<54;i++){let x=rand()*44-22,z=rand()*29-15;if(Math.abs(x)>18||z<-12)pine(x,4,z,.7+rand()*.6);}
// Broad staircase from waterside promenade to the upper terraces.
stair(15,3.1,15.4,4.2,11);stair(10,6.3,6,3.2,20);box(8.6,12.6,-3.4,6,.35,2.4,C.edge);pillar(10,-3.4,6.3,6.1,.65);for(let i=0;i<10;i++){box(12.5,6.4+i*.64,5.8-i*.96,.28,.75,.28,C.edge);}
// Cargo quay, mooring bollards, wood grain planks.
for(let z=14;z<=25;z+=.48)box(4,1.05,z,13,.28,.43,pick([0x685946,0x7a6850,0x8c7859]));for(let x of[-2,10])for(let z of[15,20,24]){pillar(x,z,-1,2.3,.52);box(x,1.45,z,.25,.55,.25,0x213942)}railing(4,1.2,25.1,13,.1);stair(4,1.2,16.5,5,7);
for(let i=0;i<18;i++){let x=rand()*9-.5,z=rand()*7+17;box(x,1.65,z,.6+rand()*.7,.7,.7,pick([0x907655,0x6b6450,0xa08d66]));box(x,2.04,z,.5,.08,.7,0x3c493d);}
lamp(-2,1.3,24);lamp(10,1.3,24);point(5,4,20,100,15);
}
function station(){// Main train hall, stepped masonry and a luminous clerestory.
box(-2,10,-1,20,7.2,8,C.plaster[0]);box(-2,6.7,-1,21,.6,9,C.edge);for(let x=-11;x<7;x+=3){box(x,10,3.15,.55,7,.5,C.stone[2]);windowFront(x+1.4,9.1,3.2,1.55,2.6);windowFront(x+1.4,12,3.2,1.2,1.3);}
for(let i=0;i<19;i++){let t=(i-9)/9,yy=Math.sqrt(Math.max(0,1-t*t))*4;box(-2,13.5+yy,-1+t*4.9,21,.48,.57,pick(C.roof));for(let x=-11;x<8;x+=2.5)box(x,13.8+yy,-1+t*4.9,.12,.13,.65,C.gold);}
box(-2,17.7,-1,21,.35,.5,C.gold);for(let x=-11;x<9;x+=2.8){box(x,16.65,-1,1.75,1.15,1.2,C.wood);box(x,16.7,-.35,1.25,.7,.08,C.light,'glow');box(x,17.3,-1,2.1,.2,1.6,C.roof[3]);}
// Grand entrance and cantilever canopy with connected columns.
box(-1,7,6,18,.4,4.8,C.edge);for(let x=-9;x<=7;x+=4){pillar(x,7.7,7.1,3.4,.26);box(x,10.5,5.7,.18,.18,4.4,C.gold);}
box(-1,10.6,5.7,18.5,.25,4.5,C.roof[2]);for(let x=-10;x<8;x+=.6)box(x,10.8,5.7,.18,.1,4.6,C.gold);
// A station sign with tiny brass board and luminous pixel lettering via canvas texture.
const cv=document.createElement('canvas');cv.width=768;cv.height=128;const cx=cv.getContext('2d');cx.fillStyle='#152e35';cx.fillRect(0,0,768,128);cx.strokeStyle='#b2a17c';cx.lineWidth=5;cx.strokeRect(5,5,758,118);cx.fillStyle='#f6d99d';cx.font='46px serif';cx.textAlign='center';cx.fillText('潮 汐 终 点 站',384,63);cx.font='18px monospace';cx.fillText('T I D E   T E R M I N U S',384,99);const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.Mesh(new THREE.PlaneGeometry(6.8,1.14),new THREE.MeshStandardMaterial({map:tx,emissive:0xc9aa64,emissiveMap:tx,emissiveIntensity:.55}));sign.position.set(-1,11.8,3.65);scene.add(sign);
point(-3,10,7,170,18);point(10,14,-1,90,14);
// Two residential wings.
house(-16,6.5,-4,6,6.2,7);house(13,6.5,-5,5.5,8,6,C.plaster[3]);house(-13,12.85,-10,5,6.2,5);house(5,12.85,-10,5.5,6.6,5);
// Observatory tower on the upper terrace.
const x=-4,z=-8,y=13;box(x,y+8,z,6.4,16,6.4,C.plaster[1]);for(let yy=y;yy<30;yy+=3){box(x,yy,z,6.8,.34,6.8,C.stone[2]);for(let side of[-1,1])box(x+side*2.9,yy+1.4,z+3.3,.45,2.8,.4,C.stone[2]);if(yy<27){windowFront(x,yy+1.5,z+3.3,1.65,2.1);windowSide(x+3.3,yy+1.5,z,1.65,2.1)}}
box(x,29.6,z,8,.65,8,C.gold);box(x,30.1,z,8.8,.35,8.8,C.edge);for(let k=0;k<4;k++){let xx=x+(k%2?3.1:-3.1),zz=z+(k<2?3.1:-3.1);pillar(xx,zz,30.3,4.3,.4)}box(x,32.4,z,5.3,3.8,5.3,0x446967);for(let xx of[-1.7,0,1.7]){windowFront(x+xx,32.5,z+2.7,1.1,2.8);windowSide(x+2.7,32.5,z+xx,1.1,2.8)}box(x,34.7,z,8.4,.45,8.4,C.gold);for(let j=0;j<8;j++)box(x,35.1+j*.36,z,8.1-j*.9,.44,8.1-j*.9,pick(C.roof));box(x,38.5,z,.25,2.2,.25,C.gold);box(x,39.7,z,.48,.48,.48,C.light,'glow');point(x,33,z,170,18);
// A monumental luminous tide clock suspended in front of the tower.
const cx2=-4,cy=26.9,cz=-4.57,r=3.4;for(let ix=-8;ix<=8;ix++)for(let iy=-8;iy<=8;iy++){let rr=Math.hypot(ix,iy);if(rr<8.4&&rr>7.1)box(cx2+ix*.43,cy+iy*.43,cz,.44,.44,.34,C.gold);if(rr<7.15)box(cx2+ix*.43,cy+iy*.43,cz-.1,.43,.43,.1,0x122f37);}
for(let i=0;i<12;i++){let a=i*Math.PI/6;box(cx2+Math.sin(a)*2.78,cy+Math.cos(a)*2.78,cz+.23,.18,.30,.13,C.light,'glow');}box(cx2,cy+.85,cz+.28,.14,1.7,.13,C.light,'glow');box(cx2+.65,cy,cz+.29,1.3,.14,.14,C.light,'glow');box(cx2,cy,cz+.3,.34,.34,.2,C.cream);
// Rooftop garden and climbing ivy.
for(let i=0;i<100;i++){let xx=-14+rand()*20,zz=-12+rand()*2;box(xx,13+rand()*.5,zz,.45,.4,.5,pick(C.leaf));}for(let i=0;i<90;i++){let yy=rand()*12+13;box(-7.3-rand()*.4,yy,-4.7+rand()*.4,.3,.5,.38,pick(C.leaf));}
}
function railway(){// Elevated elliptical viaduct, solid piers under every span.
const rx=29,rz=18,y=8.3,segments=180;
for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2,x=Math.cos(a)*rx,z=Math.sin(a)*rz,rot=-Math.atan2(rz*Math.cos(a),-rx*Math.sin(a));box(x,y,z,1.7,.65,3.0,C.stone[0],'solid',rot);box(x,y+.38,z,1.8,.16,2.65,C.edge,'solid',rot);for(let side of[-1,1]){let off=side*.85;box(x+Math.cos(rot+Math.PI/2)*off,y+.56,z-Math.sin(rot+Math.PI/2)*off,1.8,.11,.11,0xa7a089,'metal',rot);}
if(i%2===0)box(x,y+.49,z,.23,.12,2.45,0x544e40,'solid',rot);
if(i%5===0){let nx=x*1.053,nz=z*1.065;box(nx,y+1,nz,.1,1.15,.1,C.gold);box(nx,y+1.56,nz,5.2,.10,.12,C.gold,'solid',rot);}
if(i%15===0){pillar(x,z,-1,9.2,1.8);box(x,7.7,z,3.1,1.1,3.1,C.stone[2]);lamp(x*1.055,y+.6,z*1.07,2.25);}
}
// Four carriages follow the track. Geometry lives in local groups.
const curve=new THREE.EllipseCurve(0,0,rx,rz,0,Math.PI*2,false,0), length=curve.getLength(); const cars=[];for(let n=0;n<4;n++){const g=new THREE.Group();meshBox(g,0,.6,0,5.1,1.6,2,0x214c4c);meshBox(g,0,1.55,0,5.25,.45,2.2,0x172f35);meshBox(g,0,-.16,0,4.8,.3,1.7,0x162931);meshBox(g,0,.05,0,5.1,.2,2.05,C.gold);for(let side of[-1,1])for(let xx=-1.65;xx<=1.7;xx+=1.1){meshBox(g,xx,.93,side*1.02,.72,.66,.08,C.light,2);meshBox(g,xx,.91,side*1.08,.045,.71,.03,C.wood);}for(let xx of[-1.7,1.7])for(let zz of[-.9,.9])meshBox(g,xx,-.36,zz,.65,.65,.25,0x142731);if(n===0){meshBox(g,2.58,.54,0,.1,.9,1.7,0x354c48);for(let zz of[-.65,.65])meshBox(g,2.64,.17,zz,.13,.23,.23,0xffe7af,3);meshBox(g,1.2,2.05,0,.7,.6,.6,0x233b3e)}scene.add(g);cars.push(g);}
anim.push(t=>{for(let n=0;n<cars.length;n++){let u=((t*.004+.185-n*5.65/length)%1+1)%1;let p=curve.getPointAt(u),dir=curve.getTangentAt(u);cars[n].position.set(p.x,y+1.30,p.y);cars[n].rotation.y=-Math.atan2(dir.y,dir.x);}});
// Telegraph masts and suspended wires.
for(let i=0;i<8;i++){let a=i/8*Math.PI*2,x=31*Math.cos(a),z=20*Math.sin(a);box(x,11.1,z,.16,5.5,.16,C.wood);box(x,13.4,z,2.3,.13,.13,C.wood);}
}
function landscape(){// Far lighthouse island, intimate foreground pavilion.
for(let x=31;x<42;x+=1.2)for(let z=-15;z<-5;z+=1.2)if(((x-36)/6)**2+((z+10)/5)**2<1){box(x,.1,z,1.25,3+rand(),1.25,pick(C.dark));box(x,2,z,1.25,.4,1.25,pick(C.leaf));}
for(let i=0;i<9;i++)box(36,2.3+i*.85,-10,4-i*.16,.87,4-i*.16,i%3===0?0x788e83:0xa8b2a0);box(36,10.2,-10,3.9,.4,3.9,C.gold);box(36,11.1,-10,2.7,1.4,2.7,C.light,'glow');for(let a of[-1,1])for(let b of[-1,1])box(36+a*1.4,11.2,-10+b*1.4,.18,1.8,.18,C.wood);for(let i=0;i<4;i++)box(36,12.2+i*.35,-10,4-i*.8,.36,4-i*.8,pick(C.roof));point(36,11.5,-10,80,13);
for(let i=0;i<14;i++)pine(33+rand()*7,2,-13+rand()*5,.7+rand()*.5);stair(37,2,-4.5,1.8,8);box(36,4.6,-8,4,.25,2.4,C.edge);
// Brick footbridge to the lighthouse, with stepped arch openings.
for(let i=0;i<4;i++){let x=21+i*3.8;arch(x,0,-8,2.1,4.2,1.8);box(x,4.5,-8,3.8,.4,2.3,C.edge);railing(x,4.7,-6.9,3.9,.1)}
// Far silhouettes, each still built from cubes.
for(let i=0;i<14;i++){let x=-105+i*14,z=-106-rand()*20,h=4+rand()*11;for(let j=0;j<4;j++)box(x,h*.5+j*1.3-1,z,7-j*1.1,h-j,6,pick(C.dark));}
// A small shrine island in front-left, framing the main city.
for(let x=-35;x<-26;x+=1.1)for(let z=16;z<25;z+=1.1)if(((x+30)/5)**2+((z-20)/5)**2<1){box(x,0,z,1.2,2.4+rand(),1.2,pick(C.dark));box(x,1.5,z,1.2,.4,1.2,pick(C.leaf));}
pine(-33,1.5,19,1.9);pine(-28,1.5,18,1.4);house(-30,1.8,21,3.8,3.5,3.8,C.plaster[1]);lamp(-27,1.7,23,2.4);point(-29,4,24,65,12);
// Mooring ropes and docking platforms along the west bank.
for(let z=5;z<13;z+=.5)box(-23,2.3,z,6,.2,.43,0x74654f);for(let z of[5,12])pillar(-25,z,-1,3.5,.5);lamp(-25,2.5,6);
// Terrace planters and potted plants around the entrance.
for(let x of[-12,-7,8,13]){box(x,7.1,8,1.6,1.1,1.5,0x796e54);tree(x,7.5,8,.75)}tree(17,6.7,0,1.4);tree(-17,6.6,2,1.6);tree(-9.2,13,-11.5,.7);
for(let i=0;i<22;i++){let x=-20+rand()*40,z=8+rand()*2;box(x,6.65,z,.35,.4,.35,0x9a8060);box(x,6.95,z,.5,.4,.5,pick(C.leaf));}
// Small human figures provide architectural scale.
for(let i=0;i<17;i++){let x=-10+rand()*20,z=4.2+rand()*3;box(x,7.55,z,.23,.56,.25,pick([0xbc7d50,0x294753,0x657e71,0xc0a371]));box(x,7.96,z,.22,.22,.22,0xd6b991);for(let k of[-1,1])box(x+k*.07,7.13,z,.08,.3,.09,0x203b43);}
}
function boat(x,z,s=1){let g=new THREE.Group();for(let j=0;j<4;j++)meshBox(g,0,j*.19,0,(4.8-j*.13)*s,.22*s,(1.2+j*.3)*s,0x554b37);meshBox(g,0,.8*s,0,3.7*s,.18*s,1.65*s,C.gold);meshBox(g,-.4,1.4*s,0,1.7*s,1.2*s,1.45*s,0x4d6861);meshBox(g,-.4,2.1*s,0,2*s,.25*s,1.8*s,C.roof[1]);for(let side of[-1,1])meshBox(g,-.25,1.55*s,side*.74*s,.75*s,.55*s,.05,C.light,2);meshBox(g,.8*s,2*s,0,.1,3*s,.1,C.gold);scene.add(g);anim.push(t=>{g.position.set(x+Math.sin(t*.05)*1.2,-.76+Math.sin(t*.8+x)*.055,z+Math.cos(t*.045)*.8);g.rotation.y=.5+Math.sin(t*.06)*.10;g.rotation.z=Math.sin(t*.5)*.012});}
function ocean(){const mat=new THREE.ShaderMaterial({uniforms:{time:{value:0},deep:{value:new THREE.Color(0x052c3d)},shallow:{value:new THREE.Color(0x146274)}},vertexShader:`varying vec3 vWorld;void main(){vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`uniform float time;uniform vec3 deep,shallow;varying vec3 vWorld;void main(){vec2 p=floor(vWorld.xz*1.8)/1.8;float w=sin(p.x*.22+p.y*.32+time*.4)*sin(p.y*.4-p.x*.08-time*.27);float r=pow(max(0.,w),12.);float d=clamp(length(p)/95.,0.,1.);vec3 c=mix(shallow,deep,.45+d*.45);c+=vec3(.07,.16,.18)*r;float glow=exp(-pow((p.x+3.)/15.,2.))*exp(-pow((p.y-23.)/20.,2.));c+=vec3(.09,.072,.025)*glow*max(0.,w);gl_FragColor=vec4(c,1.);}`,transparent:false});oceanMat=mat;let m=new THREE.Mesh(new THREE.PlaneGeometry(600,600),mat);m.rotation.x=-Math.PI/2;m.position.y=-.85;scene.add(m);anim.push(t=>mat.uniforms.time.value=t);
// Broken golden and cyan reflection marks on the tide.
for(let i=0;i<340;i++){let x=rand()*90-45,z=rand()*75-25;let near=(z>10&&z<38&&Math.abs(x)<30),col=near&&rand()>.58?0xbba168:0x398d98;box(x,-.79+rand()*.025,z,.25+rand()*1.4,.015,.045+rand()*.09,col,'faint');}
for(let i=0;i<3;i++)boat(i*15-13,29+i*4,.85+i*.1);
}
function sky(){// Voxel moon: silhouette cut from actual cubes, with a darkened lunar edge.
const mx=-92,my=39,mz=-59;for(let x=-10;x<=10;x++)for(let y=-10;y<=10;y++){let r=Math.hypot(x,y);if(r>10)continue;let col=r>9?0xb7c8a5:((x+2)**2+(y-2)**2<3||((x-4)**2+(y+3)**2<5))?0xc2c6a2:0xd9d4ac;box(mx+x*.7,my+y*.7,mz,.71,.71,.6,col,'moon');}
// Sparse voxel stars, absent close to the moon.
for(let i=0;i<100;i++){let x=rand()*230-115,y=rand()*65+35,z=-125-rand()*30;box(x,y,z,.08+rand()*.11,.1,.1,pick([0x90b6b6,0xc6cfb5,0x758f9b]),'stars')}
// Quiet drifting embers, all GPU-instanced.
const count=100;const g=new THREE.BufferGeometry(),p=new Float32Array(count*3);for(let i=0;i<count;i++){p[i*3]=rand()*60-30;p[i*3+1]=rand()*24+2;p[i*3+2]=rand()*38-15;}g.setAttribute('position',new THREE.BufferAttribute(p,3));let pts=new THREE.Points(g,new THREE.PointsMaterial({color:0xf8d78d,size:.065,transparent:true,opacity:.65,depthWrite:false}));scene.add(pts);anim.push(t=>{pts.rotation.y=Math.sin(t*.03)*.1;pts.position.y=Math.sin(t*.3)*.2});
}
const nightSky=new THREE.Color(0x071e2d),dawnSky=new THREE.Color(0x536b78),daySky=new THREE.Color(0x9dbfc5);
function updateDay(dt){const goal=dayMode/2;dayBlend+= (goal-dayBlend)*Math.min(1,dt*(reduced?100:1.8));let d=dayBlend;
let f=d<.5?d*2:(d-.5)*2;scene.background.copy(d<.5?nightSky:dawnSky).lerp(d<.5?dawnSky:daySky,f);scene.fog.color.copy(scene.background);scene.fog.density=.0027-d*.0009;
sunlight.intensity=1.15+d*2.1;sunlight.color.set(d<.7?0xffc489:0xffedd1);moonlight.intensity=3.5-d*1.5;ambient.intensity=.62+d*.35;hemi.intensity=1.55+d*.6;
for(const k of ['moon','stars']){const m=instanceMeshes.get(k);if(m)m.visible=d<.36;}const glow=instanceMeshes.get('glow');if(glow)glow.material.emissiveIntensity=2.1*(1-d*.86);
for(const l of lights){if(l.userData.base===undefined)l.userData.base=l.intensity;l.intensity=l.userData.base*(1-d*.93);}
if(oceanMat){oceanMat.uniforms.deep.value.set(0x052c3d).lerp(new THREE.Color(0x31737d),d);oceanMat.uniforms.shallow.value.set(0x146274).lerp(new THREE.Color(0x6bacad),d);}
bloom.strength=.38*(1-d*.65);renderer.toneMappingExposure=1.15-d*.1;}
function resize(){if(!renderer)return;let w=innerWidth,h=innerHeight,aspect=w/h;const v=viewpoints[viewMode];let vh=Math.max(v.span,v.width/aspect);camera.left=-vh*aspect/2;camera.right=vh*aspect/2;camera.top=vh/2;camera.bottom=-vh/2;camera.updateProjectionMatrix();const dpr=Math.min(devicePixelRatio,quality?1.5:1);renderer.setPixelRatio(dpr);renderer.setSize(w,h);composer.setPixelRatio(dpr);composer.setSize(w,h);needsRender=true;}
function applyView(){const v=viewpoints[viewMode];controls.target.fromArray(v.target);camera.position.fromArray(v.target).add(new THREE.Vector3(...v.offset));camera.zoom=1;camera.updateProjectionMatrix();controls.update();if(composer)resize();$('#view b').textContent=v.name;needsRender=true;}
function reset(){viewMode=0;applyView();}
function toast(s){$('#toast').textContent=s;$('#toast').style.opacity='1';clearTimeout(toast.id);toast.id=setTimeout(()=>$('#toast').style.opacity='0',2400)}
function fail(e){console.error(e);$('#veil').style.display='none';$('#error').hidden=false;$('#errormsg').textContent=e?.message?.includes('WebGL')?'浏览器暂时无法使用 WebGL。请开启硬件加速，或换一个支持 WebGL 2 的浏览器。':'场景加载遇到了问题。请重新打开此页。'}
try{
scene=new THREE.Scene();scene.background=new THREE.Color(0x071e2d);scene.fog=new THREE.FogExp2(0x0a2838,.0027);camera=new THREE.OrthographicCamera(-80,80,65,-65,.1,600);renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;$('#world').appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','三维夜航城。使用鼠标拖动或单指拖动环视。');renderer.domElement.tabIndex=0;
controls=new OrbitControls(camera,renderer.domElement);controls.addEventListener('change',()=>needsRender=true);controls.enableDamping=true;controls.dampingFactor=.065;controls.minZoom=.7;controls.maxZoom=4.5;controls.maxPolarAngle=Math.PI*.46;controls.minPolarAngle=Math.PI*.14;controls.enablePan=false;controls.rotateSpeed=.45;controls.zoomSpeed=.7;reset();
ambient=new THREE.AmbientLight(0x79b4c8,.62);scene.add(ambient);hemi=new THREE.HemisphereLight(0x90c5df,0x183b41,1.55);scene.add(hemi);const key=new THREE.DirectionalLight(0x9bdcdd,3.5);key.position.set(-70,130,-60);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-105,right:105,top:100,bottom:-100,near:1,far:300});key.shadow.bias=-.0004;key.shadow.normalBias=.12;moonlight=key;scene.add(key);const fill=new THREE.DirectionalLight(0xffc489,1.15);fill.position.set(60,70,80);sunlight=fill;scene.add(fill);
composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth/2,innerHeight/2),.38,.6,1.2);composer.addPass(bloom);composer.addPass(new OutputPass());
ground();station();railway();landscape();window.__WORLD_LAYOUT__=buildArchipelago({THREE,scene,box,pillar,arch,lamp,railing,house,tree,pine,stair,meshBox,anim,C,rand,pick,geom});ocean();sky();flush();renderer.shadowMap.enabled=quality;bloom.enabled=quality;resize();anim.forEach(f=>f(0));composer.render();ready=true;$('#veil').style.opacity='0';setTimeout(()=>$('#veil').remove(),800);
$('#pause').setAttribute('aria-pressed',String(paused));if(paused){$('#pause b').textContent='继续';$('#pause span').textContent='▷';$('#state').textContent='此刻停驻';}
$('#pause').onclick=()=>{paused=!paused;$('#pause').setAttribute('aria-pressed',String(paused));$('#pause b').textContent=paused?'继续':'暂停';$('#pause span').textContent=paused?'▷':'Ⅱ';$('#state').textContent=paused?'此刻停驻':'潮汐流动中';};
$('#view').onclick=()=>{viewMode=(viewMode+1)%viewpoints.length;orbit=false;$('#orbit').setAttribute('aria-pressed','false');applyView();toast(['眺望整片群岛','港城 · 最后一班列车','星门 · 潮汐的刻度','林镇 · 山脊上的灯火','水庭 · 石拱与瀑布'][viewMode]);};
$('#orbit').onclick=()=>{orbit=!orbit;$('#orbit').setAttribute('aria-pressed',String(orbit));};$('#reset').onclick=()=>{orbit=false;$('#orbit').setAttribute('aria-pressed','false');reset();toast('回到最初的夜色');};
$('#day').onclick=()=>{dayMode=(dayMode+1)%3;$('#day b').textContent=['夜色','晨曦','白昼'][dayMode];$('#day').setAttribute('aria-label','光影：'+['夜色','晨曦','白昼'][dayMode]);toast(['灯火重回蓝色潮汐','天光漫过车站屋顶','在白昼里重新认识这座城'][dayMode]);};
$('#quality b').textContent=quality?'精细':'轻盈';$('#quality').onclick=()=>{quality=!quality;$('#quality b').textContent=quality?'精细':'轻盈';renderer.shadowMap.enabled=quality;bloom.enabled=quality;resize();toast(quality?'精细画质':'轻盈画质 · 降低耗电');};
$('#capture').onclick=()=>{try{composer.render();renderer.domElement.toBlob(blob=>{if(!blob){toast('当前浏览器未能保存画面');return;}let a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='夜航·潮汐终点站.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('已保存这一刻的夜色');},'image/png');}catch(e){toast('请使用浏览器截图保存画面')}};
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;$('#error').hidden=false;$('#errormsg').textContent='图形连接被中断。点击下方按钮重新点亮。';});window.addEventListener('resize',resize);renderer.domElement.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();$('#pause').click()}if(e.key.toLowerCase()==='r')$('#reset').click();});document.addEventListener('visibilitychange',()=>last=performance.now());let last=performance.now(),lastRender=0;function render(now){requestAnimationFrame(render);if(!ready||document.hidden||now-lastRender<1000/(quality?45:30))return;lastRender=now;let dt=Math.min((now-last)/1000,.05);last=now;if(!paused){elapsed+=dt;anim.forEach(f=>f(elapsed));}if(orbit&&!paused){let offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),dt*.045);camera.position.copy(controls.target).add(offset)}controls.update();const lightChanging=Math.abs(dayMode/2-dayBlend)>.0005;if(paused&&!needsRender&&!lightChanging)return;updateDay(dt);composer.render();needsRender=false;frame++;}requestAnimationFrame(render);
// Read-only diagnostics support reproducible verification and graceful bug reports.
window.__NOCTURNE__={get stats(){return {ready,paused,orbit,quality,frame,elapsed,instances:[...pools.values()].reduce((a,b)=>a+b.length,0),sceneObjects:scene.children.filter(o=>o.isMesh||o.isPoints).length,view:viewpoints[viewMode].name,webgl:renderer.capabilities.isWebGL2}},get camera(){return camera.position.toArray()}};
}catch(e){fail(e)}
