# 🎬 ClipForge — Deployment Guide

## What You Need (all free to start)

1. A **GitHub** account → github.com (free)
2. A **Vercel** account → vercel.com (free)
3. An **Anthropic API key** → console.anthropic.com ($5 starting credit)

---

## Step 1 — Get Your Anthropic API Key

1. Go to https://console.anthropic.com
2. Sign up or log in
3. Go to **Settings → API Keys**
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-...`) — save it somewhere safe

---

## Step 2 — Upload Project to GitHub

### Option A: Using GitHub.com (no code needed)

1. Go to https://github.com/new
2. Name it `clipforge`, keep it **Public**, click **Create repository**
3. Click **"uploading an existing file"** link
4. Drag and drop ALL the files from the `clipforge-project` folder:
   - `package.json`
   - `vite.config.js`
   - `vercel.json`
   - `index.html`
   - `.gitignore`
   - `.env.example`
   - `src/main.jsx`
   - `src/ClipForge.jsx`
   - `api/analyze.js`
5. Click **Commit changes**

### Option B: Using Terminal (if you have Git)

```bash
cd clipforge-project
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/clipforge.git
git push -u origin main
```

---

## Step 3 — Deploy on Vercel

1. Go to https://vercel.com and sign up with your GitHub account
2. Click **"Add New Project"**
3. Find and select your `clipforge` repository
4. Vercel auto-detects Vite — leave settings as-is
5. **BEFORE clicking Deploy**, expand **Environment Variables**
6. Add:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** your `sk-ant-...` key from Step 1
7. Click **Deploy**
8. Wait ~60 seconds — your site is live! 🎉

You'll get a URL like: `clipforge-abc123.vercel.app`

---

## Step 4 — Custom Domain (Optional, ~$10/year)

1. Buy a domain from **Namecheap** or **Google Domains** (e.g., `clipforge.ai`)
2. In Vercel, go to your project → **Settings → Domains**
3. Add your domain
4. Vercel gives you DNS records — add them in your domain registrar
5. SSL is automatic

---

## Step 5 — Set Up Stripe (for payments)

1. Go to https://dashboard.stripe.com and create an account
2. Go to **Developers → API Keys** and copy your **Secret key**
3. Go to **Products → Add Product**:
   - **Pro Plan**: Name it "ClipForge Pro", set price to **$12/month** (recurring)
   - **Lifetime Plan**: Name it "ClipForge Lifetime", set price to **$49** (one-time)
4. After creating each product, click into it and copy the **Price ID** (starts with `price_`)
5. In Vercel, go to your project → **Settings → Environment Variables** and add:
   - `STRIPE_SECRET_KEY` → your sk_test or sk_live key
   - `STRIPE_PRICE_PRO` → the Price ID for the $12/month plan
   - `STRIPE_PRICE_LIFETIME` → the Price ID for the $49 one-time plan
6. Redeploy (push any change to GitHub, or click Redeploy in Vercel)

**Going live with real payments:**
- Use `sk_test_...` keys while testing (uses fake card 4242 4242 4242 4242)
- Switch to `sk_live_...` keys when ready for real money
- Enable **Stripe Tax** if you want automatic sales tax

---

## Step 6 — Making Money

### Option 1: Freemium SaaS ($9-19/month)

Add user accounts and usage limits:
- Free tier: 3 analyses per month
- Pro tier: Unlimited analyses, priority processing
- Use **Stripe** for payments (stripe.com)
- Use **Clerk** or **Auth0** for user login

### Option 2: Pay-Per-Use

- Charge $0.50-1.00 per analysis
- Use Stripe's metered billing
- Your API cost per analysis: ~$0.01-0.05
- Margin: 90%+

### Option 3: Done-For-You Service

- Don't sell the tool — use it yourself
- Offer video clipping as a service to podcasters / YouTubers
- Charge $50-200 per video
- Find clients on Fiverr, Upwork, or cold DM creators

### Option 4: Lifetime Deal Launch

- List on AppSumo or launch on Product Hunt
- $39-59 one-time payment
- Builds a user base fast, then upsell premium features

---

## Updating Your Site

Any time you push changes to GitHub, Vercel auto-deploys. To update:

1. Edit files on GitHub.com (click the pencil icon on any file)
2. Or re-upload changed files
3. Vercel rebuilds automatically in ~30 seconds

---

## Cost Breakdown

| Item | Cost |
|------|------|
| Vercel hosting | Free (hobby tier) |
| Custom domain | ~$10-15/year |
| Anthropic API | ~$0.01-0.05 per analysis |
| Stripe | 2.9% + $0.30 per transaction |

At $9/month per user, you profit from user #1.

---

## Need Help?

- Vercel docs: https://vercel.com/docs
- Anthropic docs: https://docs.anthropic.com
- Ask Claude to help you add features, fix issues, or scale up!
