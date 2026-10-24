from pathlib import Path
import base64
root=Path(__file__).parent
html=(root/'dist/index.html').read_text()
css=(root/'dist/style.css').read_text()
js=(root/'dist/scene.js').read_text().replace('</script','<\\/script')
svg=base64.b64encode((root/'dist/favicon.svg').read_bytes()).decode()
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
html=html.replace('href="favicon.svg"','href="data:image/svg+xml;base64,'+svg+'"')
html=html.replace('<script src="scene.js"></script>','<script>'+js+'</script>')
html+='\n<!-- Third-party license: '+(root/'dist/THREE-LICENSE.txt').read_text().replace('--','—')+' -->\n'
(root/'夜航·潮汐终点站.html').write_text(html)
print('Portable HTML saved:', (root/'夜航·潮汐终点站.html').stat().st_size, 'bytes')
