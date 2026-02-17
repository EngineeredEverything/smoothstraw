// Stripe Checkout API endpoint
// Serverless function for Vercel/Netlify or Express route

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Product price IDs (create these in Stripe Dashboard)
const PRICES = {
  starter: process.env.STRIPE_PRICE_STARTER || 'price_starter_placeholder',
  duo: process.env.STRIPE_PRICE_DUO || 'price_duo_placeholder',
  family: process.env.STRIPE_PRICE_FAMILY || 'price_family_placeholder'
};

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { plan } = req.body;
    
    if (!PRICES[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    
    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICES[plan],
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.DOMAIN || 'https://smoothstraw.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN || 'https://smoothstraw.com'}/#pricing`,
      metadata: {
        bot: 'smoothstraw',  // Required for fleet revenue tracking
        plan: plan,
        source: 'website'
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,  // Free shipping
              currency: 'usd',
            },
            display_name: 'Free Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 3,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
      ],
    });
    
    return res.status(200).json({ sessionId: session.id });
    
  } catch (error) {
    console.error('Stripe error:', error);
    return res.status(500).json({ error: 'Payment error' });
  }
};
