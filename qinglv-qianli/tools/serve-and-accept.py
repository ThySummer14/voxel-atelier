#!/usr/bin/env python3
"""启动零依赖静态服务，运行浏览器验收，并在 finally 中可靠停止子进程。"""
import os
import socket
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


port = free_port()
env = os.environ.copy()
env["PORT"] = str(port)
server = None
code = 1
try:
    server = subprocess.Popen(
        ["node", str(ROOT / ".serve.cjs")],
        cwd=ROOT, env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )
    url = f"http://127.0.0.1:{port}/index.html"
    for _ in range(100):
        if server.poll() is not None:
            raise RuntimeError(f"serve.cjs exited with {server.returncode}")
        try:
            with urllib.request.urlopen(url, timeout=1) as response:
                if response.status == 200:
                    break
        except Exception:
            time.sleep(0.05)
    else:
        raise RuntimeError("server did not become ready")
    result = subprocess.run(
        [sys.executable, str(ROOT / "tools" / "accept.py"), "--url", url],
        cwd=ROOT,
    )
    code = result.returncode
except Exception as exc:
    print(f"serve-and-accept: {type(exc).__name__}: {exc}", file=sys.stderr)
finally:
    if server is not None and server.poll() is None:
        server.terminate()
        try:
            server.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server.kill()
            server.wait()

sys.exit(code)
