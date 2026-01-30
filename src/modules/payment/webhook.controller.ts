import { Request, Response } from "express";
import { OrderModel } from "../order/order.model.js";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const webhookCheckout = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    // 1. Verify the signature
    // We pass the RAW BODY (req.body) directly to Stripe
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (err: any) {
    console.error(`⚠️  Webhook Signature Verification Failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Handle the Event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.client_reference_id;

    if (orderId) {
      try {
        // 3. Update the Order Status
        const order = await OrderModel.findByIdAndUpdate(
          orderId,
          { status: "paid", paymentMethod: "card" },
          { new: true },
        );
        console.log(`✅ Order ${orderId} has been marked as PAID.`);
      } catch (err) {
        console.error("Error updating order:", err);
      }
    }
  }

  // 4. Respond to Stripe (Crucial!)
  // If we don't send 200, Stripe thinks we failed and will keep retrying.
  res.status(200).json({ received: true });
};
