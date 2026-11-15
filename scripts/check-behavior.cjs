// Dependency-free regressions for late GA4 availability, reservation routing and menu tabs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const listeners = new Map();
const panel = {hidden:false};
const dinner = {hidden:true};
function tab(id,selected) {
  const events = new Map();
  const attrs = {'aria-controls':id,'aria-selected':String(selected)};
  return {events,attrs,tabIndex:selected?0:-1,getAttribute:k=>attrs[k],setAttribute:(k,v)=>attrs[k]=v,addEventListener:(k,v)=>events.set(k,v),focus(){this.focused=true;}};
}
const lunchTab=tab('lunch-panel',true), dinnerTab=tab('dinner-panel',false);
const document={
  currentScript:{src:'https://atmos-dining.github.io/bound-garden-site/common.js'},
  querySelectorAll:q=>q==='[role="tab"]'?[lunchTab,dinnerTab]:[],
  querySelector:()=>null,
  getElementById:id=>({'lunch-panel':panel,'dinner-panel':dinner}[id]||null),
  addEventListener:(type,cb)=>listeners.set(type,cb)
};
const window={SITE_CONFIG:{measurementId:''}};
const context=vm.createContext({document,window,URL,console,location:{href:'https://atmos-dining.github.io/bound-garden-site/menu.html',hash:''},matchMedia:()=>({addEventListener(){}})});
vm.runInContext(fs.readFileSync(path.join(root,'common.js'),'utf8'),context);
(async()=>{
  await listeners.get('DOMContentLoaded')();
  assert.equal(typeof listeners.get('click'),'function','GA4 listener is registered before gtag loads');
  const click=href=>({target:{closest:()=>({getAttribute:()=>href,hasAttribute:()=>false,textContent:'テスト'})}});
  listeners.get('click')(click('tel:0929634777')); // Must not throw when GA4 is unavailable.
  const events=[];
  window.gtag=(...args)=>events.push(args);
  listeners.get('click')(click('tel:0929634777'));
  listeners.get('click')({target:{closest:()=>({getAttribute:()=> 'https://tabelog.com/fukuoka/A4001/A400201/40073441/',hasAttribute:k=>k==='data-reservation',textContent:'食べログで予約'})}});
  listeners.get('click')(click('https://www.instagram.com/bound.garden/'));
  assert.equal(events.length,2,'Only telephone / booking links count as conversion events');
  assert.equal(events[0][1],'phone_click');
  assert.equal(events[0][2].event_label,'0929634777');
  assert.equal(events[1][1],'reservation_click');
  dinnerTab.events.get('click')();
  assert.equal(panel.hidden,true);assert.equal(dinner.hidden,false);
  assert.equal(dinnerTab.attrs['aria-selected'],'true');
  dinnerTab.events.get('keydown')({key:'ArrowLeft',preventDefault(){}});
  assert.equal(panel.hidden,false);assert.equal(dinner.hidden,true);assert.equal(lunchTab.focused,true);
  assert.equal(window.SiteLinks.url('blog/posts/post.html?slug=hello'),'https://atmos-dining.github.io/bound-garden-site/blog/posts/post.html?slug=hello');
  console.log('PASS: late-loading GA4, phone/booking clicks, menu tabs and keyboard navigation, nested URL resolution.');
})().catch(e=>{console.error(e);process.exitCode=1;});
