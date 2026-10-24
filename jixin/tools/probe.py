#!/usr/bin/env python3
"""临时探针：在真浏览器里读场景状态，定位"画面全黑"这类问题。"""
import json, sys
from playwright.sync_api import sync_playwright

CODE = r"""
() => {
  const J = window.JX;
  const out = { keys: Object.keys(J), probe: J.probe(), pick: J.pick(innerWidth/2, innerHeight/2), stats: J.stats() };
  const c = document.querySelector('canvas');
  out.canvas = c ? [c.width, c.height, c.clientWidth, c.clientHeight] : null;
  out.gl = (() => { try { const g = c.getContext('webgl2'); return g ? (g.getParameter(g.VERSION) + ' | ' + g.getParameter(g.RENDERER)) : 'none'; } catch (e) { return 'err:' + e.message; } })();
  const gl2 = J._gl;
  if (gl2) out.info = { tris: gl2.info.render.triangles, calls: gl2.info.render.calls, frame: gl2.info.render.frame };
  if (J._scene) {
    const o = J._scene.children[0];
    out.root = o ? { type: o.type, n: o.children.length, pos: o.children.slice(0,3).map(x=>[x.type, x.visible, x.position.toArray().map(v=>+v.toFixed(1)), x.geometry && x.geometry.attributes.position.array.constructor.name]) } : null;
  }
  out.bodyClass = document.body.className;
  out.hudText = document.getElementById('v-time') && document.getElementById('v-time').textContent;
  return out;
}
"""

with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=metal"])
    pg = b.new_page(viewport={"width": 900, "height": 600})
    errs = []
    pg.on("console", lambda m: errs.append(m.type + ":" + m.text))
    pg.on("pageerror", lambda e: errs.append("PAGEERROR:" + str(e)))
    pg.goto(sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8931/", wait_until="load")
    pg.wait_for_function("()=>window.JX&&window.JX.ready", timeout=60000)
    pg.wait_for_timeout(1800)
    print(json.dumps(pg.evaluate(CODE), ensure_ascii=False)[:2500])
    print("ERRS", json.dumps(errs[:8], ensure_ascii=False))
    b.close()
