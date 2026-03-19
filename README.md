# 🔌 Twilio VoIP Tester

Free browser-based VoIP calling application for testing your Twilio setup. Perfect for testing Twilio webhooks, call routing, and PSTN integration without needing a physical phone.

![VoIP Tester](https://img.shields.io/badge/Twilio-VoIP%20Tester-667eea?style=for-the-badge&logo=twilio)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

## ✨ Features

- **📞 Browser-Based Calling**: Make and receive calls directly from your browser using WebRTC
- **📥 Incoming Call Support**: Receive calls to your Twilio number in the browser
- **🪝 Webhook Inspector**: View incoming Twilio webhook payloads in real-time
- **📋 Call History**: Log all calls with timestamps, duration, and status
- **💰 100% Free**: Uses your Twilio trial credits + free hosting tiers
- **⚡ Quick Setup**: Deploy in under 5 minutes

## 🚀 Quick Start

### 1. Get Twilio Credentials

1. Sign up at [Twilio](https://www.twilio.com/try-twilio) (free trial includes $15 credit)
2. Get a free Twilio phone number
3. Create API Keys: Go to [Console → API Keys](https://console.twilio.com/user-settings/api-keys)
4. Copy your credentials:
   - Account SID (starts with `AC...`)
   - API Key SID (starts with `SK...`)
   - API Key Secret

### 2. Local Development

```bash
# Clone/install
cd voip-tester
npm install

# Create .env file
cp .env.example .env
# Edit .env with your Twilio credentials

# Run server
npm start

# Or with auto-reload (development)
npm run dev
```

Open http://localhost:3000 in your browser.

### 3. Configure the App

1. Click **⚙️ Configuration** in the app
2. Enter your Twilio credentials
3. Click **Save Configuration**
4. Click **Connect Device** to establish the WebRTC connection
5. Start making test calls!

## 🌐 Free Deployment Options

### Option 1: Render.com (Recommended)

**Why**: Free tier, auto-deploys from GitHub, HTTPS included

**Steps**:

1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/twilio-voip-tester.git
   git push -u origin main
   ```

2. Deploy to Render:
   - Go to [render.com](https://render.com)
   - Click **New + → Web Service**
   - Connect your GitHub repository
   - Configure:
     - **Name**: `twilio-voip-tester`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: `Free`
   - Add environment variables (from your `.env` file):
     - `TWILIO_ACCOUNT_SID`
     - `TWILIO_API_KEY_SID`
     - `TWILIO_API_KEY_SECRET`
     - `TWILIO_PHONE_NUMBER`
   - Click **Create Web Service**

3. Wait 2-3 minutes for deployment
4. Your app will be live at: `https://twilio-voip-tester.onrender.com`

### Option 2: Railway.app

**Why**: $5 free credit/month, simple deployment

**Steps**:

1. Go to [railway.app](https://railway.app)
2. Click **New Project → Deploy from GitHub**
3. Select your repository
4. Add environment variables in Railway dashboard
5. Deploy automatically starts
6. Get your public URL from Railway dashboard

### Option 3: Vercel (Serverless)

**Why**: Fastest deployment, generous free tier

**Note**: Requires slight modification for serverless functions

1. Create `api/token.js` for serverless token generation
2. Deploy to Vercel:
   ```bash
   npm i -g vercel
   vercel
   ```
3. Add environment variables in Vercel dashboard

## 🧪 Testing Your Twilio Setup

### Test Outgoing Calls

1. Connect your device in the app
2. Enter a phone number (e.g., your mobile)
3. Click **Call**
4. Your phone should ring from your Twilio number
5. Answer and verify audio quality

### Test Incoming Calls

1. Use the deployed app URL as your Twilio webhook:
   ```
   https://your-app.onrender.com/api/webhook
   ```
2. Configure in Twilio Console:
   - Go to **Phone Numbers → Manage → Active numbers**
   - Select your number
   - Set **Voice → A Call Comes In** to your webhook URL
3. Call your Twilio number from any phone
4. You'll see the incoming call in the browser
5. Click **Answer** to accept

### Test Webhook Payloads

1. Set your app's `/api/webhook` as your Twilio webhook URL
2. Trigger any Twilio event (call, SMS, etc.)
3. View the raw webhook payload in the **🪝 Webhook Payload Inspector**
4. Use this to debug your TwiML responses

## 📁 Project Structure

```
voip-tester/
├── public/
│   ├── index.html          # Main UI
│   ├── app.js              # Frontend logic (Twilio Client SDK)
│   └── styles.css          # Styling
├── server.js               # Express backend
├── package.json            # Dependencies
├── .env.example            # Environment variable template
└── README.md               # This file
```

## 🔧 TwiML Configuration

For advanced call routing, update `server.js` webhook handler:

```javascript
const twiml = new twilio.twiml.VoiceResponse();

// Example: Forward to another number
twiml.dial('+15559876543');

// Or play a message
twiml.say('Thanks for calling Dash Authority!');

// Or gather input
twiml.gather({ numDigits: 1 })
  .say('Press 1 for sales, 2 for support');

res.type('text/xml');
res.send(twiml.toString());
```

## 🐛 Troubleshooting

### "Failed to get capability token"
- Verify your API Key SID and Secret are correct
- API Keys expire - create a new one if needed
- Check browser console for detailed error

### No audio during calls
- Allow microphone permissions in browser
- Check browser console for WebRTC errors
- Try a different browser (Chrome recommended)

### Incoming calls not working
- Verify webhook URL is publicly accessible (not localhost)
- Check Twilio Console → Phone Numbers → Voice webhook configuration
- Ensure `incomingAllow: true` in server.js token generation

### Webhook not receiving data
- Use ngrok for local testing: `ngrok http 3000`
- Set ngrok URL as your Twilio webhook: `https://xxx.ngrok.io/api/webhook`

## 💡 Usage Tips

1. **Use API Keys, not Auth Token**: More secure and easy to rotate
2. **Save credentials in browser**: They're stored in localStorage for convenience
3. **Monitor call logs**: Both incoming and outgoing calls are logged with timestamps
4. **Test webhook payloads**: Use the inspector to see exactly what Twilio sends
5. **Free tier limits**: Twilio trial gives $15 credit (~1000 min to US numbers)

## 🔐 Security Notes

- API credentials are stored in browser localStorage (encrypted by HTTPS in production)
- Never commit `.env` file to Git (already in .gitignore)
- Rotate API Keys periodically from Twilio Console
- Use environment variables in production deployments

## 📚 Resources

- [Twilio Client SDK Docs](https://www.twilio.com/docs/voice/client/javascript)
- [Twilio Voice API](https://www.twilio.com/docs/voice/api)
- [WebRTC Documentation](https://webrtc.org/)
- [Render Deployment Guide](https://render.com/docs/deploy-node-express-app)

## 🎯 Use Cases

- ✅ Test Twilio webhook integrations
- ✅ Verify call routing logic
- ✅ Demo VoIP features to clients
- ✅ Debug TwiML responses
- ✅ Monitor incoming call patterns
- ✅ Train team on phone system

## 📝 License

MIT License - feel free to use for personal or commercial projects.

---

**Built for Dash Authority** 🔌

Questions? Open an issue or contact support.