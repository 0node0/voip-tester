// Generate Twilio Capability Token
// Vercel Serverless Function

const twilio = require('twilio');
const fs = require('fs');
const path = require('path');

// Helper function to read webhooks from file
function readWebhooks() {
    try {
        const webhookPath = path.join(process.cwd(), 'data', 'webhooks.json');
        if (fs.existsSync(webhookPath)) {
            const data = fs.readFileSync(webhookPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading webhooks:', error);
    }
    return [];
}

// Helper function to write webhooks to file
function writeWebhooks(webhooks) {
    try {
        const webhookPath = path.join(process.cwd(), 'data', 'webhooks.json');
        const dir = path.dirname(webhookPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(webhookPath, JSON.stringify(webhooks, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing webhooks:', error);
    }
}

module.exports = function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { accountSid, apiKeySid, apiKeySecret } = req.body;

        if (!accountSid || !apiKeySid || !apiKeySecret) {
            return res.status(400).json({
                error: 'Missing required credentials: accountSid, apiKeySid, apiKeySecret'
            });
        }

        // Create Access Token
        const AccessToken = twilio.jwt.AccessToken;
        const VoiceGrant = AccessToken.VoiceGrant;

        // Create Voice Grant
        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: process.env.TWILIO_APP_SID, // Optional: TwiML App SID
            incomingAllow: true, // Allow incoming calls
        });

        // Create Access Token
        const token = new AccessToken(
            accountSid,
            apiKeySid,
            apiKeySecret,
            { identity: 'voip-tester-user' }
        );

        // Add Voice Grant to token
        token.addGrant(voiceGrant);

        // Generate JWT
        const jwt = token.toJwt();

        console.log('Generated capability token for identity: voip-tester-user');

        return res.status(200).json({
            token: jwt,
            identity: 'voip-tester-user',
            success: true
        });

    } catch (error) {
        console.error('Token generation error:', error);
        return res.status(500).json({
            error: error.message || 'Failed to generate capability token'
        });
    }
};