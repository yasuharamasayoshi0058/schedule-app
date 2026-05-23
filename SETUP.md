# 家族カレンダー セットアップ手順

## 必要なもの

- Cloudflare アカウント（無料）
- GitHub アカウント（無料）
- Node.js 18 以上（https://nodejs.org からインストール）
- Resend アカウント（メール通知を使う場合・無料）

---

## ステップ 1: GitHub リポジトリを作成する

1. https://github.com/new を開く
2. Repository name: `schedule-app`
3. **必ず「Private」を選択する**
4. 「Create repository」をクリック

---

## ステップ 2: ファイルをアップロードする

ターミナル（Mac の場合はターミナル.app）を開いて以下を実行:

```bash
cd /Users/yasuharaseigou/Documents/Claude/schedule-app
npm install
git init
git add .
git commit -m "初回コミット"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/schedule-app.git
git push -u origin main
```

※ `YOUR_USERNAME` は自分の GitHub ユーザー名に変えてください

---

## ステップ 3: Cloudflare D1 データベースを作成する

```bash
npx wrangler login
npx wrangler d1 create schedule-db
```

表示された `database_id` をコピーして `wrangler.toml` の `REPLACE_WITH_YOUR_D1_ID` と置き換えてください。

テーブルを作成:

```bash
npx wrangler d1 execute schedule-db --file=schema.sql
```

---

## ステップ 4: Cloudflare Pages にデプロイする

1. https://dash.cloudflare.com → Pages → 「Create a project」
2. 「Connect to Git」→ GitHub を連携 → `schedule-app` を選択
3. Build settings:
   - **Build command**: `npx @cloudflare/next-on-pages@1`
   - **Build output directory**: `.vercel/output/static`
4. 「Save and Deploy」

デプロイ完了後、「Settings」→「Functions」→「D1 database bindings」で:
- Variable name: `DB`
- D1 database: `schedule-db`
を追加してください。

---

## ステップ 5: Cloudflare Access で認証を設定する

1. Cloudflare ダッシュボード → Zero Trust → Access → Applications
2. 「Add an application」→「Self-hosted」
3. Application name: `家族カレンダー`
4. Application domain: あなたの Pages URL（例: `schedule-app.pages.dev`）
5. Policies でメールアドレスを指定:
   - `yasuhara@zei-eikoh.com`
   - `yasuharamasayoshi0058@hotmail.com`

---

## ステップ 6: メール通知を設定する（任意）

### Resend アカウントの設定
1. https://resend.com にアカウント作成
2. API Keys → API キーを作成してコピー

### Cloudflare Secrets に登録
```bash
npx wrangler pages secret put RESEND_API_KEY
# → コピーしたAPIキーを貼り付けてEnter

npx wrangler pages secret put NOTIFY_SECRET
# → 任意の文字列（例: mySecretKey123）を入力してEnter
```

### 自動通知の設定（毎朝 6時）
https://cron-job.org（無料）でアカウントを作成し、以下を設定:
- URL: `https://あなたのドメイン/api/notify`
- Method: POST
- Header: `Authorization: Bearer mySecretKey123`
- スケジュール: 毎日 21:00 UTC（日本時間 6:00）

---

## 使い方

- **予定を追加**: 右下の「+」ボタン、または日付をタップ
- **予定を編集・削除**: 予定をタップ
- **月/週/日切り替え**: 右上のボタン
- **色分け**: 青 = 自分、赤 = 妻

---

## よくある質問

**Q: 2人同時に開けますか？**
A: はい、リアルタイムではありませんがページを更新すれば最新の状態になります。

**Q: スマホでも使えますか？**
A: はい、スマートフォン対応（レスポンシブ）です。
