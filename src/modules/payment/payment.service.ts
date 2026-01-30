import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

// 1. Initialization
// We pass the Secret Key so Stripe knows it's US making the request.
// 'apiVersion' ensures our code doesn't break if Stripe updates their API tomorrow.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createCheckoutSession = async (order: any) => {
  // 2. Create the Session
  // This is the big API call to Stripe.
  const session = await stripe.checkout.sessions.create({
    // A. "Card" is the standard method. You could add 'alipay' or 'paypal' here later.
    payment_method_types: ["card"],

    // B. "One-Time Payment"
    // We use 'payment' for e-commerce. Use 'subscription' for things like Netflix.
    mode: "payment",

    // C. The ID Tag (CRITICAL) 🔑
    // We attach our MongoDB Order ID to this session.
    // When the payment finishes, Stripe sends this ID back to us so we know WHICH order got paid.
    client_reference_id: order._id.toString(),

    // D. The Receipt Email
    // Stripe will auto-fill the user's email in the checkout form. Nice UX!
    customer_email: order.user.email,

    // E. The Products (Line Items)
    // We must convert our MongoDB items into Stripe's format.
    line_items: order.items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [item.image], // Optional: Shows the product image on checkout page
        },
        // ⚠️ STRIPE MATH:
        // Stripe handles money in "cents" (integers) to avoid rounding errors.
        // $10.00 becomes 1000. So we multiply by 100.
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),

    // F. The Redirects
    // success_url: Where user goes if they pay.
    // cancel_url: Where user goes if they click "Back".
    success_url: `http://localhost:5000/success.html`,
    cancel_url: `http://localhost:5000/cancel.html`,
  });

  return session;
};
