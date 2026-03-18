import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function PremiumPage() {
  const { userId } = await auth();

  // 未ログインはサインインへ
  if (!userId) {
    redirect("/sign-in");
  }

  // DBでプレミアムステータスを確認
  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  // 購入していない場合はトップへ
  if (!user?.isPremium) {
    redirect("/?error=not_premium");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">⭐</span>
            <h1 className="text-3xl font-bold text-gray-900">
              プレミアムコンテンツ
            </h1>
          </div>

          <div className="space-y-6">
            <article className="border-l-4 border-blue-500 pl-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                限定記事 #1: 成功するSaaSの作り方
              </h2>
              <p className="text-gray-600">
                ユーザーが本当に求めているものを見つけ、継続的に価値を届けるための
                フレームワークを解説します。MRRを伸ばし続けるための具体的な戦略...
              </p>
            </article>

            <article className="border-l-4 border-purple-500 pl-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                限定記事 #2: Next.js + Stripeで決済を実装する完全ガイド
              </h2>
              <p className="text-gray-600">
                このプラットフォーム自体の実装解説です。Clerk認証からStripe Webhook、
                Neon DBのスキーマ設計まで、バックエンド疎通を一気に解説します...
              </p>
            </article>

            <article className="border-l-4 border-green-500 pl-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                限定記事 #3: Prisma + Neonでスケーラブルなデータ層を構築する
              </h2>
              <p className="text-gray-600">
                サーバーレスPostgreSQLのNeonと、型安全なORMのPrismaを組み合わせた
                ベストプラクティスを紹介します...
              </p>
            </article>
          </div>
        </div>
      </div>
    </main>
  );
}
