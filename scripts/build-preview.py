# -*- coding: utf-8 -*-
"""Build a file-openable review copy without changing production source."""
from pathlib import Path
import base64
import re

root = Path(__file__).resolve().parents[1]
out = root / 'preview'
out.mkdir(exist_ok=True)
pages = ['index.html', 'menu.html', 'blog/index.html', 'blog/posts/post.html', 'privacy.html', '404.html']
for name in pages:
    page = root / name
    relative_root = '../' * (len(Path(name).parts)-1) or './'
    html = page.read_text()
    html = re.sub(r'<div id="site-header">.*?</header></div>', '<div id="site-header">'+(root/'partials/header.html').read_text()+'</div>', html, flags=re.S)
    html = re.sub(r'<div id="site-bottom">.*?</section></div>', '<div id="site-bottom">'+(root/'partials/bottom.html').read_text()+'</div>', html, flags=re.S)
    html = re.sub(r'<link rel="stylesheet"[^>]+>', '<style>'+(root/'style.css').read_text()+'</style>', html)
    def inline_script(match):
        source = (page.parent / match.group(1)).resolve()
        code = source.read_text()
        if source.name == 'common.js':
            code = code.replace("new URL('.', document.currentScript.src)", 'new URL('+repr(relative_root)+', location.href)')
            code = code.replace("await Promise.all([loadPartial('site-header','partials/header.html'),loadPartial('site-bottom','partials/bottom.html')]);", '// Review copy already contains the site partials.')
        if source.name == 'blog.js':
            code = "document.addEventListener('DOMContentLoaded',()=>{const el=document.getElementById('posts-list');if(el)el.textContent='お店からのお知らせは、こちらでご紹介していきます。';const article=document.getElementById('article');if(article)article.textContent='記事が指定されていません。お知らせ一覧から記事をお選びください。';});"
        return '<script>'+code.replace('</script','<\\/script')+'</script>'
    html = re.sub(r'<script src="([^"]+)" defer></script>', inline_script, html)
    def inline_image(match):
        attr, src = match.group(1), match.group(2)
        file = (page.parent/src).resolve()
        if not file.is_file(): return match.group(0)
        mime = 'image/svg+xml' if file.suffix=='.svg' else 'image/jpeg'
        return attr+'="data:'+mime+';base64,'+base64.b64encode(file.read_bytes()).decode()+'"'
    html = re.sub(r'(src|href)="((?:\.\./|\./)*images/[^"]+)"', inline_image, html)
    def review_link(match):
        route=match.group(1)
        path,sep,fragment=route.partition('#')
        if not path or path.endswith('/'):path+='index.html'
        return 'href="'+relative_root+path+(sep+fragment if sep else '')+'"'
    html = re.sub(r'href="/bound-garden-site/([^\"]*)"', review_link, html)
    target=out/name
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(html)
print(out/'index.html')
