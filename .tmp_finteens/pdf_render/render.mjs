import fs from 'node:fs';
import path from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const [pdfPath, outDir] = process.argv.slice(2);
if (!pdfPath || !outDir) throw new Error('Usage: node render.mjs input.pdf output-dir');
fs.mkdirSync(outDir, { recursive: true });
const data = new Uint8Array(fs.readFileSync(pdfPath));
const pdf = await getDocument({ data, disableWorker: true }).promise;
const rendered = [];

for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const context = canvas.getContext('2d');
  await page.render({ canvasContext: context, viewport }).promise;
  const file = path.join(outDir, `page-${String(i).padStart(3, '0')}.png`);
  fs.writeFileSync(file, canvas.toBuffer('image/png'));
  rendered.push(file);
}

for (let start = 0; start < rendered.length; start += 4) {
  const files = rendered.slice(start, start + 4);
  const images = await Promise.all(files.map(loadImage));
  const thumbWidth = 650;
  const gap = 24;
  const sizes = images.map((img) => ({ w: thumbWidth, h: Math.round(img.height * thumbWidth / img.width) }));
  const row1 = Math.max(...sizes.slice(0, 2).map((s) => s.h));
  const row2 = sizes.length > 2 ? Math.max(...sizes.slice(2, 4).map((s) => s.h)) : 0;
  const sheet = createCanvas(thumbWidth * 2 + gap * 3, row1 + row2 + gap * (row2 ? 3 : 2));
  const ctx = sheet.getContext('2d');
  ctx.fillStyle = '#d8d8d8';
  ctx.fillRect(0, 0, sheet.width, sheet.height);
  for (let j = 0; j < images.length; j++) {
    const col = j % 2;
    const row = Math.floor(j / 2);
    const x = gap + col * (thumbWidth + gap);
    const y = gap + (row === 0 ? 0 : row1 + gap);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, sizes[j].w, sizes[j].h);
    ctx.drawImage(images[j], x, y, sizes[j].w, sizes[j].h);
  }
  const end = start + files.length;
  fs.writeFileSync(path.join(outDir, `sheet-${String(start + 1).padStart(3, '0')}-${String(end).padStart(3, '0')}.png`), sheet.toBuffer('image/png'));
}

console.log(JSON.stringify({ pages: pdf.numPages, outDir }));
