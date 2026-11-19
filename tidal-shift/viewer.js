/* 潮线交班 / Tidal Shift · gpt-6.2 sol. Source: source/src/. Licenses: THIRD_PARTY_NOTICES.txt. */
(()=>{var li={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},ci={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},zc=0,$a=1,Gc=2;var wi=1,Vc=2,cs=3,hi=0,Le=1,on=2,Ti=0,hs=1,Ei=2,ja=3,Qa=4,kc=5;var Ai=100,Hc=101,Wc=102,Xc=103,qc=104,Yc=200,Zc=201,Jc=202,Kc=203,tl=204,el=205,$c=206,jc=207,Qc=208,th=209,eh=210,nh=211,ih=212,sh=213,rh=214,Gr=0,Vr=1,kr=2,ji=3,Hr=4,Wr=5,Xr=6,qr=7,mo=0,oh=1,ah=2,an=0,nl=1,il=2,sl=3,rl=4,ol=5,al=6,ll=7;var cl=300,Ri=301,us=302,go=303,_o=304,Yr=1e3,Sn=1001,Zr=1002,Ee=1003,lh=1004;var tr=1005;var Ae=1006,xo=1007;var Gn=1008;var Ge=1009,hl=1010,ul=1011,ds=1012,yo=1013,gn=1014,ln=1015,en=1016,vo=1017,Mo=1018,Ci=1020,dl=35902,fl=35899,pl=1021,ml=1022,_n=1023,Fn=1026,Vn=1027,So=1028,bo=1029,ui=1030,wo=1031;var To=1033,er=33776,nr=33777,ir=33778,sr=33779,Eo=35840,Ao=35841,Ro=35842,Co=35843,Po=36196,Io=37492,Lo=37496,Do=37488,No=37489,rr=37490,Uo=37491,Fo=37808,Oo=37809,Bo=37810,zo=37811,Go=37812,Vo=37813,ko=37814,Ho=37815,Wo=37816,Xo=37817,qo=37818,Yo=37819,Zo=37820,Jo=37821,Ko=36492,$o=36494,jo=36495,Qo=36283,ta=36284,or=36285,ea=36286;var Ps=2300,Jr=2301,Br=2302,Ha=2303,Wa=2400,Xa=2401,qa=2402;var ch=3200;var na=0,hh=1,kn="",je="srgb",Is="srgb-linear",Ls="linear",ne="srgb";var zr=7680;var uh=519,dh=512,fh=513,ph=514,gl=515,mh=516,gh=517,_l=518,xl=519,_h=35044;var yl="300 es",rn=2e3,Qi=2001;function Bu(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function zu(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Ds(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function xh(){let i=Ds("canvas");return i.style.display="block",i}var fc={},ts=null;function vl(...i){let t="THREE."+i.shift();ts?ts("log",t,...i):console.log(t,...i)}function yh(i){let t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Dt(...i){i=yh(i);let t="THREE."+i.shift();if(ts)ts("warn",t,...i);else{let e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function Ot(...i){i=yh(i);let t="THREE."+i.shift();if(ts)ts("error",t,...i);else{let e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function As(...i){let t=i.join(" ");t in fc||(fc[t]=!0,Dt(...i))}function vh(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var Mh={[Gr]:Gr,[kr]:Xr,[Hr]:Hr,[ji]:Wr,[Vr]:Vr,[Xr]:kr,[qr]:qr,[Wr]:ji},mn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}},Oe=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],pc=1234567,Rs=Math.PI/180,Si=180/Math.PI;function fs(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Oe[i&255]+Oe[i>>8&255]+Oe[i>>16&255]+Oe[i>>24&255]+"-"+Oe[t&255]+Oe[t>>8&255]+"-"+Oe[t>>16&15|64]+Oe[t>>24&255]+"-"+Oe[e&63|128]+Oe[e>>8&255]+"-"+Oe[e>>16&255]+Oe[e>>24&255]+Oe[n&255]+Oe[n>>8&255]+Oe[n>>16&255]+Oe[n>>24&255]).toLowerCase()}function qt(i,t,e){return Math.max(t,Math.min(e,i))}function Ml(i,t){return(i%t+t)%t}function Gu(i,t,e,n,s){return n+(i-t)*(s-n)/(e-t)}function Vu(i,t,e){return i!==t?(e-i)/(t-i):0}function Cs(i,t,e){return(1-e)*i+e*t}function ku(i,t,e,n){return Cs(i,t,1-Math.exp(-e*n))}function Hu(i,t=1){return t-Math.abs(Ml(i,t*2)-t)}function Wu(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*(3-2*i))}function Xu(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*i*(i*(i*6-15)+10))}function qu(i,t){return i+Math.floor(Math.random()*(t-i+1))}function Yu(i,t){return i+Math.random()*(t-i)}function Zu(i){return i*(.5-Math.random())}function Ju(i){i!==void 0&&(pc=i);let t=pc+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Ku(i){return i*Rs}function $u(i){return i*Si}function ju(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function Qu(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Sl(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function td(i,t,e,n,s){let r=Math.cos,o=Math.sin,a=r(e/2),l=o(e/2),c=r((t+n)/2),u=o((t+n)/2),p=r((t-n)/2),h=o((t-n)/2),f=r((n-t)/2),g=o((n-t)/2);switch(s){case"XYX":i.set(a*u,l*p,l*h,a*c);break;case"YZY":i.set(l*h,a*u,l*p,a*c);break;case"ZXZ":i.set(l*p,l*h,a*u,a*c);break;case"XZX":i.set(a*u,l*g,l*f,a*c);break;case"YXY":i.set(l*f,a*u,l*g,a*c);break;case"ZYZ":i.set(l*g,l*f,a*u,a*c);break;default:Dt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function bl(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Sh(i,t){if(t.constructor===Float32Array)return i;let e=bl(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/e,-1)}function bh(i,t){if(t.constructor===Float32Array)return i;let e=bl(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*e)}var wl={DEG2RAD:Rs,RAD2DEG:Si,generateUUID:fs,clamp:qt,euclideanModulo:Ml,mapLinear:Gu,inverseLerp:Vu,lerp:Cs,damp:ku,pingpong:Hu,smoothstep:Wu,smootherstep:Xu,randInt:qu,randFloat:Yu,randFloatSpread:Zu,seededRandom:Ju,degToRad:Ku,radToDeg:$u,isPowerOfTwo:ju,ceilPowerOfTwo:Qu,floorPowerOfTwo:Sl,setQuaternionFromProperEuler:td,normalize:bh,denormalize:Sh},Nt=class{static{this.prototype.isVector2=!0}constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=qt(this.x,t.x,e.x),this.y=qt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=qt(this.x,t,e),this.y=qt(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(qt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(qt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Qe=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let l=n[s+0],c=n[s+1],u=n[s+2],p=n[s+3],h=r[o+0],f=r[o+1],g=r[o+2],v=r[o+3];if(p!==v||l!==h||c!==f||u!==g){let m=l*h+c*f+u*g+p*v;m<0&&(h=-h,f=-f,g=-g,v=-v,m=-m);let d=1-a;if(m<.9995){let M=Math.acos(m),T=Math.sin(M);d=Math.sin(d*M)/T,a=Math.sin(a*M)/T,l=l*d+h*a,c=c*d+f*a,u=u*d+g*a,p=p*d+v*a}else{l=l*d+h*a,c=c*d+f*a,u=u*d+g*a,p=p*d+v*a;let M=1/Math.sqrt(l*l+c*c+u*u+p*p);l*=M,c*=M,u*=M,p*=M}}t[e]=l,t[e+1]=c,t[e+2]=u,t[e+3]=p}static multiplyQuaternionsFlat(t,e,n,s,r,o){let a=n[s],l=n[s+1],c=n[s+2],u=n[s+3],p=r[o],h=r[o+1],f=r[o+2],g=r[o+3];return t[e]=a*g+u*p+l*f-c*h,t[e+1]=l*g+u*h+c*p-a*f,t[e+2]=c*g+u*f+a*h-l*p,t[e+3]=u*g-a*p-l*h-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(s/2),p=a(r/2),h=l(n/2),f=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=h*u*p+c*f*g,this._y=c*f*p-h*u*g,this._z=c*u*g+h*f*p,this._w=c*u*p-h*f*g;break;case"YXZ":this._x=h*u*p+c*f*g,this._y=c*f*p-h*u*g,this._z=c*u*g-h*f*p,this._w=c*u*p+h*f*g;break;case"ZXY":this._x=h*u*p-c*f*g,this._y=c*f*p+h*u*g,this._z=c*u*g+h*f*p,this._w=c*u*p-h*f*g;break;case"ZYX":this._x=h*u*p-c*f*g,this._y=c*f*p+h*u*g,this._z=c*u*g-h*f*p,this._w=c*u*p+h*f*g;break;case"YZX":this._x=h*u*p+c*f*g,this._y=c*f*p+h*u*g,this._z=c*u*g-h*f*p,this._w=c*u*p-h*f*g;break;case"XZY":this._x=h*u*p-c*f*g,this._y=c*f*p-h*u*g,this._z=c*u*g+h*f*p,this._w=c*u*p+h*f*g;break;default:Dt("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],u=e[6],p=e[10],h=n+a+p;if(h>0){let f=.5/Math.sqrt(h+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(n>a&&n>p){let f=2*Math.sqrt(1+n-a-p);this._w=(u-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>p){let f=2*Math.sqrt(1+a-n-p);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+u)/f}else{let f=2*Math.sqrt(1+p-n-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(qt(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,u=e._w;return this._x=n*u+o*a+s*c-r*l,this._y=s*u+o*l+r*a-n*c,this._z=r*u+o*c+n*l-s*a,this._w=o*u-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=this.dot(t);a<0&&(n=-n,s=-s,r=-r,o=-o,a=-a);let l=1-e;if(a<.9995){let c=Math.acos(a),u=Math.sin(c);l=Math.sin(l*c)/u,e=Math.sin(e*c)/u,this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},U=class{static{this.prototype.isVector3=!0}constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(mc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(mc.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*s-a*n),u=2*(a*e-r*s),p=2*(r*n-o*e);return this.x=e+l*c+o*p-a*u,this.y=n+l*u+a*c-r*p,this.z=s+l*p+r*u-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=qt(this.x,t.x,e.x),this.y=qt(this.y,t.y,e.y),this.z=qt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=qt(this.x,t,e),this.y=qt(this.y,t,e),this.z=qt(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(qt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return ba.copy(this).projectOnVector(t),this.sub(ba)}reflect(t){return this.sub(ba.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(qt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},ba=new U,mc=new Qe,Bt=class{static{this.prototype.isMatrix3=!0}constructor(t,e,n,s,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c)}set(t,e,n,s,r,o,a,l,c){let u=this.elements;return u[0]=t,u[1]=s,u[2]=a,u[3]=e,u[4]=r,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],p=n[7],h=n[2],f=n[5],g=n[8],v=s[0],m=s[3],d=s[6],M=s[1],T=s[4],S=s[7],A=s[2],E=s[5],_=s[8];return r[0]=o*v+a*M+l*A,r[3]=o*m+a*T+l*E,r[6]=o*d+a*S+l*_,r[1]=c*v+u*M+p*A,r[4]=c*m+u*T+p*E,r[7]=c*d+u*S+p*_,r[2]=h*v+f*M+g*A,r[5]=h*m+f*T+g*E,r[8]=h*d+f*S+g*_,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],u=t[8];return e*o*u-e*a*c-n*r*u+n*a*l+s*r*c-s*o*l}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],u=t[8],p=u*o-a*c,h=a*l-u*r,f=c*r-o*l,g=e*p+n*h+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/g;return t[0]=p*v,t[1]=(s*c-u*n)*v,t[2]=(a*n-s*o)*v,t[3]=h*v,t[4]=(u*e-s*l)*v,t[5]=(s*r-a*e)*v,t[6]=f*v,t[7]=(n*l-c*e)*v,t[8]=(o*e-n*r)*v,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-s*c,s*l,-s*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return As("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(wa.makeScale(t,e)),this}rotate(t){return As("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(wa.makeRotation(-t)),this}translate(t,e){return As("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(wa.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},wa=new Bt,gc=new Bt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),_c=new Bt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function ed(){let i={enabled:!0,workingColorSpace:Is,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===ne&&(s.r=Un(s.r),s.g=Un(s.g),s.b=Un(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===ne&&(s.r=$i(s.r),s.g=$i(s.g),s.b=$i(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===kn?Ls:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[o].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Is]:{primaries:t,whitePoint:n,transfer:Ls,toXYZ:gc,fromXYZ:_c,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:je},outputColorSpaceConfig:{drawingBufferColorSpace:je}},[je]:{primaries:t,whitePoint:n,transfer:ne,toXYZ:gc,fromXYZ:_c,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:je}}}),i}var Kt=ed();function Un(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function $i(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Oi,Kr=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{Oi===void 0&&(Oi=Ds("canvas")),Oi.width=t.width,Oi.height=t.height;let s=Oi.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=Oi}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Ds("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Un(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Un(e[n]/255)*255):e[n]=Un(e[n]);return{data:e,width:t.width,height:t.height}}else return Dt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},nd=0,es=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:nd++}),this.uuid=fs(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width||0,e.height||0,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Ta(s[o].image)):r.push(Ta(s[o]))}else r=Ta(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function Ta(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Kr.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Dt("Texture: Unable to serialize Texture."),{})}var id=0,Ea=new U,Ye=class i extends mn{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=Sn,s=Sn,r=Ae,o=Gn,a=_n,l=Ge,c=i.DEFAULT_ANISOTROPY,u=kn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:id++}),this.uuid=fs(),this.name="",this.source=new es(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Nt(0,0),this.repeat=new Nt(1,1),this.center=new Nt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Bt,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Ea).x}get height(){return this.source.getSize(Ea).y}get depth(){return this.source.getSize(Ea).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.mipmapsAutoUpdate=t.mipmapsAutoUpdate,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isPMREMTexture=t.isPMREMTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){Dt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Dt(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==cl)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Yr:t.x=t.x-Math.floor(t.x);break;case Sn:t.x=t.x<0?0:1;break;case Zr:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Yr:t.y=t.y-Math.floor(t.y);break;case Sn:t.y=t.y<0?0:1;break;case Zr:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Ye.DEFAULT_IMAGE=null;Ye.DEFAULT_MAPPING=cl;Ye.DEFAULT_ANISOTROPY=1;var oe=class{static{this.prototype.isVector4=!0}constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,l=t.elements,c=l[0],u=l[4],p=l[8],h=l[1],f=l[5],g=l[9],v=l[2],m=l[6],d=l[10];if(Math.abs(u-h)<.01&&Math.abs(p-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+h)<.1&&Math.abs(p+v)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+d-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let T=(c+1)/2,S=(f+1)/2,A=(d+1)/2,E=(u+h)/4,_=(p+v)/4,b=(g+m)/4;return T>S&&T>A?T<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(T),s=E/n,r=_/n):S>A?S<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(S),n=E/s,r=b/s):A<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(A),n=_/r,s=b/r),this.set(n,s,r,e),this}let M=Math.sqrt((m-g)*(m-g)+(p-v)*(p-v)+(h-u)*(h-u));return Math.abs(M)<.001&&(M=1),this.x=(m-g)/M,this.y=(p-v)/M,this.z=(h-u)/M,this.w=Math.acos((c+f+d-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=qt(this.x,t.x,e.x),this.y=qt(this.y,t.y,e.y),this.z=qt(this.z,t.z,e.z),this.w=qt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=qt(this.x,t,e),this.y=qt(this.y,t,e),this.z=qt(this.z,t,e),this.w=qt(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(qt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},$r=class extends mn{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ae,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new oe(0,0,t,e),this.scissorTest=!1,this.viewport=new oe(0,0,t,e),this.textures=[];let s=n.count;for(let r=0;r<s;r++)this.textures[r]=new Ye({width:t,height:e,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Ae,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.mipmapsAutoUpdate!==void 0&&(e.mipmapsAutoUpdate=t.mipmapsAutoUpdate),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new es(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;else this.depthTexture=null;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Xe=class extends $r{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},Ns=class extends Ye{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ee,this.minFilter=Ee,this.wrapR=Sn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var jr=class extends Ye{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ee,this.minFilter=Ee,this.wrapR=Sn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var se=class i{static{this.prototype.isMatrix4=!0}constructor(t,e,n,s,r,o,a,l,c,u,p,h,f,g,v,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c,u,p,h,f,g,v,m)}set(t,e,n,s,r,o,a,l,c,u,p,h,f,g,v,m){let d=this.elements;return d[0]=t,d[4]=e,d[8]=n,d[12]=s,d[1]=r,d[5]=o,d[9]=a,d[13]=l,d[2]=c,d[6]=u,d[10]=p,d[14]=h,d[3]=f,d[7]=g,d[11]=v,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,s=1/Bi.setFromMatrixColumn(t,0).length(),r=1/Bi.setFromMatrixColumn(t,1).length(),o=1/Bi.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),p=Math.sin(r);if(t.order==="XYZ"){let h=o*u,f=o*p,g=a*u,v=a*p;e[0]=l*u,e[4]=-l*p,e[8]=c,e[1]=f+g*c,e[5]=h-v*c,e[9]=-a*l,e[2]=v-h*c,e[6]=g+f*c,e[10]=o*l}else if(t.order==="YXZ"){let h=l*u,f=l*p,g=c*u,v=c*p;e[0]=h+v*a,e[4]=g*a-f,e[8]=o*c,e[1]=o*p,e[5]=o*u,e[9]=-a,e[2]=f*a-g,e[6]=v+h*a,e[10]=o*l}else if(t.order==="ZXY"){let h=l*u,f=l*p,g=c*u,v=c*p;e[0]=h-v*a,e[4]=-o*p,e[8]=g+f*a,e[1]=f+g*a,e[5]=o*u,e[9]=v-h*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){let h=o*u,f=o*p,g=a*u,v=a*p;e[0]=l*u,e[4]=g*c-f,e[8]=h*c+v,e[1]=l*p,e[5]=v*c+h,e[9]=f*c-g,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){let h=o*l,f=o*c,g=a*l,v=a*c;e[0]=l*u,e[4]=v-h*p,e[8]=g*p+f,e[1]=p,e[5]=o*u,e[9]=-a*u,e[2]=-c*u,e[6]=f*p+g,e[10]=h-v*p}else if(t.order==="XZY"){let h=o*l,f=o*c,g=a*l,v=a*c;e[0]=l*u,e[4]=-p,e[8]=c*u,e[1]=h*p+v,e[5]=o*u,e[9]=f*p-g,e[2]=g*p-f,e[6]=a*u,e[10]=v*p+h}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(sd,t,rd)}lookAt(t,e,n){let s=this.elements;return Ke.subVectors(t,e),Ke.lengthSq()===0&&(Ke.z=1),Ke.normalize(),Jn.crossVectors(n,Ke),Jn.lengthSq()===0&&(Math.abs(n.z)===1?Ke.x+=1e-4:Ke.z+=1e-4,Ke.normalize(),Jn.crossVectors(n,Ke)),Jn.normalize(),_r.crossVectors(Ke,Jn),s[0]=Jn.x,s[4]=_r.x,s[8]=Ke.x,s[1]=Jn.y,s[5]=_r.y,s[9]=Ke.y,s[2]=Jn.z,s[6]=_r.z,s[10]=Ke.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],p=n[5],h=n[9],f=n[13],g=n[2],v=n[6],m=n[10],d=n[14],M=n[3],T=n[7],S=n[11],A=n[15],E=s[0],_=s[4],b=s[8],O=s[12],L=s[1],D=s[5],k=s[9],q=s[13],R=s[2],V=s[6],Y=s[10],G=s[14],et=s[3],W=s[7],Q=s[11],tt=s[15];return r[0]=o*E+a*L+l*R+c*et,r[4]=o*_+a*D+l*V+c*W,r[8]=o*b+a*k+l*Y+c*Q,r[12]=o*O+a*q+l*G+c*tt,r[1]=u*E+p*L+h*R+f*et,r[5]=u*_+p*D+h*V+f*W,r[9]=u*b+p*k+h*Y+f*Q,r[13]=u*O+p*q+h*G+f*tt,r[2]=g*E+v*L+m*R+d*et,r[6]=g*_+v*D+m*V+d*W,r[10]=g*b+v*k+m*Y+d*Q,r[14]=g*O+v*q+m*G+d*tt,r[3]=M*E+T*L+S*R+A*et,r[7]=M*_+T*D+S*V+A*W,r[11]=M*b+T*k+S*Y+A*Q,r[15]=M*O+T*q+S*G+A*tt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],u=t[2],p=t[6],h=t[10],f=t[14],g=t[3],v=t[7],m=t[11],d=t[15],M=l*f-c*h,T=a*f-c*p,S=a*h-l*p,A=o*f-c*u,E=o*h-l*u,_=o*p-a*u;return e*(v*M-m*T+d*S)-n*(g*M-m*A+d*E)+s*(g*T-v*A+d*_)-r*(g*S-v*E+m*_)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],o=t[5],a=t[9],l=t[2],c=t[6],u=t[10];return e*(o*u-a*c)-n*(r*u-a*l)+s*(r*c-o*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],u=t[8],p=t[9],h=t[10],f=t[11],g=t[12],v=t[13],m=t[14],d=t[15],M=e*a-n*o,T=e*l-s*o,S=e*c-r*o,A=n*l-s*a,E=n*c-r*a,_=s*c-r*l,b=u*v-p*g,O=u*m-h*g,L=u*d-f*g,D=p*m-h*v,k=p*d-f*v,q=h*d-f*m,R=M*q-T*k+S*D+A*L-E*O+_*b;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let V=1/R;return t[0]=(a*q-l*k+c*D)*V,t[1]=(s*k-n*q-r*D)*V,t[2]=(v*_-m*E+d*A)*V,t[3]=(h*E-p*_-f*A)*V,t[4]=(l*L-o*q-c*O)*V,t[5]=(e*q-s*L+r*O)*V,t[6]=(m*S-g*_-d*T)*V,t[7]=(u*_-h*S+f*T)*V,t[8]=(o*k-a*L+c*b)*V,t[9]=(n*L-e*k-r*b)*V,t[10]=(g*E-v*S+d*M)*V,t[11]=(p*S-u*E-f*M)*V,t[12]=(a*O-o*D-l*b)*V,t[13]=(e*D-n*O+s*b)*V,t[14]=(v*T-g*A-m*M)*V,t[15]=(u*A-p*T+h*M)*V,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,l=t.z,c=r*o,u=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,u*a+n,u*l-s*o,0,c*l-s*a,u*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,u=o+o,p=a+a,h=r*c,f=r*u,g=r*p,v=o*u,m=o*p,d=a*p,M=l*c,T=l*u,S=l*p,A=n.x,E=n.y,_=n.z;return s[0]=(1-(v+d))*A,s[1]=(f+S)*A,s[2]=(g-T)*A,s[3]=0,s[4]=(f-S)*E,s[5]=(1-(h+d))*E,s[6]=(m+M)*E,s[7]=0,s[8]=(g+T)*_,s[9]=(m-M)*_,s[10]=(1-(h+v))*_,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let o=Bi.set(s[0],s[1],s[2]).length(),a=Bi.set(s[4],s[5],s[6]).length(),l=Bi.set(s[8],s[9],s[10]).length();r<0&&(o=-o),un.copy(this);let c=1/o,u=1/a,p=1/l;return un.elements[0]*=c,un.elements[1]*=c,un.elements[2]*=c,un.elements[4]*=u,un.elements[5]*=u,un.elements[6]*=u,un.elements[8]*=p,un.elements[9]*=p,un.elements[10]*=p,e.setFromRotationMatrix(un),n.x=o,n.y=a,n.z=l,this}makePerspective(t,e,n,s,r,o,a=rn,l=!1){let c=this.elements,u=2*r/(e-t),p=2*r/(n-s),h=(e+t)/(e-t),f=(n+s)/(n-s),g,v;if(l)g=r/(o-r),v=o*r/(o-r);else if(a===rn)g=-(o+r)/(o-r),v=-2*o*r/(o-r);else if(a===Qi)g=-o/(o-r),v=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=p,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=rn,l=!1){let c=this.elements,u=2/(e-t),p=2/(n-s),h=-(e+t)/(e-t),f=-(n+s)/(n-s),g,v;if(l)g=1/(o-r),v=o/(o-r);else if(a===rn)g=-2/(o-r),v=-(o+r)/(o-r);else if(a===Qi)g=-1/(o-r),v=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=p,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},Bi=new U,un=new se,sd=new U(0,0,0),rd=new U(1,1,1),Jn=new U,_r=new U,Ke=new U,xc=new se,yc=new Qe,On=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],u=s[9],p=s[2],h=s[6],f=s[10];switch(e){case"XYZ":this._y=Math.asin(qt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-qt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-p,r),this._z=0);break;case"ZXY":this._x=Math.asin(qt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-p,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-qt(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(h,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(qt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-p,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-qt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:Dt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return xc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(xc,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return yc.setFromEuler(this),this.setFromQuaternion(yc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};On.DEFAULT_ORDER="XYZ";var Us=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},od=0,vc=new U,zi=new Qe,Cn=new se,xr=new U,Ms=new U,ad=new U,ld=new Qe,Mc=new U(1,0,0),Sc=new U(0,1,0),bc=new U(0,0,1),wc={type:"added"},cd={type:"removed"},Gi={type:"childadded",child:null},Aa={type:"childremoved",child:null},_e=class i extends mn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:od++}),this.uuid=fs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new U,e=new On,n=new Qe,s=new U(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new se},normalMatrix:{value:new Bt}}),this.matrix=new se,this.matrixWorld=new se,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Us,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return zi.setFromAxisAngle(t,e),this.quaternion.multiply(zi),this}rotateOnWorldAxis(t,e){return zi.setFromAxisAngle(t,e),this.quaternion.premultiply(zi),this}rotateX(t){return this.rotateOnAxis(Mc,t)}rotateY(t){return this.rotateOnAxis(Sc,t)}rotateZ(t){return this.rotateOnAxis(bc,t)}translateOnAxis(t,e){return vc.copy(t).applyQuaternion(this.quaternion),this.position.add(vc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Mc,t)}translateY(t){return this.translateOnAxis(Sc,t)}translateZ(t){return this.translateOnAxis(bc,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Cn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?xr.copy(t):xr.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Ms.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Cn.lookAt(Ms,xr,this.up):Cn.lookAt(xr,Ms,this.up),this.quaternion.setFromRotationMatrix(Cn),s&&(Cn.extractRotation(s.matrixWorld),zi.setFromRotationMatrix(Cn),this.quaternion.premultiply(zi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Ot("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(wc),Gi.child=t,this.dispatchEvent(Gi),Gi.child=null):Ot("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(cd),Aa.child=t,this.dispatchEvent(Aa),Aa.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Cn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Cn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Cn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(wc),Gi.child=t,this.dispatchEvent(Gi),Gi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ms,t,ad),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ms,ld,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let p=l[c];r(t.shapes,p)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(t.animations,l))}}if(e){let a=o(t.geometries),l=o(t.materials),c=o(t.textures),u=o(t.images),p=o(t.shapes),h=o(t.skeletons),f=o(t.animations),g=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),p.length>0&&(n.shapes=p),h.length>0&&(n.skeletons=h),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};_e.DEFAULT_UP=new U(0,1,0);_e.DEFAULT_MATRIX_AUTO_UPDATE=!0;_e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Nn=class extends _e{constructor(){super(),this.isGroup=!0,this.type="Group"}},hd={type:"move"},ns=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Nn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Nn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Nn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(let v of t.hand.values()){let m=e.getJointPose(v,n),d=this._getHandJoint(c,v);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.quaternion,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}let u=c.joints["index-finger-tip"],p=c.joints["thumb-tip"],h=u.position.distanceTo(p.position),f=.02,g=.005;c.inputState.pinching&&h>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&h<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.quaternion,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(hd)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new Nn;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},wh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Kn={h:0,s:0,l:0},yr={h:0,s:0,l:0};function Ra(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var It=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=je){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Kt.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=Kt.workingColorSpace){return this.r=t,this.g=e,this.b=n,Kt.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=Kt.workingColorSpace){if(t=Ml(t,1),e=qt(e,0,1),n=qt(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=Ra(o,r,t+1/3),this.g=Ra(o,r,t),this.b=Ra(o,r,t-1/3)}return Kt.colorSpaceToWorking(this,s),this}setStyle(t,e=je){function n(r){r!==void 0&&parseFloat(r)<1&&Dt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,e);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Dt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);Dt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=je){let n=wh[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Dt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Un(t.r),this.g=Un(t.g),this.b=Un(t.b),this}copyLinearToSRGB(t){return this.r=$i(t.r),this.g=$i(t.g),this.b=$i(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=je){return Kt.workingToColorSpace(Be.copy(this),t),Math.round(qt(Be.r*255,0,255))*65536+Math.round(qt(Be.g*255,0,255))*256+Math.round(qt(Be.b*255,0,255))}getHexString(t=je){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Kt.workingColorSpace){Kt.workingToColorSpace(Be.copy(this),e);let n=Be.r,s=Be.g,r=Be.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let p=o-a;switch(c=u<=.5?p/(o+a):p/(2-o-a),o){case n:l=(s-r)/p+(s<r?6:0);break;case s:l=(r-n)/p+2;break;case r:l=(n-s)/p+4;break}l/=6}return t.h=l,t.s=c,t.l=u,t}getRGB(t,e=Kt.workingColorSpace){return Kt.workingToColorSpace(Be.copy(this),e),t.r=Be.r,t.g=Be.g,t.b=Be.b,t}getStyle(t=je){Kt.workingToColorSpace(Be.copy(this),t);let e=Be.r,n=Be.g,s=Be.b;return t!==je?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Kn),this.setHSL(Kn.h+t,Kn.s+e,Kn.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Kn),t.getHSL(yr);let n=Cs(Kn.h,yr.h,e),s=Cs(Kn.s,yr.s,e),r=Cs(Kn.l,yr.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Be=new It;It.NAMES=wh;var Fs=class i{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new It(t),this.density=e}clone(){return new i(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var Os=class extends _e{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new On,this.environmentIntensity=1,this.environmentRotation=new On,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),this.background=t.background!==null?t.background.clone():null,this.environment=t.environment!==null?t.environment.clone():null,this.fog=t.fog!==null?t.fog.clone():null,this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),this.overrideMaterial=t.overrideMaterial!==null?t.overrideMaterial.clone():null,this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},dn=new U,Pn=new U,Ca=new U,In=new U,Vi=new U,ki=new U,Tc=new U,Pa=new U,Ia=new U,La=new U,Da=new oe,Na=new oe,Ua=new oe,ti=class i{constructor(t=new U,e=new U,n=new U){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),dn.subVectors(t,e),s.cross(dn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){dn.subVectors(s,e),Pn.subVectors(n,e),Ca.subVectors(t,e);let o=dn.dot(dn),a=dn.dot(Pn),l=dn.dot(Ca),c=Pn.dot(Pn),u=Pn.dot(Ca),p=o*c-a*a;if(p===0)return r.set(0,0,0),null;let h=1/p,f=(c*l-a*u)*h,g=(o*u-a*l)*h;return r.set(1-f-g,g,f)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,In)===null?!1:In.x>=0&&In.y>=0&&In.x+In.y<=1}static getInterpolation(t,e,n,s,r,o,a,l){return this.getBarycoord(t,e,n,s,In)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,In.x),l.addScaledVector(o,In.y),l.addScaledVector(a,In.z),l)}static getInterpolatedAttribute(t,e,n,s,r,o){return Da.setScalar(0),Na.setScalar(0),Ua.setScalar(0),Da.fromBufferAttribute(t,e),Na.fromBufferAttribute(t,n),Ua.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(Da,r.x),o.addScaledVector(Na,r.y),o.addScaledVector(Ua,r.z),o}static isFrontFacing(t,e,n,s){return dn.subVectors(n,e),Pn.subVectors(t,e),dn.cross(Pn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return dn.subVectors(this.c,this.b),Pn.subVectors(this.a,this.b),dn.cross(Pn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,o,a;Vi.subVectors(s,n),ki.subVectors(r,n),Pa.subVectors(t,n);let l=Vi.dot(Pa),c=ki.dot(Pa);if(l<=0&&c<=0)return e.copy(n);Ia.subVectors(t,s);let u=Vi.dot(Ia),p=ki.dot(Ia);if(u>=0&&p<=u)return e.copy(s);let h=l*p-u*c;if(h<=0&&l>=0&&u<=0&&l-u>0)return o=l/(l-u),e.copy(n).addScaledVector(Vi,o);La.subVectors(t,r);let f=Vi.dot(La),g=ki.dot(La);if(g>=0&&f<=g)return e.copy(r);let v=f*c-l*g;if(v<=0&&c>=0&&g<=0)return a=c/(c-g),e.copy(n).addScaledVector(ki,a);let m=u*g-f*p;if(m<=0&&p-u>=0&&f-g>=0)return Tc.subVectors(r,s),a=(p-u)/(p-u+(f-g)),e.copy(s).addScaledVector(Tc,a);let d=1/(m+v+h);return o=v*d,a=h*d,e.copy(n).addScaledVector(Vi,o).addScaledVector(ki,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},bn=class{constructor(t=new U(1/0,1/0,1/0),e=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(fn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(fn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=fn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0&&t.isBatchedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,fn):fn.fromBufferAttribute(r,o),fn.applyMatrix4(t.matrixWorld),this.expandByPoint(fn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),vr.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),vr.copy(n.boundingBox)),vr.applyMatrix4(t.matrixWorld),this.union(vr)}let s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,fn),fn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ss),Mr.subVectors(this.max,Ss),Hi.subVectors(t.a,Ss),Wi.subVectors(t.b,Ss),Xi.subVectors(t.c,Ss),$n.subVectors(Wi,Hi),jn.subVectors(Xi,Wi),xi.subVectors(Hi,Xi);let e=[0,-$n.z,$n.y,0,-jn.z,jn.y,0,-xi.z,xi.y,$n.z,0,-$n.x,jn.z,0,-jn.x,xi.z,0,-xi.x,-$n.y,$n.x,0,-jn.y,jn.x,0,-xi.y,xi.x,0];return!Fa(e,Hi,Wi,Xi,Mr)||(e=[1,0,0,0,1,0,0,0,1],!Fa(e,Hi,Wi,Xi,Mr))?!1:(Sr.crossVectors($n,jn),e=[Sr.x,Sr.y,Sr.z],Fa(e,Hi,Wi,Xi,Mr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,fn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(fn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Ln[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Ln[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Ln[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Ln[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Ln[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Ln[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Ln[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Ln[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Ln),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Ln=[new U,new U,new U,new U,new U,new U,new U,new U],fn=new U,vr=new bn,Hi=new U,Wi=new U,Xi=new U,$n=new U,jn=new U,xi=new U,Ss=new U,Mr=new U,Sr=new U,yi=new U;function Fa(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){yi.fromArray(i,r);let a=s.x*Math.abs(yi.x)+s.y*Math.abs(yi.y)+s.z*Math.abs(yi.z),l=t.dot(yi),c=e.dot(yi),u=n.dot(yi);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var ge=new U,br=new Nt,ud=0,pn=class extends mn{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:ud++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=_h,this.updateRanges=[],this.gpuType=ln,this.version=0,this._normalizationScale=t!==void 0?bl(t):void 0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this._normalizationScale=t._normalizationScale,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)br.fromBufferAttribute(this,e),br.applyMatrix3(t),this.setXY(e,br.x,br.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)ge.fromBufferAttribute(this,e),ge.applyMatrix3(t),this.setXYZ(e,ge.x,ge.y,ge.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)ge.fromBufferAttribute(this,e),ge.applyMatrix4(t),this.setXYZ(e,ge.x,ge.y,ge.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)ge.fromBufferAttribute(this,e),ge.applyNormalMatrix(t),this.setXYZ(e,ge.x,ge.y,ge.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)ge.fromBufferAttribute(this,e),ge.transformDirection(t),this.setXYZ(e,ge.x,ge.y,ge.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=this._denormalize(n)),n}setComponent(t,e,n){return this.normalized&&(n=this._normalize(n)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=this._denormalize(e)),e}setX(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=this._denormalize(e)),e}setY(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=this._denormalize(e)),e}setZ(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=this._denormalize(e)),e}setW(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n),s=this._normalize(s)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(t){let e=this._normalizationScale;return e!==void 0?Math.max(t/e,-1):Sh(t,this.array)}_normalize(t){let e=this._normalizationScale;return e!==void 0?Math.round(t*e):bh(t,this.array)}};var Bs=class extends pn{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var zs=class extends pn{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var We=class extends pn{constructor(t,e,n){super(new Float32Array(t),e,n)}},dd=new bn,bs=new U,Oa=new U,ei=class{constructor(t=new U,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):dd.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;bs.subVectors(t,this.center);let e=bs.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(bs,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Oa.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(bs.copy(t.center).add(Oa)),this.expandByPoint(bs.copy(t.center).sub(Oa))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},fd=0,sn=new se,Ba=new _e,qi=new U,$e=new bn,ws=new bn,Te=new U,Bn=class i extends mn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:fd++}),this.uuid=fs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Bu(t)?zs:Bs)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Bt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return sn.makeRotationFromQuaternion(t),this.applyMatrix4(sn),this}rotateX(t){return sn.makeRotationX(t),this.applyMatrix4(sn),this}rotateY(t){return sn.makeRotationY(t),this.applyMatrix4(sn),this}rotateZ(t){return sn.makeRotationZ(t),this.applyMatrix4(sn),this}translate(t,e,n){return sn.makeTranslation(t,e,n),this.applyMatrix4(sn),this}scale(t,e,n){return sn.makeScale(t,e,n),this.applyMatrix4(sn),this}lookAt(t){return Ba.lookAt(t),Ba.updateMatrix(),this.applyMatrix4(Ba.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(qi).negate(),this.translate(qi.x,qi.y,qi.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let o=t[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new We(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&Dt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new bn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ot("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];$e.setFromBufferAttribute(r),this.morphTargetsRelative?(Te.addVectors(this.boundingBox.min,$e.min),this.boundingBox.expandByPoint(Te),Te.addVectors(this.boundingBox.max,$e.max),this.boundingBox.expandByPoint(Te)):(this.boundingBox.expandByPoint($e.min),this.boundingBox.expandByPoint($e.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ot('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ei);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ot("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(t){let n=this.boundingSphere.center;if($e.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];ws.setFromBufferAttribute(a),this.morphTargetsRelative?(Te.addVectors($e.min,ws.min),$e.expandByPoint(Te),Te.addVectors($e.max,ws.max),$e.expandByPoint(Te)):($e.expandByPoint(ws.min),$e.expandByPoint(ws.max))}$e.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)Te.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Te));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)Te.fromBufferAttribute(a,c),l&&(qi.fromBufferAttribute(t,c),Te.add(qi)),s=Math.max(s,n.distanceToSquared(Te))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Ot('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Ot("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new pn(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],l=[],c=new Uint8Array(n.count);for(let O=0;O<n.count;O++)a[O]=new U,l[O]=new U;let u=new U,p=new U,h=new U,f=new Nt,g=new Nt,v=new Nt,m=new U,d=new U;function M(O,L,D){c[O]=c[L]=c[D]=1,u.fromBufferAttribute(n,O),p.fromBufferAttribute(n,L),h.fromBufferAttribute(n,D),f.fromBufferAttribute(r,O),g.fromBufferAttribute(r,L),v.fromBufferAttribute(r,D),p.sub(u),h.sub(u),g.sub(f),v.sub(f);let k=1/(g.x*v.y-v.x*g.y);isFinite(k)&&(m.copy(p).multiplyScalar(v.y).addScaledVector(h,-g.y).multiplyScalar(k),d.copy(h).multiplyScalar(g.x).addScaledVector(p,-v.x).multiplyScalar(k),a[O].add(m),a[L].add(m),a[D].add(m),l[O].add(d),l[L].add(d),l[D].add(d))}let T=this.groups;T.length===0&&(T=[{start:0,count:t.count}]);for(let O=0,L=T.length;O<L;++O){let D=T[O],k=D.start,q=D.count;for(let R=k,V=k+q;R<V;R+=3)M(t.getX(R+0),t.getX(R+1),t.getX(R+2))}let S=new U,A=new U,E=new U,_=new U;function b(O){E.fromBufferAttribute(s,O),_.copy(E);let L=a[O];S.copy(L),S.sub(E.multiplyScalar(E.dot(L))).normalize(),A.crossVectors(_,L);let k=A.dot(l[O])<0?-1:1;o.setXYZW(O,S.x,S.y,S.z,k)}for(let O=0,L=n.count;O<L;++O)c[O]&&b(O);this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new pn(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let h=0,f=n.count;h<f;h++)n.setXYZ(h,0,0,0);let s=new U,r=new U,o=new U,a=new U,l=new U,c=new U,u=new U,p=new U;if(t)for(let h=0,f=t.count;h<f;h+=3){let g=t.getX(h+0),v=t.getX(h+1),m=t.getX(h+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,v),o.fromBufferAttribute(e,m),u.subVectors(o,r),p.subVectors(s,r),u.cross(p),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,m),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,f=e.count;h<f;h+=3)s.fromBufferAttribute(e,h+0),r.fromBufferAttribute(e,h+1),o.fromBufferAttribute(e,h+2),u.subVectors(o,r),p.subVectors(s,r),u.cross(p),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Te.fromBufferAttribute(t,e),Te.normalize(),t.setXYZ(e,Te.x,Te.y,Te.z)}toNonIndexed(){function t(a,l){let c=a.array,u=a.itemSize,p=a.normalized,h=new c.constructor(l.length*u),f=0,g=0;for(let v=0,m=l.length;v<m;v++){a.isInterleavedBufferAttribute?f=l[v]*a.data.stride+a.offset:f=l[v]*u;for(let d=0;d<u;d++)h[g++]=c[f++]}return new pn(h,u,p)}if(this.index===null)return Dt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=t(l,n);e.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let u=0,p=c.length;u<p;u++){let h=c[u],f=t(h,n);l.push(f)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let p=0,h=c.length;p<h;p++){let f=c[p];u.push(f.toJSON(t.data))}u.length>0&&(s[l]=u,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(e))}let r=t.morphAttributes;for(let c in r){let u=[],p=r[c];for(let h=0,f=p.length;h<f;h++)u.push(p[h].clone(e));this.morphAttributes[c]=u}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let c=0,u=o.length;c<u;c++){let p=o[c];this.addGroup(p.start,p.count,p.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var za=new U,pd=new U,md=new Bt,He=class{constructor(t=new U(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=za.subVectors(n,e).cross(pd.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let s=t.delta(za),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let o=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(s,o)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||md.getNormalMatrix(t),s=this.coplanarPoint(za).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},gd=0,ni=class extends mn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:gd++}),this.uuid=fs(),this.name="",this.type="Material",this.blending=hs,this.side=hi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=tl,this.blendDst=el,this.blendEquation=Ai,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new It(0,0,0),this.blendAlpha=0,this.depthFunc=ji,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=uh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=zr,this.stencilZFail=zr,this.stencilZPass=zr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){Dt(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Dt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(t).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(e){let r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new It().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.diffuseRoughness!==void 0&&(this.diffuseRoughness=t.diffuseRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum),t.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=t.iridescenceThicknessRange[1]),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new He().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Nt().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Nt().fromArray(t.clearcoatNormalScale)),t.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=e[t.diffuseRoughnessMap]||null),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var Dn=new U,Ga=new U,wr=new U,Tr=new U,is=class{constructor(t=new U,e=new U(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Dn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Dn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Dn.copy(this.origin).addScaledVector(this.direction,e),Dn.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Ga.copy(t).add(e).multiplyScalar(.5),wr.copy(e).sub(t).normalize(),Tr.copy(this.origin).sub(Ga);let r=t.distanceTo(e)*.5,o=-this.direction.dot(wr),a=Tr.dot(this.direction),l=-Tr.dot(wr),c=Tr.lengthSq(),u=Math.abs(1-o*o),p,h,f,g;if(u>0)if(p=o*l-a,h=o*a-l,g=r*u,p>=0)if(h>=-g)if(h<=g){let v=1/u;p*=v,h*=v,f=p*(p+o*h+2*a)+h*(o*p+h+2*l)+c}else h=r,p=Math.max(0,-(o*h+a)),f=-p*p+h*(h+2*l)+c;else h=-r,p=Math.max(0,-(o*h+a)),f=-p*p+h*(h+2*l)+c;else h<=-g?(p=Math.max(0,-(-o*r+a)),h=p>0?-r:Math.min(Math.max(-r,-l),r),f=-p*p+h*(h+2*l)+c):h<=g?(p=0,h=Math.min(Math.max(-r,-l),r),f=h*(h+2*l)+c):(p=Math.max(0,-(o*r+a)),h=p>0?r:Math.min(Math.max(-r,-l),r),f=-p*p+h*(h+2*l)+c);else h=o>0?-r:r,p=Math.max(0,-(o*h+a)),f=-p*p+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,p),s&&s.copy(Ga).addScaledVector(wr,h),f}intersectSphere(t,e){if(t.radius<0)return null;Dn.subVectors(t.center,this.origin);let n=Dn.dot(this.direction),s=Dn.dot(Dn)-n*n,r=t.radius*t.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,l,c=1/this.direction.x,u=1/this.direction.y,p=1/this.direction.z,h=this.origin;return c>=0?(n=(t.min.x-h.x)*c,s=(t.max.x-h.x)*c):(n=(t.max.x-h.x)*c,s=(t.min.x-h.x)*c),u>=0?(r=(t.min.y-h.y)*u,o=(t.max.y-h.y)*u):(r=(t.max.y-h.y)*u,o=(t.min.y-h.y)*u),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),p>=0?(a=(t.min.z-h.z)*p,l=(t.max.z-h.z)*p):(a=(t.max.z-h.z)*p,l=(t.min.z-h.z)*p),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Dn)!==null}intersectTriangle(t,e,n,s,r){let o=this.origin,a=this.direction,l=a.x,c=a.y,u=a.z,p=t.x-o.x,h=t.y-o.y,f=t.z-o.z,g=e.x-o.x,v=e.y-o.y,m=e.z-o.z,d=n.x-o.x,M=n.y-o.y,T=n.z-o.z,S=Math.abs(l),A=Math.abs(c),E=Math.abs(u),_,b,O,L,D,k,q,R,V,Y,G,et;if(S>=A&&S>=E?(O=l,k=p,V=g,et=d,l>=0?(_=c,b=u,L=h,D=f,q=v,R=m,Y=M,G=T):(_=u,b=c,L=f,D=h,q=m,R=v,Y=T,G=M)):A>=E?(O=c,k=h,V=v,et=M,c>=0?(_=u,b=l,L=f,D=p,q=m,R=g,Y=T,G=d):(_=l,b=u,L=p,D=f,q=g,R=m,Y=d,G=T)):(O=u,k=f,V=m,et=T,u>=0?(_=l,b=c,L=p,D=h,q=g,R=v,Y=d,G=M):(_=c,b=l,L=h,D=p,q=v,R=g,Y=M,G=d)),O===0)return null;let W=_/O,Q=b/O,tt=1/O,vt=L-W*k,Rt=D-Q*k,J=q-W*V,ft=R-Q*V,Mt=Y-W*et,At=G-Q*et,pt=Mt*ft-At*J,Ft=vt*At-Rt*Mt,de=J*Rt-ft*vt;if(s){if(pt<0||Ft<0||de<0)return null}else if((pt<0||Ft<0||de<0)&&(pt>0||Ft>0||de>0))return null;let Pt=pt+Ft+de;if(Pt===0)return null;let jt=tt*(pt*k+Ft*V+de*et);return(Pt>0?jt<0:jt>0)?null:this.at(jt/Pt,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},bi=class extends ni{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new It(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new On,this.combine=mo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Ec=new se,vi=new is,Er=new ei,Ac=new U,Ar=new U,Rr=new U,Cr=new U,Va=new U,Pr=new U,Rc=new U,Ir=new U,Re=class extends _e{constructor(t=new Bn,e=new bi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let a=this.morphTargetInfluences;if(r&&a){Pr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=a[l],p=r[l];u!==0&&(Va.fromBufferAttribute(p,t),o?Pr.addScaledVector(Va,u):Pr.addScaledVector(Va.sub(e),u))}e.add(Pr)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Er.copy(n.boundingSphere),Er.applyMatrix4(r),vi.copy(t.ray).recast(t.near),!(Er.containsPoint(vi.origin)===!1&&(vi.intersectSphere(Er,Ac)===null||vi.origin.distanceToSquared(Ac)>(t.far-t.near)**2))&&(Ec.copy(r).invert(),vi.copy(t.ray).applyMatrix4(Ec),!(n.boundingBox!==null&&vi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,vi)))}_computeIntersections(t,e,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,p=r.attributes.normal,h=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,v=h.length;g<v;g++){let m=h[g],d=o[m.materialIndex],M=Math.max(m.start,f.start),T=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let S=M,A=T;S<A;S+=3){let E=a.getX(S),_=a.getX(S+1),b=a.getX(S+2);s=Lr(this,d,t,n,c,u,p,E,_,b),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let g=Math.max(0,f.start),v=Math.min(a.count,f.start+f.count);for(let m=g,d=v;m<d;m+=3){let M=a.getX(m),T=a.getX(m+1),S=a.getX(m+2);s=Lr(this,o,t,n,c,u,p,M,T,S),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,v=h.length;g<v;g++){let m=h[g],d=o[m.materialIndex],M=Math.max(m.start,f.start),T=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let S=M,A=T;S<A;S+=3){let E=S,_=S+1,b=S+2;s=Lr(this,d,t,n,c,u,p,E,_,b),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let g=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let m=g,d=v;m<d;m+=3){let M=m,T=m+1,S=m+2;s=Lr(this,o,t,n,c,u,p,M,T,S),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}};function _d(i,t,e,n,s,r,o,a){let l;if(t.side===Le?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,t.side===hi,a),l===null)return null;Ir.copy(a),Ir.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(Ir);return c<e.near||c>e.far?null:{distance:c,point:Ir.clone(),object:i}}function Lr(i,t,e,n,s,r,o,a,l,c){i.getVertexPosition(a,Ar),i.getVertexPosition(l,Rr),i.getVertexPosition(c,Cr);let u=_d(i,t,e,n,Ar,Rr,Cr,Rc);if(u){let p=new U;ti.getBarycoord(Rc,Ar,Rr,Cr,p),s&&(u.uv=ti.getInterpolatedAttribute(s,a,l,c,p,new Nt)),r&&(u.uv1=ti.getInterpolatedAttribute(r,a,l,c,p,new Nt)),o&&(u.normal=ti.getInterpolatedAttribute(o,a,l,c,p,new U),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a,b:l,c,normal:new U,materialIndex:0};ti.getNormal(Ar,Rr,Cr,h.normal),u.face=h,u.barycoord=p}return u}var Gs=class extends Ye{constructor(t=null,e=1,n=1,s,r,o,a,l,c=Ee,u=Ee,p,h){super(null,o,a,l,c,u,s,r,p,h),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Vs=class extends pn{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Yi=new se,Cc=new se,Dr=[],Pc=new bn,xd=new se,Ts=new Re,Es=new ei,ss=class extends Re{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Vs(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,xd)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new bn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Yi),Pc.copy(t.boundingBox).applyMatrix4(Yi),this.boundingBox.union(Pc)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new ei),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Yi),Es.copy(t.boundingSphere).applyMatrix4(Yi),this.boundingSphere.union(Es)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),this.morphTexture=t.morphTexture!==null?t.morphTexture.clone():null,this.instanceColor=t.instanceColor!==null?t.instanceColor.clone():null,this.count=t.count,this.boundingBox=t.boundingBox!==null?t.boundingBox.clone():null,this.boundingSphere=t.boundingSphere!==null?t.boundingSphere.clone():null,this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=t*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(t,e){let n=this.matrixWorld,s=this.count;if(Ts.geometry=this.geometry,Ts.material=this.material,Ts.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Es.copy(this.boundingSphere),Es.applyMatrix4(n),t.ray.intersectsSphere(Es)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Yi),Cc.multiplyMatrices(n,Yi),Ts.matrixWorld=Cc,Ts.raycast(t,Dr);for(let o=0,a=Dr.length;o<a;o++){let l=Dr[o];l.instanceId=r,l.object=this,e.push(l)}Dr.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new Vs(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Gs(new Float32Array(s*this.count),s,this.count,So,ln));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<n.length;c++)o+=n[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=s*t;return r[l]=a,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Mi=new ei,yd=new Nt(.5,.5),Nr=new U,ii=class{constructor(t=new He,e=new He,n=new He,s=new He,r=new He,o=new He){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=rn,n=!1){let s=this.planes,r=t.elements,o=r[0],a=r[1],l=r[2],c=r[3],u=r[4],p=r[5],h=r[6],f=r[7],g=r[8],v=r[9],m=r[10],d=r[11],M=r[12],T=r[13],S=r[14],A=r[15];if(s[0].setComponents(c-o,f-u,d-g,A-M).normalize(),s[1].setComponents(c+o,f+u,d+g,A+M).normalize(),s[2].setComponents(c+a,f+p,d+v,A+T).normalize(),s[3].setComponents(c-a,f-p,d-v,A-T).normalize(),n)s[4].setComponents(l,h,m,S).normalize(),s[5].setComponents(c-l,f-h,d-m,A-S).normalize();else if(s[4].setComponents(c-l,f-h,d-m,A-S).normalize(),e===rn)s[5].setComponents(c+l,f+h,d+m,A+S).normalize();else if(e===Qi)s[5].setComponents(l,h,m,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Mi.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Mi.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Mi)}intersectsSprite(t){Mi.center.set(0,0,0);let e=yd.distanceTo(t.center);return Mi.radius=.7071067811865476+e,Mi.applyMatrix4(t.matrixWorld),this.intersectsSphere(Mi)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(Nr.x=s.normal.x>0?t.max.x:t.min.x,Nr.y=s.normal.y>0?t.max.y:t.min.y,Nr.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Nr)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Ic=new se,Qr=class i{constructor(){this.coordinateSystem=rn,this._frustums=[],this._count=0}setFromArrayCamera(t){let e=t.cameras,n=this._frustums;for(let s=0;s<e.length;s++){let r=e[s];Ic.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[s]===void 0&&(n[s]=new ii),n[s].setFromProjectionMatrix(Ic,r.coordinateSystem,r.reversedDepth)}return this._count=e.length,this}getFrustum(t){return this._frustums[t]}intersectsObject(t){let e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsObject(t))return!0;return!1}intersectsSprite(t){let e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsSprite(t))return!0;return!1}intersectsSphere(t){let e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsSphere(t))return!0;return!1}intersectsBox(t){let e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsBox(t))return!0;return!1}containsPoint(t){let e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].containsPoint(t))return!0;return!1}copy(t){this.coordinateSystem=t.coordinateSystem;let e=this._frustums,n=t._frustums;for(let s=0;s<t._count;s++)e[s]===void 0&&(e[s]=new ii),e[s].copy(n[s]);return this._count=t._count,this}clone(){return new i().copy(this)}};var ks=class extends Ye{constructor(t=[],e=Ri,n,s,r,o,a,l,c,u){super(t,e,n,s,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}};var zn=class extends Ye{constructor(t,e,n=gn,s,r,o,a=Ee,l=Ee,c,u=Fn,p=1){if(u!==Fn&&u!==Vn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:t,height:e,depth:p};super(h,s,r,o,a,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new es(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},Hs=class extends zn{constructor(t,e=gn,n=Ri,s,r,o=Ee,a=Ee,l,c=Fn){let u={width:t,height:t,depth:1},p=[u,u,u,u,u,u];super(t,t,e,n,s,r,o,a,l,c),this.image=p,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},Ws=class extends Ye{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},si=class i extends Bn{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],u=[],p=[],h=0,f=0;g("z","y","x",-1,-1,n,e,t,o,r,0),g("z","y","x",1,-1,n,e,-t,o,r,1),g("x","z","y",1,1,t,n,e,s,o,2),g("x","z","y",1,-1,t,n,-e,s,o,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new We(c,3)),this.setAttribute("normal",new We(u,3)),this.setAttribute("uv",new We(p,2));function g(v,m,d,M,T,S,A,E,_,b,O){let L=S/_,D=A/b,k=S/2,q=A/2,R=E/2,V=_+1,Y=b+1,G=0,et=0,W=new U;for(let Q=0;Q<Y;Q++){let tt=Q*D-q;for(let vt=0;vt<V;vt++){let Rt=vt*L-k;W[v]=Rt*M,W[m]=tt*T,W[d]=R,c.push(W.x,W.y,W.z),W[v]=0,W[m]=0,W[d]=E>0?1:-1,u.push(W.x,W.y,W.z),p.push(vt/_),p.push(1-Q/b),G+=1}}for(let Q=0;Q<b;Q++)for(let tt=0;tt<_;tt++){let vt=h+tt+V*Q,Rt=h+tt+V*(Q+1),J=h+(tt+1)+V*(Q+1),ft=h+(tt+1)+V*Q;l.push(vt,Rt,ft),l.push(Rt,J,ft),et+=6}a.addGroup(f,et,O),f+=et,h+=G}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var wn=class i extends Bn{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,o=e/2,a=Math.floor(n),l=Math.floor(s),c=a+1,u=l+1,p=t/a,h=e/l,f=[],g=[],v=[],m=[];for(let d=0;d<u;d++){let M=d*h-o;for(let T=0;T<c;T++){let S=T*p-r;g.push(S,-M,0),v.push(0,0,1),m.push(T/a),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let M=0;M<a;M++){let T=M+c*d,S=M+c*(d+1),A=M+1+c*(d+1),E=M+1+c*d;f.push(T,S,E),f.push(S,A,E)}this.setIndex(f),this.setAttribute("position",new We(g,3)),this.setAttribute("normal",new We(v,3)),this.setAttribute("uv",new We(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}};var Xs=class i extends Bn{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,u=[],p=new U,h=new U,f=[],g=[],v=[],m=[];for(let d=0;d<=n;d++){let M=[],T=d/n,S=o+T*a,A=t*Math.cos(S),E=Math.sqrt(t*t-A*A),_=0;d===0&&o===0?_=.5/e:d===n&&l===Math.PI&&(_=-.5/e);for(let b=0;b<=e;b++){let O=b/e,L=s+O*r;p.x=-E*Math.cos(L),p.y=A,p.z=E*Math.sin(L),g.push(p.x,p.y,p.z),h.copy(p).normalize(),v.push(h.x,h.y,h.z),m.push(O+_,1-T),M.push(c++)}u.push(M)}for(let d=0;d<n;d++)for(let M=0;M<e;M++){let T=u[d][M+1],S=u[d][M],A=u[d+1][M],E=u[d+1][M+1];(d!==0||o>0)&&f.push(T,S,E),(d!==n-1||l<Math.PI)&&f.push(S,A,E)}this.setIndex(f),this.setAttribute("position",new We(g,3)),this.setAttribute("normal",new We(v,3)),this.setAttribute("uv",new We(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};function Pi(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];if(Lc(s))s.isRenderTargetTexture?(Dt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(Lc(s[0])){let r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function Ve(i){let t={};for(let e=0;e<i.length;e++){let n=Pi(i[e]);for(let s in n)t[s]=n[s]}return t}function Lc(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function vd(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Tl(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Kt.workingColorSpace}var Th={clone:Pi,merge:Ve},Md=`void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Sd=`void main() {
  gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,ze=class extends ni{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Md,this.fragmentShader=Sd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Pi(t.uniforms),this.uniformsGroups=vd(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new It().setHex(s.value);break;case"v2":this.uniforms[n].value=new Nt().fromArray(s.value);break;case"v3":this.uniforms[n].value=new U().fromArray(s.value);break;case"v4":this.uniforms[n].value=new oe().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Bt().fromArray(s.value);break;case"m4":this.uniforms[n].value=new se().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},to=class extends ze{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}};var qs=class extends ni{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new It(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new It(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=na,this.normalScale=new Nt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new On,this.combine=mo,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},eo=class extends ni{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=ch,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},no=class extends ni{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Zi(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function Ur(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var ri=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let o;e:{i:if(!(t<s)){for(let a=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=e[++n],t<s)break t}o=e.length;break e}if(!(t>=r)){let a=e[1];t<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=e[--n-1],t>=r)break t}o=n,n=0;break e}break n}for(;n<o;){let a=n+o>>>1;t<e[a]?o=a:n=a+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let o=0;o!==s;++o)e[o]=n[r+o];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},io=class extends ri{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Wa,endingEnd:Wa}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,o=t+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Xa:r=t,a=2*e-n;break;case qa:r=s.length-2,a=e+s[r]-s[r+1];break;default:r=t,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Xa:o=t,l=2*n-e;break;case qa:o=1,l=n+s[1]-s[0];break;default:o=t-1,l=e}let c=(n-e)*.5,u=this.valueSize;this._weightPrev=c/(e-a),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,u=this._offsetPrev,p=this._offsetNext,h=this._weightPrev,f=this._weightNext,g=(n-e)/(s-e),v=g*g,m=v*g,d=-h*m+2*h*v-h*g,M=(1+h)*m+(-1.5-2*h)*v+(-.5+h)*g+1,T=(-1-f)*m+(1.5+f)*v+.5*g,S=f*m-f*v;for(let A=0;A!==a;++A)r[A]=d*o[u+A]+M*o[c+A]+T*o[l+A]+S*o[p+A];return r}},so=class extends ri{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,u=(n-e)/(s-e),p=1-u;for(let h=0;h!==a;++h)r[h]=o[c+h]*p+o[l+h]*u;return r}},ro=class extends ri{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},oo=class extends ri{interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,u=this.inTangents,p=this.outTangents;if(!u||!p){let g=(n-e)/(s-e),v=1-g;for(let m=0;m!==a;++m)r[m]=o[c+m]*v+o[l+m]*g;return r}let h=a*2,f=t-1;for(let g=0;g!==a;++g){let v=o[c+g],m=o[l+g],d=f*h+g*2,M=p[d],T=p[d+1],S=t*h+g*2,A=u[S],E=u[S+1],_=wd(n,e,M,A,s);r[g]=Eh(_,v,T,E,m)}return r}};function Eh(i,t,e,n,s){let r=1-i;return r*r*r*t+3*r*r*i*e+3*r*i*i*n+i*i*i*s}function bd(i,t,e,n,s){let r=1-i;return 3*r*r*(e-t)+6*r*i*(n-e)+3*i*i*(s-n)}function wd(i,t,e,n,s){let r=(i-t)/(s-t);for(let o=0;o<8;o++){let a=Eh(r,t,e,n,s)-i;if(Math.abs(a)<1e-10)break;let l=bd(r,t,e,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-a/l))}return r}var tn=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Zi(e,this.TimeBufferType),this.values=Zi(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:Zi(t.times,Array),values:Zi(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s),Ur(t.settings)&&(n.settings={inTangents:Zi(t.settings.inTangents,Array),outTangents:Zi(t.settings.outTangents,Array)})}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new ro(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new so(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new io(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new oo(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case Ps:e=this.InterpolantFactoryMethodDiscrete;break;case Jr:e=this.InterpolantFactoryMethodLinear;break;case Br:e=this.InterpolantFactoryMethodSmooth;break;case Ha:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Dt("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ps;case this.InterpolantFactoryMethodLinear:return Jr;case this.InterpolantFactoryMethodSmooth:return Br;case this.InterpolantFactoryMethodBezier:return Ha}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t;Ur(this.settings)&&(Dc(this.settings.inTangents,t),Dc(this.settings.outTangents,t))}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t;Ur(this.settings)&&(Nc(this.settings.inTangents,t),Nc(this.settings.outTangents,t))}return this}trim(t,e){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<t;)++r;for(;o!==-1&&n[o]>e;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Ot("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Ot("KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){Ot("KeyframeTrack: Time is not a valid number.",this,a,l),t=!1;break}if(o!==null&&o>l){Ot("KeyframeTrack: Out of order keys.",this,a,l,o),t=!1;break}o=l}if(s!==void 0&&zu(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){Ot("KeyframeTrack: Value is not a valid number.",this,a,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Br,r=t.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=t[a],u=t[a+1];if(c!==u&&(a!==1||c!==t[0]))if(s)l=!0;else{let p=a*n,h=p-n,f=p+n;for(let g=0;g!==n;++g){let v=e[p+g];if(v!==e[h+g]||v!==e[f+g]){l=!0;break}}}if(l){if(a!==o){t[o]=t[a];let p=a*n,h=o*n;for(let f=0;f!==n;++f)e[h+f]=e[p+f]}++o}}if(r>0){t[o]=t[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)e[l+c]=e[a+c];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,Ur(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function Dc(i,t){for(let e=0,n=i.length;e!==n;e+=2)i[e]+=t}function Nc(i,t){for(let e=0,n=i.length;e!==n;e+=2)i[e]*=t}tn.prototype.ValueTypeName="";tn.prototype.TimeBufferType=Float32Array;tn.prototype.ValueBufferType=Float32Array;tn.prototype.DefaultInterpolation=Jr;var oi=class extends tn{constructor(t,e,n){super(t,e,n)}};oi.prototype.ValueTypeName="bool";oi.prototype.ValueBufferType=Array;oi.prototype.DefaultInterpolation=Ps;oi.prototype.InterpolantFactoryMethodLinear=void 0;oi.prototype.InterpolantFactoryMethodSmooth=void 0;var ao=class extends tn{constructor(t,e,n,s){super(t,e,n,s)}};ao.prototype.ValueTypeName="color";var lo=class extends tn{constructor(t,e,n,s){super(t,e,n,s)}};lo.prototype.ValueTypeName="number";var co=class extends ri{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-e)/(s-e),c=t*a;for(let u=c+a;c!==u;c+=4)Qe.slerpFlat(r,0,o,c-a,o,c,l);return r}},Ys=class extends tn{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new co(this.times,this.values,this.getValueSize(),t)}};Ys.prototype.ValueTypeName="quaternion";Ys.prototype.InterpolantFactoryMethodSmooth=void 0;var ai=class extends tn{constructor(t,e,n){super(t,e,n)}};ai.prototype.ValueTypeName="string";ai.prototype.ValueBufferType=Array;ai.prototype.DefaultInterpolation=Ps;ai.prototype.InterpolantFactoryMethodLinear=void 0;ai.prototype.InterpolantFactoryMethodSmooth=void 0;var ho=class extends tn{constructor(t,e,n,s){super(t,e,n,s)}};ho.prototype.ValueTypeName="vector";var uo=class{constructor(t,e,n){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(u){a++,r===!1&&s.onStart!==void 0&&s.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,s.onProgress!==void 0&&s.onProgress(u,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,p){return c.push(u,p),this},this.removeHandler=function(u){let p=c.indexOf(u);return p!==-1&&c.splice(p,2),this},this.getHandler=function(u){for(let p=0,h=c.length;p<h;p+=2){let f=c[p],g=c[p+1];if(f.global&&(f.lastIndex=0),f.test(u))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Ah=new uo,fo=class{constructor(t){this.manager=t!==void 0?t:Ah,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}setPriority(t){return this.priority=t,this}setCache(t){return this.cache=t,this}abort(){return this}};fo.DEFAULT_MATERIAL_NAME="__DEFAULT";var rs=class extends _e{static registerNode(t){this.prototype._lightNode=t}constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new It(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},Zs=class extends rs{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(_e.DEFAULT_UP),this.updateMatrix(),this.groundColor=new It(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},ka=new se,Uc=new U,Fc=new U,Js=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Nt(512,512),this.mapType=Ge,this.map=null,this.mapPass=null,this.matrix=new se,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ii,this._frameExtents=new Nt(1,1),this._viewportCount=1,this._viewports=[new oe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;Uc.setFromMatrixPosition(t.matrixWorld),e.position.copy(Uc),Fc.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Fc),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,s){ka.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(ka,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,o=s?s.z/r.x:1,a=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;t.coordinateSystem===Qi||t.reversedDepth?e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),e.multiply(ka)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.mapType=t.mapType,this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.mapType=this.mapType,t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Fr=new U,Or=new Qe,Mn=new U,Ks=class extends _e{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new se,this.projectionMatrix=new se,this.projectionMatrixInverse=new se,this.coordinateSystem=rn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Fr,Or,Mn),Mn.x===1&&Mn.y===1&&Mn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Fr,Or,Mn.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(Fr,Or,Mn),Mn.x===1&&Mn.y===1&&Mn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Fr,Or,Mn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Qn=new U,Oc=new Nt,Bc=new Nt,Ie=class extends Ks{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Si*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Rs*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Si*2*Math.atan(Math.tan(Rs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Qn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Qn.x,Qn.y).multiplyScalar(-t/Qn.z),Qn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Qn.x,Qn.y).multiplyScalar(-t/Qn.z)}getViewSize(t,e){return this.getViewBounds(t,Oc,Bc),e.subVectors(Bc,Oc)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Rs*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,e-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},Ya=class extends Js{constructor(){super(new Ie(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(t){let e=this.camera,n=Si*2*t.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=t.distance||e.far;(n!==e.fov||s!==e.aspect||r!==e.far)&&(e.fov=n,e.aspect=s,e.far=r,e.updateProjectionMatrix()),super.updateMatrices(t)}copy(t){return super.copy(t),this.focus=t.focus,this.aspect=t.aspect,this}toJSON(){let t=super.toJSON();return t.focus=this.focus,t.aspect=this.aspect,t}},$s=class extends rs{constructor(t,e,n=0,s=Math.PI/3,r=0,o=2){super(t,e),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(_e.DEFAULT_UP),this.updateMatrix(),this.target=new _e,this.distance=n,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new Ya}get power(){return this.intensity*Math.PI}set power(t){this.intensity=t/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.angle=t.angle,this.penumbra=t.penumbra,this.decay=t.decay,this.target=t.target.clone(),this.map=t.map,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.angle=this.angle,e.object.decay=this.decay,e.object.penumbra=this.penumbra,e.object.target=this.target.uuid,this.map&&this.map.isTexture&&(e.object.map=this.map.toJSON(t).uuid),e.object.shadow=this.shadow.toJSON(),e}};var js=class extends Ks{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,o=n+t,a=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Za=class extends Js{constructor(){super(new js(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},os=class extends rs{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(_e.DEFAULT_UP),this.updateMatrix(),this.target=new _e,this.shadow=new Za}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var Ji=-90,Ki=1,as=class extends _e{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Ie(Ji,Ki,t,e);s.layers=this.layers,this.add(s);let r=new Ie(Ji,Ki,t,e);r.layers=this.layers,this.add(r);let o=new Ie(Ji,Ki,t,e);o.layers=this.layers,this.add(o);let a=new Ie(Ji,Ki,t,e);a.layers=this.layers,this.add(a);let l=new Ie(Ji,Ki,t,e);l.layers=this.layers,this.add(l);let c=new Ie(Ji,Ki,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,l]=e;for(let c of e)this.remove(c);if(t===rn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Qi)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,u]=this.children,p=t.getRenderTarget(),h=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let v=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,2,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,3,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(n,4,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),n.texture.mipmapsAutoUpdate=v,t.setRenderTarget(n,5,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,u),t.setRenderTarget(p,h,f),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},po=class extends Ie{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t,this.perCameraFrustumCulled=!1}};var El="\\[\\]\\.:\\/",Td=new RegExp("["+El+"]","g"),Al="[^"+El+"]",Ed="[^"+El.replace("\\.","")+"]",Ad=/((?:WC+[\/:])*)/.source.replace("WC",Al),Rd=/(WCOD+)?/.source.replace("WCOD",Ed),Cd=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Al),Pd=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Al),Id=new RegExp("^"+Ad+Rd+Cd+Pd+"$"),Ld=["material","materials","bones","map"],Ja=class{constructor(t,e,n){let s=n||he.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},he=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Td,"")}static parseTrackName(t){let e=Id.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Ld.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let l=n(a.children);if(l)return l}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Dt("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){Ot("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Ot("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Ot("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let u=0;u<t.length;u++)if(t[u].name===c){c=u;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Ot("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Ot("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){Ot("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){Ot("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let o=t[s];if(o===void 0){let c=e.nodeName;Ot("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Ot("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Ot("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};he.Composite=Ja;he.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};he.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};he.prototype.GetterByBindingType=[he.prototype._getValue_direct,he.prototype._getValue_array,he.prototype._getValue_arrayElement,he.prototype._getValue_toArray];he.prototype.SetterByBindingTypeAndVersioning=[[he.prototype._setValue_direct,he.prototype._setValue_direct_setNeedsUpdate,he.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[he.prototype._setValue_array,he.prototype._setValue_array_setNeedsUpdate,he.prototype._setValue_array_setMatrixWorldNeedsUpdate],[he.prototype._setValue_arrayElement,he.prototype._setValue_arrayElement_setNeedsUpdate,he.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[he.prototype._setValue_fromArray,he.prototype._setValue_fromArray_setNeedsUpdate,he.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var o_=new Float32Array(1);var ls=class{constructor(t=1,e=0,n=0){this.radius=t,this.phi=e,this.theta=n}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=qt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){return this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,n),this.phi=Math.acos(qt(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var Ka=class{static{this.prototype.isMatrix2=!0}constructor(t,e,n,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=s,this}};var Qs=class extends mn{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){this.domElement!==null&&this.disconnect(),this.domElement=t}disconnect(){}dispose(){}update(){}};function Rl(i,t,e,n){let s=Dd(n);switch(e){case pl:return i*t;case So:return i*t/s.components*s.byteLength;case bo:return i*t/s.components*s.byteLength;case ui:return i*t*2/s.components*s.byteLength;case wo:return i*t*2/s.components*s.byteLength;case ml:return i*t*3/s.components*s.byteLength;case _n:return i*t*4/s.components*s.byteLength;case To:return i*t*4/s.components*s.byteLength;case er:case nr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case ir:case sr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Ao:case Co:return Math.max(i,16)*Math.max(t,8)/4;case Eo:case Ro:return Math.max(i,8)*Math.max(t,8)/2;case Po:case Io:case Do:case No:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Lo:case rr:case Uo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Fo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Oo:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Bo:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case zo:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Go:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case Vo:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case ko:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Ho:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Wo:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Xo:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case qo:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Yo:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Zo:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Jo:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Ko:case $o:case jo:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Qo:case ta:return Math.ceil(i/4)*Math.ceil(t/4)*8;case or:case ea:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Dd(i){switch(i){case Ge:case hl:return{byteLength:1,components:1};case ds:case ul:case en:return{byteLength:2,components:1};case vo:case Mo:return{byteLength:2,components:4};case gn:case yo:case ln:return{byteLength:4,components:1};case dl:case fl:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));typeof window<"u"&&(window.__THREE__?Dt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="187");function Jh(){let i=null,t=!1,e=null,n=null;function s(r,o){n=i.requestAnimationFrame(s),e(r,o)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Ud(i){let t=new WeakMap;function e(a,l){let c=a.array,u=a.usage,p=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,u),a.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:p}}function n(a,l,c){let u=l.array,p=l.updateRanges;if(i.bindBuffer(c,a),p.length===0)i.bufferSubData(c,0,u);else{p.sort((f,g)=>f.start-g.start);let h=0;for(let f=1;f<p.length;f++){let g=p[h],v=p[f];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++h,p[h]=v)}p.length=h+1;for(let f=0,g=p.length;f<g;f++){let v=p[f];i.bufferSubData(c,v.start*u.BYTES_PER_ELEMENT,u,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=t.get(a);l&&(i.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=t.get(a);(!u||u.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var Fd=`#ifdef USE_ALPHAHASH
  if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Od=`#ifdef USE_ALPHAHASH
  const float ALPHA_HASH_SCALE = 0.05;
  float hash2D( vec2 value ) {
    return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
  }
  float hash3D( vec3 value ) {
    return hash2D( vec2( hash2D( value.xy ), value.z ) );
  }
  float getAlphaHashThreshold( vec3 position ) {
    float maxDeriv = max(
      length( dFdx( position.xyz ) ),
      length( dFdy( position.xyz ) )
    );
    float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
    vec2 pixScales = vec2(
      exp2( floor( log2( pixScale ) ) ),
      exp2( ceil( log2( pixScale ) ) )
    );
    vec2 alpha = vec2(
      hash3D( floor( pixScales.x * position.xyz ) ),
      hash3D( floor( pixScales.y * position.xyz ) )
    );
    float lerpFactor = fract( log2( pixScale ) );
    float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
    float a = min( lerpFactor, 1.0 - lerpFactor );
    vec3 cases = vec3(
      x * x / ( 2.0 * a * ( 1.0 - a ) ),
      ( x - 0.5 * a ) / ( 1.0 - a ),
      1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
    );
    float threshold = ( x < ( 1.0 - a ) )
      ? ( ( x < a ) ? cases.x : cases.y )
      : cases.z;
    return clamp( threshold , 1.0e-6, 1.0 );
  }
#endif`,Bd=`#ifdef USE_ALPHAMAP
  diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,zd=`#ifdef USE_ALPHAMAP
  uniform sampler2D alphaMap;
#endif`,Gd=`#ifdef USE_ALPHATEST
  #ifdef ALPHA_TO_COVERAGE
  diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
  if ( diffuseColor.a == 0.0 ) discard;
  #else
  if ( diffuseColor.a < alphaTest ) discard;
  #endif
#endif`,Vd=`#ifdef USE_ALPHATEST
  uniform float alphaTest;
#endif`,kd=`#ifdef USE_AOMAP
  float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
  reflectedLight.indirectDiffuse *= ambientOcclusion;
  #if defined( USE_CLEARCOAT )
    clearcoatSpecularIndirect *= ambientOcclusion;
  #endif
  #if defined( USE_SHEEN )
    sheenSpecularIndirect *= ambientOcclusion;
  #endif
  #if defined( USE_ENVMAP ) && defined( STANDARD )
    float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
    reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
  #endif
#endif`,Hd=`#ifdef USE_AOMAP
  uniform sampler2D aoMap;
  uniform float aoMapIntensity;
#endif`,Wd=`#ifdef USE_BATCHING
  #if ! defined( GL_ANGLE_multi_draw )
  #define gl_DrawID _gl_DrawID
  uniform int _gl_DrawID;
  #endif
  uniform highp sampler2D batchingTexture;
  uniform highp usampler2D batchingIdTexture;
  mat4 getBatchingMatrix( const in float i ) {
    int size = textureSize( batchingTexture, 0 ).x;
    int j = int( i ) * 4;
    int x = j % size;
    int y = j / size;
    vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
    vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
    vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
    vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
    return mat4( v1, v2, v3, v4 );
  }
  float getIndirectIndex( const in int i ) {
    int size = textureSize( batchingIdTexture, 0 ).x;
    int x = i % size;
    int y = i / size;
    return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
  }
#endif
#ifdef USE_BATCHING_COLOR
  uniform sampler2D batchingColorTexture;
  vec4 getBatchingColor( const in float i ) {
    int size = textureSize( batchingColorTexture, 0 ).x;
    int j = int( i );
    int x = j % size;
    int y = j / size;
    return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
  }
#endif`,Xd=`#ifdef USE_BATCHING
  mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,qd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
  vPosition = vec3( position );
#endif`,Yd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
  vec3 objectTangent = vec3( tangent.xyz );
#endif`,Zd=`float G_BlinnPhong_Implicit( ) {
  return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
  return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
  vec3 halfDir = normalize( lightDir + viewDir );
  float dotNH = saturate( dot( normal, halfDir ) );
  float dotVH = saturate( dot( viewDir, halfDir ) );
  vec3 F = F_Schlick( specularColor, 1.0, dotVH );
  float G = G_BlinnPhong_Implicit( );
  float D = D_BlinnPhong( shininess, dotNH );
  return F * ( G * D );
} // validated`,Jd=`#ifdef USE_IRIDESCENCE
  const mat3 XYZ_TO_REC709 = mat3(
     3.2404542, -0.9692660,  0.0556434,
    -1.5371385,  1.8760108, -0.2040259,
    -0.4985314,  0.0415560,  1.0572252
  );
  vec3 Fresnel0ToIor( vec3 fresnel0 ) {
    vec3 sqrtF0 = sqrt( fresnel0 );
    return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
  }
  vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
    return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
  }
  float IorToFresnel0( float transmittedIor, float incidentIor ) {
    return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
  }
  vec3 evalSensitivity( float OPD, vec3 shift ) {
    float phase = 2.0 * PI * OPD * 1.0e-9;
    vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
    vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
    vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
    vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
    xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
    xyz /= 1.0685e-7;
    vec3 rgb = XYZ_TO_REC709 * xyz;
    return rgb;
  }
  vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
    vec3 I;
    float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
    float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
    float cosTheta2Sq = 1.0 - sinTheta2Sq;
    if ( cosTheta2Sq < 0.0 ) {
      return vec3( 1.0 );
    }
    float cosTheta2 = sqrt( cosTheta2Sq );
    float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
    float R12 = F_Schlick( R0, 1.0, cosTheta1 );
    float T121 = 1.0 - R12;
    float phi12 = 0.0;
    if ( iridescenceIOR < outsideIOR ) phi12 = PI;
    float phi21 = PI - phi12;
    vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
    vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
    vec3 phi23 = vec3( 0.0 );
    if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
    if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
    if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
    float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
    vec3 phi = vec3( phi21 ) + phi23;
    vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
    vec3 r123 = sqrt( R123 );
    vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
    vec3 C0 = R12 + Rs;
    I = C0;
    vec3 Cm = Rs - T121;
    for ( int m = 1; m <= 2; ++ m ) {
      Cm *= r123;
      vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
      I += Cm * Sm;
    }
    return max( I, vec3( 0.0 ) );
  }
#endif`,Kd=`#ifdef USE_BUMPMAP
  uniform sampler2D bumpMap;
  uniform float bumpScale;
  vec2 dHdxy_fwd() {
    vec2 dSTdx = dFdx( vBumpMapUv );
    vec2 dSTdy = dFdy( vBumpMapUv );
    float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
    float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
    float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
    return vec2( dBx, dBy );
  }
  vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
    vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
    vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
    vec3 vN = surf_norm;
    vec3 R1 = cross( vSigmaY, vN );
    vec3 R2 = cross( vN, vSigmaX );
    float fDet = dot( vSigmaX, R1 ) * faceDirection;
    vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
    return normalize( abs( fDet ) * surf_norm - vGrad );
  }
#endif`,$d=`#if NUM_CLIPPING_PLANES > 0
  vec4 plane;
  #ifdef ALPHA_TO_COVERAGE
    float distanceToPlane, distanceGradient;
    float clipOpacity = 1.0;
    #pragma unroll_loop_start
    for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
      plane = clippingPlanes[ i ];
      distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
      distanceGradient = fwidth( distanceToPlane ) / 2.0;
      clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
      if ( clipOpacity == 0.0 ) discard;
    }
    #pragma unroll_loop_end
    #if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
      float unionClipOpacity = 1.0;
      #pragma unroll_loop_start
      for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
        plane = clippingPlanes[ i ];
        distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
        distanceGradient = fwidth( distanceToPlane ) / 2.0;
        unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
      }
      #pragma unroll_loop_end
      clipOpacity *= 1.0 - unionClipOpacity;
    #endif
    diffuseColor.a *= clipOpacity;
    if ( diffuseColor.a == 0.0 ) discard;
  #else
    #pragma unroll_loop_start
    for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
      plane = clippingPlanes[ i ];
      if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
    }
    #pragma unroll_loop_end
    #if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
      bool clipped = true;
      #pragma unroll_loop_start
      for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
        plane = clippingPlanes[ i ];
        clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
      }
      #pragma unroll_loop_end
      if ( clipped ) discard;
    #endif
  #endif
#endif`,jd=`#if NUM_CLIPPING_PLANES > 0
  varying vec3 vClipPosition;
  uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Qd=`#if NUM_CLIPPING_PLANES > 0
  varying vec3 vClipPosition;
#endif`,tf=`#if NUM_CLIPPING_PLANES > 0
  vClipPosition = - mvPosition.xyz;
#endif`,ef=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
  diffuseColor *= vColor;
#endif`,nf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
  varying vec4 vColor;
#endif`,sf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
  varying vec4 vColor;
#endif`,rf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
  vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
  vColor *= color;
#elif defined( USE_COLOR )
  vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
  vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
  vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,of=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
  const highp float a = 12.9898, b = 78.233, c = 43758.5453;
  highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
  return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
  float precisionSafeLength( vec3 v ) { return length( v ); }
#else
  float precisionSafeLength( vec3 v ) {
    float maxComponent = max3( abs( v ) );
    return length( v / maxComponent ) * maxComponent;
  }
#endif
struct IncidentLight {
  vec3 color;
  vec3 direction;
  bool visible;
};
struct ReflectedLight {
  vec3 directDiffuse;
  vec3 directSpecular;
  vec3 indirectDiffuse;
  vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
  varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
  return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
  return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
  return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
  return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
  float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
  float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
  return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
  return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
  float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
  return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
  float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
  return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,af=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
  vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
  mat3 bm = mat3( batchingMatrix );
  transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
  transformedNormal = bm * transformedNormal;
  #ifdef USE_TANGENT
    transformedTangent = bm * transformedTangent;
  #endif
#endif
#ifdef USE_INSTANCING
  mat3 im = mat3( instanceMatrix );
  transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
  transformedNormal = im * transformedNormal;
  #ifdef USE_TANGENT
    transformedTangent = im * transformedTangent;
  #endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
  transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
  transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,lf=`#ifdef USE_DISPLACEMENTMAP
  uniform sampler2D displacementMap;
  uniform float displacementScale;
  uniform float displacementBias;
#endif`,cf=`#ifdef USE_DISPLACEMENTMAP
  transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,hf=`#ifdef USE_EMISSIVEMAP
  vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
  #ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
    emissiveColor = sRGBTransferEOTF( emissiveColor );
  #endif
  totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,uf=`#ifdef USE_EMISSIVEMAP
  uniform sampler2D emissiveMap;
#endif`,df="gl_FragColor = linearToOutputTexel( gl_FragColor );",ff=`vec4 LinearTransferOETF( in vec4 value ) {
  return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
  return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
  return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,pf=`#ifdef USE_ENVMAP
  #ifdef ENV_WORLDPOS
    vec3 cameraToFrag;
    if ( isOrthographic ) {
      cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
    } else {
      cameraToFrag = normalize( vWorldPosition - cameraPosition );
    }
    vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
    #ifdef ENVMAP_MODE_REFLECTION
      vec3 reflectVec = reflect( cameraToFrag, worldNormal );
    #else
      vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
    #endif
  #else
    vec3 reflectVec = vReflect;
  #endif
  #ifdef ENVMAP_TYPE_CUBE
    vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
    #ifdef ENVMAP_BLENDING_MULTIPLY
      outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
    #elif defined( ENVMAP_BLENDING_MIX )
      outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
    #elif defined( ENVMAP_BLENDING_ADD )
      outgoingLight += envColor.xyz * specularStrength * reflectivity;
    #endif
  #endif
#endif`,mf=`#ifdef USE_ENVMAP
  uniform float envMapIntensity;
  uniform mat3 envMapRotation;
  uniform samplerCube envMap;
  #ifdef ENVMAP_TYPE_PMREM
    float roughnessToMip( const in float roughness ) {
      float r = clamp( roughness, 0.0, 1.0 );
      return ENVMAP_MAX_LOD * r * ( 2.0 - r );
    }
  #endif
#endif`,gf=`#ifdef USE_ENVMAP
  uniform float reflectivity;
  #if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
    #define ENV_WORLDPOS
  #endif
  #ifdef ENV_WORLDPOS
    varying vec3 vWorldPosition;
    uniform float refractionRatio;
  #else
    varying vec3 vReflect;
  #endif
#endif`,_f=`#ifdef USE_ENVMAP
  #if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
    #define ENV_WORLDPOS
  #endif
  #ifdef ENV_WORLDPOS

    varying vec3 vWorldPosition;
  #else
    varying vec3 vReflect;
    uniform float refractionRatio;
  #endif
#endif`,xf=`#ifdef USE_ENVMAP
  #ifdef ENV_WORLDPOS
    vWorldPosition = worldPosition.xyz;
  #else
    vec3 cameraToVertex;
    if ( isOrthographic ) {
      cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
    } else {
      cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
    }
    vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
    #ifdef ENVMAP_MODE_REFLECTION
      vReflect = reflect( cameraToVertex, worldNormal );
    #else
      vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
    #endif
  #endif
#endif`,yf=`#ifdef USE_FOG
  vFogDepth = - mvPosition.z;
#endif`,vf=`#ifdef USE_FOG
  varying float vFogDepth;
#endif`,Mf=`#ifdef USE_FOG
  #ifdef FOG_EXP2
    float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
  #else
    float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
  #endif
  gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Sf=`#ifdef USE_FOG
  uniform vec3 fogColor;
  varying float vFogDepth;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear;
    uniform float fogFar;
  #endif
#endif`,bf=`#ifdef USE_GRADIENTMAP
  uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
  float dotNL = dot( normal, lightDirection );
  vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
  #ifdef USE_GRADIENTMAP
    return vec3( texture2D( gradientMap, coord ).r );
  #else
    vec2 fw = fwidth( coord ) * 0.5;
    return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
  #endif
}`,wf=`#ifdef USE_LIGHTMAP
  uniform sampler2D lightMap;
  uniform float lightMapIntensity;
#endif`,Tf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Ef=`varying vec3 vViewPosition;
struct LambertMaterial {
  vec3 diffuseColor;
  float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
  float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
  vec3 irradiance = dotNL * directLight.color;
  reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
  reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Af=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
  uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
  float x = normal.x, y = normal.y, z = normal.z;
  vec3 result = shCoefficients[ 0 ] * 0.886227;
  result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
  result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
  result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
  result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
  result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
  result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
  result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
  result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
  return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
  vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
  vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
  return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
  vec3 irradiance = ambientLightColor;
  return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
  float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
  if ( cutoffDistance > 0.0 ) {
    distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
  }
  return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
  return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
  struct SunLight {
    vec3 direction;
    vec3 color;
  };
  uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
  void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
    light.color = sunLight.color;
    light.direction = sunLight.direction;
    light.visible = true;
  }
#endif
#if NUM_DIR_LIGHTS > 0
  struct DirectionalLight {
    vec3 direction;
    vec3 color;
  };
  uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
  void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
    light.color = directionalLight.color;
    light.direction = directionalLight.direction;
    light.visible = true;
  }
#endif
#if NUM_POINT_LIGHTS > 0
  struct PointLight {
    vec3 position;
    vec3 color;
    float distance;
    float decay;
  };
  uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
  void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
    vec3 lVector = pointLight.position - geometryPosition;
    light.direction = normalize( lVector );
    float lightDistance = length( lVector );
    light.color = pointLight.color;
    light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
    light.visible = ( light.color != vec3( 0.0 ) );
  }
#endif
#if NUM_SPOT_LIGHTS > 0
  struct SpotLight {
    vec3 position;
    vec3 direction;
    vec3 color;
    float distance;
    float decay;
    float coneCos;
    float penumbraCos;
  };
  uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
  void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
    vec3 lVector = spotLight.position - geometryPosition;
    light.direction = normalize( lVector );
    float angleCos = dot( light.direction, spotLight.direction );
    float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
    if ( spotAttenuation > 0.0 ) {
      float lightDistance = length( lVector );
      light.color = spotLight.color * spotAttenuation;
      light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
      light.visible = ( light.color != vec3( 0.0 ) );
    } else {
      light.color = vec3( 0.0 );
      light.visible = false;
    }
  }
#endif
#if NUM_RECT_AREA_LIGHTS > 0
  struct RectAreaLight {
    vec3 color;
    vec3 position;
    vec3 halfWidth;
    vec3 halfHeight;
  };
  uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
  uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
  struct HemisphereLight {
    vec3 direction;
    vec3 skyColor;
    vec3 groundColor;
  };
  uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
  vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
    float dotNL = dot( normal, hemiLight.direction );
    float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
    vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
    return irradiance;
  }
#endif
#include <lightprobes_pars_fragment>`,Rf=`#ifdef USE_ENVMAP
  vec3 getIBLIrradiance( const in vec3 normal ) {
    #ifdef ENVMAP_TYPE_PMREM
      vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
      vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
      return PI * envMapColor.rgb * envMapIntensity;
    #else
      return vec3( 0.0 );
    #endif
  }
  vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
    #ifdef ENVMAP_TYPE_PMREM
      vec3 reflectVec = reflect( - viewDir, normal );
      reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
      reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
      vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
      return envMapColor.rgb * envMapIntensity;
    #else
      return vec3( 0.0 );
    #endif
  }
  #ifdef USE_RETROREFLECTION
    vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
      #ifdef ENVMAP_TYPE_PMREM
        vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
        retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
        vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
        return envMapColor.rgb * envMapIntensity;
      #else
        return vec3( 0.0 );
      #endif
    }
  #endif
  #ifdef USE_ANISOTROPY
    vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
      #ifdef ENVMAP_TYPE_PMREM
        vec3 bentNormal = cross( bitangent, viewDir );
        bentNormal = normalize( cross( bentNormal, bitangent ) );
        bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
        return getIBLRadiance( viewDir, bentNormal, roughness );
      #else
        return vec3( 0.0 );
      #endif
    }
    #ifdef USE_RETROREFLECTION
      vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
        #ifdef ENVMAP_TYPE_PMREM
          vec3 bentNormal = cross( bitangent, viewDir );
          bentNormal = normalize( cross( bentNormal, bitangent ) );
          bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
          return getIBLRetroRadiance( viewDir, bentNormal, roughness );
        #else
          return vec3( 0.0 );
        #endif
      }
    #endif
  #endif
#endif`,Cf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Pf=`varying vec3 vViewPosition;
struct ToonMaterial {
  vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
  vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
  reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
  reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,If=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Lf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
  vec3 diffuseColor;
  vec3 specularColor;
  float specularShininess;
  float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
  float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
  vec3 irradiance = dotNL * directLight.color;
  reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
  reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
  reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Df=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
  float diffuseRoughnessFactor = diffuseRoughness;
  #ifdef USE_DIFFUSE_ROUGHNESSMAP
    diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
  #endif
  material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
  material.ior = ior;
  #ifdef USE_SPECULAR
    float specularIntensityFactor = specularIntensity;
    vec3 specularColorFactor = specularColor;
    #ifdef USE_SPECULAR_COLORMAP
      specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
    #endif
    #ifdef USE_SPECULAR_INTENSITYMAP
      specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
    #endif
    material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
  #else
    float specularIntensityFactor = 1.0;
    vec3 specularColorFactor = vec3( 1.0 );
    material.specularF90 = 1.0;
  #endif
  material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
  material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
  material.specularColor = vec3( 0.04 );
  material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
  material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
  material.clearcoat = clearcoat;
  material.clearcoatRoughness = clearcoatRoughness;
  material.clearcoatF0 = vec3( 0.04 );
  material.clearcoatF90 = 1.0;
  #ifdef USE_CLEARCOATMAP
    material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
  #endif
  #ifdef USE_CLEARCOAT_ROUGHNESSMAP
    material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
  #endif
  material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
  material.clearcoatRoughness += geometryRoughness;
  material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
  material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
  material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
  material.iridescence = iridescence;
  material.iridescenceIOR = iridescenceIOR;
  #ifdef USE_IRIDESCENCEMAP
    material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
  #endif
  #ifdef USE_IRIDESCENCE_THICKNESSMAP
    material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
  #else
    material.iridescenceThickness = iridescenceThicknessMaximum;
  #endif
#endif
#ifdef USE_SHEEN
  material.sheenColor = sheenColor;
  #ifdef USE_SHEEN_COLORMAP
    material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
  #endif
  material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
  #ifdef USE_SHEEN_ROUGHNESSMAP
    material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
  #endif
#endif
#ifdef USE_ANISOTROPY
  #ifdef USE_ANISOTROPYMAP
    mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
    vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
    vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
  #else
    vec2 anisotropyV = anisotropyVector;
  #endif
  material.anisotropy = length( anisotropyV );
  if( material.anisotropy == 0.0 ) {
    anisotropyV = vec2( 1.0, 0.0 );
  } else {
    anisotropyV /= material.anisotropy;
    material.anisotropy = saturate( material.anisotropy );
  }
  material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
  material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
  material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Nf=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
  vec3 diffuseColor;
  vec3 diffuseContribution;
  vec3 specularColor;
  vec3 specularColorBlended;
  float roughness;
  float metalness;
  float specularF90;
  float dispersion;
  vec2 dfg;
  vec3 multiScatteringCompensation;
  #ifdef USE_DIFFUSE_ROUGHNESS
    float diffuseRoughness;
  #endif
  #ifdef USE_RETROREFLECTION
    float retroreflectivity;
  #endif
  #ifdef USE_CLEARCOAT
    float clearcoat;
    float clearcoatRoughness;
    vec3 clearcoatF0;
    float clearcoatF90;
  #endif
  #ifdef USE_IRIDESCENCE
    float iridescence;
    float iridescenceIOR;
    float iridescenceThickness;
    vec3 iridescenceFresnel;
    vec3 iridescenceF0Dielectric;
    vec3 iridescenceF0Metallic;
  #endif
  #ifdef USE_SHEEN
    vec3 sheenColor;
    float sheenRoughness;
  #endif
  #ifdef IOR
    float ior;
  #endif
  #ifdef USE_TRANSMISSION
    float transmission;
    float transmissionAlpha;
    float thickness;
    float attenuationDistance;
    vec3 attenuationColor;
  #endif
  #ifdef USE_ANISOTROPY
    float anisotropy;
    float alphaT;
    vec3 anisotropyT;
    vec3 anisotropyB;
  #endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
  const float EON_EPSILON = 1e-7;
  float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
    float muComp = 1.0 - mu;
    float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
    return A * ( 1.0 + roughness * gOverPi );
  }
  vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
    vec3 rho = saturate( diffuseColor );
    if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
    float dotNL = saturate( dot( normal, lightDir ) );
    float dotNV = saturate( dot( normal, viewDir ) );
    float s = dot( lightDir, viewDir ) - dotNL * dotNV;
    float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
    float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
    vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
    float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
    float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
    float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
    vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
    vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
      * max( EON_EPSILON, 1.0 - albedoV )
      * max( EON_EPSILON, 1.0 - albedoL )
      / max( EON_EPSILON, 1.0 - averageAlbedo );
    return singleScatter + multiScatter;
  }
  vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
    vec3 rho = saturate( diffuseColor );
    if ( roughness <= EON_EPSILON ) return rho;
    float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
    float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
    float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
    vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
    return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
  }
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
  float a2 = pow2( alpha );
  float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
  float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
  return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
  float a2 = pow2( alpha );
  float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
  return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
  float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
    float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
    float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
    return 0.5 / max( gv + gl, EPSILON );
  }
  float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
    float a2 = alphaT * alphaB;
    highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
    highp float v2 = dot( v, v );
    float w2 = a2 / v2;
    return RECIPROCAL_PI * a2 * pow2 ( w2 );
  }
#endif
#ifdef USE_CLEARCOAT
  vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
    vec3 f0 = material.clearcoatF0;
    float f90 = material.clearcoatF90;
    float roughness = max( material.clearcoatRoughness, 0.045 );
    float alpha = pow2( roughness );
    vec3 halfDir = normalize( lightDir + viewDir );
    float dotNL = saturate( dot( normal, lightDir ) );
    float dotNV = saturate( dot( normal, viewDir ) );
    float dotNH = saturate( dot( normal, halfDir ) );
    float dotVH = saturate( dot( viewDir, halfDir ) );
    vec3 F = F_Schlick( f0, f90, dotVH );
    float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
    float D = D_GGX( alpha, dotNH );
    return F * ( V * D );
  }
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
  vec3 f0 = material.specularColorBlended;
  float f90 = material.specularF90;
  float roughness = max( material.roughness, 0.045 );
  float alpha = pow2( roughness );
  vec3 halfDir = normalize( lightDir + viewDir );
  float dotNL = saturate( dot( normal, lightDir ) );
  float dotNV = saturate( dot( normal, viewDir ) );
  float dotNH = saturate( dot( normal, halfDir ) );
  float dotVH = saturate( dot( viewDir, halfDir ) );
  vec3 F = F_Schlick( f0, f90, dotVH );
  #ifdef USE_IRIDESCENCE
    F = mix( F, material.iridescenceFresnel, material.iridescence );
  #endif
  #ifdef USE_ANISOTROPY
    float dotTL = dot( material.anisotropyT, lightDir );
    float dotTV = dot( material.anisotropyT, viewDir );
    float dotTH = dot( material.anisotropyT, halfDir );
    float dotBL = dot( material.anisotropyB, lightDir );
    float dotBV = dot( material.anisotropyB, viewDir );
    float dotBH = dot( material.anisotropyB, halfDir );
    float alphaT = max( material.alphaT, alpha );
    float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
    float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
  #else
    float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
    float D = D_GGX( alpha, dotNH );
  #endif
  return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
  const float LUT_SIZE = 64.0;
  const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
  const float LUT_BIAS = 0.5 / LUT_SIZE;
  float dotNV = saturate( dot( N, V ) );
  vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
  uv = uv * LUT_SCALE + LUT_BIAS;
  return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
  float l = length( f );
  return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
  float x = dot( v1, v2 );
  float y = abs( x );
  float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
  float b = 3.4175940 + ( 4.1616724 + y ) * y;
  float v = a / b;
  float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
  return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
  vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
  vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
  vec3 lightNormal = cross( v1, v2 );
  if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
  vec3 T1, T2;
  T1 = normalize( V - N * dot( V, N ) );
  T2 = - cross( N, T1 );
  mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
  vec3 coords[ 4 ];
  coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
  coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
  coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
  coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
  coords[ 0 ] = normalize( coords[ 0 ] );
  coords[ 1 ] = normalize( coords[ 1 ] );
  coords[ 2 ] = normalize( coords[ 2 ] );
  coords[ 3 ] = normalize( coords[ 3 ] );
  vec3 vectorFormFactor = vec3( 0.0 );
  vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
  vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
  vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
  vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
  float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
  return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
  float alpha = pow2( roughness );
  float invAlpha = 1.0 / alpha;
  float cos2h = dotNH * dotNH;
  float sin2h = max( 1.0 - cos2h, 0.0078125 );
  return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
  return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
  vec3 halfDir = normalize( lightDir + viewDir );
  float dotNL = saturate( dot( normal, lightDir ) );
  float dotNV = saturate( dot( normal, viewDir ) );
  float dotNH = saturate( dot( normal, halfDir ) );
  float D = D_Charlie( sheenRoughness, dotNH );
  float V = V_Neubelt( dotNV, dotNL );
  return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
  float dotNV = saturate( dot( normal, viewDir ) );
  float r2 = roughness * roughness;
  float rInv = 1.0 / ( roughness + 0.1 );
  float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
  float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
  float DG = exp( a * dotNV + b );
  return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
  float dotNV = saturate( dot( normal, viewDir ) );
  vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
  return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
  #ifdef USE_IRIDESCENCE
    vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
  #else
    vec3 Fr = specularColor;
  #endif
  vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
  float Ess = fab.x + fab.y;
  float Ems = 1.0 - Ess;
  vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
  singleScatter += FssEss;
  multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
  void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
    vec3 normal = geometryNormal;
    vec3 viewDir = geometryViewDir;
    vec3 position = geometryPosition;
    vec3 lightPos = rectAreaLight.position;
    vec3 halfWidth = rectAreaLight.halfWidth;
    vec3 halfHeight = rectAreaLight.halfHeight;
    vec3 lightColor = rectAreaLight.color;
    float roughness = material.roughness;
    vec3 rectCoords[ 4 ];
    rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
    rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
    rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
    vec2 uv = LTC_Uv( normal, viewDir, roughness );
    vec4 t1 = texture2D( ltc_1, uv );
    vec4 t2 = texture2D( ltc_2, uv );
    mat3 mInv = mat3(
      vec3( t1.x, 0, t1.y ),
      vec3(    0, 1,    0 ),
      vec3( t1.z, 0, t1.w )
    );
    vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
    reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
    reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
    #ifdef USE_CLEARCOAT
      vec3 Ncc = geometryClearcoatNormal;
      vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
      vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
      vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
      mat3 mInvClearcoat = mat3(
        vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
        vec3(             0, 1,             0 ),
        vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
      );
      vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
      clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
    #endif
  }
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
  float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
  vec3 irradiance = dotNL * directLight.color;
  #ifdef USE_CLEARCOAT
    float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
    vec3 ccIrradiance = dotNLcc * directLight.color;
    clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
  #endif
  #ifdef USE_SHEEN

     sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );

     float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
     float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );

     float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );

     irradiance *= sheenEnergyComp;

   #endif
  vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
  #ifdef USE_RETROREFLECTION
    vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
    vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
    specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
  #endif
  reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
  vec3 halfDir = normalize( directLight.direction + geometryViewDir );
  float dotVH = saturate( dot( geometryViewDir, halfDir ) );
  vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
  #ifdef USE_RETROREFLECTION
    vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
    float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
    vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
    F = mix( F, retroF, saturate( material.retroreflectivity ) );
  #endif
  #ifdef USE_DIFFUSE_ROUGHNESS
    vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
  #else
    vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
  #endif
  reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
  vec3 singleScattering = vec3( 0.0 );
  vec3 multiScattering = vec3( 0.0 );
  #ifdef USE_IRIDESCENCE
    computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
  #else
    computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
  #endif
  #ifdef USE_DIFFUSE_ROUGHNESS
    float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
    vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
    vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
  #else
    vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
  #endif
  #ifdef USE_SHEEN
    float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
    sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
    float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
    diffuse *= sheenEnergyComp;
  #endif
  reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
  #ifdef USE_CLEARCOAT
    clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
  #endif
  #ifdef USE_SHEEN
    sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
   #endif
  vec3 singleScatteringDielectric = vec3( 0.0 );
  vec3 multiScatteringDielectric = vec3( 0.0 );
  vec3 singleScatteringMetallic = vec3( 0.0 );
  vec3 multiScatteringMetallic = vec3( 0.0 );
  #ifdef USE_IRIDESCENCE
    computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
    computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
  #else
    computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
    computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
  #endif
  vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
  vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
  vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
  #ifdef USE_DIFFUSE_ROUGHNESS
    float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
    vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
  #else
    vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
  #endif
  vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
  vec3 indirectSpecular = radiance * singleScattering;
  indirectSpecular += multiScattering * cosineWeightedIrradiance;
  vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
  #ifdef USE_SHEEN
    float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
    float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
    indirectSpecular *= sheenEnergyComp;
    indirectDiffuse *= sheenEnergyComp;
  #endif
  reflectedLight.indirectSpecular += indirectSpecular;
  reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
  return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Uf=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
  geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
  float dotNVi = saturate( dot( normal, geometryViewDir ) );
  if ( material.iridescenceThickness == 0.0 ) {
    material.iridescence = 0.0;
  } else {
    material.iridescence = saturate( material.iridescence );
  }
  if ( material.iridescence > 0.0 ) {
    vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
    vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
    material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
    material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
    material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
  }
#endif
#ifdef STANDARD
  float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
  material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
  #if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
    float EssMs = material.dfg.x + material.dfg.y;
    material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
  #endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
  PointLight pointLight;
  #if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
  PointLightShadow pointLightShadow;
  #endif
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
    pointLight = pointLights[ i ];
    getPointLightInfo( pointLight, geometryPosition, directLight );
    #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
    pointLightShadow = pointLightShadows[ i ];
    directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
    #endif
    RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
  }
  #pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
  SpotLight spotLight;
  vec4 spotColor;
  vec3 spotLightCoord;
  bool inSpotLightMap;
  #if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
  SpotLightShadow spotLightShadow;
  #endif
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
    spotLight = spotLights[ i ];
    getSpotLightInfo( spotLight, geometryPosition, directLight );
    #if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
    #define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
    #elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
    #define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
    #else
    #define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
    #endif
    #if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
      spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
      inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
      spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
      directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
    #endif
    #undef SPOT_LIGHT_MAP_INDEX
    #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
    spotLightShadow = spotLightShadows[ i ];
    directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
    #endif
    RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
  }
  #pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
  SunLight sunLight;
  #if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
  SunLightShadow sunLightShadow;
  #endif
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
    sunLight = sunLights[ i ];
    getSunLightInfo( sunLight, directLight );
    #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
    sunLightShadow = sunLightShadows[ i ];
    directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
    #endif
    RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
  }
  #pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
  DirectionalLight directionalLight;
  #if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
  DirectionalLightShadow directionalLightShadow;
  #endif
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
    directionalLight = directionalLights[ i ];
    getDirectionalLightInfo( directionalLight, directLight );
    #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
    directionalLightShadow = directionalLightShadows[ i ];
    directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
    #endif
    RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
  }
  #pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
  RectAreaLight rectAreaLight;
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
    rectAreaLight = rectAreaLights[ i ];
    RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
  }
  #pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
  vec3 iblIrradiance = vec3( 0.0 );
  vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
  #if defined( USE_LIGHT_PROBES )
    irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
  #endif
  #if ( NUM_HEMI_LIGHTS > 0 )
    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
      irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
    }
    #pragma unroll_loop_end
  #endif
  #if NUM_LIGHT_PROBE_GRIDS > 0
    vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
    vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
    int probeGrid = - 1;
    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
      if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
    }
    #pragma unroll_loop_end
    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
      if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
    }
    #pragma unroll_loop_end
  #endif
#endif
#if defined( RE_IndirectSpecular )
  vec3 radiance = vec3( 0.0 );
  vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Ff=`#if defined( RE_IndirectDiffuse )
  #ifdef USE_LIGHTMAP
    vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
    vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
    irradiance += lightMapIrradiance;
  #endif
  #if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
    #if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
      iblIrradiance += getIBLIrradiance( geometryNormal );
    #endif
  #endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
  #ifdef USE_ANISOTROPY
    vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
  #else
    vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
  #endif
  #ifdef USE_RETROREFLECTION
    #ifdef USE_ANISOTROPY
      vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
    #else
      vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
    #endif
    iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
  #endif
  radiance += iblRadiance;
  #ifdef USE_CLEARCOAT
    clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
  #endif
#endif`,Of=`#if defined( RE_IndirectDiffuse )
  #if defined( LAMBERT ) || defined( PHONG )
    irradiance += iblIrradiance;
  #endif
  RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
  RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Bf=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
  vec3 spacing = ( probesMax - probesMin ) / probesResolution;
  vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
  vec3 margin = spacing * 0.01;
  return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
  vec3 res = probesResolution;
  vec3 gridRange = probesMax - probesMin;
  vec3 probeSpacing = gridRange / res;
  vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
  vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
  float nz          = res.z;
  float paddedSlices = nz + 2.0;
  float atlasDepth  = 7.0 * paddedSlices;
  float uvZBase     = uvw.z * nz + 1.0;
  vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
  vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
  vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
  vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
  vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
  vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
  vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
  vec3 c0 = s0.xyz;
  vec3 c1 = vec3( s0.w, s1.xy );
  vec3 c2 = vec3( s1.zw, s2.x );
  vec3 c3 = s2.yzw;
  vec3 c4 = s3.xyz;
  vec3 c5 = vec3( s3.w, s4.xy );
  vec3 c6 = vec3( s4.zw, s5.x );
  vec3 c7 = s5.yzw;
  vec3 c8 = s6.xyz;
  float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
  vec3 result = c0 * 0.886227;
  result += c1 * 2.0 * 0.511664 * y;
  result += c2 * 2.0 * 0.511664 * z;
  result += c3 * 2.0 * 0.511664 * x;
  result += c4 * 2.0 * 0.429043 * x * y;
  result += c5 * 2.0 * 0.429043 * y * z;
  result += c6 * ( 0.743125 * z * z - 0.247708 );
  result += c7 * 2.0 * 0.429043 * x * z;
  result += c8 * 0.429043 * ( x * x - y * y );
  return max( result, vec3( 0.0 ) );
}
#endif`,zf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
  gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Gf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
  uniform float logDepthBufFC;
  varying float vFragDepth;
  varying float vIsPerspective;
#endif`,Vf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
  varying float vFragDepth;
  varying float vIsPerspective;
#endif`,kf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
  vFragDepth = 1.0 + gl_Position.w;
  vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Hf=`#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D( map, vMapUv );
  #ifdef DECODE_VIDEO_TEXTURE
    sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
  #endif
  diffuseColor *= sampledDiffuseColor;
#endif`,Wf=`#ifdef USE_MAP
  uniform sampler2D map;
#endif`,Xf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
  #if defined( USE_POINTS_UV )
    vec2 uv = vUv;
  #else
    vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
  #endif
#endif
#ifdef USE_MAP
  diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
  diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,qf=`#if defined( USE_POINTS_UV )
  varying vec2 vUv;
#else
  #if defined( USE_MAP ) || defined( USE_ALPHAMAP )
    uniform mat3 uvTransform;
  #endif
#endif
#ifdef USE_MAP
  uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
  uniform sampler2D alphaMap;
#endif`,Yf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
  vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
  metalnessFactor *= texelMetalness.b;
#endif`,Zf=`#ifdef USE_METALNESSMAP
  uniform sampler2D metalnessMap;
#endif`,Jf=`#ifdef USE_INSTANCING_MORPH
  float morphTargetInfluences[ MORPHTARGETS_COUNT ];
  float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
  for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
    morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
  }
#endif`,Kf=`#if defined( USE_MORPHCOLORS )
  #if defined( USE_COLOR_ALPHA )
    vColor *= morphTargetBaseInfluence;
  #elif defined( USE_COLOR )
    vColor.rgb *= morphTargetBaseInfluence;
  #endif
  for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
    #if defined( USE_COLOR_ALPHA )
      if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
    #elif defined( USE_COLOR )
      if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
    #endif
  }
#endif`,$f=`#ifdef USE_MORPHNORMALS
  objectNormal *= morphTargetBaseInfluence;
  for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
    if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
  }
#endif`,jf=`#ifdef USE_MORPHTARGETS
  #ifndef USE_INSTANCING_MORPH
    uniform float morphTargetBaseInfluence;
    uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
  #endif
  uniform sampler2DArray morphTargetsTexture;
  uniform ivec2 morphTargetsTextureSize;
  vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
    int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
    int y = texelIndex / morphTargetsTextureSize.x;
    int x = texelIndex - y * morphTargetsTextureSize.x;
    ivec3 morphUV = ivec3( x, y, morphTargetIndex );
    return texelFetch( morphTargetsTexture, morphUV, 0 );
  }
#endif`,Qf=`#ifdef USE_MORPHTARGETS
  transformed *= morphTargetBaseInfluence;
  for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
    if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
  }
#endif`,tp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
  vec3 fdx = dFdx( vViewPosition );
  vec3 fdy = dFdy( vViewPosition );
  vec3 normal = normalize( cross( fdx, fdy ) );
#else
  vec3 normal = normalize( vNormal );
  #ifdef DOUBLE_SIDED
    normal *= faceDirection;
  #endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
  #ifdef USE_TANGENT
    mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
  #else
    mat3 tbn = getTangentFrame( - vViewPosition, normal,
    #if defined( USE_NORMALMAP )
      vNormalMapUv
    #elif defined( USE_CLEARCOAT_NORMALMAP )
      vClearcoatNormalMapUv
    #else
      vUv
    #endif
    );
  #endif
  #ifdef DOUBLE_SIDED
    tbn[0] *= faceDirection;
    tbn[1] *= faceDirection;
  #endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
  #ifdef USE_TANGENT
    mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
  #else
    mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
  #endif
  #ifdef DOUBLE_SIDED
    tbn2[0] *= faceDirection;
    tbn2[1] *= faceDirection;
  #endif
#endif
vec3 nonPerturbedNormal = normal;`,ep=`#ifdef USE_NORMALMAP_OBJECTSPACE
  normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
  #ifdef FLIP_SIDED
    normal = - normal;
  #endif
  #ifdef DOUBLE_SIDED
    normal = normal * faceDirection;
  #endif
  normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
  vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
  #if defined( USE_PACKED_NORMALMAP )
    mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
  #endif
  mapN.xy *= normalScale;
  normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
  normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,np=`#ifndef FLAT_SHADED
  varying vec3 vNormal;
  #ifdef USE_TANGENT
    varying vec3 vTangent;
    varying vec3 vBitangent;
  #endif
#endif`,ip=`#ifndef FLAT_SHADED
  varying vec3 vNormal;
  #ifdef USE_TANGENT
    varying vec3 vTangent;
    varying vec3 vBitangent;
  #endif
#endif`,sp=`#ifndef FLAT_SHADED
  vNormal = normalize( transformedNormal );
  #ifdef USE_TANGENT
    vTangent = normalize( transformedTangent );
    vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
    #ifdef FLIP_SIDED
      vBitangent = - vBitangent;
    #endif
  #endif
#endif`,rp=`#ifdef USE_NORMALMAP
  uniform sampler2D normalMap;
  uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
  uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
  mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
    vec3 q0 = dFdx( eye_pos.xyz );
    vec3 q1 = dFdy( eye_pos.xyz );
    vec2 st0 = dFdx( uv.st );
    vec2 st1 = dFdy( uv.st );
    vec3 N = surf_norm;
    vec3 q1perp = cross( q1, N );
    vec3 q0perp = cross( N, q0 );
    vec3 T = q1perp * st0.x + q0perp * st1.x;
    vec3 B = q1perp * st0.y + q0perp * st1.y;
    float det = max( dot( T, T ), dot( B, B ) );
    float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
    return mat3( T * scale, B * scale, N );
  }
#endif`,op=`#ifdef USE_CLEARCOAT
  vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,ap=`#ifdef USE_CLEARCOAT_NORMALMAP
  vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
  clearcoatMapN.xy *= clearcoatNormalScale;
  clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,lp=`#ifdef USE_CLEARCOATMAP
  uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
  uniform sampler2D clearcoatNormalMap;
  uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
  uniform sampler2D clearcoatRoughnessMap;
#endif`,cp=`#ifdef USE_IRIDESCENCEMAP
  uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
  uniform sampler2D iridescenceThicknessMap;
#endif`,hp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,up=`vec3 packNormalToRGB( const in vec3 normal ) {
  return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
  return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
  if( v <= 0.0 )
    return vec4( 0., 0., 0., 0. );
  if( v >= 1.0 )
    return vec4( 1., 1., 1., 1. );
  float vuf;
  float af = modf( v * PackFactors.a, vuf );
  float bf = modf( vuf * ShiftRight8, vuf );
  float gf = modf( vuf * ShiftRight8, vuf );
  return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
  if( v <= 0.0 )
    return vec3( 0., 0., 0. );
  if( v >= 1.0 )
    return vec3( 1., 1., 1. );
  float vuf;
  float bf = modf( v * PackFactors.b, vuf );
  float gf = modf( vuf * ShiftRight8, vuf );
  return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
  if( v <= 0.0 )
    return vec2( 0., 0. );
  if( v >= 1.0 )
    return vec2( 1., 1. );
  float vuf;
  float gf = modf( v * 256., vuf );
  return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
  return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
  return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
  return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
  vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
  return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
  return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
  return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
  #ifdef USE_REVERSED_DEPTH_BUFFER

    return depth * ( far - near ) - far;
  #else
    return depth * ( near - far ) - near;
  #endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
  return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {

  #ifdef USE_REVERSED_DEPTH_BUFFER
    return ( near * far ) / ( ( near - far ) * depth - near );
  #else
    return ( near * far ) / ( ( far - near ) * depth - far );
  #endif
}`,dp=`#ifdef PREMULTIPLIED_ALPHA
  gl_FragColor.rgb *= gl_FragColor.a;
#endif`,fp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
  mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,pp=`#ifdef DITHERING
  gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,mp=`#ifdef DITHERING
  vec3 dithering( vec3 color ) {
    float grid_position = rand( gl_FragCoord.xy );
    vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
    dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
    return color + dither_shift_RGB;
  }
#endif`,gp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
  vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
  roughnessFactor *= texelRoughness.g;
#endif`,_p=`#ifdef USE_ROUGHNESSMAP
  uniform sampler2D roughnessMap;
#endif`,xp=`#if NUM_SPOT_LIGHT_COORDS > 0
  varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
  uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
  #if NUM_SUN_LIGHT_SHADOWS > 0
    #define SUN_LIGHT_CASCADES 2
    #if defined( SHADOWMAP_TYPE_PCF )
      uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
    #else
      uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
    #endif
    uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
    uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
    varying vec4 vSunShadowWorldPosition;
    varying vec3 vSunShadowWorldNormal;
    struct SunLightShadow {
      float shadowIntensity;
      float shadowBias;
      float shadowNormalBias;
      float shadowRadius;
      vec2 shadowMapSize;
    };
    uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
  #endif
  #if NUM_DIR_LIGHT_SHADOWS > 0
    #if defined( SHADOWMAP_TYPE_PCF )
      uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
    #else
      uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
    #endif
    varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
    struct DirectionalLightShadow {
      float shadowIntensity;
      float shadowBias;
      float shadowNormalBias;
      float shadowRadius;
      vec2 shadowMapSize;
    };
    uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
  #endif
  #if NUM_SPOT_LIGHT_SHADOWS > 0
    #if defined( SHADOWMAP_TYPE_PCF )
      uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
    #else
      uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
    #endif
    struct SpotLightShadow {
      float shadowIntensity;
      float shadowBias;
      float shadowNormalBias;
      float shadowRadius;
      vec2 shadowMapSize;
    };
    uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
  #endif
  #if NUM_POINT_LIGHT_SHADOWS > 0
    #if defined( SHADOWMAP_TYPE_PCF )
      uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
    #elif defined( SHADOWMAP_TYPE_BASIC )
      uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
    #endif
    varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
    struct PointLightShadow {
      float shadowIntensity;
      float shadowBias;
      float shadowNormalBias;
      float shadowRadius;
      vec2 shadowMapSize;
      float shadowCameraNear;
      float shadowCameraFar;
    };
    uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
  #endif
  #if defined( SHADOWMAP_TYPE_PCF )
    float interleavedGradientNoise( vec2 position ) {
      return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
    }
    vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
      const float goldenAngle = 2.399963229728653;
      float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
      float theta = float( sampleIndex ) * goldenAngle + phi;
      return vec2( cos( theta ), sin( theta ) ) * r;
    }
  #endif
  #if defined( SHADOWMAP_TYPE_PCF )
    float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
      float shadow = 1.0;
      shadowCoord.xyz /= shadowCoord.w;
      #ifdef USE_REVERSED_DEPTH_BUFFER
        shadowCoord.z -= shadowBias;
      #else
        shadowCoord.z += shadowBias;
      #endif
      bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
      bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
      if ( frustumTest ) {
        vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
        vec2 radius = shadowRadius * texelSize;
        float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
        shadow = (
          texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
          texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
          texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
          texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
          texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
        ) * 0.2;
      }
      return mix( 1.0, shadow, shadowIntensity );
    }
  #elif defined( SHADOWMAP_TYPE_VSM )
    float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
      float shadow = 1.0;
      shadowCoord.xyz /= shadowCoord.w;
      #ifdef USE_REVERSED_DEPTH_BUFFER
        shadowCoord.z -= shadowBias;
      #else
        shadowCoord.z += shadowBias;
      #endif
      bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
      bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
      if ( frustumTest ) {
        vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
        float mean = distribution.x;
        float variance = distribution.y * distribution.y;
        #ifdef USE_REVERSED_DEPTH_BUFFER
          float hard_shadow = step( mean, shadowCoord.z );
        #else
          float hard_shadow = step( shadowCoord.z, mean );
        #endif

        if ( hard_shadow == 1.0 ) {
          shadow = 1.0;
        } else {
          variance = max( variance, 0.0000001 );
          float d = shadowCoord.z - mean;
          float p_max = variance / ( variance + d * d );
          p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
          shadow = max( hard_shadow, p_max );
        }
      }
      return mix( 1.0, shadow, shadowIntensity );
    }
  #else
    float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
      float shadow = 1.0;
      shadowCoord.xyz /= shadowCoord.w;
      #ifdef USE_REVERSED_DEPTH_BUFFER
        shadowCoord.z -= shadowBias;
      #else
        shadowCoord.z += shadowBias;
      #endif
      bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
      bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
      if ( frustumTest ) {
        float depth = texture2D( shadowMap, shadowCoord.xy ).r;
        #ifdef USE_REVERSED_DEPTH_BUFFER
          shadow = step( depth, shadowCoord.z );
        #else
          shadow = step( shadowCoord.z, depth );
        #endif
      }
      return mix( 1.0, shadow, shadowIntensity );
    }
  #endif
  #if NUM_SUN_LIGHT_SHADOWS > 0
    float getSunShadow(
      #if defined( SHADOWMAP_TYPE_PCF )
        sampler2DShadow shadowMap,
      #else
        sampler2D shadowMap,
      #endif
      SunLightShadow sunLightShadow,
      int shadowIndex
    ) {
      vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
      float viewDepth = vSunShadowWorldPosition.w;
      int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
      float shadow = 1.0;
      for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
        vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
        if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
          float cascadeShadow = getShadow(
            shadowMap,
            sunLightShadow.shadowMapSize,
            sunLightShadow.shadowIntensity,
            sunLightShadow.shadowBias,
            sunLightShadow.shadowRadius,
            sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
          );
          shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
        }
      }
      return shadow;
    }
  #endif
  #if NUM_POINT_LIGHT_SHADOWS > 0
  #if defined( SHADOWMAP_TYPE_PCF )
  float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
    float shadow = 1.0;
    vec3 lightToPosition = shadowCoord.xyz;
    vec3 bd3D = normalize( lightToPosition );
    vec3 absVec = abs( lightToPosition );
    float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
    if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
      float lightDistance = length( lightToPosition );
      float depthRange = shadowCameraFar - shadowCameraNear;
      #ifdef USE_REVERSED_DEPTH_BUFFER
        float depthA = - shadowCameraNear / depthRange - shadowBias;
        float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
      #else
        float depthA = shadowCameraFar / depthRange + shadowBias;
        float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
      #endif
      float texelSize = shadowRadius / shadowMapSize.x;
      vec3 absDir = abs( bd3D );
      vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
      tangent = normalize( cross( bd3D, tangent ) );
      vec3 bitangent = cross( bd3D, tangent );
      float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
      shadow = 0.0;
      for ( int i = 0; i < 5; i ++ ) {
        vec2 offset = vogelDiskSample( i, 5, phi );
        vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
        vec3 absDirection = abs( direction );
        float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
        shadow += texture( shadowMap, vec4( direction, dp ) );
      }
      shadow *= 0.2;
    }
    return mix( 1.0, shadow, shadowIntensity );
  }
  #elif defined( SHADOWMAP_TYPE_BASIC )
  float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
    float shadow = 1.0;
    vec3 lightToPosition = shadowCoord.xyz;
    vec3 absVec = abs( lightToPosition );
    float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
    if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
      float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
      dp += shadowBias;
      vec3 bd3D = normalize( lightToPosition );
      float depth = textureCube( shadowMap, bd3D ).r;
      #ifdef USE_REVERSED_DEPTH_BUFFER
        depth = 1.0 - depth;
      #endif
      shadow = step( dp, depth );
    }
    return mix( 1.0, shadow, shadowIntensity );
  }
  #endif
  #endif
#endif`,yp=`#if NUM_SPOT_LIGHT_COORDS > 0
  uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
  varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
  #if NUM_SUN_LIGHT_SHADOWS > 0
    varying vec4 vSunShadowWorldPosition;
    varying vec3 vSunShadowWorldNormal;
  #endif
  #if NUM_DIR_LIGHT_SHADOWS > 0
    uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
    varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
    struct DirectionalLightShadow {
      float shadowIntensity;
      float shadowBias;
      float shadowNormalBias;
      float shadowRadius;
      vec2 shadowMapSize;
    };
    uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
  #endif
  #if NUM_SPOT_LIGHT_SHADOWS > 0
    struct SpotLightShadow {
      float shadowIntensity;
      float shadowBias;
      float shadowNormalBias;
      float shadowRadius;
      vec2 shadowMapSize;
    };
    uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
  #endif
  #if NUM_POINT_LIGHT_SHADOWS > 0
    uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
    varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
    struct PointLightShadow {
      float shadowIntensity;
      float shadowBias;
      float shadowNormalBias;
      float shadowRadius;
      vec2 shadowMapSize;
      float shadowCameraNear;
      float shadowCameraFar;
    };
    uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
  #endif
#endif`,vp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
  #ifdef HAS_NORMAL
    vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
  #else
    vec3 shadowWorldNormal = vec3( 0.0 );
  #endif
  vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
  #if NUM_SUN_LIGHT_SHADOWS > 0
    vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
    vSunShadowWorldNormal = shadowWorldNormal;
  #endif
  #if NUM_DIR_LIGHT_SHADOWS > 0
    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
      shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
      vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
    }
    #pragma unroll_loop_end
  #endif
  #if NUM_POINT_LIGHT_SHADOWS > 0
    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
      shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
      vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
    }
    #pragma unroll_loop_end
  #endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
    shadowWorldPosition = worldPosition;
    #if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
      shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
    #endif
    vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
  }
  #pragma unroll_loop_end
#endif`,Mp=`float getShadowMask() {
  float shadow = 1.0;
  #ifdef USE_SHADOWMAP
  #if NUM_SUN_LIGHT_SHADOWS > 0
  SunLightShadow sunLight;
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
    sunLight = sunLightShadows[ i ];
    shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
  }
  #pragma unroll_loop_end
  #endif
  #if NUM_DIR_LIGHT_SHADOWS > 0
  DirectionalLightShadow directionalLight;
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
    directionalLight = directionalLightShadows[ i ];
    shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
  }
  #pragma unroll_loop_end
  #endif
  #if NUM_SPOT_LIGHT_SHADOWS > 0
  SpotLightShadow spotLight;
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
    spotLight = spotLightShadows[ i ];
    shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
  }
  #pragma unroll_loop_end
  #endif
  #if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
  PointLightShadow pointLight;
  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
    pointLight = pointLightShadows[ i ];
    shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
  }
  #pragma unroll_loop_end
  #endif
  #endif
  return shadow;
}`,Sp=`#ifdef USE_SKINNING
  mat4 boneMatX = getBoneMatrix( skinIndex.x );
  mat4 boneMatY = getBoneMatrix( skinIndex.y );
  mat4 boneMatZ = getBoneMatrix( skinIndex.z );
  mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,bp=`#ifdef USE_SKINNING
  uniform mat4 bindMatrix;
  uniform mat4 bindMatrixInverse;
  uniform highp sampler2D boneTexture;
  mat4 getBoneMatrix( const in float i ) {
    int size = textureSize( boneTexture, 0 ).x;
    int j = int( i ) * 4;
    int x = j % size;
    int y = j / size;
    vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
    vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
    vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
    vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
    return mat4( v1, v2, v3, v4 );
  }
#endif`,wp=`#ifdef USE_SKINNING
  vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
  vec4 skinned = vec4( 0.0 );
  skinned += boneMatX * skinVertex * skinWeight.x;
  skinned += boneMatY * skinVertex * skinWeight.y;
  skinned += boneMatZ * skinVertex * skinWeight.z;
  skinned += boneMatW * skinVertex * skinWeight.w;
  transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Tp=`#ifdef USE_SKINNING
  mat4 skinMatrix = mat4( 0.0 );
  skinMatrix += skinWeight.x * boneMatX;
  skinMatrix += skinWeight.y * boneMatY;
  skinMatrix += skinWeight.z * boneMatZ;
  skinMatrix += skinWeight.w * boneMatW;
  skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
  objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
  #ifdef USE_TANGENT
    objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
  #endif
#endif`,Ep=`float specularStrength;
#ifdef USE_SPECULARMAP
  vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
  specularStrength = texelSpecular.r;
#else
  specularStrength = 1.0;
#endif`,Ap=`#ifdef USE_SPECULARMAP
  uniform sampler2D specularMap;
#endif`,Rp=`#if defined( TONE_MAPPING )
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Cp=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
  return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
  color *= toneMappingExposure;
  return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
  color *= toneMappingExposure;
  color = max( vec3( 0.0 ), color - 0.004 );
  return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
  vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
  vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
  return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
  const mat3 ACESInputMat = mat3(
    vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
    vec3( 0.04823, 0.01566, 0.83777 )
  );
  const mat3 ACESOutputMat = mat3(
    vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
    vec3( -0.07367, -0.00605,  1.07602 )
  );
  color *= toneMappingExposure / 0.6;
  color = ACESInputMat * color;
  color = RRTAndODTFit( color );
  color = ACESOutputMat * color;
  return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
  vec3( 1.6605, - 0.1246, - 0.0182 ),
  vec3( - 0.5876, 1.1329, - 0.1006 ),
  vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
  vec3( 0.6274, 0.0691, 0.0164 ),
  vec3( 0.3293, 0.9195, 0.0880 ),
  vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
  vec3 x2 = x * x;
  vec3 x4 = x2 * x2;
  return + 15.5 * x4 * x2
    - 40.14 * x4 * x
    + 31.96 * x4
    - 6.868 * x2 * x
    + 0.4298 * x2
    + 0.1191 * x
    - 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
  const mat3 AgXInsetMatrix = mat3(
    vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
    vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
    vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
  );
  const mat3 AgXOutsetMatrix = mat3(
    vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
    vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
    vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
  );
  const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
  color *= toneMappingExposure;
  color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
  color = AgXInsetMatrix * color;
  color = max( color, 1e-10 );	color = log2( color );
  color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
  color = clamp( color, 0.0, 1.0 );
  color = agxDefaultContrastApprox( color );
  color = AgXOutsetMatrix * color;
  color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
  color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
  color = clamp( color, 0.0, 1.0 );
  return color;
}
vec3 NeutralToneMapping( vec3 color ) {
  const float StartCompression = 0.8 - 0.04;
  const float Desaturation = 0.15;
  color *= toneMappingExposure;
  float x = min( color.r, min( color.g, color.b ) );
  float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
  color -= offset;
  float peak = max( color.r, max( color.g, color.b ) );
  if ( peak < StartCompression ) return color;
  float d = 1. - StartCompression;
  float newPeak = 1. - d * d / ( peak + d - StartCompression );
  color *= newPeak / peak;
  float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
  return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Pp=`#ifdef USE_TRANSMISSION
  material.transmission = transmission;
  material.transmissionAlpha = 1.0;
  material.thickness = thickness;
  material.attenuationDistance = attenuationDistance;
  material.attenuationColor = attenuationColor;
  #ifdef USE_TRANSMISSIONMAP
    material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
  #endif
  #ifdef USE_THICKNESSMAP
    material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
  #endif
  vec3 pos = vWorldPosition;
  vec3 v = normalize( cameraPosition - pos );
  vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
  vec4 transmitted = getIBLVolumeRefraction(
    n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
    pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
    material.attenuationColor, material.attenuationDistance );
  material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
  totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Ip=`#ifdef USE_TRANSMISSION
  uniform float transmission;
  uniform float thickness;
  uniform float attenuationDistance;
  uniform vec3 attenuationColor;
  #ifdef USE_TRANSMISSIONMAP
    uniform sampler2D transmissionMap;
  #endif
  #ifdef USE_THICKNESSMAP
    uniform sampler2D thicknessMap;
  #endif
  uniform vec2 transmissionSamplerSize;
  uniform sampler2D transmissionSamplerMap;
  uniform mat4 modelMatrix;
  uniform mat4 projectionMatrix;
  varying vec3 vWorldPosition;
  float w0( float a ) {
    return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
  }
  float w1( float a ) {
    return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
  }
  float w2( float a ){
    return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
  }
  float w3( float a ) {
    return ( 1.0 / 6.0 ) * ( a * a * a );
  }
  float g0( float a ) {
    return w0( a ) + w1( a );
  }
  float g1( float a ) {
    return w2( a ) + w3( a );
  }
  float h0( float a ) {
    return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
  }
  float h1( float a ) {
    return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
  }
  vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
    uv = uv * texelSize.zw + 0.5;
    vec2 iuv = floor( uv );
    vec2 fuv = fract( uv );
    float g0x = g0( fuv.x );
    float g1x = g1( fuv.x );
    float h0x = h0( fuv.x );
    float h1x = h1( fuv.x );
    float h0y = h0( fuv.y );
    float h1y = h1( fuv.y );
    vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
    vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
    vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
    vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
    return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
      g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
  }
  vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
    vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
    vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
    vec2 fLodSizeInv = 1.0 / fLodSize;
    vec2 cLodSizeInv = 1.0 / cLodSize;
    vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
    vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
    return mix( fSample, cSample, fract( lod ) );
  }
  vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
    vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
    vec3 modelScale;
    modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
    modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
    modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
    return normalize( refractionVector ) * thickness * modelScale;
  }
  float applyIorToRoughness( const in float roughness, const in float ior ) {
    return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
  }
  vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
    float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
    return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
  }
  vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
    if ( isinf( attenuationDistance ) ) {
      return vec3( 1.0 );
    } else {
      vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
      vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
    }
  }
  vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
    const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
    const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
    const in vec3 attenuationColor, const in float attenuationDistance ) {
    vec4 transmittedLight;
    vec3 transmittance;
    #ifdef USE_DISPERSION
      float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
      vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
      for ( int i = 0; i < 3; i ++ ) {
        vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
        vec3 refractedRayExit = position + transmissionRay;
        vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
        vec2 refractionCoords = ndcPos.xy / ndcPos.w;
        refractionCoords += 1.0;
        refractionCoords /= 2.0;
        vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
        transmittedLight[ i ] = transmissionSample[ i ];
        transmittedLight.a += transmissionSample.a;
        transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
      }
      transmittedLight.a /= 3.0;
    #else
      vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
      vec3 refractedRayExit = position + transmissionRay;
      vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
      vec2 refractionCoords = ndcPos.xy / ndcPos.w;
      refractionCoords += 1.0;
      refractionCoords /= 2.0;
      transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
      transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
    #endif
    vec3 attenuatedColor = transmittance * transmittedLight.rgb;
    vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
    float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
    return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
  }
#endif`,Lp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
  varying vec2 vUv;
#endif
#ifdef USE_MAP
  varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
  varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
  varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
  varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
  varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
  varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
  varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
  varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
  varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
  varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
  varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
  varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
  varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
  varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
  varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
  varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
  varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
  varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
  varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
  varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
  varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
  uniform mat3 transmissionMapTransform;
  varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
  uniform mat3 thicknessMapTransform;
  varying vec2 vThicknessMapUv;
#endif`,Dp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
  varying vec2 vUv;
#endif
#ifdef USE_MAP
  uniform mat3 mapTransform;
  varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
  uniform mat3 alphaMapTransform;
  varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
  uniform mat3 lightMapTransform;
  varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
  uniform mat3 aoMapTransform;
  varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
  uniform mat3 bumpMapTransform;
  varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
  uniform mat3 normalMapTransform;
  varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
  uniform mat3 displacementMapTransform;
  varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
  uniform mat3 emissiveMapTransform;
  varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
  uniform mat3 metalnessMapTransform;
  varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
  uniform mat3 roughnessMapTransform;
  varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
  uniform mat3 diffuseRoughnessMapTransform;
  varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
  uniform mat3 anisotropyMapTransform;
  varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
  uniform mat3 clearcoatMapTransform;
  varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
  uniform mat3 clearcoatNormalMapTransform;
  varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
  uniform mat3 clearcoatRoughnessMapTransform;
  varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
  uniform mat3 sheenColorMapTransform;
  varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
  uniform mat3 sheenRoughnessMapTransform;
  varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
  uniform mat3 iridescenceMapTransform;
  varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
  uniform mat3 iridescenceThicknessMapTransform;
  varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
  uniform mat3 specularMapTransform;
  varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
  uniform mat3 specularColorMapTransform;
  varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
  uniform mat3 specularIntensityMapTransform;
  varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
  uniform mat3 transmissionMapTransform;
  varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
  uniform mat3 thicknessMapTransform;
  varying vec2 vThicknessMapUv;
#endif`,Np=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
  vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
  vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
  vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
  vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
  vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
  vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
  vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
  vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
  vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
  vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
  vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
  vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
  vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
  vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
  vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
  vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
  vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
  vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
  vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
  vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
  vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
  vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
  vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
  vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
  vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Up=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
  vec4 worldPosition = vec4( transformed, 1.0 );
  #ifdef USE_BATCHING
    worldPosition = batchingMatrix * worldPosition;
  #endif
  #ifdef USE_INSTANCING
    worldPosition = instanceMatrix * worldPosition;
  #endif
  worldPosition = modelMatrix * worldPosition;
#endif`,Fp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
  vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
  gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Op=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
  vec4 texColor = texture2D( t2D, vUv );
  #ifdef DECODE_VIDEO_TEXTURE
    texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
  #endif
  texColor.rgb *= backgroundIntensity;
  gl_FragColor = texColor;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,Bp=`varying vec3 vWorldDirection;
#include <common>
void main() {
  vWorldDirection = transformDirection( position, modelMatrix );
  #include <begin_vertex>
  #include <project_vertex>
  gl_Position.z = gl_Position.w;
}`,zp=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
  #ifdef ENVMAP_TYPE_PMREM
    vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
  #else
    vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
  #endif
  texColor.rgb *= backgroundIntensity;
  gl_FragColor = texColor;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,Gp=`varying vec3 vWorldDirection;
#include <common>
void main() {
  vWorldDirection = transformDirection( position, modelMatrix );
  #include <begin_vertex>
  #include <project_vertex>
  gl_Position.z = gl_Position.w;
}`,Vp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
  vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
  gl_FragColor = texColor;
  gl_FragColor.a *= opacity;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,kp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
  #include <uv_vertex>
  #include <batching_vertex>
  #include <skinbase_vertex>
  #include <morphinstance_vertex>
  #ifdef USE_DISPLACEMENTMAP
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinnormal_vertex>
  #endif
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vHighPrecisionZW = gl_Position.zw;
}`,Hp=`#if DEPTH_PACKING == 3200
  uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
  vec4 diffuseColor = vec4( 1.0 );
  #include <clipping_planes_fragment>
  #if DEPTH_PACKING == 3200
    diffuseColor.a = opacity;
  #endif
  #include <map_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <logdepthbuf_fragment>
  #ifdef USE_REVERSED_DEPTH_BUFFER
    float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
  #else
    float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
  #endif
  #if DEPTH_PACKING == 3200
    gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
  #elif DEPTH_PACKING == 3201
    gl_FragColor = packDepthToRGBA( fragCoordZ );
  #elif DEPTH_PACKING == 3202
    gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
  #elif DEPTH_PACKING == 3203
    gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
  #endif
}`,Wp=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <batching_vertex>
  #include <skinbase_vertex>
  #include <morphinstance_vertex>
  #ifdef USE_DISPLACEMENTMAP
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinnormal_vertex>
  #endif
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <worldpos_vertex>
  #include <clipping_planes_vertex>
  vWorldPosition = worldPosition.xyz;
}`,Xp=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( 1.0 );
  #include <clipping_planes_fragment>
  #include <map_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  float dist = length( vWorldPosition - referencePosition );
  dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
  dist = saturate( dist );
  gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,qp=`varying vec3 vWorldDirection;
#include <common>
void main() {
  vWorldDirection = transformDirection( position, modelMatrix );
  #include <begin_vertex>
  #include <project_vertex>
}`,Yp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
  vec3 direction = normalize( vWorldDirection );
  vec2 sampleUV = equirectUv( direction );
  gl_FragColor = texture2D( tEquirect, sampleUV );
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,Zp=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  vLineDistance = scale * lineDistance;
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <fog_vertex>
}`,Jp=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  if ( mod( vLineDistance, totalSize ) > dashSize ) {
    discard;
  }
  vec3 outgoingLight = vec3( 0.0 );
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  outgoingLight = diffuseColor.rgb;
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
}`,Kp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>
  #endif
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <worldpos_vertex>
  #include <envmap_vertex>
  #include <fog_vertex>
}`,$p=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
  varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <specularmap_fragment>
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  #ifdef USE_LIGHTMAP
    vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
    reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
  #else
    reflectedLight.indirectDiffuse += vec3( 1.0 );
  #endif
  #include <aomap_fragment>
  reflectedLight.indirectDiffuse *= diffuseColor.rgb;
  vec3 outgoingLight = reflectedLight.indirectDiffuse;
  #include <envmap_fragment>
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}`,jp=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vViewPosition = - mvPosition.xyz;
  #include <worldpos_vertex>
  #include <envmap_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
}`,Qp=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  vec3 totalEmissiveRadiance = emissive;
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <specularmap_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  #include <emissivemap_fragment>
  #include <lights_lambert_fragment>
  #include <lights_fragment_begin>
  #include <lights_fragment_maps>
  #include <lights_fragment_end>
  #include <aomap_fragment>
  vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
  #include <envmap_fragment>
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}`,tm=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <fog_vertex>
  vViewPosition = - mvPosition.xyz;
}`,em=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  vec3 viewDir = normalize( vViewPosition );
  vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
  vec3 y = cross( viewDir, x );
  vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
  #ifdef USE_MATCAP
    vec4 matcapColor = texture2D( matcap, uv );
  #else
    vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
  #endif
  vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}`,nm=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
  varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphinstance_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
  vViewPosition = - mvPosition.xyz;
#endif
}`,im=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
  varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
  #include <clipping_planes_fragment>
  #include <logdepthbuf_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
  #ifdef OPAQUE
    gl_FragColor.a = 1.0;
  #endif
}`,sm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphinstance_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vViewPosition = - mvPosition.xyz;
  #include <worldpos_vertex>
  #include <envmap_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
}`,rm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  vec3 totalEmissiveRadiance = emissive;
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <specularmap_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  #include <emissivemap_fragment>
  #include <lights_phong_fragment>
  #include <lights_fragment_begin>
  #include <lights_fragment_maps>
  #include <lights_fragment_end>
  #include <aomap_fragment>
  vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
  #include <envmap_fragment>
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}`,om=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
  varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vViewPosition = - mvPosition.xyz;
  #include <worldpos_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
#ifdef USE_TRANSMISSION
  vWorldPosition = worldPosition.xyz;
#endif
}`,am=`#define STANDARD
#ifdef PHYSICAL
  #define IOR
  #define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
  uniform float ior;
#endif
#ifdef USE_SPECULAR
  uniform float specularIntensity;
  uniform vec3 specularColor;
  #ifdef USE_SPECULAR_COLORMAP
    uniform sampler2D specularColorMap;
  #endif
  #ifdef USE_SPECULAR_INTENSITYMAP
    uniform sampler2D specularIntensityMap;
  #endif
#endif
#ifdef USE_CLEARCOAT
  uniform float clearcoat;
  uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
  uniform float diffuseRoughness;
  #ifdef USE_DIFFUSE_ROUGHNESSMAP
    uniform sampler2D diffuseRoughnessMap;
  #endif
#endif
#ifdef USE_DISPERSION
  uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
  uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
  uniform float iridescence;
  uniform float iridescenceIOR;
  uniform float iridescenceThicknessMinimum;
  uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
  uniform vec3 sheenColor;
  uniform float sheenRoughness;
  #ifdef USE_SHEEN_COLORMAP
    uniform sampler2D sheenColorMap;
  #endif
  #ifdef USE_SHEEN_ROUGHNESSMAP
    uniform sampler2D sheenRoughnessMap;
  #endif
#endif
#ifdef USE_ANISOTROPY
  uniform vec2 anisotropyVector;
  #ifdef USE_ANISOTROPYMAP
    uniform sampler2D anisotropyMap;
  #endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  vec3 totalEmissiveRadiance = emissive;
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <roughnessmap_fragment>
  #include <metalnessmap_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  #include <clearcoat_normal_fragment_begin>
  #include <clearcoat_normal_fragment_maps>
  #include <emissivemap_fragment>
  #include <lights_physical_fragment>
  #include <lights_fragment_begin>
  #include <lights_fragment_maps>
  #include <lights_fragment_end>
  #include <aomap_fragment>
  vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
  vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
  #include <transmission_fragment>
  vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
  #ifdef USE_SHEEN

    outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;

   #endif
  #ifdef USE_CLEARCOAT
    float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
    vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
    outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
  #endif
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}`,lm=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vViewPosition = - mvPosition.xyz;
  #include <worldpos_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
}`,cm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  vec3 totalEmissiveRadiance = emissive;
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  #include <emissivemap_fragment>
  #include <lights_toon_fragment>
  #include <lights_fragment_begin>
  #include <lights_fragment_maps>
  #include <lights_fragment_end>
  #include <aomap_fragment>
  vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}`,hm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
  varying vec2 vUv;
  uniform mat3 uvTransform;
#endif
void main() {
  #ifdef USE_POINTS_UV
    vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
  #endif
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <project_vertex>
  gl_PointSize = size;
  #ifdef USE_SIZEATTENUATION
    bool isPerspective = isPerspectiveMatrix( projectionMatrix );
    if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
  #endif
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <worldpos_vertex>
  #include <fog_vertex>
}`,um=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  vec3 outgoingLight = vec3( 0.0 );
  #include <logdepthbuf_fragment>
  #include <map_particle_fragment>
  #include <color_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  outgoingLight = diffuseColor.rgb;
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
}`,dm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphinstance_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <worldpos_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
}`,fm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
  #include <logdepthbuf_fragment>
  gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
}`,pm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  vec4 mvPosition = modelViewMatrix[ 3 ];
  vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
  #ifndef USE_SIZEATTENUATION
    bool isPerspective = isPerspectiveMatrix( projectionMatrix );
    if ( isPerspective ) scale *= - mvPosition.z;
  #endif
  vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
  vec2 rotatedPosition;
  rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
  rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
  mvPosition.xy += rotatedPosition;
  gl_Position = projectionMatrix * mvPosition;
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <fog_vertex>
}`,mm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );
  #include <clipping_planes_fragment>
  vec3 outgoingLight = vec3( 0.0 );
  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  outgoingLight = diffuseColor.rgb;
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`,Wt={alphahash_fragment:Fd,alphahash_pars_fragment:Od,alphamap_fragment:Bd,alphamap_pars_fragment:zd,alphatest_fragment:Gd,alphatest_pars_fragment:Vd,aomap_fragment:kd,aomap_pars_fragment:Hd,batching_pars_vertex:Wd,batching_vertex:Xd,begin_vertex:qd,beginnormal_vertex:Yd,bsdfs:Zd,iridescence_fragment:Jd,bumpmap_pars_fragment:Kd,clipping_planes_fragment:$d,clipping_planes_pars_fragment:jd,clipping_planes_pars_vertex:Qd,clipping_planes_vertex:tf,color_fragment:ef,color_pars_fragment:nf,color_pars_vertex:sf,color_vertex:rf,common:of,defaultnormal_vertex:af,displacementmap_pars_vertex:lf,displacementmap_vertex:cf,emissivemap_fragment:hf,emissivemap_pars_fragment:uf,colorspace_fragment:df,colorspace_pars_fragment:ff,envmap_fragment:pf,envmap_common_pars_fragment:mf,envmap_pars_fragment:gf,envmap_pars_vertex:_f,envmap_physical_pars_fragment:Rf,envmap_vertex:xf,fog_vertex:yf,fog_pars_vertex:vf,fog_fragment:Mf,fog_pars_fragment:Sf,gradientmap_pars_fragment:bf,lightmap_pars_fragment:wf,lights_lambert_fragment:Tf,lights_lambert_pars_fragment:Ef,lights_pars_begin:Af,lights_toon_fragment:Cf,lights_toon_pars_fragment:Pf,lights_phong_fragment:If,lights_phong_pars_fragment:Lf,lights_physical_fragment:Df,lights_physical_pars_fragment:Nf,lights_fragment_begin:Uf,lights_fragment_maps:Ff,lights_fragment_end:Of,lightprobes_pars_fragment:Bf,logdepthbuf_fragment:zf,logdepthbuf_pars_fragment:Gf,logdepthbuf_pars_vertex:Vf,logdepthbuf_vertex:kf,map_fragment:Hf,map_pars_fragment:Wf,map_particle_fragment:Xf,map_particle_pars_fragment:qf,metalnessmap_fragment:Yf,metalnessmap_pars_fragment:Zf,morphinstance_vertex:Jf,morphcolor_vertex:Kf,morphnormal_vertex:$f,morphtarget_pars_vertex:jf,morphtarget_vertex:Qf,normal_fragment_begin:tp,normal_fragment_maps:ep,normal_pars_fragment:np,normal_pars_vertex:ip,normal_vertex:sp,normalmap_pars_fragment:rp,clearcoat_normal_fragment_begin:op,clearcoat_normal_fragment_maps:ap,clearcoat_pars_fragment:lp,iridescence_pars_fragment:cp,opaque_fragment:hp,packing:up,premultiplied_alpha_fragment:dp,project_vertex:fp,dithering_fragment:pp,dithering_pars_fragment:mp,roughnessmap_fragment:gp,roughnessmap_pars_fragment:_p,shadowmap_pars_fragment:xp,shadowmap_pars_vertex:yp,shadowmap_vertex:vp,shadowmask_pars_fragment:Mp,skinbase_vertex:Sp,skinning_pars_vertex:bp,skinning_vertex:wp,skinnormal_vertex:Tp,specularmap_fragment:Ep,specularmap_pars_fragment:Ap,tonemapping_fragment:Rp,tonemapping_pars_fragment:Cp,transmission_fragment:Pp,transmission_pars_fragment:Ip,uv_pars_fragment:Lp,uv_pars_vertex:Dp,uv_vertex:Np,worldpos_vertex:Up,background_vert:Fp,background_frag:Op,backgroundCube_vert:Bp,backgroundCube_frag:zp,cube_vert:Gp,cube_frag:Vp,depth_vert:kp,depth_frag:Hp,distance_vert:Wp,distance_frag:Xp,equirect_vert:qp,equirect_frag:Yp,linedashed_vert:Zp,linedashed_frag:Jp,meshbasic_vert:Kp,meshbasic_frag:$p,meshlambert_vert:jp,meshlambert_frag:Qp,meshmatcap_vert:tm,meshmatcap_frag:em,meshnormal_vert:nm,meshnormal_frag:im,meshphong_vert:sm,meshphong_frag:rm,meshphysical_vert:om,meshphysical_frag:am,meshtoon_vert:lm,meshtoon_frag:cm,points_vert:hm,points_frag:um,shadow_vert:dm,shadow_frag:fm,sprite_vert:pm,sprite_frag:mm},_t={common:{diffuse:{value:new It(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Bt},alphaMap:{value:null},alphaMapTransform:{value:new Bt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Bt}},envmap:{envMap:{value:null},envMapRotation:{value:new Bt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Bt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Bt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Bt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Bt},normalScale:{value:new Nt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Bt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Bt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Bt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Bt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new It(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new It(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Bt},alphaTest:{value:0},uvTransform:{value:new Bt}},sprite:{diffuse:{value:new It(16777215)},opacity:{value:1},center:{value:new Nt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Bt},alphaMap:{value:null},alphaMapTransform:{value:new Bt},alphaTest:{value:0}}},En={basic:{uniforms:Ve([_t.common,_t.specularmap,_t.envmap,_t.aomap,_t.lightmap,_t.fog]),vertexShader:Wt.meshbasic_vert,fragmentShader:Wt.meshbasic_frag},lambert:{uniforms:Ve([_t.common,_t.specularmap,_t.envmap,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.fog,_t.lights,{emissive:{value:new It(0)},envMapIntensity:{value:1}}]),vertexShader:Wt.meshlambert_vert,fragmentShader:Wt.meshlambert_frag},phong:{uniforms:Ve([_t.common,_t.specularmap,_t.envmap,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.fog,_t.lights,{emissive:{value:new It(0)},specular:{value:new It(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Wt.meshphong_vert,fragmentShader:Wt.meshphong_frag},standard:{uniforms:Ve([_t.common,_t.envmap,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.roughnessmap,_t.metalnessmap,_t.fog,_t.lights,{emissive:{value:new It(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Wt.meshphysical_vert,fragmentShader:Wt.meshphysical_frag},toon:{uniforms:Ve([_t.common,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.gradientmap,_t.fog,_t.lights,{emissive:{value:new It(0)}}]),vertexShader:Wt.meshtoon_vert,fragmentShader:Wt.meshtoon_frag},matcap:{uniforms:Ve([_t.common,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.fog,{matcap:{value:null}}]),vertexShader:Wt.meshmatcap_vert,fragmentShader:Wt.meshmatcap_frag},points:{uniforms:Ve([_t.points,_t.fog]),vertexShader:Wt.points_vert,fragmentShader:Wt.points_frag},dashed:{uniforms:Ve([_t.common,_t.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Wt.linedashed_vert,fragmentShader:Wt.linedashed_frag},depth:{uniforms:Ve([_t.common,_t.displacementmap]),vertexShader:Wt.depth_vert,fragmentShader:Wt.depth_frag},normal:{uniforms:Ve([_t.common,_t.bumpmap,_t.normalmap,_t.displacementmap,{opacity:{value:1}}]),vertexShader:Wt.meshnormal_vert,fragmentShader:Wt.meshnormal_frag},sprite:{uniforms:Ve([_t.sprite,_t.fog]),vertexShader:Wt.sprite_vert,fragmentShader:Wt.sprite_frag},background:{uniforms:{uvTransform:{value:new Bt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Wt.background_vert,fragmentShader:Wt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Bt}},vertexShader:Wt.backgroundCube_vert,fragmentShader:Wt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Wt.cube_vert,fragmentShader:Wt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Wt.equirect_vert,fragmentShader:Wt.equirect_frag},distance:{uniforms:Ve([_t.common,_t.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Wt.distance_vert,fragmentShader:Wt.distance_frag},shadow:{uniforms:Ve([_t.lights,_t.fog,{color:{value:new It(0)},opacity:{value:1}}]),vertexShader:Wt.shadow_vert,fragmentShader:Wt.shadow_frag}};En.physical={uniforms:Ve([En.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Bt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Bt},clearcoatNormalScale:{value:new Nt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Bt},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Bt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Bt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Bt},sheen:{value:0},sheenColor:{value:new It(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Bt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Bt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Bt},transmissionSamplerSize:{value:new Nt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Bt},attenuationDistance:{value:0},attenuationColor:{value:new It(0)},specularColor:{value:new It(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Bt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Bt},anisotropyVector:{value:new Nt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Bt}}]),vertexShader:Wt.meshphysical_vert,fragmentShader:Wt.meshphysical_frag};var ia={r:0,b:0,g:0},gm=new se,Kh=new Bt;Kh.set(-1,0,0,0,1,0,0,0,1);function _m(i,t,e,n,s,r){let o=new It(0),a=s===!0?0:1,l,c,u=null,p=0,h=null;function f(M){let T=M.isScene===!0?M.background:null;if(T&&T.isTexture){let S=M.backgroundBlurriness>0;T=t.get(T,S)}return T}function g(M){let T=!1,S=f(M);S===null?m(o,a):S&&S.isColor&&(m(S,1),T=!0);let A=i.xr.getEnvironmentBlendMode();A==="additive"?e.buffers.color.setClear(0,0,0,1,r):A==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||T)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function v(M,T){let S=f(T);S&&S.isCubeTexture?(c===void 0&&(c=new Re(new si(1,1,1),new ze({name:"BackgroundCubeMaterial",uniforms:Pi(En.backgroundCube.uniforms),vertexShader:En.backgroundCube.vertexShader,fragmentShader:En.backgroundCube.fragmentShader,side:Le,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(A,E,_){this.matrixWorld.copyPosition(_.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=S,c.material.uniforms.backgroundBlurriness.value=T.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(gm.makeRotationFromEuler(T.backgroundRotation)).transpose(),S.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Kh),c.material.toneMapped=Kt.getTransfer(S.colorSpace)!==ne,(u!==S||p!==S.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,u=S,p=S.version,h=i.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null)):S&&S.isTexture&&(l===void 0&&(l=new Re(new wn(2,2),new ze({name:"BackgroundMaterial",uniforms:Pi(En.background.uniforms),vertexShader:En.background.vertexShader,fragmentShader:En.background.fragmentShader,side:hi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=S,l.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,l.material.toneMapped=Kt.getTransfer(S.colorSpace)!==ne,S.matrixAutoUpdate===!0&&S.updateMatrix(),l.material.uniforms.uvTransform.value.copy(S.matrix),(u!==S||p!==S.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,u=S,p=S.version,h=i.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null))}function m(M,T){M.getRGB(ia,Tl(i)),e.buffers.color.setClear(ia.r,ia.g,ia.b,T,r)}function d(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(M,T=1){o.set(M),a=T,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(M){a=M,m(o,a)},render:g,addToRenderList:v,dispose:d}}function xm(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null),r=s,o=!1;function a(D,k,q,R,V){let Y=!1,G=p(D,R,q,k);r!==G&&(r=G,c(r.object)),Y=f(D,R,q,V),Y&&g(D,R,q,V),V!==null&&t.update(V,i.ELEMENT_ARRAY_BUFFER),(Y||o)&&(o=!1,S(D,k,q,R),V!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(V).buffer))}function l(){return i.createVertexArray()}function c(D){return i.bindVertexArray(D)}function u(D){return i.deleteVertexArray(D)}function p(D,k,q,R){let V=R.wireframe===!0,Y=n[k.id];Y===void 0&&(Y={},n[k.id]=Y);let G=D.isInstancedMesh===!0?D.id:0,et=Y[G];et===void 0&&(et={},Y[G]=et);let W=et[q.id];W===void 0&&(W={},et[q.id]=W);let Q=W[V];return Q===void 0&&(Q=h(l()),W[V]=Q),Q}function h(D){let k=[],q=[],R=[];for(let V=0;V<e;V++)k[V]=0,q[V]=0,R[V]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:k,enabledAttributes:q,attributeDivisors:R,object:D,attributes:{},index:null}}function f(D,k,q,R){let V=r.attributes,Y=k.attributes,G=0,et=q.getAttributes();for(let W in et)if(et[W].location>=0){let tt=V[W],vt=Y[W];if(vt===void 0&&(W==="instanceMatrix"&&D.instanceMatrix&&(vt=D.instanceMatrix),W==="instanceColor"&&D.instanceColor&&(vt=D.instanceColor)),tt===void 0||tt.attribute!==vt||vt&&tt.data!==vt.data)return!0;G++}return r.attributesNum!==G||r.index!==R}function g(D,k,q,R){let V={},Y=k.attributes,G=0,et=q.getAttributes();for(let W in et)if(et[W].location>=0){let tt=Y[W];tt===void 0&&(W==="instanceMatrix"&&D.instanceMatrix&&(tt=D.instanceMatrix),W==="instanceColor"&&D.instanceColor&&(tt=D.instanceColor));let vt={};vt.attribute=tt,tt&&tt.data&&(vt.data=tt.data),V[W]=vt,G++}r.attributes=V,r.attributesNum=G,r.index=R}function v(){let D=r.newAttributes;for(let k=0,q=D.length;k<q;k++)D[k]=0}function m(D){d(D,0)}function d(D,k){let q=r.newAttributes,R=r.enabledAttributes,V=r.attributeDivisors;q[D]=1,R[D]===0&&(i.enableVertexAttribArray(D),R[D]=1),V[D]!==k&&(i.vertexAttribDivisor(D,k),V[D]=k)}function M(){let D=r.newAttributes,k=r.enabledAttributes;for(let q=0,R=k.length;q<R;q++)k[q]!==D[q]&&(i.disableVertexAttribArray(q),k[q]=0)}function T(D,k,q,R,V,Y,G){G===!0?i.vertexAttribIPointer(D,k,q,V,Y):i.vertexAttribPointer(D,k,q,R,V,Y)}function S(D,k,q,R){v();let V=R.attributes,Y=q.getAttributes(),G=k.defaultAttributeValues;for(let et in Y){let W=Y[et];if(W.location>=0){let Q=V[et];if(Q===void 0&&(et==="instanceMatrix"&&D.instanceMatrix&&(Q=D.instanceMatrix),et==="instanceColor"&&D.instanceColor&&(Q=D.instanceColor)),Q!==void 0){let tt=Q.normalized,vt=Q.itemSize,Rt=t.get(Q);if(Rt===void 0)continue;let J=Rt.buffer,ft=Rt.type,Mt=Rt.bytesPerElement,At=ft===i.INT||ft===i.UNSIGNED_INT||Q.gpuType===yo;if(Q.isInterleavedBufferAttribute){let pt=Q.data,Ft=pt.isInterleavedBuffer===!0?pt.stride:pt.itemSize,de=Q.offset;if(pt.isInstancedInterleavedBuffer||pt.isInstancedBufferAttribute){for(let Pt=0;Pt<W.locationSize;Pt++)d(W.location+Pt,pt.meshPerAttribute);D.isInstancedMesh!==!0&&R._maxInstanceCount===void 0&&(R._maxInstanceCount=pt.meshPerAttribute*pt.count)}else for(let Pt=0;Pt<W.locationSize;Pt++)m(W.location+Pt);i.bindBuffer(i.ARRAY_BUFFER,J);for(let Pt=0;Pt<W.locationSize;Pt++)T(W.location+Pt,vt/W.locationSize,ft,tt,Ft*Mt,(de+vt/W.locationSize*Pt)*Mt,At)}else{if(Q.isInstancedBufferAttribute){for(let pt=0;pt<W.locationSize;pt++)d(W.location+pt,Q.meshPerAttribute);D.isInstancedMesh!==!0&&R._maxInstanceCount===void 0&&(R._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let pt=0;pt<W.locationSize;pt++)m(W.location+pt);i.bindBuffer(i.ARRAY_BUFFER,J);for(let pt=0;pt<W.locationSize;pt++)T(W.location+pt,vt/W.locationSize,ft,tt,vt*Mt,vt/W.locationSize*pt*Mt,At)}}else if(G!==void 0){let tt=G[et];if(tt!==void 0)switch(tt.length){case 2:i.vertexAttrib2fv(W.location,tt);break;case 3:i.vertexAttrib3fv(W.location,tt);break;case 4:i.vertexAttrib4fv(W.location,tt);break;default:i.vertexAttrib1fv(W.location,tt)}}}}M()}function A(){O();for(let D in n){let k=n[D];for(let q in k){let R=k[q];for(let V in R){let Y=R[V];for(let G in Y)u(Y[G].object),delete Y[G];delete R[V]}}delete n[D]}}function E(D){if(n[D.id]===void 0)return;let k=n[D.id];for(let q in k){let R=k[q];for(let V in R){let Y=R[V];for(let G in Y)u(Y[G].object),delete Y[G];delete R[V]}}delete n[D.id]}function _(D){for(let k in n){let q=n[k];for(let R in q){let V=q[R];if(V[D.id]===void 0)continue;let Y=V[D.id];for(let G in Y)u(Y[G].object),delete Y[G];delete V[D.id]}}}function b(D){for(let k in n){let q=n[k],R=D.isInstancedMesh===!0?D.id:0,V=q[R];if(V!==void 0){for(let Y in V){let G=V[Y];for(let et in G)u(G[et].object),delete G[et];delete V[Y]}delete q[R],Object.keys(q).length===0&&delete n[k]}}}function O(){L(),o=!0,r!==s&&(r=s,c(r.object))}function L(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:O,resetDefaultState:L,dispose:A,releaseStatesOfGeometry:E,releaseStatesOfObject:b,releaseStatesOfProgram:_,initAttributes:v,enableAttribute:m,disableUnusedAttributes:M}}function ym(i,t,e){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),e.update(c,n,1)}function o(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),e.update(c,n,u))}function a(l,c,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let h=0;for(let f=0;f<u;f++)h+=c[f];e.update(h,n,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function vm(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let _=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(_.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(_){return!(_!==_n&&n.convert(_)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(_){let b=_===en&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(_!==Ge&&_!==ln&&!b&&n.convert(_)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(_){if(_==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";_="mediump"}return _==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",u=l(c);u!==c&&(Dt("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let p=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),h=e.logarithmicDepthBuffer===!0&&p===!1;e.reversedDepthBuffer===!0&&p===!1&&Dt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),e.logarithmicDepthBuffer===!0&&p===!0&&Dt("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),T=i.getParameter(i.MAX_VARYING_VECTORS),S=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),A=i.getParameter(i.MAX_SAMPLES),E=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:p,maxTextures:f,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:M,maxVaryings:T,maxFragmentUniforms:S,maxSamples:A,samples:E}}function Mm(i){let t=this,e=null,n=0,s=!1,r=!1,o=new He,a=new Bt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(p,h){let f=p.length!==0||h||n!==0||s;return s=h,n=p.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(p,h){e=u(p,h,0)},this.setState=function(p,h,f){let g=p.clippingPlanes,v=p.clipIntersection,m=p.clipShadows,d=i.get(p);if(!s||g===null||g.length===0||r&&!m)r?u(null):c();else{let M=r?0:n,T=M*4,S=d.clippingState||null;l.value=S,S=u(g,h,T,f);for(let A=0;A!==T;++A)S[A]=e[A];d.clippingState=S,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function u(p,h,f,g){let v=p!==null?p.length:0,m=null;if(v!==0){if(m=l.value,g!==!0||m===null){let d=f+v*4,M=h.matrixWorldInverse;a.getNormalMatrix(M),(m===null||m.length<d)&&(m=new Float32Array(d));for(let T=0,S=f;T!==v;++T,S+=4)o.copy(p[T]).applyMatrix4(M,a),o.normal.toArray(m,S),m[S+3]=o.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,m}}var cr=class extends Xe{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new ks(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

        varying vec3 vWorldDirection;

        vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

          return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

        }

        void main() {

          vWorldDirection = transformDirection( position, modelMatrix );

          #include <begin_vertex>
          #include <project_vertex>

        }
      `,fragmentShader:`

        uniform sampler2D tEquirect;

        varying vec3 vWorldDirection;

        #include <common>

        void main() {

          vec3 direction = normalize( vWorldDirection );

          vec2 sampleUV = equirectUv( direction );

          gl_FragColor = texture2D( tEquirect, sampleUV );

        }
      `},s=new si(5,5,5),r=new ze({name:"CubemapFromEquirect",uniforms:Pi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Le,blending:Ti});r.uniforms.tEquirect.value=e;let o=new Re(s,r),a=e.minFilter;return e.minFilter===Gn&&(e.minFilter=Ae),new as(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}},Rh=256,Sm=3,bm=20,$h=256,jh=16,wm=3,Tm=new U,Em=new It,ra=class i{constructor(t){this._renderer=t,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new as(1,10,null),this._boxMesh=new Re(new si(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){let{size:o=256,position:a=Tm}=r,l=this._renderer;this._setSize(o);let c=this._allocateTarget(),u=this._getSourceTarget(!0);e>0&&(u.texture.mipmapsAutoUpdate=!1);let p=l.autoClear,h=l.autoClearColor,f=l.autoClearDepth,g=l.autoClearStencil,v=t.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,v===null&&(t.background=l.getClearColor(Em));let m=new as(n,s,u);return m.position.copy(a),m.update(l,t),l.autoClear=p,l.autoClearColor=h,l.autoClearDepth=f,l.autoClearStencil=g,t.background=v,e>0&&(u.texture.mipmapsAutoUpdate=!0,this._blur(c,e)),this._applyPMREM(c),c}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ih(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ph(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(t,e){return e>0?1-Math.sqrt(1-t/e):0}_setSize(t){this._cubeSize=Math.max(Rh,Sl(t))}_fromTexture(t,e){t.mapping===Ri||t.mapping===us?this._setSize(t.image.length===0?Rh:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4);let n=e||this._allocateTarget();return this._textureToCubemap(t),this._applyPMREM(n),n}_allocateTarget(){let t=this._cubeSize,e=Ch(t,!1,!1),n=Math.log2(t)-Sm;for(let s=0;s<=n;s++)e.texture.mipmaps.push({width:t>>s,height:t>>s});return e.texture.name="PMREM",e.texture.isPMREMTexture=!0,e}_getSourceTarget(t=!1){let e=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==e||t&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=Ch(e,!0,t)),this._sourceTarget}_compileMaterial(t){this._boxMesh.material=t,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(t,e,n){let s=this._boxMesh,r=this._cubeCamera;s.material=n,r.renderTarget=t,r.activeMipmapLevel=e;let o=t.width>>e;t.viewport.set(0,0,o,o),r.update(this._renderer,s),t.viewport.set(0,0,t.width,t.height)}_textureToCubemap(t){let e;t.mapping===Ri||t.mapping===us?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ih()),e=this._cubemapMaterial,e.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=Ph()),e=this._equirectMaterial),e.uniforms.envMap.value=t,this._renderCube(this._getSourceTarget(),0,e)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=Am(),this._integrationMaterial=Rm());let e=this._cubeSize,n=t.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;let r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(e/jh);for(let o=0;o<=n;o++){let a=i.lodToRoughness(o,n);if(o>n-wm)r.roughness.value=a,this._renderCube(t,o,this._integrationMaterial);else{let l=a>0?Math.log2(e)+.5*Math.log2(6/($h*Math.pow(a,4)))+.5:0;s.roughness.value=a,s.lodBias.value=l,this._renderCube(t,o,this._ggxMaterial)}}}_blur(t,e){this._blurMaterial===null&&(this._blurMaterial=Cm());let n=this._blurMaterial,s=n.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(e,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(t,0,n),s.envMap.value=t.texture,this._renderCube(r,0,n)}};function Ch(i,t,e){return new cr(i,{minFilter:Gn,generateMipmaps:t,type:en,colorSpace:Is,depthBuffer:e})}function hr(i,t,e){return new ze({name:i,uniforms:t,vertexShader:Wt.cube_vert,fragmentShader:e,side:Le,blending:Ti,depthTest:!1,depthWrite:!1})}function Am(){return hr("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

    #define GGX_SAMPLES ${$h}u

    varying vec3 vWorldDirection;

    uniform samplerCube envMap;
    uniform float roughness;
    uniform float lodBias;

    #include <common>

    // Van der Corput radical inverse
    float radicalInverse_VdC( uint bits ) {

      bits = ( bits << 16u ) | ( bits >> 16u );
      bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
      bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
      bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
      bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
      return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

    }

    // Hammersley sequence
    vec2 hammersley( uint i, uint N ) {

      return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

    }

    void main() {

      vec3 N = normalize( vWorldDirection );

      // For very low roughness, just sample the environment directly
      if ( roughness < 0.001 ) {

        gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
        return;

      }

      float alpha = roughness * roughness;
      float alpha2 = alpha * alpha;

      // Tangent space basis for VNDF sampling
      vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
      vec3 tangent = normalize( cross( up, N ) );
      vec3 bitangent = cross( N, tangent );

      vec3 prefilteredColor = vec3( 0.0 );
      float totalWeight = 0.0;

      for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

        vec2 Xi = hammersley( i, GGX_SAMPLES );

        // With V = N, sample the reflected direction directly.
        float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
        float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

        if ( NdotL > 0.0 ) {

          float phi = 2.0 * PI * Xi.y;
          float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
          vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

          // Match the source mip to the sample's solid angle. The terms
          // independent of the sample are precomputed in lodBias.
          float d = alpha2 * invQ;
          float lod = max( log2( d ) + lodBias, 0.0 );

          // Weight by NdotL for the split-sum approximation
          prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
          totalWeight += NdotL;

        }

      }

      gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

    }
  `)}function Rm(){return hr("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:jh}},`

    varying vec3 vWorldDirection;

    uniform samplerCube envMap;
    uniform float roughness;
    uniform float sourceLod;
    uniform int sourceSize;

    void main() {

      vec3 N = normalize( vWorldDirection );

      float alpha = roughness * roughness;
      float alpha2 = alpha * alpha;

      float texelSize = 2.0 / float( sourceSize );

      vec3 prefilteredColor = vec3( 0.0 );
      float totalWeight = 0.0;

      // Pair opposite texels: only the one in N's hemisphere contributes.
      for ( int face = 0; face < 3; face ++ ) {

        for ( int y = 0; y < sourceSize; y ++ ) {

          for ( int x = 0; x < sourceSize; x ++ ) {

            vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
            vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

            float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
            float NdotL = dot( N, texelDirection );
            texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
            NdotL = abs( NdotL ) * invDistance;

            // With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
            // in the GGX distribution and texel solid angle cancel when normalized.
            float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
            float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

            prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
            totalWeight += weight;

          }

        }

      }

      gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

    }
  `)}function Cm(){return hr("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

    #define SAMPLES ${bm}
    #define GOLDEN_ANGLE 2.39996322973

    varying vec3 vWorldDirection;

    uniform samplerCube envMap;
    uniform float sigma;

    #include <common>

    void main() {

      vec3 outputDirection = normalize( vWorldDirection );

      vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
      vec3 tangent = normalize( cross( up, outputDirection ) );
      vec3 bitangent = cross( outputDirection, tangent );

      // Truncate the kernel at three standard deviations or at the antipode.
      float thetaMax = min( 3.0 * sigma, PI );
      float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

      vec3 accumColor = vec3( 0.0 );
      float accumWeight = 0.0;

      for ( int i = 0; i < SAMPLES; i ++ ) {

        // Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
        float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
        float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
        float phi = float( i ) * GOLDEN_ANGLE;

        vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
        vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

        // Correct the planar sample density to solid angle.
        float weight = sin( theta ) / theta;

        accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
        accumWeight += weight;

      }

      gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

    }
  `)}function Ph(){return hr("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

    varying vec3 vWorldDirection;

    uniform sampler2D envMap;

    #include <common>

    void main() {

      // Average four subpixel samples to preserve small, bright features.
      vec3 direction = normalize( vWorldDirection );
      vec3 dx = dFdx( direction ) * 0.25;
      vec3 dy = dFdy( direction ) * 0.25;

      vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
      color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
      color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
      color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
      gl_FragColor = vec4( color * 0.25, 1.0 );

    }
  `)}function Ih(){return hr("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

    varying vec3 vWorldDirection;

    uniform samplerCube envMap;
    uniform float flipEnvMap;

    void main() {

      gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

    }
  `)}function Pm(i){let t=new WeakMap,e=new WeakMap,n=null;function s(h,f=!1){return h==null?null:f?o(h):r(h)}function r(h){if(h&&h.isTexture){let f=h.mapping;if(f===go||f===_o)if(t.has(h)){let g=t.get(h).texture;return a(g,h.mapping)}else{let g=h.image;if(g&&g.height>0){let v=new cr(g.height);return v.fromEquirectangularTexture(i,h),t.set(h,v),h.addEventListener("dispose",c),a(v.texture,h.mapping)}else return null}}return h}function o(h){if(h&&h.isTexture&&h.isPMREMTexture!==!0){let f=h.mapping,g=f===go||f===_o,v=f===Ri||f===us;if(g||v){let m=e.get(h),d=m!==void 0?m.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==d)return n===null&&(n=new ra(i)),m=g?n.fromEquirectangular(h,m):n.fromCubemap(h,m),m.texture.pmremVersion=h.pmremVersion,e.set(h,m),m.texture;if(m!==void 0)return m.texture;{let M=h.image;return g&&M&&M.height>0||v&&M&&l(M)?(n===null&&(n=new ra(i)),m=g?n.fromEquirectangular(h):n.fromCubemap(h),m.texture.pmremVersion=h.pmremVersion,e.set(h,m),h.addEventListener("dispose",u),m.texture):null}}}return h}function a(h,f){return f===go?h.mapping=Ri:f===_o&&(h.mapping=us),h}function l(h){let f=0,g=6;for(let v=0;v<g;v++)h[v]!==void 0&&f++;return f===g}function c(h){let f=h.target;f.removeEventListener("dispose",c);let g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function u(h){let f=h.target;f.removeEventListener("dispose",u);let g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function p(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:p}}function Im(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&As("WebGLRenderer: "+n+" extension not supported."),s}}}function Lm(i,t,e,n){let s={},r=new WeakMap,o=new FinalizationRegistry(g=>delete s[g]);function a(g){l(g.target)}function l(g){g.index!==null&&t.remove(g.index);for(let m in g.attributes)t.remove(g.attributes[m]);g.removeEventListener("dispose",a),delete s[g.id],o.unregister(g);let v=r.get(g);v&&(t.remove(v),r.delete(g)),n.releaseStatesOfGeometry(g),g.isInstancedBufferGeometry===!0&&delete g._maxInstanceCount,e.memory.geometries--}function c(g,v){return s[v.id]!==void 0||(v.addEventListener("dispose",a),s[v.id]=new WeakRef(v),o.register(v,v.id,v),e.memory.geometries++),v}function u(g){let v=g.attributes;for(let m in v)t.update(v[m],i.ARRAY_BUFFER)}function p(g){let v=g.index,m=g.attributes.position,d=0;if(m===void 0)return;let M=v!==null?v.array.length:m.array.length/3-1,T=m.count>=65535?zs:Bs,S=new T(Math.ceil(M/3)*6,1),A=S.array;if(v!==null){let _=v.array;d=v.version;for(let b=0,O=0;b<M;b+=3){let L=_[b+0],D=_[b+1],k=_[b+2];A[O++]=L,A[O++]=D,A[O++]=D,A[O++]=k,A[O++]=k,A[O++]=L}}else{d=m.version;for(let _=0,b=0;_<M;_+=3){let O=_+0,L=_+1,D=_+2;A[b++]=O,A[b++]=L,A[b++]=L,A[b++]=D,A[b++]=D,A[b++]=O}}S.version=d;let E=r.get(g);E&&t.remove(E),r.set(g,S)}function h(g){let v=r.get(g);if(v){let m=g.index;m!==null&&v.version<m.version&&p(g)}else p(g);return r.get(g)}function f(){for(let g in s){let v=s[g].deref();v!==void 0&&l(v)}}return{get:c,update:u,getWireframeAttribute:h,dispose:f}}function Dm(i,t,e){let n;function s(p){n=p}let r,o;function a(p){r=p.type,o=p.bytesPerElement}function l(p,h){i.drawElements(n,h,r,p*o),e.update(h,n,1)}function c(p,h,f){f!==0&&(i.drawElementsInstanced(n,h,r,p*o,f),e.update(h,n,f))}function u(p,h,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,p,0,f);let v=0;for(let m=0;m<f;m++)v+=h[m];e.update(v,n,1)}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function Nm(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:Ot("WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Um(i,t,e){let n=new WeakMap,s=new oe;function r(o,a,l){let c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,p=u!==void 0?u.length:0,h=n.get(a);if(h===void 0||h.count!==p){let O=function(){_.dispose(),n.delete(a),a.removeEventListener("dispose",O)};h!==void 0&&h.texture.dispose();let f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,v=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],d=a.morphAttributes.normal||[],M=a.morphAttributes.color||[],T=0;f===!0&&(T=1),g===!0&&(T=2),v===!0&&(T=3);let S=a.attributes.position.count*T,A=1;S>t.maxTextureSize&&(A=Math.ceil(S/t.maxTextureSize),S=t.maxTextureSize);let E=new Float32Array(S*A*4*p),_=new Ns(E,S,A,p);_.type=ln,_.needsUpdate=!0;let b=T*4;for(let L=0;L<p;L++){let D=m[L],k=d[L],q=M[L],R=S*A*4*L;for(let V=0;V<D.count;V++){let Y=V*b;f===!0&&(s.fromBufferAttribute(D,V),E[R+Y+0]=s.x,E[R+Y+1]=s.y,E[R+Y+2]=s.z,E[R+Y+3]=0),g===!0&&(s.fromBufferAttribute(k,V),E[R+Y+4]=s.x,E[R+Y+5]=s.y,E[R+Y+6]=s.z,E[R+Y+7]=0),v===!0&&(s.fromBufferAttribute(q,V),E[R+Y+8]=s.x,E[R+Y+9]=s.y,E[R+Y+10]=s.z,E[R+Y+11]=q.itemSize===4?s.w:1)}}h={count:p,texture:_,size:new Nt(S,A)},n.set(a,h),a.addEventListener("dispose",O)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let f=0;for(let v=0;v<c.length;v++)f+=c[v];let g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function Fm(i,t,e,n,s){let r=new WeakMap;function o(c){let u=s.render.frame,p=c.geometry,h=t.get(c,p);if(r.get(h)!==u&&(t.update(h),r.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(e.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==u&&(f.update(),r.set(f,u))}return h}function a(){r=new WeakMap}function l(c){let u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),e.remove(u.instanceMatrix),u.instanceColor!==null&&e.remove(u.instanceColor)}return{update:o,dispose:a}}var Om={[nl]:"LINEAR_TONE_MAPPING",[il]:"REINHARD_TONE_MAPPING",[sl]:"CINEON_TONE_MAPPING",[rl]:"ACES_FILMIC_TONE_MAPPING",[al]:"AGX_TONE_MAPPING",[ll]:"NEUTRAL_TONE_MAPPING",[ol]:"CUSTOM_TONE_MAPPING"};function Bm(i,t,e,n,s,r){let o=new Xe(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=null,u=new Bn;u.setAttribute("position",new We([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute("uv",new We([0,2,0,0,2,0],2));let p=new to({uniforms:{tDiffuse:{value:null}},vertexShader:`
      precision highp float;

      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;

      attribute vec3 position;
      attribute vec2 uv;

      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }`,fragmentShader:`
      precision highp float;

      uniform sampler2D tDiffuse;

      varying vec2 vUv;

      #include <tonemapping_pars_fragment>
      #include <colorspace_pars_fragment>

      void main() {
        gl_FragColor = texture2D( tDiffuse, vUv );

        #ifdef LINEAR_TONE_MAPPING
          gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
        #elif defined( REINHARD_TONE_MAPPING )
          gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
        #elif defined( CINEON_TONE_MAPPING )
          gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
        #elif defined( ACES_FILMIC_TONE_MAPPING )
          gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
        #elif defined( AGX_TONE_MAPPING )
          gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
        #elif defined( NEUTRAL_TONE_MAPPING )
          gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
        #elif defined( CUSTOM_TONE_MAPPING )
          gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
        #endif

        #ifdef SRGB_TRANSFER
          gl_FragColor = sRGBTransferOETF( gl_FragColor );
        #endif
      }`,depthTest:!1,depthWrite:!1}),h=new Re(u,p),f=new js(-1,1,1,-1,0,1),g=null,v=null,m=!1,d,M=null,T=[],S=!1;this.setSize=function(A,E){o.setSize(A,E),a!==null&&a.setSize(A,E),l!==null&&l.setSize(A,E);for(let _=0;_<T.length;_++){let b=T[_];b.setSize&&b.setSize(A,E)}},this.setEffects=function(A){T=A,S=T.length>0&&T[0].isRenderPass===!0;let E=o.width,_=o.height;T.length>0&&a===null&&(a=new Xe(E,_,{type:en,depthBuffer:!1,stencilBuffer:!1}),l=new Xe(E,_,{type:en,depthBuffer:!1,stencilBuffer:!1}));let b=s===!0&&T.some(O=>O.needsDepthTexture===!0);b!==(o.depthTexture!==null)&&(b===!0&&c===null&&(c=new zn(E,_),r===!0&&(c.format=Vn,c.type=Ci)),o.dispose(),o.depthTexture=b?c:null,o.resolveDepthBuffer=b,o.storeMultisampledDepthBuffer=b);for(let O=0;O<T.length;O++){let L=T[O];L.setSize&&L.setSize(E,_),b&&L.needsDepthTexture===!0&&L.setDepthTexture&&L.setDepthTexture(c)}},this.begin=function(A,E){if(m||A.toneMapping===an&&T.length===0)return!1;if(M=E,E!==null){let _=E.width,b=E.height;(o.width!==_||o.height!==b)&&this.setSize(_,b)}return S===!1&&A.setRenderTarget(o),d=A.toneMapping,A.toneMapping=an,!0},this.hasRenderPass=function(){return S},this.end=function(A,E){A.toneMapping=d,m=!0;let _=o,b=a;for(let O=0;O<T.length;O++){let L=T[O];L.enabled!==!1&&(L.render(A,b,_,E),L.needsSwap!==!1&&(_=b,b=b===a?l:a))}if(g!==A.outputColorSpace||v!==A.toneMapping){g=A.outputColorSpace,v=A.toneMapping,p.defines={},Kt.getTransfer(g)===ne&&(p.defines.SRGB_TRANSFER="");let O=Om[v];O&&(p.defines[O]=""),p.needsUpdate=!0}p.uniforms.tDiffuse.value=_.texture,A.setRenderTarget(M),A.render(h,f),M=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),u.dispose(),p.dispose()}}var Qh=new Ye,tu=new zn(1,1),eu=new Hs(1),nu=new Ns,iu=new jr,su=new ks,Lh=[],Dh=[],Nh=new Float32Array(16),Uh=new Float32Array(9),Fh=new Float32Array(4);function ms(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=Lh[s];if(r===void 0&&(r=new Float32Array(s),Lh[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function ve(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Me(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function aa(i,t){let e=Dh[t];e===void 0&&(e=new Int32Array(t),Dh[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function zm(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Gm(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ve(e,t))return;i.uniform2fv(this.addr,t),Me(e,t)}}function Vm(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(ve(e,t))return;i.uniform3fv(this.addr,t),Me(e,t)}}function km(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ve(e,t))return;i.uniform4fv(this.addr,t),Me(e,t)}}function Hm(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(ve(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Me(e,t)}else{if(ve(e,n))return;Fh.set(n),i.uniformMatrix2fv(this.addr,!1,Fh),Me(e,n)}}function Wm(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(ve(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Me(e,t)}else{if(ve(e,n))return;Uh.set(n),i.uniformMatrix3fv(this.addr,!1,Uh),Me(e,n)}}function Xm(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(ve(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Me(e,t)}else{if(ve(e,n))return;Nh.set(n),i.uniformMatrix4fv(this.addr,!1,Nh),Me(e,n)}}function qm(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Ym(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ve(e,t))return;i.uniform2iv(this.addr,t),Me(e,t)}}function Zm(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ve(e,t))return;i.uniform3iv(this.addr,t),Me(e,t)}}function Jm(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ve(e,t))return;i.uniform4iv(this.addr,t),Me(e,t)}}function Km(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function $m(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ve(e,t))return;i.uniform2uiv(this.addr,t),Me(e,t)}}function jm(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ve(e,t))return;i.uniform3uiv(this.addr,t),Me(e,t)}}function Qm(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ve(e,t))return;i.uniform4uiv(this.addr,t),Me(e,t)}}function la(i){return i.version===0&&(i.compareFunction=xl,i.needsUpdate=!0),i}function tg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?r=la(tu):r=Qh,e.setTexture2D(t||r,s)}function eg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||iu,s)}function ng(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_CUBE_SHADOW?r=la(eu):r=su,e.setTextureCube(t||r,s)}function ig(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||nu,s)}function sg(i){switch(i){case 5126:return zm;case 35664:return Gm;case 35665:return Vm;case 35666:return km;case 35674:return Hm;case 35675:return Wm;case 35676:return Xm;case 5124:case 35670:return qm;case 35667:case 35671:return Ym;case 35668:case 35672:return Zm;case 35669:case 35673:return Jm;case 5125:return Km;case 36294:return $m;case 36295:return jm;case 36296:return Qm;case 35678:case 36198:case 36298:case 36306:case 35682:return tg;case 35679:case 36299:case 36307:return eg;case 35680:case 36300:case 36308:case 36293:return ng;case 36289:case 36303:case 36311:case 36292:return ig}}function rg(i,t){i.uniform1fv(this.addr,t)}function og(i,t){let e=ms(t,this.size,2);i.uniform2fv(this.addr,e)}function ag(i,t){let e=ms(t,this.size,3);i.uniform3fv(this.addr,e)}function lg(i,t){let e=ms(t,this.size,4);i.uniform4fv(this.addr,e)}function cg(i,t){let e=ms(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function hg(i,t){let e=ms(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function ug(i,t){let e=ms(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function dg(i,t){i.uniform1iv(this.addr,t)}function fg(i,t){i.uniform2iv(this.addr,t)}function pg(i,t){i.uniform3iv(this.addr,t)}function mg(i,t){i.uniform4iv(this.addr,t)}function gg(i,t){i.uniform1uiv(this.addr,t)}function _g(i,t){i.uniform2uiv(this.addr,t)}function xg(i,t){i.uniform3uiv(this.addr,t)}function yg(i,t){i.uniform4uiv(this.addr,t)}function vg(i,t,e){let n=this.cache,s=t.length,r=aa(e,s);ve(n,r)||(i.uniform1iv(this.addr,r),Me(n,r));let o;this.type===i.SAMPLER_2D_SHADOW?o=la(tu):o=Qh;for(let a=0;a!==s;++a)e.setTexture2D(t[a]||o,r[a])}function Mg(i,t,e){let n=this.cache,s=t.length,r=aa(e,s);ve(n,r)||(i.uniform1iv(this.addr,r),Me(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||iu,r[o])}function Sg(i,t,e){let n=this.cache,s=t.length,r=aa(e,s);ve(n,r)||(i.uniform1iv(this.addr,r),Me(n,r));let o;this.type===i.SAMPLER_CUBE_SHADOW?o=la(eu):o=su;for(let a=0;a!==s;++a)e.setTextureCube(t[a]||o,r[a])}function bg(i,t,e){let n=this.cache,s=t.length,r=aa(e,s);ve(n,r)||(i.uniform1iv(this.addr,r),Me(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||nu,r[o])}function wg(i){switch(i){case 5126:return rg;case 35664:return og;case 35665:return ag;case 35666:return lg;case 35674:return cg;case 35675:return hg;case 35676:return ug;case 5124:case 35670:return dg;case 35667:case 35671:return fg;case 35668:case 35672:return pg;case 35669:case 35673:return mg;case 5125:return gg;case 36294:return _g;case 36295:return xg;case 36296:return yg;case 35678:case 36198:case 36298:case 36306:case 35682:return vg;case 35679:case 36299:case 36307:return Mg;case 35680:case 36300:case 36308:case 36293:return Sg;case 36289:case 36303:case 36311:case 36292:return bg}}var Il=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=sg(e.type)}},Ll=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=wg(e.type)}},Dl=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(t,e[a.id],n)}}},Cl=/(\w+)(\])?(\[|\.)?/g;function Oh(i,t){i.seq.push(t),i.map[t.id]=t}function Tg(i,t,e){let n=i.name,s=n.length;for(Cl.lastIndex=0;;){let r=Cl.exec(n),o=Cl.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){Oh(e,c===void 0?new Il(a,i,t):new Ll(a,i,t));break}else{let p=e.map[a];p===void 0&&(p=new Dl(a),Oh(e,p)),e=p}}}var ps=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=t.getActiveUniform(e,o),l=t.getUniformLocation(e,a.name);Tg(a,l,this)}let s=[],r=[];for(let o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){let a=e[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let o=t[s];o.id in e&&n.push(o)}return n}};function Bh(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var Eg=37297,Ag=0;function Rg(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}var zh=new Bt;function Cg(i){Kt._getMatrix(zh,Kt.workingColorSpace,i);let t=`mat3( ${zh.elements.map(e=>e.toFixed(4))} )`;switch(Kt.getTransfer(i)){case Ls:return[t,"LinearTransferOETF"];case ne:return[t,"sRGBTransferOETF"];default:return Dt("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function Gh(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return e.toUpperCase()+`

`+r+`

`+Rg(i.getShaderSource(t),a)}else return r}function Pg(i,t){let e=Cg(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( ${e[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var Ig={[nl]:"Linear",[il]:"Reinhard",[sl]:"Cineon",[rl]:"ACESFilmic",[al]:"AgX",[ll]:"Neutral",[ol]:"Custom"};function Lg(i,t){let e=Ig[t];return e===void 0?(Dt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var sa=new U;function Dg(){Kt.getLuminanceCoefficients(sa);let i=sa.x.toFixed(4),t=sa.y.toFixed(4),e=sa.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Ng(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(lr).join(`
`)}function Ug(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Fg(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function lr(i){return i!==""}function Vh(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function kh(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Og=/^[ \t]*#include +<([\w\d./]+)>/gm;function Nl(i){return i.replace(Og,Bg)}function Bg(i,t){let e=Wt[t];if(e===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">");return Nl(e)}var zg=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Hh(i){return i.replace(zg,Gg)}function Gg(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Wh(i){let t=`precision ${i.precision} float;
  precision ${i.precision} int;
  precision ${i.precision} sampler2D;
  precision ${i.precision} samplerCube;
  precision ${i.precision} sampler3D;
  precision ${i.precision} sampler2DArray;
  precision ${i.precision} sampler2DShadow;
  precision ${i.precision} samplerCubeShadow;
  precision ${i.precision} sampler2DArrayShadow;
  precision ${i.precision} isampler2D;
  precision ${i.precision} isampler3D;
  precision ${i.precision} isamplerCube;
  precision ${i.precision} isampler2DArray;
  precision ${i.precision} usampler2D;
  precision ${i.precision} usampler3D;
  precision ${i.precision} usamplerCube;
  precision ${i.precision} usampler2DArray;
  `;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var Vg={[wi]:"SHADOWMAP_TYPE_PCF",[cs]:"SHADOWMAP_TYPE_VSM"};function kg(i){return Vg[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Hg={[us]:"ENVMAP_MODE_REFRACTION"};function Wg(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":Hg[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Xg={[mo]:"ENVMAP_BLENDING_MULTIPLY",[oh]:"ENVMAP_BLENDING_MIX",[ah]:"ENVMAP_BLENDING_ADD"};function qg(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":Xg[i.combine]||"ENVMAP_BLENDING_NONE"}function Yg(i,t,e,n){let s=i.getContext(),r=e.defines,o=e.vertexShader,a=e.fragmentShader,l=kg(e),c=e.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",u=Wg(e),p=qg(e),h=Ng(e),f=Ug(r),g=s.createProgram(),v,m,d=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(v=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,f].filter(lr).join(`
`),v.length>0&&(v+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,f].filter(lr).join(`
`),m.length>0&&(m+=`
`)):(v=[Wh(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,f,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+e.diffuseRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(lr).join(`
`),m=[Wh(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,f,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+u:"",e.envMap?"#define "+p:"",e.envMapPMREM?"#define ENVMAP_MAX_LOD "+e.envMapMaxLod+".0":"",e.envMapPMREM?"#define ENVMAP_SIZE "+e.envMapSize+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",e.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==an?"#define TONE_MAPPING":"",e.toneMapping!==an?Wt.tonemapping_pars_fragment:"",e.toneMapping!==an?Lg("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Wt.colorspace_pars_fragment,Pg("linearToOutputTexel",e.outputColorSpace),Dg(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(lr).join(`
`)),o=Nl(o),o=Vh(o,e),o=kh(o,e),a=Nl(a),a=Vh(a,e),a=kh(a,e),o=Hh(o),a=Hh(a),e.isRawShaderMaterial!==!0&&(d=`#version 300 es
`,v=[h,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+v,m=["#define varying in",e.glslVersion===yl?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===yl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let M=d+v+o,T=d+m+a,S=Bh(s,s.VERTEX_SHADER,M),A=Bh(s,s.FRAGMENT_SHADER,T);s.attachShader(g,S),s.attachShader(g,A),e.index0AttributeName!==void 0?s.bindAttribLocation(g,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(g,0,"position"),s.linkProgram(g);function E(L){if(i.debug.checkShaderErrors){let D=s.getProgramInfoLog(g)||"",k=s.getShaderInfoLog(S)||"",q=s.getShaderInfoLog(A)||"",R=D.trim(),V=k.trim(),Y=q.trim(),G=!0,et=!0;if(s.getProgramParameter(g,s.LINK_STATUS)===!1)if(G=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,g,S,A);else{let W=Gh(s,S,"vertex"),Q=Gh(s,A,"fragment");Ot("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(g,s.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+R+`
`+W+`
`+Q)}else R!==""?Dt("WebGLProgram: Program Info Log:",R):(V===""||Y==="")&&(et=!1);et&&(L.diagnostics={runnable:G,programLog:R,vertexShader:{log:V,prefix:v},fragmentShader:{log:Y,prefix:m}})}s.deleteShader(S),s.deleteShader(A),_=new ps(s,g),b=Fg(s,g)}let _;this.getUniforms=function(){return _===void 0&&E(this),_};let b;this.getAttributes=function(){return b===void 0&&E(this),b};let O=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return O===!1&&(O=s.getProgramParameter(g,Eg)),O},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(g),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Ag++,this.cacheKey=t,this.usedTimes=1,this.program=g,this.vertexShader=S,this.fragmentShader=A,this}var Zg=0,Ul=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new Fl(t),e.set(t,n)),n}},Fl=class{constructor(t){this.id=Zg++,this.code=t,this.usedTimes=0}};function Jg(i){return i===ui||i===rr||i===or}function Kg(i,t,e,n,s,r){let o=new Us,a=new Ul,l=new Set,c=[],u=new Map,p=n.logarithmicDepthBuffer,h={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(_){return l.add(_),_===0?"uv":`uv${_}`}function g(_,b,O,L,D,k){let q=L.fog,R=D.geometry,V=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?L.environment:null,Y=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,G=t.get(_.envMap||V,Y),et=h[_.type],W=n.precision;_.precision!==null&&(W=n.getMaxPrecision(_.precision),W!==_.precision&&Dt("WebGLProgram.getParameters:",_.precision,"not supported, using",W,"instead."));let Q=R.morphAttributes.position||R.morphAttributes.normal||R.morphAttributes.color,tt=Q!==void 0?Q.length:0,vt=0;R.morphAttributes.position!==void 0&&(vt=1),R.morphAttributes.normal!==void 0&&(vt=2),R.morphAttributes.color!==void 0&&(vt=3);let Rt,J,ft,Mt;if(et){let gt=En[et];Rt=gt.vertexShader,J=gt.fragmentShader}else{Rt=_.vertexShader,J=_.fragmentShader;let gt=a.getVertexShaderStage(_),ie=a.getFragmentShaderStage(_);a.update(_,gt,ie),ft=gt.id,Mt=ie.id}let At=i.getRenderTarget(),pt=i.state.buffers.depth.getReversed(),Ft=D.isInstancedMesh===!0,de=D.isBatchedMesh===!0,Pt=!!_.map,jt=!!_.matcap,Yt=!!G,Xt=Yt&&G.isPMREMTexture===!0,xe=!!_.aoMap,pe=!!_.lightMap,Ce=!!_.bumpMap&&_.wireframe===!1,ce=!!_.normalMap,nn=!!_.displacementMap,rt=!!_.emissiveMap,xt=!!_.metalnessMap,zt=!!_.roughnessMap,ee=_.anisotropy>0,I=_.clearcoat>0,Ne=_.diffuseRoughness>0,ae=_.dispersion>0,ue=_.retroreflectivity>0,mt=_.iridescence>0,ye=_.sheen>0,Lt=_.transmission>0,Gt=ee&&!!_.anisotropyMap,w=I&&!!_.clearcoatMap,x=I&&!!_.clearcoatNormalMap,B=I&&!!_.clearcoatRoughnessMap,nt=Ne&&!!_.diffuseRoughnessMap,j=mt&&!!_.iridescenceMap,ot=mt&&!!_.iridescenceThicknessMap,ut=ye&&!!_.sheenColorMap,Z=ye&&!!_.sheenRoughnessMap,K=!!_.specularMap,lt=!!_.specularColorMap,C=!!_.specularIntensityMap,$=Lt&&!!_.transmissionMap,X=Lt&&!!_.thicknessMap,ct=!!_.gradientMap,st=!!_.alphaMap,at=_.alphaTest>0,Et=!!_.alphaHash,Ht=!!_.extensions,it=an;_.toneMapped&&(At===null||At.isXRRenderTarget===!0)&&(it=i.toneMapping);let Ct=Xt?G.isCompressedCubeTexture?G.image[0].mipmaps:G.mipmaps:null,kt={shaderID:et,shaderType:_.type,shaderName:_.name,vertexShader:Rt,fragmentShader:J,defines:_.defines,customVertexShaderID:ft,customFragmentShaderID:Mt,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:W,batching:de,batchingColor:de&&D._colorsTexture!==null,instancing:Ft,instancingColor:Ft&&D.instanceColor!==null,instancingMorph:Ft&&D.morphTexture!==null,outputColorSpace:At===null?i.outputColorSpace:At.isXRRenderTarget===!0?At.texture.colorSpace:Kt.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:Pt,matcap:jt,envMap:Yt,envMapMode:Yt&&G.mapping,envMapPMREM:Xt,envMapMaxLod:Xt?Ct.length-1:null,envMapSize:Xt?Ct[0].width:null,aoMap:xe,lightMap:pe,bumpMap:Ce,normalMap:ce,displacementMap:nn,emissiveMap:rt,normalMapObjectSpace:ce&&_.normalMapType===hh,normalMapTangentSpace:ce&&_.normalMapType===na,packedNormalMap:ce&&_.normalMapType===na&&Jg(_.normalMap.format),metalnessMap:xt,roughnessMap:zt,anisotropy:ee,anisotropyMap:Gt,clearcoat:I,clearcoatMap:w,clearcoatNormalMap:x,clearcoatRoughnessMap:B,diffuseRoughness:Ne,diffuseRoughnessMap:nt,dispersion:ae,retroreflection:ue,iridescence:mt,iridescenceMap:j,iridescenceThicknessMap:ot,sheen:ye,sheenColorMap:ut,sheenRoughnessMap:Z,specularMap:K,specularColorMap:lt,specularIntensityMap:C,transmission:Lt,transmissionMap:$,thicknessMap:X,gradientMap:ct,opaque:_.transparent===!1&&_.blending===hs&&_.alphaToCoverage===!1,alphaMap:st,alphaTest:at,alphaHash:Et,combine:_.combine,mapUv:Pt&&f(_.map.channel),aoMapUv:xe&&f(_.aoMap.channel),lightMapUv:pe&&f(_.lightMap.channel),bumpMapUv:Ce&&f(_.bumpMap.channel),normalMapUv:ce&&f(_.normalMap.channel),displacementMapUv:nn&&f(_.displacementMap.channel),emissiveMapUv:rt&&f(_.emissiveMap.channel),metalnessMapUv:xt&&f(_.metalnessMap.channel),roughnessMapUv:zt&&f(_.roughnessMap.channel),anisotropyMapUv:Gt&&f(_.anisotropyMap.channel),clearcoatMapUv:w&&f(_.clearcoatMap.channel),clearcoatNormalMapUv:x&&f(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:B&&f(_.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:nt&&f(_.diffuseRoughnessMap.channel),iridescenceMapUv:j&&f(_.iridescenceMap.channel),iridescenceThicknessMapUv:ot&&f(_.iridescenceThicknessMap.channel),sheenColorMapUv:ut&&f(_.sheenColorMap.channel),sheenRoughnessMapUv:Z&&f(_.sheenRoughnessMap.channel),specularMapUv:K&&f(_.specularMap.channel),specularColorMapUv:lt&&f(_.specularColorMap.channel),specularIntensityMapUv:C&&f(_.specularIntensityMap.channel),transmissionMapUv:$&&f(_.transmissionMap.channel),thicknessMapUv:X&&f(_.thicknessMap.channel),alphaMapUv:st&&f(_.alphaMap.channel),vertexTangents:!!R.attributes.tangent&&(ce||ee),vertexNormals:!!R.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!R.attributes.color&&R.attributes.color.itemSize===4,pointsUvs:D.isPoints===!0&&!!R.attributes.uv&&(Pt||st),fog:!!q,useFog:_.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||R.attributes.normal===void 0&&ce===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:p,reversedDepthBuffer:pt,skinning:D.isSkinnedMesh===!0,hasPositionAttribute:R.attributes.position!==void 0,morphTargets:R.morphAttributes.position!==void 0,morphNormals:R.morphAttributes.normal!==void 0,morphColors:R.morphAttributes.color!==void 0,morphTargetsCount:tt,morphTextureStride:vt,numSunLights:b.sun.length,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numSunLightShadows:b.sunShadowMap.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numLightProbeGrids:k.filter(gt=>gt.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&O.length>0,shadowMapType:i.shadowMap.type,toneMapping:it,decodeVideoTexture:Pt&&_.map.isVideoTexture===!0&&Kt.getTransfer(_.map.colorSpace)===ne,decodeVideoTextureEmissive:rt&&_.emissiveMap.isVideoTexture===!0&&Kt.getTransfer(_.emissiveMap.colorSpace)===ne,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===on,flipSided:_.side===Le,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:Ht&&_.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ht&&_.extensions.multiDraw===!0||de)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return kt.vertexUv1s=l.has(1),kt.vertexUv2s=l.has(2),kt.vertexUv3s=l.has(3),l.clear(),kt}function v(_){let b=[];if(_.shaderID?b.push(_.shaderID):(b.push(_.customVertexShaderID),b.push(_.customFragmentShaderID)),_.defines!==void 0)for(let O in _.defines)b.push(O),b.push(_.defines[O]);return _.isRawShaderMaterial===!1&&(m(b,_),d(b,_),b.push(i.outputColorSpace)),b.push(_.customProgramCacheKey),b.join()}function m(_,b){_.push(b.precision),_.push(b.outputColorSpace),_.push(b.envMapMode),_.push(b.envMapPMREM),_.push(b.envMapMaxLod),_.push(b.envMapSize),_.push(b.mapUv),_.push(b.alphaMapUv),_.push(b.lightMapUv),_.push(b.aoMapUv),_.push(b.bumpMapUv),_.push(b.normalMapUv),_.push(b.displacementMapUv),_.push(b.emissiveMapUv),_.push(b.metalnessMapUv),_.push(b.roughnessMapUv),_.push(b.anisotropyMapUv),_.push(b.clearcoatMapUv),_.push(b.clearcoatNormalMapUv),_.push(b.clearcoatRoughnessMapUv),_.push(b.diffuseRoughnessMapUv),_.push(b.iridescenceMapUv),_.push(b.iridescenceThicknessMapUv),_.push(b.sheenColorMapUv),_.push(b.sheenRoughnessMapUv),_.push(b.specularMapUv),_.push(b.specularColorMapUv),_.push(b.specularIntensityMapUv),_.push(b.transmissionMapUv),_.push(b.thicknessMapUv),_.push(b.combine),_.push(b.fogExp2),_.push(b.sizeAttenuation),_.push(b.morphTargetsCount),_.push(b.numSunLights),_.push(b.numDirLights),_.push(b.numPointLights),_.push(b.numSpotLights),_.push(b.numSpotLightMaps),_.push(b.numHemiLights),_.push(b.numRectAreaLights),_.push(b.numSunLightShadows),_.push(b.numDirLightShadows),_.push(b.numPointLightShadows),_.push(b.numSpotLightShadows),_.push(b.numSpotLightShadowsWithMaps),_.push(b.numLightProbes),_.push(b.numLightProbeGrids),_.push(b.shadowMapType),_.push(b.toneMapping),_.push(b.numClippingPlanes),_.push(b.numClipIntersection),_.push(b.depthPacking)}function d(_,b){o.disableAll(),b.instancing&&o.enable(0),b.instancingColor&&o.enable(1),b.instancingMorph&&o.enable(2),b.matcap&&o.enable(3),b.envMap&&o.enable(4),b.normalMapObjectSpace&&o.enable(5),b.normalMapTangentSpace&&o.enable(6),b.clearcoat&&o.enable(7),b.iridescence&&o.enable(8),b.alphaTest&&o.enable(9),b.vertexColors&&o.enable(10),b.vertexAlphas&&o.enable(11),b.vertexUv1s&&o.enable(12),b.vertexUv2s&&o.enable(13),b.vertexUv3s&&o.enable(14),b.vertexTangents&&o.enable(15),b.anisotropy&&o.enable(16),b.alphaHash&&o.enable(17),b.batching&&o.enable(18),b.dispersion&&o.enable(19),b.retroreflection&&o.enable(24),b.diffuseRoughness&&o.enable(25),b.batchingColor&&o.enable(20),b.gradientMap&&o.enable(21),b.packedNormalMap&&o.enable(22),b.vertexNormals&&o.enable(23),_.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.reversedDepthBuffer&&o.enable(4),b.skinning&&o.enable(5),b.morphTargets&&o.enable(6),b.morphNormals&&o.enable(7),b.morphColors&&o.enable(8),b.premultipliedAlpha&&o.enable(9),b.shadowMapEnabled&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),b.decodeVideoTextureEmissive&&o.enable(20),b.alphaToCoverage&&o.enable(21),b.numLightProbeGrids>0&&o.enable(22),b.hasPositionAttribute&&o.enable(23),_.push(o.mask)}function M(_){let b=h[_.type],O;if(b){let L=En[b];O=Th.clone(L.uniforms)}else O=_.uniforms;return O}function T(_,b){let O=u.get(b);return O!==void 0?++O.usedTimes:(O=new Yg(i,b,_,s),c.push(O),u.set(b,O)),O}function S(_){if(--_.usedTimes===0){let b=c.indexOf(_);c[b]=c[c.length-1],c.pop(),u.delete(_.cacheKey),_.destroy()}}function A(_){a.remove(_)}function E(){a.dispose()}return{getParameters:g,getProgramCacheKey:v,getUniforms:M,acquireProgram:T,releaseProgram:S,releaseShaderCache:A,programs:c,dispose:E}}function $g(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function jg(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function Xh(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function qh(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(h){let f=0;return h.isInstancedMesh&&(f+=2),h.isSkinnedMesh&&(f+=1),f}function a(h,f,g,v,m,d){let M=i[t];return M===void 0?(M={id:h.id,object:h,geometry:f,material:g,materialVariant:o(h),groupOrder:v,renderOrder:h.renderOrder,z:m,group:d},i[t]=M):(M.id=h.id,M.object=h,M.geometry=f,M.material=g,M.materialVariant=o(h),M.groupOrder=v,M.renderOrder=h.renderOrder,M.z=m,M.group=d),t++,M}function l(h,f,g,v,m,d,M){M.reversedDepth===!0&&(m=-m);let T=a(h,f,g,v,m,d);g.transmission>0?n.push(T):g.transparent===!0?s.push(T):e.push(T)}function c(h,f,g,v,m,d){let M=a(h,f,g,v,m,d);g.transmission>0?n.unshift(M):g.transparent===!0?s.unshift(M):e.unshift(M)}function u(h,f){e.length>1&&e.sort(h||jg),n.length>1&&n.sort(f||Xh),s.length>1&&s.sort(f||Xh)}function p(){for(let h=t,f=i.length;h<f;h++){let g=i[h];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:p,sort:u}}function Qg(){let i=new WeakMap;function t(n,s){let r=i.get(n),o;return r===void 0?(o=new qh,i.set(n,[o])):s>=r.length?(o=new qh,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function t0(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new U,color:new It};break;case"SpotLight":e={position:new U,direction:new U,color:new It,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new U,color:new It,distance:0,decay:0};break;case"HemisphereLight":e={direction:new U,skyColor:new It,groundColor:new It};break;case"RectAreaLight":e={color:new It,position:new U,halfWidth:new U,halfHeight:new U};break}return i[t.id]=e,e}}}function e0(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Nt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Nt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Nt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var n0=0;function i0(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function s0(i){let t=new t0,e=e0(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new U);let s=new U,r=new se,o=new se;function a(c){let u=0,p=0,h=0;for(let k=0;k<9;k++)n.probe[k].set(0,0,0);let f=0,g=0,v=0,m=0,d=0,M=0,T=0,S=0,A=0,E=0,_=0,b=0,O=0,L=0;c.sort(i0);for(let k=0,q=c.length;k<q;k++){let R=c[k],V=R.color,Y=R.intensity,G=R.distance,et=null;if(R.shadow&&R.shadow.map&&(R.shadow.map.texture.format===ui?et=R.shadow.map.texture:et=R.shadow.map.depthTexture||R.shadow.map.texture),R.isAmbientLight)u+=V.r*Y,p+=V.g*Y,h+=V.b*Y;else if(R.isLightProbe){for(let W=0;W<9;W++)n.probe[W].addScaledVector(R.sh.coefficients[W],Y);L++}else if(R.isSunLight){let W=t.get(R);if(W.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){let Q=R.shadow,tt=e.get(R);tt.shadowIntensity=Q.intensity,tt.shadowBias=Q.bias,tt.shadowNormalBias=Q.normalBias,tt.shadowRadius=Q.radius,tt.shadowMapSize.copy(Q.mapSize).multiply(Q.getFrameExtents()),n.sunShadow[g]=tt,n.sunShadowMap[g]=et;let vt=Q.getViewportCount();for(let Rt=0;Rt<vt;Rt++)n.sunShadowMatrix[v+Rt]=Q.getMatrix(Rt),n.sunShadowCascade[v+Rt]=Q._cascadeData[Rt];v+=vt,g++}n.sun[f]=W,f++}else if(R.isDirectionalLight){let W=t.get(R);if(W.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){let Q=R.shadow,tt=e.get(R);tt.shadowIntensity=Q.intensity,tt.shadowBias=Q.bias,tt.shadowNormalBias=Q.normalBias,tt.shadowRadius=Q.radius,tt.shadowMapSize=Q.mapSize,n.directionalShadow[m]=tt,n.directionalShadowMap[m]=et,n.directionalShadowMatrix[m]=R.shadow.matrix,A++}n.directional[m]=W,m++}else if(R.isSpotLight){let W=t.get(R);W.position.setFromMatrixPosition(R.matrixWorld),W.color.copy(V).multiplyScalar(Y),W.distance=G,W.coneCos=Math.cos(R.angle),W.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),W.decay=R.decay,n.spot[M]=W;let Q=R.shadow;if(R.map&&(n.spotLightMap[b]=R.map,b++,Q.updateMatrices(R),R.castShadow&&O++),n.spotLightMatrix[M]=Q.matrix,R.castShadow){let tt=e.get(R);tt.shadowIntensity=Q.intensity,tt.shadowBias=Q.bias,tt.shadowNormalBias=Q.normalBias,tt.shadowRadius=Q.radius,tt.shadowMapSize=Q.mapSize,n.spotShadow[M]=tt,n.spotShadowMap[M]=et,_++}M++}else if(R.isRectAreaLight){let W=t.get(R);W.color.copy(V).multiplyScalar(Y),W.halfWidth.set(R.width*.5,0,0),W.halfHeight.set(0,R.height*.5,0),n.rectArea[T]=W,T++}else if(R.isPointLight){let W=t.get(R);if(W.color.copy(R.color).multiplyScalar(R.intensity),W.distance=R.distance,W.decay=R.decay,R.castShadow){let Q=R.shadow,tt=e.get(R);tt.shadowIntensity=Q.intensity,tt.shadowBias=Q.bias,tt.shadowNormalBias=Q.normalBias,tt.shadowRadius=Q.radius,tt.shadowMapSize=Q.mapSize,tt.shadowCameraNear=Q.camera.near,tt.shadowCameraFar=Q.camera.far,n.pointShadow[d]=tt,n.pointShadowMap[d]=et,n.pointShadowMatrix[d]=R.shadow.matrix,E++}n.point[d]=W,d++}else if(R.isHemisphereLight){let W=t.get(R);W.skyColor.copy(R.color).multiplyScalar(Y),W.groundColor.copy(R.groundColor).multiplyScalar(Y),n.hemi[S]=W,S++}}T>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=_t.LTC_FLOAT_1,n.rectAreaLTC2=_t.LTC_FLOAT_2):(n.rectAreaLTC1=_t.LTC_HALF_1,n.rectAreaLTC2=_t.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=p,n.ambient[2]=h;let D=n.hash;(D.sunLength!==f||D.directionalLength!==m||D.pointLength!==d||D.spotLength!==M||D.rectAreaLength!==T||D.hemiLength!==S||D.numSunShadows!==g||D.numDirectionalShadows!==A||D.numPointShadows!==E||D.numSpotShadows!==_||D.numSpotMaps!==b||D.numLightProbes!==L)&&(n.sun.length=f,n.directional.length=m,n.spot.length=M,n.rectArea.length=T,n.point.length=d,n.hemi.length=S,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=v,n.sunShadowCascade.length=v,n.directionalShadow.length=A,n.directionalShadowMap.length=A,n.directionalShadowMatrix.length=A,n.pointShadow.length=E,n.pointShadowMap.length=E,n.pointShadowMatrix.length=E,n.spotShadow.length=_,n.spotShadowMap.length=_,n.spotLightMatrix.length=_+b-O,n.spotLightMap.length=b,n.numSpotLightShadowsWithMaps=O,n.numLightProbes=L,D.sunLength=f,D.directionalLength=m,D.pointLength=d,D.spotLength=M,D.rectAreaLength=T,D.hemiLength=S,D.numSunShadows=g,D.numDirectionalShadows=A,D.numPointShadows=E,D.numSpotShadows=_,D.numSpotMaps=b,D.numLightProbes=L,n.version=n0++)}function l(c,u){let p=0,h=0,f=0,g=0,v=0,m=0,d=u.matrixWorldInverse;for(let M=0,T=c.length;M<T;M++){let S=c[M];if(S.isSunLight){let A=n.sun[p];A.direction.setFromMatrixPosition(S.matrixWorld),A.direction.transformDirection(d),p++}else if(S.isDirectionalLight){let A=n.directional[h];A.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),A.direction.sub(s),A.direction.transformDirection(d),h++}else if(S.isSpotLight){let A=n.spot[g];A.position.setFromMatrixPosition(S.matrixWorld),A.position.applyMatrix4(d),A.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),A.direction.sub(s),A.direction.transformDirection(d),g++}else if(S.isRectAreaLight){let A=n.rectArea[v];A.position.setFromMatrixPosition(S.matrixWorld),A.position.applyMatrix4(d),o.identity(),r.copy(S.matrixWorld),r.premultiply(d),o.extractRotation(r),A.halfWidth.set(S.width*.5,0,0),A.halfHeight.set(0,S.height*.5,0),A.halfWidth.applyMatrix4(o),A.halfHeight.applyMatrix4(o),v++}else if(S.isPointLight){let A=n.point[f];A.position.setFromMatrixPosition(S.matrixWorld),A.position.applyMatrix4(d),f++}else if(S.isHemisphereLight){let A=n.hemi[m];A.direction.setFromMatrixPosition(S.matrixWorld),A.direction.transformDirection(d),m++}}}return{setup:a,setupView:l,state:n}}function Yh(i){let t=new s0(i),e=[],n=[],s=[];function r(p){u.camera=p,e.length=0,n.length=0,s.length=0}function o(p){p.isLightProbeGrid?s.push(p):e.push(p)}function a(p){n.push(p)}function l(){t.setup(e),s.sort((p,h)=>p.priority-h.priority||p.id-h.id)}function c(p){t.setupView(e,p)}let u={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function r0(i){let t=new WeakMap;function e(s,r=0){let o=t.get(s),a;return o===void 0?(a=new Yh(i),t.set(s,[a])):r>=o.length?(a=new Yh(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}var o0=`void main() {
  gl_Position = vec4( position, 1.0 );
}`,a0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
  const float samples = float( VSM_SAMPLES );
  float mean = 0.0;
  float squared_mean = 0.0;
  float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
  float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
  for ( float i = 0.0; i < samples; i ++ ) {
    float uvOffset = uvStart + i * uvStride;
    #ifdef HORIZONTAL_PASS
      vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
      mean += distribution.x;
      squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
    #else
      float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
      mean += depth;
      squared_mean += depth * depth;
    #endif
  }
  mean = mean / samples;
  squared_mean = squared_mean / samples;
  float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
  gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,l0=[new U(1,0,0),new U(-1,0,0),new U(0,1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1)],c0=[new U(0,-1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1),new U(0,-1,0),new U(0,-1,0)],Zh=new se,ar=new U,Pl=new U;function h0(i,t,e){let n=new ii,s=new Nt,r=new Nt,o=new oe,a=new eo,l=new no,c={},u=e.maxTextureSize,p={[hi]:Le,[Le]:hi,[on]:on},h=new ze({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Nt},radius:{value:4}},vertexShader:o0,fragmentShader:a0}),f=h.clone();f.defines.HORIZONTAL_PASS=1;let g=new Bn;g.setAttribute("position",new pn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new Re(g,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=wi;let d=this.type;this.render=function(E,_,b){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;this.type===Vc&&(Dt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=wi);let O=i.getRenderTarget(),L=i.getActiveCubeFace(),D=i.getActiveMipmapLevel(),k=i.state;k.setBlending(Ti),k.buffers.depth.getReversed()===!0?k.buffers.color.setClear(0,0,0,0):k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);let q=d!==this.type;q&&_.traverse(function(R){R.material&&(Array.isArray(R.material)?R.material.forEach(V=>V.needsUpdate=!0):R.material.needsUpdate=!0)});for(let R=0,V=E.length;R<V;R++){let Y=E[R],G=Y.shadow;if(G===void 0){Dt("WebGLShadowMap:",Y,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);let et=G.getFrameExtents();s.multiply(et),r.copy(G.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/et.x),s.x=r.x*et.x,G.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/et.y),s.y=r.y*et.y,G.mapSize.y=r.y));let W=i.state.buffers.depth.getReversed();if(G.camera._reversedDepth=W,G.map===null||q===!0){if(G.map!==null&&(G.map.depthTexture!==null&&(G.map.depthTexture.dispose(),G.map.depthTexture=null),G.map.dispose()),this.type===cs){if(Y.isPointLight){Dt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}G.map=new Xe(s.x,s.y,{format:ui,type:en,minFilter:Ae,magFilter:Ae,generateMipmaps:!1}),G.map.texture.name=Y.name+".shadowMap",G.map.depthTexture=new zn(s.x,s.y,ln),G.map.depthTexture.name=Y.name+".shadowMapDepth",G.map.depthTexture.format=Fn,G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=Ee,G.map.depthTexture.magFilter=Ee}else Y.isPointLight?(G.map=new cr(s.x),G.map.depthTexture=new Hs(s.x,gn)):(G.map=new Xe(s.x,s.y),G.map.depthTexture=new zn(s.x,s.y,gn)),G.map.depthTexture.name=Y.name+".shadowMap",G.map.depthTexture.format=Fn,this.type===wi?(G.map.depthTexture.compareFunction=W?_l:gl,G.map.depthTexture.minFilter=Ae,G.map.depthTexture.magFilter=Ae):(G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=Ee,G.map.depthTexture.magFilter=Ee);G.camera.updateProjectionMatrix()}G.map.isWebGLCubeRenderTarget!==!0&&(G.map.width!==s.x||G.map.height!==s.y)&&G.map.setSize(s.x,s.y);let Q=G.map.isWebGLCubeRenderTarget?6:G.getViewportCount();Y.isPointLight!==!0&&G.updateMatrices(Y,b);let tt=(G.camera.layers.mask&4294967294)!==0?G.camera.layers:b.layers;for(let vt=0;vt<Q;vt++){let Rt=G.getCamera(vt);if(Y.isPointLight){let J=G.camera,ft=G.matrix,Mt=Y.distance||J.far;Mt!==J.far&&(J.far=Mt,J.updateProjectionMatrix()),ar.setFromMatrixPosition(Y.matrixWorld),J.position.copy(ar),Pl.copy(J.position),Pl.add(l0[vt]),J.up.copy(c0[vt]),J.lookAt(Pl),J.updateMatrixWorld(),ft.makeTranslation(-ar.x,-ar.y,-ar.z),Zh.multiplyMatrices(J.projectionMatrix,J.matrixWorldInverse),G._frustum.setFromProjectionMatrix(Zh,J.coordinateSystem,J.reversedDepth)}if(G.map.isWebGLCubeRenderTarget)i.setRenderTarget(G.map,vt),i.clear();else{vt===0&&(i.setRenderTarget(G.map),i.clear());let J=G.getViewport(vt);o.set(r.x*J.x,r.y*J.y,r.x*J.z,r.y*J.w),k.viewport(o)}n=G.getFrustum(vt),S(_,b,Rt,Y,tt,this.type)}G.isPointLightShadow!==!0&&this.type===cs&&M(G,b),G.needsUpdate=!1}d=this.type,m.needsUpdate=!1,i.setRenderTarget(O,L,D)};function M(E,_){let b=t.update(v);h.defines.VSM_SAMPLES!==E.blurSamples&&(h.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,h.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null?E.mapPass=new Xe(s.x,s.y,{format:ui,type:en}):(E.mapPass.width!==E.map.width||E.mapPass.height!==E.map.height)&&E.mapPass.setSize(E.map.width,E.map.height),h.uniforms.shadow_pass.value=E.map.depthTexture,h.uniforms.resolution.value.set(E.map.width,E.map.height),h.uniforms.radius.value=E.radius,i.setRenderTarget(E.mapPass),i.clear(),i.renderBufferDirect(_,null,b,h,v,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value.set(E.map.width,E.map.height),f.uniforms.radius.value=E.radius,i.setRenderTarget(E.map),i.clear(),i.renderBufferDirect(_,null,b,f,v,null)}function T(E,_,b,O){let L=null,D=b.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(D!==void 0)L=D;else if(L=b.isPointLight===!0?l:a,i.localClippingEnabled&&_.clipShadows===!0&&Array.isArray(_.clippingPlanes)&&_.clippingPlanes.length!==0||_.displacementMap&&_.displacementScale!==0||_.alphaMap&&_.alphaTest>0||_.map&&_.alphaTest>0||_.alphaToCoverage===!0){let k=L.uuid,q=_.uuid,R=c[k];R===void 0&&(R={},c[k]=R);let V=R[q];V===void 0&&(V=L.clone(),R[q]=V,_.addEventListener("dispose",A)),L=V}if(L.visible=_.visible,L.wireframe=_.wireframe,O===cs?L.side=_.shadowSide!==null?_.shadowSide:_.side:L.side=_.shadowSide!==null?_.shadowSide:p[_.side],L.alphaMap=_.alphaMap,L.alphaTest=_.alphaToCoverage===!0?.5:_.alphaTest,L.map=_.map,L.clipShadows=_.clipShadows,L.clippingPlanes=_.clippingPlanes,L.clipIntersection=_.clipIntersection,L.displacementMap=_.displacementMap,L.displacementScale=_.displacementScale,L.displacementBias=_.displacementBias,L.wireframeLinewidth=_.wireframeLinewidth,L.linewidth=_.linewidth,b.isPointLight===!0&&L.isMeshDistanceMaterial===!0){let k=i.properties.get(L);k.light=b}return L}function S(E,_,b,O,L,D){if(E.visible===!1)return;if(E.layers.test(L)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&D===cs)&&(!E.frustumCulled||E.intersectsFrustum(n))){E.modelViewMatrix.multiplyMatrices(b.matrixWorldInverse,E.matrixWorld);let R=t.update(E),V=E.material;if(Array.isArray(V)){let Y=R.groups;for(let G=0,et=Y.length;G<et;G++){let W=Y[G],Q=V[W.materialIndex];if(Q&&Q.visible){let tt=T(E,Q,O,D);E.onBeforeShadow(i,E,_,b,R,tt,W),i.renderBufferDirect(b,null,R,tt,E,W),E.onAfterShadow(i,E,_,b,R,tt,W)}}}else if(V.visible){let Y=T(E,V,O,D);E.onBeforeShadow(i,E,_,b,R,Y,null),i.renderBufferDirect(b,null,R,Y,E,null),E.onAfterShadow(i,E,_,b,R,Y,null)}}let q=E.children;for(let R=0,V=q.length;R<V;R++)S(q[R],_,b,O,L,D)}function A(E){E.target.removeEventListener("dispose",A);for(let b in c){let O=c[b],L=E.target.uuid;L in O&&(O[L].dispose(),delete O[L])}}}function u0(i,t){function e(){let C=!1,$=new oe,X=null,ct=new oe(0,0,0,0);return{setMask:function(st){X!==st&&!C&&(i.colorMask(st,st,st,st),X=st)},setLocked:function(st){C=st},setClear:function(st,at,Et,Ht,it){it===!0&&(st*=Ht,at*=Ht,Et*=Ht),$.set(st,at,Et,Ht),ct.equals($)===!1&&(i.clearColor(st,at,Et,Ht),ct.copy($))},reset:function(){C=!1,X=null,ct.set(-1,0,0,0)}}}function n(){let C=!1,$=!1,X=null,ct=null,st=null;return{setReversed:function(at){if($!==at){let Et=t.get("EXT_clip_control");at?Et.clipControlEXT(Et.LOWER_LEFT_EXT,Et.ZERO_TO_ONE_EXT):Et.clipControlEXT(Et.LOWER_LEFT_EXT,Et.NEGATIVE_ONE_TO_ONE_EXT),$=at;let Ht=st;st=null,this.setClear(Ht)}},getReversed:function(){return $},setTest:function(at){at?pt(i.DEPTH_TEST):Ft(i.DEPTH_TEST)},setMask:function(at){X!==at&&!C&&(i.depthMask(at),X=at)},setFunc:function(at){if($&&(at=Mh[at]),ct!==at){switch(at){case Gr:i.depthFunc(i.NEVER);break;case Vr:i.depthFunc(i.ALWAYS);break;case kr:i.depthFunc(i.LESS);break;case ji:i.depthFunc(i.LEQUAL);break;case Hr:i.depthFunc(i.EQUAL);break;case Wr:i.depthFunc(i.GEQUAL);break;case Xr:i.depthFunc(i.GREATER);break;case qr:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ct=at}},setLocked:function(at){C=at},setClear:function(at){st!==at&&(st=at,$&&(at=1-at),i.clearDepth(at))},reset:function(){C=!1,X=null,ct=null,st=null,$=!1}}}function s(){let C=!1,$=null,X=null,ct=null,st=null,at=null,Et=null,Ht=null,it=null;return{setTest:function(Ct){C||(Ct?pt(i.STENCIL_TEST):Ft(i.STENCIL_TEST))},setMask:function(Ct){$!==Ct&&!C&&(i.stencilMask(Ct),$=Ct)},setFunc:function(Ct,kt,gt){(X!==Ct||ct!==kt||st!==gt)&&(i.stencilFunc(Ct,kt,gt),X=Ct,ct=kt,st=gt)},setOp:function(Ct,kt,gt){(at!==Ct||Et!==kt||Ht!==gt)&&(i.stencilOp(Ct,kt,gt),at=Ct,Et=kt,Ht=gt)},setLocked:function(Ct){C=Ct},setClear:function(Ct){it!==Ct&&(i.clearStencil(Ct),it=Ct)},reset:function(){C=!1,$=null,X=null,ct=null,st=null,at=null,Et=null,Ht=null,it=null}}}let r=new e,o=new n,a=new s,l={},c=new WeakMap,u={},p={},h={},f=new WeakMap,g=[],v=null,m=!1,d=null,M=null,T=null,S=null,A=null,E=null,_=null,b=new It(0,0,0),O=0,L=!1,D=null,k=null,q=null,R=null,V=null,Y=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),G=!1,et=0,W=i.getParameter(i.VERSION);W.indexOf("WebGL")!==-1?(et=parseFloat(/^WebGL (\d)/.exec(W)[1]),G=et>=1):W.indexOf("OpenGL ES")!==-1&&(et=parseFloat(/^OpenGL ES (\d)/.exec(W)[1]),G=et>=2);let Q=null,tt={},vt=i.getParameter(i.SCISSOR_BOX),Rt=i.getParameter(i.VIEWPORT),J=new oe().fromArray(vt),ft=new oe().fromArray(Rt);function Mt(C,$,X,ct){let st=new Uint8Array(4),at=i.createTexture();i.bindTexture(C,at),i.texParameteri(C,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(C,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Et=0;Et<X;Et++)C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY?i.texImage3D($,0,i.RGBA,1,1,ct,0,i.RGBA,i.UNSIGNED_BYTE,st):i.texImage2D($+Et,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,st);return at}let At={};At[i.TEXTURE_2D]=Mt(i.TEXTURE_2D,i.TEXTURE_2D,1),At[i.TEXTURE_CUBE_MAP]=Mt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),At[i.TEXTURE_2D_ARRAY]=Mt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),At[i.TEXTURE_3D]=Mt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),pt(i.DEPTH_TEST),o.setFunc(ji),Ce(!1),ce($a),pt(i.CULL_FACE),xe(Ti);function pt(C){u[C]!==!0&&(i.enable(C),u[C]=!0)}function Ft(C){u[C]!==!1&&(i.disable(C),u[C]=!1)}function de(C,$){return h[C]!==$?(i.bindFramebuffer(C,$),h[C]=$,C===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=$),C===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=$),!0):!1}function Pt(C,$){let X=g,ct=!1;if(C){X=f.get($),X===void 0&&(X=[],f.set($,X));let st=C.textures;if(X.length!==st.length||X[0]!==i.COLOR_ATTACHMENT0){for(let at=0,Et=st.length;at<Et;at++)X[at]=i.COLOR_ATTACHMENT0+at;X.length=st.length,ct=!0}}else X[0]!==i.BACK&&(X[0]=i.BACK,ct=!0);ct&&i.drawBuffers(X)}function jt(C){return v!==C?(i.useProgram(C),v=C,!0):!1}let Yt={[Ai]:i.FUNC_ADD,[Hc]:i.FUNC_SUBTRACT,[Wc]:i.FUNC_REVERSE_SUBTRACT};Yt[Xc]=i.MIN,Yt[qc]=i.MAX;let Xt={[Yc]:i.ZERO,[Zc]:i.ONE,[Jc]:i.SRC_COLOR,[tl]:i.SRC_ALPHA,[eh]:i.SRC_ALPHA_SATURATE,[Qc]:i.DST_COLOR,[$c]:i.DST_ALPHA,[Kc]:i.ONE_MINUS_SRC_COLOR,[el]:i.ONE_MINUS_SRC_ALPHA,[th]:i.ONE_MINUS_DST_COLOR,[jc]:i.ONE_MINUS_DST_ALPHA,[nh]:i.CONSTANT_COLOR,[ih]:i.ONE_MINUS_CONSTANT_COLOR,[sh]:i.CONSTANT_ALPHA,[rh]:i.ONE_MINUS_CONSTANT_ALPHA};function xe(C,$,X,ct,st,at,Et,Ht,it,Ct){if(C===Ti){m===!0&&(Ft(i.BLEND),m=!1);return}if(m===!1&&(pt(i.BLEND),m=!0),C!==kc){if(C!==d||Ct!==L){if((M!==Ai||A!==Ai)&&(i.blendEquation(i.FUNC_ADD),M=Ai,A=Ai),Ct)switch(C){case hs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Ei:i.blendFunc(i.ONE,i.ONE);break;case ja:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Qa:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Ot("WebGLState: Invalid blending: ",C);break}else switch(C){case hs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Ei:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case ja:Ot("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Qa:Ot("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ot("WebGLState: Invalid blending: ",C);break}T=null,S=null,E=null,_=null,b.set(0,0,0),O=0,d=C,L=Ct}return}st=st||$,at=at||X,Et=Et||ct,($!==M||st!==A)&&(i.blendEquationSeparate(Yt[$],Yt[st]),M=$,A=st),(X!==T||ct!==S||at!==E||Et!==_)&&(i.blendFuncSeparate(Xt[X],Xt[ct],Xt[at],Xt[Et]),T=X,S=ct,E=at,_=Et),(Ht.equals(b)===!1||it!==O)&&(i.blendColor(Ht.r,Ht.g,Ht.b,it),b.copy(Ht),O=it),d=C,L=!1}function pe(C,$){C.side===on?Ft(i.CULL_FACE):pt(i.CULL_FACE);let X=C.side===Le;$&&(X=!X),Ce(X),C.blending===hs&&C.transparent===!1?xe(Ti):xe(C.blending,C.blendEquation,C.blendSrc,C.blendDst,C.blendEquationAlpha,C.blendSrcAlpha,C.blendDstAlpha,C.blendColor,C.blendAlpha,C.premultipliedAlpha),o.setFunc(C.depthFunc),o.setTest(C.depthTest),o.setMask(C.depthWrite),r.setMask(C.colorWrite);let ct=C.stencilWrite;a.setTest(ct),ct&&(a.setMask(C.stencilWriteMask),a.setFunc(C.stencilFunc,C.stencilRef,C.stencilFuncMask),a.setOp(C.stencilFail,C.stencilZFail,C.stencilZPass)),rt(C.polygonOffset,C.polygonOffsetFactor,C.polygonOffsetUnits),C.alphaToCoverage===!0?pt(i.SAMPLE_ALPHA_TO_COVERAGE):Ft(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ce(C){D!==C&&(C?i.frontFace(i.CW):i.frontFace(i.CCW),D=C)}function ce(C){C!==zc?(pt(i.CULL_FACE),C!==k&&(C===$a?i.cullFace(i.BACK):C===Gc?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ft(i.CULL_FACE),k=C}function nn(C){C!==q&&(G&&i.lineWidth(C),q=C)}function rt(C,$,X){C?(pt(i.POLYGON_OFFSET_FILL),(R!==$||V!==X)&&(R=$,V=X,o.getReversed()&&($=-$,X=-X),i.polygonOffset($,X))):Ft(i.POLYGON_OFFSET_FILL)}function xt(C){C?pt(i.SCISSOR_TEST):Ft(i.SCISSOR_TEST)}function zt(C){C===void 0&&(C=i.TEXTURE0+Y-1),Q!==C&&(i.activeTexture(C),Q=C)}function ee(C,$,X){X===void 0&&(Q===null?X=i.TEXTURE0+Y-1:X=Q);let ct=tt[X];ct===void 0&&(ct={type:void 0,texture:void 0},tt[X]=ct),(ct.type!==C||ct.texture!==$)&&(Q!==X&&(i.activeTexture(X),Q=X),i.bindTexture(C,$||At[C]),ct.type=C,ct.texture=$)}function I(){let C=tt[Q];C!==void 0&&C.type!==void 0&&(i.bindTexture(C.type,null),C.type=void 0,C.texture=void 0)}function Ne(){try{i.compressedTexImage2D(...arguments)}catch(C){Ot("WebGLState:",C)}}function ae(){try{i.compressedTexImage3D(...arguments)}catch(C){Ot("WebGLState:",C)}}function ue(){try{i.texSubImage2D(...arguments)}catch(C){Ot("WebGLState:",C)}}function mt(){try{i.texSubImage3D(...arguments)}catch(C){Ot("WebGLState:",C)}}function ye(){try{i.compressedTexSubImage2D(...arguments)}catch(C){Ot("WebGLState:",C)}}function Lt(){try{i.compressedTexSubImage3D(...arguments)}catch(C){Ot("WebGLState:",C)}}function Gt(){try{i.texStorage2D(...arguments)}catch(C){Ot("WebGLState:",C)}}function w(){try{i.texStorage3D(...arguments)}catch(C){Ot("WebGLState:",C)}}function x(){try{i.texImage2D(...arguments)}catch(C){Ot("WebGLState:",C)}}function B(){try{i.texImage3D(...arguments)}catch(C){Ot("WebGLState:",C)}}function nt(C){return p[C]!==void 0?p[C]:i.getParameter(C)}function j(C,$){p[C]!==$&&(i.pixelStorei(C,$),p[C]=$)}function ot(C){J.equals(C)===!1&&(i.scissor(C.x,C.y,C.z,C.w),J.copy(C))}function ut(C){ft.equals(C)===!1&&(i.viewport(C.x,C.y,C.z,C.w),ft.copy(C))}function Z(C,$){let X=c.get($);X===void 0&&(X=new WeakMap,c.set($,X));let ct=X.get(C);ct===void 0&&(ct=i.getUniformBlockIndex($,C.name),i.uniformBlockBinding($,ct,ct),X.set(C,ct))}function K(C,$,X){let st=c.get($).get(C);l[st]!==X&&(i.bindBufferBase(i.UNIFORM_BUFFER,st,X),l[st]=X)}function lt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},p={},Q=null,tt={},h={},l={},f=new WeakMap,g=[],v=null,m=!1,d=null,M=null,T=null,S=null,A=null,E=null,_=null,b=new It(0,0,0),O=0,L=!1,D=null,k=null,q=null,R=null,V=null,J.set(0,0,i.canvas.width,i.canvas.height),ft.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:pt,disable:Ft,bindFramebuffer:de,drawBuffers:Pt,useProgram:jt,setBlending:xe,setMaterial:pe,setFlipSided:Ce,setCullFace:ce,setLineWidth:nn,setPolygonOffset:rt,setScissorTest:xt,activeTexture:zt,bindTexture:ee,unbindTexture:I,compressedTexImage2D:Ne,compressedTexImage3D:ae,texImage2D:x,texImage3D:B,pixelStorei:j,getParameter:nt,updateUBOMapping:Z,uniformBlockBinding:K,texStorage2D:Gt,texStorage3D:w,texSubImage2D:ue,texSubImage3D:mt,compressedTexSubImage2D:ye,compressedTexSubImage3D:Lt,scissor:ot,viewport:ut,reset:lt}}function d0(i,t,e,n,s,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Nt,u=new WeakMap,p=new Set,h,f=new WeakMap,g=new Set,v=new FinalizationRegistry(w=>g.delete(w)),m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function d(w,x){return m?new OffscreenCanvas(w,x):Ds("canvas")}function M(w,x,B){let nt=1,j=Gt(w);if((j.width>B||j.height>B)&&(nt=B/Math.max(j.width,j.height)),nt<1)if(typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&w instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&w instanceof ImageBitmap||typeof VideoFrame<"u"&&w instanceof VideoFrame){let ot=Math.floor(nt*j.width),ut=Math.floor(nt*j.height);h===void 0&&(h=d(ot,ut));let Z=x?d(ot,ut):h;return Z.width=ot,Z.height=ut,Z.getContext("2d").drawImage(w,0,0,ot,ut),Dt("WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+ot+"x"+ut+")."),Z}else return"data"in w&&Dt("WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),w;return w}function T(w){return w.generateMipmaps}function S(w){i.generateMipmap(w)}function A(w){return w.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:w.isWebGL3DRenderTarget?i.TEXTURE_3D:w.isWebGLArrayRenderTarget||w.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function E(w,x,B,nt,j,ot=!1){if(w!==null){if(i[w]!==void 0)return i[w];Dt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let ut;nt&&(ut=t.get("EXT_texture_norm16"),ut||Dt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Z=x;if(x===i.RED&&(B===i.FLOAT&&(Z=i.R32F),B===i.HALF_FLOAT&&(Z=i.R16F),B===i.UNSIGNED_BYTE&&(Z=i.R8),B===i.UNSIGNED_SHORT&&ut&&(Z=ut.R16_EXT),B===i.SHORT&&ut&&(Z=ut.R16_SNORM_EXT)),x===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&(Z=i.R8UI),B===i.UNSIGNED_SHORT&&(Z=i.R16UI),B===i.UNSIGNED_INT&&(Z=i.R32UI),B===i.BYTE&&(Z=i.R8I),B===i.SHORT&&(Z=i.R16I),B===i.INT&&(Z=i.R32I)),x===i.RG&&(B===i.FLOAT&&(Z=i.RG32F),B===i.HALF_FLOAT&&(Z=i.RG16F),B===i.UNSIGNED_BYTE&&(Z=i.RG8),B===i.UNSIGNED_SHORT&&ut&&(Z=ut.RG16_EXT),B===i.SHORT&&ut&&(Z=ut.RG16_SNORM_EXT)),x===i.RG_INTEGER&&(B===i.UNSIGNED_BYTE&&(Z=i.RG8UI),B===i.UNSIGNED_SHORT&&(Z=i.RG16UI),B===i.UNSIGNED_INT&&(Z=i.RG32UI),B===i.BYTE&&(Z=i.RG8I),B===i.SHORT&&(Z=i.RG16I),B===i.INT&&(Z=i.RG32I)),x===i.RGB_INTEGER&&(B===i.UNSIGNED_BYTE&&(Z=i.RGB8UI),B===i.UNSIGNED_SHORT&&(Z=i.RGB16UI),B===i.UNSIGNED_INT&&(Z=i.RGB32UI),B===i.BYTE&&(Z=i.RGB8I),B===i.SHORT&&(Z=i.RGB16I),B===i.INT&&(Z=i.RGB32I)),x===i.RGBA_INTEGER&&(B===i.UNSIGNED_BYTE&&(Z=i.RGBA8UI),B===i.UNSIGNED_SHORT&&(Z=i.RGBA16UI),B===i.UNSIGNED_INT&&(Z=i.RGBA32UI),B===i.BYTE&&(Z=i.RGBA8I),B===i.SHORT&&(Z=i.RGBA16I),B===i.INT&&(Z=i.RGBA32I)),x===i.RGB&&(B===i.UNSIGNED_SHORT&&ut&&(Z=ut.RGB16_EXT),B===i.SHORT&&ut&&(Z=ut.RGB16_SNORM_EXT),B===i.UNSIGNED_INT_5_9_9_9_REV&&(Z=i.RGB9_E5),B===i.UNSIGNED_INT_10F_11F_11F_REV&&(Z=i.R11F_G11F_B10F)),x===i.RGBA){let K=ot?Ls:Kt.getTransfer(j);B===i.FLOAT&&(Z=i.RGBA32F),B===i.HALF_FLOAT&&(Z=i.RGBA16F),B===i.UNSIGNED_BYTE&&(Z=K===ne?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT&&ut&&(Z=ut.RGBA16_EXT),B===i.SHORT&&ut&&(Z=ut.RGBA16_SNORM_EXT),B===i.UNSIGNED_SHORT_4_4_4_4&&(Z=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&(Z=i.RGB5_A1)}return(Z===i.R16F||Z===i.R32F||Z===i.RG16F||Z===i.RG32F||Z===i.RGBA16F||Z===i.RGBA32F)&&t.get("EXT_color_buffer_float"),Z}function _(w,x){let B;return w?x===null||x===gn||x===Ci?B=i.DEPTH24_STENCIL8:x===ln?B=i.DEPTH32F_STENCIL8:x===ds&&(B=i.DEPTH24_STENCIL8,Dt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===gn||x===Ci?B=i.DEPTH_COMPONENT24:x===ln?B=i.DEPTH_COMPONENT32F:x===ds&&(B=i.DEPTH_COMPONENT16),B}function b(w,x){return T(w)===!0||w.isFramebufferTexture&&w.minFilter!==Ee&&w.minFilter!==Ae?Math.log2(Math.max(x.width,x.height))+1:w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?x.mipmaps.length:1}function O(w){let x=new WeakRef(w);n.get(w).__ref=x,g.add(x),v.register(w,x,x)}function L(w){let x=n.get(w).__ref;x!==void 0&&(g.delete(x),v.unregister(x))}function D(w){q(w.target)}function k(w){R(w.target)}function q(w){w.removeEventListener("dispose",D),L(w),Y(w),w.isVideoTexture&&u.delete(w),w.isHTMLTexture&&p.delete(w)}function R(w){w.removeEventListener("dispose",k),L(w),et(w)}function V(){for(let w of g){let x=w.deref();x!==void 0&&(x.isRenderTarget===!0?R(x):q(x))}g.clear(),p.clear()}function Y(w){let x=n.get(w);if(x.__webglInit===void 0)return;let B=w.source,nt=f.get(B);if(nt){let j=nt[x.__cacheKey];j.usedTimes--,j.usedTimes===0&&G(w),Object.keys(nt).length===0&&f.delete(B)}n.remove(w)}function G(w){let x=n.get(w);i.deleteTexture(x.__webglTexture);let B=w.source,nt=f.get(B);delete nt[x.__cacheKey],o.memory.textures--}function et(w){let x=n.get(w);x.__depthDisposeCallback&&x.__depthDisposeCallback();let B=w.depthTexture;if(B&&B.renderTarget===w&&q(B),w.isWebGLCubeRenderTarget)for(let j=0;j<6;j++){if(Array.isArray(x.__webglFramebuffer[j]))for(let ot=0;ot<x.__webglFramebuffer[j].length;ot++)i.deleteFramebuffer(x.__webglFramebuffer[j][ot]);else i.deleteFramebuffer(x.__webglFramebuffer[j]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[j])}else{if(Array.isArray(x.__webglFramebuffer))for(let j=0;j<x.__webglFramebuffer.length;j++)i.deleteFramebuffer(x.__webglFramebuffer[j]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let j=0;j<x.__webglColorRenderbuffer.length;j++)x.__webglColorRenderbuffer[j]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[j]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}let nt=w.textures;for(let j=0,ot=nt.length;j<ot;j++){let ut=n.get(nt[j]);ut.__webglTexture&&(i.deleteTexture(ut.__webglTexture),o.memory.textures--),n.remove(nt[j])}n.remove(w)}let W=0;function Q(){W=0}function tt(){return W}function vt(w){W=w}function Rt(){let w=W;return w>=s.maxTextures&&Dt("WebGLTextures: Trying to use "+(w+1)+" texture units while this GPU supports only "+s.maxTextures),W+=1,w}function J(w){let x=[];return x.push(w.wrapS),x.push(w.wrapT),x.push(w.wrapR||0),x.push(w.magFilter),x.push(w.minFilter),x.push(w.anisotropy),x.push(w.internalFormat),x.push(w.format),x.push(w.type),x.push(w.generateMipmaps),x.push(w.mipmapsAutoUpdate),x.push(w.premultiplyAlpha),x.push(w.flipY),x.push(w.unpackAlignment),x.push(w.colorSpace),x.join()}function ft(w,x){let B=n.get(w);if(w.isVideoTexture&&ye(w),w.isRenderTargetTexture===!1&&w.isExternalTexture!==!0&&w.version>0&&B.__version!==w.version){let nt=w.image;if(nt===null)Dt("WebGLRenderer: Texture marked for update but no image data found.");else if(nt.complete===!1)Dt("WebGLRenderer: Texture marked for update but image is incomplete");else{pe(B,w,x);return}}else w.isExternalTexture&&(B.__webglTexture=w.sourceTexture?w.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+x)}function Mt(w,x){let B=n.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&B.__version!==w.version){pe(B,w,x);return}else w.isExternalTexture&&(B.__webglTexture=w.sourceTexture?w.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+x)}function At(w,x){let B=n.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&B.__version!==w.version){pe(B,w,x);return}e.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+x)}function pt(w,x){let B=n.get(w);if(w.version>0&&B.__version!==w.version){Ce(B,w,x);return}e.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+x)}let Ft={[Yr]:i.REPEAT,[Sn]:i.CLAMP_TO_EDGE,[Zr]:i.MIRRORED_REPEAT},de={[Ee]:i.NEAREST,[lh]:i.NEAREST_MIPMAP_NEAREST,[tr]:i.NEAREST_MIPMAP_LINEAR,[Ae]:i.LINEAR,[xo]:i.LINEAR_MIPMAP_NEAREST,[Gn]:i.LINEAR_MIPMAP_LINEAR},Pt={[dh]:i.NEVER,[xl]:i.ALWAYS,[fh]:i.LESS,[gl]:i.LEQUAL,[ph]:i.EQUAL,[_l]:i.GEQUAL,[mh]:i.GREATER,[gh]:i.NOTEQUAL};function jt(w,x){if(x.type===ln&&t.has("OES_texture_float_linear")===!1&&(x.magFilter===Ae||x.magFilter===xo||x.magFilter===tr||x.magFilter===Gn||x.minFilter===Ae||x.minFilter===xo||x.minFilter===tr||x.minFilter===Gn)&&Dt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(w,i.TEXTURE_WRAP_S,Ft[x.wrapS]),i.texParameteri(w,i.TEXTURE_WRAP_T,Ft[x.wrapT]),(w===i.TEXTURE_3D||w===i.TEXTURE_2D_ARRAY)&&i.texParameteri(w,i.TEXTURE_WRAP_R,Ft[x.wrapR]),i.texParameteri(w,i.TEXTURE_MAG_FILTER,de[x.magFilter]),i.texParameteri(w,i.TEXTURE_MIN_FILTER,de[x.minFilter]),x.compareFunction&&(i.texParameteri(w,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(w,i.TEXTURE_COMPARE_FUNC,Pt[x.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Ee||x.minFilter!==tr&&x.minFilter!==Gn||x.type===ln&&t.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){let B=t.get("EXT_texture_filter_anisotropic");i.texParameterf(w,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function Yt(w,x){let B=!1;w.__webglInit===void 0&&(w.__webglInit=!0,x.addEventListener("dispose",D),O(x));let nt=x.source,j=f.get(nt);j===void 0&&(j={},f.set(nt,j));let ot=J(x);if(ot!==w.__cacheKey){j[ot]===void 0&&(j[ot]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,B=!0),j[ot].usedTimes++;let ut=j[w.__cacheKey];ut!==void 0&&(j[w.__cacheKey].usedTimes--,ut.usedTimes===0&&G(x)),w.__cacheKey=ot,w.__webglTexture=j[ot].texture}return B}function Xt(w,x,B){return Math.floor(Math.floor(w/B)/x)}function xe(w,x,B,nt){let ot=w.updateRanges;if(ot.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,x.width,x.height,B,nt,x.data);else{ot.sort((C,$)=>C.start-$.start);let ut=0;for(let C=1;C<ot.length;C++){let $=ot[ut],X=ot[C],ct=$.start+$.count,st=Xt(X.start,x.width,4),at=Xt($.start,x.width,4);X.start<=ct+1&&st===at&&Xt(X.start+X.count-1,x.width,4)===st?$.count=Math.max($.count,X.start+X.count-$.start):(++ut,ot[ut]=X)}ot.length=ut+1;let Z=e.getParameter(i.UNPACK_ROW_LENGTH),K=e.getParameter(i.UNPACK_SKIP_PIXELS),lt=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,x.width);for(let C=0,$=ot.length;C<$;C++){let X=ot[C],ct=Math.floor(X.start/4),st=Math.ceil(X.count/4),at=ct%x.width,Et=Math.floor(ct/x.width),Ht=st,it=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,at),e.pixelStorei(i.UNPACK_SKIP_ROWS,Et),e.texSubImage2D(i.TEXTURE_2D,0,at,Et,Ht,it,B,nt,x.data)}w.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,Z),e.pixelStorei(i.UNPACK_SKIP_PIXELS,K),e.pixelStorei(i.UNPACK_SKIP_ROWS,lt)}}function pe(w,x,B){let nt=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(nt=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(nt=i.TEXTURE_3D);let j=Yt(w,x),ot=x.source;e.bindTexture(nt,w.__webglTexture,i.TEXTURE0+B);let ut=n.get(ot);if(ot.version!==ut.__version||j===!0){if(e.activeTexture(i.TEXTURE0+B),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){let it=Kt.getPrimaries(Kt.workingColorSpace),Ct=x.colorSpace===kn?null:Kt.getPrimaries(x.colorSpace),kt=x.colorSpace===kn||it===Ct?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,kt)}e.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment);let K=M(x.image,!1,s.maxTextureSize);K=Lt(x,K);let lt=r.convert(x.format,x.colorSpace),C=r.convert(x.type),$=E(x.internalFormat,lt,C,x.normalized,x.colorSpace,x.isVideoTexture);jt(nt,x);let X,ct=x.mipmaps,st=x.isVideoTexture!==!0,at=ut.__version===void 0||j===!0,Et=ot.dataReady,Ht=b(x,K);if(x.isDepthTexture)$=_(x.format===Vn,x.type),at&&(st?e.texStorage2D(i.TEXTURE_2D,1,$,K.width,K.height):e.texImage2D(i.TEXTURE_2D,0,$,K.width,K.height,0,lt,C,null));else if(x.isDataTexture)if(ct.length>0){st&&at&&e.texStorage2D(i.TEXTURE_2D,Ht,$,ct[0].width,ct[0].height);for(let it=0,Ct=ct.length;it<Ct;it++)X=ct[it],st?Et&&e.texSubImage2D(i.TEXTURE_2D,it,0,0,X.width,X.height,lt,C,X.data):e.texImage2D(i.TEXTURE_2D,it,$,X.width,X.height,0,lt,C,X.data);x.generateMipmaps=!1}else st?(at&&e.texStorage2D(i.TEXTURE_2D,Ht,$,K.width,K.height),Et&&xe(x,K,lt,C)):e.texImage2D(i.TEXTURE_2D,0,$,K.width,K.height,0,lt,C,K.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){st&&at&&e.texStorage3D(i.TEXTURE_2D_ARRAY,Ht,$,ct[0].width,ct[0].height,K.depth);for(let it=0,Ct=ct.length;it<Ct;it++)if(X=ct[it],x.format!==_n)if(lt!==null)if(st){if(Et)if(x.layerUpdates.size>0){let kt=Rl(X.width,X.height,x.format,x.type);for(let gt of x.layerUpdates){let ie=X.data.subarray(gt*kt/X.data.BYTES_PER_ELEMENT,(gt+1)*kt/X.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,it,0,0,gt,X.width,X.height,1,lt,ie)}}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,it,0,0,0,X.width,X.height,K.depth,lt,X.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,it,$,X.width,X.height,K.depth,0,X.data,0,0);else Dt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else st?Et&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,it,0,0,0,X.width,X.height,K.depth,lt,C,X.data):e.texImage3D(i.TEXTURE_2D_ARRAY,it,$,X.width,X.height,K.depth,0,lt,C,X.data);x.layerUpdates.size>0&&x.clearLayerUpdates()}else{st&&at&&e.texStorage2D(i.TEXTURE_2D,Ht,$,ct[0].width,ct[0].height);for(let it=0,Ct=ct.length;it<Ct;it++)X=ct[it],x.format!==_n?lt!==null?st?Et&&e.compressedTexSubImage2D(i.TEXTURE_2D,it,0,0,X.width,X.height,lt,X.data):e.compressedTexImage2D(i.TEXTURE_2D,it,$,X.width,X.height,0,X.data):Dt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):st?Et&&e.texSubImage2D(i.TEXTURE_2D,it,0,0,X.width,X.height,lt,C,X.data):e.texImage2D(i.TEXTURE_2D,it,$,X.width,X.height,0,lt,C,X.data)}else if(x.isDataArrayTexture)if(st){if(at&&e.texStorage3D(i.TEXTURE_2D_ARRAY,Ht,$,K.width,K.height,K.depth),Et)if(x.layerUpdates.size>0){let it=Rl(K.width,K.height,x.format,x.type);for(let Ct of x.layerUpdates){let kt=K.data.subarray(Ct*it/K.data.BYTES_PER_ELEMENT,(Ct+1)*it/K.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Ct,K.width,K.height,1,lt,C,kt)}x.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,K.width,K.height,K.depth,lt,C,K.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,$,K.width,K.height,K.depth,0,lt,C,K.data);else if(x.isData3DTexture)st?(at&&e.texStorage3D(i.TEXTURE_3D,Ht,$,K.width,K.height,K.depth),Et&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,K.width,K.height,K.depth,lt,C,K.data)):e.texImage3D(i.TEXTURE_3D,0,$,K.width,K.height,K.depth,0,lt,C,K.data);else if(x.isFramebufferTexture){if(at)if(st)e.texStorage2D(i.TEXTURE_2D,Ht,$,K.width,K.height);else{let it=K.width,Ct=K.height;for(let kt=0;kt<Ht;kt++)e.texImage2D(i.TEXTURE_2D,kt,$,it,Ct,0,lt,C,null),it>>=1,Ct>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in i){let it=i.canvas;if(it.hasAttribute("layoutsubtree")||it.setAttribute("layoutsubtree","true"),K.parentNode!==it){it.appendChild(K),p.add(x),it.onpaint=Ct=>{let kt=Ct.changedElements;for(let gt of p)kt.includes(gt.image)&&(gt.needsUpdate=!0)},it.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,K);else{let kt=i.RGBA,gt=i.RGBA,ie=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,kt,gt,ie,K)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(ct.length>0){if(st&&at){let it=Gt(ct[0]);e.texStorage2D(i.TEXTURE_2D,Ht,$,it.width,it.height)}for(let it=0,Ct=ct.length;it<Ct;it++)X=ct[it],st?Et&&e.texSubImage2D(i.TEXTURE_2D,it,0,0,lt,C,X):e.texImage2D(i.TEXTURE_2D,it,$,lt,C,X);x.generateMipmaps=!1}else if(st){if(at){let it=Gt(K);e.texStorage2D(i.TEXTURE_2D,Ht,$,it.width,it.height)}Et&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,lt,C,K)}else e.texImage2D(i.TEXTURE_2D,0,$,lt,C,K);T(x)&&x.mipmapsAutoUpdate===!0&&S(nt),ut.__version=ot.version,x.onUpdate&&x.onUpdate(x)}w.__version=x.version}function Ce(w,x,B){if(x.image.length!==6)return;let nt=Yt(w,x),j=x.source;e.bindTexture(i.TEXTURE_CUBE_MAP,w.__webglTexture,i.TEXTURE0+B);let ot=n.get(j);if(j.version!==ot.__version||nt===!0){e.activeTexture(i.TEXTURE0+B);let ut=Kt.getPrimaries(Kt.workingColorSpace),Z=x.colorSpace===kn?null:Kt.getPrimaries(x.colorSpace),K=x.colorSpace===kn||ut===Z?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,K);let lt=x.isCompressedTexture||x.image[0].isCompressedTexture,C=x.image[0]&&x.image[0].isDataTexture,$=[];for(let gt=0;gt<6;gt++)!lt&&!C?$[gt]=M(x.image[gt],!0,s.maxCubemapSize):$[gt]=C?x.image[gt].image:x.image[gt],$[gt]=Lt(x,$[gt]);let X=$[0],ct=r.convert(x.format,x.colorSpace),st=r.convert(x.type),at=E(x.internalFormat,ct,st,x.normalized,x.colorSpace),Et=x.isVideoTexture!==!0,Ht=ot.__version===void 0||nt===!0,it=j.dataReady,Ct=b(x,X);jt(i.TEXTURE_CUBE_MAP,x);let kt;if(x.isDepthTexture){if(at=_(x.format===Vn,x.type),Ht)if(Et)e.texStorage2D(i.TEXTURE_CUBE_MAP,1,at,X.width,X.height);else for(let gt=0;gt<6;gt++)e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+gt,0,at,X.width,X.height,0,ct,st,null)}else if(lt){Et&&Ht&&e.texStorage2D(i.TEXTURE_CUBE_MAP,Ct,at,X.width,X.height);for(let gt=0;gt<6;gt++){kt=$[gt].mipmaps;for(let ie=0;ie<kt.length;ie++){let be=kt[ie];x.format!==_n?ct!==null?Et?it&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+gt,ie,0,0,be.width,be.height,ct,be.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+gt,ie,at,be.width,be.height,0,be.data):Dt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Et?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+gt,ie,0,0,be.width,be.height,ct,st,be.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+gt,ie,at,be.width,be.height,0,ct,st,be.data)}}}else{if(kt=x.mipmaps,Et&&Ht){kt.length>0&&Ct++;let gt=Gt($[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,Ct,at,gt.width,gt.height)}for(let gt=0;gt<6;gt++)if(C){Et?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+gt,0,0,0,$[gt].width,$[gt].height,ct,st,$[gt].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+gt,0,at,$[gt].width,$[gt].height,0,ct,st,$[gt].data);for(let ie=0;ie<kt.length;ie++){let Yn=kt[ie].image[gt].image;Et?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+gt,ie+1,0,0,Yn.width,Yn.height,ct,st,Yn.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+gt,ie+1,at,Yn.width,Yn.height,0,ct,st,Yn.data)}}else{Et?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+gt,0,0,0,ct,st,$[gt]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+gt,0,at,ct,st,$[gt]);for(let ie=0;ie<kt.length;ie++){let be=kt[ie];Et?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+gt,ie+1,0,0,ct,st,be.image[gt]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+gt,ie+1,at,ct,st,be.image[gt])}}}T(x)&&x.mipmapsAutoUpdate===!0&&S(i.TEXTURE_CUBE_MAP),ot.__version=j.version,x.onUpdate&&x.onUpdate(x)}w.__version=x.version}function ce(w,x,B,nt,j,ot){let ut=r.convert(B.format,B.colorSpace),Z=r.convert(B.type),K=E(B.internalFormat,ut,Z,B.normalized,B.colorSpace),lt=n.get(x),C=n.get(B);if(C.__renderTarget=x,!lt.__hasExternalTextures){let $=Math.max(1,x.width>>ot),X=Math.max(1,x.height>>ot);j===i.TEXTURE_3D||j===i.TEXTURE_2D_ARRAY?e.texImage3D(j,ot,K,$,X,x.depth,0,ut,Z,null):e.texImage2D(j,ot,K,$,X,0,ut,Z,null)}e.bindFramebuffer(i.FRAMEBUFFER,w),mt(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,nt,j,C.__webglTexture,0,ue(x)):(j===i.TEXTURE_2D||j>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,nt,j,C.__webglTexture,ot),e.bindFramebuffer(i.FRAMEBUFFER,null)}function nn(w,x,B){if(i.bindRenderbuffer(i.RENDERBUFFER,w),x.depthBuffer){let nt=x.depthTexture,j=nt&&nt.isDepthTexture?nt.type:null,ot=_(x.stencilBuffer,j),ut=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;mt(x)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ue(x),ot,x.width,x.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,ue(x),ot,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,ot,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ut,i.RENDERBUFFER,w)}else{let nt=x.textures;for(let j=0;j<nt.length;j++){let ot=nt[j],ut=r.convert(ot.format,ot.colorSpace),Z=r.convert(ot.type),K=E(ot.internalFormat,ut,Z,ot.normalized,ot.colorSpace);mt(x)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ue(x),K,x.width,x.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,ue(x),K,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,K,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function rt(w,x,B){let nt=x.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,w),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let j=n.get(x.depthTexture);j.__renderTarget=x;let ot=nt?x.depthTexture.image[0]:x.depthTexture.image;(!j.__webglTexture||ot.width!==x.width||ot.height!==x.height)&&(ot.width=x.width,ot.height=x.height,x.depthTexture.needsUpdate=!0),nt?pt(x.depthTexture,0):ft(x.depthTexture,0);let ut=j.__webglTexture,Z=ue(x),K=nt?i.TEXTURE_CUBE_MAP_POSITIVE_X+B:i.TEXTURE_2D,lt=x.depthTexture.format===Vn?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(x.depthTexture.format===Fn)mt(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,lt,K,ut,0,Z):i.framebufferTexture2D(i.FRAMEBUFFER,lt,K,ut,0);else if(x.depthTexture.format===Vn)mt(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,lt,K,ut,0,Z):i.framebufferTexture2D(i.FRAMEBUFFER,lt,K,ut,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function xt(w){let x=n.get(w),B=w.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==w.depthTexture){let nt=w.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),nt){let j=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,nt.removeEventListener("dispose",j)};nt.addEventListener("dispose",j),x.__depthDisposeCallback=j}x.__boundDepthTexture=nt}if(w.depthTexture&&!x.__autoAllocateDepthBuffer)if(B)for(let nt=0;nt<6;nt++)rt(x.__webglFramebuffer[nt],w,nt);else w.texture.mipmaps.length>0?rt(x.__webglFramebuffer[0],w,0):rt(x.__webglFramebuffer,w,0);else if(B){x.__webglDepthbuffer=[];for(let nt=0;nt<6;nt++)if(e.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[nt]),x.__webglDepthbuffer[nt]===void 0)x.__webglDepthbuffer[nt]=i.createRenderbuffer(),nn(x.__webglDepthbuffer[nt],w,!1);else{let j=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ot=x.__webglDepthbuffer[nt];i.bindRenderbuffer(i.RENDERBUFFER,ot),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,ot)}}else if(w.texture.mipmaps.length>0?e.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),nn(x.__webglDepthbuffer,w,!1);else{let j=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ot=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ot),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,ot)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function zt(w,x,B){let nt=n.get(w);x!==void 0&&ce(nt.__webglFramebuffer,w,w.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&xt(w)}function ee(w){let x=w.texture,B=n.get(w),nt=n.get(x);w.addEventListener("dispose",k),O(w);let j=w.textures,ot=w.isWebGLCubeRenderTarget===!0,ut=j.length>1;if(ut||(nt.__webglTexture===void 0&&(nt.__webglTexture=i.createTexture()),nt.__version=x.version,o.memory.textures++),ot){B.__webglFramebuffer=[];for(let Z=0;Z<6;Z++)if(x.mipmaps.length>0){B.__webglFramebuffer[Z]=[];for(let K=0;K<x.mipmaps.length;K++)B.__webglFramebuffer[Z][K]=i.createFramebuffer()}else B.__webglFramebuffer[Z]=i.createFramebuffer()}else{if(x.mipmaps.length>0){B.__webglFramebuffer=[];for(let Z=0;Z<x.mipmaps.length;Z++)B.__webglFramebuffer[Z]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(ut)for(let Z=0,K=j.length;Z<K;Z++){let lt=n.get(j[Z]);lt.__webglTexture===void 0&&(lt.__webglTexture=i.createTexture(),o.memory.textures++)}if(w.samples>0&&mt(w)===!1){B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let Z=0;Z<j.length;Z++){let K=j[Z];B.__webglColorRenderbuffer[Z]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[Z]);let lt=r.convert(K.format,K.colorSpace),C=r.convert(K.type),$=E(K.internalFormat,lt,C,K.normalized,K.colorSpace,w.isXRRenderTarget===!0),X=ue(w);i.renderbufferStorageMultisample(i.RENDERBUFFER,X,$,w.width,w.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Z,i.RENDERBUFFER,B.__webglColorRenderbuffer[Z])}i.bindRenderbuffer(i.RENDERBUFFER,null),w.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),nn(B.__webglDepthRenderbuffer,w,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ot){e.bindTexture(i.TEXTURE_CUBE_MAP,nt.__webglTexture),jt(i.TEXTURE_CUBE_MAP,x);for(let Z=0;Z<6;Z++)if(x.mipmaps.length>0)for(let K=0;K<x.mipmaps.length;K++)ce(B.__webglFramebuffer[Z][K],w,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,K);else ce(B.__webglFramebuffer[Z],w,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0);T(x)?S(i.TEXTURE_CUBE_MAP):x.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,x.mipmaps.length-1),e.unbindTexture()}else if(ut){for(let Z=0,K=j.length;Z<K;Z++){let lt=j[Z],C=n.get(lt),$=i.TEXTURE_2D;(w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&($=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture($,C.__webglTexture),jt($,lt),ce(B.__webglFramebuffer,w,lt,i.COLOR_ATTACHMENT0+Z,$,0),T(lt)&&S($)}e.unbindTexture()}else{let Z=i.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(Z=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(Z,nt.__webglTexture),jt(Z,x),x.mipmaps.length>0)for(let K=0;K<x.mipmaps.length;K++)ce(B.__webglFramebuffer[K],w,x,i.COLOR_ATTACHMENT0,Z,K);else ce(B.__webglFramebuffer,w,x,i.COLOR_ATTACHMENT0,Z,0);T(x)?S(Z):x.mipmaps.length>0&&i.texParameteri(Z,i.TEXTURE_MAX_LEVEL,x.mipmaps.length-1),e.unbindTexture()}w.depthBuffer&&xt(w)}function I(w){let x=w.textures;for(let B=0,nt=x.length;B<nt;B++){let j=x[B];if(T(j)&&j.mipmapsAutoUpdate===!0){let ot=A(w),ut=n.get(j).__webglTexture;e.bindTexture(ot,ut),S(ot),e.unbindTexture()}}}let Ne=[];function ae(w){if(w.samples>0){if(mt(w)===!1){let x=w.textures,B=w.width,nt=w.height,j=i.COLOR_BUFFER_BIT,ot=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ut=n.get(w),Z=x.length>1;if(Z)for(let lt=0;lt<x.length;lt++)e.bindFramebuffer(i.FRAMEBUFFER,ut.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+lt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,ut.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+lt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,ut.__webglMultisampledFramebuffer),w.texture.mipmaps.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ut.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ut.__webglFramebuffer);for(let lt=0;lt<x.length;lt++){if(w.resolveDepthBuffer&&(w.depthBuffer&&(j|=i.DEPTH_BUFFER_BIT),w.stencilBuffer&&w.resolveStencilBuffer&&(j|=i.STENCIL_BUFFER_BIT)),Z){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ut.__webglColorRenderbuffer[lt]);let C=n.get(x[lt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,C,0)}i.blitFramebuffer(0,0,B,nt,0,0,B,nt,j,i.NEAREST),l===!0&&(Ne.length=0,Ne.push(i.COLOR_ATTACHMENT0+lt),w.depthBuffer&&w.storeMultisampledDepthBuffer===!1&&Ne.push(ot),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Ne))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Z)for(let lt=0;lt<x.length;lt++){e.bindFramebuffer(i.FRAMEBUFFER,ut.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+lt,i.RENDERBUFFER,ut.__webglColorRenderbuffer[lt]);let C=n.get(x[lt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,ut.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+lt,i.TEXTURE_2D,C,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ut.__webglMultisampledFramebuffer)}else if(w.depthBuffer&&w.storeMultisampledDepthBuffer===!1&&l){let x=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function ue(w){return Math.min(s.maxSamples,w.samples)}function mt(w){let x=n.get(w);return w.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function ye(w){let x=o.render.frame;u.get(w)!==x&&(u.set(w,x),w.update())}function Lt(w,x){let B=w.colorSpace,nt=w.format,j=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||B!==Is&&B!==kn&&(Kt.getTransfer(B)===ne?(nt!==_n||j!==Ge)&&Dt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ot("WebGLTextures: Unsupported texture color space:",B)),x}function Gt(w){return typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement?(c.width=w.naturalWidth||w.width,c.height=w.naturalHeight||w.height):typeof VideoFrame<"u"&&w instanceof VideoFrame?(c.width=w.displayWidth,c.height=w.displayHeight):(c.width=w.width,c.height=w.height),c}this.allocateTextureUnit=Rt,this.resetTextureUnits=Q,this.getTextureUnits=tt,this.setTextureUnits=vt,this.setTexture2D=ft,this.setTexture2DArray=Mt,this.setTexture3D=At,this.setTextureCube=pt,this.rebindTextures=zt,this.setupRenderTarget=ee,this.updateRenderTargetMipmap=I,this.updateMultisampleRenderTarget=ae,this.setupDepthRenderbuffer=xt,this.setupFrameBufferTexture=ce,this.useMultisampledRTT=mt,this.dispose=V}function f0(i,t){function e(n,s=kn){let r,o=Kt.getTransfer(s);if(n===Ge)return i.UNSIGNED_BYTE;if(n===vo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Mo)return i.UNSIGNED_SHORT_5_5_5_1;if(n===dl)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===fl)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===hl)return i.BYTE;if(n===ul)return i.SHORT;if(n===ds)return i.UNSIGNED_SHORT;if(n===yo)return i.INT;if(n===gn)return i.UNSIGNED_INT;if(n===ln)return i.FLOAT;if(n===en)return i.HALF_FLOAT;if(n===pl)return i.ALPHA;if(n===ml)return i.RGB;if(n===_n)return i.RGBA;if(n===Fn)return i.DEPTH_COMPONENT;if(n===Vn)return i.DEPTH_STENCIL;if(n===So)return i.RED;if(n===bo)return i.RED_INTEGER;if(n===ui)return i.RG;if(n===wo)return i.RG_INTEGER;if(n===To)return i.RGBA_INTEGER;if(n===er||n===nr||n===ir||n===sr)if(o===ne)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===er)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===nr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===ir)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===sr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===er)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===nr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===ir)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===sr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Eo||n===Ao||n===Ro||n===Co)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Eo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ao)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ro)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Co)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Po||n===Io||n===Lo||n===Do||n===No||n===rr||n===Uo)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Po||n===Io)return o===ne?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Lo)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Do)return r.COMPRESSED_R11_EAC;if(n===No)return r.COMPRESSED_SIGNED_R11_EAC;if(n===rr)return r.COMPRESSED_RG11_EAC;if(n===Uo)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Fo||n===Oo||n===Bo||n===zo||n===Go||n===Vo||n===ko||n===Ho||n===Wo||n===Xo||n===qo||n===Yo||n===Zo||n===Jo)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Fo)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Oo)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Bo)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===zo)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Go)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Vo)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===ko)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ho)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Wo)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Xo)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===qo)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Yo)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Zo)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Jo)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ko||n===$o||n===jo)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Ko)return o===ne?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===$o)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===jo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Qo||n===ta||n===or||n===ea)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Qo)return r.COMPRESSED_RED_RGTC1_EXT;if(n===ta)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===or)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===ea)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ci?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var p0=`
void main() {

  gl_Position = vec4( position, 1.0 );

}`,m0=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

  vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

  if ( coord.x >= 1.0 ) {

    gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

  } else {

    gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

  }

}`,Ol=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new Ws(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new ze({vertexShader:p0,fragmentShader:m0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Re(new wn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Bl=class extends mn{constructor(t,e){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,p=null,h=null,f=null,g=null,v=typeof XRWebGLBinding<"u",m=new Ol,d={},M=e.getContextAttributes(),T=null,S=null,A=[],E=[],_=new Nt,b=null,O=null,L=new Ie;L.viewport=new oe;let D=new Ie;D.viewport=new oe;let k=[L,D],q=new po,R=null,V=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let ft=A[J];return ft===void 0&&(ft=new ns,A[J]=ft),ft.getTargetRaySpace()},this.getControllerGrip=function(J){let ft=A[J];return ft===void 0&&(ft=new ns,A[J]=ft),ft.getGripSpace()},this.getHand=function(J){let ft=A[J];return ft===void 0&&(ft=new ns,A[J]=ft),ft.getHandSpace()};function Y(J){let ft=E.indexOf(J.inputSource);if(ft===-1)return;let Mt=A[ft];Mt!==void 0&&(Mt.update(J.inputSource,J.frame,c||o),Mt.dispatchEvent({type:J.type,data:J.inputSource}))}function G(){s.removeEventListener("select",Y),s.removeEventListener("selectstart",Y),s.removeEventListener("selectend",Y),s.removeEventListener("squeeze",Y),s.removeEventListener("squeezestart",Y),s.removeEventListener("squeezeend",Y),s.removeEventListener("end",G),s.removeEventListener("inputsourceschange",et);for(let J=0;J<A.length;J++){let ft=E[J];ft!==null&&(E[J]=null,A[J].disconnect(ft))}R=null,V=null,m.reset();for(let J in d)delete d[J];if(t.setRenderTarget(T),f=null,h=null,p=null,s=null,S=null,Rt.stop(),n.isPresenting=!1,t.setPixelRatio(b),t.setSize(_.width,_.height,!1),O!==null){let J=O.camera;J.fov=O.fov,J.zoom=O.zoom,J.updateProjectionMatrix(),O=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){r=J,n.isPresenting===!0&&Dt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){a=J,n.isPresenting===!0&&Dt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(J){c=J},this.getBaseLayer=function(){return h!==null?h:f},this.getBinding=function(){return p===null&&v&&(p=new XRWebGLBinding(s,e)),p},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(J){if(s=J,s!==null){if(T=t.getRenderTarget(),s.addEventListener("select",Y),s.addEventListener("selectstart",Y),s.addEventListener("selectend",Y),s.addEventListener("squeeze",Y),s.addEventListener("squeezestart",Y),s.addEventListener("squeezeend",Y),s.addEventListener("end",G),s.addEventListener("inputsourceschange",et),M.xrCompatible!==!0&&await e.makeXRCompatible(),b=t.getPixelRatio(),t.getSize(_),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let Mt=null,At=null,pt=null;M.depth&&(pt=M.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,Mt=M.stencil?Vn:Fn,At=M.stencil?Ci:gn);let Ft={colorFormat:e.RGBA8,depthFormat:pt,scaleFactor:r};p=this.getBinding(),h=p.createProjectionLayer(Ft),s.updateRenderState({layers:[h]}),t.setPixelRatio(1),t.setSize(h.textureWidth,h.textureHeight,!1),S=new Xe(h.textureWidth,h.textureHeight,{format:_n,type:Ge,depthTexture:new zn(h.textureWidth,h.textureHeight,At,void 0,void 0,void 0,void 0,void 0,void 0,Mt),stencilBuffer:M.stencil,colorSpace:t.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let Mt={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,e,Mt),s.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),S=new Xe(f.framebufferWidth,f.framebufferHeight,{format:_n,type:Ge,colorSpace:t.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Rt.setContext(s),Rt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function et(J){for(let ft=0;ft<J.removed.length;ft++){let Mt=J.removed[ft],At=E.indexOf(Mt);At>=0&&(E[At]=null,A[At].disconnect(Mt))}for(let ft=0;ft<J.added.length;ft++){let Mt=J.added[ft],At=E.indexOf(Mt);if(At===-1){for(let Ft=0;Ft<A.length;Ft++)if(Ft>=E.length){E.push(Mt),At=Ft;break}else if(E[Ft]===null){E[Ft]=Mt,At=Ft;break}if(At===-1)break}let pt=A[At];pt&&pt.connect(Mt)}}function W(J,ft){ft===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(ft.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(s===null)return;let ft=J.near,Mt=J.far;m.texture!==null&&(m.depthNear>0&&(ft=m.depthNear),m.depthFar>0&&(Mt=m.depthFar)),q.near=D.near=L.near=ft,q.far=D.far=L.far=Mt,(R!==q.near||V!==q.far)&&(s.updateRenderState({depthNear:q.near,depthFar:q.far}),R=q.near,V=q.far),q.layers.mask=J.layers.mask|6,L.layers.mask=q.layers.mask&-5,D.layers.mask=q.layers.mask&-3;let At=J.parent,pt=q.cameras;W(q,At);for(let Ft=0;Ft<pt.length;Ft++)W(pt[Ft],At);q.projectionMatrix.copy(L.projectionMatrix),q.projectionMatrixInverse.copy(L.projectionMatrixInverse),O===null&&J.isPerspectiveCamera&&(O={camera:J,fov:J.fov,zoom:J.zoom}),Q(J,q,At)};function Q(J,ft,Mt){Mt===null?J.matrix.copy(ft.matrixWorld):(J.matrix.copy(Mt.matrixWorld),J.matrix.invert(),J.matrix.multiply(ft.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(ft.projectionMatrix),J.projectionMatrixInverse.copy(ft.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=Si*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return q},this.getFoveation=function(){if(!(h===null&&f===null))return l},this.setFoveation=function(J){l=J,h!==null&&(h.fixedFoveation=J),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=J)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(q)},this.getCameraTexture=function(J){return d[J]};let tt=null;function vt(J,ft){if(u=ft.getViewerPose(c||o),g=ft,u!==null){let Mt=u.views;f!==null&&(t.setRenderTargetFramebuffer(S,f.framebuffer),t.setRenderTarget(S));let At=!1;Mt.length!==q.cameras.length&&(q.cameras.length=0,At=!0);for(let Pt=0;Pt<Mt.length;Pt++){let jt=Mt[Pt],Yt=null;if(f!==null)Yt=f.getViewport(jt);else{let xe=p.getViewSubImage(h,jt);Yt=xe.viewport,Pt===0&&(t.setRenderTargetTextures(S,xe.colorTexture,xe.depthStencilTexture),t.setRenderTarget(S))}let Xt=k[Pt];Xt===void 0&&(Xt=new Ie,Xt.layers.enable(Pt),Xt.viewport=new oe,k[Pt]=Xt),Xt.matrix.fromArray(jt.transform.matrix),Xt.matrix.decompose(Xt.position,Xt.quaternion,Xt.scale),Xt.projectionMatrix.fromArray(jt.projectionMatrix),Xt.projectionMatrixInverse.copy(Xt.projectionMatrix).invert(),Xt.viewport.set(Yt.x,Yt.y,Yt.width,Yt.height),Pt===0&&(q.matrix.copy(Xt.matrix),q.matrix.decompose(q.position,q.quaternion,q.scale)),At===!0&&q.cameras.push(Xt)}let pt=s.enabledFeatures;if(pt&&pt.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){p=n.getBinding();let Pt=p.getDepthInformation(Mt[0]);Pt&&Pt.isValid&&Pt.texture&&m.init(Pt,s.renderState)}if(pt&&pt.includes("camera-access")&&v){t.state.unbindTexture(),p=n.getBinding();for(let Pt=0;Pt<Mt.length;Pt++){let jt=Mt[Pt].camera;if(jt){let Yt=d[jt];Yt||(Yt=new Ws,d[jt]=Yt);let Xt=p.getCameraImage(jt);Yt.sourceTexture=Xt}}}}for(let Mt=0;Mt<A.length;Mt++){let At=E[Mt],pt=A[Mt];At!==null&&pt!==void 0&&pt.update(At,ft,c||o)}tt&&tt(J,ft),ft.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ft}),g=null}let Rt=new Jh;Rt.setAnimationLoop(vt),this.setAnimationLoop=function(J){tt=J},this.dispose=function(){}}},g0=new se,ru=new Bt;ru.set(-1,0,0,0,1,0,0,0,1);function _0(i,t){function e(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function n(m,d){d.color.getRGB(m.fogColor.value,Tl(i)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function s(m,d,M,T,S){d.isNodeMaterial?d.uniformsNeedUpdate=!1:d.isMeshBasicMaterial?r(m,d):d.isMeshLambertMaterial?(r(m,d),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)):d.isMeshToonMaterial?(r(m,d),p(m,d)):d.isMeshPhongMaterial?(r(m,d),u(m,d),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)):d.isMeshStandardMaterial?(r(m,d),h(m,d),d.isMeshPhysicalMaterial&&f(m,d,S)):d.isMeshMatcapMaterial?(r(m,d),g(m,d)):d.isMeshDepthMaterial?r(m,d):d.isMeshDistanceMaterial?(r(m,d),v(m,d)):d.isMeshNormalMaterial?r(m,d):d.isLineBasicMaterial?(o(m,d),d.isLineDashedMaterial&&a(m,d)):d.isPointsMaterial?l(m,d,M,T):d.isSpriteMaterial?c(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,e(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,e(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,e(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===Le&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,e(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===Le&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,e(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,e(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,e(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);let M=t.get(d),T=M.envMap,S=M.envMapRotation;T&&(m.envMap.value=T,m.envMapRotation.value.setFromMatrix4(g0.makeRotationFromEuler(S)).transpose(),T.isCubeTexture&&T.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(ru),m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,e(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,e(d.aoMap,m.aoMapTransform))}function o(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,e(d.map,m.mapTransform))}function a(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,M,T){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*M,m.scale.value=T*.5,d.map&&(m.map.value=d.map,e(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,e(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function c(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,e(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,e(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function u(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function p(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function h(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,e(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,e(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function f(m,d,M){m.ior.value=d.ior,d.diffuseRoughness>0&&(m.diffuseRoughness.value=d.diffuseRoughness,d.diffuseRoughnessMap&&(m.diffuseRoughnessMap.value=d.diffuseRoughnessMap,e(d.diffuseRoughnessMap,m.diffuseRoughnessMapTransform))),d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,e(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,e(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,e(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,e(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,e(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Le&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.retroreflectivity>0&&(m.retroreflectivity.value=d.retroreflectivity),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessMinimum,m.iridescenceThicknessMaximum.value=d.iridescenceThicknessMaximum,d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,e(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,e(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=M.texture,m.transmissionSamplerSize.value.set(M.width,M.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,e(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,e(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,e(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,e(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,e(d.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,d){d.matcap&&(m.matcap.value=d.matcap)}function v(m,d){let M=t.get(d).light;m.referencePosition.value.setFromMatrixPosition(M.matrixWorld),m.nearDistance.value=M.shadow.camera.near,m.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function x0(i,t,e,n){let s={},r={};function o(M,T){let S=T.program;n.uniformBlockBinding(M,S,s[M.id])}function a(M,T){let S=s[M.id];S===void 0&&(g(M),S=l(M),s[M.id]=S,M.addEventListener("dispose",m));let A=T.program;n.updateUBOMapping(M,A);let E=t.render.frame;r[M.id]!==E&&(c(M),r[M.id]=E)}function l(M){let T=i.createBuffer(),S=M.__size,A=M.usage;return i.bindBuffer(i.UNIFORM_BUFFER,T),i.bufferData(i.UNIFORM_BUFFER,S,A),i.bindBuffer(i.UNIFORM_BUFFER,null),T}function c(M){let T=s[M.id],S=M.uniforms,A=M.__cache;i.bindBuffer(i.UNIFORM_BUFFER,T);for(let E=0,_=S.length;E<_;E++){let b=S[E];if(Array.isArray(b))for(let O=0,L=b.length;O<L;O++)u(b[O],E,O,A);else u(b,E,0,A)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function u(M,T,S,A){if(h(M,T,S,A)===!0){let E=M.__offset,_=M.value;if(Array.isArray(_)){let b=0;for(let O=0;O<_.length;O++){let L=_[O],D=v(L,!0);p(L,M.__data,b),b+=D.storage/Float32Array.BYTES_PER_ELEMENT}}else p(_,M.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,E,M.__data)}}function p(M,T,S){typeof M=="number"||typeof M=="boolean"?T[S]=M:M.isMatrix3?(T[S]=M.elements[0],T[S+1]=M.elements[1],T[S+2]=M.elements[2],T[S+3]=0,T[S+4]=M.elements[3],T[S+5]=M.elements[4],T[S+6]=M.elements[5],T[S+7]=0,T[S+8]=M.elements[6],T[S+9]=M.elements[7],T[S+10]=M.elements[8],T[S+11]=0):ArrayBuffer.isView(M)?T.set(M.subarray(0,T.length-S),S):M.toArray(T,S)}function h(M,T,S,A){let E=M.value,_=T+"_"+S;if(Array.isArray(E)){A[_]===void 0&&(A[_]=[]);let b=A[_],O=!1;for(let L=0;L<E.length;L++)f(E[L],b,L)===!0&&(O=!0);return O}return f(E,A,_)}function f(M,T,S){if(T[S]===void 0)return typeof M=="number"||typeof M=="boolean"?T[S]=M:ArrayBuffer.isView(M)?T[S]=M.slice():T[S]=M.clone(),!0;{let A=T[S];if(typeof M=="number"||typeof M=="boolean"){if(A!==M)return T[S]=M,!0}else{if(ArrayBuffer.isView(M))return!0;if(A.equals(M)===!1)return A.copy(M),!0}}return!1}function g(M){let T=M.uniforms,S=0,A=16;for(let _=0,b=T.length;_<b;_++){let O=Array.isArray(T[_])?T[_]:[T[_]];for(let L=0,D=O.length;L<D;L++){let k=O[L],q=Array.isArray(k.value)?k.value:[k.value],R=Array.isArray(T[_])||Array.isArray(k.value),V=S;for(let G=0,et=q.length;G<et;G++){let W=q[G],Q=v(W,R),tt=S%A,vt=tt%Q.boundary,Rt=tt+vt;S+=vt,Rt!==0&&A-Rt<Q.storage&&(S+=A-Rt),G===0&&(V=S),S+=Q.storage}let Y=k.type==="int"?Int32Array:k.type==="uint"?Uint32Array:Float32Array;k.__data=new Y((S-V)/Float32Array.BYTES_PER_ELEMENT),k.__offset=V}}let E=S%A;return E>0&&(S+=A-E),M.__size=S,M.__cache={},this}function v(M,T){let S={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(S.boundary=4,S.storage=4):M.isVector2?(S.boundary=8,S.storage=8):M.isVector3||M.isColor?(S.boundary=16,S.storage=12):M.isVector4?(S.boundary=16,S.storage=16):M.isMatrix3?(S.boundary=16,S.storage=48):M.isMatrix4?(S.boundary=16,S.storage=64):M.isTexture?Dt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(M)?(S.boundary=16,S.storage=M.byteLength):Dt("WebGLRenderer: Unsupported uniform value type.",M),T===!0&&(S.boundary=16,S.storage=Math.ceil(S.storage/16)*16),S}function m(M){let T=M.target;T.removeEventListener("dispose",m),i.deleteBuffer(s[T.id]),delete s[T.id],delete r[T.id]}function d(){for(let M in s)i.deleteBuffer(s[M]);s={},r={}}return{bind:o,update:a,dispose:d}}var y0=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Tn=null;function v0(){return Tn===null&&(Tn=new Gs(y0,16,16,ui,en),Tn.name="DFG_LUT",Tn.minFilter=Ae,Tn.magFilter=Ae,Tn.wrapS=Sn,Tn.wrapT=Sn,Tn.generateMipmaps=!1,Tn.needsUpdate=!0),Tn}var oa=class{constructor(t={}){let{canvas:e=xh(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:h=!1,outputBufferType:f=Ge}=t;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=o;let v=f,m=new Set([To,wo,bo]),d=new Set([Ge,gn,ds,Ci,vo,Mo]),M=new Uint32Array(4),T=new Int32Array(4),S={textures:[],min:[],max:[],resolution:[]},A=null,E=null,_=[],b=[],O=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=an,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let L=this,D=!1,k=null,q=null,R=null,V=null;this._outputColorSpace=je;let Y=0,G=0,et=null,W=-1,Q=null,tt=new oe,vt=new oe,Rt=null,J=new It(0),ft=0,Mt=e.width,At=e.height,pt=1,Ft=null,de=null,Pt=new oe(0,0,Mt,At),jt=new oe(0,0,Mt,At),Yt=!1,Xt=new ii,xe=new Qr,pe=!1,Ce=!1,ce=new se,nn=new U,rt=new oe,xt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},zt=!1;function ee(){return et===null?pt:1}let I=n;function Ne(y,P){return e.getContext(y,P)}let ae,ue,mt,ye,Lt,Gt,w,x,B,nt,j,ot,ut,Z,K,lt,C,$,X,ct,st,at,Et;try{let y={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:p};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"187"}`),e.addEventListener("webglcontextlost",Ct,!1),e.addEventListener("webglcontextrestored",kt,!1),e.addEventListener("webglcontextcreationerror",gt,!1),I===null){let P="webgl2";if(I=Ne(P,y),I===null)throw Ne(P)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ht()}catch(y){throw e.removeEventListener("webglcontextlost",Ct,!1),e.removeEventListener("webglcontextrestored",kt,!1),e.removeEventListener("webglcontextcreationerror",gt,!1),Ot("WebGLRenderer: "+y.message),y}function Ht(){ae=new Im(I),ae.init(),st=new f0(I,ae),ue=new vm(I,ae,t,st),mt=new u0(I,ae),ue.reversedDepthBuffer&&h&&mt.buffers.depth.setReversed(!0),q=I.createFramebuffer(),R=I.createFramebuffer(),V=I.createFramebuffer(),ye=new Nm(I),Lt=new $g,Gt=new d0(I,ae,mt,Lt,ue,st,ye),w=new Pm(L),x=new Ud(I),at=new xm(I,x),B=new Lm(I,x,ye,at),nt=new Fm(I,B,x,at,ye),$=new Um(I,ue,Gt),K=new Mm(Lt),j=new Kg(L,w,ae,ue,at,K),ot=new _0(L,Lt),ut=new Qg,Z=new r0(ae),C=new _m(L,w,mt,nt,g,l),lt=new h0(L,nt,ue),Et=new x0(I,ye,ue,mt),X=new ym(I,ae,ye),ct=new Dm(I,ae,ye),ye.programs=j.programs,L.capabilities=ue,L.extensions=ae,L.properties=Lt,L.renderLists=ut,L.shadowMap=lt,L.state=mt,L.info=ye}v!==Ge&&(O=new Bm(v,e.width,e.height,a,s,r));let it=new Bl(L,I);this.xr=it,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){let y=ae.get("WEBGL_lose_context");y&&y.loseContext()},this.forceContextRestore=function(){let y=ae.get("WEBGL_lose_context");y&&y.restoreContext()},this.getPixelRatio=function(){return pt},this.setPixelRatio=function(y){y!==void 0&&(pt=y,this.setSize(Mt,At,!1))},this.getSize=function(y){return y.set(Mt,At)},this.setSize=function(y,P,H=!0){if(it.isPresenting){Dt("WebGLRenderer: Can't change size while VR device is presenting.");return}Mt=y,At=P,e.width=Math.floor(y*pt),e.height=Math.floor(P*pt),H===!0&&(e.style.width=y+"px",e.style.height=P+"px"),O!==null&&O.setSize(e.width,e.height),this.setViewport(0,0,y,P)},this.getDrawingBufferSize=function(y){return y.set(Mt*pt,At*pt).floor()},this.setDrawingBufferSize=function(y,P,H){Mt=y,At=P,pt=H,e.width=Math.floor(y*H),e.height=Math.floor(P*H),this.setViewport(0,0,y,P)},this.setEffects=function(y){if(v===Ge){Ot("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(y){for(let P=0;P<y.length;P++)if(y[P].isOutputPass===!0){Dt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}O.setEffects(y||[])},this.getCurrentViewport=function(y){return y.copy(tt)},this.getViewport=function(y){return y.copy(Pt)},this.setViewport=function(y,P,H,F){y.isVector4?Pt.set(y.x,y.y,y.z,y.w):Pt.set(y,P,H,F),mt.viewport(tt.copy(Pt).multiplyScalar(ee()).round())},this.getScissor=function(y){return y.copy(jt)},this.setScissor=function(y,P,H,F){y.isVector4?jt.set(y.x,y.y,y.z,y.w):jt.set(y,P,H,F),mt.scissor(vt.copy(jt).multiplyScalar(ee()).round())},this.getScissorTest=function(){return Yt},this.setScissorTest=function(y){mt.setScissorTest(Yt=y)},this.setOpaqueSort=function(y){Ft=y},this.setTransparentSort=function(y){de=y},this.getClearColor=function(y){return y.copy(C.getClearColor())},this.setClearColor=function(){C.setClearColor(...arguments)},this.getClearAlpha=function(){return C.getClearAlpha()},this.setClearAlpha=function(){C.setClearAlpha(...arguments)},this.clear=function(y=!0,P=!0,H=!0){let F=0;if(y){let z=!1;if(et!==null){let dt=et.texture.format;z=m.has(dt)}if(z){let dt=et.texture.type,St=d.has(dt),ht=C.getClearColor(),yt=C.getClearAlpha(),Tt=ht.r,Vt=ht.g,Zt=ht.b;St?(M[0]=Tt,M[1]=Vt,M[2]=Zt,M[3]=yt,I.clearBufferuiv(I.COLOR,0,M)):(T[0]=Tt,T[1]=Vt,T[2]=Zt,T[3]=yt,I.clearBufferiv(I.COLOR,0,T))}else F|=I.COLOR_BUFFER_BIT}P&&(F|=I.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),H&&(F|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),F!==0&&I.clear(F)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(y){y.setRenderer(this),k=y},this.dispose=function(){e.removeEventListener("webglcontextlost",Ct,!1),e.removeEventListener("webglcontextrestored",kt,!1),e.removeEventListener("webglcontextcreationerror",gt,!1),C.dispose(),ut.dispose(),Z.dispose(),Gt.dispose(),Lt.dispose(),w.dispose(),nt.dispose(),B.dispose(),at.dispose(),Et.dispose(),j.dispose(),it.dispose(),it.removeEventListener("sessionstart",ic),it.removeEventListener("sessionend",sc),mi.stop()};function Ct(y){y.preventDefault(),vl("WebGLRenderer: Context Lost."),D=!0}function kt(){vl("WebGLRenderer: Context Restored."),D=!1;let y=ye.autoReset,P=lt.enabled,H=lt.autoUpdate,F=lt.needsUpdate,z=lt.type;Ht(),ye.autoReset=y,lt.enabled=P,lt.autoUpdate=H,lt.needsUpdate=F,lt.type=z}function gt(y){Ot("WebGLRenderer: A WebGL context could not be created. Reason: ",y.statusMessage)}function ie(y){let P=y.target;P.removeEventListener("dispose",ie),be(P)}function be(y){Yn(y),Lt.remove(y)}function Yn(y){let P=Lt.get(y).programs;P!==void 0&&(P.forEach(function(H){j.releaseProgram(H)}),y.isShaderMaterial&&j.releaseShaderCache(y))}this.renderBufferDirect=function(y,P,H,F,z,dt){P===null&&(P=xt);let St=z.isMesh&&z.matrixWorld.determinantAffine()<0,ht=Uu(y,P,H,F,z);mt.setMaterial(F,St);let yt=H.index,Tt=1;if(F.wireframe===!0){if(yt=B.getWireframeAttribute(H),yt===void 0)return;Tt=2}let Vt=H.drawRange,Zt=H.attributes.position,bt=Vt.start*Tt,Jt=(Vt.start+Vt.count)*Tt;dt!==null&&(bt=Math.max(bt,dt.start*Tt),Jt=Math.min(Jt,(dt.start+dt.count)*Tt)),yt!==null?(bt=Math.max(bt,0),Jt=Math.min(Jt,yt.count)):Zt!=null&&(bt=Math.max(bt,0),Jt=Math.min(Jt,Zt.count));let me=Jt-bt;if(me<0||me===1/0)return;at.setup(z,F,ht,H,yt);let le,re=X;if(yt!==null&&(le=x.get(yt),re=ct,re.setIndex(le)),z.isMesh)F.wireframe===!0?(mt.setLineWidth(F.wireframeLinewidth*ee()),re.setMode(I.LINES)):re.setMode(I.TRIANGLES);else if(z.isLine){let Ue=F.linewidth;Ue===void 0&&(Ue=1),mt.setLineWidth(Ue*ee()),z.isLineSegments?re.setMode(I.LINES):z.isLineLoop?re.setMode(I.LINE_LOOP):re.setMode(I.LINE_STRIP)}else z.isPoints?re.setMode(I.POINTS):z.isSprite&&re.setMode(I.TRIANGLES);if(z.isBatchedMesh)if(ae.get("WEBGL_multi_draw"))re.renderMultiDraw(z._multiDrawStarts,z._multiDrawCounts,z._multiDrawCount);else{let Ue=z._multiDrawStarts,wt=z._multiDrawCounts,ke=z._multiDrawCount,Qt=yt?x.get(yt).bytesPerElement:1,gi=Lt.get(F).currentProgram.getUniforms();for(let Fe=0;Fe<ke;Fe++)gi.setValue(I,"_gl_DrawID",Fe),re.render(Ue[Fe]/Qt,wt[Fe])}else if(z.isInstancedMesh)re.renderInstances(bt,me,z.count);else if(H.isInstancedBufferGeometry){let Ue=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,wt=Math.min(H.instanceCount,Ue);re.renderInstances(bt,me,wt)}else re.render(bt,me)};function nc(y,P,H,F){k!==null&&y.isNodeMaterial&&k.setObject(F,y),pe===!0&&K.setState(y,H,!1),y.transparent===!0&&y.side===on&&y.forceSinglePass===!1?(y.side=Le,y.needsUpdate=!0,vs(y,P,F),y.side=hi,y.needsUpdate=!0,vs(y,P,F),y.side=on):vs(y,P,F)}this.compile=function(y,P,H=null){H===null&&(H=y),k!==null&&k.renderStart(y,P,H),E=Z.get(H),E.init(P),b.push(E),H.traverseVisible(function(z){z.isLight&&z.layers.test(P.layers)&&(E.pushLight(z),z.castShadow&&E.pushShadow(z))}),y!==H&&y.traverseVisible(function(z){z.isLight&&z.layers.test(P.layers)&&(E.pushLight(z),z.castShadow&&E.pushShadow(z))}),E.setupLights(),k!==null&&k.updateLights(E.state.lightsArray),Ce=this.localClippingEnabled,pe=K.init(this.clippingPlanes,Ce),pe===!0&&K.setGlobalState(this.clippingPlanes,P),k!==null&&lt.render(E.state.shadowsArray,H,P);let F=new Set;return y.traverse(function(z){if(!(z.isMesh||z.isPoints||z.isLine||z.isSprite))return;let dt=z.material;if(dt)if(Array.isArray(dt))for(let St=0;St<dt.length;St++){let ht=dt[St];nc(ht,H,P,z),F.add(ht)}else nc(dt,H,P,z),F.add(dt)}),E=b.pop(),k!==null&&k.renderEnd(),F},this.compileAsync=function(y,P,H=null){let F=this.compile(y,P,H);return new Promise(z=>{function dt(){if(F.forEach(function(St){let yt=Lt.get(St).currentProgram;(yt===void 0||yt.isReady())&&F.delete(St)}),F.size===0){z(y);return}setTimeout(dt,10)}ae.get("KHR_parallel_shader_compile")!==null?dt():setTimeout(dt,10)})};let Ma=null;function Du(y){Ma&&Ma(y)}function ic(){mi.stop()}function sc(){mi.start()}let mi=new Jh;mi.setAnimationLoop(Du),typeof self<"u"&&mi.setContext(self),this.setAnimationLoop=function(y){Ma=y,it.setAnimationLoop(y),y===null?mi.stop():mi.start()},it.addEventListener("sessionstart",ic),it.addEventListener("sessionend",sc),this.render=function(y,P){if(P!==void 0&&P.isCamera!==!0){Ot("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;k!==null&&k.renderStart(y,P);let H=it.enabled===!0&&it.isPresenting===!0,F=O!==null&&(et===null||H)&&O.begin(L,et);if(y.matrixWorldAutoUpdate===!0&&y.updateMatrixWorld(),P.parent===null&&P.matrixWorldAutoUpdate===!0&&P.updateMatrixWorld(),it.enabled===!0&&it.isPresenting===!0&&(O===null||O.isCompositing()===!1)&&(it.cameraAutoUpdate===!0&&it.updateCamera(P),P=it.getCamera()),y.isScene===!0&&y.onBeforeRender(L,y,P,et),E=Z.get(y,b.length),E.init(P),E.state.textureUnits=Gt.getTextureUnits(),b.push(E),ce.multiplyMatrices(P.projectionMatrix,P.matrixWorldInverse),P.isArrayCamera?xe.setFromArrayCamera(P):Xt.setFromProjectionMatrix(ce,rn,P.reversedDepth),Ce=this.localClippingEnabled,pe=K.init(this.clippingPlanes,Ce),A=ut.get(y,_.length),A.init(),_.push(A),this.info.render.frame++,it.enabled===!0&&it.isPresenting===!0){let St=L.xr.getDepthSensingMesh();St!==null&&Sa(St,P,-1/0,L.sortObjects)}Sa(y,P,0,L.sortObjects),A.finish(),k!==null&&k.updateLights(E.state.lightsArray),L.sortObjects===!0&&A.sort(Ft,de),zt=it.enabled===!1||it.isPresenting===!1||it.hasDepthSensing()===!1,zt&&C.addToRenderList(A,y),this.info.autoReset===!0&&this.info.reset(),pe===!0&&K.beginShadows();let z=E.state.shadowsArray;if(lt.render(z,y,P),pe===!0&&K.endShadows(),(F&&O.hasRenderPass())===!1){let St=A.opaque,ht=A.transmissive;if(E.setupLights(),P.isArrayCamera){let yt=P.cameras;if(ht.length>0)for(let Tt=0,Vt=yt.length;Tt<Vt;Tt++){let Zt=yt[Tt];oc(St,ht,y,Zt)}zt&&C.render(y);for(let Tt=0,Vt=yt.length;Tt<Vt;Tt++){let Zt=yt[Tt];rc(A,y,Zt,Zt.viewport)}}else ht.length>0&&oc(St,ht,y,P),zt&&C.render(y),rc(A,y,P)}et!==null&&G===0&&(Gt.updateMultisampleRenderTarget(et),Gt.updateRenderTargetMipmap(et)),F&&O.end(L),y.isScene===!0&&y.onAfterRender(L,y,P),at.resetDefaultState(),W=-1,Q=null,b.pop(),b.length>0?(E=b[b.length-1],Gt.setTextureUnits(E.state.textureUnits),pe===!0&&K.setGlobalState(L.clippingPlanes,E.state.camera)):E=null,_.pop(),_.length>0?A=_[_.length-1]:A=null,k!==null&&k.renderEnd()};function Sa(y,P,H,F){if(y.visible===!1)return;if(y.layers.test(P.layers)){if(y.isGroup)H=y.renderOrder;else if(y.isLOD)y.autoUpdate===!0&&y.update(P);else if(y.isLight)E.pushLight(y),y.castShadow&&E.pushShadow(y);else if(y.isSprite){let St=P.isArrayCamera?xe:Xt;if(!y.frustumCulled||y.intersectsFrustum(St)){F&&rt.setFromMatrixPosition(y.matrixWorld).applyMatrix4(ce);let ht=nt.update(y),yt=y.material;yt.visible&&A.push(y,ht,yt,H,rt.z,null,P)}}else if(y.isMesh||y.isLine||y.isPoints){let St=P.isArrayCamera?xe:Xt;if(!y.frustumCulled||y.intersectsFrustum(St)){let ht=nt.update(y),yt=y.material;if(F&&(y.boundingSphere!==void 0?(y.boundingSphere===null&&y.computeBoundingSphere(),rt.copy(y.boundingSphere.center)):(ht.boundingSphere===null&&ht.computeBoundingSphere(),rt.copy(ht.boundingSphere.center)),rt.applyMatrix4(y.matrixWorld).applyMatrix4(ce)),Array.isArray(yt)){let Tt=ht.groups;for(let Vt=0,Zt=Tt.length;Vt<Zt;Vt++){let bt=Tt[Vt],Jt=yt[bt.materialIndex];Jt&&Jt.visible&&A.push(y,ht,Jt,H,rt.z,bt,P)}}else yt.visible&&A.push(y,ht,yt,H,rt.z,null,P)}}}let dt=y.children;for(let St=0,ht=dt.length;St<ht;St++)Sa(dt[St],P,H,F)}function rc(y,P,H,F){let{opaque:z,transmissive:dt,transparent:St}=y;E.setupLightsView(H),pe===!0&&K.setGlobalState(L.clippingPlanes,H),F&&mt.viewport(tt.copy(F)),z.length>0&&mr(z,P,H),dt.length>0&&mr(dt,P,H),St.length>0&&mr(St,P,H),mt.buffers.depth.setTest(!0),mt.buffers.depth.setMask(!0),mt.buffers.color.setMask(!0),mt.setPolygonOffset(!1)}function oc(y,P,H,F){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[F.id]===void 0){let bt=ae.has("EXT_color_buffer_half_float")||ae.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[F.id]=new Xe(1,1,{generateMipmaps:!0,type:bt?en:Ge,minFilter:Gn,samples:Math.max(4,ue.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Kt.workingColorSpace})}let dt=E.state.transmissionRenderTarget[F.id],St=F.viewport||tt;dt.setSize(St.z*L.transmissionResolutionScale,St.w*L.transmissionResolutionScale);let ht=L.getRenderTarget(),yt=L.getActiveCubeFace(),Tt=L.getActiveMipmapLevel();L.setRenderTarget(dt),L.getClearColor(J),ft=L.getClearAlpha(),ft<1&&L.setClearColor(16777215,.5),L.clear(),zt&&C.render(H);let Vt=L.toneMapping;L.toneMapping=an;let Zt=F.viewport;if(F.viewport!==void 0&&(F.viewport=void 0),E.setupLightsView(F),pe===!0&&K.setGlobalState(L.clippingPlanes,F),mr(y,H,F),Gt.updateMultisampleRenderTarget(dt),Gt.updateRenderTargetMipmap(dt),ae.has("WEBGL_multisampled_render_to_texture")===!1){let bt=!1;for(let Jt=0,me=P.length;Jt<me;Jt++){let le=P[Jt],{object:re,geometry:Ue,material:wt,group:ke}=le;if(wt.side===on&&re.layers.test(F.layers)){let Qt=wt.side;wt.side=Le,wt.needsUpdate=!0,ac(re,H,F,Ue,wt,ke),wt.side=Qt,wt.needsUpdate=!0,bt=!0}}bt===!0&&(Gt.updateMultisampleRenderTarget(dt),Gt.updateRenderTargetMipmap(dt))}L.setRenderTarget(ht,yt,Tt),L.setClearColor(J,ft),Zt!==void 0&&(F.viewport=Zt),L.toneMapping=Vt}function mr(y,P,H){let F=P.isScene===!0?P.overrideMaterial:null;for(let z=0,dt=y.length;z<dt;z++){let St=y[z],{object:ht,geometry:yt,group:Tt}=St,Vt=St.material;Vt.allowOverride===!0&&F!==null&&(Vt=F),ht.layers.test(H.layers)&&ac(ht,P,H,yt,Vt,Tt)}}function ac(y,P,H,F,z,dt){k!==null&&z.isNodeMaterial&&k.setObject(y,z),y.onBeforeRender(L,P,H,F,z,dt),y.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,y.matrixWorld),y.normalMatrix.getNormalMatrix(y.modelViewMatrix),z.onBeforeRender(L,P,H,F,y,dt),z.transparent===!0&&z.side===on&&z.forceSinglePass===!1?(z.side=Le,z.needsUpdate=!0,L.renderBufferDirect(H,P,F,z,y,dt),z.side=hi,z.needsUpdate=!0,L.renderBufferDirect(H,P,F,z,y,dt),z.side=on):L.renderBufferDirect(H,P,F,z,y,dt),y.onAfterRender(L,P,H,F,z,dt)}function lc(y){let P=0;for(let H of y)H.texture!==null&&P++;return P}function vs(y,P,H){P.isScene!==!0&&(P=xt);let F=Lt.get(y),z=E.state.lights,dt=E.state.shadowsArray,St=z.state.version,ht=j.getParameters(y,z.state,dt,P,H,E.state.lightProbeGridArray),yt=j.getProgramCacheKey(ht),Tt=F.programs;F.environment=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?P.environment:null,F.fog=P.fog;let Vt=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap;F.envMap=w.get(y.envMap||F.environment,Vt),F.envMapRotation=F.environment!==null&&y.envMap===null?P.environmentRotation:y.envMapRotation,Tt===void 0&&(y.addEventListener("dispose",ie),Tt=new Map,F.programs=Tt,F.programVariants=new Map);let Zt=Tt.get(yt);if(Zt!==void 0){if(F.currentProgram===Zt&&F.lightsStateVersion===St)return hc(y,ht),Zt}else ht.uniforms=j.getUniforms(y),k!==null&&y.isNodeMaterial&&k.build(y,H,ht),y.onBeforeCompile(ht,L),Zt=j.acquireProgram(ht,yt),Tt.set(yt,Zt),F.uniforms=ht.uniforms;let bt=F.uniforms;return(!y.isShaderMaterial&&!y.isRawShaderMaterial||y.clipping===!0)&&(bt.clippingPlanes=K.uniform),hc(y,ht),F.needsLights=Ou(y),F.lightsStateVersion=St,F.needsLights&&(bt.ambientLightColor.value=z.state.ambient,bt.lightProbe.value=z.state.probe,bt.sunLights.value=z.state.sun,bt.sunLightShadows.value=z.state.sunShadow,bt.directionalLights.value=z.state.directional,bt.directionalLightShadows.value=z.state.directionalShadow,bt.spotLights.value=z.state.spot,bt.spotLightShadows.value=z.state.spotShadow,bt.rectAreaLights.value=z.state.rectArea,bt.ltc_1.value=z.state.rectAreaLTC1,bt.ltc_2.value=z.state.rectAreaLTC2,bt.pointLights.value=z.state.point,bt.pointLightShadows.value=z.state.pointShadow,bt.hemisphereLights.value=z.state.hemi,bt.sunShadowMatrix.value=z.state.sunShadowMatrix,bt.sunShadowCascade.value=z.state.sunShadowCascade,bt.directionalShadowMatrix.value=z.state.directionalShadowMatrix,bt.spotLightMatrix.value=z.state.spotLightMatrix,bt.spotLightMap.value=z.state.spotLightMap,bt.pointShadowMatrix.value=z.state.pointShadowMatrix),F.numLightProbeGrids=lc(E.state.lightProbeGridArray),F.currentProgram=Zt,F.uniformsList=null,Zt}function Nu(y,P,H,F,z){let dt=Lt.get(y),St=dt.currentProgram.id+","+F+","+z,ht=dt.programVariants.get(St);return ht===void 0?(ht=vs(y,P,H),dt.programVariants.set(St,ht)):(dt.currentProgram=ht,dt.uniformsList=null,dt.outputColorSpace=F,dt.toneMapping=z),ht}function cc(y){if(y.uniformsList===null){let P=y.currentProgram.getUniforms();y.uniformsList=ps.seqWithValue(P.seq,y.uniforms)}return y.uniformsList}function hc(y,P){let H=Lt.get(y);H.outputColorSpace=P.outputColorSpace,H.batching=P.batching,H.batchingColor=P.batchingColor,H.instancing=P.instancing,H.instancingColor=P.instancingColor,H.instancingMorph=P.instancingMorph,H.skinning=P.skinning,H.morphTargets=P.morphTargets,H.morphNormals=P.morphNormals,H.morphColors=P.morphColors,H.morphTargetsCount=P.morphTargetsCount,H.numClippingPlanes=P.numClippingPlanes,H.numIntersection=P.numClipIntersection,H.vertexAlphas=P.vertexAlphas,H.vertexTangents=P.vertexTangents,H.toneMapping=P.toneMapping}function Uu(y,P,H,F,z){P.isScene!==!0&&(P=xt),Gt.resetTextureUnits();let dt=P.fog,St=F.isMeshStandardMaterial||F.isMeshLambertMaterial||F.isMeshPhongMaterial?P.environment:null,ht=et===null?L.outputColorSpace:et.isXRRenderTarget===!0?et.texture.colorSpace:Kt.workingColorSpace,yt=F.isMeshStandardMaterial||F.isMeshLambertMaterial&&!F.envMap||F.isMeshPhongMaterial&&!F.envMap,Tt=w.get(F.envMap||St,yt),Vt=F.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,Zt=!!H.attributes.tangent&&(!!F.normalMap||F.anisotropy>0),bt=!!H.morphAttributes.position,Jt=!!H.morphAttributes.normal,me=!!H.morphAttributes.color,le=an;F.toneMapped&&(et===null||et.isXRRenderTarget===!0)&&(le=L.toneMapping);let re=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,Ue=re!==void 0?re.length:0,wt=Lt.get(F),ke=E.state.lights;if(pe===!0&&(Ce===!0||y!==Q)){let fe=y===Q&&F.id===W;K.setState(F,y,fe)}let Qt=!1,gi=!1;F.version===wt.__version?wt.needsLights&&wt.lightsStateVersion!==ke.state.version||z.isBatchedMesh&&wt.batching===!1||!z.isBatchedMesh&&wt.batching===!0||z.isBatchedMesh&&wt.batchingColor===!0&&z._colorsTexture===null||z.isBatchedMesh&&wt.batchingColor===!1&&z._colorsTexture!==null||z.isInstancedMesh&&wt.instancing===!1||!z.isInstancedMesh&&wt.instancing===!0||z.isSkinnedMesh&&wt.skinning===!1||!z.isSkinnedMesh&&wt.skinning===!0||z.isInstancedMesh&&wt.instancingColor===!0&&z.instanceColor===null||z.isInstancedMesh&&wt.instancingColor===!1&&z.instanceColor!==null||z.isInstancedMesh&&wt.instancingMorph===!0&&z.morphTexture===null||z.isInstancedMesh&&wt.instancingMorph===!1&&z.morphTexture!==null||wt.envMap!==Tt||F.fog===!0&&wt.fog!==dt||wt.numClippingPlanes!==void 0&&(wt.numClippingPlanes!==K.numPlanes||wt.numIntersection!==K.numIntersection)||wt.vertexAlphas!==Vt||wt.vertexTangents!==Zt||wt.morphTargets!==bt||wt.morphNormals!==Jt||wt.morphColors!==me||wt.morphTargetsCount!==Ue||wt.numLightProbeGrids!==lc(E.state.lightProbeGridArray)?Qt=!0:(wt.outputColorSpace!==ht||wt.toneMapping!==le)&&(gi=!0):(Qt=!0,wt.__version=F.version);let Fe=wt.currentProgram;(Qt===!0||gi===!0)&&(Fe=gi===!0?Nu(F,P,z,ht,le):vs(F,P,z),k&&F.isNodeMaterial&&k.onUpdateProgram(F,Fe,wt));let gr=!1,Zn=!1,_i=!1,$t=Fe.getUniforms(),Pe=wt.uniforms;if(mt.useProgram(Fe.program)&&(gr=!0,Zn=!0,_i=!0),F.id!==W&&(W=F.id,Zn=!0),gr||Q!==y){mt.buffers.depth.getReversed()&&y.reversedDepth!==!0&&(y._reversedDepth=!0,y.updateProjectionMatrix()),$t.setValue(I,"projectionMatrix",y.projectionMatrix),$t.setValue(I,"viewMatrix",y.matrixWorldInverse);let we=$t.map.cameraPosition;we!==void 0&&we.setValue(I,nn.setFromMatrixPosition(y.matrixWorld)),ue.logarithmicDepthBuffer&&$t.setValue(I,"logDepthBufFC",2/(Math.log(y.far+1)/Math.LN2)),(F.isMeshPhongMaterial||F.isMeshToonMaterial||F.isMeshLambertMaterial||F.isMeshBasicMaterial||F.isMeshStandardMaterial||F.isShaderMaterial)&&$t.setValue(I,"isOrthographic",y.isOrthographicCamera===!0),Q!==y&&(Q=y,Zn=!0,_i=!0)}if(wt.needsLights&&(ke.state.sunShadowMap.length>0&&$t.setValue(I,"sunShadowMap",ke.state.sunShadowMap,Gt),ke.state.directionalShadowMap.length>0&&$t.setValue(I,"directionalShadowMap",ke.state.directionalShadowMap,Gt),ke.state.spotShadowMap.length>0&&$t.setValue(I,"spotShadowMap",ke.state.spotShadowMap,Gt),ke.state.pointShadowMap.length>0&&$t.setValue(I,"pointShadowMap",ke.state.pointShadowMap,Gt)),z.isSkinnedMesh){$t.setOptional(I,z,"bindMatrix"),$t.setOptional(I,z,"bindMatrixInverse");let fe=z.skeleton;fe&&(fe.boneTexture===null&&fe.computeBoneTexture(),$t.setValue(I,"boneTexture",fe.boneTexture,Gt))}z.isBatchedMesh&&($t.setOptional(I,z,"batchingTexture"),$t.setValue(I,"batchingTexture",z._matricesTexture,Gt),$t.setOptional(I,z,"batchingIdTexture"),$t.setValue(I,"batchingIdTexture",z._indirectTexture,Gt),$t.setOptional(I,z,"batchingColorTexture"),z._colorsTexture!==null&&$t.setValue(I,"batchingColorTexture",z._colorsTexture,Gt));let hn=H.morphAttributes;if((hn.position!==void 0||hn.normal!==void 0||hn.color!==void 0)&&$.update(z,H,Fe),(Zn||wt.receiveShadow!==z.receiveShadow)&&(wt.receiveShadow=z.receiveShadow,$t.setValue(I,"receiveShadow",z.receiveShadow)),(F.isMeshStandardMaterial||F.isMeshLambertMaterial||F.isMeshPhongMaterial)&&F.envMap===null&&P.environment!==null&&(Pe.envMapIntensity.value=P.environmentIntensity),Pe.dfgLUT!==void 0&&(Pe.dfgLUT.value=v0()),Zn){if($t.setValue(I,"toneMappingExposure",L.toneMappingExposure),wt.needsLights&&Fu(Pe,_i),dt&&F.fog===!0&&ot.refreshFogUniforms(Pe,dt),ot.refreshMaterialUniforms(Pe,F,pt,At,E.state.transmissionRenderTarget[y.id]),wt.needsLights&&wt.numLightProbeGrids>0){let fe=S,we=0;for(let Rn of E.state.lightProbeGridArray)Rn.texture!==null&&(fe.textures[we]=Rn.texture,fe.min[we]=Rn.boundingBox.min,fe.max[we]=Rn.boundingBox.max,fe.resolution[we]=Rn.resolution,we++);for(let Rn in fe)fe[Rn].length=we;Pe.probesSH.value=fe.textures,Pe.probesMin.value=fe.min,Pe.probesMax.value=fe.max,Pe.probesResolution.value=fe.resolution}ps.upload(I,cc(wt),Pe,Gt)}if(F.isShaderMaterial&&F.uniformsNeedUpdate===!0&&(ps.upload(I,cc(wt),Pe,Gt),F.uniformsNeedUpdate=!1),F.isSpriteMaterial&&$t.setValue(I,"center",z.center),$t.setValue(I,"modelViewMatrix",z.modelViewMatrix),$t.setValue(I,"normalMatrix",z.normalMatrix),$t.setValue(I,"modelMatrix",z.matrixWorld),F.uniformsGroups!==void 0){let fe=F.uniformsGroups;for(let we=0,Rn=fe.length;we<Rn;we++){let dc=fe[we];Et.update(dc,Fe),Et.bind(dc,Fe)}}return Fe}function Fu(y,P){y.ambientLightColor.needsUpdate=P,y.lightProbe.needsUpdate=P,y.sunLights.needsUpdate=P,y.sunLightShadows.needsUpdate=P,y.directionalLights.needsUpdate=P,y.directionalLightShadows.needsUpdate=P,y.pointLights.needsUpdate=P,y.pointLightShadows.needsUpdate=P,y.spotLights.needsUpdate=P,y.spotLightShadows.needsUpdate=P,y.rectAreaLights.needsUpdate=P,y.hemisphereLights.needsUpdate=P}function Ou(y){return y.isMeshLambertMaterial||y.isMeshToonMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isShadowMaterial||y.isShaderMaterial&&y.lights===!0}this.getActiveCubeFace=function(){return Y},this.getActiveMipmapLevel=function(){return G},this.getRenderTarget=function(){return et},this.setRenderTargetTextures=function(y,P,H){let F=Lt.get(y);F.__autoAllocateDepthBuffer=y.resolveDepthBuffer===!1,F.__autoAllocateDepthBuffer===!1&&(F.__useRenderToTexture=!1),Lt.get(y.texture).__webglTexture=P,Lt.get(y.depthTexture).__webglTexture=F.__autoAllocateDepthBuffer?void 0:H,F.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(y,P){let H=Lt.get(y);H.__webglFramebuffer=P,H.__useDefaultFramebuffer=P===void 0},this.setRenderTarget=function(y,P=0,H=0){et=y,Y=P,G=H;let F=null,z=!1,dt=!1;if(y){let ht=Lt.get(y);if(ht.__useDefaultFramebuffer!==void 0){mt.bindFramebuffer(I.FRAMEBUFFER,ht.__webglFramebuffer),tt.copy(y.viewport),vt.copy(y.scissor),Rt=y.scissorTest,mt.viewport(tt),mt.scissor(vt),mt.setScissorTest(Rt),W=-1;return}else if(ht.__webglFramebuffer===void 0)Gt.setupRenderTarget(y);else if(ht.__hasExternalTextures)Gt.rebindTextures(y,Lt.get(y.texture).__webglTexture,Lt.get(y.depthTexture).__webglTexture);else if(y.depthBuffer){let Vt=y.depthTexture;if(ht.__boundDepthTexture!==Vt){if(Vt!==null&&Lt.has(Vt)&&(y.width!==Vt.image.width||y.height!==Vt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Gt.setupDepthRenderbuffer(y)}}let yt=y.texture;(yt.isData3DTexture||yt.isDataArrayTexture||yt.isCompressedArrayTexture)&&(dt=!0);let Tt=Lt.get(y).__webglFramebuffer;y.isWebGLCubeRenderTarget?(Array.isArray(Tt[P])?F=Tt[P][H]:F=Tt[P],z=!0):y.samples>0&&Gt.useMultisampledRTT(y)===!1?F=Lt.get(y).__webglMultisampledFramebuffer:Array.isArray(Tt)?F=Tt[H]:F=Tt,tt.copy(y.viewport),vt.copy(y.scissor),Rt=y.scissorTest}else tt.copy(Pt).multiplyScalar(pt).floor(),vt.copy(jt).multiplyScalar(pt).floor(),Rt=Yt;if(H!==0&&(F=q),mt.bindFramebuffer(I.FRAMEBUFFER,F)&&mt.drawBuffers(y,F),mt.viewport(tt),mt.scissor(vt),mt.setScissorTest(Rt),z){let ht=Lt.get(y.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+P,ht.__webglTexture,H)}else if(dt){let ht=P;for(let yt=0;yt<y.textures.length;yt++){let Tt=Lt.get(y.textures[yt]);I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0+yt,Tt.__webglTexture,H,ht)}}else if(y!==null&&H!==0){let ht=Lt.get(y.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,ht.__webglTexture,H)}W=-1};function uc(y){let P=Lt.get(y);return(P.__readFormat!==y.format||P.__readType!==y.type)&&(P.__readFormat=y.format,P.__readType=y.type,P.__formatReadable=ue.textureFormatReadable(y.format),P.__typeReadable=ue.textureTypeReadable(y.type)),P}this.readRenderTargetPixels=function(y,P,H,F,z,dt,St,ht=0){if(!(y&&y.isWebGLRenderTarget)){Ot("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let yt=Lt.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&St!==void 0&&(yt=yt[St],Array.isArray(yt)&&(yt=yt[0])),yt){mt.bindFramebuffer(I.FRAMEBUFFER,yt);try{let Tt=y.textures[ht],Vt=Tt.format,Zt=Tt.type;y.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+ht);let bt=uc(Tt);if(bt.__formatReadable===!1){Ot("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(bt.__typeReadable===!1){Ot("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}P>=0&&P<=y.width-F&&H>=0&&H<=y.height-z&&I.readPixels(P,H,F,z,st.convert(Vt),st.convert(Zt),dt)}finally{let Tt=et!==null?Lt.get(et).__webglFramebuffer:null;mt.bindFramebuffer(I.FRAMEBUFFER,Tt)}}},this.readRenderTargetPixelsAsync=async function(y,P,H,F,z,dt,St,ht=0){if(!(y&&y.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let yt=Lt.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&St!==void 0&&(yt=yt[St],Array.isArray(yt)&&(yt=yt[0])),yt)if(P>=0&&P<=y.width-F&&H>=0&&H<=y.height-z){mt.bindFramebuffer(I.FRAMEBUFFER,yt);let Tt=y.textures[ht],Vt=Tt.format,Zt=Tt.type;y.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+ht);let bt=uc(Tt);if(bt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(bt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Jt=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,Jt),I.bufferData(I.PIXEL_PACK_BUFFER,dt.byteLength,I.STREAM_READ),I.readPixels(P,H,F,z,st.convert(Vt),st.convert(Zt),0),I.bindBuffer(I.PIXEL_PACK_BUFFER,null);let me=et!==null?Lt.get(et).__webglFramebuffer:null;mt.bindFramebuffer(I.FRAMEBUFFER,me);let le=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await vh(I,le,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,Jt),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,dt),I.bindBuffer(I.PIXEL_PACK_BUFFER,null),I.deleteBuffer(Jt),I.deleteSync(le),dt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(y,P=null,H=0){let F=Math.pow(2,-H),z=Math.floor(y.image.width*F),dt=Math.floor(y.image.height*F),St=P!==null?P.x:0,ht=P!==null?P.y:0;Gt.setTexture2D(y,0),I.copyTexSubImage2D(I.TEXTURE_2D,H,0,0,St,ht,z,dt),mt.unbindTexture()},this.copyTextureToTexture=function(y,P,H=null,F=null,z=0,dt=0){let St,ht,yt,Tt,Vt,Zt,bt,Jt,me,le=y.isCompressedTexture?y.mipmaps[dt]:y.image;if(H!==null)St=H.max.x-H.min.x,ht=H.max.y-H.min.y,yt=H.isBox3?H.max.z-H.min.z:1,Tt=H.min.x,Vt=H.min.y,Zt=H.isBox3?H.min.z:0;else{let $t=Math.pow(2,-z);St=Math.floor(le.width*$t),ht=Math.floor(le.height*$t),y.isDataArrayTexture?yt=le.depth:y.isData3DTexture?yt=Math.floor(le.depth*$t):yt=1,Tt=0,Vt=0,Zt=0}F!==null?(bt=F.x,Jt=F.y,me=F.z):(bt=0,Jt=0,me=0);let re=st.convert(P.format),Ue=st.convert(P.type),wt;P.isData3DTexture?(Gt.setTexture3D(P,0),wt=I.TEXTURE_3D):P.isDataArrayTexture||P.isCompressedArrayTexture?(Gt.setTexture2DArray(P,0),wt=I.TEXTURE_2D_ARRAY):(Gt.setTexture2D(P,0),wt=I.TEXTURE_2D),mt.activeTexture(I.TEXTURE0),mt.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,P.flipY),mt.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,P.premultiplyAlpha),mt.pixelStorei(I.UNPACK_ALIGNMENT,P.unpackAlignment);let ke=mt.getParameter(I.UNPACK_ROW_LENGTH),Qt=mt.getParameter(I.UNPACK_IMAGE_HEIGHT),gi=mt.getParameter(I.UNPACK_SKIP_PIXELS),Fe=mt.getParameter(I.UNPACK_SKIP_ROWS),gr=mt.getParameter(I.UNPACK_SKIP_IMAGES);mt.pixelStorei(I.UNPACK_ROW_LENGTH,le.width),mt.pixelStorei(I.UNPACK_IMAGE_HEIGHT,le.height),mt.pixelStorei(I.UNPACK_SKIP_PIXELS,Tt),mt.pixelStorei(I.UNPACK_SKIP_ROWS,Vt),mt.pixelStorei(I.UNPACK_SKIP_IMAGES,Zt);let Zn=y.isDataArrayTexture||y.isData3DTexture,_i=P.isDataArrayTexture||P.isData3DTexture;if(y.isDepthTexture){let $t=Lt.get(y),Pe=Lt.get(P),hn=Lt.get($t.__renderTarget),fe=Lt.get(Pe.__renderTarget);mt.bindFramebuffer(I.READ_FRAMEBUFFER,hn.__webglFramebuffer),mt.bindFramebuffer(I.DRAW_FRAMEBUFFER,fe.__webglFramebuffer);for(let we=0;we<yt;we++)Zn&&(I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Lt.get(y).__webglTexture,z,Zt+we),I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Lt.get(P).__webglTexture,dt,me+we)),I.blitFramebuffer(Tt,Vt,Tt+St,Vt+ht,bt,Jt,bt+St,Jt+ht,I.DEPTH_BUFFER_BIT,I.NEAREST);mt.bindFramebuffer(I.READ_FRAMEBUFFER,null),mt.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else if(z!==0||y.isRenderTargetTexture||Lt.has(y)){let $t=Lt.get(y),Pe=Lt.get(P);mt.bindFramebuffer(I.READ_FRAMEBUFFER,R),mt.bindFramebuffer(I.DRAW_FRAMEBUFFER,V);for(let hn=0;hn<yt;hn++)Zn?I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,$t.__webglTexture,z,Zt+hn):I.framebufferTexture2D(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,$t.__webglTexture,z),_i?I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Pe.__webglTexture,dt,me+hn):I.framebufferTexture2D(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,Pe.__webglTexture,dt),z!==0?I.blitFramebuffer(Tt,Vt,Tt+St,Vt+ht,bt,Jt,bt+St,Jt+ht,I.COLOR_BUFFER_BIT,I.NEAREST):_i?I.copyTexSubImage3D(wt,dt,bt,Jt,me+hn,Tt,Vt,St,ht):I.copyTexSubImage2D(wt,dt,bt,Jt,Tt,Vt,St,ht);mt.bindFramebuffer(I.READ_FRAMEBUFFER,null),mt.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else _i?y.isDataTexture||y.isData3DTexture?I.texSubImage3D(wt,dt,bt,Jt,me,St,ht,yt,re,Ue,le.data):P.isCompressedArrayTexture?I.compressedTexSubImage3D(wt,dt,bt,Jt,me,St,ht,yt,re,le.data):I.texSubImage3D(wt,dt,bt,Jt,me,St,ht,yt,re,Ue,le):y.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,dt,bt,Jt,St,ht,re,Ue,le.data):y.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,dt,bt,Jt,le.width,le.height,re,le.data):I.texSubImage2D(I.TEXTURE_2D,dt,bt,Jt,St,ht,re,Ue,le);mt.pixelStorei(I.UNPACK_ROW_LENGTH,ke),mt.pixelStorei(I.UNPACK_IMAGE_HEIGHT,Qt),mt.pixelStorei(I.UNPACK_SKIP_PIXELS,gi),mt.pixelStorei(I.UNPACK_SKIP_ROWS,Fe),mt.pixelStorei(I.UNPACK_SKIP_IMAGES,gr),dt===0&&P.generateMipmaps===!0&&P.mipmapsAutoUpdate===!0&&I.generateMipmap(wt),mt.unbindTexture()},this.initRenderTarget=function(y){Lt.get(y).__webglFramebuffer===void 0&&Gt.setupRenderTarget(y)},this.initTexture=function(y){y.isCubeTexture?Gt.setTextureCube(y,0):y.isData3DTexture?Gt.setTexture3D(y,0):y.isDataArrayTexture||y.isCompressedArrayTexture?Gt.setTexture2DArray(y,0):Gt.setTexture2D(y,0),mt.unbindTexture()},this.resetState=function(){Y=0,G=0,et=null,mt.reset(),at.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return rn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=Kt._getDrawingBufferColorSpace(t),e.unpackColorSpace=Kt._getUnpackColorSpace()}};var ou={type:"change"},Gl={type:"start"},lu={type:"end"},ca=new is,au=new He,M0=Math.cos(70*wl.DEG2RAD),Se=new U,Ze=2*Math.PI,te={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},zl=1e-6,ha=class extends Qs{constructor(t,e=null){super(t,e),this.state=te.NONE,this.target=new U,this.cursor=new U,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:li.ROTATE,MIDDLE:li.DOLLY,RIGHT:li.PAN},this.touches={ONE:ci.ROTATE,TWO:ci.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new U,this._lastQuaternion=new Qe,this._lastTargetPosition=new U,this._quat=new Qe().setFromUnitVectors(t.up,new U(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new ls,this._sphericalDelta=new ls,this._scale=1,this._panOffset=new U,this._rotateStart=new Nt,this._rotateEnd=new Nt,this._rotateDelta=new Nt,this._panStart=new Nt,this._panEnd=new Nt,this._panDelta=new Nt,this._dollyStart=new Nt,this._dollyEnd=new Nt,this._dollyDelta=new Nt,this._dollyDirection=new U,this._mouse=new Nt,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=b0.bind(this),this._onPointerDown=S0.bind(this),this._onPointerUp=w0.bind(this),this._onContextMenu=I0.bind(this),this._onMouseWheel=A0.bind(this),this._onKeyDown=R0.bind(this),this._onTouchStart=C0.bind(this),this._onTouchMove=P0.bind(this),this._onMouseDown=T0.bind(this),this._onMouseMove=E0.bind(this),this._interceptControlDown=L0.bind(this),this._interceptControlUp=D0.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(t){this._cursorStyle=t,t==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.ownerDocument.addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=te.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.ownerDocument.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(ou),this.update(),this.state=te.NONE}pan(t,e){this._pan(t,e),this.update()}dollyIn(t){this._dollyIn(t),this.update()}dollyOut(t){this._dollyOut(t),this.update()}rotateLeft(t){this._rotateLeft(t),this.update()}rotateUp(t){this._rotateUp(t),this.update()}update(t=null){let e=this.object.position;Se.copy(e).sub(this.target),Se.applyQuaternion(this._quat),this._spherical.setFromVector3(Se),this.autoRotate&&this.state===te.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=Ze:n>Math.PI&&(n-=Ze),s<-Math.PI?s+=Ze:s>Math.PI&&(s-=Ze),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(Se.setFromSpherical(this._spherical),Se.applyQuaternion(this._quatInverse),e.copy(this.target).add(Se),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=Se.length();o=this._clampDistance(a*this._scale);let l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let a=new U(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new U(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=Se.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(ca.origin.copy(this.object.position),ca.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(ca.direction))<M0?this.object.lookAt(this.target):(au.setFromNormalAndCoplanarPoint(this.object.up,this.target),ca.intersectPlane(au,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>zl||8*(1-this._lastQuaternion.dot(this.object.quaternion))>zl||this._lastTargetPosition.distanceToSquared(this.target)>zl?(this.dispatchEvent(ou),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?Ze/60*this.autoRotateSpeed*t:Ze/60/60*this.autoRotateSpeed}_getZoomScale(t){let e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){Se.setFromMatrixColumn(e,0),Se.multiplyScalar(-t),this._panOffset.add(Se)}_panUp(t,e){this.screenSpacePanning===!0?Se.setFromMatrixColumn(e,1):(Se.setFromMatrixColumn(e,0),Se.crossVectors(this.object.up,Se)),Se.multiplyScalar(t),this._panOffset.add(Se)}_pan(t,e){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Se.copy(s).sub(this.target);let r=Se.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*r/n.clientHeight,this.object.matrix),this._panUp(2*e*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=t-n.left,r=e-n.top,o=n.width,a=n.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientY),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(Ze*this._rotateDelta.x/e.clientHeight),this._rotateUp(Ze*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.zoomToCursor&&(this._performCursorZoom=!0,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(Ze*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-Ze*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(Ze*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-Ze*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(n,s)}}_handleTouchStartDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{let n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),r=.5*(t.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(Ze*this._rotateDelta.x/e.clientHeight),this._rotateUp(Ze*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(t.pageX+e.x)*.5,a=(t.pageY+e.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new Nt,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){let e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){let e=t.deltaMode,n={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function S0(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function b0(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function w0(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(lu),this.state=te.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function T0(i){let t;switch(i.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case li.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=te.DOLLY;break;case li.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=te.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=te.ROTATE}break;case li.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=te.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=te.PAN}break;default:this.state=te.NONE}this.state!==te.NONE&&this.dispatchEvent(Gl)}function E0(i){switch(this.state){case te.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case te.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case te.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function A0(i){this.enabled===!1||this.enableZoom===!1||this.state!==te.NONE||(i.preventDefault(),this.dispatchEvent(Gl),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(lu))}function R0(i){this.enabled!==!1&&this._handleKeyDown(i)}function C0(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case ci.ROTATE:if(this.enableRotate===!1){this.state=te.NONE;break}this._handleTouchStartRotate(i),this.state=te.TOUCH_ROTATE;break;case ci.PAN:if(this.enablePan===!1){this.state=te.NONE;break}this._handleTouchStartPan(i),this.state=te.TOUCH_PAN;break;default:this.state=te.NONE}break;case 2:switch(this.touches.TWO){case ci.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=te.TOUCH_DOLLY_PAN;break;case ci.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=te.TOUCH_DOLLY_ROTATE;break;default:this.state=te.NONE}break;default:this.state=te.NONE}this.state!==te.NONE&&this.dispatchEvent(Gl)}function P0(i){switch(this._trackPointer(i),this.state){case te.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case te.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case te.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case te.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=te.NONE}}function I0(i){this.enabled!==!1&&i.preventDefault()}function L0(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.ownerDocument.addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function D0(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var Vl={dusk:{name:"\u659C\u9633",time:"17:20",horizon:"#f6caa3",middle:"#adbfc0",zenith:"#52778f",cloud:"#e5bab0",fog:"#8ca6a9",density:.00143,deep:"#123a4f",swell:"#388a94",sun:"#ffd8ae",sky:"#daf0fc",bounce:"#85766d",key:1.76,fill:1.43,lamps:.31},blue:{name:"\u84DD\u65F6",time:"18:42",horizon:"#efa88f",middle:"#647fa5",zenith:"#354775",cloud:"#a599ba",fog:"#6e83a2",density:.00156,deep:"#122a46",swell:"#367588",sun:"#ffcb9f",sky:"#a7c6ef",bounce:"#77717e",key:1.61,fill:1.48,lamps:1.39},night:{name:"\u591C\u73ED",time:"22:10",horizon:"#596789",middle:"#2d456c",zenith:"#152744",cloud:"#525f81",fog:"#405777",density:.00168,deep:"#0d1d33",swell:"#294d6a",sun:"#afc9f0",sky:"#8daedc",bounce:"#5d617d",key:.74,fill:.96,lamps:2.14}},cu=`
float hash2(vec2 v) {
  return fract(sin(dot(v, vec2(127.1, 311.7))) * 43758.5453);
}

float field(vec2 v) {
  vec2 i = floor(v);
  vec2 f = fract(v);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i), hash2(i + vec2(1, 0)), f.x),
             mix(hash2(i + vec2(0, 1)), hash2(i + vec2(1, 1)), f.x), f.y);
}
`,N0=`
varying vec3 direction;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  direction = world.xyz - cameraPosition;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,U0=`
varying vec3 direction;
uniform vec3 horizon;
uniform vec3 middle;
uniform vec3 zenith;
uniform vec3 cloud;
uniform float twilight;

${cu}

void main() {
  vec3 ray = normalize(direction);
  float altitude = max(-.09, ray.y);
  float above = smoothstep(-.042, .139, altitude);
  float zenithAmount = smoothstep(.015, .43, altitude);
  vec3 color = mix(mix(horizon, middle, above), zenith, zenithAmount);

  vec2 pos = vec2(atan(ray.x, -ray.z), altitude);
  float west = pow(max(0.0, dot(normalize(ray.xz), normalize(vec2(-.68, -.73)))), 2.4);
  float glow = exp(-abs(altitude - .030) * 14.0) * west * twilight;
  color += glow * vec3(.15, .065, .035);

  // Two ragged cloud decks with horizontal edges stepped at screen-readable intervals.
  vec2 sampleAt = floor(pos * vec2(410.0, 245.0)) / vec2(410.0, 245.0);
  float veil = field(vec2(sampleAt.x * 5.1 + sampleAt.y * 6.0, sampleAt.y * 45.0 + .72));
  veil = veil * .71 + field(vec2(sampleAt.x * 16.0, sampleAt.y * 177.0)) * .29;
  float band = smoothstep(.011, .062, altitude) * (1.0 - smoothstep(.13, .28, altitude));
  float streak = smoothstep(.49, .80, veil) * band * (.7 + west * .22);
  vec3 litCloud = mix(cloud, horizon, (.26 + west * .26) * twilight);
  float highSide = smoothstep(.054, .125, sampleAt.y);
  vec3 shadedCloud = mix(litCloud, mix(cloud, zenith, .53), highSide * .72);
  color = mix(color, shadedCloud, streak * .81);

  float highDeck = field(vec2(sampleAt.x * 7.0 - 3.0, sampleAt.y * 57.0 + 14.0));
  highDeck = smoothstep(.67, .83, highDeck) * smoothstep(.19, .23, altitude) * (1.0 - smoothstep(.28, .43, altitude));
  color = mix(color, cloud, highDeck * .18);
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`,F0=`
uniform mat4 reflectionMatrix;
varying vec3 waterPosition;
varying vec4 reflectionPosition;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  waterPosition = world.xyz;
  reflectionPosition = reflectionMatrix * world;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,O0=`
uniform sampler2D mirrorMap;
uniform vec2 reflectionPixel;
uniform vec3 deep;
uniform vec3 swell;
uniform vec3 horizon;
uniform vec3 skyTint;
uniform float twilight;
uniform float clockTime;
uniform vec4 wakes[2];
varying vec3 waterPosition;
varying vec4 reflectionPosition;

${cu}

float wake(vec2 pos, vec4 boat, float span, float offset) {
  vec2 vector = boat.zw;
  vec2 away = pos - boat.xy + vector * offset;
  float dist = -dot(away, vector);
  float side = abs(dot(away, vec2(vector.y, -vector.x)));
  float trail = smoothstep(-.5, 1.7, dist) * (1.0 - smoothstep(span * .32, span, dist));
  float arms = exp(-pow((side - .204 * dist - 1.15) / (.55 + dist * .017), 2.0));
  arms *= .5 + .5 * sin(dist * .62 - clockTime * 1.9);
  float wash = exp(-pow(side / (1.00 + dist * .088), 2.0)) * (1.0 - smoothstep(6.0, span * .70, dist));
  return trail * (arms * .81 + wash * .64);
}

void main() {
  vec2 world = waterPosition.xz;
  vec3 toEye = cameraPosition - waterPosition;
  float distanceToEye = length(toEye);
  vec3 look = normalize(toEye);
  vec2 cell = floor(world * vec2(1.25, 1.7)) / vec2(1.25, 1.7);
  vec2 p = mix(cell, world, smoothstep(385.0, 680.0, distanceToEye));
  float phase = clockTime * .70;

  float shallowRidges = field(p * vec2(.09, .50) + vec2(-phase * .04, phase * .17));
  float crossed = field(vec2(p.x * .23 + p.y * .025, p.y * .99 - phase * .23));
  float groups = field(p * vec2(.026, .125) + vec2(phase * .055, phase * .075));
  float ridges = smoothstep(.61, .86, shallowRidges * .68 + crossed * .32);
  float fold = sin(p.y * .67 + p.x * .092 + phase + groups * 6.4);
  float shoal = field(p * vec2(.012, .021));
  float crests = smoothstep(.65, .93, .55 * shallowRidges + .33 * crossed + .12 * (fold * .5 + .5));
  vec3 color = mix(deep, swell, .24 + shallowRidges * .24 + groups * .25 + shoal * .09);
  color += swell * fold * .035;
  color += swell * ridges * .26 + skyTint * crests * .21;

  vec2 mapped = reflectionPosition.xy / reflectionPosition.w * .5 + .5;
  mapped += vec2((crossed - .5) * .008, (shallowRidges - .5) * .006) * (1.0 - look.y * .53);
  vec2 safe = clamp(mapped, reflectionPixel, 1.0 - reflectionPixel);
  vec3 mirror = texture2D(mirrorMap, safe).rgb * .62;
  mirror += texture2D(mirrorMap, safe + vec2(reflectionPixel.x * 1.55, 0)).rgb * .19;
  mirror += texture2D(mirrorMap, safe - vec2(reflectionPixel.x * 1.55, 0)).rgb * .19;
  float offscreen = smoothstep(.0, .035, min(min(mapped.x, 1.0 - mapped.x), min(mapped.y, 1.0 - mapped.y)));
  mirror = mix(mix(horizon, skyTint, smoothstep(-.035, .29, look.y)), mirror, offscreen);
  float fresnel = pow(1.0 - max(0.0, look.y), 2.25);
  color = mix(color, mirror, (.30 + .59 * fresnel) * (.77 + groups * .44));

  float glint = pow(max(0.0, dot(normalize(look.xz), normalize(vec2(.68, .73)))), 26.0);
  color += horizon * glint * ridges * pow(1.0 - look.y, 1.7) * twilight * .21;

  float walls = exp(-abs(p.x - 96.0) * .23) * step(-170.0, p.y) * step(p.y, 93.0) * step(p.x, 96.0);
  walls += exp(-abs(p.x + 106.0) * .21) * step(-172.0, p.y) * step(p.y, 23.0) * step(-106.0, p.x);
  color *= 1.0 - walls * .34;
  color += walls * ridges * swell * .17;

  float propwash = wake(p, wakes[0], 44.0, 5.70) + wake(p, wakes[1], 37.0, 8.3);
  float bubbles = smoothstep(.20, .71, .58 * shallowRidges + .42 * crossed);
  vec3 foam = mix(swell * 1.62 + skyTint * .26, vec3(.49, .69, .68), twilight * .51);
  color = mix(color, foam, min(.86, propwash * (bubbles * .81 + ridges * .38)));

  color = mix(color, mix(skyTint, horizon, .21), .76 * smoothstep(760.0, 2200.0, distanceToEye));
  gl_FragColor = vec4(max(color, vec3(0)), 1.0);
  #include <colorspace_fragment>
}
`,B0=`
varying vec2 pixel;
void main() {
  pixel = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,z0=`
uniform vec3 paint;
uniform float opacity;
varying vec2 pixel;
void main() {
  vec2 square = (floor(pixel * 52.0) + .5) / 26.0 - 1.0;
  float falloff = 1.0 - smoothstep(.12, 1.0, length(square));
  gl_FragColor = vec4(paint, opacity * falloff * falloff);
  #include <colorspace_fragment>
}
`;function hu(i,t,e){let n={horizon:{value:new It},middle:{value:new It},zenith:{value:new It},cloud:{value:new It},twilight:{value:1}},s=new Re(new Xs(2400,24,12),new ze({side:Le,depthWrite:!1,vertexShader:N0,fragmentShader:U0,uniforms:n}));s.frustumCulled=!1,s.renderOrder=-10,i.add(s);let r={mirrorMap:{value:e},reflectionMatrix:{value:new se},reflectionPixel:{value:new Nt},deep:{value:new It},swell:{value:new It},horizon:{value:new It},skyTint:{value:new It},twilight:{value:1},clockTime:{value:0},wakes:{value:[new oe,new oe]}},o=new Re(new wn(5e3,5e3),new ze({vertexShader:F0,fragmentShader:O0,uniforms:r}));o.rotation.x=-Math.PI/2,o.position.y=.015,i.add(o);let a=new wn(1,1),l=t.map(({x:h,y:f,z:g,w:v,d:m,color:d,strength:M})=>{let T=new Re(a,new ze({uniforms:{paint:{value:new It(d)},opacity:{value:0}},vertexShader:B0,fragmentShader:z0,transparent:!0,depthWrite:!1,blending:Ei,side:on}));return T.rotation.x=-Math.PI/2,T.position.set(h,f,g),T.scale.set(v,m,1),i.add(T),{pond:T,strength:M}});function c(h){for(let f of["horizon","middle","zenith","cloud"])n[f].value.copy(h[f]);for(let f of["horizon","deep","swell"])r[f].value.copy(h[f]);r.skyTint.value.copy(h.middle),n.twilight.value=r.twilight.value=h.twilight;for(let{pond:f,strength:g}of l){let v=(h.lamps-.28)*g*.35;f.visible=v>.035,f.material.uniforms.opacity.value=v}}function u(h,f){let[g,v]=r.wakes.value;g.set(h.pilot.x,h.pilot.z,Math.sin(h.pilot.yaw),Math.cos(h.pilot.yaw)),v.set(h.tug.x,h.tug.z,Math.sin(h.tug.yaw),Math.cos(h.tug.yaw)),r.clockTime.value=f}function p(h,f,g){r.reflectionMatrix.value.multiplyMatrices(h.projectionMatrix,h.matrixWorldInverse),r.reflectionPixel.value.set(1/f,1/g)}return{sea:o,setMood:c,updateWater:u,setProjection:p}}function ua(i){let t=Vl[i],e={};for(let n of["horizon","middle","zenith","cloud","fog","deep","swell","sun","sky","bounce"])e[n]=new It(t[n]);return{...e,density:t.density,key:t.key,fill:t.fill,lamps:t.lamps,twilight:i==="night"?.07:i==="blue"?.61:1}}function kl(i,t,e,n){for(let s of["horizon","middle","zenith","cloud","fog","deep","swell","sun","sky","bounce"])i[s].lerpColors(t[s],e[s],n);for(let s of["density","key","fill","lamps","twilight"])i[s]=t[s]+n*(e[s]-t[s])}var De=class i{solids=[];lights=[];box(t,e,n,s,r,o,a,l=0){(l?this.lights:this.solids).push({x:t,y:e,z:n,w:s,h:r,d:o,color:a,glow:l})}translate(t,e,n){let s=new i;for(let r of[...this.solids,...this.lights])s.box(r.x+t,r.y+e,r.z+n,r.w,r.h,r.d,r.color,r.glow);return s}},N={steel:"#adb2ac",zinc:"#d6d7c9",zincLight:"#e0dacf",graphite:"#283640",asphalt:"#44494a",road:"#333b42",concrete:"#766f65",coping:"#b6a796",stripe:"#e6cba1",yellow:"#d5a54d",dockDark:"#423e3d",ballast:"#596561",rubber:"#263033",red:"#b34a38",redDark:"#6e3138",redLight:"#ea805d",gantry:"#be8a38",gantryLight:"#e4b361",white:"#dfdcd0",window:"#284a58",glass:"#49717a",navy:"#233846",rust:"#963d39",copper:"#b86649",orange:"#e98547",cream:"#ddc9a7",amber:"#ffe093",ice:"#a9eff8",greenLight:"#80efae",marker:"#ff6155"},Hn=[["#71333d","#a44f49","#bf6860"],["#a44c36","#ce7547","#e9a36c"],["#2e515f","#427b8b","#6ca6ae"],["#3b665e","#588e79","#82af96"],["#8a8270","#b8ae93","#d8c9a6"],["#4d4d5b","#626576","#858693"],["#a7773f","#c49752","#dab673"]];function xn(i){let t=i>>>0;return()=>(t=Math.imul(1664525,t)+1013904223>>>0,t/4294967296)}function yn(i,t){return i[Math.floor(t()*i.length)]}function Hl(i,t){let e=Math.imul(i,2120969693)^Math.imul(t,5862347);return((e^e>>>13)>>>0)/4294967296}function An(i,t,e,n,s,r=n,o=0){let a=e.map((h,f)=>h-t[f]),l=a.map(Math.abs).indexOf(Math.max(...a.map(Math.abs))),c=Math.ceil(Math.abs(a[l])/r),u=null,p=(h,f)=>{let g=h.map((m,d)=>Math.min(m,f[d])-n/2),v=h.map((m,d)=>Math.abs(m-f[d])+n);i.box(...g,...v,s,o)};for(let h=0;h<=c;h++){let f=c?h/c:0,g=t.map((v,m)=>Math.round((v+a[m]*f)/r)*r);u&&g.every((v,m)=>m===l||v===u.last[m])?u.last=g:(u&&p(u.first,u.last),u={first:g,last:g})}p(u.first,u.last)}var G0={0:["111","101","101","101","111"],1:["010","110","010","010","111"],2:["111","001","111","100","111"],3:["111","001","111","001","111"],4:["101","101","111","001","001"],5:["111","100","111","001","111"],6:["111","100","111","101","111"],7:["111","001","010","010","010"],8:["111","101","111","101","111"],9:["111","101","111","001","111"],A:["010","101","111","101","101"],B:["110","101","110","101","110"],C:["111","100","100","100","111"],D:["110","101","101","101","110"],E:["111","100","110","100","111"],F:["111","100","110","100","100"],G:["111","100","101","101","111"],H:["101","101","111","101","101"],I:["111","010","010","010","111"],K:["101","110","100","110","101"],L:["100","100","100","100","111"],N:["101","111","111","111","101"],O:["111","101","101","101","111"],P:["111","101","111","100","100"],R:["110","101","110","101","101"],S:["111","100","111","001","111"],T:["111","010","010","010","010"],U:["101","101","101","101","111"],W:["101","101","111","111","101"],Y:["101","101","010","010","010"],"-":["000","000","111","000","000"]};function cn(i,t,e,n,s,r,o,a,l=0){let c=Math.max(.045,o*.14);for(let u=0;u<r.length;u++){let p=G0[r[u]];if(p)for(let h=0;h<5;h++)for(let f=0;f<3;f++){if(p[h][f]==="0")continue;let g=(u*4+f)*o,v=(4-h)*o;t==="west"&&i.box(e-c,n+v,s+g,c,o,o,a,l),t==="east"&&i.box(e,n+v,s-g-o,c,o,o,a,l),t==="south"&&i.box(e+g,n+v,s,o,o,c,a,l),t==="ground"&&i.box(e+g,n,s-v-o,o,c,o,a,l)}}}function Wn(i,t,e,n,s,r,{ribs:o=!0,lettering:a=""}={}){let[u,p,h]=r;if(i.box(t,e,n,2.45,2.36,s,p),i.box(t+.09,e+2.36-.02,n+.1,2.45-.18,.075,s-.2,h),o){for(let f=.37;f<s-.21;f+=.46)i.box(t-.05,e+.17,n+f,.085,2.36-.33,.1,u),i.box(t+.18,e+2.36+.049,n+f,2.45-.36,.038,.11,p);for(let f of[.33,.93,1.53,2.12])i.box(t+f,e+.22,n+s,.06,2.36-.37,.1,h)}for(let f of[-.025,2.45-.14])for(let g of[-.025,s-.135])i.box(t+f,e+.02,n+g,.165,2.36-.035,.165,u),i.box(t+f,e+2.36-.01,n+g,.165,.1,.165,h);a&&cn(i,"west",t-.055,e+.84,n+.65,a,.145,"#d9cbb2")}function Xn(i,t,e,n,s,r=1){i.box(t-.28,e,n-.28,.56,.24,.56,N.graphite),i.box(t-.19,e+.24,n-.19,.38,.32,.38,s,r),i.box(t-.23,e+.56,n-.23,.46,.12,.46,N.zinc)}var vn={z:-68,deckY:32.5,towers:[-108,102]};function Wl(i,t,e,n,s,r,o,a){let l=Math.round(s*1.05)*.5,c=s*2;i.box(t-s,e,n-s+l,c,r,c-l*2,a),i.box(t-s+l,e,n-s,c-l*2,r,l,o),i.box(t-s+l,e,n+s-l,c-l*2,r,l,o)}function V0(i,t){let{z:e,deckY:n}=vn;i.box(t-7.2,-.92,e-7.23,14.4,4.3,14.46,"#7b7970"),i.box(t-5.88,3.37,e-5.92,11.76,3.35,11.84,"#a09887");for(let s=6.72;s<94;s+=1.5){let r=(s-6.72)/87.28,o=Math.round((5.24-3.59*r+.06*Math.sin(r*Math.PI*2))*4)/4,a=s>65.1,l=Math.floor(s/1.5)%7===1,c=a?l?"#a9b8bb":"#c3cdca":l?"#c4baa8":"#cec7b6";Wl(i,t,s,e,o,Math.min(1.5,94.02-s),c,a?"#a5b7b9":"#b7af9e"),s>n+7.5&&(i.box(t-.145,s,e+o-.006,.29,1.4,.095,a?"#e3c6a7":"#cebeab"),a&&i.box(t-.13,s+.04,e+o+.083,.26,1.36,.023,"#ffd3a7",.49))}i.box(t-.55,7.3,e+5.22,1.1,2.1,.11,"#867f76"),i.box(t-.79,9.36,e+5.17,1.58,.14,.26,N.zinc),i.box(t-.58,7.03,e+5.15,1.16,.29,.64,"#ada99b"),Wl(i,t,93.95,e,1.89,.88,"#c4c9bc",N.steel),Wl(i,t,94.76,e,1.5,.52,N.zinc,"#939fa0");for(let s of[-1,1])Xn(i,t+s*.95,95.25,e,N.marker,1.14);i.box(t-.1,95.21,e-.1,.2,2,.2,"#a3aca8")}function fu(i,t,e,n,s){let r=e-t;for(let o of[-8.05,2.98]){let a=n+o;i.box(t,s-2.76,a+.19,r,1.47,4.48,"#52636b"),i.box(t,s-1.3,a-.32,r,1.3,5.48,"#8f9793"),i.box(t,s,a-.27,r,.155,5.38,"#555b5e"),i.box(t,s+.13,a+2.32,r,.037,.091,"#cdc3a3");for(let l of[a-.38,a+5.12])i.box(t,s+.04,l,r,.58,.31,"#b8baad"),i.box(t,s+.65,l+.022,r,.075,.12,"#86918c");for(let l=t+1.2;l<e-2.1;l+=6)i.box(l,s+.157,a+2.25,2.3,.035,.13,N.zinc)}}function uu(i,t){let e=t<0?-264:273,n=t<0?68:86,s=vn.deckY;for(let r=0;r<n;r+=2){let o=vn.z-Math.round((r/n)**1.85*(t<0?78:82)*2)/2,a=e+r*t;if(fu(i,t>0?a:a-2,t>0?a+2:a,o,s),r%12===4)for(let l of[-4.25,4.55])i.box(a-1.5,-2.2,o+l-1.46,3,30,2.92,"#808482"),i.box(a-2.26,27.6,o+l-2.01,4.52,2.69,4.02,"#9a9e95")}}function pu(i){let{z:t,deckY:e,towers:n}=vn;fu(i,-264,273,t,e),uu(i,-1),uu(i,1);for(let s=-262;s<=272;s+=9)i.box(s,e-2.42,t-3.22,1.03,1.23,6.44,N.steel),i.box(s+.19,e-2.38,t+7.46,.51,.21,.2,"#aac6c0",.64);for(let s of[-249,-219,-184,-149,144,178,212,243,269]){let r=Math.abs(s)>235?7.4:2.8;for(let o of[-3.15,3.15])i.box(s-2.15,r-1.5,t+o-1.57,4.3,e-r-2,3.14,"#929188"),i.box(s-2.72,e-4.9,t+o-1.91,5.44,2.1,3.82,"#9d9d92")}for(let s of n){V0(i,s);for(let o of[-1,1]){let l=s<0&&o>0||s>0&&o<0?98.4:74.3;for(let c=0;c<13;c++){let u=c/12,p=63+u*29.3,h=s+o*(11.4+u*(l-11.4));for(let f of[-1,1]){let g=[s+o*1.25,p,t+f*1.42],v=[h,e+.69,t+f*4.94];An(i,g,v,.264,c%4===0?"#b7beb4":"#929e9b",.25),i.box(h-.24,e+.52,v[2]-.2,.48,.45,.4,N.steel)}}}let r="#b9e9ef";for(let[o,a]of[[-4.9,2.35],[4.25,3.13],[1.86,5.1]])i.box(s+o,e+.86,t+a,.48,.19,.42,r,.75)}for(let s=-257;s<271;s+=10.2){if(n.some(a=>Math.abs(s-a)<3))continue;let r=s%2>0?1:-1,o=t+r*8.17;i.box(s-.093,e+.63,o-.09,.186,2.91,.18,"#9eaaa7"),i.box(s-.076,e+3.44,Math.min(o,o-r*1.22),.152,.124,1.22,"#afb2a7"),i.box(s-.2,e+3.36,o-r*1.22-.15,.4,.135,.3,"#fff1be",.83)}}function du(i,t,e,n){let s=-21;for(let[r,o,a,l,c]of e){let u=Math.hypot((i-r)/a,(t-o)/l);s=Math.max(s,c*(1-u**1.55))}return Math.round((s+Math.sin(i*.065-t*.045)*3.1+Math.sin(i*.135+t*.082)*1.65+(Hl(Math.round(i),Math.round(t))-.5)*n*.74)/2)*2}function gs(i,t){let{x0:e,x1:n,z0:s,z1:r,step:o,peaks:a,swatches:l,offshore:c=!1}=t,u=Math.max(...a.map(h=>h[4])),p=l;for(let h=e;h<n;h+=o)for(let f=s;f<r;f+=o){let g=du(h+o*.5,f+o*.5,a,o);if(g<1)continue;let v=h+o/2,m=f+o/2,d=Hl(h,f),M=c?Math.floor(g/u*2):+(g>13)+ +(g>40),T=p[Math.min(p.length-2,Math.max(0,M))+ +(d>.74)],S=g;for(let[E,_]of[[o,0],[-o,0],[0,o],[0,-o]])S=Math.min(S,du(v+E,m+_,a,o));let A=Math.max(-2,S-(c?1:2.05));if(i.box(h,A,f,o,g-A,o,T),!c&&g>6&&d>.6){let E=d>.83?"#344f46":"#2e4842";i.box(h+.35,g-.08,f+d,o*.78,o*.36,o*.61,E),d>.79&&i.box(h+1.13,g+o*.32,f+.8,o*.42,o*.25,o*.41,E)}}}var k0=[["#a9a499","#8a9191","#83817f"],["#b3aaa6","#887d82","#797b83"],["#919d9d","#728388","#687981"],["#a9a493","#85877d","#7e857f"]];function H0(i,t,e,n,s,r,o,a,l=2.8){let[c,u,p]=yn(k0,a),h=Math.min(5.1,n*.16);i.box(t-.55,l,e-.7,s+1.1,h,r+1.4,u),i.box(t,l+h,e,s,n-h,r,c),i.box(t-.14,l+n-1.16,e-.14,s+.28,1.24,r+.28,p),i.box(t+s*.41,l+n,e+r*.26,s*.42,2.45,r*.47,u),n>49&&(i.box(t+s*.7,l+n+2.45,e+r*.47,.24,2.5,.24,N.steel),i.box(t+s*.7-.1,l+n+4.9,e+r*.47-.1,.43,.3,.43,N.marker,.69));let f=Math.max(2,Math.floor(s/1.9)),g=Math.max(2,Math.floor(r/2.3)),v=(n-h-2.4)/o;for(let m of[.31,s*.51,s-.54])i.box(t+m,l+h,e+r+.028,.3,n-h-1,.17,u);for(let m=0;m<o;m++){let d=l+h+.69+m*v,M=m%3===0?"#bbc0b7":u;m%2===0&&i.box(t-.09,d-.39,e+r,s+.18,.12,.19,M);let T=v*.38;i.box(t+.3,d,e+r+.02,s-.6,T,.052,"#52676b"),i.box(t-.085,d,e+.3,.087,T,r-.6,"#546569");for(let S=0;S<f;S++){if(a()<.82)continue;let A=(S+.27)*s/f;i.box(t+A,d+.04,e+r+.07,s/f*.47,T*.78,.065,a()>.3?"#ffc78b":"#a1c5c0",.44+a()*.32)}for(let S=0;S<g;S++){if(a()<.86)continue;let A=(S+.29)*r/g;i.box(t-.12,d+.04,e+A,.08,T*.78,r/g*.48,a()>.42?"#f3ce91":"#a0bcb9",.5)}}}function mu(i,t){gs(i,{x0:-327,x1:-110,z0:-284,z1:-170,step:3.5,peaks:[[-247,-228,90,57,61],[-208,-230,74,57,57],[-154,-239,48,44,39]],swatches:["#3d5650","#3e584e","#405850","#4c6355"]}),gs(i,{x0:189,x1:334,z0:-290,z1:-172,step:3.5,peaks:[[250,-236,64,65,42],[288,-244,67,41,33],[215,-260,43,35,28]],swatches:["#445a54","#445b51","#4b6355","#54695b"]}),gs(i,{x0:248,x1:417,z0:-222,z1:-73,step:3.5,peaks:[[346,-154,67,64,44],[387,-169,46,54,38],[296,-158,55,60,19]],swatches:["#4d6057","#4d6359","#435c50","#50675a"]}),gs(i,{x0:-392,x1:-251,z0:-237,z1:-102,step:3.5,peaks:[[-330,-157,57,49,40],[-292,-200,67,63,55],[-360,-184,49,38,39]],swatches:["#415952","#465e54","#496358","#506960"]}),gs(t,{x0:-590,x1:625,z0:-727,z1:-318,step:6,peaks:[[-450,-551,169,126,80],[-326,-497,177,128,110],[-228,-452,138,111,82],[-124,-445,117,86,61],[-49,-466,95,89,58],[36,-453,100,88,44],[143,-468,125,107,64],[222,-509,140,114,96],[362,-511,158,148,114],[477,-573,169,132,90],[567,-627,172,112,73]],swatches:["#4c6269","#455b65","#4b626b","#526971"],offshore:!0}),gs(t,{x0:-1330,x1:1650,z0:-1153,z1:-681,step:9,peaks:[[-1140,-1004,249,142,85],[-901,-902,241,156,115],[-698,-858,210,145,98],[-511,-883,238,130,146],[-331,-866,171,103,117],[-144,-841,234,147,143],[10,-842,159,110,99],[200,-863,224,156,147],[389,-873,203,154,126],[575,-845,217,140,104],[698,-835,212,136,111],[925,-915,258,161,109],[1180,-950,278,175,134],[1420,-1034,244,146,112]],swatches:["#536775","#556975","#596d7c","#607483"],offshore:!0});let e=xn(81718),n=[{x:-193,z:-175,rows:2,count:5,height:31,step:13.7},{x:-238,z:-203,rows:1,count:4,height:29,step:14.9},{x:105,z:-176,rows:2,count:6,height:36,step:13.8},{x:221,z:-177,rows:2,count:6,height:32,step:15.5},{x:310,z:-229,rows:2,count:7,height:42,step:14.8},{x:89,z:-347,rows:2,count:10,height:34,step:14.5},{x:-273,z:-365,rows:2,count:12,height:27,step:15.6},{x:-44,z:-372,rows:1,count:6,height:29,step:12.9}];for(let{x:o,z:a,rows:l,count:c,height:u,step:p}of n){let h=a<-320?t:i;h.box(o-3,-.56,a-25*(l-1)-5,p*c+5,3.35,24*l,"#676e68");for(let f=0;f<l;f++)for(let g=0;g<c;g++){if(g>0&&e()<.12)continue;let v=u+f*9+Math.round(e()*9)*2.4,m=7.8+e()*4.8,d=8.4+e()*6.2,M=o+g*p+f%2*3.7+e()*1.7,T=a-f*24+e()*2.8;H0(h,M,T,v,m,d,Math.floor(v/2.34),e)}}for(let o=0;o<39;o++){let a=-241+o*3,l=42+Math.floor(o*.28)*1.8;i.box(a,-2.1,l,3.14,2.6,8.18,"#566561"),i.box(a,.48,l+.24,3.08,.9,7.68,"#768071"),o%3===2&&i.box(a+.2,1.37,l+1.22,2.15,.57,5.4,"#899080")}let s=-126,r=67;i.box(s-2.52,-.7,r-2.86,5.04,2.38,5.72,"#5c6761"),i.box(s-1.55,1.65,r-1.55,3.1,4.92,3.1,"#c6c0a9"),i.box(s-1.55,3.22,r-1.55,3.1,1.17,3.1,"#98584d"),i.box(s-1.7,6.52,r-1.7,3.4,.4,3.4,"#beb5a1"),i.box(s-.94,6.91,r-.94,1.88,1.68,1.88,"#9ee8e0",.72),i.box(s-1.16,8.58,r-1.16,2.32,.5,2.32,"#814a46"),Xn(i,s,9.08,r,N.ice,1.12)}var Ut=2.8,Di={z:45,shipX:76,shipY:12.12,truckX:111,truckY:4.15,clearY:25.8,railY:31.05};function Ii(i,t,e,n,s){i.box(t,-5.5,e,n,2,s,"#384b50"),i.box(t,-3.5,e,n,3.95,s,N.dockDark),i.box(t,.45,e,n,1.8,s,N.concrete),i.box(t,2.25,e,n,.55,s,"#666363")}function gu(i,t,e,n,s){let r=xn(8119+n),o=a=>t+e*a;i.box(Math.min(t,o(.72)),2.47,n,.72,.43,s-n,N.coping);for(let a=n+1;a+2<s;a+=3.5){let l=yn(["#8e8377","#8b7d6b","#9a8b77","#756b61"],r),c=r()*.24;i.box(Math.min(t,o(.19)),-1+c,a,.19,3.41-c,3.41,l),i.box(Math.min(t,o(.2)),.12+c,a,.2,.3,3.41,"#5c5751")}for(let a=n+5;a<s-2;a+=7){i.box(Math.min(o(.1),o(1)),-.65,a,.9,2.6,1.15,N.rubber),i.box(Math.min(o(.62),o(1.08)),-.25,a+.16,.46,1.85,.83,"#323b3e");let l=t-e*1.25;i.box(l-.4,2.82,a+1.7,.8,.13,.8,N.dockDark),i.box(l-.17,2.95,a+1.93,.34,.44,.34,N.yellow),i.box(l-.35,3.36,a+1.79,.7,.14,.62,N.yellow)}}function di(i,t,e,n,s,{cross:r=!1,dashed:o=!0}={}){if(i.box(t,Ut,e,n,.037,s,N.road),r){if(i.box(t,Ut+.035,e+.56,n,.025,.13,"#b9a991"),i.box(t,Ut+.035,e+s-.69,n,.025,.13,"#b9a991"),o)for(let a=t+1;a<t+n-2;a+=7)i.box(a,Ut+.035,e+s/2,3.6,.025,.14,N.stripe)}else{for(let a of[t+.55,t+n-.68])i.box(a,Ut+.035,e,.13,.025,s,"#a79171");if(o)for(let a=e+1;a<e+s-2;a+=7)i.box(t+n/2,Ut+.035,a,.14,.025,3.6,N.stripe)}}function Li(i,t,e,n,s=Ut,r=10.3,o=!1){let a=o?N.ice:N.amber;i.box(e-.29,s,n-.29,.58,.2,.58,N.concrete),i.box(e-.12,s+.18,n-.12,.24,r,.24,N.steel);for(let l of[-1,1]){let c=e+l*1.44;i.box(Math.min(e,c),s+r-.22,n-.09,1.44,.2,.18,N.steel),i.box(c-.35,s+r-.4,n-.22,.7,.16,.44,a,.9),i.box(c-.41,s+r-.27,n-.25,.82,.2,.5,N.graphite)}t.push({x:e,z:n,y:s+.1,w:r*2.6,d:r*1.7,color:a,strength:.42})}function _u(i,t,e,n,{scale:s=1,raised:r=!1,noCart:o=!1}={}){let a=Ut,l=s<1?"#546c71":N.red,c=s<1?"#384d57":N.redDark,u=s<1?"#819b98":N.redLight,p=(d,M,T)=>[t+d*s*n,a+M*s,e+T*s],h=(d,M,T,S,A,E,_,b=0)=>{let[O,L,D]=p(d,M,T);i.box(n===1?O:O-S*s,L,D,S*s,A*s,E*s,_,b)},f=(d,M,T,S,A=.5)=>{An(i,p(...d),p(...M),T*s,S,A*s)};for(let d of[-6.1,6.1]){for(let M of[-9,9]){h(M-1.14,.08,d-1.66,2.28,1.24,3.32,c),h(M-.93,1.22,d-.81,1.86,13.5,1.62,l),h(M-.78,2,d-.89,.19,12.6,.16,u);for(let T of[-1.35,.83])h(M-.7,.1,d+T,1.4,.73,.6,N.graphite);h(M-.75,.57,d-1.69,1.5,.53,.36,N.yellow)}h(-10,13.58,d-.91,20,1.56,1.82,l),f([-9,14.9,d],[-5.7,28.9,d*.49],1.14,l),f([9,14.9,d],[6.2,28.9,d*.49],1.22,l),f([-9,8.3,d],[-3.3,14.5,d],.55,c),f([9,8.3,d],[3.3,14.5,d],.55,c)}for(let d of[-9,9])h(d-.88,12.86,-7.05,1.76,1.77,14.1,c),f([d,7.1,-6.1],[d,13.8,-.4],.54,l),f([d,7.1,6.1],[d,13.8,.4],.54,l);h(-24.5,28.15,-3.68,41,1.45,7.36,c),h(-24.5,29.55,-3.64,41,.46,7.28,l),h(-21.6,30,-3.52,10.4,4.04,7.04,N.zinc),h(-21.9,33.98,-3.82,11,.46,7.64,u),h(-21,31.3,-3.61,3.18,1.83,.15,N.graphite),h(-16.5,31.3,-3.61,3.7,1.5,.15,"#6e817d");for(let d of[-3.5,3.5])f([-8.8,29.7,d],[-1.6,47.7,d*.45],.81,l),f([12,29.7,d],[-1.6,47.7,d*.45],.81,l),f([-21,34,d],[-1.6,47.7,d*.45],.34,c,.32),h(8.22,22.5,d*.78-.22,.8,5.25,.44,l);h(-2.15,47.45,-2.02,1.15,.82,4.04,u),h(-1.8,48.1,-.28,.56,1.16,.56,N.steel),h(-1.88,49.22,-.38,.73,.37,.73,N.marker,.82),h(9.18,24.1,-1.91,3.78,3.16,3.82,N.zinc),h(12.94,25.2,-1.81,.16,1.54,3.61,N.window),h(9.44,25.2,1.91,3.38,1.54,.16,N.window),h(9.05,27.19,-2.14,4.14,.28,4.28,u);for(let d=3;d<28;d+=.76)h(-9.88,d,6.96,.76,.115,.16,N.zinc);let g=r?[30,65]:[60,29],[,v]=g,m=(d,M,T=!1)=>[15.5+(g[0]-15.5)*d,29+(v-29)*d+(T?2.5:0),M];for(let d of[-2.7,2.7]){f(m(0,d),m(1,d),.69,c),f(m(0,d,!0),m(1,d,!0),.54,u),f([-1.6,47.7,d*.63],m(.6,d,!0),.28,N.steel,.25),f([-1.6,47.7,d*.63],m(.88,d,!0),.24,c,.25);let M=r?7:11;for(let T=0;T<M;T++){let S=T/M;if(f(m(S,d),m((T+1)/M,d,!0),.27,l,.29),f(m(S,d),m(S,d,!0),.36,l,.32),T%2===0){let[A,E]=m(S+.025,0);h(A,E-.55,d-.23,.66,.17,.46,N.amber,.8)}}}if(h(g[0]-.46,g[1]-.31,-3.16,.94,1,6.32,l),h(g[0]-.49,g[1]+.68,-.4,.78,.29,.8,N.marker,.82),!o&&!r){h(32.3,27.72,-2.85,3,1,5.7,N.graphite);for(let d of[32.6,35])h(d,23.52,-.95,.11,4.2,.11,N.steel),h(d,23.52,.95,.11,4.2,.11,N.steel);h(32.1,23.25,-1.34,3.62,.41,2.68,N.yellow)}}function da(i,t,e,n,s=Ut){for(let o of[0,n]){for(let a of[0,9.6])i.box(t+o-.65,s+.76,e+a-.55,1.3,10.8,1.1,N.gantry),i.box(t+o-.84,s+.15,e+a-1.2,1.68,1.15,2.4,N.graphite),i.box(t+o-.9,s+1.18,e+a-.97,1.8,.41,1.94,N.gantryLight);i.box(t+o-.6,s+9.95,e-.55,1.2,1.25,10.7,N.gantry),An(i,[t+o,s+6.3,e],[t+o,s+10.4,e+3.8],.45,N.gantry,.38),An(i,[t+o,s+6.3,e+9.6],[t+o,s+10.4,e+9.6-3.8],.45,N.gantry,.38)}for(let o of[0,9.6])i.box(t-.71,s+10.55,e+o-.65,n+1.42,1.32,1.3,N.gantry),i.box(t-.73,s+11.8,e+o-.68,n+1.46,.22,1.36,N.gantryLight);i.box(t+n*.64-1.3,s+10.75,e-.92,2.6,.68,11.44,N.redDark),i.box(t+n-2.13,s+8.76,e+9.6-1,2.25,1.84,2.43,N.zinc),i.box(t+n-1.93,s+9.47,e+9.6+1.427,1.78,.88,.08,N.window);for(let o of[t+.8,t+n-.8])i.box(o,s+10.48,e+9.6-.25,.65,.16,.51,N.amber,.85)}function _s(i,t,e,n,s,r,o,a=!0){let l=xn(o),c=(n-1)*2.84+3.02,u=(s-1)*6.52+6.54;i.box(t-.2,Ut,e-.35,c+.2,.043,u+.7,"#555656");for(let p=0;p<=n;p++)i.box(t-.21+p*2.84,Ut+.04,e-.32,.105,.03,u+.64,"#847968");i.box(t-.25,Ut+.045,e-.4,c+.34,.04,.14,N.yellow),i.box(t-.25,Ut+.045,e+u+.22,c+.34,.04,.14,N.yellow);for(let p=0;p<s;p++){let h=r[p%r.length];for(let f=0;f<n;f++){if(l()<.105&&f!==0)continue;let g=1+Math.floor(l()*(p%2===0?4:3));for(let v=0;v<g;v++){let m=l()<.68?h:yn(r,l);Wn(i,t+f*2.84,Ut+.06+v*2.44,e+p*6.52,6.17,Hn[m],{ribs:a&&(f===0||v===g-1||p===s-1),lettering:a&&f===0&&v===g-1&&p%3===0?"KWT":""})}}}}function Xl(i,t,e,n,s,r,o,a){let l=Ut,c=xn(a);i.box(e-1,l,n-1.5,s+2,.5,r+3,"#888079"),i.box(e,l+.5,n,s,8,r,"#777f7c"),i.box(e,l+6.9,n,s,1.86,r,"#95a19a"),i.box(e,l+1.4,n,s,.65,r,"#845951");for(let u=0;u<5;u++){let p=u*.9;i.box(e-.52+p,l+8.55+u*.37,n-1,s+1.04-p*2,.41,r+2,u%2===0?"#afb4a8":"#a0a69c")}for(let u=1.2;u<r-.4;u+=2.4)i.box(e+4,l+10.43,n+u,s-8,.12,.19,"#777f7e");for(let u=2;u<r-5;u+=7){i.box(e-.11,l+.42,n+u,.3,4.84,4.7,N.graphite);for(let p=1.36;p<5;p+=.47)i.box(e-.18,l+p,n+u+.19,.09,.26,4.34,"#636d6c");i.box(e-.32,l+5.39,n+u-.18,.48,.23,5.04,N.zinc),c()<.68&&(i.box(e-.44,l+5.22,n+u+1.6,.21,.18,1.1,N.amber,.74),t.push({x:e-2.7,z:n+u+2.2,y:l+.065,w:9,d:5,color:N.amber,strength:.26}))}cn(i,"west",e-.04,l+6.6,n+r*.58,o,.31,"#2c3d42")}function W0(i,t){let s=Ut;i.box(146-.55,s,91-.55,12.1,.52,10.1,N.coping),i.box(146,s+.48,91,11,11.5,9,"#a7a699"),i.box(146+.55,s+5.5,91+.75,10.1,2.1,8.5,"#5c6c68"),i.box(146-.82,s+11.65,91-.87,12.64,.56,10.74,"#d1c8b1"),i.box(146-.28,s+12.19,91-.25,11.56,2.62,9.5,N.window),i.box(146-.82,s+14.76,91-.77,12.64,.59,10.5,N.coping),i.box(146+.39,s+15.35,91+.39,10.22,.16,8.22,N.asphalt);for(let r of[-.32,11.12])for(let o=-.21;o<9.18;o+=1.34)i.box(146+r,s+12.19,91+o,.22,2.57,.16,"#dcd1b5"),o>1&&o<7&&i.box(146+r-.045,s+12.49,91+o+.22,.05,1.21,.94,"#ffc88c",.48);for(let r=-.21;r<11.18;r+=1.4)i.box(146+r,s+12.19,91+9.22,.15,2.57,.13,"#dcd1b5"),r>1&&r<10&&i.box(146+r+.21,s+12.5,91+9.255,1.02,1.23,.08,"#d4c897",.52);for(let r=2;r<10;r+=2.135)i.box(146+2.3,s+r,100,3.5,.81,.08,N.glass),i.box(146-.065,s+r,91+1.23,.08,.79,4.18,"#537377");i.box(146+5.1,s+15.31,91+2.45,1.6,.97,1.82,N.graphite),i.box(146+5.78,s+16.25,91+3.17,.24,3.75,.24,N.steel),i.box(146+4.76,s+18.02,91+3.17,2.18,.14,.18,N.zinc),Xn(i,146+5.9,s+20,91+3.3,N.marker,.87),cn(i,"south",146+7.26,s+7.52,91+9.02,"08",.42,N.white),Li(i,t,153,105,Ut,6.2,!0)}function xu(i,t){Ii(i,96,-176,161,268),Ii(i,106,92,151,13),Ii(i,121,105,128,9),Ii(i,257,-147,23,158),Ii(i,-251,-180,145,203),Ii(i,-243,23,122,12),Ii(i,-222,35,86,6),gu(i,96,-1,-166,92),gu(i,-106,1,-169,22);for(let n=109;n<245;n+=4.5){let s=n<121?105:114;i.box(n,-1.05,s,4.36,3.87,.25,yn(["#80796e","#a08d79","#938474"],xn(Math.floor(n*100)))),n%9<4.5&&i.box(n+.9,2.41,s+.14,2.43,.44,.56,N.coping)}let e=xn(12186);for(let n=0;n<180;n++){let s=98+e()*152,r=-161+e()*250;i.box(s,Ut,r,2.6+e()*9.5,.02+e()*.012,1.9+e()*5.8,yn(["#6c6663","#706964","#605e5e","#77706a"],e))}di(i,103,-161,22,253,{dashed:!1}),di(i,130,-156,11,251),di(i,191,-152,12,249),di(i,101,-48,147,7.8,{cross:!0}),di(i,131,76,116,9.9,{cross:!0}),di(i,-139,-159,26,180,{dashed:!1}),di(i,-237,-174,12,198),di(i,-234,-45,122,9,{cross:!0});for(let n of[102.94,121.21,-121.05,-106.8]){let r=n>0?89:16;i.box(n,Ut+.047,-153,.18,.16,r+153,N.graphite),i.box(n+.041,Ut+.201,-153,.105,.044,r+153,N.steel);for(let o=-152;o<r;o+=2.9)i.box(n-.24,Ut+.039,o,.67,.035,.32,N.concrete)}for(let n=-146;n<=88;n+=4.6)i.box(97.35,Ut+.021,n,.19,.027,2.08,N.yellow),n>-19&&n<84&&i.box(99,Ut+.033,n+.24,1.68,.026,.14,N.zinc);cn(i,"ground",97.37,Ut+.035,92,"CT-08",.49,"#cab59a"),cn(i,"ground",107,Ut+.068,50,"45",.37,N.stripe);for(let n=112.5;n<122;n+=1.15)i.box(n,Ut+.049,59.7,.5,.035,3.5,"#c3b294");for(let n of[-9,18,45,72])_u(i,112.2,n,-1,{raised:n===-9,noCart:n===Di.z}),t.push({x:108,z:n,y:Ut+.105,w:38,d:26,color:N.amber,strength:.19});for(let n of[-134,-106,-28,-4])_u(i,-114.5,n,1,{scale:.79,raised:n===-28});for(let n of[-149,-112,-78,-35,10,43,70,96])Li(i,t,143.5,n,Ut,n<-60?9.1:12.9,n===-35||n===70);for(let n of[-139,-109,-49,-20,3.6,31.2,60.5,88.4])Li(i,t,99,n,Ut,6.1,n===31.2||n===88.4);for(let n of[-151,-115,-80,-47,-11,20])Li(i,t,-109.1,n,Ut,5.8,!0);for(let n of[132,180,232])Li(i,t,n,109.2,Ut,8.8);for(let n of[-143,-95,-42,12,58])Li(i,t,203.8,n,Ut,11,n===-42);for(let n of[-141,-107,-64,-20,18])Li(i,t,-145,n,Ut,10.4);_s(i,148,-32,6,15,[1,2,2,4,0,6,2,3,1,4],4513),_s(i,170,-32,6,15,[3,4,1,2,0,0,4,5,3,6],9939),_s(i,149,-151,12,12,[2,4,1,3,4,0,1,2],1235,!1),_s(i,-172,-30,8,8,[0,2,1,4,0,5],5013),_s(i,-206,-128,18,12,[4,3,2,1,0,6],2173,!1),_s(i,209,-59,12,7,[4,1,0,2,6,2],5524,!1),da(i,146.9,34.2,20.15),da(i,168.9,-14.6,20.15),da(i,147.5,-117.7,36.6),da(i,-173.2,-3,23.5),Xl(i,t,208.9,8.2,37,63,"HUB 08",4668),Xl(i,t,208.9,-133.9,42,60,"KWT",9194),Xl(i,t,-236,-27.3,45,45,"CT-09",9877),W0(i,t);for(let[n,s,r]of[[121.2,15.3,112.3],[169,27.6,112.3],[216,24.5,112.3]]){i.box(n,Ut+.86,r,s,.15,.16,N.yellow);for(let o=n;o<n+s;o+=1.91)i.box(o,Ut,r,.13,.9,.15,N.yellow),i.box(o-.19,Ut+.017,r-.16,.48,.09,.5,N.dockDark);i.box(n+.46,Ut+.62,r-2.29,3.24,1.05,1.64,"#6a7c78"),i.box(n+.34,Ut+1.65,r-2.39,3.47,.15,1.85,"#939d8e"),i.box(n+.68,Ut+.93,r-.6,2.2,.52,.04,"#617174"),i.box(n+3.02,Ut+1.21,r-.58,.22,.2,.035,N.amber,.86)}for(let n of[-155,-108,-42,11,67])i.box(126,Ut,n,2,2.1,1.4,"#637e7d"),i.box(126+.29,Ut+.24,n+1.4,1.42,1.6,.08,"#8d9990"),i.box(126-.12,Ut+2.05,n-.09,2.24,.16,1.6,N.zinc)}function fa(i,t,e,n,s,r=!1){i.box(t-1.22,e+.55,n-4.1,2.44,.43,9.1,N.graphite),i.box(t-1.17,e+1,n+2.29,2.34,2.02,2.67,s),i.box(t-1.2,e+2.31,n+4.93,2.4,.56,.108,N.window),i.box(t-1.225,e+2.16,n+3.12,.1,.64,1.2,N.window),i.box(t-.91,e+1.32,n+4.98,1.82,.27,.14,N.graphite);for(let o of[-1,1]){i.box(t+o*.88-.22,e+1.6,n+5,.43,.23,.12,N.ice,.66),i.box(t+o*.96-.12,e+.98,n-4.2,.22,.16,.12,N.marker,.55);for(let a of[-3.45,-2.24,1.95,4.11])i.box(t+o*1.01-.19,e,n+a-.41,.38,.87,.82,N.rubber),i.box(t+o*1.21-.045,e+.25,n+a-.19,.09,.34,.38,N.steel)}i.box(t-1.22,e+.96,n-4.1,2.44,.39,6.6,"#787264"),r&&Wn(i,t-1.225,e+1.35,n-3.98,6.19,Hn[2])}function yu(){return{chassis(i){i.box(-1.1,-.55,-2.96,2.2,.76,5.92,N.graphite),i.box(-.8,.19,-2.59,1.6,.38,5.18,N.zinc);for(let t of[-2.42,2.03])i.box(-1.38,-.23,t,2.76,.49,.43,N.redDark)},frame(i){i.box(-1.42,-.2,-3.32,2.84,.38,6.64,N.yellow),i.box(-.36,.19,-2.9,.72,.5,5.8,"#916344");for(let t of[-3.24,2.83])i.box(-1.54,-.4,t,3.08,.3,.41,N.gantryLight);i.box(-.17,.04,3.3,.34,.2,.08,N.greenLight,.9)}}}var ql={x:76,z:34.5},X0=["#683036","#863939","#b5564b","#333743","#253542","#364958"];function Zl(i,t,e,n,s=X0){let r=t>50?1.25:.5,o=[[-n*.48,-n*.28,.62,s[0]],[-n*.28,-n*.06,.85,s[1]],[-n*.06,n*.22,.94,s[2]],[n*.22,n*.35,1,s[3]],[n*.35,n*.88,1,s[4]],[n*.88,n,1.025,s[5]]],a=[];for(let l=-t/2;l<t/2-1e-4;l+=r){let c=(l+r*.5)/t+.5,u=c<.135?.48+.52*Math.pow(c/.135,.55):1,p=c>.77?Math.pow(Math.max(.008,(1-c)/.23),.61):1;a.push({z:l,half:e/2*u*p})}for(let[l,c,u,p]of o){let h=a[0].z,f=0;for(let g of[...a,{z:t/2,half:0}]){let v=t>50?.25:.125,m=Math.max(v,Math.round(g.half*u/v)*v);(m!==f||g.half===0)&&(f!==0&&i.box(-f,l,h,f*2,c-l,g.z-h,p),h=g.z,f=m)}}return a}function ur(i,t,e,n,s,r="#c1c5b5"){i.box(t-.066,e+.62,n,.132,.11,s-n,r),i.box(t-.047,e+.34,n,.094,.075,s-n,r);for(let o=n;o<s-.08;o+=1.63)i.box(t-.077,e,o,.154,.66,.13,r)}function q0(i,t,e,n,s){for(let r=0;r<11;r++)i.box(t,e+r*.245,n+s*r*.32,.88,.14,.38,"#888b7d");An(i,[t-.06,e+.71,n],[t-.06,e+3.17,n+s*3.25],.12,N.zinc,.16)}function Yl(i,t,e,n){i.box(-e/2,n,t-1.1,e,.39,2.2,"#54564d"),i.box(-e*.31,n+.39,t-.62,e*.62,.79,1.24,"#7e513f");for(let r=-1;r<2;r++)i.box(r*e/4-.2,n+.75,t-.77,.4,.82,1.54,N.graphite);let s=e*.38;for(let r of[-1,1])i.box(r*s-.35,n+.39,t-.8,.7,.63,1.6,N.rust),i.box(r*s-.25,n+1.02,t-.68,.5,.16,1.36,N.steel)}function Y0(i){i.box(-8.85,7.24,-47.3-7.7,17.7,2.22,15.4,"#b8b9aa"),i.box(-6.85,7.24+2.14,-47.3-6.2,13.7,9.72,13.96,"#d8d6c6");for(let s=0;s<5;s++){let r=9.690000000000001+s*1.77;i.box(-7.18,r,-47.3-6.52,14.36,.15,14.64,N.white);for(let o of[-1,1])for(let a=0;a<7;a++)i.box(o*6.85-.05,r+.42,-47.3-5.72+a*1.8,.11,.57,1.04,N.window);for(let o=0;o<9;o++){let a=-6.15+o*1.37;i.box(a,r+.41,-47.3+7.735,.93,.57,.09,N.window),(s+o*2)%5===2&&i.box(a+.1,r+.49,-47.3+7.831,.72,.4,.04,N.amber,.63)}}let n=7.24+11.85;i.box(-10.4,n,-47.3-4.9,20.8,.45,11.9,"#b6b9ad"),i.box(-9.36,n+.39,-47.3-4.28,18.72,2.15,10.6,"#405b65"),i.box(-9.86,n+2.54,-47.3-4.82,19.72,.52,11.45,N.white),i.box(-8.9,n+3.06,-47.3-4.31,17.8,.2,10.38,N.steel);for(let s=0;s<15;s++){let r=-9.27+s*1.31;i.box(r,n+.36,-47.3+6.33,.16,2.13,.15,N.zinc),s%4<2&&i.box(r+.2,n+.8,-47.3+6.334,1.05,1.14,.07,"#acd1c6",.59)}for(let s of[-1,1]){for(let o=0;o<7;o++)i.box(s*9.39-.065,n+.39,-47.3-4.11+o*1.49,.13,2.18,.13,N.zinc);i.box(s*10-.27,n+1.01,-47.3+4.96,.54,.42,.43,s<0?N.marker:N.greenLight,1.2),ur(i,s*10.28,n+.42,-47.3-4.5,-47.3+7,N.white);let r=s*8.22;i.box(r-1.07,7.24+5.28,-47.3-1.63,2.14,.62,5.72,N.rust),i.box(r-1.23,7.24+5.9,-47.3-2.15,2.46,.8,6.6,N.orange),i.box(r-.84,7.24+6.69,-47.3-1.8,1.68,.51,5.64,"#eea166"),i.box(r-.81,7.24+6.74,-47.3+1.43,1.62,.24,1.33,N.window),q0(i,s*7.9-.43,7.24+2.2,-47.3+6.28,-1)}i.box(-2.46,7.24+9.82,-47.3-9.61,4.92,5.96,3.81,"#994439"),i.box(-2.55,7.24+13.45,-47.3-9.69,5.1,.64,3.97,"#d0bea0"),i.box(-2.49,7.24+14.1,-47.3-9.65,4.98,1.71,3.87,N.graphite);for(let s of[-1.24,.55])i.box(s,7.24+15.75,-47.3-8.64,.66,.52,.57,"#848882");i.box(-.28,7.24+14.96,-47.3+1.11,.55,4.86,.53,N.zinc),i.box(-2.12,7.24+18.15,-47.3+1.16,4.22,.26,.45,N.zinc),i.box(-1.28,7.24+18.51,-47.3+1.22,2.56,.27,.32,N.graphite),i.box(-.11,7.24+19.73,-47.3+1.24,.22,2.14,.19,N.zinc),i.box(-.23,7.24+21.74,-47.3+1.12,.44,.35,.43,N.ice,1.06),Xn(i,-5.92,n+3.2,-47.3-3.6,N.marker,.72)}function vu(){let i=new De,t=7.24,e=128,s=Zl(i,e,22,t);for(let{z:a,half:l}of s){if(l<1.3)continue;let c=Math.max(1.3,Math.floor(l*4)/4-.45);if(i.box(-c,t,a,c*2,.038,Math.min(1.25,e/2-a),"#59655e"),a>40||a<-52)for(let u of[-1,1])i.box(u*c-.13,t,a,.26,.57,Math.min(1.25,e/2-a),N.steel)}for(let a of[-1,1]){ur(i,a*10.87,t,-44.8,39,"#bac0ae"),i.box(a*11-.16,t-.55,-45,.32,.24,83,N.steel),i.box(a*11.04-.059,2.22,-43.6,.12,.41,78.2,"#a6534b"),i.box(a*10.27-.11,t+.03,-37.3,.22,.034,78.55,N.yellow);for(let l of[-49,48.3,55.83]){let c=a*(l>52?4.8:7.4);i.box(c-.53,t+.05,l-.64,1.06,.17,1.28,N.zinc),i.box(c-.32,t+.21,l-.46,.64,.61,.92,N.graphite),i.box(c-.46,t+.78,l-.57,.92,.16,1.14,N.redDark)}}cn(i,"west",-11.01,3.14,-8.6,"TIDEWAY",.58,"#ddcdb0"),cn(i,"east",11.009,3.15,1.5,"TIDEWAY",.58,"#ddcdb0"),cn(i,"ground",-4.99,t+.04,59.48,"KW-08",.46,"#d3cbb0");let r=xn(750314),o=[2,2,4,0,3,1,1,4,5,6,0,2];for(let a=0;a<8;a++){let c=Di.z-ql.z+(a-7)*6.7-3.09;i.box(-9.84,t+.04,c-.15,19.68,.09,6.49,"#824d47"),i.box(-9.82,t+.129,c-.25,19.64,.065,.16,"#bc7861");for(let u=-3;u<=3;u++){let p=u*2.72,h=a===7&&u===0?2:2+Math.floor(r()*(Math.abs(u)===3?2:4))-+(a===7&&Math.abs(u)>1);for(let f=0;f<h;f++){let g=r()<.55?o[a]:yn([0,1,2,3,4,6],r);Wn(i,p-1.225,t+f*2.44,c,6.18,Hn[g],{ribs:Math.abs(u)===3||f===h-1||a===7,lettering:u===-3&&(a+f)%4===0?"TWL":""})}}}for(let a=0;a<4;a++){let l=14.06+a*6.6;for(let c=-2;c<=3;c++){let u=1+Math.floor(r()*(a===0?4:3));for(let p=0;p<u;p++){let h=p===u-1?[4,2,1,0][a]:yn([0,1,2,3,4],r);Wn(i,c*2.72-1.225,t+p*2.44,l,6.18,Hn[h],{ribs:c===-2||p===u-1,lettering:c===-2&&p===u-1?"TWL":""})}}}Y0(i),Yl(i,50.59,12.1,t),Yl(i,-59.32,9.5,t),i.box(-.25,t,59.8,.48,3.59,.48,N.steel),i.box(-.75,t+2.68,59.91,1.58,.19,.22,N.zinc),i.box(-.2,t+3.55,59.85,.38,.53,.37,N.ice,.8);for(let[a,l,c]of[[52.28,21.25,52.8],[-50.9,21.25,-52.8]])An(i,[8.02,8.08,a],[l,3.27,c],.24,"#b5a18a",.24),An(i,[8.18,8.08,a+.36],[l,3.27,c+6.1],.19,"#857765",.24);return i.translate(ql.x,0,ql.z)}function Mu(){let i=new De,t=4.3;Zl(i,72,13,t,["#542f35","#844640","#ad6954","#435248","#355453","#527366"]),ur(i,-6.42,t,-25,25.3,"#b6bfb3"),ur(i,6.42,t,-25,25.3,"#b6bfb3");let e=xn(87168);for(let n=0;n<7;n++)for(let s=-2;s<2;s++){let r=2+Math.floor(e()*2);for(let o=0;o<r;o++)Wn(i,s*2.62,t+o*2.42,-18.5+n*6.3,6,Hn[yn([0,2,3,4,6],e)],{ribs:!1})}i.box(-5,t,-32,10,1.69,10.6,N.zinc),i.box(-4.27,t+1.6,-31.4,8.54,5.09,9.19,N.white),i.box(-4.8,t+6.54,-31.9,9.6,2.13,9.95,N.window),i.box(-5.2,t+8.65,-32.13,10.4,.44,10.41,N.zinc);for(let n=-4.6;n<4.45;n+=1.31)i.box(n,t+6.53,-21.925,.12,2.13,.13,N.white),n>-.9&&n<3.9&&i.box(n+.15,t+7.02,-21.914,1.05,.81,.11,N.amber,.57);return i.box(-.18,t+9.03,-27,.36,3.92,.36,N.steel),i.box(-1.23,t+11.81,-26.91,2.46,.21,.19,N.zinc),Xn(i,0,t+12.9,-26.8,N.ice,.76),Yl(i,29.8,6.75,t),cn(i,"west",-6.51,2.15,-12,"TSING",.38,N.white),i.translate(-92.5,0,-112)}function Jl(i){let t=new De,e=i==="tug",n=e?20:14,s=e?7.3:4.5,r=e?2.25:1.37;Zl(t,n,s,r,e?["#543d3e","#733f39","#a04c3b","#433e44","#334653","#58625b"]:["#60363c","#8a493d","#b9664d","#2d3a47","#384957","#c08356"]);let o=r;t.box(-s*.47,o,-n*.4,s*.94,.18,n*.73,"#535e59"),t.box(-s*.35,o+.14,-1.7,s*.7,e?3.64:2.13,e?6.1:4.37,N.white);let a=e?5.86:3.5;t.box(-s*.39,a,-1.88,s*.78,e?1.46:.99,e?6.23:4.7,N.window);let l=a+(e?1.46:.99),c=e?4.39:2.86;t.box(-s*.42,l,-2.04,s*.84,.38,c+2.23,e?"#c88e58":"#d6bf9d");for(let p=-s*.37;p<s*.37;p+=s*.18)t.box(p,a,c+.005,.13,l-a,.115,N.zinc),p>-1.15&&p<1.2&&t.box(p+.18,a+.21,c+.016,s*.12,.51,.06,N.amber,.68);for(let p of[-1,1]){ur(t,p*s*.455,o+.1,-n/2+1.88,n/2-2.6,"#b9bdb0"),t.box(p*s*.42-.12,l-.87,.42,.26,.23,.38,p===-1?N.marker:N.greenLight,1.08);for(let h=-n*.38;h<n*.26;h+=e?2.1:2.2)t.box(p*s*.513-.17,o-.7,h,.34,.76,.77,N.rubber)}t.box(-.17,l+.3,.52,.34,e?3.62:2.18,.34,N.steel),t.box(-1.12,l+(e?3.35:1.98),.59,2.26,.16,.15,N.zinc);let u=l+(e?3.92:2.41);return t.box(-.135,u,.5,.27,.33,.29,N.ice,1.08),e?(t.box(-1.75,o+.16,-6.63,3.5,.67,2.2,N.redDark),t.box(-.72,o+.63,-6.55,1.44,.72,1.73,N.steel),t.box(1.65,l-1.35,-2.46,.86,1.6,1.24,N.graphite)):cn(t,"west",-s*.513,o-.66,-.7,"P-08",.15,N.white),t}function Su(i){let t=[[-49,143,!0],[45,124,!1],[47,-20,!1],[-53,9,!0],[56,-140,!1],[-47,-144,!0]];for(let[e,n,s]of t){let r=s?"#965343":"#3e7e75",o=s?N.marker:N.greenLight;i.box(e-1.16,-.48,n-1.18,2.32,.88,2.36,N.rubber),i.box(e-.92,.39,n-.91,1.84,.49,1.82,r),i.box(e-.58,.88,n-.56,1.16,.38,1.12,r),i.box(e-.16,1.25,n-.16,.32,1.05,.32,N.steel),Xn(i,e,2.3,n,o,1.2)}}var dr=13.4,fr={harbor:{name:"\u5168\u6E2F",en:"The approaches",target:[22,30,-18],eye:[-79,97,280],mobileEye:[-74,106,315],mobileTarget:[42,27,1],fov:38,note:"\u6602\u8239\u6D32\u4E0E\u9752\u8863\u9694\u6C34\u76F8\u671B\u3002\u8D27\u67DC\u8F6E\u5728\u4E1C\u5CB8\u9760\u6CCA\uFF0C\u53CC\u5854\u4E4B\u95F4\u7559\u51FA\u8FDB\u6E2F\u822A\u9053\u3002"},berth:{name:"\u516B\u53F7\u7801\u5934",en:"Berth 08",target:[97,13.4,47],eye:[12,62,136],mobileEye:[-2,81,158],mobileTarget:[101,16,49],fov:39,note:"\u987A\u7740\u7EA2\u8272\u5CB8\u6865\u5F80\u4E0B\u770B\uFF0C\u540A\u5177\u5728\u8239\u8231\u4E0E\u62D6\u8F66\u4E4B\u95F4\u5F80\u8FD4\uFF0C\u7B49\u5019\u8F66\u9053\u65C1\u662F\u5206\u533A\u5806\u653E\u7684\u8D27\u67DC\u3002"},bridge:{name:"\u6602\u8239\u6D32\u5927\u6865",en:"Stonecutters Bridge",target:[7,43,-70],eye:[111,93,178],mobileEye:[81,107,225],mobileTarget:[6,42,-72],fov:34,note:"\u4E24\u5EA7\u5355\u67F1\u6865\u5854\u7ACB\u5728\u6C34\u9053\u4E24\u4FA7\u3002\u659C\u62C9\u7D22\u843D\u5728\u5206\u79BB\u7684\u53CC\u5E45\u6865\u9762\u4E0A\uFF0C\u6865\u4E0B\u4ECD\u6709\u901A\u822A\u7A7A\u95F4\u3002"},channel:{name:"\u5F15\u6C34\u822A\u9053",en:"Rambler Channel",target:[15,17,40],eye:[22,33,185],mobileEye:[22,39,185],mobileTarget:[12,17,43],fov:49,note:"\u89C6\u7EBF\u964D\u5230\u6D77\u9762\u9644\u8FD1\u3002\u5F15\u6C34\u8247\u548C\u62D6\u8F6E\u5404\u6709\u4E00\u6761\u5C3E\u6D41\uFF0C\u822A\u6807\u706F\u6807\u51FA\u4E24\u4FA7\u8FB9\u754C\u3002"},yard:{name:"\u4EA4\u63A5\u5806\u573A",en:"Container yard",target:[161,6.5,35],eye:[208,71,126],mobileEye:[218,80,141],mobileTarget:[163,7,29],fov:43,note:"\u4ECE\u5854\u53F0\u548C\u5E93\u623F\u4E4B\u95F4\u770B\u56DE\u6CCA\u4F4D\u3002\u6A59\u9EC4\u8272\u9F99\u95E8\u540A\u8DE8\u8FC7\u5806\u53E0\uFF0C\u8F66\u9053\u628A\u5806\u573A\u5206\u6210\u8FDE\u7EED\u7684\u4F5C\u4E1A\u533A\u3002"}};function bu(){let i=new De,t=new De,e=new De,n=new De,s=[];xu(i,s),fa(i,Di.truckX,Ut,Di.z+.82,"#db9d54");for(let[f,g,v,m]of[[130.1,67,"#a35147",!0],[142.7,-12.1,"#7f9b96",!1],[214,89.5,"#b96f50",!0],[-226.75,16.8,"#d2a855",!1],[205.2,-36,"#a3aa9b",!1],[129.2,18,"#a6a69b",!1]])fa(i,f,Ut,g,v,m);pu(t),mu(e,n);let r=new De;Su(r);let o=new De,a=new De,l=new De,c=yu();c.chassis(o),c.frame(a),Wn(l,-1.225,0,-3.09,6.18,Hn[1],{lettering:"KWT"});let u=new De;fa(u,0,0,0,"#a35a47",!0);let h=["#cee0d8","#a4524a","#d1b289","#7897a1","#d5d0bf","#496774"].map((f,g)=>{let v=new De,m=g%3===1?2.88:2.17;return v.box(-m/2,.065,-.53,m,.46,1.06,f),v.box(-.49,.49,-.46,1.12,.35,.91,g%3===1?f:"#9baaa2"),v.box(.61,.3,-.42,.36,.26,.84,"#526566"),v.box(m/2-.03,.24,-.41,.095,.14,.79,N.ice,.73),v.box(-m/2-.035,.22,-.41,.082,.13,.79,N.marker,.58),v});return{core:[i,t,e,vu(),Mu(),r],background:n,pools:s,moving:{trolley:o,spreader:a,suspended:l,lorry:u,cars:h,pilot:Jl("pilot"),tug:Jl("tug")}}}var Z0=(i,t,e)=>i+(t-i)*e,J0=i=>{let t=Math.min(1,Math.max(0,i));return t*t*(3-2*t)},xs=(i,t,e)=>J0((i-t)/(e-t)),pa=5,Kl=Math.PI*pa/2,wu=[[135.9,-39.3,0,1,116.2,Math.PI],[140.9,81.9,1,0,50.65,Math.PI/2],[196.55,76.9,0,-1,116.2,0],[191.55,-44.3,-1,0,50.65,-Math.PI/2]],K0=wu.reduce((i,t)=>i+t[4]+Kl,0);function $0(i){let t=(28+i*3.9)%K0;for(let[e,n,s,r,o,a]of wu){if(t<=o)return{x:e+s*t,z:n+r*t,y:Ut,yaw:Math.atan2(s,r)};if(t-=o,t<=Kl){let l=a-t/pa;return{x:e+s*o+(Math.cos(l)-Math.cos(a))*pa,z:n+r*o+(Math.sin(l)-Math.sin(a))*pa,y:Ut,yaw:Math.atan2(Math.sin(l),-Math.cos(l))}}t-=Kl}return{x:135.9,z:-39.3,y:Ut,yaw:0}}function Tu(i){let t=i%44,{shipX:e,shipY:n,truckX:s,truckY:r,clearY:o,z:a,railY:l}=Di,c=xs(t,8,16.4)-xs(t,29,37.4),u=xs(t,2.1,8)-xs(t,37.4,43.2),p=xs(t,16.4,22.4)-xs(t,23,29),h=Z0(e,s,c),f=n+(o-n)*u+(r-o)*p,g=i*.034-.17,v=i*.03+.42,m={x:-8+55*Math.cos(g),z:104+33*Math.sin(g),yaw:Math.atan2(-55*Math.sin(g),33*Math.cos(g)),y:.09+Math.sin(i*1.48)*.17},d={x:-32+37*Math.sin(v),z:22+29*Math.cos(v),yaw:Math.atan2(37*Math.cos(v),-29*Math.sin(v)),y:.1+Math.sin(i*1.04+1.7)*.15},M=$0(i),T=Array.from({length:16},(S,A)=>{let E=A%2?-1:1,_=(i*(3.3+A%4*.38)+A*76.9+A%3*14.1)%535;return{x:E>0?-263+_:272-_,z:vn.z+(E>0?A%4===0?4.25:6.72:A%4===1?-4.3:-6.55),y:vn.deckY+.14,yaw:E>0?0:Math.PI}});return{transfer:{x:h,y:f,z:a,railY:l},pilot:m,tug:d,lorry:M,traffic:T}}var Cu=new si(1,1,1),fi=new _e,_a=new It,j0=new It("#c4b8a6"),Eu=new U,Au=new U,Q0=new wn(1,1),t_=`
varying vec2 local;
varying vec3 paint;
void main() {
  local = uv * 2.0 - 1.0;
  vec4 center = modelViewMatrix * instanceMatrix * vec4(0, 0, 0, 1);
  // Screen-facing diffusion centred on the fixture, never painted over an opaque object.
  center.xy += position.xy * vec2(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz));
  paint = instanceColor;
  gl_Position = projectionMatrix * center;
}
`,e_=`
uniform float lampPower;
varying vec2 local;
varying vec3 paint;
void main() {
  float r = length(local);
  float center = exp(-r * r * 34.0);
  float lens = exp(-r * r * 4.3) * (1.0 - smoothstep(.35, 1.0, r));
  gl_FragColor = vec4(paint, min(.84, (center * .58 + lens * .19) * lampPower));
  #include <colorspace_fragment>
}
`;function n_(i,t,e){let n=t.filter(r=>r.glow>=.73&&(r.w>=.29||r.d>=.29));if(!n.length)return;let s=new ss(Q0,e,n.length);for(let r=0;r<n.length;r++){let{x:o,y:a,z:l,w:c,h:u,d:p,color:h,glow:f}=n[r];fi.position.set(o+c/2,a+u/2,l+p/2);let g=1.7+1.9*Math.min(1.3,Math.max(c,u,p))*f;fi.scale.set(g*1.1,g,1),fi.updateMatrix(),s.setMatrixAt(r,fi.matrix),s.setColorAt(r,_a.set(h))}s.computeBoundingSphere(),i.add(s)}function ma(i,t,e,n,s){let r=new Nn;for(let[o,a,l]of[[i.solids,t,!1],[i.lights,e,!0]]){if(!o.length)continue;let c=new ss(Cu,a,o.length),u=new Map;for(let p=0;p<o.length;p++){let{x:h,y:f,z:g,w:v,h:m,d,color:M,glow:T}=o[p],S=l?M+T:M;u.has(S)||(_a.set(M),l&&_a.lerp(j0,.075).multiplyScalar(T*1.34+.24),u.set(S,_a.clone())),fi.position.set(h+v*.5,f+m*.5,g+d*.5),fi.scale.set(v,m,d),fi.updateMatrix(),c.setMatrixAt(p,fi.matrix),c.setColorAt(p,u.get(S))}c.computeBoundingSphere(),c.castShadow=n&&!l,c.receiveShadow=!l,r.add(c)}return s&&n_(r,i.lights,s),r}function Ru(i,{x:t,y:e,z:n,yaw:s=0}){i.position.set(t,e,n),i.rotation.y=s}var ga=i=>i*i*(3-2*i);function i_(i,t){let e=fr[i],n=Math.max(0,Math.min(1,(1.37-t)/.55));return{target:new U(...e.target).lerp(new U(...e.mobileTarget),n),eye:new U(...e.eye).lerp(new U(...e.mobileEye),n),fov:e.fov+n*11}}function Pu(i,{view:t="harbor",light:e="blue",startTime:n=dr,startPaused:s=!1,reduced:r=!1,plate:o=!1}={}){let a=new oa({antialias:!0,powerPreference:"high-performance",alpha:!1});a.toneMapping=an,a.shadowMap.enabled=!0,a.shadowMap.type=wi,a.shadowMap.autoUpdate=!1,a.shadowMap.needsUpdate=!0,a.domElement.tabIndex=0,a.domElement.setAttribute("aria-label","\u6F6E\u7EBF\u4EA4\u73ED\u4E09\u7EF4\u573A\u666F\u3002\u7528\u65B9\u5411\u952E\u8F6C\u52A8\uFF0C\u4F7F\u7528\u52A0\u51CF\u952E\u7F29\u653E\u3002"),a.domElement.className="harbor-canvas",i.append(a.domElement);let l=new Os;l.fog=new Fs("#7c8b9e",.00174);let c=new Ie(34,1,.46,2950),u=new Ie,p=new U,h=[new He(new U(0,1,0),-.015)],f=new Xe(2,2,{depthBuffer:!0,stencilBuffer:!1,minFilter:Ae,magFilter:Ae,type:a.extensions.has("EXT_color_buffer_float")?en:Ge}),g=new Zs("#a6bdd9","#746875",1.3),v=new os("#ffd4a4",1.2);v.position.set(-199,192,124),v.target.position.set(17,0,-25),v.castShadow=!0;let m=v.shadow,d=m.camera;d.left=-285,d.right=285,d.top=252,d.bottom=-231,d.near=12,d.far=690,d.updateProjectionMatrix();let M=window.matchMedia("(max-width: 700px)").matches?2048:4096;m.mapSize.set(M,M),m.radius=1.5,m.bias=-94e-6,m.normalBias=.14;let T=new os("#a8c7f2",.37);T.position.set(122,136,-164);let S=vn.towers.map(rt=>{let xt=new $s("#a4d8f2",0,38,.48,.77,1.08);return xt.position.set(rt-2.9,4.15,vn.z+7),xt.target.position.set(rt,20,vn.z+1.5),l.add(xt,xt.target),xt});l.add(v,v.target,g,T);let A=new qs({color:"#ffffff"}),E=new bi({color:"#ffffff"});for(let rt of[A,E])rt.onBeforeCompile=xt=>{xt.fragmentShader=xt.fragmentShader.replace("#include <fog_fragment>",`
        #ifdef USE_FOG
          float marineDepth = max(vFogDepth - 97.0, 0.0);
          float haze = 1.0 - exp(-fogDensity * fogDensity * marineDepth * marineDepth);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, haze);
        #endif
      `)};let _=new ze({uniforms:{lampPower:{value:0}},vertexShader:t_,fragmentShader:e_,transparent:!0,depthWrite:!1,blending:Ei}),b=bu();for(let rt of b.core)l.add(ma(rt,A,E,!0,_));l.add(ma(b.background,A,E,!1));let O=b.moving,L={};for(let rt of["trolley","spreader","suspended","lorry","tug","pilot"])L[rt]=ma(O[rt],A,E,!1,_),l.add(L[rt]);L.traffic=Array.from({length:16},(rt,xt)=>{let zt=ma(O.cars[(xt+Math.floor(xt/3))%O.cars.length],A,E,!1);return l.add(zt),zt});let D=new bi({color:"#9ea49a"}),k=[];for(let rt of[-.95,.95])for(let xt of[-2.5,2.5]){let zt=new Re(Cu,D);zt.scale.set(.115,1,.115),l.add(zt),k.push({wire:zt,x:rt,z:xt})}let q=hu(l,b.pools,f.texture),R=new ha(c,a.domElement);R.enableDamping=!r,R.dampingFactor=.095,R.rotateSpeed=.62,R.panSpeed=.75,R.zoomSpeed=.83,R.minDistance=31,R.maxDistance=740,R.minPolarAngle=.13,R.maxPolarAngle=Math.PI*.497,R.minTargetRadius=0,R.maxTargetRadius=440,R.cursor.set(0,18,-16);let V=ua(e),Y=null,G=null,et=t,W=n,Q=0,tt=-1e3,vt=!0,Rt=!0,J=0,ft=!s&&!r,Mt=r,At=!1,pt=!0;function Ft(){l.fog.color.copy(V.fog),l.fog.density=V.density,v.color.copy(V.sun),v.intensity=V.key,g.color.copy(V.sky),g.groundColor.copy(V.bounce),g.intensity=V.fill,E.color.setScalar(V.lamps),_.uniforms.lampPower.value=Math.max(0,(V.lamps-.42)*.67),T.intensity=.24+V.key*.13;for(let rt of S)rt.intensity=Math.max(0,V.lamps-.38)*18;q.setMood(V)}function de(){let rt=Tu(W),xt=rt.transfer;L.trolley.position.set(xt.x,xt.railY,xt.z),L.spreader.position.set(xt.x,xt.y+2.76,xt.z),L.suspended.position.set(xt.x,xt.y,xt.z);let zt=xt.y+3,ee=xt.railY-.4;for(let{wire:I,x:Ne,z:ae}of k)I.position.set(xt.x+Ne,(zt+ee)/2,xt.z+ae),I.scale.y=Math.max(.025,ee-zt);for(let I of["tug","pilot","lorry"])Ru(L[I],rt[I]);for(let I=0;I<L.traffic.length;I++)Ru(L.traffic[I],rt.traffic[I]);q.updateWater(rt,W)}function Pt(rt){u.copy(c,!1);let{x:xt,y:zt,z:ee}=c.position;u.position.set(xt,.03-zt,ee);let I=p.copy(R.target);I.y=.03-I.y,u.lookAt(I),u.updateMatrixWorld(),q.setProjection(u,f.width,f.height),q.sea.visible=!1,a.clippingPlanes=h,a.setRenderTarget(f);try{a.render(l,u)}finally{a.setRenderTarget(null),a.clippingPlanes=[],q.sea.visible=!0}tt=rt,Rt=!1}function jt(rt){J=0;let xt=Q===0?0:Math.min(.05,(rt-Q)/1e3);if(Q=rt,ft&&xt>0&&(W+=xt,de(),vt=!0),Y){let ee=Math.min(1,(rt-Y.begin)/950);kl(V,Y.from,Y.to,ga(ee)),Ft(),vt=Rt=!0,ee>=1&&(Y=null)}if(G){let ee=Math.min(1,(rt-G.begin)/1120);c.position.lerpVectors(G.from.eye,G.to.eye,ga(ee)),R.target.lerpVectors(G.from.target,G.to.target,ga(ee)),c.fov=G.from.fov+(G.to.fov-G.from.fov)*ga(ee),c.updateProjectionMatrix(),vt=Rt=!0,ee>=1&&(G=null)}let zt=R.update();(vt||zt)&&((Rt||rt-tt>69)&&Pt(rt),a.render(l,c),vt=!1),ft||G||Y||zt||vt?Yt():Q=0}function Yt(){J||(J=requestAnimationFrame(jt))}function Xt(rt,xt=!0){et=rt,pt=!0;let zt=i_(rt,c.aspect);Mt||!xt||!At?(G=null,c.position.copy(zt.eye),R.target.copy(zt.target),c.fov=zt.fov,c.updateProjectionMatrix(),R.update(),vt=Rt=!0):G={from:{eye:c.position.clone(),target:R.target.clone(),fov:c.fov},to:zt,begin:performance.now()},Yt()}function xe(rt){let xt=ua(rt);if(Mt)Y=null,V=xt,Ft(),vt=Rt=!0;else{let zt=ua(rt);kl(zt,V,V,0),Y={from:zt,to:xt,begin:performance.now()}}Yt()}function pe(rt,xt){return o?Math.min(1,Math.sqrt(85e5/(rt*xt))):Math.min(window.devicePixelRatio||1,1.75,Math.sqrt(265e4/(rt*xt)))}function Ce(){let{clientWidth:rt,clientHeight:xt}=i;if(!rt||!xt)return;let zt=rt/xt;c.aspect=zt,c.updateProjectionMatrix(),a.setPixelRatio(pe(rt,xt)),a.setSize(rt,xt,!1);let ee=Math.min(o?1580:990,Math.max(440,Math.round(Math.max(rt,xt)*.66)));f.setSize(Math.max(1,Math.round(ee*Math.min(zt,1))),Math.max(1,Math.round(ee/Math.max(zt,1)))),pt&&Xt(et,!1),vt=Rt=!0,At&&Yt()}R.addEventListener("start",()=>{G=null,pt=!1}),R.addEventListener("change",()=>{Eu.set(-285,1.4,-240),Au.set(295,136,165);let rt=p.copy(R.target);R.target.clamp(Eu,Au),c.position.sub(rt.sub(R.target)),c.position.y=Math.max(2.4,c.position.y),vt=Rt=!0,Yt()}),a.domElement.addEventListener("keydown",rt=>{if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","=","-"].includes(rt.key))return;rt.preventDefault(),pt=!1,G=null;let xt=new U().subVectors(c.position,R.target),zt=rt.key==="ArrowLeft"?-.095:rt.key==="ArrowRight"?.095:0;zt&&xt.applyAxisAngle(new U(0,1,0),zt),rt.key==="ArrowUp"&&(xt.y+=xt.length()*.06),rt.key==="ArrowDown"&&(xt.y-=xt.length()*.06),(rt.key==="+"||rt.key==="=")&&xt.multiplyScalar(.89),rt.key==="-"&&xt.multiplyScalar(1.12),c.position.copy(R.target).add(xt),R.update(),vt=Rt=!0,Yt()});function ce(rt){ft=rt,Q=0,Yt()}function nn(){let{clientWidth:rt,clientHeight:xt}=i,zt=2560/Math.max(rt,xt),ee=Math.round(rt*zt),I=Math.round(xt*zt);return a.setPixelRatio(1),a.setSize(ee,I,!1),a.render(l,c),new Promise(Ne=>{a.domElement.toBlob(Ne,"image/png"),a.setPixelRatio(pe(rt,xt)),a.setSize(rt,xt,!1),a.render(l,c)})}return Ft(),de(),Ce(),R.update(),Pt(performance.now()),a.render(l,c),At=!0,new ResizeObserver(Ce).observe(i),ft&&Yt(),{setView:Xt,setLight:xe,togglePlaying:ce,capture:nn,setReduced(rt){Mt=rt,R.enableDamping=!rt},canvas:a.domElement}}var Fi=new URLSearchParams(location.search),$l=matchMedia("(prefers-reduced-motion: reduce)"),Je=document.querySelector("#stage"),Ni=document.querySelector("#render-status"),jl=document.querySelector("#views"),Ql=document.querySelector("#lights"),xa=document.querySelector("#motion"),va=document.querySelector("#full"),Iu=document.querySelector("#reset"),ys=document.querySelector("#archive"),ya=document.querySelector("#capture"),s_=document.querySelector("#caption"),qn=Object.hasOwn(fr,Fi.get("view"))?Fi.get("view"):"harbor",Ui=Object.hasOwn(Vl,Fi.get("light"))?Fi.get("light"):"blue",pi=Fi.get("paused")!=="1"&&!$l.matches,qe,Lu=Fi.get("plate")==="1";Lu&&document.body.classList.add("plate");document.querySelector("#open-archive").addEventListener("click",i=>{typeof ys.showModal=="function"&&(i.preventDefault(),ys.showModal())});ys.addEventListener("click",i=>{if(i.target!==ys)return;let t=ys.getBoundingClientRect();(i.clientX<t.left||i.clientX>t.right||i.clientY<t.top||i.clientY>t.bottom)&&ys.close()});function pr(){for(let i of jl.querySelectorAll("button"))i.setAttribute("aria-pressed",String(i.dataset.view===qn));for(let i of Ql.querySelectorAll("button"))i.setAttribute("aria-pressed",String(i.dataset.light===Ui));s_.textContent=fr[qn].note,xa.textContent=pi?"\u6682\u505C":"\u64AD\u653E",xa.setAttribute("aria-label",pi?"\u6682\u505C\u6E2F\u53E3\u52A8\u753B":"\u64AD\u653E\u6E2F\u53E3\u52A8\u753B"),xa.removeAttribute("aria-pressed")}function tc(){let i=new URL(location.href);for(let[t,e,n]of[["view",qn,"harbor"],["light",Ui,"blue"],["paused",pi?"":"1",""]])e===n?i.searchParams.delete(t):i.searchParams.set(t,e);try{history.replaceState(null,"",i.href)}catch{}}jl.addEventListener("click",i=>{let t=i.target.closest("button[data-view]");!t||!qe||(qn=t.dataset.view,qe.setView(qn),pr(),tc())});Ql.addEventListener("click",i=>{let t=i.target.closest("button[data-light]");!t||!qe||Ui===t.dataset.light||(Ui=t.dataset.light,qe.setLight(Ui),pr(),tc())});Iu.addEventListener("click",()=>{qe?.setView(qn),qe?.canvas.focus({preventScroll:!0})});xa.addEventListener("click",()=>{pi=!pi,qe?.togglePlaying(pi),pr(),tc()});$l.addEventListener("change",i=>{qe?.setReduced(i.matches),i.matches&&(pi=!1,qe?.togglePlaying(!1),pr())});function ec(){let i=Je.classList.contains("expanded")||document.fullscreenElement===Je;va.textContent=i?"\u9000\u51FA\u5168\u5C4F":"\u5168\u5C4F",va.setAttribute("aria-pressed",String(i))}va.addEventListener("click",async()=>{if(Je.classList.contains("expanded"))Je.classList.remove("expanded"),document.documentElement.style.overflow="";else if(document.fullscreenElement===Je)await document.exitFullscreen();else try{await Je.requestFullscreen()}catch{Je.classList.add("expanded"),document.documentElement.style.overflow="hidden"}ec()});document.addEventListener("fullscreenchange",ec);document.addEventListener("keydown",i=>{i.key==="Escape"&&Je.classList.contains("expanded")&&(Je.classList.remove("expanded"),document.documentElement.style.overflow="",ec(),va.focus())});ya.addEventListener("click",async()=>{if(!qe)return;let i=document.querySelector("#capture-status");ya.disabled=!0,i.textContent="\u6B63\u5728\u751F\u6210\u753B\u9762";try{let t=await qe.capture();if(!t)throw new Error("Canvas archive was empty");let e=URL.createObjectURL(t),n=document.createElement("a");n.href=e,n.download=["tidal-shift",qn,Ui].join("-")+".png",n.click(),setTimeout(()=>URL.revokeObjectURL(e),15e3),i.textContent="\u753B\u9762\u5DF2\u751F\u6210"}catch{i.textContent="\u753B\u9762\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002"}finally{ya.disabled=!1}});function r_(){try{let i=Fi.get("t"),t=i===null?dr:Number(i),e=Number.isFinite(t)&&t>=0&&t<=3600?t:dr;qe=Pu(Je,{view:qn,light:Ui,startTime:e,startPaused:!pi,reduced:$l.matches,plate:Lu}),jl.disabled=Ql.disabled=Iu.disabled=ya.disabled=!1,Ni.hidden=!0,Je.classList.add("ready"),document.querySelector("#stage-tools").hidden=!1,qe.canvas.addEventListener("webglcontextlost",()=>{Je.classList.remove("ready"),Ni.textContent="\u4E09\u7EF4\u753B\u9762\u6682\u65F6\u4E2D\u65AD\uFF0C\u6B63\u5728\u663E\u793A\u56FE\u7248\u3002",Ni.hidden=!1}),qe.canvas.addEventListener("webglcontextrestored",()=>{qe.setView(qn,!1),Je.classList.add("ready"),Ni.hidden=!0})}catch(i){console.warn("Tidal Shift could not start WebGL.",i),Je.querySelector("canvas")?.remove(),Ni.textContent="\u5F53\u524D\u6D4F\u89C8\u5668\u65E0\u6CD5\u8F7D\u5165\u4E09\u7EF4\u573A\u666F\u3002\u53EF\u6253\u5F00\u300C\u56FE\u7248\u4E0E\u6A21\u578B\u300D\u7EE7\u7EED\u67E5\u770B\u3002"}}pr();Ni.textContent="\u6B63\u5728\u8F7D\u5165\u4E09\u7EF4\u573A\u666F";Ni.hidden=!1;requestAnimationFrame(r_);})();
