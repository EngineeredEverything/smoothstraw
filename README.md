# SmoothStraw Website

Premium silicone straw tip for wrinkle-free sipping. Made in USA.

## Tech Stack

- **Frontend:** Pure HTML/CSS/JS (no build step)
- **Backend:** Serverless functions (Vercel/Netlify)
- **Payments:** Stripe Checkout (test mode)
- **Email:** TODO - integrate Mailchimp/ConvertKit

## Local Development

```bash
# Serve locally
python3 -m http.server 8000
# or
npx serve .
```

Visit `http://localhost:8000`

## Deployment

### Option 1: Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

### Option 2: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Option 3: Traditional Server

Upload to `/var/www/smoothstraw` and configure nginx.

## Environment Variables

Required for serverless functions:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_DUO=price_...
STRIPE_PRICE_FAMILY=price_...
DOMAIN=https://smoothstraw.com
```

## Stripe Setup

1. Create products in Stripe Dashboard:
   - **Starter:** $9.99 (1 SmoothStraw)
   - **Duo:** $16.99 (2 SmoothStraws)
   - **Family:** $24.99 (4 SmoothStraws)

2. Copy Price IDs to environment variables

3. Test with card: `4242 4242 4242 4242`

## Waitlist Integration

Currently logs to `/data/waitlist.json`. 

To integrate with email service:

1. **Mailchimp:** Use `@mailchimp/mailchimp_marketing`
2. **ConvertKit:** Use ConvertKit API
3. **Database:** Replace file writes with PostgreSQL/MongoDB

## TODO

- [ ] Replace emoji product images with real photos
- [ ] Create Stripe products and update price IDs
- [ ] Integrate email service for waitlist
- [ ] Add order confirmation emails
- [ ] Set up analytics (Google Analytics / Plausible)
- [ ] Add product images and lifestyle shots
- [ ] Create success/cancel pages for Stripe
- [ ] Add shipping calculator for international
- [ ] Set up domain and SSL certificate

## Revenue Tracking

All Stripe payments are tagged with `metadata.bot = "smoothstraw"` for fleet revenue attribution.
