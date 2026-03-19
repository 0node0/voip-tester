# Vercel Deployment Guide

Your VoIP Tester app is ready for deployment to Vercel. Follow one of the methods below.

---

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push to GitHub

```bash
cd /home/sprite/dash-authority/voip-tester

# Option A: Create new repo via GitHub CLI (if authenticated)
gh repo create voip-tester --public --source=. --remote=origin --push

# Option B: Manual push to existing repo
git remote add origin https://github.com/YOUR_USERNAME/voip-tester.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New"** → **"Project"**
3. Select your GitHub account and choose the **voip-tester** repository
4. Click **"Import"**

### Step 3: Configure Environment Variables

In the Vercel project settings, add these environment variables:

| Variable | Value |
|----------|-------|
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID (AC...) |
| `TWILIO_API_KEY_SID` | Your Twilio API Key SID (SK...) |
| `TWILIO_API_KEY_SECRET` | Your Twilio API Key Secret |
| `TWILIO_APP_SID` | Your Twilio Application SID (AP...) |

**To get Twilio credentials:**
1. Log into [Twilio Console](https://console.twilio.com)
2. Go to **Settings** → **API Keys & Tokens**
3. Create a new API key (Account SID is shown on your dashboard)
4. For APP_SID: Go to **Voice** → **TwiML** → **Apps** → Create new app

### Step 4: Deploy

Click **"Deploy"** — Vercel will build and deploy your app in ~30 seconds.

### Step 5: Test

Visit your deployed URL (e.g., `https://voip-tester.vercel.app`) and test the VoIP functionality.

---

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate via email or GitHub.

### Step 3: Deploy

```bash
cd /home/sprite/dash-authority/voip-tester
vercel deploy --prod
```

### Step 4: Set Environment Variables

After deployment, set environment variables:

```bash
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_API_KEY_SID
vercel env add TWILIO_API_KEY_SECRET
vercel env add TWILIO_APP_SID
```

Or set them in the Vercel dashboard under **Project Settings** → **Environment Variables**.

### Step 5: Redeploy with environment variables

```bash
vercel deploy --prod
```

---

## Post-Deployment Checklist

- [ ] All 5 API endpoints work (`/api/token`, `/api/webhook`, `/api/health`, `/api/webhooks/recent`, `/api/webhooks/delete`)
- [ ] Frontend loads correctly at root URL
- [ ] Twilio webhook URL is set to `https://YOUR-VERCEL-URL.vercel.app/api/webhook`
- [ ] Test making a call from the frontend
- [ ] Verify webhooks are being logged

---

## Troubleshooting

### Webhooks not appearing
- Check Vercel Functions logs in the dashboard
- Ensure Twilio webhook URL is correct
- Verify `data/webhooks.json` has write permissions (Vercel handles this automatically)

### Token generation fails
- Double-check all 4 environment variables are set
- Ensure API Key has correct permissions in Twilio

### Static files not loading
- Ensure `vercel.json` routing is correct
- Check browser console for 404 errors

---

## Project Structure

```
voip-tester/
├── api/                      # Vercel Serverless Functions
│   ├── token.js              # POST - Generate Twilio tokens
│   ├── webhook.js            # POST - Handle Twilio webhooks
│   ├── health.js             # GET - Health check
│   └── webhooks/
│       ├── recent.js         # GET - Get recent webhooks
│       └── delete.js         # DELETE - Clear webhooks
├── public/                   # Static frontend files
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── data/                     # Persistent storage
│   └── webhooks.json         # Stored webhook logs
├── vercel.json               # Vercel configuration
├── package.json
├── .env.example
└── DEPLOYMENT.md             # This file
```

---

**Need help?** Check the [Vercel Documentation](https://vercel.com/docs) or [Twilio Docs](https://www.twilio.com/docs).