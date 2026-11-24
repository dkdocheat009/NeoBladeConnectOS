// Minimal PNG decode/encode helpers used only by dev/QA scripts in
// scripts/ (not part of the app bundle). No external dependency.
import fs from 'node:fs';
import zlib from 'node:zlib';

function crc32(buf) {
  if (!crc32.table) {
    const t = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    crc32.table = t;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = crc32.table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export function decodePNG(filePath) {
  const data = fs.readFileSync(filePath);
  let offset = 8;
  let width, height, bitDepth, colorType;
  const idatChunks = [];
  while (offset < data.length) {
    const len = data.readUInt32BE(offset);
    const type = data.toString('ascii', offset + 4, offset + 8);
    const chunkData = data.subarray(offset + 8, offset + 8 + len);
    if (type === 'IHDR') {
      width = chunkData.readUInt32BE(0);
      height = chunkData.readUInt32BE(4);
      bitDepth = chunkData.readUInt8(8);
      colorType = chunkData.readUInt8(9);
    } else if (type === 'IDAT') {
      idatChunks.push(chunkData);
    } else if (type === 'IEND') {
      break;
    }
    offset += 8 + len + 4;
  }
  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  let channels;
  if (colorType === 6) channels = 4;
  else if (colorType === 2) channels = 3;
  else if (colorType === 0) channels = 1;
  else throw new Error('unsupported colorType ' + colorType);
  const bpp = channels * (bitDepth / 8);
  const stride = width * bpp;
  const pixels = Buffer.alloc(height * stride);
  let rawOffset = 0;
  for (let y = 0; y < height; y++) {
    const filterType = raw[rawOffset];
    rawOffset += 1;
    const prevLineStart = (y - 1) * stride;
    const curLineStart = y * stride;
    for (let x = 0; x < stride; x++) {
      const rawByte = raw[rawOffset + x];
      const a = x >= bpp ? pixels[curLineStart + x - bpp] : 0;
      const bb = y > 0 ? pixels[prevLineStart + x] : 0;
      const c = y > 0 && x >= bpp ? pixels[prevLineStart + x - bpp] : 0;
      let value;
      switch (filterType) {
        case 0:
          value = rawByte;
          break;
        case 1:
          value = (rawByte + a) & 0xff;
          break;
        case 2:
          value = (rawByte + bb) & 0xff;
          break;
        case 3:
          value = (rawByte + Math.floor((a + bb) / 2)) & 0xff;
          break;
        case 4: {
          const p = a + bb - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - bb);
          const pc = Math.abs(p - c);
          let pr;
          if (pa <= pb && pa <= pc) pr = a;
          else if (pb <= pc) pr = bb;
          else pr = c;
          value = (rawByte + pr) & 0xff;
          break;
        }
        default:
          throw new Error('unsupported filter ' + filterType);
      }
      pixels[curLineStart + x] = value;
    }
    rawOffset += stride;
  }
  return { width, height, channels, pixels };
}

export function getPixel(img, x, y) {
  const idx = y * img.width * img.channels + x * img.channels;
  const r = img.pixels[idx];
  const g = img.pixels[idx + 1];
  const b = img.pixels[idx + 2];
  const a = img.channels === 4 ? img.pixels[idx + 3] : 255;
  return { r, g, b, a };
}

export function encodePNG(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(6, 9);
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}
