// Delete/Clear Webhooks
// Vercel Serverless Function

const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const webhookPath = path.join(process.cwd(), 'data', 'webhooks.json');
        
        // Clear webhooks by writing empty array
        const dir = path.dirname(webhookPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(webhookPath, '[]', 'utf8');

        console.log('Webhooks cleared');
        
        return res.status(200).json({ 
            success: true, 
            message: 'Webhooks cleared' 
        });
    } catch (error) {
        console.error('Error clearing webhooks:', error);
        return res.status(500).json({
            error: error.message || 'Failed to clear webhooks'
        });
    }
};