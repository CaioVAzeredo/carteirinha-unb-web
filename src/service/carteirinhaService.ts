import type { Carteirinha } from '../types/carteirinha';
import { decryptImage, encryptImage } from './criptografiaImagens';

import { loadImageKey } from './chaveLocal';

const cacheName = 'identidade-estudantil-v1';
const key = new URL('__carteirinha_ativa__', document.baseURI).href;
const passwordFormat = 'imagens-aes-gcm-v2';
const encryptedFormat = 'imagens-chave-local-v3';

export const changes = typeof BroadcastChannel === 'undefined'
  ? null
  : new BroadcastChannel(cacheName);

async function readRecord(cache: Cache) {
  const response = await cache.match(key);
  if (!response) return null;

  const data = await response.formData();
  const metadata = data.get('dados');
  const foto = data.get('foto');
  const qrCode = data.get('qrCode');
  const format = data.get('formato');
  if (typeof metadata !== 'string' || !(foto instanceof Blob) || !(qrCode instanceof Blob)
      || (format !== null && format !== encryptedFormat && format !== passwordFormat)) {
    throw new Error('Registro local inválido.');
  }
  const fields: Omit<Carteirinha, 'foto' | 'qrCode'> = JSON.parse(metadata);
  if (typeof fields?.versao !== 'string') throw new Error('Registro local inválido.');
  return { fields, metadata, foto, qrCode, format };
}

type StoredCard =
  | { version: string; needsReimport: true; card: null }
  | { version: string; needsReimport: false; card: Carteirinha };

export async function loadStoredCard(): Promise<StoredCard | null> {
  const cache = await caches.open(cacheName);
  const stored = await readRecord(cache);
  if (!stored) return null;

  const { format, fields, metadata, foto, qrCode } = stored;
  const version = fields.versao;
  if (format === passwordFormat) return { version, needsReimport: true, card: null };

  if (format === null) {
    const card = { ...fields, foto, qrCode, versao: crypto.randomUUID() };
    const response = await encryptedResponse(card);
    const migrated = await navigator.locks.request(cacheName, async () => {
      const current = await readRecord(cache);
      if (!current || current.format !== null || current.fields.versao !== version) return false;
      await cache.put(key, response);
      return true;
    });
    if (!migrated) return loadStoredCard();
    changes?.postMessage('atualizada');
    return { version: card.versao, needsReimport: false, card };
  }

  const secret = await loadImageKey(false);
  const [photo, qr] = await Promise.all([
    decryptImage(foto, secret, 'foto:' + metadata),
    decryptImage(qrCode, secret, 'qrCode:' + metadata),
  ]);
  return { version, needsReimport: false, card: { ...fields, foto: photo, qrCode: qr } };
}

async function encryptedResponse(card: Carteirinha): Promise<Response> {
  const { foto, qrCode, ...fields } = card;
  const metadata = JSON.stringify(fields);
  const secret = await loadImageKey(true);
  const [encryptedPhoto, encryptedQr] = await Promise.all([
    encryptImage(foto, secret, 'foto:' + metadata),
    encryptImage(qrCode, secret, 'qrCode:' + metadata),
  ]);
  const data = new FormData();
  data.set('formato', encryptedFormat);
  data.set('dados', metadata);
  data.set('foto', encryptedPhoto, 'foto.bin');
  data.set('qrCode', encryptedQr, 'qr.bin');
  return new Response(data);
}

export async function saveCard(card: Carteirinha): Promise<void> {
  const response = await encryptedResponse(card);
  await navigator.locks.request(cacheName, async () => {
    await (await caches.open(cacheName)).put(key, response);
  });
  changes?.postMessage('atualizada');
}

export async function removeCard(version: string): Promise<boolean> {
  const removed = await navigator.locks.request(cacheName, async () => {
    const cache = await caches.open(cacheName);
    const current = await readRecord(cache);
    if (current?.fields.versao !== version) return false;
    return cache.delete(key);
  });
  if (removed) changes?.postMessage('atualizada');
  return removed;
}
