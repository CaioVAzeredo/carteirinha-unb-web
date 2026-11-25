import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

import { fileURLToPath } from 'node:url';

const output = new URL('../dist/', import.meta.url);
const worker = await readFile(new URL('./service-worker.js', import.meta.url), 'utf8');
const entries = await readdir(output, { recursive: true, withFileTypes: true });
const assets = entries
  .filter(entry => entry.isFile() && entry.name !== 'service-worker.js')
  .map(entry => relative(fileURLToPath(output), join(entry.parentPath, entry.name)).split(sep).map(encodeURIComponent).join('/'))
  .sort();

const hash = createHash('sha256').update(worker);
for (const asset of assets) {
  hash.update(asset).update(await readFile(new URL(asset, output)));
}

const config = JSON.stringify({ version: hash.digest('hex'), assets });
await writeFile(new URL('service-worker.js', output), `const offline = ${config};\n${worker}`);
