// 独自ドメインを決めたら canonicalOrigin / basePath と HTML / sitemap / CMS を一緒に更新。
window.SITE_CONFIG = Object.freeze({
  canonicalOrigin: 'https://atmos-dining.github.io',
  basePath: '/bound-garden-site/',
  // Bound Garden 専用 GA4 測定IDの発行後に設定。他店舗のIDを流用しない。
  measurementId: ''
});
