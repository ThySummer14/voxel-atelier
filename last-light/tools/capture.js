async page => {
  await page.goto('http://127.0.0.1:8899/last-light/?capture=1', {waitUntil:'load'});
  await page.waitForFunction(() => window.artwork);
  for (const [name, shot, light, w, h] of [
    ['overview','overview','sun',1800,1250],
    ['surface','surface','sun',1800,1100],
    ['lander','lander','sun',1500,1200],
    ['rover','rover','sun',1500,1200],
    ['cover','overview','sun',1600,1000],
  ]) {
    const download = page.waitForEvent('download');
    await page.evaluate(async ([shot,light,w,h,name]) => {
      await window.artwork.setView(shot,true);
      window.artwork.setLight(light);
      const a = document.createElement('a');
      a.href = window.artwork.capture(w,h);
      a.download = name + '.png';
      a.click();
    }, [shot,light,w,h,name]);
    await (await download).saveAs(name + '.png');
  }
}
