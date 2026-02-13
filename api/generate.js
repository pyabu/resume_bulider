export default async function handler(req, res) {
    // Only allow POST
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

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': req.headers.referer || req.headers.origin || 'https://resume-builder.vercel.app',
                'X-Title': 'Resume Builder App'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.5-flash-lite',
                messages: [{ role: 'user', content: prompt }],
                temperature,
                max_tokens
            })
        });

        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json({ error: err.error?.message || 'API request failed' });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Generate API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
