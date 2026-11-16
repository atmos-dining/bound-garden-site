# Bound Garden 独自ドメイン移行（2026-11-16）

正規URL: https://bound-garden.com/

## 完了
- Xserver: Aレコード4件（185.199.108.153〜111.153）、www CNAME atmos-dining.github.io。既存NS/SOA保持。
- Search Console: sc-domain:bound-garden.com をDNS TXTで所有確認成功。
- GA4: アトモスダイニング株式会社 378307648、プロパティ564347269、ストリーム16348704487、測定ID G-K5F1JSJJ50。日本時間・日本円。phone_click / reservation_clickをキーイベント登録（仮の金額なし）。
- CMS: 本番ALLOWED_DOMAINSにbound-garden.comを追加・Deploy。既存17ホスト維持、秘密鍵変更なし。
- ローカル: CNAME、canonical/OGP、内部リンク、robots/sitemap、CMS画像パス、Restaurant構造化データ、GA4タグを更新。ブログはposts.jsonのみ、安全なHTML処理とslug別canonicalを維持。

## 本番公開・検証完了（2026-11-16）
- この環境からGitHubへの接続成功。`bash scripts/publish-github.sh`を実行し、`git pull --rebase origin main`成功後にpush。公開コミット: `bc152132d68ec2fe0d3f551ab1fc12eee751663c`。force pushなし、作業開始時に未コミット変更なし。
- GitHub Pages: main / root、custom domain `bound-garden.com`、build `built`、`https_enforced: true`。
- SSL: `approved`、対象はapexとwww、有効期限2027-02-14。証明書検証を有効にしたHTTPSアクセス成功。
- トップ・料理・料金プラン・ドリンク・ブログ・管理画面、CMS設定、robots.txt、sitemap.xml、共通JS・サイト設定はHTTP 200。Chromeでも主要6画面を確認し、ナビゲーションとトレタ予約リンクの遷移を確認。
- HTTP、www（HTTP/HTTPS）、旧GitHub Pages URLは正規HTTPS URLに1回で転送。旧URLのmenu.htmlも新ドメインの同一ページへ転送。
- HTMLの内部リンク・画像などのローカル参照先に欠損なし。
- Search Console: `sc-domain:bound-garden.com`へフルURLのサイトマップ送信済み。ステータス「成功しました」、検出6ページ。検索インデックス登録完了を意味するものではない。
- GA4: 本番設定G-K5F1JSJJ50を確認。リアルタイムにトップ・料理・料金プラン・ドリンク・ブログのpage_view受信を確認。実際の予約ボタンクリックによるreservation_clickがリアルタイムのイベント・キーイベントに1件表示されたことも確認。phone_click / reservation_clickはキーイベント登録済み、クリック時にgtagを確認する実装を保持。
- CMS: 新ドメインの/admin/から既存GitHubアカウントでログイン成功し、Blog Postsの「全投稿一覧」を表示。テスト投稿・既存投稿の編集は行っていない（現状posts.jsonは空配列）。
- 共通Workerは再デプロイしていない。既存本番設定と他店舗のホストを保持。

## 共通Workerのローカル設定
../../sveltia-cms-auth/wrangler.toml は作業範囲外。次回CLIデプロイ前に docs/cms-domain-sync.patch を適用し、うめぼし天神南とBound Gardenの両ホストを保持する。
