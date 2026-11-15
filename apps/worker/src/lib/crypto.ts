/**
 * Web Crypto PBKDF2 Password Hashing & Verification
 * Fully compatible with Cloudflare Workers (V8 isolates), Browser & Node runtimes.
 */

const ITERATIONS = 100000;
const KEY_LENGTH = 32; // 256 bits

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(derivedKey)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return false;
    const [saltHex, originalHashHex] = parts;
    if (!saltHex || !originalHashHex || saltHex.length !== 32) return false;

    const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      KEY_LENGTH * 8
    );

    const hashHex = Array.from(new Uint8Array(derivedKey)).map((b) => b.toString(16).padStart(2, '0')).join('');
    
    // Constant-time comparison
    if (hashHex.length !== originalHashHex.length) return false;
    let diff = 0;
    for (let i = 0; i < hashHex.length; i++) {
      diff |= hashHex.charCodeAt(i) ^ originalHashHex.charCodeAt(i);
    }
    return diff === 0;
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

/**
 * Generate a cryptographically secure random ticket code e.g. "ES-9B4F-821A"
 */
export function generateTicketCode(prefix: string = 'ES'): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `${prefix}-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}
