#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""孔雀开屏 · 体素生成器  (model: Qwen4-Max-Preview)
参考真实蓝孔雀照片/解剖，不参考任何体素作品。
混合建模：身体=向量化 SDF；尾屏羽/眼斑/底座=光栅化。
输出: ../js/voxels.bin (表面体素), ../js/palette.json, ../js/stats.json, ../export/full.npz
"""
import numpy as np, json, math, os, struct

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_JS = os.path.join(HERE, "..", "js")
OUT_EX = os.path.join(HERE, "..", "export")
os.makedirs(OUT_JS, exist_ok=True); os.makedirs(OUT_EX, exist_ok=True)
RNG = np.random.default_rng(20261111)

NX, NY, NZ = 460, 300, 220
X0, Y0, Z0 = -230, 0, -110
grid = np.zeros((NX, NY, NZ), dtype=np.uint8)

def P(x, y, z, idx):
    a, b, c = int(round(x))-X0, int(round(y))-Y0, int(round(z))-Z0
    if 0 <= a < NX and 0 <= b < NY and 0 <= c < NZ:
        grid[a, b, c] = idx

PAL = [{"name": "empty", "rgb": [0, 0, 0], "mat": 0, "emis": 0.0}]
def C(name, hexs, mat=0, emis=0.0):
    h = hexs.lstrip('#')
    PAL.append({"name": name, "rgb": [int(h[i:i+2], 16) for i in (0, 2, 4)], "mat": mat, "emis": emis})
    return len(PAL)-1

NECK      = C("neck_blue",   "#123a9e", 1)
NECK_HI   = C("neck_blue_hi","#1d4ab0", 1)
NECK_TEAL = C("neck_teal",   "#0c6f7f", 1)
BREAST    = C("breast_deep", "#0d2a86", 1)
HEAD      = C("head_blue",   "#1642b0", 1)
MANTLE_T  = C("mantle_turq", "#128f80", 1)
MANTLE_G  = C("mantle_green","#0e7f57", 1)
BACK_BR   = C("back_bronze", "#7a5c24", 2)
WING_CR   = C("wing_cream",  "#e8e4d8", 0)
WING_BK   = C("wing_black",  "#1a1a1a", 0)
WING_TQ   = C("wing_turq",   "#1fc0b0", 1)
FACE_W    = C("face_white",  "#f0ece0", 0)
EYE_D     = C("eye_dark",    "#201410", 0)
BEAK      = C("beak_horn",   "#cfc4b0", 0)
LEG       = C("leg_gray",    "#9f8f88", 0)
CREST_S   = C("crest_shaft", "#d8d0c0", 0)
CREST_T   = C("crest_tip",   "#1a6f9f", 1)
SHAFT_AG  = C("shaft_silver","#c9bfae", 2)
SHAFT_CU  = C("shaft_copper","#b07860", 2)
BARB_PK   = C("barb_pink",   "#a06a58", 2)
BARB_AU   = C("barb_gold",   "#b8933a", 2)
OC_CORE   = C("oc_core",     "#0a1430", 1, 0.10)
OC_COREB  = C("oc_coreblue", "#123a6b", 1, 0.10)
OC_STREAK = C("oc_streak",   "#1f6f8f", 1, 0.25)
OC_GREEN  = C("oc_green",    "#0f9e57", 1, 0.15)
OC_CYAN   = C("oc_cyan",     "#2fd4b0", 1, 0.40)
OC_GOLD   = C("oc_gold",     "#b8952a", 2)
OC_OLIVE  = C("oc_olive",    "#9c8424", 2)
OC_BRONZE = C("oc_bronze",   "#96561f", 2)
CAPE_AU   = C("cape_gold",   "#c9a227", 2)
CAPE_GR   = C("cape_green",  "#7a8a2a", 2)
CAPE_BR   = C("cape_bronze", "#a0782a", 2)
MOSS      = C("moss",        "#3f5c31", 0)
MOSS_D    = C("moss_dark",   "#33502a", 0)
GRASS     = C("grass",       "#4c6a30", 0)
GRASS_HI  = C("grass_hi",    "#6a8a3e", 0)
SOIL      = C("soil",        "#57493a", 0)
ROCK      = C("rock",        "#8a8a86", 0)
ROCK_D    = C("rock_dark",   "#6a6a66", 0)
FL_W      = C("flower_white","#f0f0e8", 0)
FL_P      = C("flower_pink", "#e8a0b0", 0)
FL_Y      = C("flower_yellow","#e8c840",0)
FERN      = C("fern",        "#3a7a3a", 0)
PETAL     = C("petal_pink",  "#e8b0c0", 0)
LEAF_AU   = C("leaf_gold",   "#c8a040", 0)

def h3(x, y, z):
    n = (int(x)*374761393 + int(y)*668265263 + int(z)*1274126177) & 0xffffffff
    n = (n ^ (n >> 13)) * 1274126177 & 0xffffffff
    return ((n ^ (n >> 16)) & 0xffff)/65535.0

def ell(X, Y, Z, c, r):
    return np.sqrt(((X-c[0])/r[0])**2+((Y-c[1])/r[1])**2+((Z-c[2])/r[2])**2)-1.0
def seg_dist(X, Y, Z, a, b):
    ax, ay, az = a; bx, by, bz = b
    abx, aby, abz = bx-ax, by-ay, bz-az
    L2 = abx*abx+aby*aby+abz*abz
    t = np.clip(((X-ax)*abx+(Y-ay)*aby+(Z-az)*abz)/L2, 0, 1)
    return np.sqrt((X-(ax+t*abx))**2+(Y-(ay+t*aby))**2+(Z-(az+t*abz))**2), t
def capsule(X, Y, Z, a, b, r):
    d, _ = seg_dist(X, Y, Z, a, b); return d-r
def roundcone(X, Y, Z, a, b, r1, r2):
    d, t = seg_dist(X, Y, Z, a, b); return d-(r1+(r2-r1)*t)
def write_mask(X, Y, Z, mask, col):
    gi=(X-X0).astype(int); gj=(Y-Y0).astype(int); gk=(Z-Z0).astype(int)
    ok=mask&(gi>=0)&(gi<NX)&(gj>=0)&(gj<NY)&(gk>=0)&(gk<NZ)
    if np.ndim(col)==0:
        grid[gi[ok], gj[ok], gk[ok]] = col
    else:
        grid[gi[ok], gj[ok], gk[ok]] = col[ok]

def build_body():
    xs=np.arange(-40,41); ys=np.arange(28,140); zs=np.arange(8,72)
    X,Y,Z=np.meshgrid(xs,ys,zs,indexing='ij')
    breast=ell(X,Y,Z,(0,54,48),(24,24,28))
    rear  =ell(X,Y,Z,(0,58,30),(22,22,26))
    neck1 =roundcone(X,Y,Z,(0,72,44),(0,95,40),7.5,6.5)
    neck2 =roundcone(X,Y,Z,(0,95,40),(0,120,36),6.5,5.5)
    head  =ell(X,Y,Z,(0,126,34),(10,11,12))
    sdf=np.minimum(np.minimum(np.minimum(breast,rear),np.minimum(neck1,neck2)),head)
    mask=sdf<0
    n=(np.sin(X*0.9+Y*1.7)*0.5+np.sin(Y*0.8+Z*1.3)*0.5+1)/2
    col=np.zeros(X.shape,dtype=np.uint8)
    headm=mask&(Y>=118); neckm=mask&(Y>=72)&(Y<118); torsm=mask&(Y<72)
    col[headm]=HEAD
    nf=(np.sin(X*2.3+Y*3.1)*0.5+np.sin(Y*2.7+Z*2.2)*0.5+1)/2
    col[neckm&(nf<0.7)]=NECK
    col[neckm&(nf>=0.7)&(nf<0.9)]=NECK_HI
    col[neckm&(nf>=0.9)]=NECK_TEAL
    bf=torsm&(Z>46)
    col[bf&(n<0.85)]=BREAST
    col[bf&(n>=0.85)&(n<0.95)]=NECK
    col[bf&(n>=0.95)]=NECK_HI
    topm=torsm&(Z<=46)&(Y>60)&(np.abs(X)<20)
    col[topm&(n<0.35)]=MANTLE_T
    col[topm&(n>=0.35)&(n<0.7)]=MANTLE_G
    col[topm&(n>=0.7)]=BACK_BR
    col[torsm&(Z<=46)&(Y<=60)]=BACK_BR
    ft=torsm&(Z>46)&(Y>66)
    col[ft&(n<0.5)]=MANTLE_G
    col[ft&(n>=0.5)]=BACK_BR
    write_mask(X,Y,Z,mask,col)

def build_wings():
    for s in (-1,1):
        xs=np.arange(s*24-13,s*24+14); ys=np.arange(32,84); zs=np.arange(2,64)
        X,Y,Z=np.meshgrid(xs,ys,zs,indexing='ij')
        m=ell(X,Y,Z,(s*24,56,30),(11,24,30))<0
        v=np.sin(Y*2.0+Z*0.5+np.sin(Z*0.7)*1.4)
        col=np.where(v>0,WING_BK,WING_CR).astype(np.uint8)
        upper=(Y>=62)
        col[upper]=np.where(np.sin(X*1.3+Z*0.8)>0.3,WING_TQ,np.where(np.sin(X*1.3+Z*0.8)>-0.3,MANTLE_G,BACK_BR))[upper].astype(np.uint8)
        shoulder=(Y>=56)&(Y<62)&(Z>30)
        col[shoulder]=np.where(np.sin(X*1.5+Y*1.2)>0,WING_TQ,MANTLE_G)[shoulder].astype(np.uint8)
        write_mask(X,Y,Z,m,col)

def build_head_details():
    xs=np.arange(-6,7); ys=np.arange(118,134); zs=np.arange(40,62)
    X,Y,Z=np.meshgrid(xs,ys,zs,indexing='ij')
    m=roundcone(X,Y,Z,(0,126,44),(0,123,60),3.2,0.6)<0
    write_mask(X,Y,Z,m,BEAK)
    for s in (-1,1):
        for c,r,idx in [((s*5,131,44),(2.6,1.4,1.8),FACE_W),
                        ((s*5,122,45),(2.4,1.2,1.6),FACE_W),
                        ((s*6,127,45),(1.6,1.6,1.6),EYE_D)]:
            xs=np.arange(int(c[0]-r[0]-1),int(c[0]+r[0]+2))
            ys=np.arange(int(c[1]-r[1]-1),int(c[1]+r[1]+2))
            zs=np.arange(int(c[2]-r[2]-1),int(c[2]+r[2]+2))
            X,Y,Z=np.meshgrid(xs,ys,zs,indexing='ij')
            write_mask(X,Y,Z,ell(X,Y,Z,c,r)<0,idx)

def build_crest():
    n=15
    for k in range(n):
        a=(k/(n-1)-0.5)*1.9
        dx=math.sin(a)*1.15
        dy=math.cos(a*0.5)
        dz=0.45+0.3*math.cos(a)
        L=20+3*h3(k,7,1)
        bx,by,bz=0,134,32
        for t in range(int(L)+1):
            f=t/L
            P(bx+dx*L*f, by+dy*L*f, bz+dz*L*f*0.6, CREST_S)
        tx,ty,tz=bx+dx*L,by+dy*L,bz+dz*L*0.6
        for ox in (-1,0,1):
            for oy in (-1,0,1):
                P(tx+ox,ty+oy,tz,CREST_T); P(tx+ox,ty+oy,tz+1,CREST_T)

def build_legs():
    for s in (-1,1):
        xs=np.arange(s*12-6,s*12+7); ys=np.arange(0,40); zs=np.arange(36,52)
        X,Y,Z=np.meshgrid(xs,ys,zs,indexing='ij')
        write_mask(X,Y,Z,capsule(X,Y,Z,(s*10,36,42),(s*12,2,44),3)<0,LEG)
        for ta in (-0.5,0,0.5):
            for t in range(7):
                P(s*12+math.sin(ta)*t,1,44+math.cos(ta)*t,LEG)
                P(s*12+math.sin(ta)*t,0,44+math.cos(ta)*t,LEG)
        for t in range(4): P(s*12,1,44-t,LEG)

def build_cape():
    # 3D scalloped mound hugging the back, not a flat disc
    xs=np.arange(-32,33); ys=np.arange(50,108); zs=np.arange(2,34)
    X,Y,Z=np.meshgrid(xs,ys,zs,indexing='ij')
    m=ell(X,Y,Z,(0,70,18),(30,36,14))<0
    m &= (Y>52)
    sc=(np.sin(X*0.55)*np.cos(Y*0.5)*0.5+0.5)
    col=np.where(sc<0.5,CAPE_AU,np.where(sc<0.8,CAPE_GR,CAPE_BR)).astype(np.uint8)
    write_mask(X,Y,Z,m,col)

PIV=(0.0,60.0,12.0)
ROWS=[(215,48,7.5,0.0,0),(172,40,6.6,0.5,6),(132,32,5.8,0.0,12),(96,24,5.0,0.5,18),(64,14,4.2,0.0,24)]
SPAN0,SPAN1=math.radians(-15),math.radians(195)

def eyespot(tx,ty,tz,r,seed,dirx,diry):
    ri=int(math.ceil(r*1.3))
    for ox in range(-ri,ri+1):
        for oy in range(-ri,ri+1):
            # elongate field downward along -dir
            along=ox*dirx+oy*diry
            perp=-ox*diry+oy*dirx
            stretch=1.0 if along>=0 else 0.72   # field extends further below
            d=math.hypot(perp, along*stretch)
            f=d/r
            if f>1.28: continue
            if f<0.45:
                idx=OC_CORE
                if abs(perp)<=max(1,r*0.12) and along>0 and f<0.40: idx=OC_STREAK
                elif f>0.34: idx=OC_COREB
            elif f<0.70: idx=OC_GREEN
            elif f<0.78: idx=OC_CYAN
            elif f<1.0: idx=OC_GOLD if h3(tx+ox,ty+oy,seed)<0.7 else OC_OLIVE
            elif f<1.18: idx=OC_OLIVE
            else: idx=OC_BRONZE
            P(tx+ox,ty+oy,tz,idx); P(tx+ox,ty+oy,tz+1,idx)

def feather(R,theta,r_eye,seed,zoff,filler=False):
    cx,cy,cz=PIV
    dirx,diry=math.cos(theta),math.sin(theta)
    z_tip=cz-0.36*R*(abs(dirx)**1.3)+zoff
    tx,ty,tz=cx+dirx*R,cy+diry*R,z_tip
    steps=int(R)
    for t in range(int(steps*0.10),steps+1):
        f=t/steps
        x=cx+dirx*R*f; y=cy+diry*R*f
        z=cz+(z_tip-cz)*(f**1.4)+zoff*f
        hh=h3(x,y,seed)
        idx=SHAFT_AG if hh<0.5 else SHAFT_CU
        P(x,y,z,idx)
        if f<0.5: P(x,y,z+1,idx)
        px,py=-diry,dirx
        if t%2==0:
            for side in (-1,1):
                slen=5 if f<0.45 else 4
                if filler: slen=3
                slen+=int(h3(x*11+side,y*13,seed+9)*2)-0  # jitter 0..1
                jit=(h3(x*5,y*5,seed+side)-0.5)*0.5
                sx=px*side*0.85-dirx*(0.5+jit)
                sy=py*side*0.85-diry*(0.5+jit)
                bidx=BARB_PK if ((t//3+side)%2==0) else BARB_AU
                for u in range(1,slen+1):
                    P(x+sx*u,y+sy*u,z,bidx)
    if not filler:
        eyespot(tx,ty,tz,r_eye,seed,dirx,diry)
    else:
        # small gold tip for filler feather
        for ox in (-1,0,1):
            for oy in (-1,0,1):
                if ox*ox+oy*oy<=2:
                    P(tx+ox,ty+oy,tz,OC_OLIVE); P(tx+ox,ty+oy,tz+1,OC_OLIVE)

def build_fan():
    seed=100
    for (R,count,r_eye,off,zoff) in ROWS:
        for k in range(count):
            frac=(k+0.5+off*0.5)/count
            theta=SPAN0+frac*(SPAN1-SPAN0)
            feather(R,theta,r_eye,seed,zoff)
            seed+=1
            # filler feather between eyespot feathers
            theta2=SPAN0+((k+1.0+off*0.5)/count)*(SPAN1-SPAN0)
            feather(R*0.93,theta2,r_eye*0.5,seed+500,zoff+3,filler=True)
            seed+=1

def build_ground():
    cx,cz=0,40; RX,RZ=112,74
    xs=np.arange(cx-RX,cx+RX+1); zs=np.arange(cz-RZ,cz+RZ+1)
    X,Z=np.meshgrid(xs,zs,indexing='ij')
    rr=np.sqrt(((X-cx)/RX)**2+((Z-cz)/RZ)**2)
    inside=rr<1.0
    n=(np.sin(X*0.35)*np.cos(Z*0.3)*0.5+0.5)
    h=(2+3*(1-rr)+2*n).astype(int)
    for y in range(0,8):
        m=inside&(y<=h)
        if not m.any(): continue
        col=np.zeros(X.shape,dtype=np.uint8); top=(y==h)
        col[:]=SOIL
        col[top&(n<0.45)]=MOSS_D
        col[top&(n>=0.45)&(n<0.75)]=MOSS
        col[top&(n>=0.75)]=GRASS
        gi=(X-X0).astype(int); gj=np.full(X.shape,y-Y0,dtype=int); gk=(Z-Z0).astype(int)
        ok=m&(gi>=0)&(gi<NX)&(gj>=0)&(gj<NY)&(gk>=0)&(gk<NZ)
        grid[gi[ok],gj[ok],gk[ok]]=col[ok]
    for _ in range(240):
        a=RNG.uniform(0,2*math.pi); rr=math.sqrt(RNG.uniform(0,1))
        x=cx+math.cos(a)*RX*rr*0.95; z=cz+math.sin(a)*RZ*rr*0.95
        ht=int(RNG.integers(3,8)); lean=RNG.uniform(-0.4,0.4)
        for t in range(ht): P(x+lean*t,4+t,z,GRASS_HI if t==ht-1 else GRASS)
    for (rc,r3) in [((-60,3,70),(12,7,9)),((55,3,78),(10,6,8)),((-20,2,96),(8,5,7)),((70,2,20),(9,5,8))]:
        xs=np.arange(int(rc[0]-r3[0]-1),int(rc[0]+r3[0]+2))
        ys=np.arange(0,int(rc[1]+r3[1]+2))
        zs=np.arange(int(rc[2]-r3[2]-1),int(rc[2]+r3[2]+2))
        X,Y,Z=np.meshgrid(xs,ys,zs,indexing='ij')
        m=ell(X,Y,Z,rc,r3)<0
        col=np.where(np.sin(X*0.7+Y*1.1)>0,ROCK,ROCK_D).astype(np.uint8)
        write_mask(X,Y,Z,m,col)
    for _ in range(18):
        a=RNG.uniform(0,2*math.pi); rr=math.sqrt(RNG.uniform(0,1))
        x=cx+math.cos(a)*RX*rr*0.9; z=cz+math.sin(a)*RZ*rr*0.9
        ht=int(RNG.integers(3,6))
        for t in range(ht): P(x,5+t,z,FERN)
        fc=[FL_W,FL_P,FL_Y][int(RNG.integers(0,3))]
        for ox in (-1,0,1):
            for oz in (-1,0,1):
                if abs(ox)+abs(oz)<=1: P(x+ox,5+ht,z+oz,fc)
        P(x,6+ht,z,FL_Y)
    for (fx,fz) in [(-85,55),(85,60),(-40,100),(40,100)]:
        for fr in range(5):
            a=fr/5*2*math.pi
            for t in range(10):
                x=fx+math.cos(a)*t*0.8; z=fz+math.sin(a)*t*0.8
                y=5+int(6*math.sin(t/10*math.pi))
                P(x,y,z,FERN)
                if t%2==0:
                    P(x+math.cos(a+1.57),y,z+math.sin(a+1.57),FERN)
                    P(x-math.cos(a+1.57),y,z-math.sin(a+1.57),FERN)
    for _ in range(50):
        a=RNG.uniform(0,2*math.pi); rr=math.sqrt(RNG.uniform(0,1))
        x=cx+math.cos(a)*RX*rr; z=cz+math.sin(a)*RZ*rr
        idx=PETAL if RNG.uniform()<0.6 else LEAF_AU
        P(x,6,z,idx)
        if RNG.uniform()<0.4: P(x+1,6,z,idx)

build_body(); build_wings(); build_head_details(); build_crest(); build_legs()
build_cape(); build_fan(); build_ground()

occ=grid>0
pad=np.pad(occ,1,mode='constant',constant_values=False)
cnt=np.zeros(grid.shape,dtype=np.int16)
for dx in (-1,0,1):
    for dy in (-1,0,1):
        for dz in (-1,0,1):
            if dx==dy==dz==0: continue
            cnt+=pad[1+dx:1+dx+NX,1+dy:1+dy+NY,1+dz:1+dz+NZ]
ao=np.clip(1.0-0.55*(cnt/26.0),0.35,1.0)
p6=np.pad(occ,1,mode='constant',constant_values=False)
empty_nb=np.zeros(grid.shape,dtype=bool)
for sl in [(slice(2,None),slice(1,-1),slice(1,-1)),(slice(0,-2),slice(1,-1),slice(1,-1)),
           (slice(1,-1),slice(2,None),slice(1,-1)),(slice(1,-1),slice(0,-2),slice(1,-1)),
           (slice(1,-1),slice(1,-1),slice(2,None)),(slice(1,-1),slice(1,-1),slice(0,-2))]:
    empty_nb|=~p6[sl]
surface=occ&empty_nb
coords=np.argwhere(surface); n=len(coords)
xs=coords[:,0]+X0; ys=coords[:,1]+Y0; zs=coords[:,2]+Z0
palidx=grid[surface]
aob=(ao[surface]*255).astype(np.uint8)
matb=np.array([p["mat"] for p in PAL],dtype=np.uint8)[palidx]
seedb=RNG.integers(0,256,size=n).astype(np.uint8)
with open(os.path.join(OUT_JS,"voxels.bin"),"wb") as f:
    f.write(b"KQV1"); f.write(struct.pack("<I",n))
    f.write(struct.pack("<HHH",NX,NY,NZ)); f.write(struct.pack("<hhh",X0,Y0,Z0))
    f.write(np.stack([xs,ys,zs],axis=1).astype("<i2").tobytes())
    f.write(palidx.astype(np.uint8).tobytes()); f.write(aob.tobytes())
    f.write(matb.tobytes()); f.write(seedb.tobytes())
json.dump(PAL,open(os.path.join(OUT_JS,"palette.json"),"w"))
fc=np.argwhere(occ)
np.savez_compressed(os.path.join(OUT_EX,"full.npz"),pos=fc.astype(np.int32),pal=grid[occ].astype(np.uint8),
                    origin=np.array([X0,Y0,Z0],dtype=np.int32),dims=np.array([NX,NY,NZ],dtype=np.int32))
stats={"dims":[NX,NY,NZ],"origin":[X0,Y0,Z0],"surface_voxels":int(n),"solid_voxels":int(occ.sum()),
       "palette_entries":len(PAL),
       "bbox_world":[int(xs.min()),int(xs.max()),int(ys.min()),int(ys.max()),int(zs.min()),int(zs.max())],
       "feathers":sum(r[1] for r in ROWS)}
json.dump(stats,open(os.path.join(OUT_JS,"stats.json"),"w"),indent=2)
print("surface",n,"solid",int(occ.sum()))
print(json.dumps(stats))