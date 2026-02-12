/**
 * Node.js Script to Generate RSA Encrypted API Key
 * Run: node generate-encrypted-key.js
 */

const crypto = require('crypto');

// Your API Key (Replace with your actual key)
const API_KEY = "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";

// Generate RSA Key Pair
function generateKeys() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
    return { publicKey, privateKey };
}

// Encrypt API Key
function encryptAPIKey(apiKey, publicKey) {
    const encrypted = crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        Buffer.from(apiKey)
    );
    return encrypted.toString('base64');
}

// Convert PEM to base64 for browser use
function pemToBase64(pem) {
    return pem
        .replace(/-----BEGIN.*-----/g, '')
        .replace(/-----END.*-----/g, '')
        .replace(/\n/g, '')
        .trim();
}

// Main
console.log("🔐 RSA API Key Encryption Generator\n");
console.log("=".repeat(60));

const { publicKey, privateKey } = generateKeys();
const encryptedKey = encryptAPIKey(API_KEY, publicKey);
const privateKeyBase64 = pemToBase64(privateKey);

console.log("\n✅ COPY THE FOLLOWING INTO YOUR script.js:\n");
console.log("=".repeat(60));
console.log(`
// Encrypted API Key Configuration
const ENCRYPTED_API_KEY = "${encryptedKey}";

const PRIVATE_KEY_B64 = "${privateKeyBase64}";
`);
console.log("=".repeat(60));
console.log("\n⚠️  IMPORTANT: Delete this file after copying the values!");
console.log("⚠️  REMEMBER: This provides obfuscation, not full security.\n");
