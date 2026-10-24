#!/usr/bin/env python3
"""一键验收：起服务 → 离线断言 → 浏览器断言 → 全套出图，任何一步红就非 0 退出。
  python3 tools/serve-and-accept.py [--shots cover,lume,...] [--skip-shots]
"""
import argparse, os, subprocess, sys, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ap = argparse.ArgumentParser()
ap.add_argument("--port", type=int, default=8931)
ap.add_argument("--shots", default="cover,front,dial,low,macro,cage,balance,barrel,lume,explode,loupe,hack,wound,drained")
ap.add_argument("--skip-shots", action="store_true")
A = ap.parse_args()
URL = f"http://127.0.0.1:{A.port}/"

log = open("/tmp/jx-serve.log", "w")
proc = subprocess.Popen(["node", os.path.join(HERE, "serve.cjs")], cwd=ROOT, stdout=log, stderr=subprocess.STDOUT,
                        env={**os.environ, "PORT": str(A.port)})
try:
    for _ in range(60):
        try:
            body = urllib.request.urlopen(URL, timeout=1).read()
            if "机心" in body.decode("utf-8", "replace"):
                break
        except Exception:
            time.sleep(0.4)
    else:
        print("服务未起来（或端口上跑的是别的项目）", file=sys.stderr)
        sys.exit(1)

    steps = [("离线断言 node tools/accept-node.mjs", ["node", os.path.join(HERE, "accept-node.mjs")])]
    steps.append(("浏览器断言 accept-web.py", ["python3", os.path.join(HERE, "accept-web.py"), "--url", URL]))
    if not A.skip_shots:
        steps.append(("全套出图 shoot.py", ["python3", os.path.join(HERE, "shoot.py"), "--url", URL,
                                                 "--out", os.path.join(ROOT, "renders"), "--shots", A.shots]))
    rc = 0
    for name, cmd in steps:
        print(f"\n\033[1m=== {name} ===\033[0m")
        r = subprocess.run(cmd, cwd=ROOT)
        print(f"→ {name}: exit={r.returncode}")
        rc = rc or r.returncode
    tag = "\033[32m全部通过\033[0m" if rc == 0 else "\033[31m有失败\033[0m"
    print("\n" + tag + "  (服务日志 /tmp/jx-serve.log)")
    sys.exit(rc)
finally:
    proc.terminate()
    try:
        proc.wait(5)
    except Exception:
        proc.kill()
