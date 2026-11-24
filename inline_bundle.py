import os
import re

dist_html_path = os.path.join('dist', 'index.html')
with open(dist_html_path, 'r', encoding='utf-8') as f:
    html = f.read()

assets_dir = os.path.join('dist', 'assets')
css_file = [f for f in os.listdir(assets_dir) if f.endswith('.css')][0]
js_file = [f for f in os.listdir(assets_dir) if f.endswith('.js')][0]

with open(os.path.join(assets_dir, css_file), 'r', encoding='utf-8') as f:
    css_content = f.read()

with open(os.path.join(assets_dir, js_file), 'r', encoding='utf-8') as f:
    js_content = f.read()

html_single = re.sub(r'<link[^>]*rel="stylesheet"[^>]*>', lambda m: f'<style>\n{css_content}\n</style>', html)
html_single = re.sub(r'<script[^>]*src="[^"]*"[^>]*></script>', lambda m: f'<script type="module">\n{js_content}\n</script>', html_single)

# Save as tawakal_landing_page.html
out = 'tawakal_landing_page.html'
with open(out, 'w', encoding='utf-8') as f:
    f.write(html_single)
print(f"Created {out} with size: {os.path.getsize(out)} bytes")
