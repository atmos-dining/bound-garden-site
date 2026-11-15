# -*- coding: utf-8 -*-
"""Validate site links, assets, metadata, CMS and deployment invariants."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json, xml.etree.ElementTree as ET

root=Path(__file__).resolve().parents[1]
prefix='/bound-garden-site/'
failures=[]
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]; self.ids=[]; self.scripts=[]; self.capture=False; self.current=''; self.h1=0; self.canonical=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='h1':self.h1+=1
        if tag=='a' and 'href' in a:self.links.append(a['href'])
        if tag in ['img','script'] and 'src' in a:self.links.append(a['src'])
        if tag=='link':
            if a.get('rel')=='canonical':self.canonical+=1
            if a.get('rel') in ['stylesheet','icon']:self.links.append(a['href'])
        if tag=='script' and a.get('type')=='application/ld+json':self.capture=True;self.current=''
    def handle_data(self,data):
        if self.capture:self.current+=data
    def handle_endtag(self,tag):
        if tag=='script' and self.capture:self.scripts.append(json.loads(self.current));self.capture=False
pages={}
for p in root.rglob('*.html'):
    if any(x.startswith('.') for x in p.relative_to(root).parts):continue
    parsed=Page();parsed.feed(p.read_text());pages[p]=parsed
    if len(parsed.ids)!=len(set(parsed.ids)):failures.append(str(p)+': duplicate IDs')
    if p.parent.name not in ['partials','admin']:
        if parsed.canonical!=1:failures.append(str(p)+': canonical missing')
        if p.name!='post.html' and parsed.h1!=1:failures.append(str(p)+': expected one H1')
for p,parsed in pages.items():
    for href in parsed.links:
        u=urlsplit(href)
        if u.scheme or u.netloc:continue
        path=unquote(u.path)
        if path.startswith(prefix):target=root/path[len(prefix):]
        elif path.startswith('/'):
            failures.append(str(p)+': link escapes project '+href);continue
        elif not path:target=p
        else:target=p.parent/path
        if target.is_dir():target=target/'index.html'
        if not target.is_file():failures.append(str(p)+': missing '+href)
        if u.fragment and target in pages and u.fragment not in pages[target].ids and u.fragment not in ['reservation','top','dinner']:
            failures.append(str(p)+': missing anchor '+href)
        if p.parent.name=='partials' and href.startswith('./'):failures.append(str(p)+': relative partial link')
sitemap=ET.fromstring((root/'sitemap.xml').read_text())
for loc in sitemap.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc'):
    path=urlsplit(loc.text).path
    target=root/path[len(prefix):]
    if target.is_dir():target=target/'index.html'
    if not target.is_file():failures.append('Invalid sitemap URL: '+loc.text)
assert isinstance(json.loads((root/'blog/posts.json').read_text())['posts'],list)
config=(root/'admin/config.yml').read_text()
for required in ['files:', 'file: blog/posts.json','add_to_top: true','repo: atmos-dining/bound-garden-site','public_folder: /bound-garden-site/images']:
    if required not in config:failures.append('CMS missing '+required)
if '\n    folder:' in config:failures.append('CMS folder collection forbidden')
if not (root/'.nojekyll').exists():failures.append('.nojekyll missing')
if failures:
    print('\n'.join(failures));raise SystemExit(1)
print(f'PASS: {len(pages)} HTML files; links, assets, canonical, JSON-LD, sitemap and CMS.')
