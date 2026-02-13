const https = require('https');

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured in Vercel environment variables.' });
    }

    try {
        const { prompt, temperature = 0.7, max_tokens = 300 } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required.' });
        }

        const requestBody = JSON.stringify({
            model: 'google/gemini-2.5-flash-lite',
            messages: [{ role: 'user', content: prompt }],
            temperature,
            max_tokens
        });

        const data = await new Promise((resolve, reject) => {
            const options = {
                hostname: 'openrouter.ai',
                path: '/api/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': req.headers.referer || req.headers.origin || 'https://resume-builder.vercel.app',
                    'X-Title': 'Resume Builder App',
                    'Content-Length': Buffer.byteLength(requestBody)
                }
            };

            const request = https.request(options, (response) => {
                let body = '';
                response.on('data', (chunk) => body += chunk);
                response.on('end', () => {
                    try {
                        const parsed = JSON.parse(body);
                        if (response.statusCode !== 200) {
                            reject(new Error(parsed.error?.message || `API returned ${response.statusCode}`));
                        } else {
                            resolve(parsed);
                        }
                    } catch (e) {
                        reject(new Error('Failed to parse API response'));
                    }
                });
            });

            request.on('error', reject);
            request.write(requestBody);
            request.end();
        });

        return res.status(200).json(data);
    } catch (error) {
        console.error('Generate API error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
