// Reads .env and generates config.js for the browser
// Run: node setup.js

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found! Create one with:\n   OPENROUTER_API_KEY=your-key-here');
    process.exit(1);
}

const env = {};
fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length) env[key.trim()] = val.join('=').trim();
});

const config = `// Auto-generated from .env — DO NOT COMMIT (gitignored)
const ENV = {
    OPENROUTER_API_KEY: "${env.OPENROUTER_API_KEY || ''}"
};
`;

fs.writeFileSync(path.join(__dirname, 'config.js'), config);
console.log('✅ config.js generated from .env');
