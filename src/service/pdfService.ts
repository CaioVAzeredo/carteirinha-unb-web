import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import worker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  LARGURA_PAGINA_CARTEIRINHA_PDF,
  REGIAO_FOTO_ESTUDANTE,
  REGIAO_QRCODE,
  type RegiaoPdfEmPontos,
} from '../constants/cropRegions';
import { parseStudentCardText } from './parseStudentCardText';
import type { Rascunho } from '../types/carteirinha';

GlobalWorkerOptions.workerSrc = worker;

export class PdfError extends Error {}

function crop(canvas: HTMLCanvasElement, region: RegiaoPdfEmPontos): Promise<Blob> {
  const factor = canvas.width / LARGURA_PAGINA_CARTEIRINHA_PDF;
  const x = Math.round(region.origemX * factor);
  const y = Math.round(region.origemY * factor);
  const width = Math.round(region.largura * factor);
  const height = Math.round(region.altura * factor);
  if (!width || !height || x + width > canvas.width || y + height > canvas.height) {
    throw new PdfError('O layout do PDF não é compatível com os recortes da carteirinha.');
  }

  const image = document.createElement('canvas');
  image.width = width;
  image.height = height;
  const context = image.getContext('2d');
  if (!context) throw new PdfError('O navegador não conseguiu preparar as imagens.');
  context.drawImage(canvas, x, y, width, height, 0, 0, width, height);
  return new Promise((resolve, reject) => {
    image.toBlob(blob => {
      image.width = image.height = 0;
      if (blob) resolve(blob);
      else reject(new PdfError('Não foi possível extrair as imagens do PDF.'));
    }, 'image/png');
  });
}

export async function processPdf(file: File, signal: AbortSignal): Promise<Rascunho> {
  if (!file.name.trim().toLowerCase().endsWith('.pdf') || (file.type && file.type !== 'application/pdf')) {
    throw new PdfError('Selecione um arquivo PDF.');
  }
  if (!file.size) throw new PdfError('O arquivo PDF está vazio.');
  if (file.size > 20 * 1024 * 1024) throw new PdfError('Selecione um PDF de até 20 MB.');

  const data = new Uint8Array(await file.arrayBuffer());
  signal.throwIfAborted();
  const task = getDocument({
    data,
    useSystemFonts: true,
    useWasm: false,
    enableXfa: false,
    maxImageSize: 16_000_000,
    verbosity: 0,
  });
  let cleanup: Promise<void> | undefined;
  const destroy = () => cleanup ??= task.destroy().catch(() => {});
  const abort = () => { void destroy(); };
  signal.addEventListener('abort', abort, { once: true });
  const canvas = document.createElement('canvas');

  try {
    const pdf = await task.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 3 });
    if (page.rotate !== 0 || viewport.height / viewport.width < 264 / 240) {
      throw new PdfError('O layout ou a rotação do PDF é incompatível com a carteirinha.');
    }
    if (viewport.width * viewport.height > 16_000_000 || Math.max(viewport.width, viewport.height) > 8192) {
      throw new PdfError('A primeira página do PDF é grande demais para processar.');
    }
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const context = canvas.getContext('2d');
    if (!context) throw new PdfError('O navegador não conseguiu renderizar a página.');

    const text = await page.getTextContent();
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    signal.throwIfAborted();
    const foto = await crop(canvas, REGIAO_FOTO_ESTUDANTE);
    const qrCode = await crop(canvas, REGIAO_QRCODE);
    const fields = parseStudentCardText(text.items.map(item => 'str' in item ? item.str : '').join('\n').trim());
    return { ...fields, validade: fields.validade ?? '', foto, qrCode };
  } catch (error) {
    signal.throwIfAborted();
    if (error instanceof PdfError) throw error;
    if (error instanceof Error && error.name === 'PasswordException') {
      throw new PdfError('O PDF está protegido por senha. Selecione uma cópia desbloqueada.');
    }
    throw new PdfError('Não foi possível ler o PDF. Verifique o arquivo e tente novamente.');
  } finally {
    signal.removeEventListener('abort', abort);
    await destroy();
    canvas.width = canvas.height = 0;
  }
}
