const databaseName = 'identidade-estudantil-criptografia';
const storeName = 'chaves';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function accessKey(database: IDBDatabase, fallback?: CryptoKey): Promise<CryptoKey | undefined> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, fallback ? 'readwrite' : 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get('imagens');
    let key: CryptoKey | undefined;
    request.onsuccess = () => {
      key = request.result;
      if (!key && fallback) {
        key = fallback;
        store.put(key, 'imagens');
      }
    };
    transaction.oncomplete = () => resolve(key);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function loadImageKey(create: boolean): Promise<CryptoKey> {
  const database = await openDatabase();
  try {
    const current = await accessKey(database);
    if (current) return current;
    if (!create) throw new Error('Chave local indisponível.');
    const generated = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    return (await accessKey(database, generated))!;
  } finally {
    database.close();
  }
}
