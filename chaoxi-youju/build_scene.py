import bpy, math, random, os, sys, json
from mathutils import Vector
random.seed(29)
OUT=os.path.dirname(os.path.abspath(__file__))
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
M={}; batches={}; group='Terrain'
def mat(n,c,rough=.7,em=0,metal=0):
 m=bpy.data.materials.new(n); m.diffuse_color=(*c,1); m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
 if em:p.inputs['Emission Color'].default_value=(*c,1);p.inputs['Emission Strength'].default_value=em
 M[n]=m
for n,c in {'stone':(.19,.27,.31),'rockdark':(.105,.17,.22),'rocklight':(.28,.37,.38),'rockwarm':(.36,.37,.34),'grass':(.19,.32,.27),'grasslight':(.28,.39,.29),'path':(.60,.57,.43),'plaster':(.79,.73,.56),'white':(.9,.84,.65),'red':(.49,.18,.13),'roof':(.48,.18,.14),'rooflight':(.65,.28,.17),'wood':(.22,.14,.095),'woodlight':(.41,.27,.15),'trim':(.12,.23,.25),'brass':(.58,.40,.14),'ink':(.09,.15,.21),'paper':(.83,.76,.55),'leaf':(.19,.33,.28),'leaflight':(.32,.43,.29),'pink':(.68,.31,.25)}.items():mat(n,c)
for i in range(8):mat('water'+str(i),(.035+i*.005,.19+i*.008,.235+i*.011),.28,.0,.22)
mat('foam',(.37,.65,.62),.5);mat('glow',(1,.48,.11),.35,4);mat('window',(1,.53,.19),.4,1.3)
def box(n,x,y,z,sx,sy,sz):
 key=(group,n);v,f=batches.setdefault(key,([],[]));i=len(v)
 v.extend([(x+a*sx/2,y+b*sy/2,z+c*sz/2) for a,b,c in [(-1,-1,-1),(-1,-1,1),(-1,1,-1),(-1,1,1),(1,-1,-1),(1,-1,1),(1,1,-1),(1,1,1)]])
 f.extend([tuple(i+t for t in q) for q in [(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3),(0,2,3,1),(4,5,7,6)]])
def cube(n,x,y,z,s=.2):box(n,x,y,z,s,s,s)
def light(name,pos,power,color,size=1):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=color;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=pos;return o
def aim(o,target):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
# Tide tray with individually colored square water surface, uninterrupted negative space.
group='Tidal water'
box('ink',0,0,-.38,15.6,13,.65)
for ix in range(-39,39):
 for iy in range(-32,33):
  x=ix*.2+.1;y=iy*.2;w=math.sin(x*1.1+y*.35)+math.sin(y*1.8-x*.4)
  box('water'+str(max(0,min(7,int(3+w+random.random()*1.4)))),x,y,-.012,.2,.2,.15)
# Rock island: stratified chipped columns on a strict 0.2 grid.
group='Stratified cliff'
for ix in range(-21,22):
 for iy in range(-14,20):
  x=ix*.2;y=iy*.2;r=(x/4.1)**2+((y-.6)/3.1)**2
  edge=1+.07*math.sin(iy*1.7)+.05*math.sin(ix*.9)
  if r>edge:continue
  top=3.35 if r<.69 else 3.35-round((r-.69)*8)*.2
  top=max(.6,top)
  for k in range(int(top/.4)):
   z=.2+k*.4;n=random.choices(['stone','rockdark','rocklight','rockwarm'],[50,13,23,4])[0]
   if k in (1,4):n='rockdark' if random.random()<.7 else n
   box(n,x,y,z,.2,.2,.4)
  box('stone',x,y,top-.1,.2,.2,.2)
  box(random.choice(['grass']*4+['grasslight']),x,y,top+.01,.2,.2,.15)
# Square paving spine and forecourt.
group='Island paving'
for ix in range(-15,13):
 for iy in range(-9,9):
  x=ix*.2;y=iy*.2
  if abs(y+.55)<.5 or (-1.9<x<.25 and -1.6<y<1.0):box(random.choice(['path','path','rockwarm']),x,y,3.48,.19,.19,.12)
# Post office lower mass on west side. Front faces -Y.
group='Post office'
x=-1.7;y=.65;z=3.5
box('plaster',x,y,z+1.03,2.55,2.15,2.06)
for zz in [3.6,5.4]:box('white',x,y,zz,2.68,2.26,.14)
for xx in [x-1.19,x+1.19]:box('trim',xx,y-1.11,4.5,.13,.12,1.7)
# Door and framed window recess illusion built outward.
box('wood',-1.62,-.445,4.2,.62,.12,1.35);box('window',-1.62,-.516,4.50,.38,.03,.46)
cube('brass',-1.41,-.54,4.08,.065)
def frontwindow(x,y,z,w=.6,h=.7):
 box('trim',x,y,z,w+.16,.14,h+.16);box('window',x,y-.08,z,w,.04,h)
 box('white',x,y-.115,z,.055,.04,h);box('white',x,y-.115,z,w,.04,.055);box('white',x,y-.05,z-h/2-.08,w+.27,.26,.09)
frontwindow(-2.43,-.48,4.65,.58,.7);frontwindow(-.83,-.48,4.65,.48,.7)
# East side window.
box('trim',-.397,.62,4.65,.1,.85,.9);box('window',-.335,.62,4.65,.025,.68,.72)
for yy in [.39,.84]:box('white',-.31,yy,4.65,.04,.04,.74)
# Structurally closed stepped gable ends.
for side in [-1,1]:
 for row in range(7):box('plaster',x+side*1.22,y,5.55+row*.16,.13,max(.12,2.2-row*.32),.18)
# Stepped gabled roof tiles, each visible course square profile.
for row in range(7):
 for side in [-1,1]:
  yy=y+side*(1.22-row*.18);zz=5.53+row*.16
  for col in range(15):box(random.choice(['roof']*3+['rooflight']),x-1.4+col*.2,yy,zz,.198,.25,.18)
box('rooflight',x,y,6.55,3.04,.25,.18)
box('rockwarm',-2.3,1.1,6.45,.38,.38,1.05);box('stone',-2.3,1.1,7,.5,.5,.15)
# Small dormer on front roof.
box('plaster',-1.35,-.02,5.83,.65,.46,.64);frontwindow(-1.35,-.27,5.84,.34,.36)
for j in range(3):box('roof',-1.35,-.01,6.21+j*.1,.83-j*.2,.69,.1)
# Awning and hanging square post-office sign with envelope mark.
for i in range(10):box('red' if i%2 else 'white',-2.75+i*.22,-.82,5.13,.22,.65,.13)
box('wood',-.32,-.58,5.47,.10,.95,.10);box('brass',-.32,-.95,5.04,.58,.08,.58)
box('paper',-.32,-1,5.04,.4,.025,.27)
for i in range(4):cube('wood',-.47+i*.1,-1.025,5.12-abs(i-1.5)*.055,.047)
# Lighthouse: square taper, precise stepped cornices, brick banding.
group='Lighthouse';lx=1.55;ly=1.02
box('rocklight',lx,ly,3.68,1.95,1.95,.4)
for k in range(20):
 s=1.52-k*.021;zz=3.96+k*.2
 box('red' if k in (7,8,9) else 'white',lx,ly,zz,s,s,.2)
 if k%3==0:
  for xx in [-.45,.15]:box('plaster',lx+xx,ly-s/2-.004,zz,.27,.009,.11)
box('trim',lx,ly-.78,4.1,.58,.12,1.0)
box('wood',lx,ly-.85,4.08,.42,.06,.86)
cube('brass',lx+.13,ly-.9,4.04,.055)
for zz in [5.2,6.8]:frontwindow(lx,ly-(1.52-(zz-3.96)*.105)/2-.03,zz,.26,.56)
box('trim',lx,ly,8.04,1.74,1.74,.18);box('stone',lx,ly,8.16,2.15,2.15,.12)
# Gallery railing, clear lantern frame instead of opaque glass.
for side in [-1,1]:
 for i in range(7):
  q=-.99+i*.33
  box('trim',lx+q,ly+side*.99,8.43,.047,.047,.5);box('trim',lx+side*.99,ly+q,8.43,.047,.047,.5)
 box('brass',lx,ly+side*.99,8.68,2.05,.06,.06);box('brass',lx+side*.99,ly,8.68,.06,2.05,.06)
for xx in [-.59,.59]:
 for yy in [-.59,.59]:box('trim',lx+xx,ly+yy,8.95,.1,.1,1.47)
box('brass',lx,ly,8.4,1.31,1.31,.12);box('glow',lx,ly,8.95,.44,.44,.77)
for k in range(4):box('brass',lx,ly,8.64+k*.2,.69,.69,.04)
box('trim',lx,ly,9.65,1.47,1.47,.13)
for k in range(5):box('red',lx,ly,9.79+k*.12,1.75-k*.29,1.75-k*.29,.14)
box('brass',lx,ly,10.37,.085,.085,.3)
# path to lighthouse entrance and stairs down western face: solid retained stair mass.
group='Harbor stairs'
for k in range(17):
 yy=-1.05-k*.2;top=3.45-k*.17
 box('path',-2.95,yy,top-.09,.84,.2,.18)
 box('stone',-2.95,yy,(top-.18)/2,.75,.19,max(.05,top-.18))
 if k%3==0:
  box('wood',-3.42,yy,top+.3,.08,.08,.64)
  box('wood',-2.48,yy,top+.3,.08,.08,.64)
# stepped handrails horizontal lengths per flight.
for k in range(16):
 for xx in [-3.42,-2.48]:box('woodlight',xx,-1.15-k*.2,3.99-k*.17,.07,.24,.075)
# Jetty extending to water, supported piles.
group='Mail landing'
for k in range(19):box('woodlight' if k%3 else 'wood',-2.95,-4.3-k*.1,.69,1.4,.085,.12)
for xx in [-3.56,-2.34]:
 for yy in [-4.35,-5.15,-6]:
  box('wood',xx,yy,.48,.16,.16,1.4);box('paper',xx,yy,1.22,.21,.21,.12)
# Bench and parcel stack.
group='Harbor objects'
box('wood',-2.75,-.92,3.85,.8,.32,.12)
for xx in [-3.05,-2.45]:box('trim',xx,-.92,3.66,.06,.22,.35)
for x,y,z,s in [(-3.18,-4.65,.94,.36),(-2.75,-4.7,.91,.31),(-3.1,-4.66,1.24,.24)]:
 cube('paper',x,y,z,s);box('red',x,y,z+s/2+.004,s*.18,s,.013)
# Post box and pedestrian, tiny but readable.
box('red',-.15,-1.02,3.93,.3,.29,.8);box('ink',-.15,-1.174,4.1,.2,.015,.06)
for xx in [.39,.52]:box('ink',xx,-1.2,3.67,.09,.1,.36)
box('pink',.455,-1.2,3.99,.29,.16,.35);cube('paper',.455,-1.2,4.29,.2);box('ink',.455,-1.2,4.405,.27,.23,.065)
# Boat: voxel hull pointed by layered courses, inside seat, mastless mail launch.
group='Mail boat';bx=-.95;by=-4.8
for k in range(3):
 for j in range(12):
  yy=by+(j-5.5)*.14; width=.74 if 2<j<9 else (.56 if j in (2,9) else .36)
  box('red' if k<2 else 'white',bx,yy,.20+k*.13,width,.14,.13)
box('wood',bx,by,.62,.57,1.24,.1)
for yy in [by-.43,by+.4]:box('woodlight',bx,yy,.78,.69,.18,.14)
box('trim',bx,by+.05,.91,.55,.52,.52);box('window',bx,by-.218,.98,.38,.02,.23);box('white',bx,by+.04,1.21,.7,.7,.1)
for j in range(5):cube('foam',bx+.44,by-.45+j*.2,.085,.08)
# Small wind-bent voxel trees, garden patches, grasses.
group='Island vegetation'
for tx,ty,h in [(-3,1.85,1.6),(-.3,2.65,1.8),(3.15,1.9,1.35)]:
 box('wood',tx,ty,3.5+h/2,.16,.16,h)
 for k in range(4):
  s=.94-k*.18;zz=3.9+h*.4+k*.23
  for ix in range(-2,3):
   for iy in range(-2,3):
    if abs(ix)+abs(iy)<4:cube(random.choice(['leaf','leaflight']),tx+ix*s/5+.08*k,ty+iy*s/5,zz,s/4)
for i in range(80):
 x=random.uniform(-3.4,3.4);y=random.uniform(-1.3,2.9)
 if ((x/3.7)**2+((y-.6)/2.6)**2)>.8 or (-3.1<x<2.4 and -1.4<y<2):continue
 box(random.choice(['grasslight','leaflight']),x,y,3.62,.07,.07,random.uniform(.18,.38))
# Sparse shore foam, detached grounded stones.
group='Shore details'
for i in range(75):
 a=random.uniform(0,math.tau);r=random.uniform(1.04,1.15);x=4.1*math.cos(a)*r;y=.6+3.1*math.sin(a)*r
 if y<-3.7 or x<-3.6:continue
 box('foam',round(x/.1)*.1,round(y/.1)*.1,.1,random.choice([.1,.2,.3]),.08,.025)
for x,y,s in [(4.3,.2,.5),(3.95,-1.45,.65),(3.5,-2.1,.35),(-4,1,.4)]:
 cube('stone',x,y,s*.3,s);box('grass',x,y,s*.8,s,.9*s,.09)
# Assemble efficient semantic/material meshes.
for (g,n),(v,f) in batches.items():
 mesh=bpy.data.meshes.new(g+' '+n);mesh.from_pydata(v,[],f);mesh.materials.append(M[n]);mesh.update();ob=bpy.data.objects.new(g+' | '+n,mesh);bpy.context.collection.objects.link(ob)
# Matte studio backdrop, no external assets.
mat('backdrop',(.047,.088,.14),.9);group='Backdrop';bpy.ops.mesh.primitive_plane_add(size=200, location=(0,0,-.73));bpy.context.object.name='Backdrop';bpy.context.object.data.materials.append(M['backdrop'])
scene=bpy.context.scene;scene.world.color=(.12,.12,.12);scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.16,.24,.38,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.35
for name,pos,power,col,size in [('Moon softbox',(-7,-1,15),1900,(.51,.70,1),8),('Warm horizon',(-3,-8,10),1250,(1,.74,.46),7),('Sea rim',(6,5,13),2300,(.31,.67,.88),6)]:o=light(name,pos,power,col,size);aim(o,(0,0,3))
d=bpy.data.lights.new('Beacon warm bounce','POINT');d.energy=90;d.color=(1,.39,.08);d.shadow_soft_size=.38;o=bpy.data.objects.new(d.name,d);bpy.context.collection.objects.link(o);o.location=(lx,ly,8.95)
o=light('Post office spill',(-1.6,-.9,4.7),45,(1,.43,.12),1);aim(o,(-1.6,-3,3.3))
bpy.ops.object.camera_add(location=(15,-22,17));cam=bpy.context.object;cam.name='Hero camera';aim(cam,(0,0,4.0));cam.data.type='ORTHO';cam.data.ortho_scale=20.5;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=192;scene.cycles.use_denoising=False;scene.render.threads_mode='FIXED';scene.render.threads=4
scene.render.resolution_x=1800;scene.render.resolution_y=1800;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.use_nodes=True;tree=scene.node_tree;tree.nodes.clear();rl=tree.nodes.new('CompositorNodeRLayers');gl=tree.nodes.new('CompositorNodeGlare');gl.glare_type='FOG_GLOW';gl.quality='HIGH';gl.threshold=1.7;gl.size=7;gl.mix=-.92;out=tree.nodes.new('CompositorNodeComposite');tree.links.new(rl.outputs['Image'],gl.inputs[0]);tree.links.new(gl.outputs[0],out.inputs[0])
scene['Artwork']='潮汐邮局 / The Tidal Post';scene['Authoring']='Original procedural voxel geometry. No stock assets.'
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/tidal_post.blend')
# Portable export excludes studio floor and light rig; correct material colors remain.
bpy.ops.object.select_all(action='DESELECT')
for ob in scene.objects:
 if ob.type=='MESH' and ob.name!='Backdrop':ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=OUT+'/tidal_post.glb',export_format='GLB',use_selection=True)
scene.render.resolution_percentage=100;scene.render.filepath=OUT+'/tidal_post_hero.png';bpy.ops.render.render(write_still=True)
print('ARTWORK_READY',len(bpy.data.objects),sum(len(o.data.vertices) for o in scene.objects if o.type=='MESH'))
