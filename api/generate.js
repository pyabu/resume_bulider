const https = require('https');
const crypto = require('crypto');

// ─── Security Configuration ────────────────────────────────────────
// Set these in Vercel Environment Variables:
//   ALLOWED_ORIGINS  – comma-separated allowed origins
//                      e.g. "https://resume-builder.vercel.app,https://yourdomain.com"
//   API_SECRET       – a random secret string (generate with: openssl rand -hex 32)
//   OPENROUTER_API_KEY – your OpenRouter key
// ────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

const API_SECRET = process.env.API_SECRET || '';
const MAX_PROMPT_LENGTH = 2000;
const MAX_BODY_SIZE = 5000; // bytes

// ─── In-memory Rate Limiting (per serverless instance) ─────────────
const rateMap = new Map();
const RATE_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_MAX = 15;              // max requests per IP per window

function isRateLimited(ip) {
    const now = Date.now();
    const entry = rateMap.get(ip);
    if (!entry || now - entry.start > RATE_WINDOW_MS) {
        rateMap.set(ip, { start: now, count: 1 });
        return false;
    }
    entry.count++;
    return entry.count > RATE_MAX;
}

function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.headers['x-real-ip']
        || req.socket?.remoteAddress
        || 'unknown';
}

module.exports = async function handler(req, res) {
    // ─── Origin Validation ─────────────────────────────────────────
    const origin = req.headers.origin || '';
    const referer = req.headers.referer || '';

    const matchedOrigin = ALLOWED_ORIGINS.find(
        o => origin.startsWith(o) || referer.startsWith(o)
    );
    const isAllowedOrigin = ALLOWED_ORIGINS.length === 0 || !!matchedOrigin;

    // CORS — restrict to allowed origins only
    const corsOrigin = ALLOWED_ORIGINS.length > 0
        ? (matchedOrigin || 'null')
        : '*';
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-token');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // ─── Origin Check ──────────────────────────────────────────────
    if (!isAllowedOrigin) {
        return res.status(403).json({ error: 'Forbidden: unauthorized origin' });
    }

    // ─── API Secret Check (timing-safe) ────────────────────────────
    if (API_SECRET) {
        const token = req.headers['x-api-token'] || '';
        const expected = Buffer.from(API_SECRET);
        const received = Buffer.from(String(token));
        if (expected.length !== received.length
            || !crypto.timingSafeEqual(expected, received)) {
            return res.status(401).json({ error: 'Unauthorized: invalid or missing API token' });
        }
    }

    // ─── Rate Limiting ─────────────────────────────────────────────
    const clientIP = getClientIP(req);
    if (isRateLimited(clientIP)) {
        res.setHeader('Retry-After', '60');
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    // ─── API Key ───────────────────────────────────────────────────
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured in Vercel environment variables.' });
    }

    try {
        // ─── Input Validation ──────────────────────────────────────
        const bodyStr = JSON.stringify(req.body || {});
        if (bodyStr.length > MAX_BODY_SIZE) {
            return res.status(413).json({ error: 'Request body too large' });
        }

        const { prompt, temperature = 0.7, max_tokens = 300 } = req.body;

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Prompt is required and must be a string.' });
        }

        if (prompt.length > MAX_PROMPT_LENGTH) {
            return res.status(400).json({ error: `Prompt too long (max ${MAX_PROMPT_LENGTH} characters)` });
        }

        // Clamp parameters to safe ranges
        const safeTemp = Math.min(Math.max(Number(temperature) || 0.7, 0), 2);
        const safeMaxTokens = Math.min(Number(max_tokens) || 300, 500);

        const requestBody = JSON.stringify({
            model: 'google/gemini-2.5-flash-lite',
            messages: [{ role: 'user', content: prompt }],
            temperature: safeTemp,
            max_tokens: safeMaxTokens
        });

        const data = await new Promise((resolve, reject) => {
            const options = {
                hostname: 'openrouter.ai',
                path: '/api/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': matchedOrigin || 'https://resume-builder.vercel.app',
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
