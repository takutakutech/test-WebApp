import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stripe Webhook で生の body が必要なため、該当ルートの bodyParser を無効化する設定は
  // App Router では route.ts 側で Request を直接扱うため不要
};

export default nextConfig;
