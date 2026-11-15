(() => {
  'use strict';
  const root = new URL('.', document.currentScript.src);
  const config = window.SITE_CONFIG;
  const localLink = path => new URL(path, root).href;
  window.SiteLinks = Object.freeze({ root: root.href, url: localLink });

  function resolveSiteLinks(container) {
    container.querySelectorAll('a[href^="/bound-garden-site/"], img[src^="/bound-garden-site/"]').forEach(node => {
      const attr = node.tagName === 'IMG' ? 'src' : 'href';
      node.setAttribute(attr, localLink(node.getAttribute(attr).slice('/bound-garden-site/'.length)));
    });
  }
  async function loadPartial(id, file) {
    const target = document.getElementById(id);
    if (!target) return;
    try {
      const response = await fetch(localLink(file));
      if (!response.ok) throw new Error('Partial unavailable');
      target.innerHTML = await response.text(); // Trusted, versioned site partial; never CMS content.
      resolveSiteLinks(target);
    } catch (error) { console.warn(file, error.message); }
  }
  function initMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.getElementById('mobile-navigation');
    if (!toggle || !nav) return;
    const close = (focus = false) => {
      nav.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'メニューを開く');
      if (focus) toggle.focus();
    };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      nav.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    });
    nav.addEventListener('click', e => { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !nav.hidden) close(true); });
    document.addEventListener('click', e => { if (!nav.hidden && !e.target.closest('.site-header')) close(); });
    matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) close(); });
  }
  function initGA4Tracking() {
    document.addEventListener('click', e => {
      if (typeof window.gtag !== 'function') return;
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (href.startsWith('tel:')) window.gtag('event', 'phone_click', {event_category:'contact',event_label:href.slice(4),page_location:location.href});
      if (a.hasAttribute('data-reservation') || /toreta|autoreserve|hotpepper/.test(href)) window.gtag('event', 'reservation_click', {event_category:'conversion',event_label:a.textContent.trim().slice(0,50),page_location:location.href});
    });
  }
  function loadAnalytics() {
    if (!/^G-[A-Z0-9]+$/.test(config?.measurementId || '')) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
    window.gtag('js', new Date());
    window.gtag('config', config.measurementId);
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.measurementId);
    document.head.append(script);
  }
  function initMenuTabs() {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    const activate = tab => {
      tabs.forEach(t => {
        const selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
      });
    };
    tabs.forEach((tab,index) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', e => {
        let next;
        if (e.key === 'ArrowRight') next = tabs[(index+1)%tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(index+tabs.length-1)%tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length-1];
        if (next) { e.preventDefault(); activate(next); next.focus(); }
      });
    });
    if (location.hash === '#dinner' && tabs[1]) activate(tabs[1]);
  }
  document.addEventListener('DOMContentLoaded', async () => {
    resolveSiteLinks(document);
    initGA4Tracking();
    loadAnalytics();
    initMenuTabs();
    await Promise.all([loadPartial('site-header','partials/header.html'),loadPartial('site-bottom','partials/bottom.html')]);
    initMenu();
  });
})();
