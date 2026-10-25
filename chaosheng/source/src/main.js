import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { createWorld, WATER } from './world.js';
import { CoastalAmbience } from './ambience.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile=()=>innerWidth<768;
const nextFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
const progress=(percent,label)=>{$('#loading-progress').style.width=`${percent}%`;$('#loading-label').textContent=label;};
let toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3200);}

const moods={
  morning:{label:'海风初醒',time:'08:20',bg:'#dce9e2',sun:'#fff2d5',sky:'#e4f1f0',ground:'#8a9274',sunPower:3.0,hemi:1.65,exposure:1.02,water:'#267e86',shore:'#79c3ae',window:'#3e6665',emission:0.025,bloom:0.055,angle:[-45,80,30]},
  sunset:{label:'日落之前',time:'17:40',bg:'#dce3d9',sun:'#ffd2a1',sky:'#d9e7de',ground:'#79785e',sunPower:3.1,hemi:1.45,exposure:1.04,water:'#277e80',shore:'#77bda5',window:'#597975',emission:0.15,bloom:0.09,angle:[-48,48,55]},
  night:{label:'灯火与星海',time:'21:10',bg:'#122f3e',sun:'#a3c5e3',sky:'#8baec6',ground:'#48626b',sunPower:1.15,hemi:1.05,exposure:1.02,water:'#153e56',shore:'#347f85',window:'#ffd39a',emission:1.5,bloom:0.3,angle:[-45,70,45]},
};

async function init(){
  progress(12,'雕刻岩壁与海岸');await nextFrame();
  const embeddedModel=document.getElementById('embedded-model');
  if(embeddedModel){
    const bytes=Uint8Array.from(atob(embeddedModel.textContent.trim()),c=>c.charCodeAt(0));
    $('.model-link').href=URL.createObjectURL(new Blob([bytes],{type:'application/octet-stream'}));
    $('.model-link').download='潮生-TIDEBORN.vox';
  }
  const world=createWorld();
  $('#voxel-count').textContent=world.boxes.length.toLocaleString('en-US');
  $('#fact-boxes').textContent=world.boxes.length.toLocaleString('en-US');
  $('#fact-buildings').textContent=String(world.stats.buildings).padStart(2,'0');
  progress(35,'为小镇盖好每一片屋瓦');await nextFrame();
  const stage=$('#stage');
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(moods.sunset.bg);
  scene.fog=new THREE.Fog(moods.sunset.bg,190,370);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile()?1.65:2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.04;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.info.autoReset=false;
  stage.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','《潮生》实时三维体素场景');

  const camera=new THREE.OrthographicCamera(-70,70,48,-48,0.1,500);
  camera.position.set(99,104,121);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.target.set(0,11,0);controls.enableDamping=true;controls.dampingFactor=0.065;
  controls.minZoom=0.65;controls.maxZoom=5.4;controls.minPolarAngle=0.25;controls.maxPolarAngle=Math.PI*0.48;
  controls.zoomSpeed=0.7;controls.rotateSpeed=0.6;controls.panSpeed=0.7;controls.autoRotateSpeed=0.45;
  controls.screenSpacePanning=true;controls.update();

  const hemi=new THREE.HemisphereLight(moods.sunset.sky,moods.sunset.ground,1.45);scene.add(hemi);
  const sun=new THREE.DirectionalLight(moods.sunset.sun,3.1);sun.position.set(-48,48,55);
  sun.castShadow=true;sun.shadow.mapSize.set(mobile()?2048:4096,mobile()?2048:4096);
  Object.assign(sun.shadow.camera,{left:-76,right:76,top:75,bottom:-75,near:1,far:240});
  sun.shadow.normalBias=0.04;sun.shadow.bias=-0.00012;sun.shadow.radius=3;sun.target.position.set(0,4,0);
  scene.add(sun,sun.target);
  const fill=new THREE.DirectionalLight('#bdd7d3',0.7);fill.position.set(45,30,-30);scene.add(fill);

  const materials={
    solid:new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0,flatShading:true}),
    window:new THREE.MeshStandardMaterial({color:moods.sunset.window,roughness:0.5,emissive:'#ffb855',emissiveIntensity:0.15}),
    beacon:new THREE.MeshStandardMaterial({color:'#ffe4ac',roughness:0.3,emissive:'#ffd080',emissiveIntensity:1.1}),
    waterfall:new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.35,emissive:'#91beab',emissiveIntensity:0.1}),
    foam:new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,transparent:true,opacity:0.6,depthWrite:false}),
  };
  const cube=new THREE.BoxGeometry(1,1,1);
  const animatedGroups=new Map();
  world.animations.forEach(a=>{
    const group=new THREE.Group();group.name=a.id;group.position.fromArray(a.p);group.rotation.set(...a.r);
    animatedGroups.set(a.id,group);
  });
  world.animations.forEach(a=>{
    const group=animatedGroups.get(a.id);
    (a.parent?animatedGroups.get(a.parent):scene).add(group);
  });
  const batches=new Map();
  world.boxes.forEach(b=>{const key=`${b.g||'terrain'}:${b.k}`;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(b);});
  const dummy=new THREE.Object3D(),color=new THREE.Color();
  for(const batch of batches.values()){
    const first=batch[0];
    const mesh=new THREE.InstancedMesh(cube,materials[first.k],batch.length);
    mesh.name=`${first.g||'island'}-${first.k}`;
    batch.forEach((b,i)=>{
      dummy.position.fromArray(b.p);dummy.scale.fromArray(b.s);dummy.rotation.set(...b.r);dummy.updateMatrix();
      mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,color.set(first.k==='window'?'#ffffff':b.c));
    });
    mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;
    mesh.castShadow=!['foam','waterfall','beacon','window'].includes(first.k);
    mesh.receiveShadow=first.k==='solid';
    mesh.computeBoundingSphere();
    (first.g?animatedGroups.get(first.g):scene).add(mesh);
  }

  world.labels.forEach(sign=>{
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
    const ctx=canvas.getContext('2d');ctx.fillStyle=sign.color;ctx.font='600 78px "Avenir Next", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(sign.text,256,69,460);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(sign.w,sign.h),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));
    mesh.position.fromArray(sign.p);scene.add(mesh);
  });

  progress(60,'把海风、潮汐和光放进来');await nextFrame();
  // Banded edges make the sea itself a collectible, cut-away diorama.
  function addBox(x,y,z,w,h,d,c,receive=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:c,roughness:1}));m.position.set(x,y,z);m.receiveShadow=receive;scene.add(m);return m;}
  const seaSides=[
    addBox(0,-3.25,0,94,3.1,78,'#235b65'),
    addBox(0,-1.3,0,94,0.8,78,'#387c7c'),
    addBox(0,-0.65,0,94,0.5,78,'#438d88'),
  ];
  const base=addBox(0,-5.05,0,94.7,0.65,78.7,'#536859');base.castShadow=true;
  addBox(0,-4.68,0,94.25,0.13,78.25,'#9eac91');
  const floorMat=new THREE.ShadowMaterial({color:'#28514e',opacity:0.19});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),floorMat);floor.rotation.x=-Math.PI/2;floor.position.y=-5.7;floor.receiveShadow=true;scene.add(floor);

  // A discrete distance field yields pixel-stepped shallows and shore foam.
  const fw=188,fh=156,dist=new Float32Array(fw*fh).fill(120);
  for(let z=0;z<fh;z++)for(let x=0;x<fw;x++){
    const wx=Math.floor(x/2-47),wz=Math.floor(z/2-39);
    if(world.heights.has(`${wx},${wz}`))dist[z*fw+x]=0;
  }
  for(let pass=0;pass<2;pass++){
    const forward=pass===0;
    for(let zz=0;zz<fh;zz++)for(let xx=0;xx<fw;xx++){
      const x=forward?xx:fw-1-xx,z=forward?zz:fh-1-zz,i=z*fw+x;
      const dx=forward?-1:1,dz=forward?-1:1;
      if(x+dx>=0&&x+dx<fw)dist[i]=Math.min(dist[i],dist[i+dx]+1);
      if(z+dz>=0&&z+dz<fh)dist[i]=Math.min(dist[i],dist[i+dz*fw]+1);
      if(x+dx>=0&&x+dx<fw&&z+dz>=0&&z+dz<fh)dist[i]=Math.min(dist[i],dist[i+dx+dz*fw]+1.4142);
    }
  }
  const field=new Uint8Array(fw*fh);dist.forEach((d,i)=>field[i]=Math.min(255,Math.round(d*4)));
  const fieldTexture=new THREE.DataTexture(field,fw,fh,THREE.RedFormat);fieldTexture.needsUpdate=true;
  fieldTexture.minFilter=fieldTexture.magFilter=THREE.NearestFilter;
  const waterMat=new THREE.ShaderMaterial({
    uniforms:{uTime:{value:0},uField:{value:fieldTexture},uDeep:{value:new THREE.Color(moods.sunset.water)},uShore:{value:new THREE.Color(moods.sunset.shore)},uNight:{value:0}},
    vertexShader:`varying vec2 vUv; varying vec3 vWorld; void main(){vUv=uv;vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`,
    fragmentShader:`uniform float uTime;uniform sampler2D uField;uniform vec3 uDeep;uniform vec3 uShore;uniform float uNight;varying vec2 vUv;varying vec3 vWorld;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 st=vec2((vWorld.x+47.)/94.,(vWorld.z+39.)/78.);
        float d=texture2D(uField,st).r*255./8.;
        vec2 q=floor(vWorld.xz*1.6)/1.6;
        float wave=sin(q.x*.57+uTime*.38)*sin(q.y*.62-uTime*.27);
        float grain=hash(floor(vWorld.xz*2.));
        vec3 col=mix(uDeep,uShore,exp(-d*.19)*.83);
        col*=.96+grain*.075+wave*.026;
        float ripple=step(.92,wave)*(.38+hash(q)*.6);
        col=mix(col,vec3(.67,.85,.76),ripple*.18*(1.-uNight*.6));
        float foam=step(.55,d)*step(d,1.25+sin(uTime*.62+q.x*.3+q.y*.45)*.3);
        float breakers=step(2.1,d)*step(d,2.4)*step(.35,sin(q.x*.6+q.y*.7+uTime*.3));
        col=mix(col,vec3(.75,.85,.71),max(foam*.64,breakers*.22)*(1.-uNight*.64));
        float glint=step(.985,hash(floor(vWorld.xz*.8)))*max(0.,sin(uTime*.8+grain*30.));
        col+=vec3(.15,.18,.13)*glint*(1.-uNight*.7);
        gl_FragColor=vec4(col,1.);
      }`,
  });
  const water=new THREE.Mesh(new THREE.PlaneGeometry(94,78),waterMat);water.rotation.x=-Math.PI/2;water.position.y=0.015;scene.add(water);
  const seaShadow=new THREE.Mesh(new THREE.PlaneGeometry(94,78),new THREE.ShadowMaterial({color:'#143f47',opacity:0.25}));
  seaShadow.rotation.x=-Math.PI/2;seaShadow.position.y=0.035;seaShadow.receiveShadow=true;scene.add(seaShadow);

  // A geometric beam sweeps the sea at night.
  const beamPivot=new THREE.Group();beamPivot.position.set(-14,37.55,-18);scene.add(beamPivot);
  const beamMaterial=new THREE.ShaderMaterial({
    uniforms:{uOpacity:{value:0}},transparent:true,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform float uOpacity;varying vec2 vUv;void main(){float edge=pow(abs(sin(vUv.x*12.56637)),.7);float fade=pow(vUv.y,1.7);gl_FragColor=vec4(vec3(1.,.83,.52),uOpacity*edge*fade);}',
  });
  const beam=new THREE.Mesh(new THREE.ConeGeometry(6,42,4,1,true),beamMaterial);beam.rotation.z=Math.PI/2;beam.position.x=21;beamPivot.add(beam);
  const beaconLight=new THREE.PointLight('#ffd18a',5,20,2);beaconLight.position.set(-14,37.5,-18);scene.add(beaconLight);
  const townLights=[];
  for(const p of [[-17,8,1],[2,8,3],[12,4,10],[-20,3,15]]){const l=new THREE.PointLight('#ffbd71',0,15,2);l.position.set(p[0],p[1]+2,p[2]);scene.add(l);townLights.push(l);}
  const starPositions=[];
  for(let i=0;i<100;i++) {const a=i*2.39996,r=60+(i%11)*3;starPositions.push(Math.cos(a)*r,35+(i%17)*2.5,Math.sin(a)*r-25);}
  const starGeo=new THREE.BufferGeometry();starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));
  const starMat=new THREE.PointsMaterial({color:'#e7e8ce',size:0.17,transparent:true,opacity:0,depthWrite:false,sizeAttenuation:true});
  const stars=new THREE.Points(starGeo,starMat);scene.add(stars);

  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const ssao=new SSAOPass(scene,camera,1,1,mobile()?8:16);ssao.kernelRadius=1.6;ssao.minDistance=0.0007;ssao.maxDistance=0.045;composer.addPass(ssao);
  const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),0.09,0.35,1.3);composer.addPass(bloom);
  composer.addPass(new OutputPass());composer.addPass(new SMAAPass());

  const views=[
    {target:[0,11,0],offset:[99,93,121],zoom:1},
    {target:[-14,29.5,-18],offset:[35,23,46],zoom:2.8},
    {target:[-6,3.8,16],offset:[35,28,47],zoom:2.25},
    {target:[26,13.7,-9],offset:[17,20,55],zoom:3.2},
    {target:[0,11.3,-1.5],offset:[29,25,43],zoom:3},
  ];
  let view=0,tween=null,moodKey='sunset',moodTween=null,touring=false,lastTime=performance.now(),elapsed=0,ready=false;
  let frameCost=0,framePeriod=0,frameCount=0,performanceReduced=false,exporting=false,lastMobile=mobile(),frameSize=94;
  const scratch=new THREE.Vector3();
  const fromColor=new THREE.Color();
  function resize(){
    if(exporting)return;
    const {width,height}=stage.getBoundingClientRect();
    const pixelRatio=Math.min(devicePixelRatio,mobile()?1.65:2,performanceReduced?1.4:2);
    if(renderer.getPixelRatio()!==pixelRatio){renderer.setPixelRatio(pixelRatio);composer.setPixelRatio(pixelRatio);}
    renderer.setSize(width,height);composer.setSize(width,height);
    const aspect=width/height,size=mobile()?Math.max(134,134/aspect):Math.max(94,136/aspect);
    if(view>0)camera.zoom=THREE.MathUtils.clamp(camera.zoom*size/frameSize,controls.minZoom,controls.maxZoom);
    frameSize=size;
    if(lastMobile!==mobile()&&view===0){camera.zoom=mobile()?1.38:1;lastMobile=mobile();}
    camera.left=-size*aspect/2;camera.right=size*aspect/2;camera.top=size/2;camera.bottom=-size/2;
    camera.updateProjectionMatrix();
    ssao.setSize(Math.round(width*renderer.getPixelRatio()),Math.round(height*renderer.getPixelRatio()));
  }
  resize();new ResizeObserver(resize).observe(stage);

  function setTour(active){
    if(active&&reducedMotion){toast('已遵循系统的减少动态设置，可拖动查看海岛');return;}
    touring=active;controls.autoRotate=active;
    $('#tour-button').setAttribute('aria-pressed',String(active));$('#tour-label').textContent=active?'停在这一刻':'随海风环游';
    if(active){hideStory();if(view!==0)setView(0,false,false);toast('镜头正在环岛，拖动画面即可停下');}
  }
  function hideStory(){document.body.classList.remove('story-open');$('#story').classList.remove('visible');$('#story').setAttribute('aria-hidden','true');$('#story').inert=true;}
  function showStory(landmark){
    $('#story-subtitle').textContent=landmark.subtitle;$('#story-title').textContent=landmark.title;
    $('#story-body').textContent=landmark.body;$('#story-detail').textContent=landmark.detail;
    $('#story').classList.add('visible');$('#story').setAttribute('aria-hidden','false');$('#story').inert=false;document.body.classList.add('story-open');
  }
  function setView(index,story=true,stopTour=true){
    if(stopTour)setTour(false);
    view=index;const v=views[index];
    const target=new THREE.Vector3(...v.target),position=target.clone().add(new THREE.Vector3(...v.offset));
    const factor=mobile()?(index===0?1.38:1.6):(index===0?1:frameSize/94);
    const zoom=THREE.MathUtils.clamp(v.zoom*factor,controls.minZoom,controls.maxZoom);
    tween={start:performance.now(),duration:reducedMotion?1:1600,fromTarget:controls.target.clone(),toTarget:target,fromPosition:camera.position.clone(),toPosition:position,fromZoom:camera.zoom,toZoom:zoom};
    $$('[data-view]').forEach(el=>{const active=Number(el.dataset.view)===index;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});
    const landmark=world.landmarks.find(l=>l.view===index);
    if(story&&landmark)showStory(landmark);else hideStory();
  }
  const markerElements=world.landmarks.map(l=>{
    const button=document.createElement('button');button.className='landmark';button.setAttribute('aria-label',`探索${l.title}`);
    const dot=document.createElement('span');dot.className='landmark-dot';
    const name=document.createElement('span');name.className='landmark-name';name.textContent=l.title;
    button.append(dot,name);button.addEventListener('click',()=>setView(l.view));$('#landmarks').append(button);return{button,l};
  });
  function updateMarkers(){
    const rect=stage.getBoundingClientRect();
    for(const {button,l} of markerElements){
      scratch.fromArray(l.p).project(camera);
      const x=rect.left+(scratch.x+1)*rect.width/2,y=rect.top+(1-scratch.y)*rect.height/2;
      const visible=view===0&&!touring&&scratch.z<1&&x>20&&x<innerWidth-20&&y>90&&y<innerHeight-125;
      button.style.display=visible?'flex':'none';
      if(visible){button.style.left=`${x}px`;button.style.top=`${y}px`;}
    }
  }
  function setMood(key,instant=false){
    moodKey=key;const m=moods[key];
    const start={bg:scene.background.clone(),sun:sun.color.clone(),sky:hemi.color.clone(),ground:hemi.groundColor.clone(),water:waterMat.uniforms.uDeep.value.clone(),shore:waterMat.uniforms.uShore.value.clone(),window:materials.window.color.clone(),sunPower:sun.intensity,hemi:hemi.intensity,exposure:renderer.toneMappingExposure,emission:materials.window.emissiveIntensity,bloom:bloom.strength,night:waterMat.uniforms.uNight.value,position:sun.position.clone()};
    moodTween={start:performance.now(),duration:instant||reducedMotion?1:1800,from:start,to:m};
    document.documentElement.dataset.mood=key;$('#mood-label').textContent=m.label;$('#scene-time').textContent=m.time;
    $$('[data-mood][aria-pressed]').forEach(el=>{const active=el.dataset.mood===key;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});
    $('meta[name="theme-color"]').setAttribute('content',m.bg);
  }
  function updateMood(now){
    if(!moodTween)return;
    const t=Math.min(1,(now-moodTween.start)/moodTween.duration),e=t*t*(3-2*t),{from:f,to:m}=moodTween;
    for(const [dest,initial,target] of [[scene.background,f.bg,m.bg],[scene.fog.color,f.bg,m.bg],[sun.color,f.sun,m.sun],[hemi.color,f.sky,m.sky],[hemi.groundColor,f.ground,m.ground],[waterMat.uniforms.uDeep.value,f.water,m.water],[waterMat.uniforms.uShore.value,f.shore,m.shore],[materials.window.color,f.window,m.window]])dest.copy(initial).lerp(fromColor.set(target),e);
    const lerp=(a,b)=>a+(b-a)*e;
    sun.intensity=lerp(f.sunPower,m.sunPower);hemi.intensity=lerp(f.hemi,m.hemi);renderer.toneMappingExposure=lerp(f.exposure,m.exposure);
    materials.window.emissiveIntensity=lerp(f.emission,m.emission);bloom.strength=lerp(f.bloom,m.bloom);
    const night=lerp(f.night,moodKey==='night'?1:0);waterMat.uniforms.uNight.value=night;
    beamMaterial.uniforms.uOpacity.value=night*0.032;beaconLight.intensity=5+night*85;starMat.opacity=night*0.75;
    materials.beacon.emissiveIntensity=1.1+night*1.3;townLights.forEach(l=>l.intensity=night*30);
    sun.position.copy(f.position).lerp(scratch.fromArray(m.angle),e);
    seaShadow.material.opacity=0.24-night*0.05;
    seaSides.forEach((mesh,i)=>mesh.material.color.set(['#235b65','#387c7c','#438d88'][i]).lerp(fromColor.set('#122f47'),night*0.6));
    if(t===1)moodTween=null;
  }
  function updateLife(t){
    waterMat.uniforms.uTime.value=t;
    beamPivot.rotation.y=t*0.17;
    for(const a of world.animations){
      const group=animatedGroups.get(a.id);
      switch(a.type){
        case 'mill':group.rotation.z=-t*0.13;break;
        case 'boat':
          group.position.y=a.p[1]+Math.sin(t*0.75+a.phase)*0.1;
          group.rotation.x=Math.sin(t*0.65+a.phase)*0.015;group.rotation.z=Math.sin(t*0.8+a.phase)*0.018;break;
        case 'person':{
          const n=(Math.sin(t*0.12+a.phase)+1)/2;
          group.position.set(a.p[0]+(a.end[0]-a.p[0])*n,a.p[1]+Math.sin(t*4+a.phase)*0.025,a.p[2]+(a.end[2]-a.p[2])*n);
          group.rotation.y=Math.atan2(a.end[0]-a.p[0],a.end[2]-a.p[2])+(Math.cos(t*0.12+a.phase)<0?Math.PI:0);break;
        }
        case 'bird':{
          const a0=t*0.1+a.phase;
          group.position.x=a.p[0]+Math.cos(a0)*a.radius*2;
          group.position.z=a.p[2]+Math.sin(a0)*a.radius;
          group.position.y=a.p[1]+Math.sin(t*0.3+a.phase)*0.7;
          group.rotation.y=-a0-Math.PI/2;break;
        }
        case 'wing':group.rotation.z=Math.sin(t*3.5+a.phase)*0.3*a.side;break;
      }
    }
  }
  // Damp input cancels a camera flight immediately, without snapping back.
  controls.addEventListener('start',()=>{tween=null;if(touring)setTour(false);});
  $('#tour-button').addEventListener('click',()=>setTour(!touring));
  $$('[data-view]').forEach(el=>el.addEventListener('click',()=>setView(Number(el.dataset.view))));
  $$('[data-mood][aria-pressed]').forEach(el=>el.addEventListener('click',()=>setMood(el.dataset.mood)));
  $('#reset-view').addEventListener('click',()=>setView(0));
  $('.brand').addEventListener('click',e=>{e.preventDefault();setView(0);});
  $('#story-close').addEventListener('click',hideStory);
  for(const [selector,factor] of [['#zoom-in',1.25],['#zoom-out',0.8]])$(selector).addEventListener('click',()=>{
    tween=null;camera.zoom=THREE.MathUtils.clamp(camera.zoom*factor,controls.minZoom,controls.maxZoom);camera.updateProjectionMatrix();
  });
  $('#fullscreen-button').addEventListener('click',async()=>{
    try{if(document.fullscreenElement)await document.exitFullscreen();else await $('#app').requestFullscreen();}catch{toast('当前浏览器暂不支持全屏，请使用浏览器全屏功能');}
  });
  const ambience=new CoastalAmbience();
  $('#sound-button').addEventListener('click',async()=>{
    try{const active=await ambience.toggle();$('#sound-button').setAttribute('aria-pressed',String(active));$('#sound-label').textContent=active?'海风已开启':'海风音景';}
    catch{toast('音景暂时无法开启，请检查浏览器的音频设置');}
  });
  let lastFocus;
  function setAbout(open){
    $('#about-panel').classList.toggle('open',open);$('#about-panel').setAttribute('aria-hidden',String(!open));$('#about-panel').inert=!open;
    $('#about-button').setAttribute('aria-expanded',String(open));$('#panel-backdrop').hidden=!open;
    if(open){lastFocus=document.activeElement;$('#about-close').focus();}else lastFocus?.focus();
  }
  $('#about-button').addEventListener('click',()=>setAbout(true));$('#about-close').addEventListener('click',()=>setAbout(false));$('#panel-backdrop').addEventListener('click',()=>setAbout(false));
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){setAbout(false);hideStory();return;}
    if($('#about-panel').classList.contains('open')){
      if(e.key==='Tab'){const els=$$('#about-panel button, #about-panel a');if(e.shiftKey&&document.activeElement===els[0]){e.preventDefault();els.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===els.at(-1)){e.preventDefault();els[0].focus();}}
      return;
    }
    if(e.target.closest('button,a,input'))return;
    if('12345'.includes(e.key))setView(Number(e.key)-1);
    if(e.key.toLowerCase()==='r')setView(0);
    if(e.key.toLowerCase()==='m'){const keys=Object.keys(moods);setMood(keys[(keys.indexOf(moodKey)+1)%3]);}
  });

  // Export at a genuine larger render resolution, rather than scaling a screenshot.
  async function capture(download=true){
    if(exporting)return;
    exporting=true;$('#capture-button').disabled=true;
    const rect=stage.getBoundingClientRect(),ratio=renderer.getPixelRatio();
    try{
      toast('正在冲印这一刻…');await nextFrame();
      const w=3200,h=Math.round(w*rect.height/rect.width);
      renderer.setPixelRatio(1);renderer.setSize(w,h,false);composer.setPixelRatio(1);composer.setSize(w,h);
      composer.render();
      const print=document.createElement('canvas');print.width=w;print.height=h;
      const ctx=print.getContext('2d');ctx.drawImage(renderer.domElement,0,0);
      ctx.fillStyle=moodKey==='night'?'#d9ddc9':'#314940';ctx.font='500 33px "PingFang SC",sans-serif';ctx.fillText('潮生  /  TIDEBORN',65,h-75);
      ctx.globalAlpha=0.65;ctx.font='14px "Avenir Next",sans-serif';ctx.fillText('AN ORIGINAL VOXEL DIORAMA  ·  2026',67,h-44);
      const blob=await new Promise(resolve=>print.toBlob(resolve,'image/png'));
      if(!blob)throw new Error('PNG 编码失败');
      if(download){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`潮生-TIDEBORN-${moodKey}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('画面已冲印，愿你喜欢这段海岸');}
      return blob;
    }catch(error){console.error(error);toast('画面保存失败，请稍后重试');throw error;}
    finally{renderer.setPixelRatio(ratio);composer.setPixelRatio(ratio);exporting=false;resize();$('#capture-button').disabled=false;}
  }
  $('#capture-button').addEventListener('click',()=>capture().catch(()=>{}));

  function animate(now){
    requestAnimationFrame(animate);
    if(document.hidden||exporting){lastTime=now;return;}
    const interval=now-lastTime,delta=Math.min(interval/1000,0.05);lastTime=now;if(!reducedMotion)elapsed+=delta;
    updateMood(now);
    if(tween){
      const t=Math.min(1,(now-tween.start)/tween.duration),e=t<0.5?4*t*t*t:1-(-2*t+2)**3/2;
      controls.target.lerpVectors(tween.fromTarget,tween.toTarget,e);camera.position.lerpVectors(tween.fromPosition,tween.toPosition,e);
      camera.zoom=tween.fromZoom+(tween.toZoom-tween.fromZoom)*e;camera.updateProjectionMatrix();
      if(t===1)tween=null;
    }
    controls.update(delta);updateLife(elapsed);updateMarkers();
    // SSAO's inverse projection must follow orthographic zoom.
    ssao.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(camera.projectionMatrix);
    ssao.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);
    const before=performance.now();renderer.info.reset();composer.render();
    if(ready&&frameCount<180&&interval<250){frameCost+=performance.now()-before;framePeriod+=interval;frameCount++;}
    if(frameCount===180&&!performanceReduced&&framePeriod/frameCount>45){
      performanceReduced=true;ssao.enabled=false;renderer.setPixelRatio(Math.min(1.4,devicePixelRatio));composer.setPixelRatio(renderer.getPixelRatio());resize();
    }
  }
  progress(83,'点亮灯塔，等待第一艘船');await nextFrame();
  updateLife(0);setMood(matchMedia('(prefers-color-scheme: dark)').matches?'night':'sunset',true);
  setView(0,false);tween=null;camera.zoom=mobile()?1.38:1;camera.updateProjectionMatrix();controls.update();
  await renderer.compileAsync(scene,camera);
  composer.render();
  progress(100,'海岛已就绪');await nextFrame();
  $('#loading').classList.add('done');setTimeout(()=>$('#loading').hidden=true,750);
  ready=true;requestAnimationFrame(animate);

  // Small read-only diagnostics and explicit actions support reproducible QA.
  window.__TIDEBORN__={world,scene,camera,renderer,controls,composer,
    setView,setMood,capture,
    diagnostics:()=>({ready,boxes:world.boxes.length,stats:world.stats,view,mood:moodKey,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,pixelRatio:renderer.getPixelRatio(),ssao:ssao.enabled,meanRenderMs:frameCount?Math.round(frameCost/frameCount*10)/10:0,meanFrameMs:frameCount?Math.round(framePeriod/frameCount*10)/10:0,cameraZoom:camera.zoom,exporting,audioEnabled:ambience.enabled,reducedMotion}),
  };
}

init().catch(error=>{
  console.error('Tideborn could not start:',error);$('#loading').hidden=true;$('#fatal-error').hidden=false;
  $('#error-message').textContent=`${error.message||'请使用支持 WebGL 2 的浏览器重新打开。'}`;
});
$('#retry-button').addEventListener('click',()=>location.reload());
