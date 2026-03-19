// Get Recent Webhooks
// Vercel Serverless Function

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

module.exports = function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const recentWebhooks = readWebhooks();
        return res.status(200).json(recentWebhooks);
    } catch (error) {
        console.error('Error fetching webhooks:', error);
        return res.status(500).json({
            error: error.message || 'Failed to fetch webhooks'
        });
    }
};