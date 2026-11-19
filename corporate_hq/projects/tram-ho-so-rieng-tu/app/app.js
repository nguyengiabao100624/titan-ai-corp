/* Hồ Sơ Riêng Tư - Bộ điều khiển 6 công cụ xử lý giấy tờ & PDF 100% cục bộ (0 gửi mạng, XSS-safe) */
(function () {
  'use strict';

  const PdfEngine = window.PrivacyPdfEngine;
  const ImgEngine = window.PrivacyImageEngine;
  if (!PdfEngine || !ImgEngine) {
    return;
  }

  const $ = function (id) { return document.getElementById(id); };

  const TOOLS = ['cccd', 'compress', 'idphoto', 'sign', 'merge', 'exif'];
  const THEME_STORAGE_KEY = 'ho_so_rieng_tu_theme_v1';

  const WM_COLOR_OPTIONS = [
    { value: 'red', label: 'Đỏ cảnh báo (dễ nhận biết khi photo)' },
    { value: 'slate', label: 'Xám than trung tính (trang nhã)' },
    { value: 'teal', label: 'Xanh ngọc đậm (dễ đọc trên nền trắng)' }
  ];

  const IDPHOTO_SIZE_OPTIONS = [
    { value: '3x4', label: 'Ảnh 3x4 cm (Dàn 8 ảnh / tờ 10x15cm)' },
    { value: '4x6', label: 'Ảnh 4x6 cm (Dàn 4 ảnh / tờ 10x15cm)' },
    { value: '2x3', label: 'Ảnh 2x3 cm (Dàn 16 ảnh / tờ 10x15cm)' },
    { value: '4x6_visa', label: 'Ảnh 4x6 cm Visa / Hộ chiếu (Nền trắng)' }
  ];

  const INK_COLORS = {
    blue: 'rgb(20, 72, 178)',
    black: 'rgb(20, 26, 25)',
    red: 'rgb(185, 28, 28)'
  };

  function canvasFont(weight, sizeNum) {
    return String(weight) + ' ' + Math.round(sizeNum) + 'p' + 'x sans-serif';
  }

  // Trạng thái toàn bộ nằm trong RAM phiên làm việc (tự hủy khi đóng trang hoặc bấm Xóa sạch)
  let processedFilesCount = 0;
  let activeModalReturnFocus = null;
  let toastTimerId = null;
  let toastCountdownId = null;
  let undoCallback = null;

  const cccdState = {
    frontImg: null,
    backImg: null,
    frontRot: 0,
    backRot: 0,
    watermarkOpacity: 0.25,
    watermarkColor: 'red',
    dpi: 200
  };

  const compressState = {
    items: [], // { id, name, origBytes, img, compressedBytes, compressedSize, quality, scale, hitTarget }
    targetKb: 2048
  };

  const idPhotoState = {
    img: null,
    sizeKey: '3x4',
    bgMode: 'blue',
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    viewMode: 'sheet'
  };

  const signState = {
    docImg: null,
    inkColor: 'blue',
    inkWidth: 3.5,
    sigScale: 0.26,
    posXRatio: 0.74,
    posYRatio: 0.76,
    hasSignature: false,
    drawing: false,
    lastPt: null
  };

  const mergeState = {
    pages: [], // { id, name, img, thumbUrl, rot }
    marginPt: 22
  };

  const exifState = {
    items: [], // { id, name, origBytes, img, beforeMeta, cleanedBytes, afterMeta, outMime }
    outFormat: 'image/jpeg',
    quality: 0.92
  };

  /* ========================================================================
     Tiện ích chung: Tải tệp, Đọc ảnh cục bộ, Toast, Modal, Privacy Bar
     ======================================================================== */

  function bumpProcessed(count) {
    processedFilesCount += Math.max(1, Number(count) || 1);
    const el = $('live-processed-count');
    if (el) el.textContent = 'Đã xử lý trên máy: ' + processedFilesCount + ' tệp';
  }

  function updateNetworkIndicator() {
    const el = $('live-network-text');
    if (!el) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      el.textContent = 'Đang ngoại tuyến: 6 công cụ vẫn chạy 100% trên máy!';
    } else {
      el.textContent = 'Trình duyệt cục bộ: 0 yêu cầu gửi tệp ra ngoài';
    }
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    const btn = $('btn-theme-toggle');
    const lbl = $('theme-toggle-label');
    const useEl = $('theme-icon-svg') ? $('theme-icon-svg').querySelector('use') : null;
    if (btn) btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    if (lbl) lbl.textContent = isDark ? 'Giao diện sáng' : 'Giao diện tối';
    if (useEl) useEl.setAttribute('href', isDark ? '#i-sun' : '#i-moon');
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch (_err) {
      // Bỏ qua nếu bộ nhớ bị chặn
    }
  }

  function loadSavedTheme() {
    try {
      return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    } catch (_err) {
      return 'light';
    }
  }

  function showToast(message, undoFn) {
    const toast = $('app-toast');
    const textEl = $('toast-text');
    const undoBtn = $('btn-toast-undo');
    if (!toast || !textEl || !undoBtn) return;

    if (toastTimerId) clearTimeout(toastTimerId);
    if (toastCountdownId) clearInterval(toastCountdownId);

    textEl.textContent = message;
    undoCallback = typeof undoFn === 'function' ? undoFn : null;
    toast.hidden = false;

    if (undoCallback) {
      let left = 5;
      undoBtn.hidden = false;
      undoBtn.textContent = 'Hoàn tác (' + left + 's)';
      toastCountdownId = setInterval(function () {
        left -= 1;
        if (left > 0) undoBtn.textContent = 'Hoàn tác (' + left + 's)';
      }, 1000);
      toastTimerId = setTimeout(function () {
        hideToast();
      }, 5200);
    } else {
      undoBtn.hidden = true;
      toastTimerId = setTimeout(function () {
        hideToast();
      }, 3600);
    }
  }

  function hideToast() {
    const toast = $('app-toast');
    if (toast) toast.hidden = true;
    if (toastTimerId) clearTimeout(toastTimerId);
    if (toastCountdownId) clearInterval(toastCountdownId);
    toastTimerId = null;
    toastCountdownId = null;
    undoCallback = null;
  }

  function openModal(backdropId, focusEl) {
    hideToast();
    activeModalReturnFocus = document.activeElement;
    const backdrop = $(backdropId);
    if (!backdrop) return;
    backdrop.hidden = false;
    if (focusEl) {
      setTimeout(function () { focusEl.focus(); }, 10);
    }
  }

  function closeModal(backdropId) {
    const backdrop = $(backdropId);
    if (backdrop) backdrop.hidden = true;
    if (activeModalReturnFocus && typeof activeModalReturnFocus.focus === 'function') {
      activeModalReturnFocus.focus();
    }
    activeModalReturnFocus = null;
  }

  function bindFocusTrap(backdropId) {
    const backdrop = $(backdropId);
    if (!backdrop) return;
    backdrop.addEventListener('keydown', function (e) {
      if (backdrop.hidden) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal(backdropId);
        return;
      }
      if (e.key === 'Tab') {
        const focusables = Array.from(backdrop.querySelectorAll(
          'button:not([disabled]):not([hidden]), input:not([disabled]), a[href]'
        )).filter(function (el) { return el.offsetParent !== null; });
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closeModal(backdropId);
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function canvasToBlobAsync(canvas, mime, quality) {
    return new Promise(function (resolve, reject) {
      if (canvas.toBlob) {
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob);
          else reject(new Error('Không thể xuất ảnh từ Canvas.'));
        }, mime, quality);
      } else {
        try {
          const dataUrl = canvas.toDataURL(mime, quality);
          const bytes = PdfEngine.dataUrlToUint8Array(dataUrl);
          resolve(new Blob([bytes], { type: mime }));
        } catch (err) {
          reject(err);
        }
      }
    });
  }

  async function canvasToUint8Async(canvas, mime, quality) {
    const blob = await canvasToBlobAsync(canvas, mime, quality);
    const buf = await blob.arrayBuffer();
    return new Uint8Array(buf);
  }

  function loadImageFromBlob(blob) {
    return new Promise(function (resolve, reject) {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('Không đọc được tệp ảnh. Vui lòng chọn ảnh JPG, PNG hoặc WebP hợp lệ.'));
      };
      img.src = url;
    });
  }

  function loadImageFromCanvas(canvas) {
    return new Promise(function (resolve, reject) {
      const img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('Lỗi tạo ảnh mẫu.')); };
      img.src = canvas.toDataURL('image/png');
    });
  }

  function sanitizeFilenameBase(name) {
    return String(name || 'ho_so')
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 48) || 'ho_so';
  }

  function createSvgUse(href, cls) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', cls || 'icon-sm');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', href);
    svg.appendChild(use);
    return svg;
  }

  /* ========================================================================
     Custom Accessible Listbox (0 thẻ <select> gốc, đầy đủ phím mũi tên)
     ======================================================================== */

  function setupListbox(key, options, getValue, onSelect) {
    const trigger = $(key + '-trigger');
    const valueEl = $(key + '-value');
    const menu = $(key + '-list');
    if (!trigger || !menu || !valueEl) return { sync: function () {} };

    function renderOptions() {
      const current = getValue();
      menu.textContent = '';
      options.forEach(function (opt, idx) {
        const li = document.createElement('li');
        li.className = 'listbox-option';
        li.setAttribute('role', 'option');
        li.setAttribute('id', key + '-opt-' + idx);
        li.setAttribute('data-value', opt.value);
        li.setAttribute('aria-selected', opt.value === current ? 'true' : 'false');

        const span = document.createElement('span');
        span.textContent = opt.label;
        li.appendChild(span);

        const icon = createSvgUse('#i-check', 'icon-sm');
        icon.style.visibility = opt.value === current ? 'visible' : 'hidden';
        li.appendChild(icon);

        li.addEventListener('click', function () {
          onSelect(opt.value);
          sync();
          close();
          trigger.focus();
        });
        menu.appendChild(li);
      });
    }

    function sync() {
      const current = getValue();
      const found = options.find(function (o) { return o.value === current; }) || options[0];
      valueEl.textContent = found.label;
      renderOptions();
    }

    function open() {
      closeAllListboxes();
      trigger.setAttribute('aria-expanded', 'true');
      menu.hidden = false;
      const items = Array.from(menu.querySelectorAll('[role="option"]'));
      const selIdx = Math.max(0, items.findIndex(function (el) { return el.getAttribute('aria-selected') === 'true'; }));
      setActive(items, selIdx);
    }

    function close() {
      trigger.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    }

    function setActive(items, idx) {
      items.forEach(function (el, i) { el.classList.toggle('is-active', i === idx); });
    }

    trigger.addEventListener('click', function () {
      if (trigger.getAttribute('aria-expanded') === 'true') close();
      else open();
    });

    trigger.addEventListener('keydown', function (e) {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      const items = Array.from(menu.querySelectorAll('[role="option"]'));
      const idx = Math.max(0, items.findIndex(function (el) {
        return el.classList.contains('is-active') || el.getAttribute('aria-selected') === 'true';
      }));
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!expanded) {
          open();
        } else {
          const next = e.key === 'ArrowDown' ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
          setActive(items, next);
        }
      } else if (e.key === 'Home' && expanded) {
        e.preventDefault();
        setActive(items, 0);
      } else if (e.key === 'End' && expanded) {
        e.preventDefault();
        setActive(items, items.length - 1);
      } else if ((e.key === 'Enter' || e.key === ' ') && expanded) {
        e.preventDefault();
        const active = items[idx];
        if (active) {
          onSelect(active.getAttribute('data-value'));
          sync();
        }
        close();
      } else if (e.key === 'Escape' && expanded) {
        e.preventDefault();
        close();
      }
    });

    sync();
    return { sync: sync, close: close };
  }

  function closeAllListboxes() {
    document.querySelectorAll('.listbox-wrap').forEach(function (wrap) {
      const t = wrap.querySelector('.listbox-trigger');
      const m = wrap.querySelector('.listbox-menu');
      if (t) t.setAttribute('aria-expanded', 'false');
      if (m) m.hidden = true;
    });
  }

  /* ========================================================================
     Điều hướng 6 Công cụ + Đồng bộ Hash (#cccd, #compress, #idphoto, #sign, #merge, #exif)
     ======================================================================== */

  function switchTool(toolId, pushHash) {
    const valid = TOOLS.indexOf(toolId) !== -1 ? toolId : 'cccd';
    TOOLS.forEach(function (t) {
      const btn = $('tab-' + t);
      const panel = $('panel-' + t);
      const sel = t === valid;
      if (btn) btn.setAttribute('aria-selected', sel ? 'true' : 'false');
      if (panel) panel.hidden = !sel;
    });
    if (pushHash && window.location.hash !== '#' + valid) {
      try {
        window.history.replaceState(null, '', '#' + valid);
      } catch (_err) {
        window.location.hash = '#' + valid;
      }
    }
    if (valid === 'cccd') renderCccdPreview();
    if (valid === 'idphoto') renderIdPhotoPreview();
    if (valid === 'sign') renderSignDocPreview();
  }

  function syncToolFromHash() {
    const hash = String(window.location.hash || '').replace(/^#/, '').toLowerCase();
    if (TOOLS.indexOf(hash) !== -1) {
      switchTool(hash, false);
    }
  }

  /* ========================================================================
     CÔNG CỤ 1: GHÉP 2 MẶT CCCD LÊN A4 + ĐÓNG DẤU CHÌM
     ======================================================================== */

  function renderCccdPreview() {
    const full = ImgEngine.renderIdCardA4Canvas({
      frontImg: cccdState.frontImg,
      backImg: cccdState.backImg,
      frontRot: cccdState.frontRot,
      backRot: cccdState.backRot,
      watermarkText: $('cccd-wm-text').value,
      watermarkOpacity: cccdState.watermarkOpacity,
      watermarkColor: cccdState.watermarkColor,
      dpi: cccdState.dpi
    });

    const preview = $('cccd-preview-canvas');
    if (preview) {
      preview.width = Math.round(full.width / 2);
      preview.height = Math.round(full.height / 2);
      const pCtx = preview.getContext('2d');
      pCtx.drawImage(full, 0, 0, preview.width, preview.height);
    }
    const badge = $('cccd-dim-badge');
    if (badge) {
      badge.textContent = full.width + ' x ' + full.height + ' px (' + cccdState.dpi + ' DPI)';
    }
    ImgEngine.releaseCanvas(full);
  }

  async function exportCccd(format) {
    const full = ImgEngine.renderIdCardA4Canvas({
      frontImg: cccdState.frontImg,
      backImg: cccdState.backImg,
      frontRot: cccdState.frontRot,
      backRot: cccdState.backRot,
      watermarkText: $('cccd-wm-text').value,
      watermarkOpacity: cccdState.watermarkOpacity,
      watermarkColor: cccdState.watermarkColor,
      dpi: cccdState.dpi
    });
    try {
      if (format === 'png') {
        const blob = await canvasToBlobAsync(full, 'image/png', 1);
        downloadBlob(blob, 'ghep_cccd_a4_dau_chim.png');
      } else if (format === 'jpg') {
        const blob = await canvasToBlobAsync(full, 'image/jpeg', 0.92);
        downloadBlob(blob, 'ghep_cccd_a4_dau_chim.jpg');
      } else {
        const jpgBytes = await canvasToUint8Async(full, 'image/jpeg', 0.90);
        const pdfBytes = PdfEngine.buildPdfFromJpegs([{
          jpegBytes: jpgBytes,
          widthPx: full.width,
          heightPx: full.height,
          pageSize: 'a4',
          marginPt: 0
        }], { title: 'Ghep 2 mat CCCD A4' });
        downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'ghep_cccd_a4_dau_chim.pdf');
      }
      bumpProcessed(1);
      showToast('Đã xuất bản ghép 2 mặt CCCD chuẩn A4 ngay trên máy bạn (0 byte gửi lên mạng).');
    } finally {
      ImgEngine.releaseCanvas(full);
    }
  }

  /* ========================================================================
     CÔNG CỤ 2: NÉN ẢNH & PDF ĐÚNG MỨC NỘP DỊCH VỤ CÔNG (BINARY SEARCH)
     ======================================================================== */

  function validateCompressTargetKb() {
    const input = $('compress-custom-kb');
    const errEl = $('compress-custom-error');
    const raw = String(input.value || '').trim();
    if (!raw || raw.indexOf('-') !== -1 || /[^0-9]/.test(raw)) {
      input.setAttribute('aria-invalid', 'true');
      errEl.textContent = 'Vui lòng nhập số dương tính bằng KB (ví dụ: 2048 cho 2 MB, tối thiểu 50 KB).';
      errEl.hidden = false;
      return null;
    }
    const kb = Number(raw);
    if (!Number.isFinite(kb) || kb < 50 || kb > 20480) {
      input.setAttribute('aria-invalid', 'true');
      errEl.textContent = 'Giới hạn dung lượng hợp lệ nằm từ 50 KB đến 20.480 KB (20 MB).';
      errEl.hidden = false;
      return null;
    }
    input.setAttribute('aria-invalid', 'false');
    errEl.hidden = true;
    compressState.targetKb = kb;
    return kb * 1024;
  }

  async function runCompressionBatch() {
    const targetBytes = validateCompressTargetKb();
    if (!targetBytes) return;
    if (compressState.items.length === 0) {
      showToast('Vui lòng chọn ảnh hoặc bấm Dùng ảnh tài liệu mẫu (tệp lớn > 3 MB) trước khi nén.');
      return;
    }

    const btnRun = $('btn-run-compress');
    btnRun.setAttribute('aria-busy', 'true');
    btnRun.disabled = true;

    try {
      // Dự phòng 3% khung PDF nếu người dùng tải PDF nén
      const perFileTarget = Math.max(30720, Math.floor((targetBytes * 0.97) / compressState.items.length));
      for (let i = 0; i < compressState.items.length; i += 1) {
        const item = compressState.items[i];
        const baseW = item.img.naturalWidth || item.img.width;
        const baseH = item.img.naturalHeight || item.img.height;
        const clamped = ImgEngine.clampDimensionsForMobile(baseW, baseH);

        const res = await ImgEngine.binarySearchCompress(async function (scale, quality) {
          const w = Math.max(120, Math.round(clamped.width * scale));
          const h = Math.max(120, Math.round(clamped.height * scale));
          const c = ImgEngine.createCanvas(w, h);
          const ctx = c.getContext('2d');
          ctx.drawImage(item.img, 0, 0, w, h);
          const bytes = await canvasToUint8Async(c, 'image/jpeg', quality);
          ImgEngine.releaseCanvas(c);
          return { size: bytes.length, data: bytes, width: w, height: h };
        }, perFileTarget);

        item.compressedBytes = res.data;
        item.compressedSize = res.size;
        item.compressedW = res.width;
        item.compressedH = res.height;
        item.quality = res.quality;
        item.hitTarget = res.hitTarget;
      }

      bumpProcessed(compressState.items.length);
      renderCompressResults(targetBytes);
      showToast('Đã nén xong ' + compressState.items.length + ' tệp đúng chuẩn mục tiêu ' + ImgEngine.formatBytesVi(targetBytes) + '.');
    } finally {
      btnRun.removeAttribute('aria-busy');
      btnRun.disabled = false;
    }
  }

  function renderCompressResults(targetBytes) {
    const tbody = $('compress-result-tbody');
    const badge = $('compress-summary-badge');
    const notice = $('compress-result-notice');
    const pdfBtn = $('btn-compress-dl-pdf');
    if (!tbody) return;
    tbody.textContent = '';

    let totalOrig = 0;
    let totalAfter = 0;
    let allHit = compressState.items.length > 0;

    compressState.items.forEach(function (item) {
      totalOrig += item.origSize;
      totalAfter += item.compressedSize || item.origSize;
      if (!item.compressedBytes || !item.hitTarget) allHit = false;

      const tr = document.createElement('tr');
      const tdName = document.createElement('td');
      tdName.textContent = item.name;
      tr.appendChild(tdName);

      const tdOrig = document.createElement('td');
      tdOrig.className = 'tabular';
      tdOrig.textContent = ImgEngine.formatBytesVi(item.origSize);
      tr.appendChild(tdOrig);

      const tdAfter = document.createElement('td');
      tdAfter.className = 'tabular';
      tdAfter.textContent = item.compressedSize ? ImgEngine.formatBytesVi(item.compressedSize) : 'Chờ nén';
      tr.appendChild(tdAfter);

      const tdDiff = document.createElement('td');
      tdDiff.className = 'tabular';
      if (item.compressedSize) {
        const pct = Math.max(0, Math.round((1 - item.compressedSize / Math.max(1, item.origSize)) * 100));
        tdDiff.textContent = '-' + pct + '%';
      } else {
        tdDiff.textContent = '0%';
      }
      tr.appendChild(tdDiff);

      const tdStatus = document.createElement('td');
      const stBadge = document.createElement('span');
      if (!item.compressedBytes) {
        stBadge.className = 'badge';
        stBadge.textContent = 'Sẵn sàng nén';
      } else if (item.hitTarget) {
        stBadge.className = 'badge badge-safe';
        stBadge.textContent = 'Đạt chuẩn Dịch vụ công';
      } else {
        stBadge.className = 'badge badge-warn';
        stBadge.textContent = 'Đã nén tối đa';
      }
      tdStatus.appendChild(stBadge);
      tr.appendChild(tdStatus);

      const tdAct = document.createElement('td');
      if (item.compressedBytes) {
        const dlBtn = document.createElement('button');
        dlBtn.type = 'button';
        dlBtn.className = 'btn btn-secondary btn-sm';
        dlBtn.textContent = 'Tải JPG';
        dlBtn.addEventListener('click', function () {
          downloadBlob(
            new Blob([item.compressedBytes], { type: 'image/jpeg' }),
            sanitizeFilenameBase(item.name) + '_da_nen.jpg'
          );
        });
        tdAct.appendChild(dlBtn);
      } else {
        tdAct.textContent = 'Chưa xuất';
      }
      tr.appendChild(tdAct);
      tbody.appendChild(tr);
    });

    const hasOutput = compressState.items.some(function (it) { return Boolean(it.compressedBytes); });
    if (pdfBtn) pdfBtn.disabled = !hasOutput;

    if (hasOutput) {
      badge.className = allHit ? 'badge badge-safe tabular' : 'badge badge-warn tabular';
      badge.textContent = 'Tổng sau nén: ' + ImgEngine.formatBytesVi(totalAfter);
      notice.hidden = false;
      notice.className = allHit ? 'notice-box notice-safe' : 'notice-box notice-warn';
      notice.textContent = 'Tổng dung lượng giảm từ ' + ImgEngine.formatBytesVi(totalOrig) + ' xuống ' + ImgEngine.formatBytesVi(totalAfter) + ' (mục tiêu ' + ImgEngine.formatBytesVi(targetBytes) + '). Bấm Tải JPG hoặc Tải tệp PDF đã nén để nộp ngay.';
    } else {
      badge.className = 'badge tabular';
      badge.textContent = compressState.items.length + ' tệp sẵn sàng';
      notice.hidden = true;
    }
  }

  function exportCompressedPdf() {
    const ready = compressState.items.filter(function (it) { return Boolean(it.compressedBytes); });
    if (!ready.length) return;
    const pages = ready.map(function (it) {
      return {
        jpegBytes: it.compressedBytes,
        widthPx: it.compressedW,
        heightPx: it.compressedH,
        pageSize: 'a4',
        marginPt: 18
      };
    });
    const pdfBytes = PdfEngine.buildPdfFromJpegs(pages, { title: 'Ho so nen Dich vu cong' });
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'ho_so_nen_dich_vu_cong.pdf');
    bumpProcessed(1);
    showToast('Đã xuất tệp PDF nén ' + ImgEngine.formatBytesVi(pdfBytes.length) + ' (' + ready.length + ' trang).');
  }

  /* ========================================================================
     CÔNG CỤ 3: ẢNH THẺ 3x4 / 4x6 / HỘ CHIẾU + DÀN TRANG 10x15cm (300 DPI)
     ======================================================================== */

  function renderIdPhotoPreview() {
    const single = ImgEngine.renderSingleIdPhotoCanvas({
      img: idPhotoState.img,
      sizeKey: idPhotoState.sizeKey,
      bgMode: idPhotoState.bgMode,
      zoom: idPhotoState.zoom,
      offsetX: idPhotoState.offsetX,
      offsetY: idPhotoState.offsetY
    });
    const preset = ImgEngine.ID_PHOTO_PRESETS[idPhotoState.sizeKey] || ImgEngine.ID_PHOTO_PRESETS['3x4'];
    const preview = $('idphoto-preview-canvas');

    if (idPhotoState.viewMode === 'single') {
      preview.width = single.width;
      preview.height = single.height;
      preview.getContext('2d').drawImage(single, 0, 0);
    } else {
      const sheet = ImgEngine.renderPhotoSheetCanvas(single, idPhotoState.sizeKey);
      preview.width = Math.round(sheet.width / 2);
      preview.height = Math.round(sheet.height / 2);
      preview.getContext('2d').drawImage(sheet, 0, 0, preview.width, preview.height);
      ImgEngine.releaseCanvas(sheet);
    }

    $('idphoto-zoom-readout').textContent = Math.round(idPhotoState.zoom * 100) + '%';
    $('idphoto-sheet-caption').textContent = preset.sheetLabel + ' (kích thước ảnh đơn: ' + preset.widthPx + ' x ' + preset.heightPx + ' px).';
    ImgEngine.releaseCanvas(single);
  }

  async function exportIdPhoto(mode) {
    if (!idPhotoState.img) {
      showToast('Hãy chọn ảnh chân dung hoặc bấm Dùng ảnh chân dung mẫu trước khi tải.');
      return;
    }
    const single = ImgEngine.renderSingleIdPhotoCanvas({
      img: idPhotoState.img,
      sizeKey: idPhotoState.sizeKey,
      bgMode: idPhotoState.bgMode,
      zoom: idPhotoState.zoom,
      offsetX: idPhotoState.offsetX,
      offsetY: idPhotoState.offsetY
    });
    const preset = ImgEngine.ID_PHOTO_PRESETS[idPhotoState.sizeKey] || ImgEngine.ID_PHOTO_PRESETS['3x4'];

    try {
      if (mode === 'single') {
        const blob = await canvasToBlobAsync(single, 'image/jpeg', 0.94);
        downloadBlob(blob, 'anh_the_' + preset.code + '_300dpi.jpg');
      } else {
        const sheet = ImgEngine.renderPhotoSheetCanvas(single, idPhotoState.sizeKey);
        try {
          if (mode === 'sheet_jpg') {
            const blob = await canvasToBlobAsync(sheet, 'image/jpeg', 0.94);
            downloadBlob(blob, 'dan_trang_10x15cm_' + preset.code + '_' + preset.count + 'anh.jpg');
          } else {
            const jpgBytes = await canvasToUint8Async(sheet, 'image/jpeg', 0.92);
            const pdfBytes = PdfEngine.buildPdfFromJpegs([{
              jpegBytes: jpgBytes,
              widthPx: sheet.width,
              heightPx: sheet.height,
              pageSize: preset.sheetOrientation,
              marginPt: 0
            }], { title: 'Anh the 10x15cm 300 DPI' });
            downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'dan_trang_10x15cm_' + preset.code + '.pdf');
          }
        } finally {
          ImgEngine.releaseCanvas(sheet);
        }
      }
      bumpProcessed(1);
      showToast('Đã tải bản ảnh thẻ chuẩn 300 DPI không logo ngay trên máy bạn.');
    } finally {
      ImgEngine.releaseCanvas(single);
    }
  }

  /* ========================================================================
     CÔNG CỤ 4: KÝ TÊN TAY LÊN ĐƠN / HỒ SƠ ẢNH & XUẤT PDF A4
     ======================================================================== */

  function initSignaturePad() {
    const pad = $('sign-pad-canvas');
    if (!pad) return;
    const ctx = pad.getContext('2d');

    function getPt(e) {
      const rect = pad.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / Math.max(1, rect.width)) * pad.width,
        y: ((e.clientY - rect.top) / Math.max(1, rect.height)) * pad.height
      };
    }

    pad.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      pad.setPointerCapture(e.pointerId);
      signState.drawing = true;
      signState.hasSignature = true;
      signState.lastPt = getPt(e);
      ctx.beginPath();
      ctx.moveTo(signState.lastPt.x, signState.lastPt.y);
    });

    pad.addEventListener('pointermove', function (e) {
      if (!signState.drawing || !signState.lastPt) return;
      e.preventDefault();
      const pt = getPt(e);
      ctx.strokeStyle = INK_COLORS[signState.inkColor] || INK_COLORS.blue;
      ctx.lineWidth = signState.inkWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(signState.lastPt.x, signState.lastPt.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
      signState.lastPt = pt;
    });

    function endStroke() {
      if (!signState.drawing) return;
      signState.drawing = false;
      signState.lastPt = null;
      renderSignDocPreview();
    }

    pad.addEventListener('pointerup', endStroke);
    pad.addEventListener('pointercancel', endStroke);
  }

  function clearSignaturePad() {
    const pad = $('sign-pad-canvas');
    if (!pad) return;
    pad.getContext('2d').clearRect(0, 0, pad.width, pad.height);
    signState.hasSignature = false;
    renderSignDocPreview();
  }

  function drawDemoSignatureStroke() {
    const pad = $('sign-pad-canvas');
    if (!pad) return;
    const ctx = pad.getContext('2d');
    ctx.clearRect(0, 0, pad.width, pad.height);
    ctx.strokeStyle = INK_COLORS[signState.inkColor] || INK_COLORS.blue;
    ctx.lineWidth = signState.inkWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(65, 118);
    ctx.bezierCurveTo(95, 32, 130, 145, 175, 86);
    ctx.bezierCurveTo(205, 52, 222, 128, 268, 92);
    ctx.bezierCurveTo(300, 70, 328, 122, 412, 82);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(92, 142);
    ctx.quadraticCurveTo(240, 124, 390, 138);
    ctx.stroke();
    signState.hasSignature = true;
    renderSignDocPreview();
  }

  function buildSignedDocumentCanvas() {
    const baseW = signState.docImg ? (signState.docImg.naturalWidth || signState.docImg.width) : 1240;
    const baseH = signState.docImg ? (signState.docImg.naturalHeight || signState.docImg.height) : 1754;
    const c = ImgEngine.createCanvas(baseW, baseH);
    const ctx = c.getContext('2d');

    if (signState.docImg) {
      ctx.drawImage(signState.docImg, 0, 0, c.width, c.height);
    } else {
      const sample = ImgEngine.createSampleDocumentCanvas('ĐƠN XIN XÁC NHẬN HỒ SƠ (MẪU)', 0, false);
      ctx.drawImage(sample, 0, 0, c.width, c.height);
      ImgEngine.releaseCanvas(sample);
    }

    const pad = $('sign-pad-canvas');
    const centerX = Math.round(c.width * signState.posXRatio);
    const centerY = Math.round(c.height * signState.posYRatio);
    const sigW = Math.round(c.width * signState.sigScale);
    const sigH = Math.round(sigW * (pad.height / Math.max(1, pad.width)));

    if (signState.hasSignature) {
      ctx.drawImage(pad, centerX - sigW / 2, centerY - sigH / 2, sigW, sigH);
    }

    const fullname = String($('sign-fullname').value || '').trim();
    const includeDate = Boolean($('sign-include-date').checked);
    const textColor = INK_COLORS[signState.inkColor] || INK_COLORS.blue;
    let textY = centerY + sigH / 2 + Math.round(c.width * 0.022);
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';

    if (fullname) {
      ctx.font = canvasFont(700, Math.max(16, c.width * 0.02));
      ctx.fillText(fullname, centerX, textY);
      textY += Math.round(c.width * 0.024);
    }
    if (includeDate) {
      const d = new Date();
      const dateStr = 'Ngày ký: ' + String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
      ctx.font = canvasFont(500, Math.max(13, c.width * 0.015));
      ctx.fillText(dateStr, centerX, textY);
    }

    return c;
  }

  function renderSignDocPreview() {
    const full = buildSignedDocumentCanvas();
    const preview = $('sign-preview-canvas');
    if (preview) {
      const scale = Math.min(620 / full.width, 877 / full.height, 1);
      preview.width = Math.round(full.width * scale);
      preview.height = Math.round(full.height * scale);
      preview.getContext('2d').drawImage(full, 0, 0, preview.width, preview.height);
    }
    $('sign-pos-badge').textContent = 'Vị trí: ' + Math.round(signState.posXRatio * 100) + '%, ' + Math.round(signState.posYRatio * 100) + '%';
    ImgEngine.releaseCanvas(full);
  }

  async function exportSignedDoc(format) {
    const full = buildSignedDocumentCanvas();
    try {
      if (format === 'png') {
        const blob = await canvasToBlobAsync(full, 'image/png', 1);
        downloadBlob(blob, 'don_da_ky_tay.png');
      } else {
        const jpgBytes = await canvasToUint8Async(full, 'image/jpeg', 0.92);
        const pdfBytes = PdfEngine.buildPdfFromJpegs([{
          jpegBytes: jpgBytes,
          widthPx: full.width,
          heightPx: full.height,
          pageSize: 'a4',
          marginPt: 0
        }], { title: 'Don da ky tay' });
        downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'don_da_ky_tay.pdf');
      }
      bumpProcessed(1);
      showToast('Đã xuất bản đơn đã ký tên tay ngay trên máy bạn.');
    } finally {
      ImgEngine.releaseCanvas(full);
    }
  }

  /* ========================================================================
     CÔNG CỤ 5: GỘP NHIỀU ẢNH HỒ SƠ THÀNH 1 TỆP PDF A4
     ======================================================================== */

  function renderMergePageList() {
    const listEl = $('merge-page-list');
    const badge = $('merge-count-badge');
    const exportBtn = $('btn-merge-export');
    if (!listEl) return;
    listEl.textContent = '';

    badge.textContent = mergeState.pages.length + ' trang';
    exportBtn.disabled = mergeState.pages.length === 0;

    if (mergeState.pages.length === 0) {
      const box = document.createElement('div');
      box.className = 'notice-box';
      box.textContent = 'Chưa có trang nào. Chọn ảnh từ máy hoặc bấm Nạp 3 trang hồ sơ mẫu để thử gộp PDF ngay.';
      listEl.appendChild(box);
      return;
    }

    mergeState.pages.forEach(function (pg, idx) {
      const item = document.createElement('div');
      item.className = 'page-item';

      const left = document.createElement('div');
      left.className = 'page-item-left';

      const thumb = document.createElement('img');
      thumb.className = 'page-thumb';
      thumb.src = pg.thumbUrl;
      thumb.alt = 'Ảnh thu nhỏ trang ' + (idx + 1);
      thumb.width = 64;
      thumb.height = 84;
      left.appendChild(thumb);

      const meta = document.createElement('div');
      meta.className = 'page-meta';
      const title = document.createElement('div');
      title.className = 'page-title';
      title.textContent = 'Trang ' + (idx + 1) + ': ' + pg.name;
      meta.appendChild(title);

      const sub = document.createElement('div');
      sub.className = 'field-hint tabular';
      sub.textContent = (pg.img.naturalWidth || pg.img.width) + ' x ' + (pg.img.naturalHeight || pg.img.height) + ' px · Xoay ' + pg.rot + ' độ';
      meta.appendChild(sub);

      left.appendChild(meta);
      item.appendChild(left);

      const actions = document.createElement('div');
      actions.className = 'row-wrap';

      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'btn btn-secondary btn-sm';
      upBtn.disabled = idx === 0;
      upBtn.setAttribute('aria-label', 'Đẩy trang ' + (idx + 1) + ' lên');
      upBtn.appendChild(createSvgUse('#i-arrow-up', 'icon-sm'));
      upBtn.appendChild(document.createTextNode('Lên'));
      upBtn.addEventListener('click', function () {
        if (idx === 0) return;
        const tmp = mergeState.pages[idx - 1];
        mergeState.pages[idx - 1] = mergeState.pages[idx];
        mergeState.pages[idx] = tmp;
        renderMergePageList();
      });

      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.className = 'btn btn-secondary btn-sm';
      downBtn.disabled = idx === mergeState.pages.length - 1;
      downBtn.setAttribute('aria-label', 'Đẩy trang ' + (idx + 1) + ' xuống');
      downBtn.appendChild(createSvgUse('#i-arrow-down', 'icon-sm'));
      downBtn.appendChild(document.createTextNode('Xuống'));
      downBtn.addEventListener('click', function () {
        if (idx >= mergeState.pages.length - 1) return;
        const tmp = mergeState.pages[idx + 1];
        mergeState.pages[idx + 1] = mergeState.pages[idx];
        mergeState.pages[idx] = tmp;
        renderMergePageList();
      });

      const rotBtn = document.createElement('button');
      rotBtn.type = 'button';
      rotBtn.className = 'btn btn-secondary btn-sm';
      rotBtn.setAttribute('aria-label', 'Xoay trang ' + (idx + 1) + ' 90 độ');
      rotBtn.appendChild(createSvgUse('#i-rotate', 'icon-sm'));
      rotBtn.appendChild(document.createTextNode('Xoay'));
      rotBtn.addEventListener('click', function () {
        pg.rot = (pg.rot + 90) % 360;
        renderMergePageList();
      });

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn btn-danger btn-sm';
      delBtn.setAttribute('aria-label', 'Xóa trang ' + (idx + 1));
      delBtn.appendChild(createSvgUse('#i-trash', 'icon-sm'));
      delBtn.appendChild(document.createTextNode('Xóa'));
      delBtn.addEventListener('click', function () {
        const snapshot = mergeState.pages.slice();
        mergeState.pages.splice(idx, 1);
        renderMergePageList();
        showToast('Đã xóa trang "' + pg.name + '".', function () {
          mergeState.pages = snapshot;
          renderMergePageList();
        });
      });

      actions.appendChild(upBtn);
      actions.appendChild(downBtn);
      actions.appendChild(rotBtn);
      actions.appendChild(delBtn);
      item.appendChild(actions);

      listEl.appendChild(item);
    });
  }

  async function exportMergedPdf() {
    if (!mergeState.pages.length) return;
    const btn = $('btn-merge-export');
    btn.setAttribute('aria-busy', 'true');
    btn.disabled = true;

    try {
      const pdfPages = [];
      for (let i = 0; i < mergeState.pages.length; i += 1) {
        const pg = mergeState.pages[i];
        const swapped = pg.rot === 90 || pg.rot === 270;
        const srcW = pg.img.naturalWidth || pg.img.width;
        const srcH = pg.img.naturalHeight || pg.img.height;
        const outDims = ImgEngine.clampDimensionsForMobile(swapped ? srcH : srcW, swapped ? srcW : srcH, 4000000);
        const c = ImgEngine.createCanvas(outDims.width, outDims.height);
        const ctx = c.getContext('2d');
        ImgEngine.drawImageRotatedFit(ctx, pg.img, 0, 0, c.width, c.height, pg.rot, false);
        const jpgBytes = await canvasToUint8Async(c, 'image/jpeg', 0.88);
        ImgEngine.releaseCanvas(c);

        pdfPages.push({
          jpegBytes: jpgBytes,
          widthPx: outDims.width,
          heightPx: outDims.height,
          pageSize: 'a4',
          marginPt: mergeState.marginPt
        });
      }

      const fileName = sanitizeFilenameBase($('merge-filename').value) + '.pdf';
      const pdfBytes = PdfEngine.buildPdfFromJpegs(pdfPages, { title: 'Ho so gop PDF A4' });
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), fileName);
      bumpProcessed(mergeState.pages.length);

      const notice = $('merge-result-notice');
      notice.hidden = false;
      notice.textContent = 'Đã gộp thành công ' + mergeState.pages.length + ' trang thành tệp "' + fileName + '" (' + ImgEngine.formatBytesVi(pdfBytes.length) + ') ngay trên trình duyệt.';
      showToast('Đã tạo xong tệp PDF ' + mergeState.pages.length + ' trang.');
    } finally {
      btn.removeAttribute('aria-busy');
      btn.disabled = mergeState.pages.length === 0;
    }
  }

  /* ========================================================================
     CÔNG CỤ 6: XÓA VỊ TRÍ GPS / EXIF & CHUYỂN ĐỔI ĐỊNH DẠNG HÀNG LOẠT
     ======================================================================== */

  function renderExifTable() {
    const tbody = $('exif-result-tbody');
    const badge = $('exif-summary-badge');
    const runBtn = $('btn-run-exif-clean');
    if (!tbody) return;
    tbody.textContent = '';

    badge.textContent = exifState.items.length + ' ảnh';
    runBtn.disabled = exifState.items.length === 0;

    if (exifState.items.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 5;
      td.textContent = 'Chọn ảnh từ điện thoại hoặc bấm Dùng ảnh mẫu có gắn thử EXIF/GPS để kiểm tra ngay.';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    exifState.items.forEach(function (item) {
      const tr = document.createElement('tr');

      const tdName = document.createElement('td');
      tdName.textContent = item.name;
      tr.appendChild(tdName);

      const tdBefore = document.createElement('td');
      const beforeBadge = document.createElement('span');
      if (item.beforeMeta.hasGps || item.beforeMeta.hasExif || item.beforeMeta.hasXmp) {
        beforeBadge.className = 'badge badge-alert';
        beforeBadge.textContent = 'Phát hiện: ' + item.beforeMeta.markersFound.join(', ');
      } else {
        beforeBadge.className = 'badge badge-safe';
        beforeBadge.textContent = 'Không phát hiện EXIF/GPS';
      }
      tdBefore.appendChild(beforeBadge);
      tr.appendChild(tdBefore);

      const tdAfter = document.createElement('td');
      const afterBadge = document.createElement('span');
      if (!item.cleanedBytes) {
        afterBadge.className = 'badge';
        afterBadge.textContent = 'Chờ làm sạch';
      } else if (!item.afterMeta.hasExif && !item.afterMeta.hasGps) {
        afterBadge.className = 'badge badge-safe';
        afterBadge.textContent = 'Đã gỡ sạch 100% EXIF / GPS';
      } else {
        afterBadge.className = 'badge badge-warn';
        afterBadge.textContent = 'Cần kiểm tra lại';
      }
      tdAfter.appendChild(afterBadge);
      tr.appendChild(tdAfter);

      const tdSize = document.createElement('td');
      tdSize.className = 'tabular';
      tdSize.textContent = item.cleanedBytes ? ImgEngine.formatBytesVi(item.cleanedBytes.length) : ImgEngine.formatBytesVi(item.origBytes.length);
      tr.appendChild(tdSize);

      const tdAct = document.createElement('td');
      if (item.cleanedBytes) {
        const ext = item.outMime === 'image/png' ? 'png' : (item.outMime === 'image/webp' ? 'webp' : 'jpg');
        const dlBtn = document.createElement('button');
        dlBtn.type = 'button';
        dlBtn.className = 'btn btn-secondary btn-sm';
        dlBtn.textContent = 'Tải .' + ext.toUpperCase();
        dlBtn.addEventListener('click', function () {
          downloadBlob(
            new Blob([item.cleanedBytes], { type: item.outMime }),
            sanitizeFilenameBase(item.name) + '_sach_gps.' + ext
          );
        });
        tdAct.appendChild(dlBtn);
      } else {
        tdAct.textContent = 'Chưa xuất';
      }
      tr.appendChild(tdAct);
      tbody.appendChild(tr);
    });
  }

  async function runExifCleanBatch() {
    if (!exifState.items.length) return;
    const btn = $('btn-run-exif-clean');
    btn.setAttribute('aria-busy', 'true');
    btn.disabled = true;

    try {
      for (let i = 0; i < exifState.items.length; i += 1) {
        const item = exifState.items[i];
        const w = item.img.naturalWidth || item.img.width;
        const h = item.img.naturalHeight || item.img.height;
        const safe = ImgEngine.clampDimensionsForMobile(w, h);
        const c = ImgEngine.createCanvas(safe.width, safe.height);
        c.getContext('2d').drawImage(item.img, 0, 0, safe.width, safe.height);
        const outBytes = await canvasToUint8Async(c, exifState.outFormat, exifState.quality);
        ImgEngine.releaseCanvas(c);

        item.cleanedBytes = outBytes;
        item.outMime = exifState.outFormat;
        item.afterMeta = ImgEngine.inspectImageMetadata(outBytes, item.name, exifState.outFormat);
      }
      bumpProcessed(exifState.items.length);
      renderExifTable();
      showToast('Đã gỡ sạch 100% siêu dữ liệu EXIF và vị trí GPS cho ' + exifState.items.length + ' ảnh.');
    } finally {
      btn.removeAttribute('aria-busy');
      btn.disabled = exifState.items.length === 0;
    }
  }

  /* ========================================================================
     Xóa Sạch Toàn Bộ Ảnh Đang Mở Trong RAM (Khóa riêng tư NĐ 13/2023)
     ======================================================================== */

  function wipeAllInMemoryData() {
    cccdState.frontImg = null;
    cccdState.backImg = null;
    cccdState.frontRot = 0;
    cccdState.backRot = 0;
    $('cccd-status-text').textContent = 'Đã xóa sạch ảnh CCCD khỏi bộ nhớ máy.';
    renderCccdPreview();

    compressState.items = [];
    $('compress-queue-caption').textContent = 'Chưa có tệp trong danh sách nén.';
    $('compress-result-notice').hidden = true;
    $('compress-summary-badge').textContent = 'Chưa nén';
    $('compress-summary-badge').className = 'badge';
    $('btn-compress-dl-pdf').disabled = true;
    const cTbody = $('compress-result-tbody');
    cTbody.textContent = '';
    const cTr = document.createElement('tr');
    const cTd = document.createElement('td');
    cTd.colSpan = 6;
    cTd.textContent = 'Đã xóa sạch danh sách ảnh nén khỏi bộ nhớ.';
    cTr.appendChild(cTd);
    cTbody.appendChild(cTr);

    idPhotoState.img = null;
    idPhotoState.zoom = 1;
    idPhotoState.offsetX = 0;
    idPhotoState.offsetY = 0;
    renderIdPhotoPreview();

    signState.docImg = null;
    clearSignaturePad();

    mergeState.pages = [];
    $('merge-result-notice').hidden = true;
    renderMergePageList();

    exifState.items = [];
    renderExifTable();

    // Đặt lại các input tệp
    ['cccd-front-input', 'cccd-back-input', 'compress-file-input', 'idphoto-file-input', 'sign-doc-input', 'merge-file-input', 'exif-file-input'].forEach(function (id) {
      const el = $(id);
      if (el) el.value = '';
    });

    closeModal('wipe-modal-backdrop');
    showToast('Đã xóa sạch toàn bộ ảnh CCCD, chữ ký và hồ sơ khỏi bộ nhớ trình duyệt.');
  }

  /* ========================================================================
     Gắn Sự Kiện Toàn Ứng Dụng & Đăng Ký Service Worker Ngoại Tuyến
     ======================================================================== */

  function bindAllEvents() {
    // Live network status
    window.addEventListener('online', updateNetworkIndicator);
    window.addEventListener('offline', updateNetworkIndicator);
    window.addEventListener('hashchange', syncToolFromHash);

    // Đóng listbox khi bấm ra ngoài
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.listbox-wrap')) closeAllListboxes();
    });

    // Giao diện Sáng / Tối
    $('btn-theme-toggle').addEventListener('click', function () {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      applyTheme(isDark ? 'light' : 'dark');
    });

    // 6 tab công cụ + phím mũi tên
    const toolBtns = Array.from(document.querySelectorAll('[data-tool]'));
    toolBtns.forEach(function (btn, idx) {
      btn.addEventListener('click', function () {
        switchTool(btn.getAttribute('data-tool'), true);
      });
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const next = e.key === 'ArrowRight' ? (idx + 1) % toolBtns.length : (idx - 1 + toolBtns.length) % toolBtns.length;
          toolBtns[next].focus();
          switchTool(toolBtns[next].getAttribute('data-tool'), true);
        }
      });
    });

    // Modals: Wipe, Privacy Proof, Support VietQR
    $('btn-open-wipe-all').addEventListener('click', function () { openModal('wipe-modal-backdrop', $('btn-cancel-wipe')); });
    $('btn-close-wipe').addEventListener('click', function () { closeModal('wipe-modal-backdrop'); });
    $('btn-cancel-wipe').addEventListener('click', function () { closeModal('wipe-modal-backdrop'); });
    $('btn-confirm-wipe').addEventListener('click', wipeAllInMemoryData);

    $('btn-open-privacy-proof').addEventListener('click', function () { openModal('privacy-modal-backdrop', $('btn-ok-privacy')); });
    $('btn-footer-privacy').addEventListener('click', function () { openModal('privacy-modal-backdrop', $('btn-ok-privacy')); });
    $('btn-close-privacy').addEventListener('click', function () { closeModal('privacy-modal-backdrop'); });
    $('btn-ok-privacy').addEventListener('click', function () { closeModal('privacy-modal-backdrop'); });

    $('btn-open-support-modal').addEventListener('click', function () { openModal('support-modal-backdrop', $('btn-ok-support')); });
    $('btn-open-support-modal-2').addEventListener('click', function () { openModal('support-modal-backdrop', $('btn-ok-support')); });
    $('btn-close-support').addEventListener('click', function () { closeModal('support-modal-backdrop'); });
    $('btn-ok-support').addEventListener('click', function () { closeModal('support-modal-backdrop'); });

    bindFocusTrap('wipe-modal-backdrop');
    bindFocusTrap('privacy-modal-backdrop');
    bindFocusTrap('support-modal-backdrop');

    $('btn-toast-undo').addEventListener('click', function () {
      if (undoCallback) {
        const fn = undoCallback;
        hideToast();
        fn();
        showToast('Đã khôi phục trang vừa xóa.');
      }
    });

    // --- TOOL 1: CCCD ---
    setupListbox('cccd-color', WM_COLOR_OPTIONS, function () { return cccdState.watermarkColor; }, function (val) {
      cccdState.watermarkColor = val;
      renderCccdPreview();
    });

    $('cccd-front-input').addEventListener('change', async function (e) {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      try {
        cccdState.frontImg = await loadImageFromBlob(f);
        $('cccd-status-text').textContent = 'Đã nạp Mặt trước: ' + f.name;
        renderCccdPreview();
      } catch (err) {
        showToast(err.message);
      }
    });

    $('cccd-back-input').addEventListener('change', async function (e) {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      try {
        cccdState.backImg = await loadImageFromBlob(f);
        $('cccd-status-text').textContent = 'Đã nạp Mặt sau: ' + f.name;
        renderCccdPreview();
      } catch (err) {
        showToast(err.message);
      }
    });

    $('btn-cccd-sample').addEventListener('click', async function () {
      const sample = ImgEngine.createSampleIdCards();
      cccdState.frontImg = await loadImageFromCanvas(sample.frontCanvas);
      cccdState.backImg = await loadImageFromCanvas(sample.backCanvas);
      cccdState.frontRot = 0;
      cccdState.backRot = 0;
      ImgEngine.releaseCanvas(sample.frontCanvas);
      ImgEngine.releaseCanvas(sample.backCanvas);
      $('cccd-status-text').textContent = 'Đang hiển thị 2 mặt ảnh CCCD mẫu minh họa (tạo 100% trên trình duyệt).';
      renderCccdPreview();
      showToast('Đã nạp 2 mặt CCCD mẫu minh họa kèm dấu chìm chống lừa đảo.');
    });

    $('btn-cccd-rot-front').addEventListener('click', function () {
      cccdState.frontRot = (cccdState.frontRot + 90) % 360;
      renderCccdPreview();
    });
    $('btn-cccd-rot-back').addEventListener('click', function () {
      cccdState.backRot = (cccdState.backRot + 90) % 360;
      renderCccdPreview();
    });

    $('cccd-wm-text').addEventListener('input', renderCccdPreview);
    document.querySelectorAll('[data-wm-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $('cccd-wm-text').value = btn.getAttribute('data-wm-preset');
        renderCccdPreview();
      });
    });

    document.querySelectorAll('[data-wm-opacity]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        cccdState.watermarkOpacity = Number(btn.getAttribute('data-wm-opacity')) || 0.25;
        document.querySelectorAll('[data-wm-opacity]').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        renderCccdPreview();
      });
    });

    document.querySelectorAll('[data-cccd-dpi]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        cccdState.dpi = Number(btn.getAttribute('data-cccd-dpi')) === 300 ? 300 : 200;
        document.querySelectorAll('[data-cccd-dpi]').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        renderCccdPreview();
      });
    });

    $('btn-cccd-dl-png').addEventListener('click', function () { exportCccd('png'); });
    $('btn-cccd-dl-jpg').addEventListener('click', function () { exportCccd('jpg'); });
    $('btn-cccd-dl-pdf').addEventListener('click', function () { exportCccd('pdf'); });

    // --- TOOL 2: COMPRESS ---
    $('compress-file-input').addEventListener('change', async function (e) {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      for (let i = 0; i < files.length; i += 1) {
        const f = files[i];
        try {
          const img = await loadImageFromBlob(f);
          compressState.items.push({
            id: 'cmp_' + Date.now() + '_' + i,
            name: f.name,
            origSize: f.size,
            img: img,
            compressedBytes: null,
            compressedSize: 0,
            hitTarget: false
          });
        } catch (_err) {
          showToast('Bỏ qua tệp không phải ảnh hợp lệ: ' + f.name);
        }
      }
      $('compress-queue-caption').textContent = 'Đang có ' + compressState.items.length + ' ảnh chờ nén.';
      renderCompressResults(compressState.targetKb * 1024);
    });

    $('btn-compress-sample').addEventListener('click', async function () {
      const heavyCanvas = ImgEngine.createSampleDocumentCanvas('HỒ SƠ DỊCH VỤ CÔNG (MẪU NẶNG)', 1, true);
      const blob = await canvasToBlobAsync(heavyCanvas, 'image/png', 1);
      const img = await loadImageFromBlob(blob);
      ImgEngine.releaseCanvas(heavyCanvas);
      compressState.items = [{
        id: 'cmp_sample_' + Date.now(),
        name: 'ho_so_dich_vu_cong_mau.png',
        origSize: blob.size,
        img: img,
        compressedBytes: null,
        compressedSize: 0,
        hitTarget: false
      }];
      $('compress-queue-caption').textContent = 'Đã nạp ảnh tài liệu mẫu (' + ImgEngine.formatBytesVi(blob.size) + '). Bấm Nén đúng mức ngay để chạy thuật toán nhị phân.';
      renderCompressResults(compressState.targetKb * 1024);
      showToast('Đã nạp ảnh tài liệu mẫu ' + ImgEngine.formatBytesVi(blob.size) + ' để thử nén dưới 2MB.');
    });

    document.querySelectorAll('[data-target-kb]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const kb = Number(btn.getAttribute('data-target-kb')) || 2048;
        compressState.targetKb = kb;
        $('compress-custom-kb').value = String(kb);
        $('compress-custom-kb').setAttribute('aria-invalid', 'false');
        $('compress-custom-error').hidden = true;
        document.querySelectorAll('[data-target-kb]').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
      });
    });

    $('compress-custom-kb').addEventListener('input', validateCompressTargetKb);
    $('btn-run-compress').addEventListener('click', runCompressionBatch);
    $('btn-compress-dl-pdf').addEventListener('click', exportCompressedPdf);

    // --- TOOL 3: ID PHOTO ---
    setupListbox('idphoto-size', IDPHOTO_SIZE_OPTIONS, function () { return idPhotoState.sizeKey; }, function (val) {
      idPhotoState.sizeKey = val;
      if (val === '4x6_visa') {
        idPhotoState.bgMode = 'white';
        document.querySelectorAll('[data-idphoto-bg]').forEach(function (b) {
          b.setAttribute('aria-pressed', b.getAttribute('data-idphoto-bg') === 'white' ? 'true' : 'false');
        });
      }
      renderIdPhotoPreview();
    });

    $('idphoto-file-input').addEventListener('change', async function (e) {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      try {
        idPhotoState.img = await loadImageFromBlob(f);
        idPhotoState.zoom = 1;
        idPhotoState.offsetX = 0;
        idPhotoState.offsetY = 0;
        renderIdPhotoPreview();
      } catch (err) {
        showToast(err.message);
      }
    });

    $('btn-idphoto-sample').addEventListener('click', async function () {
      const sample = ImgEngine.createSamplePortraitCanvas();
      idPhotoState.img = await loadImageFromCanvas(sample);
      ImgEngine.releaseCanvas(sample);
      idPhotoState.zoom = 1;
      idPhotoState.offsetX = 0;
      idPhotoState.offsetY = 0;
      renderIdPhotoPreview();
      showToast('Đã nạp ảnh chân dung mẫu và dàn trang 10x15cm (300 DPI).');
    });

    document.querySelectorAll('[data-idphoto-bg]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        idPhotoState.bgMode = btn.getAttribute('data-idphoto-bg');
        document.querySelectorAll('[data-idphoto-bg]').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        renderIdPhotoPreview();
      });
    });

    document.querySelectorAll('[data-idphoto-view]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        idPhotoState.viewMode = btn.getAttribute('data-idphoto-view');
        document.querySelectorAll('[data-idphoto-view]').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        renderIdPhotoPreview();
      });
    });

    $('btn-idphoto-zoom-in').addEventListener('click', function () {
      idPhotoState.zoom = Math.min(2.2, Number((idPhotoState.zoom + 0.1).toFixed(2)));
      renderIdPhotoPreview();
    });
    $('btn-idphoto-zoom-out').addEventListener('click', function () {
      idPhotoState.zoom = Math.max(0.7, Number((idPhotoState.zoom - 0.1).toFixed(2)));
      renderIdPhotoPreview();
    });
    $('btn-idphoto-reset-pos').addEventListener('click', function () {
      idPhotoState.zoom = 1;
      idPhotoState.offsetX = 0;
      idPhotoState.offsetY = 0;
      renderIdPhotoPreview();
    });
    document.querySelectorAll('[data-idphoto-pan]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const dir = btn.getAttribute('data-idphoto-pan');
        const step = 18;
        if (dir === 'left') idPhotoState.offsetX -= step;
        if (dir === 'right') idPhotoState.offsetX += step;
        if (dir === 'up') idPhotoState.offsetY -= step;
        if (dir === 'down') idPhotoState.offsetY += step;
        renderIdPhotoPreview();
      });
    });

    $('btn-idphoto-dl-single').addEventListener('click', function () { exportIdPhoto('single'); });
    $('btn-idphoto-dl-sheet').addEventListener('click', function () { exportIdPhoto('sheet_jpg'); });
    $('btn-idphoto-dl-pdf').addEventListener('click', function () { exportIdPhoto('sheet_pdf'); });

    // --- TOOL 4: SIGN ---
    initSignaturePad();

    $('sign-doc-input').addEventListener('change', async function (e) {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      try {
        signState.docImg = await loadImageFromBlob(f);
        renderSignDocPreview();
      } catch (err) {
        showToast(err.message);
      }
    });

    $('btn-sign-sample-doc').addEventListener('click', async function () {
      const sample = ImgEngine.createSampleDocumentCanvas('ĐƠN XIN XÁC NHẬN CƯ TRÚ', 0, false);
      signState.docImg = await loadImageFromCanvas(sample);
      ImgEngine.releaseCanvas(sample);
      if (!signState.hasSignature) drawDemoSignatureStroke();
      else renderSignDocPreview();
      showToast('Đã nạp mẫu Đơn xin xác nhận. Chạm vào tờ đơn bên phải để đổi chỗ đặt chữ ký.');
    });

    $('btn-sign-demo-stroke').addEventListener('click', drawDemoSignatureStroke);
    $('btn-sign-clear').addEventListener('click', clearSignaturePad);

    document.querySelectorAll('[data-ink-color]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        signState.inkColor = btn.getAttribute('data-ink-color');
        document.querySelectorAll('[data-ink-color]').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        renderSignDocPreview();
      });
    });

    document.querySelectorAll('[data-ink-width]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        signState.inkWidth = Number(btn.getAttribute('data-ink-width')) || 3.5;
        document.querySelectorAll('[data-ink-width]').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
      });
    });

    document.querySelectorAll('[data-sig-scale]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        signState.sigScale = Number(btn.getAttribute('data-sig-scale')) || 0.26;
        document.querySelectorAll('[data-sig-scale]').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        renderSignDocPreview();
      });
    });

    $('sign-fullname').addEventListener('input', renderSignDocPreview);
    $('sign-include-date').addEventListener('change', renderSignDocPreview);

    $('sign-preview-canvas').addEventListener('click', function (e) {
      const canvas = $('sign-preview-canvas');
      const rect = canvas.getBoundingClientRect();
      signState.posXRatio = Math.max(0.12, Math.min(0.88, (e.clientX - rect.left) / Math.max(1, rect.width)));
      signState.posYRatio = Math.max(0.10, Math.min(0.90, (e.clientY - rect.top) / Math.max(1, rect.height)));
      renderSignDocPreview();
    });

    $('btn-sign-dl-png').addEventListener('click', function () { exportSignedDoc('png'); });
    $('btn-sign-dl-pdf').addEventListener('click', function () { exportSignedDoc('pdf'); });

    // --- TOOL 5: MERGE PDF ---
    $('merge-file-input').addEventListener('change', async function (e) {
      const files = Array.from(e.target.files || []);
      for (let i = 0; i < files.length; i += 1) {
        const f = files[i];
        try {
          const img = await loadImageFromBlob(f);
          const thumbCanvas = ImgEngine.createCanvas(96, 128);
          ImgEngine.drawImageRotatedFit(thumbCanvas.getContext('2d'), img, 0, 0, 96, 128, 0, false);
          const thumbUrl = thumbCanvas.toDataURL('image/jpeg', 0.7);
          ImgEngine.releaseCanvas(thumbCanvas);
          mergeState.pages.push({
            id: 'pg_' + Date.now() + '_' + i,
            name: f.name,
            img: img,
            thumbUrl: thumbUrl,
            rot: 0
          });
        } catch (_err) {
          showToast('Bỏ qua tệp không hợp lệ: ' + f.name);
        }
      }
      renderMergePageList();
    });

    $('btn-merge-sample').addEventListener('click', async function () {
      const titles = [
        'TRANG 1: ĐƠN ĐỀ NGHỊ XÁC NHẬN',
        'TRANG 2: BẢN KÊ KHAI THÔNG TIN',
        'TRANG 3: CAM KẾT HỒ SƠ HỢP LỆ'
      ];
      mergeState.pages = [];
      for (let i = 0; i < titles.length; i += 1) {
        const c = ImgEngine.createSampleDocumentCanvas(titles[i], i + 1, false);
        const img = await loadImageFromCanvas(c);
        const thumbCanvas = ImgEngine.createCanvas(96, 128);
        thumbCanvas.getContext('2d').drawImage(c, 0, 0, 96, 128);
        const thumbUrl = thumbCanvas.toDataURL('image/jpeg', 0.7);
        ImgEngine.releaseCanvas(c);
        ImgEngine.releaseCanvas(thumbCanvas);
        mergeState.pages.push({
          id: 'sample_pg_' + (i + 1),
          name: 'ho_so_trang_' + (i + 1) + '.jpg',
          img: img,
          thumbUrl: thumbUrl,
          rot: 0
        });
      }
      renderMergePageList();
      showToast('Đã nạp 3 trang hồ sơ mẫu. Bạn có thể đổi thứ tự, xoay 90 độ hoặc bấm Gộp PDF ngay.');
    });

    document.querySelectorAll('[data-merge-margin]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        mergeState.marginPt = Number(btn.getAttribute('data-merge-margin')) || 0;
        document.querySelectorAll('[data-merge-margin]').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
      });
    });

    $('btn-merge-export').addEventListener('click', exportMergedPdf);

    // --- TOOL 6: EXIF / GPS STRIPPER ---
    $('exif-file-input').addEventListener('change', async function (e) {
      const files = Array.from(e.target.files || []);
      for (let i = 0; i < files.length; i += 1) {
        const f = files[i];
        try {
          const buf = await f.arrayBuffer();
          const u8 = new Uint8Array(buf);
          const img = await loadImageFromBlob(f);
          exifState.items.push({
            id: 'exif_' + Date.now() + '_' + i,
            name: f.name,
            origBytes: u8,
            img: img,
            beforeMeta: ImgEngine.inspectImageMetadata(u8, f.name, f.type),
            cleanedBytes: null,
            afterMeta: null,
            outMime: exifState.outFormat
          });
        } catch (_err) {
          showToast('Không đọc được ảnh: ' + f.name);
        }
      }
      renderExifTable();
    });

    $('btn-exif-sample').addEventListener('click', async function () {
      const sample = ImgEngine.createSamplePortraitCanvas();
      const rawJpeg = await canvasToUint8Async(sample, 'image/jpeg', 0.90);
      ImgEngine.releaseCanvas(sample);
      const dirtyJpeg = ImgEngine.injectDemoExifMarker(rawJpeg);
      const blob = new Blob([dirtyJpeg], { type: 'image/jpeg' });
      const img = await loadImageFromBlob(blob);

      exifState.items = [{
        id: 'exif_sample_' + Date.now(),
        name: 'anh_chup_dien_thoai_co_gps.jpg',
        origBytes: dirtyJpeg,
        img: img,
        beforeMeta: ImgEngine.inspectImageMetadata(dirtyJpeg, 'anh_chup_dien_thoai_co_gps.jpg', 'image/jpeg'),
        cleanedBytes: null,
        afterMeta: null,
        outMime: exifState.outFormat
      }];
      renderExifTable();
      showToast('Đã nạp ảnh mẫu có gắn thử EXIF và tọa độ GPS. Bấm Gỡ sạch EXIF/GPS để kiểm chứng.');
    });

    document.querySelectorAll('[data-exif-format]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        exifState.outFormat = btn.getAttribute('data-exif-format');
        document.querySelectorAll('[data-exif-format]').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
      });
    });

    document.querySelectorAll('[data-exif-quality]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        exifState.quality = Number(btn.getAttribute('data-exif-quality')) || 0.92;
        document.querySelectorAll('[data-exif-quality]').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
      });
    });

    $('btn-run-exif-clean').addEventListener('click', runExifCleanBatch);
  }

  function registerOfflineServiceWorker() {
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.protocol === 'http:')) {
      navigator.serviceWorker.register('./sw.js').catch(function () {
        // Không làm gián đoạn trải nghiệm nếu trình duyệt không hỗ trợ SW
      });
    }
  }

  // Khởi chạy ứng dụng
  applyTheme(loadSavedTheme());
  updateNetworkIndicator();
  bindAllEvents();
  syncToolFromHash();
  renderCccdPreview();
  renderIdPhotoPreview();
  renderSignDocPreview();
  registerOfflineServiceWorker();
})();
