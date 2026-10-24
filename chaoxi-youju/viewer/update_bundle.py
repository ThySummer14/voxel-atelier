from pathlib import Path
import re,base64
p=Path(__file__).resolve().parent.parent
h=p/'潮汐邮局_离线3D.html';s=h.read_text();s=re.sub(r'<script id="model-data" type="application/octet-stream">.*?</script>', '<script id="model-data" type="application/octet-stream">'+base64.b64encode((p/'tidal_post.glb').read_bytes()).decode()+'</script>',s)
s=s[:s.rfind('<script>')]+'<script>'+(p/'viewer/bundle.js').read_text()+'</script></html>';h.write_text(s)
