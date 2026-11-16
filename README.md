> 独自ドメイン移行の最新状況は `docs/domain-launch.md` を参照してください。

# Bound Garden

福岡・新宮のイタリアンブッフェ店舗サイト。ビルド不要の HTML / CSS / JavaScript。

## 制作内容

- トップ：ブッフェ紹介、店舗案内、FAQ、予約・電話・Instagram・Google Maps。
- メニュー：Lunch / Dinner 切り替え（キーボード操作対応）。
- ブログ：`blog/posts.json` のみを参照する一覧・記事詳細。
- CMS：Sveltia CMS 0.250.2 / SRI、GitHub files collection。
- セキュリティ：既存サイトと同じ DOMPurify 3.4.17 / Marked 18.1.1 とライセンスを継承。
- canonical、OG、Restaurant / FAQPage JSON-LD、sitemap、robots、404。
- GA4 電話・予約クリック（食べログにも対応）。測定ID未設定のため送信は無効。

## 公開先

予定リポジトリ：`atmos-dining/bound-garden-site`。
独自ドメイン未指定のため、GitHub Pages の `/bound-garden-site/` 配下を基準とする。
予定URL：`https://bound-garden.com/`。公開済みとは限らないので、下の状態を参照。

内部リンクは `/bound-garden-site/` から始める。`common.js` の実際の読み込み位置に合わせてローカルプレビュー時のリンクを解決する。CMS の画像 public_folder もこのパスに一致させている。

## 2026-11-15 の状態

制作・静的検証・JavaScriptの動作テストを実施。公開作業の結果は `STATUS.md` を参照。

未確定事項：

1. Bound Garden 専用 GA4 測定ID。`site-config.js` の `measurementId` に設定し、GA4 側で `phone_click` / `reservation_click` をキーイベントに設定。
2. 独自ドメイン。決定したら HTML の canonical / OG、`site-config.js`、sitemap、robots、partials・本文リンク、CMS public_folder、`CNAME` を同時更新。OAuth の ALLOWED_DOMAINS に正確なホスト名を追加する。
3. 現在の料金。食べログに平日2,750円・週末2,970円の表示と「8月より2,970円」の注意書きが混在しているため、初版では金額を断定せず予約先へ案内。
4. CMS を利用するスタッフの GitHub ユーザー。特定されていないため招待していない。

OAuth の `atmos-dining.github.io` は既存 Worker で許可済み。独自ドメイン未設定の現段階では Worker 変更不要。CMS 本番ログインは公開後に確認。

## 確認

```sh
python3 scripts/verify.py
node --check common.js
node --check blog.js
node scripts/check-behavior.cjs
```

ブラウザで通常動作を確認する場合、親フォルダから `python3 -m http.server 8765` を起動し、`http://localhost:8765/bound-garden-site/` を開く。

`python3 scripts/build-preview.py` は確認用の単体HTMLを `preview/` に作成する。CSS・写真・ヘッダー・フッターを内包しファイルから開ける。ブログデータ取得とCMS接続はこの確認用コピーでは検証できない。公開ソースは変更されない。

## 情報・写真の出典

- ユーザー指定の食べログ店舗ページ：https://tabelog.com/fukuoka/A4001/A400201/40073441/
- 公式Instagram：https://www.instagram.com/bound.garden/
- Google Maps：https://maps.app.goo.gl/3Pvs37ieejtWgVZb9

店舗情報の確認日：2026-11-15。写真は食べログの「店舗掲載メイン写真」6点。口コミ投稿者の写真は使用していない。URL対応は `images/sources.json`。写真は取得できた660×370版を使用し、架空の店内画像は作成していない。

## CMSと公開のルール

`files:` を `folder:` に変更しない。本文は `BlogSecurity.sanitizeHTML`、画像は `BlogSecurity.imageURL` を通す。slug はクエリを使用し記事別 canonical を付与する。空のブログに架空の記事を追加しない。

変更対象だけをコミットし、push直前に必ず `git pull --rebase`。force push禁止。初回は空のGitHubリポジトリを作成し、リモートに main がないことを確認する。初回pullはブランチ不在で終了することがあるが、通信や認証の失敗は無視しない。
