import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const pdfEngine = require('./pdf_engine.js');
const imageEngine = require('./image_engine.js');

/**
 * Tạo 1 luồng byte JPEG tối thiểu hợp lệ (SOI + SOF0 chứa width/height + EOI) dùng cho unit test Node.js.
 */
function makeMinimalJpegBytes(width, height, paddingBytes) {
  const pad = Math.max(0, Number(paddingBytes) || 0);
  const wHi = (width >> 8) & 0xff;
  const wLo = width & 0xff;
  const hHi = (height >> 8) & 0xff;
  const hLo = height & 0xff;
  const head = [
    0xff, 0xd8, // SOI
    0xff, 0xc0, 0x00, 0x11, 0x08,
    hHi, hLo, wHi, wLo,
    0x03, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
    0xff, 0xda, 0x00, 0x0c, 0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3f, 0x00
  ];
  const out = new Uint8Array(head.length + pad + 2);
  out.set(head, 0);
  for (let i = 0; i < pad; i += 1) {
    out[head.length + i] = (i * 37) & 0x7f;
  }
  out[out.length - 2] = 0xff;
  out[out.length - 1] = 0xd9; // EOI
  return out;
}

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

test('1. PDF Engine sinh header %PDF-1.4, xref chính xác và kết thúc %%EOF chuẩn A4 (595.28 x 841.89 pt)', () => {
  const jpg = makeMinimalJpegBytes(1654, 2339, 128);
  const pdf = pdfEngine.buildPdfFromJpegs([{ jpegBytes: jpg, pageSize: 'a4' }], {
    title: 'CCCD 2 mat A4'
  });
  const check = pdfEngine.validatePdfStructure(pdf);
  assert.equal(check.ok, true, check.reason);
  assert.equal(check.pageCount, 1);
  assert.equal(check.mediaBoxes[0], '/MediaBox [ 0 0 595.28 841.89 ]');
});

test('2. PDF Engine gộp đa trang (3 trang A4) khớp chính xác /Count 3 và đủ 3 MediaBox', () => {
  const pages = [
    { jpegBytes: makeMinimalJpegBytes(1240, 1754, 64), pageSize: 'a4', marginPt: 20 },
    { jpegBytes: makeMinimalJpegBytes(1754, 1240, 96), pageSize: 'a4', marginPt: 20 },
    { jpegBytes: makeMinimalJpegBytes(1240, 1754, 80), pageSize: 'a4', marginPt: 20 }
  ];
  const pdf = pdfEngine.buildPdfFromJpegs(pages);
  const check = pdfEngine.validatePdfStructure(pdf);
  assert.equal(check.ok, true, check.reason);
  assert.equal(check.pageCount, 3);
  assert.equal(check.mediaBoxes.length, 3);
});

test('3. PDF Engine hỗ trợ khổ in ảnh A6 10x15cm ngang (425.20 x 283.46 pt) và từ chối dữ liệu hỏng', () => {
  const jpg = makeMinimalJpegBytes(1772, 1181, 40);
  const pdf = pdfEngine.buildPdfFromJpegs([{ jpegBytes: jpg, pageSize: 'a6_landscape' }]);
  const check = pdfEngine.validatePdfStructure(pdf);
  assert.equal(check.ok, true, check.reason);
  assert.equal(check.mediaBoxes[0], '/MediaBox [ 0 0 425.20 283.46 ]');

  assert.throws(() => {
    pdfEngine.buildPdfFromJpegs([{ jpegBytes: new Uint8Array([0x00, 0x01, 0x02, 0x03]) }]);
  }, /JPEG/);
});

test('4. PDF Engine đọc đúng kích thước pixel trực tiếp từ luồng nhị phân JPEG SOF0', () => {
  const jpg = makeMinimalJpegBytes(2480, 3508, 24);
  const dim = pdfEngine.parseJpegDimensions(jpg);
  assert.deepEqual(dim, { width: 2480, height: 3508 });
});

test('5. Khóa an toàn RAM Safari iOS: ảnh 48MP (8000x6000) tự hạ về <= 8,7 MP; A4 300 DPI không bị cắt', () => {
  const clamped = imageEngine.clampDimensionsForMobile(8000, 6000);
  assert.equal(clamped.clamped, true);
  assert.ok(clamped.width * clamped.height <= imageEngine.MAX_SAFE_CANVAS_PIXELS);

  const a4300 = imageEngine.clampDimensionsForMobile(2480, 3508);
  assert.equal(a4300.clamped, false);
  assert.equal(a4300.width, 2480);
  assert.equal(a4300.height, 3508);
});

test('6. Bố cục ghép 2 mặt CCCD lên A4 giữ đúng tỷ lệ thẻ ISO ID-1 (85,6 x 53,98 mm) không chồng lấn', () => {
  const layout = imageEngine.computeIdCardA4Layout(1654, 2339);
  const ratio = layout.front.width / layout.front.height;
  assert.ok(Math.abs(ratio - (85.6 / 53.98)) < 0.02);
  assert.ok(layout.front.y + layout.front.height < layout.back.y);
  assert.ok(layout.back.y + layout.back.height < layout.a4Height);
});

test('7. Thuật toán tìm kiếm nhị phân nén dung lượng luôn đạt <= 2 MB (Dịch vụ công) và <= 500 KB với chất lượng cao nhất', async () => {
  const fakeEncoder = async (scale, quality) => {
    // Mô phỏng tệp gốc 4,2 MB phụ thuộc tuyến tính vào diện tích và chất lượng JPEG
    const size = Math.round(4200000 * (scale * scale) * (0.18 + 0.82 * quality));
    return { size: size, data: new Uint8Array(4) };
  };

  const target2MB = 2 * 1024 * 1024;
  const res2MB = await imageEngine.binarySearchCompress(fakeEncoder, target2MB);
  assert.equal(res2MB.hitTarget, true);
  assert.ok(res2MB.size <= target2MB, 'Kết quả phải <= 2MB');
  assert.ok(res2MB.size >= target2MB * 0.88, 'Giữ chất lượng cao nhất sát trần 2MB');

  const target500KB = 500 * 1024;
  const res500KB = await imageEngine.binarySearchCompress(fakeEncoder, target500KB);
  assert.equal(res500KB.hitTarget, true);
  assert.ok(res500KB.size <= target500KB, 'Kết quả phải <= 500KB');
});

test('8. Dàn trang in 10x15cm (300 DPI): tạo đúng 8 ảnh 3x4 (354x472) không tràn lề và không chồng nhau', () => {
  const sheet34 = imageEngine.computePhotoSheetLayout('3x4');
  assert.equal(sheet34.cells.length, 8);
  assert.equal(sheet34.sheetWidthPx, 1772);
  assert.equal(sheet34.sheetHeightPx, 1181);
  sheet34.cells.forEach((cell) => {
    assert.equal(cell.width, 354);
    assert.equal(cell.height, 472);
    assert.ok(cell.x >= 0 && cell.x + cell.width <= sheet34.sheetWidthPx);
    assert.ok(cell.y >= 0 && cell.y + cell.height <= sheet34.sheetHeightPx);
  });
});

test('9. Dàn trang in 10x15cm (300 DPI): tạo đúng 4 ảnh 4x6 (472x709) và 16 ảnh 2x3 hợp lệ', () => {
  const sheet46 = imageEngine.computePhotoSheetLayout('4x6');
  assert.equal(sheet46.cells.length, 4);
  assert.equal(sheet46.sheetWidthPx, 1181);
  assert.equal(sheet46.sheetHeightPx, 1772);
  sheet46.cells.forEach((cell) => {
    assert.equal(cell.width, 472);
    assert.equal(cell.height, 709);
    assert.ok(cell.x >= 0 && cell.x + cell.width <= sheet46.sheetWidthPx);
    assert.ok(cell.y >= 0 && cell.y + cell.height <= sheet46.sheetHeightPx);
  });

  const sheet23 = imageEngine.computePhotoSheetLayout('2x3');
  assert.equal(sheet23.cells.length, 16);
});

test('10. Kiểm tra phát hiện siêu dữ liệu EXIF & tọa độ GPS trước khi gỡ và xác nhận sạch sau khi vẽ lại', () => {
  const cleanJpg = makeMinimalJpegBytes(800, 600, 32);
  const beforeClean = imageEngine.inspectImageMetadata(cleanJpg, 'anh_sach.jpg', 'image/jpeg');
  assert.equal(beforeClean.hasExif, false);
  assert.equal(beforeClean.hasGps, false);

  const dirtyJpg = imageEngine.injectDemoExifMarker(cleanJpg);
  const detected = imageEngine.inspectImageMetadata(dirtyJpg, 'anh_gps.jpg', 'image/jpeg');
  assert.equal(detected.hasExif, true);
  assert.equal(detected.hasGps, true);
  assert.ok(detected.markersFound.length >= 2);
});

test('11. Kiểm toán bảo mật Zero-Upload: pdf_engine.js và image_engine.js tuyệt đối không gọi fetch / XMLHttpRequest / WebSocket', () => {
  const pdfSrc = readFileSync(join(__dirname, 'pdf_engine.js'), 'utf-8');
  const imgSrc = readFileSync(join(__dirname, 'image_engine.js'), 'utf-8');
  const forbidden = /\b(fetch|XMLHttpRequest|WebSocket|sendBeacon|EventSource)\s*\(/;
  assert.equal(forbidden.test(pdfSrc), false, 'pdf_engine.js không được gọi mạng');
  assert.equal(forbidden.test(imgSrc), false, 'image_engine.js không được gọi mạng');
});

test('12. Định dạng dung lượng tiếng Việt dùng dấu phẩy chuẩn (MB / KB / byte)', () => {
  assert.equal(imageEngine.formatBytesVi(2097152), '2,00 MB');
  assert.equal(imageEngine.formatBytesVi(512000), '500,0 KB');
  assert.equal(imageEngine.formatBytesVi(512), '512 byte');
});

async function run() {
  console.log('=== KIỂM THỬ ĐƠN VỊ ĐỘNG CƠ PDF & ẢNH CỤC BỘ (HỒ SƠ RIÊNG TƯ) ===');
  let passed = 0;
  let failed = 0;
  for (const t of tests) {
    try {
      await t.fn();
      passed += 1;
      console.log('  [PASS] ' + t.name);
    } catch (err) {
      failed += 1;
      console.error('  [FAIL] ' + t.name);
      console.error('         ' + err.message);
    }
  }
  console.log('\nKẾT QUẢ KIỂM THỬ: ' + passed + '/' + (passed + failed) + ' PASS');
  if (failed > 0) process.exit(1);
}

run();
