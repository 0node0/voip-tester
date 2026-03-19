// Twilio Webhook Handler
// Vercel Serverless Function

const twilio = require('twilio');
const fs = require('fs');
const path = require('path');

const MAX_WEBHOOKS = 50;

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
        const webhookData = {
            timestamp: new Date().toISOString(),
            payload: req.body,
            headers: req.headers
        };

        console.log('Received webhook:', JSON.stringify(webhookData, null, 2));

        // Read existing webhooks, add new one, and save
        const recentWebhooks = readWebhooks();
        recentWebhooks.unshift(webhookData);
        
        // Limit to MAX_WEBHOOKS
        if (recentWebhooks.length > MAX_WEBHOOKS) {
            recentWebhooks.pop();
        }
        
        writeWebhooks(recentWebhooks);

        // Respond with TwiML if this is a call webhook
        const twiml = new twilio.twiml.VoiceResponse();
        
        // Echo back the webhook data for debugging
        if (req.body.To) {
            twiml.say(`Webhook received. Calling ${req.body.To}`);
        } else {
            twiml.say('Webhook endpoint working!');
        }

        res.setHeader('Content-Type', 'text/xml');
        res.status(200).send(twiml.toString());

    } catch (error) {
        console.error('Webhook handler error:', error);
        return res.status(500).json({
            error: error.message || 'Failed to process webhook'
        });
    }
};