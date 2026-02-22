import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    return res.status(500).json({
      error: "Stripe not configured. Add STRIPE_SECRET_KEY in Vercel environment variables.",
    });
  }

  const stripe = new Stripe(stripeKey);
  const { plan } = req.body;

  // Map plan IDs to Stripe Price IDs
  // Replace these with your actual Stripe Price IDs after creating products
  const priceMap = {
    pro: process.env.STRIPE_PRICE_PRO,       // Monthly $12 price ID
    lifetime: process.env.STRIPE_PRICE_LIFETIME, // One-time $49 price ID
  };

  const priceId = priceMap[plan];
  if (!priceId) {
    return res.status(400).json({ error: "Invalid plan selected" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: plan === "pro" ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin || "https://your-domain.com"}?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${req.headers.origin || "https://your-domain.com"}?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({ error: err.message || "Checkout failed" });
  }
}
