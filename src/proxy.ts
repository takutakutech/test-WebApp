import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 保護するルートを定義
const isProtectedRoute = createRouteMatcher(["/premium(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Next.js の内部ルートと静的ファイルをスキップ
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // API ルートは常に実行
    "/(api|trpc)(.*)",
  ],
};
