import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
try {
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.toneMapping=THREE.AgXToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#102432');
const camera=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,.1,150);camera.position.set(19,16,25);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,3.5,0);controls.enableDamping=true;controls.minDistance=13;controls.maxDistance=50;controls.maxPolarAngle=Math.PI*.48;controls.autoRotate=false;controls.autoRotateSpeed=.5;
scene.add(new THREE.HemisphereLight(0xa4cfea,0x17272e,2.0));
function light(c,i,pos){const l=new THREE.DirectionalLight(c,i);l.position.set(...pos);scene.add(l);return l;}
const key=light(0xffd5a2,3.5,[-5,15,10]);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-13,right:13,top:13,bottom:-13,near:.1,far:60});key.shadow.normalBias=.025;light(0x65bde8,2,[10,10,-8]);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x173043,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.73;floor.receiveShadow=true;scene.add(floor);
const bytes=Uint8Array.from(atob(document.getElementById('model-data').textContent.trim()),c=>c.charCodeAt(0));
new GLTFLoader().parse(bytes.buffer,'',g=>{g.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});scene.add(g.scene);document.getElementById('status').textContent='拖动旋转 · 滚轮缩放 · 双指缩放';window.artworkReady=true;},e=>{document.getElementById('status').textContent='模型未能加载：'+e;window.artworkError=String(e);});
document.getElementById('rotate').onclick=()=>{controls.autoRotate=!controls.autoRotate;document.getElementById('rotate').textContent=controls.autoRotate?'暂停环绕':'自动环绕';};
document.getElementById('reset').onclick=()=>{camera.position.set(19,16,25);controls.target.set(0,3.5,0);controls.update();};
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);}animate();

const dl=document.getElementById('download');dl.onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([bytes],{type:'model/gltf-binary'}));a.download='tidal_post.glb';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
} catch(e) {document.getElementById('status').textContent='此浏览器无法启动 3D。请使用支持 WebGL 2 的桌面浏览器，或打开包内主图。';console.error(e);}
