/* Hồ Sơ Riêng Tư - Động cơ xử lý ảnh Canvas 2D cục bộ (an toàn RAM Safari iOS <= 8,7 MP, 0 gửi mạng) */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.PrivacyImageEngine = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const MAX_SAFE_CANVAS_PIXELS = 8700000;

  const A4_DPI_SIZES = {
    200: { width: 1654, height: 2339 },
    300: { width: 2480, height: 3508 }
  };

  // Khổ ảnh thẻ 300 DPI chuẩn Việt Nam & Quốc tế + bố cục dàn trang 10x15cm (1181 x 1772 px)
  const ID_PHOTO_PRESETS = {
    '3x4': {
      code: '3x4',
      label: 'Ảnh 3x4 cm (Hồ sơ, sơ yếu lý lịch)',
      widthPx: 354,
      heightPx: 472,
      sheetWidthPx: 1772,
      sheetHeightPx: 1181,
      sheetOrientation: 'a6_landscape',
      cols: 4,
      rows: 2,
      count: 8,
      sheetLabel: '8 ảnh 3x4 trên tờ in 10x15cm (300 DPI)'
    },
    '4x6': {
      code: '4x6',
      label: 'Ảnh 4x6 cm (Hộ chiếu, hồ sơ xin việc)',
      widthPx: 472,
      heightPx: 709,
      sheetWidthPx: 1181,
      sheetHeightPx: 1772,
      sheetOrientation: 'a6',
      cols: 2,
      rows: 2,
      count: 4,
      sheetLabel: '4 ảnh 4x6 trên tờ in 10x15cm (300 DPI)'
    },
    '2x3': {
      code: '2x3',
      label: 'Ảnh 2x3 cm (Thẻ học sinh, thẻ thư viện)',
      widthPx: 236,
      heightPx: 354,
      sheetWidthPx: 1181,
      sheetHeightPx: 1772,
      sheetOrientation: 'a6',
      cols: 4,
      rows: 4,
      count: 16,
      sheetLabel: '16 ảnh 2x3 trên tờ in 10x15cm (300 DPI)'
    },
    '4x6_visa': {
      code: '4x6_visa',
      label: 'Ảnh 4x6 cm Visa / Hộ chiếu (Nền trắng)',
      widthPx: 472,
      heightPx: 709,
      sheetWidthPx: 1181,
      sheetHeightPx: 1772,
      sheetOrientation: 'a6',
      cols: 2,
      rows: 2,
      count: 4,
      sheetLabel: '4 ảnh 4x6 Visa trên tờ in 10x15cm (300 DPI)'
    }
  };

  function clampDimensionsForMobile(width, height, maxPixels) {
    const cap = Number(maxPixels) > 0 ? Number(maxPixels) : MAX_SAFE_CANVAS_PIXELS;
    const w = Math.max(1, Math.round(Number(width) || 1));
    const h = Math.max(1, Math.round(Number(height) || 1));
    const pixels = w * h;
    if (pixels <= cap) {
      return { width: w, height: h, scale: 1, clamped: false };
    }
    const scale = Math.sqrt(cap / pixels);
    return {
      width: Math.max(1, Math.floor(w * scale)),
      height: Math.max(1, Math.floor(h * scale)),
      scale: scale,
      clamped: true
    };
  }

  function releaseCanvas(canvas) {
    if (!canvas) return;
    try {
      canvas.width = 0;
      canvas.height = 0;
    } catch (_err) {
      // Bỏ qua trong môi trường thử nghiệm không có DOM
    }
  }

  /**
   * Tính tọa độ đặt 2 mặt CCCD theo đúng tỷ lệ thẻ chuẩn ISO ID-1 (85,6 x 53,98 mm) trên trang A4 (210 x 297 mm).
   */
  function computeIdCardA4Layout(a4Width, a4Height) {
    const w = Number(a4Width) || A4_DPI_SIZES[200].width;
    const h = Number(a4Height) || A4_DPI_SIZES[200].height;
    // Tỷ lệ chiều rộng thẻ thật trên khổ A4: 85.6 / 210 = 0.4076 (phóng nhẹ 1,18x để dễ đọc khi in nộp hồ sơ, vẫn chuẩn tỷ lệ 85,6:53,98)
    const cardAspect = 85.6 / 53.98;
    const cardW = Math.round(w * 0.56);
    const cardH = Math.round(cardW / cardAspect);
    const x = Math.round((w - cardW) / 2);
    const gap = Math.round(h * 0.065);
    const totalBlockH = cardH * 2 + gap;
    const topY = Math.round((h - totalBlockH) / 2);
    return {
      a4Width: w,
      a4Height: h,
      cardAspect: Number(cardAspect.toFixed(4)),
      front: { x: x, y: topY, width: cardW, height: cardH },
      back: { x: x, y: topY + cardH + gap, width: cardW, height: cardH }
    };
  }

  /**
   * Tính tọa độ từng ô ảnh trên tờ dàn trang 10x15cm (khổ A6 300 DPI) bảo đảm không chồng lấn và có khoảng cắt mờ.
   */
  function computePhotoSheetLayout(sizeKey) {
    const preset = ID_PHOTO_PRESETS[sizeKey] || ID_PHOTO_PRESETS['3x4'];
    const gap = 28;
    const totalW = preset.cols * preset.widthPx + (preset.cols - 1) * gap;
    const totalH = preset.rows * preset.heightPx + (preset.rows - 1) * gap;
    const startX = Math.floor((preset.sheetWidthPx - totalW) / 2);
    const startY = Math.floor((preset.sheetHeightPx - totalH) / 2);

    const cells = [];
    for (let r = 0; r < preset.rows; r += 1) {
      for (let c = 0; c < preset.cols; c += 1) {
        cells.push({
          row: r,
          col: c,
          x: startX + c * (preset.widthPx + gap),
          y: startY + r * (preset.heightPx + gap),
          width: preset.widthPx,
          height: preset.heightPx
        });
      }
    }

    return {
      preset: preset,
      sheetWidthPx: preset.sheetWidthPx,
      sheetHeightPx: preset.sheetHeightPx,
      gapPx: gap,
      cells: cells
    };
  }

  /**
   * Thuật toán tìm kiếm nhị phân (Binary Search) nén ảnh đạt dung lượng <= targetBytes
   * nhưng tối đa hóa độ nét chữ (chất lượng JPEG cao nhất có thể trong giới hạn).
   * encodeFn(scale, quality) -> Promise<{ size: number, data: any }> hoặc synchronous result.
   */
  async function binarySearchCompress(encodeFn, targetBytes, options) {
    const opts = options || {};
    const target = Math.max(20480, Math.round(Number(targetBytes) || 2097152));
    const scales = Array.isArray(opts.scales) && opts.scales.length > 0
      ? opts.scales
      : [1.0, 0.88, 0.76, 0.64, 0.52, 0.42, 0.32];
    const minQ = typeof opts.minQuality === 'number' ? opts.minQuality : 0.28;
    const maxQ = typeof opts.maxQuality === 'number' ? opts.maxQuality : 0.94;
    const iterations = typeof opts.iterations === 'number' ? opts.iterations : 7;

    let attempts = 0;
    let smallestFallback = null;

    for (let sIdx = 0; sIdx < scales.length; sIdx += 1) {
      const scale = scales[sIdx];

      // Thử chất lượng tối đa ở tỷ lệ hiện tại trước
      attempts += 1;
      const topTry = await encodeFn(scale, maxQ);
      if (!smallestFallback || topTry.size < smallestFallback.size) {
        smallestFallback = Object.assign({ scale: scale, quality: maxQ }, topTry);
      }
      if (topTry.size <= target) {
        return Object.assign({
          scale: scale,
          quality: Number(maxQ.toFixed(3)),
          hitTarget: true,
          attempts: attempts
        }, topTry);
      }

      // Kiểm tra cận dưới ở tỷ lệ hiện tại: nếu minQ vẫn vượt target -> hạ scale ngay để tiết kiệm bước
      attempts += 1;
      const lowTry = await encodeFn(scale, minQ);
      if (!smallestFallback || lowTry.size < smallestFallback.size) {
        smallestFallback = Object.assign({ scale: scale, quality: minQ }, lowTry);
      }
      if (lowTry.size > target) {
        continue;
      }

      // Tìm kiếm nhị phân chính xác giữa [minQ, maxQ]
      let lo = minQ;
      let hi = maxQ;
      let best = Object.assign({ scale: scale, quality: minQ }, lowTry);

      for (let step = 0; step < iterations; step += 1) {
        const mid = (lo + hi) / 2;
        attempts += 1;
        const probe = await encodeFn(scale, Number(mid.toFixed(3)));
        if (probe.size <= target) {
          best = Object.assign({ scale: scale, quality: Number(mid.toFixed(3)) }, probe);
          lo = mid;
        } else {
          hi = mid;
        }
      }

      return Object.assign({
        hitTarget: best.size <= target,
        attempts: attempts
      }, best);
    }

    return Object.assign({
      hitTarget: Boolean(smallestFallback && smallestFallback.size <= target),
      attempts: attempts
    }, smallestFallback || { size: 0, scale: 0.32, quality: minQ, data: null });
  }

  /**
   * Quét nhị phân siêu dữ liệu EXIF / GPS / XMP trong tệp JPEG, PNG, WebP.
   */
  function inspectImageMetadata(bytes, filename, mimeType) {
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(0);
    const result = {
      filename: String(filename || 'tep-anh'),
      mimeType: String(mimeType || ''),
      byteLength: u8.length,
      format: 'Không xác định',
      hasExif: false,
      hasGps: false,
      hasXmp: false,
      markersFound: []
    };

    if (u8.length < 12) return result;

    // Kiểm tra JPEG (FF D8)
    if (u8[0] === 0xff && u8[1] === 0xd8) {
      result.format = 'JPEG';
      let pos = 2;
      while (pos + 4 < u8.length) {
        if (u8[pos] !== 0xff) {
          pos += 1;
          continue;
        }
        while (pos < u8.length && u8[pos] === 0xff) pos += 1;
        if (pos >= u8.length) break;
        const marker = u8[pos];
        pos += 1;
        if (marker === 0xda || marker === 0xd9) break;
        if (pos + 1 >= u8.length) break;
        const segLen = (u8[pos] << 8) | u8[pos + 1];
        if (segLen < 2 || pos + segLen > u8.length) break;

        if (marker === 0xe1) {
          const headStr = bytesToAscii(u8, pos + 2, Math.min(pos + segLen, pos + 40));
          if (headStr.indexOf('Exif') === 0) {
            result.hasExif = true;
            result.markersFound.push('EXIF (Thông tin máy ảnh / thời gian chụp)');
            const bodyStr = bytesToAscii(u8, pos + 2, pos + segLen);
            if (bodyStr.indexOf('GPS') !== -1 || hasGpsIfdTag(u8, pos + 8, pos + segLen)) {
              result.hasGps = true;
              result.markersFound.push('Tọa độ vị trí GPS');
            }
          } else if (headStr.indexOf('http://ns.adobe.com/xap') !== -1) {
            result.hasXmp = true;
            result.markersFound.push('Siêu dữ liệu XMP');
          }
        }
        pos += segLen;
      }
      return result;
    }

    // Kiểm tra PNG (89 50 4E 47)
    if (u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4e && u8[3] === 0x47) {
      result.format = 'PNG';
      let pos = 8;
      while (pos + 12 <= u8.length) {
        const chunkLen = ((u8[pos] << 24) >>> 0) + (u8[pos + 1] << 16) + (u8[pos + 2] << 8) + u8[pos + 3];
        const type = bytesToAscii(u8, pos + 4, pos + 8);
        if (type === 'eXIf') {
          result.hasExif = true;
          result.markersFound.push('Khối EXIF trong PNG');
        } else if (type === 'tEXt' || type === 'iTXt' || type === 'zTXt') {
          result.hasXmp = true;
          result.markersFound.push('Ghi chú siêu dữ liệu (' + type + ')');
        }
        if (type === 'IEND') break;
        pos += 12 + chunkLen;
      }
      return result;
    }

    // Kiểm tra WebP (RIFF....WEBP)
    if (bytesToAscii(u8, 0, 4) === 'RIFF' && bytesToAscii(u8, 8, 12) === 'WEBP') {
      result.format = 'WebP';
      const allAscii = bytesToAscii(u8, 12, Math.min(u8.length, 65536));
      if (allAscii.indexOf('EXIF') !== -1) {
        result.hasExif = true;
        result.markersFound.push('Khối EXIF trong WebP');
      }
      if (allAscii.indexOf('XMP ') !== -1) {
        result.hasXmp = true;
        result.markersFound.push('Khối XMP trong WebP');
      }
      return result;
    }

    return result;
  }

  function bytesToAscii(u8, start, end) {
    let out = '';
    const limit = Math.min(u8.length, end);
    for (let i = start; i < limit; i += 1) {
      const b = u8[i];
      out += b >= 32 && b <= 126 ? String.fromCharCode(b) : ' ';
    }
    return out;
  }

  function hasGpsIfdTag(u8, start, end) {
    for (let i = start; i + 1 < end; i += 1) {
      // Tag GPSInfoIFDPointer: 0x8825 (big-endian) hoặc 0x25 0x88 (little-endian)
      if ((u8[i] === 0x88 && u8[i + 1] === 0x25) || (u8[i] === 0x25 && u8[i + 1] === 0x88)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Gắn thử 1 khối APP1 EXIF/GPS mô phỏng vào JPEG mẫu để người dùng tự kiểm chứng công cụ xóa siêu dữ liệu.
   */
  function injectDemoExifMarker(jpegBytes) {
    if (!(jpegBytes instanceof Uint8Array) || jpegBytes.length < 4 || jpegBytes[0] !== 0xff || jpegBytes[1] !== 0xd8) {
      return jpegBytes;
    }
    const payloadText = 'Exif\0\0MM\0*\0\0\0\x08\0\x01\x88\x25DEMO-CAMERA-GPS-10.7769N-106.7009E';
    const payloadBytes = new Uint8Array(payloadText.length);
    for (let i = 0; i < payloadText.length; i += 1) {
      payloadBytes[i] = payloadText.charCodeAt(i) & 0xff;
    }
    const segLen = payloadBytes.length + 2;
    const out = new Uint8Array(jpegBytes.length + 2 + segLen);
    out[0] = 0xff;
    out[1] = 0xd8;
    out[2] = 0xff;
    out[3] = 0xe1;
    out[4] = (segLen >> 8) & 0xff;
    out[5] = segLen & 0xff;
    out.set(payloadBytes, 6);
    out.set(jpegBytes.subarray(2), 6 + payloadBytes.length);
    return out;
  }

  /* ========================================================================
     Các hàm vẽ Canvas 2D chạy trên trình duyệt
     ======================================================================== */

  function createCanvas(w, h) {
    const safe = clampDimensionsForMobile(w, h);
    const canvas = document.createElement('canvas');
    canvas.width = safe.width;
    canvas.height = safe.height;
    return canvas;
  }

  function drawImageRotatedFit(ctx, img, boxX, boxY, boxW, boxH, rotationDeg, coverMode) {
    const rot = ((Number(rotationDeg) || 0) % 360 + 360) % 360;
    const rad = (rot * Math.PI) / 180;
    const swapped = rot === 90 || rot === 270;
    const srcW = swapped ? (img.naturalHeight || img.height) : (img.naturalWidth || img.width);
    const srcH = swapped ? (img.naturalWidth || img.width) : (img.naturalHeight || img.height);
    if (!srcW || !srcH) return;

    const scale = coverMode
      ? Math.max(boxW / srcW, boxH / srcH)
      : Math.min(boxW / srcW, boxH / srcH);
    const drawW = (img.naturalWidth || img.width) * scale;
    const drawH = (img.naturalHeight || img.height) * scale;

    ctx.save();
    ctx.beginPath();
    ctx.rect(boxX, boxY, boxW, boxH);
    ctx.clip();
    ctx.translate(boxX + boxW / 2, boxY + boxH / 2);
    ctx.rotate(rad);
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }

  function rgb(r, g, b, a) {
    return a == null
      ? ('rgb(' + r + ', ' + g + ', ' + b + ')')
      : ('rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')');
  }

  function canvasFont(weight, sizeNum, family) {
    return String(weight) + ' ' + Math.round(sizeNum) + 'p' + 'x ' + (family || 'sans-serif');
  }

  const PRINT_COLOR = {
    paperWhite: rgb(255, 255, 255),
    softGray: rgb(247, 248, 250),
    borderSlate: rgb(203, 213, 225),
    mutedSlate: rgb(100, 116, 139),
    inkDark: rgb(20, 26, 24),
    inkSlate: rgb(30, 41, 59),
    inkSub: rgb(51, 65, 85),
    idBlue: rgb(34, 108, 214),
    passportWhite: rgb(248, 250, 252),
    sampleMint: rgb(235, 245, 240),
    sampleBack: rgb(238, 243, 247),
    tealBrand: rgb(11, 102, 90),
    crimson: rgb(153, 27, 27),
    crimsonStrong: rgb(185, 28, 28),
    chipGold: rgb(217, 119, 6),
    chipEdge: rgb(146, 64, 14),
    portraitBg: rgb(229, 231, 235),
    suitDark: rgb(31, 41, 55),
    skinTone: rgb(242, 198, 166),
    skinLight: rgb(253, 230, 212),
    hairDark: rgb(30, 36, 43),
    lipWarm: rgb(154, 91, 68),
    hintText: rgb(82, 94, 89)
  };

  function renderIdCardA4Canvas(opts) {
    const dpi = opts.dpi === 300 ? 300 : 200;
    const dims = A4_DPI_SIZES[dpi];
    const layout = computeIdCardA4Layout(dims.width, dims.height);
    const canvas = createCanvas(dims.width, dims.height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = PRINT_COLOR.paperWhite;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Khung nhẹ gợi ý vị trí mặt trước và mặt sau
    const cards = [
      { rect: layout.front, img: opts.frontImg, rot: opts.frontRot || 0, label: 'Mặt trước giấy tờ' },
      { rect: layout.back, img: opts.backImg, rot: opts.backRot || 0, label: 'Mặt sau giấy tờ' }
    ];

    cards.forEach(function (item) {
      const r = item.rect;
      ctx.save();
      ctx.fillStyle = PRINT_COLOR.softGray;
      ctx.strokeStyle = PRINT_COLOR.borderSlate;
      ctx.lineWidth = Math.max(2, Math.round(canvas.width / 700));
      ctx.fillRect(r.x, r.y, r.width, r.height);
      if (item.img) {
        drawImageRotatedFit(ctx, item.img, r.x, r.y, r.width, r.height, item.rot, false);
      } else {
        ctx.fillStyle = PRINT_COLOR.mutedSlate;
        ctx.font = canvasFont(600, canvas.width * 0.022);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label + ' (chưa chọn ảnh)', r.x + r.width / 2, r.y + r.height / 2);
      }
      ctx.strokeRect(r.x, r.y, r.width, r.height);
      ctx.restore();
    });

    // Dấu chìm chéo nhiều lớp chống vay nợ đen / lạm dụng hồ sơ
    const wmText = String(opts.watermarkText || '').trim();
    if (wmText) {
      const opacity = Math.min(0.65, Math.max(0.08, Number(opts.watermarkOpacity) || 0.24));
      const colorMap = {
        red: rgb(185, 28, 28, opacity),
        slate: rgb(30, 41, 59, opacity),
        teal: rgb(11, 102, 90, opacity)
      };
      const fill = colorMap[opts.watermarkColor] || colorMap.red;
      const angleDeg = typeof opts.watermarkAngle === 'number' ? opts.watermarkAngle : -28;
      const fontSize = Math.max(22, Math.round(canvas.width * 0.021));

      ctx.save();
      ctx.fillStyle = fill;
      ctx.font = canvasFont(700, fontSize);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((angleDeg * Math.PI) / 180);

      const stepY = Math.round(fontSize * 5.2);
      const stepX = Math.max(Math.round(ctx.measureText(wmText).width + fontSize * 3.5), Math.round(canvas.width * 0.55));
      for (let y = -canvas.height; y <= canvas.height; y += stepY) {
        for (let x = -canvas.width; x <= canvas.width; x += stepX) {
          ctx.fillText(wmText, x, y);
        }
      }
      ctx.restore();
    }

    return canvas;
  }

  /**
   * Tách nền biên thông minh (BFS Flood-Fill từ viền ảnh) trên Canvas 2D cho ảnh thẻ.
   */
  function replaceEdgeBackground(canvas, bgMode) {
    if (bgMode !== 'blue' && bgMode !== 'white') return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Lấy màu nền trung bình từ 4 góc + dải cạnh trên
    const samples = [
      [2, 2], [w - 3, 2], [2, Math.floor(h * 0.25)], [w - 3, Math.floor(h * 0.25)],
      [Math.floor(w * 0.15), 2], [Math.floor(w * 0.85), 2]
    ];
    let sr = 0;
    let sg = 0;
    let sb = 0;
    samples.forEach(function (pt) {
      const idx = (pt[1] * w + pt[0]) * 4;
      sr += data[idx];
      sg += data[idx + 1];
      sb += data[idx + 2];
    });
    sr /= samples.length;
    sg /= samples.length;
    sb /= samples.length;

    const targetRgb = bgMode === 'blue' ? [34, 108, 214] : [248, 250, 252];
    const threshold = 58;
    const softBand = 22;
    const visited = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let head = 0;
    let tail = 0;

    function enqueue(px, py) {
      const pos = py * w + px;
      if (visited[pos]) return;
      const idx = pos * 4;
      const dr = data[idx] - sr;
      const dg = data[idx + 1] - sg;
      const db = data[idx + 2] - sb;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      if (dist <= threshold + softBand) {
        visited[pos] = 1;
        queue[tail] = pos;
        tail += 1;
      }
    }

    for (let x = 0; x < w; x += 1) {
      enqueue(x, 0);
      enqueue(x, 1);
    }
    for (let y = 0; y < Math.floor(h * 0.85); y += 1) {
      enqueue(0, y);
      enqueue(w - 1, y);
    }

    while (head < tail) {
      const pos = queue[head];
      head += 1;
      const px = pos % w;
      const py = (pos - px) / w;
      const idx = pos * 4;
      const dr = data[idx] - sr;
      const dg = data[idx + 1] - sg;
      const db = data[idx + 2] - sb;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);

      if (dist <= threshold) {
        data[idx] = targetRgb[0];
        data[idx + 1] = targetRgb[1];
        data[idx + 2] = targetRgb[2];
        if (px > 0) enqueue(px - 1, py);
        if (px + 1 < w) enqueue(px + 1, py);
        if (py > 0) enqueue(px, py - 1);
        if (py + 1 < h) enqueue(px, py + 1);
      } else {
        const blend = Math.max(0, Math.min(1, 1 - (dist - threshold) / softBand));
        data[idx] = Math.round(data[idx] * (1 - blend) + targetRgb[0] * blend);
        data[idx + 1] = Math.round(data[idx + 1] * (1 - blend) + targetRgb[1] * blend);
        data[idx + 2] = Math.round(data[idx + 2] * (1 - blend) + targetRgb[2] * blend);
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  function renderSingleIdPhotoCanvas(opts) {
    const preset = ID_PHOTO_PRESETS[opts.sizeKey] || ID_PHOTO_PRESETS['3x4'];
    const canvas = createCanvas(preset.widthPx, preset.heightPx);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = opts.bgMode === 'blue' ? PRINT_COLOR.idBlue : PRINT_COLOR.passportWhite;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (opts.img) {
      const zoom = Math.max(0.6, Math.min(2.4, Number(opts.zoom) || 1));
      const offsetX = Number(opts.offsetX) || 0;
      const offsetY = Number(opts.offsetY) || 0;
      const iw = opts.img.naturalWidth || opts.img.width;
      const ih = opts.img.naturalHeight || opts.img.height;
      const baseScale = Math.max(canvas.width / iw, canvas.height / ih);
      const drawW = iw * baseScale * zoom;
      const drawH = ih * baseScale * zoom;
      const dx = (canvas.width - drawW) / 2 + offsetX;
      const dy = (canvas.height - drawH) / 2 + offsetY;
      ctx.drawImage(opts.img, dx, dy, drawW, drawH);

      if (opts.bgMode === 'blue' || opts.bgMode === 'white') {
        replaceEdgeBackground(canvas, opts.bgMode);
      }
    }

    return canvas;
  }

  function renderPhotoSheetCanvas(singleCanvas, sizeKey) {
    const layout = computePhotoSheetLayout(sizeKey);
    const sheet = createCanvas(layout.sheetWidthPx, layout.sheetHeightPx);
    const ctx = sheet.getContext('2d');

    ctx.fillStyle = PRINT_COLOR.paperWhite;
    ctx.fillRect(0, 0, sheet.width, sheet.height);

    layout.cells.forEach(function (cell) {
      ctx.drawImage(singleCanvas, cell.x, cell.y, cell.width, cell.height);
      ctx.strokeStyle = PRINT_COLOR.borderSlate;
      ctx.lineWidth = 2;
      ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
    });

    return sheet;
  }

  /* ========================================================================
     Bộ sinh ảnh mẫu cục bộ 100% bằng Canvas (không cần mạng / ảnh ngoài)
     ======================================================================== */

  function createSampleIdCards() {
    const front = createCanvas(1027, 648);
    const fCtx = front.getContext('2d');
    fCtx.fillStyle = PRINT_COLOR.sampleMint;
    fCtx.fillRect(0, 0, 1027, 648);
    fCtx.strokeStyle = PRINT_COLOR.tealBrand;
    fCtx.lineWidth = 6;
    fCtx.strokeRect(12, 12, 1003, 624);

    fCtx.fillStyle = PRINT_COLOR.crimson;
    fCtx.font = canvasFont(700, 22);
    fCtx.textAlign = 'center';
    fCtx.fillText('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', 560, 56);
    fCtx.fillStyle = PRINT_COLOR.inkSlate;
    fCtx.font = canvasFont(700, 26);
    fCtx.fillText('CĂN CƯỚC CÔNG DÂN (ẢNH MẪU THỬ NGHIỆM)', 560, 100);

    // Khung ảnh chân dung mẫu bên trái
    fCtx.fillStyle = PRINT_COLOR.idBlue;
    fCtx.fillRect(54, 155, 220, 290);
    fCtx.fillStyle = PRINT_COLOR.skinLight;
    fCtx.beginPath();
    fCtx.arc(164, 255, 48, 0, Math.PI * 2);
    fCtx.fill();
    fCtx.fillStyle = PRINT_COLOR.inkSlate;
    fCtx.beginPath();
    fCtx.ellipse(164, 395, 76, 62, 0, Math.PI, Math.PI * 2);
    fCtx.fill();

    // Thông tin mẫu
    fCtx.textAlign = 'left';
    fCtx.fillStyle = PRINT_COLOR.inkSub;
    fCtx.font = canvasFont(600, 20);
    fCtx.fillText('Số định danh (mẫu ảo):', 315, 195);
    fCtx.fillStyle = PRINT_COLOR.crimsonStrong;
    fCtx.font = canvasFont(800, 34);
    fCtx.fillText('079200012345', 315, 240);

    fCtx.fillStyle = PRINT_COLOR.inkSlate;
    fCtx.font = canvasFont(700, 26);
    fCtx.fillText('NGUYỄN VĂN MẪU', 315, 305);
    fCtx.font = canvasFont(500, 21);
    fCtx.fillStyle = PRINT_COLOR.inkSub;
    fCtx.fillText('Ngày sinh: 19/11/1996   Giới tính: Nam', 315, 355);
    fCtx.fillText('Quốc tịch: Việt Nam', 315, 395);
    fCtx.fillText('Nơi thường trú: Phường Bến Nghé, TP. Hồ Chí Minh', 315, 435);

    fCtx.fillStyle = PRINT_COLOR.tealBrand;
    fCtx.font = canvasFont(700, 18);
    fCtx.fillText('MẪU MINH HỌA TẠO CỤC BỘ TRÊN TRÌNH DUYỆT (KHÔNG PHẢI GIẤY TỜ THẬT)', 54, 595);

    const back = createCanvas(1027, 648);
    const bCtx = back.getContext('2d');
    bCtx.fillStyle = PRINT_COLOR.sampleBack;
    bCtx.fillRect(0, 0, 1027, 648);
    bCtx.strokeStyle = PRINT_COLOR.inkSub;
    bCtx.lineWidth = 6;
    bCtx.strokeRect(12, 12, 1003, 624);

    // Chip vàng mô phỏng
    bCtx.fillStyle = PRINT_COLOR.chipGold;
    bCtx.fillRect(72, 145, 130, 100);
    bCtx.strokeStyle = PRINT_COLOR.chipEdge;
    bCtx.lineWidth = 3;
    bCtx.strokeRect(72, 145, 130, 100);

    bCtx.fillStyle = PRINT_COLOR.inkSlate;
    bCtx.font = canvasFont(700, 24);
    bCtx.fillText('MẶT SAU THẺ MẪU MINH HỌA', 240, 120);
    bCtx.font = canvasFont(500, 21);
    bCtx.fillStyle = PRINT_COLOR.inkSub;
    bCtx.fillText('Đặc điểm nhận dạng: Mẫu thử nghiệp vụ ghép A4', 240, 185);
    bCtx.fillText('Ngày cấp mẫu: 01/01/2026', 240, 230);

    // Dải mã MRZ mô phỏng
    bCtx.fillStyle = PRINT_COLOR.paperWhite;
    bCtx.fillRect(48, 435, 931, 155);
    bCtx.fillStyle = PRINT_COLOR.inkSlate;
    bCtx.font = canvasFont(700, 24, 'monospace');
    bCtx.fillText('IDVNM2000123456079200012345<<<', 76, 488);
    bCtx.fillText('9611194M3611191VNM<<<<<<<<<<<8', 76, 528);
    bCtx.fillText('NGUYEN<<VAN<MAU<<<<<<<<<<<<<<<', 76, 568);

    return { frontCanvas: front, backCanvas: back };
  }

  function createSamplePortraitCanvas() {
    const c = createCanvas(640, 840);
    const ctx = c.getContext('2d');
    ctx.fillStyle = PRINT_COLOR.portraitBg;
    ctx.fillRect(0, 0, 640, 840);

    ctx.fillStyle = PRINT_COLOR.suitDark;
    ctx.beginPath();
    ctx.ellipse(320, 770, 225, 185, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PRINT_COLOR.passportWhite;
    ctx.beginPath();
    ctx.moveTo(260, 585);
    ctx.lineTo(320, 720);
    ctx.lineTo(380, 585);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = PRINT_COLOR.skinTone;
    ctx.fillRect(280, 490, 80, 110);
    ctx.beginPath();
    ctx.ellipse(320, 385, 112, 138, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PRINT_COLOR.hairDark;
    ctx.beginPath();
    ctx.ellipse(320, 315, 118, 92, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PRINT_COLOR.hairDark;
    ctx.beginPath();
    ctx.arc(278, 375, 9, 0, Math.PI * 2);
    ctx.arc(362, 375, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = PRINT_COLOR.lipWarm;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(320, 438, 30, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    return c;
  }

  function createSampleDocumentCanvas(pageTitle, pageIndex, addNoiseForHeavyTest) {
    const w = addNoiseForHeavyTest ? 2000 : 1240;
    const h = addNoiseForHeavyTest ? 2828 : 1754;
    const c = createCanvas(w, h);
    const ctx = c.getContext('2d');

    ctx.fillStyle = PRINT_COLOR.paperWhite;
    ctx.fillRect(0, 0, w, h);

    if (addNoiseForHeavyTest) {
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;
      let seed = 1337 + (pageIndex || 1) * 97;
      for (let i = 0; i < d.length; i += 4) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const delta = (seed >>> 27) & 31;
        const v = 224 + delta;
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = Math.min(255, v + 2);
        d[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
    }

    const scale = w / 1240;
    ctx.fillStyle = PRINT_COLOR.inkDark;
    ctx.textAlign = 'center';
    ctx.font = canvasFont(700, 28 * scale);
    ctx.fillText('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', w / 2, Math.round(130 * scale));
    ctx.font = canvasFont(600, 24 * scale);
    ctx.fillText('Độc lập - Tự do - Hạnh phúc', w / 2, Math.round(175 * scale));

    ctx.font = canvasFont(800, 34 * scale);
    ctx.fillText(pageTitle || 'ĐƠN XIN XÁC NHẬN HỒ SƠ', w / 2, Math.round(290 * scale));

    ctx.textAlign = 'left';
    ctx.font = canvasFont(400, 24 * scale);
    const lines = [
      'Kính gửi: Bộ phận tiếp nhận hồ sơ và trả kết quả',
      'Họ và tên người làm đơn: Nguyễn Văn Mẫu',
      'Số định danh cá nhân (mẫu): 079200012345',
      'Nội dung đề nghị: Xác nhận thông tin hồ sơ nộp trực tuyến trên Cổng Dịch vụ công.',
      'Tài liệu này được tạo cục bộ trên trình duyệt để người dùng thử nghiệm quy trình',
      'nén dung lượng dưới 2MB, ký tên điện tử và gộp tệp PDF chuẩn A4 mà không gửi dữ liệu lên mạng.',
      'Tôi xin cam đoan mọi thông tin kê khai là hoàn toàn trung thực.'
    ];
    let y = Math.round(390 * scale);
    lines.forEach(function (line) {
      ctx.fillText(line, Math.round(110 * scale), y);
      y += Math.round(54 * scale);
    });

    ctx.textAlign = 'center';
    ctx.font = canvasFont(600, 22 * scale);
    ctx.fillText('Ngày 19 tháng 11 năm 2026', Math.round(920 * scale), Math.round(1150 * scale));
    ctx.font = canvasFont(700, 24 * scale);
    ctx.fillText('NGƯỜI LÀM ĐƠN', Math.round(920 * scale), Math.round(1195 * scale));
    ctx.font = canvasFont(400, 18 * scale);
    ctx.fillStyle = PRINT_COLOR.hintText;
    ctx.fillText('(Ký và ghi rõ họ tên tại đây)', Math.round(920 * scale), Math.round(1235 * scale));

    if (pageIndex) {
      ctx.fillText('Trang ' + pageIndex, w / 2, h - Math.round(60 * scale));
    }

    return c;
  }

  function formatBytesVi(bytes) {
    const b = Math.max(0, Number(bytes) || 0);
    if (b >= 1048576) {
      return (b / 1048576).toFixed(2).replace('.', ',') + ' MB';
    }
    if (b >= 1024) {
      return (b / 1024).toFixed(1).replace('.', ',') + ' KB';
    }
    return Math.round(b) + ' byte';
  }

  return {
    MAX_SAFE_CANVAS_PIXELS: MAX_SAFE_CANVAS_PIXELS,
    A4_DPI_SIZES: A4_DPI_SIZES,
    ID_PHOTO_PRESETS: ID_PHOTO_PRESETS,
    clampDimensionsForMobile: clampDimensionsForMobile,
    releaseCanvas: releaseCanvas,
    computeIdCardA4Layout: computeIdCardA4Layout,
    computePhotoSheetLayout: computePhotoSheetLayout,
    binarySearchCompress: binarySearchCompress,
    inspectImageMetadata: inspectImageMetadata,
    injectDemoExifMarker: injectDemoExifMarker,
    createCanvas: createCanvas,
    drawImageRotatedFit: drawImageRotatedFit,
    renderIdCardA4Canvas: renderIdCardA4Canvas,
    renderSingleIdPhotoCanvas: renderSingleIdPhotoCanvas,
    renderPhotoSheetCanvas: renderPhotoSheetCanvas,
    createSampleIdCards: createSampleIdCards,
    createSamplePortraitCanvas: createSamplePortraitCanvas,
    createSampleDocumentCanvas: createSampleDocumentCanvas,
    formatBytesVi: formatBytesVi
  };
});
