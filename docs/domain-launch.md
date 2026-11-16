# Bound Garden 独自ドメイン移行（2026-11-16）

正規URL: https://bound-garden.com/

## 完了
- Xserver: Aレコード4件（185.199.108.153〜111.153）、www CNAME atmos-dining.github.io。既存NS/SOA保持。
- Search Console: sc-domain:bound-garden.com をDNS TXTで所有確認成功。
- GA4: アトモスダイニング株式会社 378307648、プロパティ564347269、ストリーム16348704487、測定ID G-K5F1JSJJ50。日本時間・日本円。phone_click / reservation_clickをキーイベント登録（仮の金額なし）。
- CMS: 本番ALLOWED_DOMAINSにbound-garden.comを追加・Deploy。既存17ホスト維持、秘密鍵変更なし。
- ローカル: CNAME、canonical/OGP、内部リンク、robots/sitemap、CMS画像パス、Restaurant構造化データ、GA4タグを更新。ブログはposts.jsonのみ、安全なHTML処理とslug別canonicalを維持。

## 未完了（本番切り替え待ち）
- git pull --rebase / push：実行環境のgithub.com名前解決失敗。ユーザーのMacターミナルで scripts/publish-github.sh を実行する。
- 公開スクリプトはpush後にGitHub Pagesの独自ドメイン、HTTPS確認・強制を行う。証明書待ちは終了コード2、再実行可能。
- 公開後: 全ページ、旧URL/www/HTTPリダイレクト、CMS認証開始、GA4受信を確認。
- Search Consoleに https://bound-garden.com/sitemap.xml を送信する（公開前なのでまだ未送信）。

## 共通Workerのローカル設定
../../sveltia-cms-auth/wrangler.toml は作業範囲外。次回CLIデプロイ前に docs/cms-domain-sync.patch を適用し、うめぼし天神南とBound Gardenの両ホストを保持する。
