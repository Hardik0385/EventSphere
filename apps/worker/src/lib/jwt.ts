import { JwtPayload } from '../types';

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signJwt(payload: Omit<JwtPayload, 'iat'>, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const fullPayload: JwtPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  };

  const enc = new TextEncoder();
  const headerEncoded = base64UrlEncode(enc.encode(JSON.stringify(header)));
  const payloadEncoded = base64UrlEncode(enc.encode(JSON.stringify(fullPayload)));
  const dataToSign = `${headerEncoded}.${payloadEncoded}`;

  const key = await getHmacKey(secret);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(dataToSign));
  const signatureEncoded = base64UrlEncode(new Uint8Array(signatureBuffer));

  return `${dataToSign}.${signatureEncoded}`;
}

export async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;

    const dataToVerify = `${headerB64}.${payloadB64}`;
    const enc = new TextEncoder();
    const signatureBytes = base64UrlDecode(signatureB64);
    const key = await getHmacKey(secret);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      enc.encode(dataToVerify)
    );

    if (!isValid) return null;

    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(payloadJson) as JwtPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    console.error('JWT verification error:', err);
    return null;
  }
}
