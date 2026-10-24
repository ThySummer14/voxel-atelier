import numpy as np, time, voxlib as V, render as R, parts as P
g=V.Grid(140,70,140)
t=time.time()
P.shophouse(g,20,44,30,44,2,2,(9,8),facing=1,seed=1,lantern_n=3)
P.shophouse(g,50,74,30,44,2,2,(9,8),facing=1,seed=2,lantern_n=2)
P.lantern_tower(g,100,40,2,levels=4,r0=8,dr=1.5,fh=9,seed=3)
P.arch_bridge(g,10,60,60,84,14,rise=3,arches=3,arch_h=9,arch_w=10)
P.tree(g,90,2,100,22,6,1,'willow')
P.tree(g,110,2,20,18,6,2,'round')
P.stall(g,80,92,60,70,2,3)
P.boat(g,40,4,100,16,5,along='x',cabin=True,with_lantern=True,seed=1)
print('build %.2fs'%(time.time()-t), 'nonair', int((g.mat!=0).sum()))
print(g.stats())
sc=dict(sky_zenith=(0.05,0.07,0.13),sky_horizon=(0.14,0.18,0.28),
 sun_dir=(0.35,1.0,0.4),sun_color=(0.62,0.60,0.52),sky_ambient=(0.30,0.38,0.56),
 lamp_gain=2.0,fog=0.010,fog_blur=3.5,fog_lamp=0.9,stars=0.5,moon_dir=(-0.4,0.8,-0.45),
 moon_r=0.028,emit_gain=1.5,bloom_amt=1.0,bloom_thr=0.7,sky_rim=(0.06,0.08,0.15),
 lamp_iters=26,lamp_decay=0.76,spec_blur=2.5)
t=time.time(); bk=R.Baked(g,sc); print('bake %.2fs'%(time.time()-t))
cams=[((150,60,150),(60,20,60),48),((60,44,140),(60,26,60),55),((20,40,10),(60,20,60),50)]
for i,(eye,tgt,fov) in enumerate(cams):
    cam=R.Camera(eye,tgt,fov=fov,W=640,H=380)
    t=time.time(); img=R.render(bk,cam,spp=2,seed=i); print('render%d %.2fs'%(i,time.time()-t))
    R.save_png(R.post(img,sc,exposure=1.6,bloom=1.0),'out/t2_%d.png'%i)
print('ok')
