import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Stripe Customer を取得または作成
    let user = await db.user.findUnique({ where: { clerkId: userId } });

    let stripeCustomerId = user?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        metadata: { clerkId: userId },
      });
      stripeCustomerId = customer.id;

      // ユーザーをUpsert
      user = await db.user.upsert({
        where: { clerkId: userId },
        update: { stripeCustomerId },
        create: { clerkId: userId, stripeCustomerId },
      });
    }

    // すでにプレミアム購入済みの場合はプレミアムページへリダイレクト
    if (user?.isPremium) {
      return NextResponse.redirect(
        new URL("/premium", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
      );
    }

    // Stripe Checkout Session を作成
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/premium?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/?canceled=true`,
      metadata: { clerkId: userId },
    });

    return NextResponse.redirect(session.url!, 303);
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
