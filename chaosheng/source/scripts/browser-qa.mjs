// Run with playwright-cli run-code --filename scripts/browser-qa.mjs.
async (page) => {
  const checks=[];
  const assert=(condition,message)=>{if(!condition)throw new Error(message);checks.push(message);};
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.setViewportSize({width:1600,height:1000});
  await page.emulateMedia({colorScheme:'light',reducedMotion:'no-preference'});
  await page.reload();
  await page.waitForFunction(()=>window.__TIDEBORN__?.diagnostics().ready);
  await page.waitForTimeout(600);
  const diagnostics=()=>page.evaluate(()=>window.__TIDEBORN__.diagnostics());
  assert((await diagnostics()).boxes===19385,'Final scene contains 19,385 cuboids');
  const viewNames=['01 全岛','02 灯塔','03 渔港','04 风车','05 街巷'];
  for(let i=0;i<viewNames.length;i++){
    await page.getByRole('button',{name:viewNames[i],exact:true}).click();
    await page.waitForTimeout(1750);
    const d=await diagnostics();
    assert(d.view===i&&d.cameraZoom>0,`Camera ${i+1} reaches the requested view`);
    if(i)assert(await page.locator('#story').getAttribute('aria-hidden')==='false',`Camera ${i+1} opens its landmark story`);
    await page.screenshot({path:`output/playwright/qa-view-${i+1}.png`});
  }
  await page.getByRole('button',{name:'01 全岛',exact:true}).click();
  await page.waitForTimeout(1750);
  for(const [label,key]of [['晨光','morning'],['日落','sunset'],['入夜','night']]){
    await page.getByRole('button',{name:label,exact:true}).click();
    await page.waitForTimeout(1950);
    assert((await diagnostics()).mood===key,`${key} lighting and UI state are synchronized`);
    await page.screenshot({path:`output/playwright/qa-${key}.png`});
  }
  const before=await page.evaluate(()=>window.__TIDEBORN__.scene.getObjectByName('mill-sails').rotation.z);
  await page.waitForTimeout(180);
  const after=await page.evaluate(()=>window.__TIDEBORN__.scene.getObjectByName('mill-sails').rotation.z);
  assert(before!==after,'Windmill animation advances over time');
  await page.getByRole('button',{name:'海风音景',exact:true}).click();
  assert((await diagnostics()).audioEnabled,'Soundscape starts after an explicit click');
  await page.getByRole('button',{name:'海风已开启',exact:true}).click();
  assert(!(await diagnostics()).audioEnabled,'Soundscape switches off');
  await page.getByRole('button',{name:'随海风环游',exact:true}).click();
  await page.waitForTimeout(250);
  assert(await page.evaluate(()=>window.__TIDEBORN__.controls.autoRotate),'Tour starts orbiting');
  await page.mouse.move(940,460);await page.mouse.down();await page.mouse.move(1010,480,{steps:10});await page.mouse.up();
  assert(!(await page.evaluate(()=>window.__TIDEBORN__.controls.autoRotate)),'Dragging interrupts the tour');
  await page.getByRole('button',{name:'回到全景',exact:true}).click();await page.waitForTimeout(1750);
  const zoom=(await diagnostics()).cameraZoom;
  await page.getByRole('button',{name:'放大',exact:true}).click();
  assert((await diagnostics()).cameraZoom>zoom,'Zoom-in changes the camera');
  await page.getByRole('button',{name:'缩小',exact:true}).click();
  assert(Math.abs((await diagnostics()).cameraZoom-zoom)<0.0001,'Zoom-out restores the previous scale');
  await page.getByRole('button',{name:'全屏欣赏',exact:true}).click();
  await page.waitForFunction(()=>Boolean(document.fullscreenElement));
  assert(await page.evaluate(()=>Boolean(document.fullscreenElement)),'Fullscreen opens');
  await page.evaluate(()=>document.exitFullscreen());
  await page.getByRole('button',{name:'作品手记',exact:true}).click();
  assert(await page.locator('#about-panel').getAttribute('aria-hidden')==='false','Field notes drawer opens');
  const modelDownload=page.waitForEvent('download');
  await page.getByRole('link',{name:'带走这座岛',exact:false}).click();
  const model=await modelDownload;await model.saveAs('output/潮生-TIDEBORN.vox');
  assert((await model.failure())===null,'VOX download succeeds');
  await page.keyboard.press('Escape');
  assert(await page.locator('#about-panel').getAttribute('aria-hidden')==='true','Escape closes the drawer');
  for(const [label,key,filename]of [['日落','sunset','output/潮生-TIDEBORN-日落.png'],['入夜','night','output/潮生-TIDEBORN-入夜.png']]){
    await page.getByRole('button',{name:label,exact:true}).click();await page.waitForTimeout(1950);
    const downloadPromise=page.waitForEvent('download');
    await page.getByRole('button',{name:'保存画面',exact:true}).click();
    const download=await downloadPromise;await download.saveAs(filename);
    assert((await download.failure())===null,`${key} high-resolution PNG downloads successfully`);
    await page.waitForFunction(()=>!window.__TIDEBORN__.diagnostics().exporting);
  }
  await page.getByRole('button',{name:'日落',exact:true}).click();await page.waitForTimeout(1950);
  for(const [width,height]of [[880,977],[1024,768]]){
    await page.setViewportSize({width,height});
    await page.getByRole('button',{name:'01 全岛',exact:true}).click();await page.waitForTimeout(1750);
    assert(await page.locator('.landmark:visible').count()===4,`All four landmarks fit the ${width}px viewport`);
    await page.screenshot({path:`output/playwright/qa-responsive-${width}.png`});
  }
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'01 全岛',exact:true}).click();await page.waitForTimeout(1750);
  const nav=await page.locator('.camera-nav').boundingBox();
  assert(nav.x>=0&&nav.x+nav.width<=390,'Mobile camera navigation fits the viewport');
  await page.screenshot({path:'output/playwright/qa-mobile.png'});
  await page.getByRole('button',{name:'04 风车',exact:true}).click();await page.waitForTimeout(1750);
  assert((await diagnostics()).cameraZoom>4,'Mobile detail view uses its own framing');
  await page.getByRole('button',{name:'作品手记',exact:true}).click();
  const panel=await page.locator('#about-panel').boundingBox();
  assert(panel.x>=0&&panel.x+panel.width<=391,'Mobile notes drawer fits the viewport');
  await page.keyboard.press('Escape');
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
  await page.waitForFunction(()=>window.__TIDEBORN__?.diagnostics().ready);
  const staticBefore=await page.evaluate(()=>window.__TIDEBORN__.scene.getObjectByName('mill-sails').rotation.z);
  await page.waitForTimeout(250);
  const staticAfter=await page.evaluate(()=>window.__TIDEBORN__.scene.getObjectByName('mill-sails').rotation.z);
  assert(staticBefore===staticAfter&&(await diagnostics()).reducedMotion,'Reduced motion keeps environment animation still');
  await page.getByRole('button',{name:'随海风环游',exact:true}).click();
  assert(!(await page.evaluate(()=>window.__TIDEBORN__.controls.autoRotate)),'Reduced motion avoids automatic orbiting');
  await page.setViewportSize({width:1600,height:1000});
  await page.emulateMedia({colorScheme:'light',reducedMotion:'no-preference'});await page.reload();
  await page.waitForFunction(()=>window.__TIDEBORN__?.diagnostics().ready);await page.waitForTimeout(750);
  const frameTiming=await page.evaluate(()=>new Promise(resolve=>{
    const times=[];let last;
    function sample(t){if(last!==undefined)times.push(t-last);last=t;if(times.length<90)requestAnimationFrame(sample);else{times.sort((a,b)=>a-b);resolve({medianFrameMs:times[45],p95FrameMs:times[85],meanFrameMs:times.reduce((a,b)=>a+b,0)/times.length});}}
    requestAnimationFrame(sample);
  }));
  assert(errors.length===0,'No JavaScript or browser console errors during the full journey');
  await page.screenshot({path:'output/playwright/潮生-交互界面.png'});
  await page.evaluate(result=>window.__QA_RESULTS__=result,{checks,errors,frameTiming,diagnostics:await diagnostics()});
}
