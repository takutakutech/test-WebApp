import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full mx-auto px-4 py-16 text-center">
        {/* ヘッダー */}
        <div className="flex justify-end mb-8">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <div className="flex gap-4">
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                ログイン
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                新規登録
              </Link>
            </div>
          </SignedOut>
        </div>

        {/* メインコンテンツ */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          プレミアムコンテンツ
          <br />
          プラットフォーム
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          一度の決済で、すべてのプレミアムコンテンツへアクセス
        </p>

        {/* プランカード */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-8">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            ¥980
            <span className="text-lg font-normal text-gray-500"> / 買い切り</span>
          </div>
          <ul className="text-left space-y-3 mb-8 mt-6">
            <li className="flex items-center gap-2 text-gray-700">
              <span className="text-green-500">✓</span>
              全プレミアム記事への永久アクセス
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <span className="text-green-500">✓</span>
              限定コンテンツの閲覧
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <span className="text-green-500">✓</span>
              今後追加されるコンテンツも含む
            </li>
          </ul>

          <CheckoutButton />
        </div>

        <p className="text-sm text-gray-500">
          すでに購入済みの方は{" "}
          <Link href="/premium" className="text-blue-600 hover:underline">
            こちら
          </Link>
        </p>
      </div>
    </main>
  );
}

function CheckoutButton() {
  return (
    <form action="/api/checkout" method="POST">
      <button
        type="submit"
        className="w-full py-4 px-8 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
      >
        今すぐ購入する →
      </button>
    </form>
  );
}
