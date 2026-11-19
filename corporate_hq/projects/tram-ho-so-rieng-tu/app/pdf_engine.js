/* Hồ Sơ Riêng Tư - Động cơ tạo tệp PDF 1.4 nhị phân chuẩn 100% cục bộ (0 thư viện ngoài, 0 gửi mạng) */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.PrivacyPdfEngine = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PAGE_SIZES_PT = {
    a4: { width: 595.28, height: 841.89 },
    a4_landscape: { width: 841.89, height: 595.28 },
    a6: { width: 283.46, height: 425.20 },
    a6_landscape: { width: 425.20, height: 283.46 }
  };

  function encodeAscii(str) {
    const out = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i += 1) {
      out[i] = str.charCodeAt(i) & 0xff;
    }
    return out;
  }

  function concatUint8Arrays(chunks) {
    let total = 0;
    for (let i = 0; i < chunks.length; i += 1) {
      total += chunks[i].length;
    }
    const merged = new Uint8Array(total);
    let offset = 0;
    for (let i = 0; i < chunks.length; i += 1) {
      merged.set(chunks[i], offset);
      offset += chunks[i].length;
    }
    return merged;
  }

  function dataUrlToUint8Array(dataUrl) {
    const raw = String(dataUrl || '');
    const commaIdx = raw.indexOf(',');
    if (commaIdx === -1) {
      throw new Error('Chuỗi dữ liệu ảnh không hợp lệ.');
    }
    const base64 = raw.slice(commaIdx + 1);
    if (typeof Buffer !== 'undefined' && typeof atob === 'undefined') {
      return new Uint8Array(Buffer.from(base64, 'base64'));
    }
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) {
      bytes[i] = bin.charCodeAt(i);
    }
    return bytes;
  }

  function parseJpegDimensions(bytes) {
    if (!(bytes instanceof Uint8Array) || bytes.length < 4) {
      return null;
    }
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
      return null;
    }
    let pos = 2;
    while (pos + 4 < bytes.length) {
      if (bytes[pos] !== 0xff) {
        pos += 1;
        continue;
      }
      while (pos < bytes.length && bytes[pos] === 0xff) {
        pos += 1;
      }
      if (pos >= bytes.length) break;
      const marker = bytes[pos];
      pos += 1;
      if (marker === 0xd9 || marker === 0xda) {
        break;
      }
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        continue;
      }
      if (pos + 1 >= bytes.length) break;
      const segLen = (bytes[pos] << 8) | bytes[pos + 1];
      if (segLen < 2 || pos + segLen > bytes.length) break;

      const isSof = (
        marker === 0xc0 || marker === 0xc1 || marker === 0xc2 || marker === 0xc3 ||
        marker === 0xc5 || marker === 0xc6 || marker === 0xc7 || marker === 0xc9 ||
        marker === 0xca || marker === 0xcb || marker === 0xcd || marker === 0xce || marker === 0xcf
      );
      if (isSof && segLen >= 7) {
        const height = (bytes[pos + 3] << 8) | bytes[pos + 4];
        const width = (bytes[pos + 5] << 8) | bytes[pos + 6];
        if (width > 0 && height > 0) {
          return { width: width, height: height };
        }
      }
      pos += segLen;
    }
    return null;
  }

  function formatPt(n) {
    return Number(n).toFixed(2);
  }

  function padOffset(offset) {
    const s = String(offset);
    return '0000000000'.slice(s.length) + s;
  }

  function sanitizePdfInfoText(str) {
    return String(str || '')
      .replace(/[^\x20-\x7e]/g, ' ')
      .replace(/[()\\]/g, ' ')
      .trim()
      .slice(0, 120);
  }

  /**
   * Tạo tệp PDF 1.4 nhị phân chuẩn từ danh sách trang ảnh JPEG.
   * Mỗi phần tử page:
   *  - jpegBytes (Uint8Array) hoặc jpegDataUrl (string)
   *  - widthPx, heightPx (tùy chọn, tự đọc từ JPEG nếu bỏ trống)
   *  - pageSize: 'a4' | 'a4_landscape' | 'a6' | 'a6_landscape' | 'fit' (mặc định 'a4')
   *  - marginPt: lề trang tính bằng point (mặc định 0 cho ảnh đã dàn sẵn trang, hoặc 24pt)
   */
  function buildPdfFromJpegs(pages, options) {
    if (!Array.isArray(pages) || pages.length === 0) {
      throw new Error('Cần ít nhất 1 trang ảnh để tạo tệp PDF.');
    }
    const opts = options || {};
    const defaultSize = opts.pageSize || 'a4';
    const defaultMarginPt = typeof opts.marginPt === 'number' && opts.marginPt >= 0 ? opts.marginPt : 0;

    // Đánh số đối tượng PDF:
    // 1: Catalog
    // 2: Pages
    // Với mỗi trang i (0..N-1):
    //   imageObjId   = 3 + i * 3
    //   contentObjId = 4 + i * 3
    //   pageObjId    = 5 + i * 3
    // infoObjId = 3 + N * 3
    const n = pages.length;
    const infoObjId = 3 + n * 3;
    const totalObjects = infoObjId;

    const preparedPages = [];
    const pageObjIds = [];

    for (let i = 0; i < n; i += 1) {
      const p = pages[i];
      const jpegBytes = p.jpegBytes instanceof Uint8Array
        ? p.jpegBytes
        : dataUrlToUint8Array(p.jpegDataUrl || '');

      if (jpegBytes.length < 4 || jpegBytes[0] !== 0xff || jpegBytes[1] !== 0xd8) {
        throw new Error('Trang thứ ' + (i + 1) + ' không phải dữ liệu JPEG hợp lệ.');
      }

      const detected = parseJpegDimensions(jpegBytes);
      const imgW = Number(p.widthPx) > 0 ? Math.round(Number(p.widthPx)) : (detected ? detected.width : 1240);
      const imgH = Number(p.heightPx) > 0 ? Math.round(Number(p.heightPx)) : (detected ? detected.height : 1754);

      const mode = p.pageSize || defaultSize;
      const margin = typeof p.marginPt === 'number' && p.marginPt >= 0 ? p.marginPt : defaultMarginPt;

      let pageW = PAGE_SIZES_PT.a4.width;
      let pageH = PAGE_SIZES_PT.a4.height;
      if (mode === 'fit') {
        const scaleFit = Math.min(595.28 / imgW, 841.89 / imgH, 1);
        pageW = Math.max(144, imgW * scaleFit + margin * 2);
        pageH = Math.max(144, imgH * scaleFit + margin * 2);
      } else if (mode === 'custom' && p.pageWidthPt > 0 && p.pageHeightPt > 0) {
        pageW = Number(p.pageWidthPt);
        pageH = Number(p.pageHeightPt);
      } else if (PAGE_SIZES_PT[mode]) {
        pageW = PAGE_SIZES_PT[mode].width;
        pageH = PAGE_SIZES_PT[mode].height;
      }

      const availW = Math.max(10, pageW - margin * 2);
      const availH = Math.max(10, pageH - margin * 2);
      const ratio = Math.min(availW / imgW, availH / imgH);
      const drawW = imgW * ratio;
      const drawH = imgH * ratio;
      const drawX = (pageW - drawW) / 2;
      const drawY = (pageH - drawH) / 2;

      const imageObjId = 3 + i * 3;
      const contentObjId = 4 + i * 3;
      const pageObjId = 5 + i * 3;
      pageObjIds.push(pageObjId);

      preparedPages.push({
        jpegBytes: jpegBytes,
        imgW: imgW,
        imgH: imgH,
        pageW: pageW,
        pageH: pageH,
        drawW: drawW,
        drawH: drawH,
        drawX: drawX,
        drawY: drawY,
        imageObjId: imageObjId,
        contentObjId: contentObjId,
        pageObjId: pageObjId
      });
    }

    const chunks = [];
    const offsets = new Array(totalObjects + 1).fill(0);
    let currentOffset = 0;

    function pushBytes(arr) {
      chunks.push(arr);
      currentOffset += arr.length;
    }

    function pushStr(str) {
      pushBytes(encodeAscii(str));
    }

    // Header PDF 1.4 chuẩn kèm dòng dấu nhị phân 4 byte (> 128) theo đặc tả Adobe PDF 1.4
    pushStr('%PDF-1.4\n');
    pushBytes(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

    // Object 1: Catalog
    offsets[1] = currentOffset;
    pushStr('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

    // Object 2: Pages
    offsets[2] = currentOffset;
    const kidsRef = pageObjIds.map(function (id) { return id + ' 0 R'; }).join(' ');
    pushStr('2 0 obj\n<< /Type /Pages /Count ' + n + ' /Kids [ ' + kidsRef + ' ] >>\nendobj\n');

    // Các đối tượng của từng trang
    for (let i = 0; i < preparedPages.length; i += 1) {
      const pg = preparedPages[i];

      // Image XObject
      offsets[pg.imageObjId] = currentOffset;
      pushStr(
        pg.imageObjId + ' 0 obj\n' +
        '<< /Type /XObject /Subtype /Image /Width ' + pg.imgW + ' /Height ' + pg.imgH +
        ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + pg.jpegBytes.length + ' >>\n' +
        'stream\n'
      );
      pushBytes(pg.jpegBytes);
      pushStr('\nendstream\nendobj\n');

      // Page Content Stream
      const streamBody =
        'q\n' +
        formatPt(pg.drawW) + ' 0 0 ' + formatPt(pg.drawH) + ' ' +
        formatPt(pg.drawX) + ' ' + formatPt(pg.drawY) + ' cm\n' +
        '/Im1 Do\n' +
        'Q\n';
      const streamBytes = encodeAscii(streamBody);

      offsets[pg.contentObjId] = currentOffset;
      pushStr(
        pg.contentObjId + ' 0 obj\n' +
        '<< /Length ' + streamBytes.length + ' >>\n' +
        'stream\n'
      );
      pushBytes(streamBytes);
      pushStr('endstream\nendobj\n');

      // Page Object
      offsets[pg.pageObjId] = currentOffset;
      pushStr(
        pg.pageObjId + ' 0 obj\n' +
        '<< /Type /Page /Parent 2 0 R /MediaBox [ 0 0 ' + formatPt(pg.pageW) + ' ' + formatPt(pg.pageH) + ' ] ' +
        '/Resources << /XObject << /Im1 ' + pg.imageObjId + ' 0 R >> >> ' +
        '/Contents ' + pg.contentObjId + ' 0 R >>\n' +
        'endobj\n'
      );
    }

    // Object Info (siêu dữ liệu gọn, không rò rỉ thông tin thiết bị người dùng)
    const titleSafe = sanitizePdfInfoText(opts.title || 'Ho So Rieng Tu');
    offsets[infoObjId] = currentOffset;
    pushStr(
      infoObjId + ' 0 obj\n' +
      '<< /Title (' + titleSafe + ') /Producer (Ho So Rieng Tu Local Engine) >>\n' +
      'endobj\n'
    );

    // Bảng xref chuẩn 20 byte mỗi dòng
    const xrefOffset = currentOffset;
    pushStr('xref\n');
    pushStr('0 ' + (totalObjects + 1) + '\n');
    pushStr('0000000000 65535 f \n');
    for (let id = 1; id <= totalObjects; id += 1) {
      pushStr(padOffset(offsets[id]) + ' 00000 n \n');
    }

    // Trailer & startxref
    pushStr(
      'trailer\n' +
      '<< /Size ' + (totalObjects + 1) + ' /Root 1 0 R /Info ' + infoObjId + ' 0 R >>\n' +
      'startxref\n' +
      xrefOffset + '\n' +
      '%%EOF\n'
    );

    return concatUint8Arrays(chunks);
  }

  /**
   * Kiểm tra tính toàn vẹn cấu trúc nhị phân PDF 1.4 (dùng cho unit test và kiểm định chất lượng).
   */
  function validatePdfStructure(pdfBytes) {
    if (!(pdfBytes instanceof Uint8Array) || pdfBytes.length < 64) {
      return { ok: false, reason: 'Tệp quá nhỏ hoặc không phải Uint8Array.' };
    }
    let ascii = '';
    for (let i = 0; i < pdfBytes.length; i += 1) {
      const b = pdfBytes[i];
      ascii += (b >= 32 && b <= 126) || b === 10 || b === 13 ? String.fromCharCode(b) : '.';
    }
    if (ascii.indexOf('%PDF-1.4') !== 0) {
      return { ok: false, reason: 'Thiếu tiêu đề %PDF-1.4 ở đầu tệp.' };
    }
    if (ascii.trim().slice(-5) !== '%%EOF') {
      return { ok: false, reason: 'Thiếu dấu kết thúc %%EOF.' };
    }
    const xrefMatch = ascii.match(/startxref\s+(\d+)\s+%%EOF/);
    if (!xrefMatch) {
      return { ok: false, reason: 'Thiếu con trỏ startxref hợp lệ.' };
    }
    const xrefPos = Number(xrefMatch[1]);
    const xrefSlice = ascii.slice(xrefPos, xrefPos + 4);
    if (xrefSlice !== 'xref') {
      return { ok: false, reason: 'Vị trí startxref (' + xrefPos + ') không trỏ đúng bảng xref.' };
    }
    const countMatch = ascii.match(/\/Type \/Pages \/Count (\d+)/);
    const pageCount = countMatch ? Number(countMatch[1]) : 0;
    const mediaBoxes = ascii.match(/\/MediaBox \[ 0 0 ([0-9.]+) ([0-9.]+) \]/g) || [];
    return {
      ok: pageCount > 0 && mediaBoxes.length === pageCount,
      pageCount: pageCount,
      xrefOffset: xrefPos,
      byteLength: pdfBytes.length,
      mediaBoxes: mediaBoxes
    };
  }

  return {
    PAGE_SIZES_PT: PAGE_SIZES_PT,
    dataUrlToUint8Array: dataUrlToUint8Array,
    parseJpegDimensions: parseJpegDimensions,
    buildPdfFromJpegs: buildPdfFromJpegs,
    validatePdfStructure: validatePdfStructure
  };
});
