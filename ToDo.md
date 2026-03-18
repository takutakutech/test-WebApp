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
