# ToDo: 環境変数セットアップ & 動作確認

コードはすべて実装済み。以下の手順で各サービスのキーを取得して `.env.local` に設定すれば全フローが動く。

---

## 事前準備

```bash
cp .env.local.example .env.local
```

---

## 1️⃣ Neon（DB）

- [ ] [neon.tech](https://neon.tech) でアカウント作成 → 新規プロジェクト作成
- [ ] ダッシュボードの **Connection Details → Connection string** をコピー
- [ ] `.env.local` に設定:
  ```
  DATABASE_URL=postgresql://user:pass@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
  ```
- [ ] テーブルを作成:
  ```bash
  npm run db:push
  ```

---

## 2️⃣ Clerk（認証）

- [ ] [dashboard.clerk.com](https://dashboard.clerk.com) でアカウント作成 → **Create application**
- [ ] Google ログインを有効化（Social connections → Google をオン）
- [ ] **API Keys** からキーをコピーして `.env.local` に設定:
  ```
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
  CLERK_SECRET_KEY=sk_test_xxxxx
  ```

---

## 3️⃣ Stripe（決済）

- [ ] [dashboard.stripe.com](https://dashboard.stripe.com) でアカウント作成
- [ ] 画面右上を **TEST モード** に設定
- [ ] **Developers → API keys** からキーをコピーして `.env.local` に設定:
  ```
  STRIPE_SECRET_KEY=sk_test_xxxxx
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
  ```
- [ ] **Product catalog → Add product** で商品を作成:
  - 名前: `プレミアムプラン` / 価格: `¥980` / One time
  - 作成後の **Price ID** を `.env.local` に設定:
    ```
    STRIPE_PRICE_ID=price_xxxxx
    ```
- [ ] Stripe CLI をインストール → Webhook シークレットを取得:
  ```bash
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  # 表示された whsec_xxxxx を .env.local に設定
  STRIPE_WEBHOOK_SECRET=whsec_xxxxx
  ```

---

## 4️⃣ 動作確認

- [ ] `npm run db:push` でテーブル作成
- [ ] `npm run dev` でサーバー起動
- [ ] 別ターミナルで `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] ブラウザで `http://localhost:3000` を開く
- [ ] ランディングページ → 購入ボタン → Stripe テスト決済 → `/premium` が表示されることを確認
  - テストカード番号: `4242 4242 4242 4242`（有効期限・CVCは任意）
- [ ] `npm run db:studio` でDBの `isPremium` が `true` になっていることを確認

---

<!-- 次回はここから -->

## 8️⃣ Stripe 本番環境（ライブモード）への切り替え ← **次回ここから**

> テストモードのまま一旦運用中。本番リリースの際に実施する。

### 8-1. Stripe ライブモードに切り替え
- [ ] Stripe ダッシュボード右上の **「テストモード」トグルをオフ** にしてライブモードへ
- [ ] **Developers → API keys** から**本番用キー**を取得:
  ```
  STRIPE_SECRET_KEY=sk_live_xxxxx
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
  ```
- [ ] **本番用商品を新規作成**（テストモードの商品はライブモードに引き継がれない）:
  - Product catalog → Add product → 同じ内容（¥980 一回払い）で作成
  - 本番用 Price ID を取得:
    ```
    STRIPE_PRICE_ID=price_live_xxxxx
    ```

### 8-2. 本番用 Webhook エンドポイントの登録
- [ ] Stripe ダッシュボード（ライブモード）→ **Developers → Webhooks → Add endpoint**
- [ ] Endpoint URL:
  ```
  https://test-web-app-omega.vercel.app/api/webhooks/stripe
  ```
- [ ] **Listen to events** で `checkout.session.completed` を選択して保存
- [ ] 登録後に表示される **Signing secret**（`whsec_live_xxxxx`）をコピー
  - ⚠️ テストモードの `whsec_` とは別物。必ず差し替えること

### 8-3. Vercel 環境変数を本番用に更新してリデプロイ
- [ ] Vercel → **Settings → Environment Variables** で以下を更新:
  - `STRIPE_SECRET_KEY` → `sk_live_...`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
  - `STRIPE_PRICE_ID` → 本番用 Price ID
  - `STRIPE_WEBHOOK_SECRET` → 本番用 `whsec_live_...`
- [ ] **Deployments → Redeploy** でリデプロイ

### 8-4. 本番動作確認
- [ ] 実際のクレジットカードで少額決済をテスト
- [ ] Vercel の **Functions → Logs** で `/api/webhooks/stripe` が正常処理されているか確認
- [ ] DB の `isPremium` が `true` になっていることを確認

---

## 9️⃣ Clerk 本番設定（任意）

> 現在は `pk_test_...` のままでもVercel上で正常動作中。本番リリース時に必要に応じて実施。

- [ ] Clerk ダッシュボード → アプリの設定 → **Domains** に本番ドメインを追加（通常は自動で動く）
- [ ] 本番用 Clerk キーに切り替え:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → `pk_live_...`
  - `CLERK_SECRET_KEY` → 本番用の値
- [ ] Vercel 環境変数を更新してリデプロイ

---

## 5️⃣ 本番デプロイ（Vercel）✅ 完了

### 5-1. Vercelアカウント・プロジェクト作成
- [x] [vercel.com](https://vercel.com) でアカウント作成（GitHubログイン推奨）
- [x] GitHubにこのリポジトリをpush済みであることを確認
- [x] Vercel ダッシュボード → **Add New → Project** → GitHubリポジトリを選択してインポート

### 5-2. 環境変数の設定（重要）
- [x] Vercelのプロジェクト設定 → **Settings → Environment Variables** に `.env.local` の全変数を追加:
  ```
  DATABASE_URL
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  CLERK_SECRET_KEY
  STRIPE_SECRET_KEY
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  STRIPE_PRICE_ID
  STRIPE_WEBHOOK_SECRET         ← ★本番用の値に変える（後述）
  NEXT_PUBLIC_APP_URL           ← ★デプロイ後のURL（例: https://your-app.vercel.app）
  ```
  - `NEXT_PUBLIC_APP_URL` は Vercel がデプロイ後に発行するURLを設定する
  - 最初は仮でデプロイして、URLが確定してから更新してもOK

### 5-3. デプロイ実行
- [x] **Deploy** ボタンを押してデプロイ開始
- [x] ビルドログにエラーがないか確認 → `postinstall: prisma generate` 追加で解決

---

## 6️⃣ Stripe 本番環境への切り替え

> ⚠️ ここが一番てこずりやすいポイント。順番通りにやること。

### 6-1. テストモードWebhookエンドポイント登録 ✅ 完了
- [x] Stripe ダッシュボード（テストモード）→ **Developers → Webhooks → Add endpoint**
- [x] Endpoint URL: `https://test-web-app-omega.vercel.app/api/webhooks/stripe`
- [x] `checkout.session.completed` を選択して保存
- [x] Signing secret（`whsec_...`）を取得してVercel環境変数 `STRIPE_WEBHOOK_SECRET` に設定
- [x] Vercel Redeploy → 別アカウントでテスト決済 → `/premium` 表示 **確認 ✅**

> ライブモードへの切り替えは 8️⃣ を参照

---

## 7️⃣ Clerk 本番設定（必要に応じて）→ 9️⃣ に移動

---

## 実装済みファイル一覧

| ファイル | 役割 |
|---|---|
| `src/app/page.tsx` | ランディングページ |
| `src/app/premium/page.tsx` | プレミアムコンテンツページ（保護済み） |
| `src/app/api/checkout/route.ts` | Stripe Checkout Session 作成 |
| `src/app/api/webhooks/stripe/route.ts` | Webhook → DB の isPremium 更新 |
| `src/proxy.ts` | Clerk 認証ミドルウェア（/premium 保護） |
| `src/lib/db.ts` | Prisma Client（Neon アダプター） |
| `src/lib/stripe.ts` | Stripe Client |
| `prisma/schema.prisma` | User モデル（clerkId, isPremium, stripeCustomerId） |
| `prisma.config.ts` | Prisma v7 DB 接続設定 |
