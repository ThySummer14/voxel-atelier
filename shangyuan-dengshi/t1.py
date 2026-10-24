import numpy as np, time, voxlib as V, render as R
g=V.Grid(48,44,48)
g.jitter_box(0,48,0,3,0,48,1,(150,152,150),seed=1)
g.jitter_box(4,14,3,16,4,14,2,(228,222,205),seed=2)
g.jitter_box(30,42,3,20,30,42,4,(120,70,50),seed=3)
g.box(3,15,16,18,3,15,5,(60,90,90)); g.box(31,43,20,22,29,43,5,(90,70,60))
g.box(20,24,3,14,20,24,3,(110,80,55))
g.box(20,24,10,14,20,24,7,(255,200,120))
g.box(6,12,3,8,28,34,7,(255,170,110))
g.mask_write(0,0,0,np.zeros((1,1,1),bool),0,(0,0,0))
sc=dict(sky_zenith=(0.055,0.075,0.14),sky_horizon=(0.16,0.20,0.30),
 sun_dir=(0.2,1.0,0.25),sun_color=(0.85,0.80,0.62),sky_ambient=(0.32,0.40,0.60),
 lamp_gain=2.2,fog=0.012,fog_blur=3.5,fog_lamp=0.8,stars=0.6,moon_dir=(-0.4,0.75,-0.5),
 moon_r=0.03,emit_gain=1.6,bloom_amt=1.0,sky_rim=(0.06,0.08,0.14))
t=time.time(); bk=R.Baked(g,sc); print('bake %.2fs'%(time.time()-t))
for i,(eye,tgt) in enumerate([((66,26,66),(24,9,24)),((24,10,68),(24,12,24)),((24,42,24),(24,4,24))]):
    cam=R.Camera(eye,tgt,fov=45,W=560,H=340)
    t=time.time(); img=R.render(bk,cam,spp=2,seed=i); print('render%d %.2fs'%(i,time.time()-t))
    R.save_png(R.post(img,sc,exposure=1.5,bloom=1.0),'out/t1_%d.png'%i)
print('ok')
