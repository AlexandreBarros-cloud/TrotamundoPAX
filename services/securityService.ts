
/**
 * Security Service - Trotamundo Viagens
 * Implementation of client-side encryption for sensitive passenger data.
 */

const ENCRYPTION_ALGORITHM = 'AES-GCM';

// Helper to convert string to buffer
const strToBuffer = (str: string) => new TextEncoder().encode(str);

// Helper to convert buffer to string
const bufferToStr = (buf: ArrayBuffer) => new TextDecoder().decode(buf);

/**
 * Generates a memorable and secure access code based on destination
 */
export function generateAccessCode(destination: string): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const normalized = destination
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-zA-Z]/g, '') // Remove non-letters
    .toUpperCase()
    .slice(0, 6);
  
  const randomSuffix = Math.random().toString(36).substring(2, 4).toUpperCase();
  
  return `${normalized}${year}${randomSuffix}`;
}

// Derives a cryptographic key from the passenger access code
async function deriveKey(accessCode: string): Promise<CryptoKey> {
  const passwordBuffer = strToBuffer(accessCode);
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: strToBuffer('trotamundo-salt-2024'), // Constant salt for this demo
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: ENCRYPTION_ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a JavaScript object using a key
 */
export async function encryptData(data: any, key: string): Promise<string> {
  try {
    const cryptoKey = await deriveKey(key);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = strToBuffer(JSON.stringify(data));

    const encryptedContent = await crypto.subtle.encrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      cryptoKey,
      encodedData
    );

    // Combine IV and Encrypted content for storage
    const combined = new Uint8Array(iv.length + encryptedContent.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedContent), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Falha ao criptografar dados.');
  }
}

/**
 * Decrypts a base64 string back to a JavaScript object
 */
export async function decryptData(encryptedBase64: string, key: string): Promise<any> {
  try {
    const cryptoKey = await deriveKey(key);
    const combined = new Uint8Array(
      atob(encryptedBase64).split('').map(c => c.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const encryptedContent = combined.slice(12);

    const decryptedContent = await crypto.subtle.decrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      cryptoKey,
      encryptedContent
    );

    return JSON.parse(bufferToStr(decryptedContent));
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Código de acesso incorreto ou dados corrompidos.');
  }
}

/**
 * Simulates an "End-to-End Encryption" verification
 */
export const isSecureConnection = () => {
  return window.isSecureContext && !!window.crypto.subtle;
};
