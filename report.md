# 作業レポート

---

## 2026-03-19 — 環境変数セットアップ & 疎通確認

### 概要
前回セッションで実装済みのコードに対して、各外部サービスのアカウント設定・APIキー取得・動作確認を行った。

---

### 実施内容

#### 1. Neon（データベース）
- Neonアカウント作成・プロジェクト作成
- `DATABASE_URL` を取得して `.env.local` に設定
- `npm run db:push` でスキーマをDBに反映

#### 2. Clerk（認証）
- Clerkアカウント作成・アプリ作成
- Googleログインを有効化
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` と `CLERK_SECRET_KEY` を取得して `.env.local` に設定

#### 3. Stripe（決済）
- Stripe商品作成（¥980 一回払い）
- `STRIPE_SECRET_KEY`・`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` を取得
- Price ID（`price_xxx`）の場所が分からなかった → 商品詳細ページの Pricing セクションに表示されていた（Product IDの `prod_xxx` とは別物）
- `STRIPE_PRICE_ID` を `.env.local` に設定

#### 4. Stripe CLI インストール
- `winget install Stripe.StripeCLI` でインストール
- `stripe login` で認証完了（有効期限90日）
- `stripe listen --forward-to localhost:3000/api/webhooks/stripe` で `STRIPE_WEBHOOK_SECRET`（`whsec_xxx`）を取得

#### 5. 動作確認
- `npm run dev`（ターミナル1）と `stripe listen`（ターミナル2）を同時起動
- `http://localhost:3000` でランディングページ表示
- Clerk認証 → Stripeチェックアウト → テストカード（`4242 4242 4242 4242`）で決済 → `/premium` ページ表示
- **エンドツーエンドの疎通確認 完了 ✅**

---

### 発生したエラーと解決策

| エラー | 原因 | 解決策 |
|---|---|---|
| `npm run db:push` → `Cannot resolve environment variable: DATABASE_URL` | Prisma CLIは `.env.local` を自動で読まない | `prisma.config.ts` に `dotenv.config({ path: ".env.local" })` を追加 |
| `stripe: The term 'stripe' is not recognized...` | wingetインストール後にPATHが未反映 | VSCode自体を再起動してPATHを更新 |

---

### 現在の `.env.local` に設定済みの変数

```
DATABASE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_PRICE_ID
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
```

---

### 備考
- `.env` ファイルは不要。全キーは `.env.local` に集約してOK
- `stripe listen` は開発中は常時起動が必要（Webhookの受信に使用）
- Stripe CLIの認証は90日で期限切れ → 期限後は `stripe login` で再認証

---

### 次回以降のやること
- Stripe ライブモードへの切り替え（ToDo.md 8️⃣ 参照）
- Clerk 本番設定（任意、ToDo.md 9️⃣ 参照）

---

## 2026-03-20 — Vercel 本番デプロイ & Stripe Webhook 本番設定

### 概要
Vercelへの本番デプロイと、Stripe Webhookの本番エンドポイント登録を行い、別アカウントでのエンドツーエンド動作確認を完了した。

---

### 実施内容

#### 1. Vercel デプロイ（初回）
- GitHub連携でプロジェクトをインポートし、`.env.local` の全環境変数をVercelに設定してデプロイ
- **ビルドエラー発生** → 下記「発生したエラー」参照

#### 2. Vercel デプロイ（成功）
- `package.json` に `"postinstall": "prisma generate"` を追加してGit push
- Vercelが自動でRedeployし、Status: **Ready** になった ✅

#### 3. Stripe Webhook 本番エンドポイント登録
- Stripeダッシュボード（テストモード）→ Developers → Webhooks → Add endpoint
- Endpoint URL: `https://test-web-app-omega.vercel.app/api/webhooks/stripe`
- イベント: `checkout.session.completed` を選択して保存
- 発行された Signing secret（`whsec_...`）を Vercel の `STRIPE_WEBHOOK_SECRET` に設定
- Vercel Redeploy 実施

#### 4. 動作確認
- 既存アカウント（すでにisPremium=trueだったため即 /premium 表示）
- **別アカウント** でテスト決済（`4242 4242 4242 4242`）→ `/premium` ページ表示 ✅
- エンドツーエンドの本番動作確認 **完了 ✅**

---

### 発生したエラーと解決策

| エラー | 原因 | 解決策 |
|---|---|---|
| `Module '"@prisma/client"' has no exported member 'PrismaClient'` | Vercelのビルド環境で `prisma generate` が実行されておらず、Prismaクライアントが生成されていなかった | `package.json` に `"postinstall": "prisma generate"` を追加。npm install後に自動生成されるようにした |
| 決済後に `/premium` に飛ばずホームに戻る | `STRIPE_WEBHOOK_SECRET` がローカルの `stripe listen` で発行したwhsec_のままで、Vercel本番環境にWebhookが届いていなかった | StripeダッシュボードでVercel本番URL向けのWebhookエンドポイントを新規登録し、発行されたSigning secretをVercel環境変数に設定してRedeploy |

---

### 現在の状態
- **デプロイURL**: `https://test-web-app-omega.vercel.app`
- **モード**: Stripe テストモード（`sk_test_...`）で運用中
- エンドツーエンドフロー（ランディング → 認証 → 決済 → プレミアム）が本番環境で動作確認済み

---

### 次回以降のやること
- Stripe ライブモード（`sk_live_...`）への切り替え（実際のカードで決済できるようにする）
- Clerk 本番キー（`pk_live_...`）への切り替え（任意）