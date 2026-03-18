import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

// App Router では bodyParser は自動的に無効。生の body を読み込む
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("[WEBHOOK_SIGNATURE_ERROR]", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 決済完了イベントを処理
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const clerkId = session.metadata?.clerkId;

    if (!clerkId) {
      console.error("[WEBHOOK_ERROR] No clerkId in metadata");
      return NextResponse.json({ error: "No clerkId" }, { status: 400 });
    }

    try {
      await db.user.upsert({
        where: { clerkId },
        update: { isPremium: true },
        create: {
          clerkId,
          isPremium: true,
          stripeCustomerId: session.customer as string,
        },
      });

      console.log(`[WEBHOOK] User ${clerkId} upgraded to premium`);
    } catch (error) {
      console.error("[WEBHOOK_DB_ERROR]", error);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
