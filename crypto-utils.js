/**
 * RSA Encryption Utilities for API Key Security
 * Uses Web Crypto API for RSA encryption/decryption
 */

// RSA Key Configuration
const RSA_CONFIG = {
    name: "RSA-OAEP",
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256"
};

/**
 * Generate RSA Key Pair
 * @returns {Promise<CryptoKeyPair>}
 */
async function generateRSAKeyPair() {
    return await crypto.subtle.generateKey(
        RSA_CONFIG,
        true, // extractable
        ["encrypt", "decrypt"]
    );
}

/**
 * Export public key to base64 string
 * @param {CryptoKey} publicKey 
 * @returns {Promise<string>}
 */
async function exportPublicKey(publicKey) {
    const exported = await crypto.subtle.exportKey("spki", publicKey);
    return arrayBufferToBase64(exported);
}

/**
 * Export private key to base64 string
 * @param {CryptoKey} privateKey 
 * @returns {Promise<string>}
 */
async function exportPrivateKey(privateKey) {
    const exported = await crypto.subtle.exportKey("pkcs8", privateKey);
    return arrayBufferToBase64(exported);
}

/**
 * Import private key from base64 string
 * @param {string} base64Key 
 * @returns {Promise<CryptoKey>}
 */
async function importPrivateKey(base64Key) {
    const keyData = base64ToArrayBuffer(base64Key);
    return await crypto.subtle.importKey(
        "pkcs8",
        keyData,
        RSA_CONFIG,
        false,
        ["decrypt"]
    );
}

/**
 * Encrypt data using public key
 * @param {string} data 
 * @param {CryptoKey} publicKey 
 * @returns {Promise<string>}
 */
async function encryptWithRSA(data, publicKey) {
    const encodedData = new TextEncoder().encode(data);
    const encrypted = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        encodedData
    );
    return arrayBufferToBase64(encrypted);
}

/**
 * Decrypt data using private key
 * @param {string} encryptedBase64 
 * @param {CryptoKey} privateKey 
 * @returns {Promise<string>}
 */
async function decryptWithRSA(encryptedBase64, privateKey) {
    const encryptedData = base64ToArrayBuffer(encryptedBase64);
    const decrypted = await crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        encryptedData
    );
    return new TextDecoder().decode(decrypted);
}

// Helper: ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Helper: Base64 to ArrayBuffer
function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Initialize encrypted API key system
 * Run this once to generate keys and encrypt your API key
 */
async function setupEncryptedAPIKey(apiKey) {
    console.log("🔐 Generating RSA Key Pair...");
    const keyPair = await generateRSAKeyPair();

    console.log("🔑 Encrypting API Key...");
    const encryptedKey = await encryptWithRSA(apiKey, keyPair.publicKey);

    const privateKeyBase64 = await exportPrivateKey(keyPair.privateKey);

    console.log("\n" + "=".repeat(60));
    console.log("✅ RSA ENCRYPTION COMPLETE");
    console.log("=".repeat(60));
    console.log("\n📋 ENCRYPTED API KEY (copy this to your code):\n");
    console.log(`const ENCRYPTED_API_KEY = "${encryptedKey}";`);
    console.log("\n🔑 PRIVATE KEY (copy this to your code):\n");
    console.log(`const PRIVATE_KEY = "${privateKeyBase64}";`);
    console.log("\n" + "=".repeat(60));

    return { encryptedKey, privateKeyBase64 };
}

// Export for use
window.CryptoUtils = {
    generateRSAKeyPair,
    encryptWithRSA,
    decryptWithRSA,
    importPrivateKey,
    setupEncryptedAPIKey,
    base64ToArrayBuffer,
    arrayBufferToBase64
};
