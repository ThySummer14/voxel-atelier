/** Expanded archipelago: coherent districts, bridges and a monumental tide gate.
 * All visual elements are genuine geometry; all repeated static cubes use the
 * scene's shared instancing pools. Coordinates use Y as elevation. */
export function buildArchipelago(A){
  const {THREE,scene,box,pillar,arch,lamp,railing,house,tree,pine,stair,meshBox,anim,C,rand,pick,geom}=A;
  const districts=[];
  function island(cx,cz,rx,rz,height,palette=C.dark){
    const step=2;
    for(let x=-rx;x<=rx;x+=step)for(let z=-rz;z<=rz;z+=step){
      const r=(x/rx)**2+(z/rz)**2;if(r>1+.035*Math.sin(x*1.7+z*.8))continue;
      const top=r<.63?height:Math.round((height-(r-.63)*height*.74)/1.5)*1.5;
      box(cx+x,(top-1)/2,cz+z,2.03,top+1,2.03,pick(palette));
      box(cx+x,top+.09,cz+z,2.04,.24,2.04,pick(r>.72?C.leaf:C.stone));
      if(r>.68){for(let y=1.5;y<top;y+=3.2)box(cx+x,y,cz+z,2.09,.22,2.09,pick(C.stone));if(rand()>.65)box(cx+x,top+.36,cz+z,.5,.5,.55,pick(C.leaf));}
    }
    districts.push({cx,cz,rx,rz,height});
  }
  function terrace(x,z,w,d,h){box(x,h/2,z,w,h,d,C.stone[0]);box(x,h+.15,z,w+.6,.3,d+.6,C.edge);for(let yy=2;yy<h;yy+=3)box(x,yy,z,w+.12,.14,d+.12,0x344e5a);}
  function bridge(x1,z1,y1,x2,z2,y2,width=3.4,spans=4,rail=false){
    const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz),rot=-Math.atan2(dz,dx),nx=-dz/len,nz=dx/len,span=len/spans;
    for(let i=0;i<spans;i++){
      const u=(i+.5)/spans,x=x1+dx*u,z=z1+dz*u,y=y1+(y2-y1)*u;
      arch(x,-.7,z,span-1.4,Math.max(2,y+.45),width*.67,rot);
      box(x,y,z,span+.08,.52,width,C.stone[1],'solid',rot);
      for(const side of[-1,1]){box(x+nx*width*.48*side,y+1.08,z+nz*width*.48*side,span,.12,.12,C.gold,'solid',rot);for(let j=-span/2+.3;j<span/2;j+=1.7)box(x+dx/len*j+nx*width*.48*side,y+.55,z+dz/len*j+nz*width*.48*side,.12,1.1,.12,C.gold);}
      if(i%2===0)lamp(x+nx*width*.46,y+.3,z+nz*width*.46,2.4);
    }
    // Level steps keep the graded pedestrian deck physically continuous.
    for(let i=0;i<=Math.ceil(len/.6);i++){const n=Math.ceil(len/.6),u=i/n,x=x1+dx*u,z=z1+dz*u,y=y1+(y2-y1)*u;box(x,y+.35,z,len/n+.03,.2,width*.9,C.edge,'solid',rot);}
    if(rail)for(let i=0;i<Math.ceil(len/.9);i++){const n=Math.ceil(len/.9),u=(i+.5)/n,x=x1+dx*u,z=z1+dz*u,y=y1+(y2-y1)*u;box(x,y+.55,z,.16,.12,width*.8,C.wood,'solid',rot);for(let side of[-1,1])box(x+nx*.62*side,y+.65,z+nz*.62*side,len/n+.1,.1,.1,0x8f9e98,'metal',rot);}
    return {x1,z1,y1,x2,z2,y2,width};
  }
  // DISTRICT I: the original harbor is the lowest, most intimate layer.
  // Its rear causeway climbs through the valley into the new civic plateau.
  island(-4,-52,29,24,17);
  terrace(-4,-52,35,29,17);
  terrace(-13,-36,8,9,17);terrace(-25,-43,11,5,17);terrace(20,-49,7,5,17);
  bridge(-13,-13,6.5,-13,-34,17,4.2,4,true);
  // Entry gate where the rising line lands. Its opening remains truly empty.
  arch(-13,17,-35,4.5,6,1.8);box(-13,23.4,-35,8,.6,2.3,C.gold);
  box(-13,24,-35,6.8,.5,3.0,C.roof[2]);
  // The civic promenade has a readable fork: west to residences, east to temple.
  for(let z=-35;z>=-47;z-=.6)box(-13,17.35,z,4,.13,.53,C.stone[3]);
  for(let x=-15;x<=14;x+=.6)box(x,17.35,-43,.53,.13,3.8,C.stone[3]);
  for(let x of[-17,-9,1,10])lamp(x,17.4,-41.5,3.3);
  // Houses form a single stepped neighborhood, leaving the approach legible.
  for(const h of[
    [-23,-47,5.6,6.5,6],[-21,-57,5.8,9,6.2],[-13,-64,5.5,6,5.5],
    [15,-44,5.4,7.7,6],[17,-55,5.8,9.5,6],[10,-67,5.5,6.5,5.5]
  ]){terrace(h[0],h[1],h[2]+1.8,h[4]+1.8,17);house(h[0],17.3,h[1],h[2],h[3],h[4],pick(C.plaster));}
  for(const p of[[-24,-38],[-24,-63],[19,-63],[19,-38],[-8,-69],[3,-69]]){terrace(p[0],p[1],3.4,3.4,17);tree(p[0],17.3,p[1],1.25);}
  // MONUMENT: a tide-calibration gate, mechanically anchored to a sanctuary.
  // A stepped vertical void, visible from both sides, gives the world its crest.
  terrace(-3,-55,23,17,20);
  for(let j=0;j<4;j++)box(-3,20.5+j*.6,-55,25-j*1.5,.65,18-j*.8,C.stone[2]);
  for(const sx of[-1,1]){
    box(-3+sx*9.2,28.5,-55,3.5,14,8,C.stone[1]);
    for(let yy=23;yy<35;yy+=2.1){box(-3+sx*9.2,yy,-55,3.8,.3,8.3,C.gold);box(-3+sx*9.2,yy+1,-50.9,1.25,1.25,.1,C.light,'glow');}
    for(let j=0;j<4;j++)box(-3+sx*(11-j*.4),24+j*2.1,-55,2.2,2.3,8,C.stone[0]);
  }
  box(-3,35.3,-55,23,.6,8.8,C.edge);
  // Sanctuary colonnade under the monumental opening.
  for(let x=-11;x<=5;x+=4){pillar(x,-50.7,22.8,10,.6);box(x,27.2,-51,2.0,5.8,.13,0x163e4a);box(x,27.2,-50.88,.7,4.8,.08,C.light,'glow');}
  stair(-3,17.4,-35.8,8.2,17);box(-3,22.9,-44,9,.3,4.5,C.edge);
  // Fine voxel stone/bronze bands. Ring plane is XY; no transparent fake cutout.
  const gate={x:-3,y:49,z:-55,r:13.3,cell:.7};
  for(let ix=-21;ix<=21;ix++)for(let iy=-21;iy<=21;iy++){
    const r=Math.hypot(ix*.7,iy*.7);
    if(r>14.6||r<11.2)continue;
    const col=r>14?C.gold:r<11.8?0x6fbab6:pick(C.stone);
    box(gate.x+ix*.7,gate.y+iy*.7,gate.z,.71,.71,2.8,col);
    if(r>12.25&&r<12.8)box(gate.x+ix*.7,gate.y+iy*.7,gate.z+1.44,.59,.59,.10,0xa1e6d4,'glow');
    if(r>13.2&&r<13.8&&iy%4===0)box(gate.x+ix*.7,gate.y+iy*.7,gate.z+1.45,.3,.3,.16,C.gold);
  }
  // Bronze cardinal brackets and long, very thin astronomical crosshairs.
  for(const a of[0,Math.PI/2,Math.PI,Math.PI*1.5]){
    const x=gate.x+Math.sin(a)*13.2,y=gate.y+Math.cos(a)*13.2;
    box(x,y,gate.z+1.6,Math.abs(Math.sin(a))>0?2.6:.55,Math.abs(Math.cos(a))>0?2.6:.55,.5,C.gold);
  }
  box(gate.x,gate.y,gate.z,.13,22.2,.15,C.gold);box(gate.x,gate.y,gate.z,22.2,.13,.15,C.gold);
  box(gate.x,gate.y,gate.z+1,.85,.85,.8,C.light,'glow');
  const motes=new THREE.InstancedMesh(geom,new THREE.MeshBasicMaterial({color:0xe2cc8e}),18),tmp=new THREE.Object3D();
  scene.add(motes);anim.push(t=>{for(let i=0;i<18;i++){let a=i/18*Math.PI*2+t*.035;tmp.position.set(gate.x+Math.sin(a)*10.1,gate.y+Math.cos(a)*10.1,gate.z+1.7);tmp.scale.set(.18,.18,.18);tmp.updateMatrix();motes.setMatrixAt(i,tmp.matrix);}motes.instanceMatrix.needsUpdate=true;});
  // A cliffside mill garden breaks the long retaining face with a real water route.
  terrace(8,-34,7,7,17);box(8,17.45,-34,5.5,.18,5.5,0x3a8590);
  for(const x of[4.8,11.2])box(x,17.7,-34,.45,.9,7,C.edge);
  box(8,17.7,-37.2,7,.9,.45,C.edge);
  // Open outflow lip and vertical stream, never an unsupported horizontal sheet.
  box(8,17.45,-29.8,4.4,.22,1.8,0x72b7bf);box(5.7,17,-29.8,.5,1,2,C.stone[2]);box(10.3,17,-29.8,.5,1,2,C.stone[2]);
  const upperFall=new THREE.InstancedMesh(geom,new THREE.MeshBasicMaterial({color:0x89c8c8,transparent:true,opacity:.4,depthWrite:false}),96);scene.add(upperFall);
  anim.push(t=>{for(let i=0;i<96;i++){const lane=i%6,row=Math.floor(i/6),drop=(row*1.1+t*2.5)%17.7;tmp.position.set(6.15+lane*.72,16.9-drop,-28.7);tmp.scale.set(.43,.78,.24);tmp.updateMatrix();upperFall.setMatrixAt(i,tmp.matrix);}upperFall.instanceMatrix.needsUpdate=true;});
  // Terraces and vines relieve the fortress-scale cliff without random scattering.
  for(const x of[-24,-18,0,15,20]){box(x,8.2,-30.5,3,.6,2.8,C.stone[2]);for(let i=0;i<8;i++)box(x+(rand()-.5)*2.5,8.7+rand()*.4,-30.5+(rand()-.5)*2,.45,.6,.5,pick(C.leaf));}
  for(let i=0;i<120;i++){let x=14+rand()*5,y=4+rand()*11;box(x,y,-30.6,.32,.45,.26,pick(C.leaf));}
  // DISTRICT II: forest ridge town, a counterweight on the left of the harbor.
  island(-55,-25,22,16,11);
  terrace(-55,-25,29,18,11);terrace(-39,-22,6,6,11);terrace(-40,-32,5,5,11);
  bridge(-27,-7,6.4,-37,-21,11,3.3,3);
  bridge(-40,-32,11,-29,-43,17,3.3,3);
  for(const h of[[-65,-22,5,6,5],[-56,-17,5.3,6.8,5],[-44,-25,5.5,6.2,5.5],[-47,-35,4.6,5.6,5]]){terrace(h[0],h[1],h[2]+1,h[4]+1,11);house(h[0],11.3,h[1],h[2],h[3],h[4]);}
  // Chapel with a connected bell tower and tiered roof silhouette.
  terrace(-60,-30,9,11,11);house(-60,11.3,-30,7,8,9,C.plaster[1]);
  box(-57,24,-31,3.2,10,3.2,C.plaster[1]);for(let j=0;j<8;j++)box(-57,29+j*.5,-31,4.5-j*.48,.55,4.5-j*.48,pick(C.roof));box(-57,33.2,-31,.18,2.2,.18,C.gold);
  for(let yy of[22,26]){box(-57,yy,-29.35,1.3,1.8,.12,C.wood);box(-57,yy,-29.27,.85,1.4,.08,C.light,'glow');}
  for(const p of[[-70,-24],[-68,-33],[-64,-37],[-53,-34],[-46,-18],[-59,-13]]){terrace(p[0],p[1],3.2,3.2,11);pine(p[0],11.3,p[1],1.8);}
  for(let x=-66;x<-44;x+=4){lamp(x,11.3,-18.5,2.8);box(x,11.6,-19.5,1.1,.65,.7,0x7d7258);}
  // DISTRICT III: broken aqueduct and reservoir, a quieter distant silhouette.
  island(43,-47,14,19,8);
  terrace(43,-47,14,23,8);terrace(34,-47,7,5,8);
  bridge(21,-49,17,32,-47,8,3.0,3);
  for(let z=-58;z<=-35;z+=5.7){arch(44,8,z,3.9,11,1.9,Math.PI/2);box(44,19.4,z,3,.7,5.7,C.edge);for(let sx of[-1,1])box(44+sx*1.25,20,z,.27,.7,5.7,C.stone[1]);}
  // Reservoir crown receives the aqueduct and sends a stepped cascade seaward.
  box(43,8.5,-33,10,1,8,C.stone[2]);box(43,9.05,-33,8,.12,6,0x3a8590);
  for(const x of[38.3,47.7])box(x,9.5,-33,.6,1.2,8,C.edge);
  // Small maintenance house explains why warm windows exist at the far end.
  house(39,8.3,-57,4.2,5,5.4,C.plaster[2]);lamp(39,8.3,-53,2.8);
  for(const p of[[49,-58],[51,-44],[38,-39],[47,-64]]){terrace(p[0],p[1],3,3,8);pine(p[0],8.3,p[1],1.6);}
  // Cascades use one instanced mesh. Discrete shimmering segments move inside a
  // bounded waterfall volume; no full-screen particle storms or extra lights.
  const falls=new THREE.InstancedMesh(geom,new THREE.MeshBasicMaterial({color:0x79c4c8,transparent:true,opacity:.46,depthWrite:false}),60);scene.add(falls);
  anim.push(t=>{for(let i=0;i<60;i++){const lane=i%6,row=Math.floor(i/6),drop=(row*.92+t*2.1)%9.2;tmp.position.set(40.8+lane*.75,8.7-drop,-28.65+Math.sin(i*4.1)*.15);tmp.scale.set(.38,.55+Math.sin(i)*.15,.22);tmp.updateMatrix();falls.setMatrixAt(i,tmp.matrix);}falls.instanceMatrix.needsUpdate=true;});
  // A small funicular connects harbor and highland on the inclined causeway.
  const tram=new THREE.Group();meshBox(tram,0,.7,0,2.4,1.7,3.2,0x41685e);meshBox(tram,0,1.7,0,2.7,.3,3.5,C.roof[0]);meshBox(tram,0,.95,1.64,1.6,.7,.06,C.light,1.5);for(let side of[-1,1])meshBox(tram,side*1.23,.95,0,.06,.7,2,C.light,1.5);meshBox(tram,0,-.28,0,2,.4,2.7,0x18303a);scene.add(tram);
  anim.push(t=>{const u=(1-Math.cos(t*.045))*.5;tram.position.set(-13,7.5+10.5*u,-13-21*u);tram.rotation.x=-Math.atan2(10.5,21);});
  // Route lamps visually join the districts, not isolated decorative objects.
  for(const p of[[-19,-39],[-8,-42],[9,-43]])lamp(p[0],17.3,p[1],2.7);
  return {districts,gate,routes:[['harbor','highland'],['harbor','forest'],['forest','highland'],['highland','aqueduct']],landmarks:[[-3,64,-55],[-57,34,-31],[44,20,-47]]};
}
