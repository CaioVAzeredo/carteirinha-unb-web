const encoder = new TextEncoder();

export async function encryptImage(image: Blob, key: CryptoKey, context: string): Promise<Blob> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: encoder.encode(context) }, key, await image.arrayBuffer(),
  );
  return new Blob([iv, ciphertext], { type: 'application/octet-stream' });
}

export async function decryptImage(image: Blob, key: CryptoKey, context: string): Promise<Blob> {
  const bytes = new Uint8Array(await image.arrayBuffer());
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: bytes.subarray(0, 12), additionalData: encoder.encode(context) }, key, bytes.subarray(12),
  );
  return new Blob([plaintext], { type: 'image/png' });
}
