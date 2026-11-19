import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const engine = require('./tax_engine.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log('  [PASS] ' + name);
  } catch (err) {
    failed += 1;
    console.error('  [FAIL] ' + name);
    console.error('         ' + err.message);
  }
}

console.log('=== KIỂM THỬ ĐƠN VỊ LÕI THUẾ KÉT THUẾ SHOP (tax_engine.js) ===');

test('1. Bẫy phí sàn 20%: Ví nhận 800,7tr nhưng GMV tính thuế đã vượt 1,02 tỷ (HĐĐT bắt buộc)', () => {
  const res = engine.calculateHkdTaxVaultV2({
    sector_code: 'retail_goods',
    gmv_platform_taxable: 1020000000,
    platform_fees_total: 204000000,
    actual_platform_withheld: 15300000,
    rev_direct_self_declare: 0,
    operating_expenses_other: 620000000
  });
  assert.equal(res.total_taxable_gmv, 1020000000);
  assert.equal(res.net_cash_received, 800700000);
  assert.equal(res.vat_law_total, 10200000);
  assert.equal(res.pit_law_total, 100000);
  assert.equal(res.law_tax_total_est, 10300000);
  assert.equal(res.law_self_net_due_est, 0);
  assert.equal(res.vault_conservative_recommended, 0);
  assert.equal(res.refundable_platform_tax_est, 5000000);
  assert.equal(res.safe_spendable_cash, 180700000);
  assert.equal(res.pct_of_1b, 102.0);
  assert.equal(res.alert_level, 'OVER_1B_EINVOICE_30DAYS');
});

test('2. Shop nhỏ <= 1 tỷ (850tr): Miễn thuế NĐ 141/2026, hoàn 9tr thuế sàn, dự phòng 3,75tr vạch đỏ 85%', () => {
  const res = engine.calculateHkdTaxVaultV2({
    sector_code: 'retail_goods',
    gmv_platform_taxable: 600000000,
    platform_fees_total: 108000000,
    actual_platform_withheld: 9000000,
    rev_direct_self_declare: 250000000,
    operating_expenses_other: 520000000
  });
  assert.equal(res.total_taxable_gmv, 850000000);
  assert.equal(res.net_cash_received, 733000000);
  assert.equal(res.law_tax_total_est, 0);
  assert.equal(res.refundable_platform_tax_est, 9000000);
  assert.equal(res.vault_conservative_recommended, 3750000);
  assert.equal(res.safe_spendable_cash, 209250000);
  assert.equal(res.pct_of_1b, 85.0);
  assert.equal(res.alert_level, 'RED_NEAR_1B');
});

test('3. Shop đa kênh 1,4 tỷ: GTGT 100% doanh thu (14tr), TNCN chỉ trên phần vượt 1 tỷ (2tr)', () => {
  const res = engine.calculateHkdTaxVaultV2({
    sector_code: 'retail_goods',
    gmv_platform_taxable: 900000000,
    platform_fees_total: 162000000,
    actual_platform_withheld: 13500000,
    rev_direct_self_declare: 500000000,
    operating_expenses_other: 820000000
  });
  assert.equal(res.total_taxable_gmv, 1400000000);
  assert.equal(res.net_cash_received, 1224500000);
  assert.equal(res.vat_law_total, 14000000);
  assert.equal(res.pit_law_total, 2000000);
  assert.equal(res.law_tax_total_est, 16000000);
  assert.equal(res.law_self_net_due_est, 2500000);
  assert.equal(res.vault_conservative_recommended, 7500000);
  assert.equal(res.refundable_platform_tax_est, 0);
  assert.equal(res.safe_spendable_cash, 397000000);
  assert.equal(res.alert_level, 'OVER_1B_EINVOICE_30DAYS');
});

test('4. Bắt lỗi sàn trừ nhầm 10%: 500tr bị trừ 50tr thay vì 7,5tr -> bật còi đỏ lệch 42,5tr', () => {
  const res = engine.calculateHkdTaxVaultV2({
    sector_code: 'retail_goods',
    gmv_platform_taxable: 500000000,
    platform_fees_total: 90000000,
    actual_platform_withheld: 50000000,
    rev_direct_self_declare: 0,
    operating_expenses_other: 310000000
  });
  assert.equal(res.over_withheld_10pct_alert, true);
  assert.equal(res.expected_platform_tax, 7500000);
  assert.equal(res.over_withheld_diff, 42500000);
  assert.equal(res.refundable_platform_tax_est, 50000000);
  assert.equal(res.safe_spendable_cash, 50000000);
  assert.equal(res.alert_level, 'SAFE_GREEN');
});

test('5. Shop lớn vượt 3 tỷ (3,6 tỷ): Tính TNCN 17% lợi nhuận có hóa đơn (gồm phí sàn) + cảnh báo thiếu 350tr hóa đơn', () => {
  const res = engine.calculateHkdTaxVaultV2({
    sector_code: 'retail_goods',
    gmv_platform_taxable: 2000000000,
    platform_fees_total: 360000000,
    actual_platform_withheld: 30000000,
    rev_direct_self_declare: 1600000000,
    operating_expenses_other: 2390000000,
    valid_invoice_expenses_other: 2040000000
  });
  assert.equal(res.total_taxable_gmv, 3600000000);
  assert.equal(res.net_cash_received, 3210000000);
  assert.equal(res.vat_law_total, 36000000);
  assert.equal(res.taxable_profit, 1200000000);
  assert.equal(res.pit_law_total, 204000000);
  assert.equal(res.law_tax_total_est, 240000000);
  assert.equal(res.vault_conservative_recommended, 210000000);
  assert.equal(res.missing_invoice_expenses, 350000000);
  assert.equal(res.missing_invoice_tax_penalty_est, 59500000);
  assert.equal(res.safe_spendable_cash, 610000000);
  assert.equal(res.alert_level, 'CRITICAL_OVER_3B');
});

test('6. Đủ 4 nhóm ngành nghề chuẩn (1,5% / 4,5% / 7,0% / 3,0%) và mốc cảnh báo 70% / 80% của 3 tỷ', () => {
  const fnb = engine.calculateHkdTaxVaultV2({
    sector_code: 'production_fnb_transport',
    gmv_platform_taxable: 100000000,
    platform_fees_total: 20000000,
    actual_platform_withheld: 4500000,
    rev_direct_self_declare: 1100000000,
    operating_expenses_other: 600000000
  });
  assert.equal(fnb.vat_rate, 0.03);
  assert.equal(fnb.pit_rate, 0.015);
  assert.equal(fnb.vat_law_total, 36000000);
  assert.equal(fnb.pit_law_total, 3000000);

  const svc = engine.calculateHkdTaxVaultV2({
    sector_code: 'services_no_materials',
    gmv_platform_taxable: 0,
    platform_fees_total: 0,
    actual_platform_withheld: 0,
    rev_direct_self_declare: 750000000,
    operating_expenses_other: 200000000
  });
  assert.equal(svc.total_rate, 0.07);
  assert.equal(svc.alert_level, 'AMBER_WATCH_1B');
  assert.equal(svc.vault_conservative_recommended, 52500000);

  const otherNear3b = engine.calculateHkdTaxVaultV2({
    sector_code: 'other_business',
    gmv_platform_taxable: 0,
    platform_fees_total: 0,
    actual_platform_withheld: 0,
    rev_direct_self_declare: 2500000000,
    operating_expenses_other: 1200000000
  });
  assert.equal(otherNear3b.total_rate, 0.03);
  assert.equal(otherNear3b.alert_level, 'WARN_NEAR_3B');
});

test('7. Ngưỡng tùy chỉnh trong Cài đặt hoạt động động (đổi 1 tỷ -> 500 triệu tự tính lại ngay)', () => {
  const res = engine.calculateHkdTaxVaultV2({
    sector_code: 'retail_goods',
    gmv_platform_taxable: 600000000,
    platform_fees_total: 100000000,
    actual_platform_withheld: 9000000,
    rev_direct_self_declare: 0,
    operating_expenses_other: 200000000
  }, {
    exempt_threshold_vnd: 500000000,
    profit_method_threshold_vnd: 2000000000
  });
  assert.equal(res.pct_of_1b, 120.0);
  assert.equal(res.alert_level, 'OVER_1B_EINVOICE_30DAYS');
  assert.equal(res.vat_law_total, 6000000);
  assert.equal(res.pit_law_total, 500000);
});

test('8. Đọc file CSV mẫu thật 15 dòng: tự loại 2 đơn hủy/bom hàng & bắt đúng 2 đơn sàn trừ nhầm 10%', () => {
  const csvRaw = readFileSync(join(__dirname, 'sample_shopee_orders.csv'), 'utf-8');
  const parsed = engine.parseEcommerceCsv(csvRaw, 'retail_goods');
  assert.equal(parsed.ok, true);
  assert.equal(parsed.total_rows_read, 15);
  assert.equal(parsed.transactions.length, 13);
  assert.equal(parsed.excluded_bom.length, 2);
  assert.equal(parsed.flagged_over_withheld.length, 2);
  assert.deepEqual(
    parsed.flagged_over_withheld.map((o) => o.order_code),
    ['SP260419006', 'TT260809011']
  );

  // Nạp cả đơn hủy vào sổ rồi aggregate để chắc chắn aggregateTransactions cũng tự loại đơn bom
  const combined = parsed.transactions.concat(parsed.excluded_bom);
  const agg = engine.aggregateTransactions(combined, 'retail_goods');
  assert.equal(agg.active_orders_count, 13);
  assert.equal(agg.excluded_bom_count, 2);
  assert.equal(agg.excluded_bom_gmv, 30500000);
  assert.equal(agg.total_taxable_gmv, 774000000);
  assert.equal(agg.platform_withheld_actual, 18240000);
  assert.equal(agg.refundable_platform_tax_est, 18240000);
  assert.equal(agg.over_withheld_10pct_alert, true);
  assert.equal(agg.alert_level, 'AMBER_WATCH_1B');
});

test('9. Chống CSV Formula Injection (=, +, -, @, Tab, khoảng trắng đầu) và có UTF-8 BOM + Miễn trừ pháp lý', () => {
  assert.equal(engine.sanitizeCsvCell('=SUM(A1:A10)'), "'=SUM(A1:A10)");
  assert.equal(engine.sanitizeCsvCell('+cmd|"/C calc"!A0'), "\"'+cmd|\"\"/C calc\"\"!A0\"");
  assert.equal(engine.sanitizeCsvCell('-2+3'), "'-2+3");
  assert.equal(engine.sanitizeCsvCell('@HYPERLINK("http://evil")'), "\"'@HYPERLINK(\"\"http://evil\"\")\"");
  assert.equal(engine.sanitizeCsvCell('\t=1+1'), "'\t=1+1");
  assert.equal(engine.sanitizeCsvCell('  =1+1'), "'  =1+1");
  assert.equal(engine.sanitizeCsvCell('Đơn bình thường'), 'Đơn bình thường');

  const csvOut = engine.exportTransactionsToCsv(
    [{
      id: 't1',
      date: '2026-05-01',
      kind: 'direct_sale',
      channel: 'Facebook / Zalo',
      status: 'completed',
      order_code: '=HYPERLINK("http://bad")',
      amount: 1500000,
      note: '+1+1 Ghi chú thử'
    }],
    null,
    engine.TAX_RULES_CONFIG_2026,
    '=EVIL_SHOP'
  );
  assert.ok(csvOut.startsWith('\uFEFF'), 'Phải có UTF-8 BOM ở đầu file xuất CSV');
  assert.ok(csvOut.includes("'=EVIL_SHOP"), 'Tên shop bắt đầu bằng = phải được vô hiệu hóa');
  assert.ok(csvOut.includes("'=HYPERLINK"), 'Mã đơn bắt đầu bằng = phải được vô hiệu hóa');
  assert.ok(csvOut.includes("'+1+1 Ghi chú thử"), 'Ghi chú bắt đầu bằng + phải được vô hiệu hóa');
  assert.ok(csvOut.includes('Miễn trừ pháp lý'), 'File xuất bắt buộc phải có tuyên bố miễn trừ pháp lý');
});

test('10. Định dạng tiền VNĐ, phần trăm tiếng Việt và chặn số âm / ký tự lỗi khi nhập tiền', () => {
  assert.equal(engine.formatVnd(15000000), '15.000.000 đ');
  assert.equal(engine.formatVnd(-250000), '-250.000 đ');
  assert.equal(engine.formatPctVi(77.4), '77,4%');
  assert.equal(engine.readVietnameseMoney(15000000), '15 triệu đồng');
  assert.equal(engine.readVietnameseMoney(1020000000), '1 tỷ 20 triệu đồng');
  assert.equal(engine.parseMoneyValue('15.500.000 đ'), 15500000);
  assert.equal(engine.parseMoneyValue('1,250,000'), 1250000);

  const negCheck = engine.validatePositiveMoneyInput('-500000');
  assert.equal(negCheck.ok, false);
  assert.ok(negCheck.error.includes('số âm'));

  const alphaCheck = engine.validatePositiveMoneyInput('500k abc');
  assert.equal(alphaCheck.ok, false);

  const zeroCheck = engine.validatePositiveMoneyInput('0');
  assert.equal(zeroCheck.ok, false);

  const validCheck = engine.validatePositiveMoneyInput('1.500.000');
  assert.equal(validCheck.ok, true);
  assert.equal(validCheck.value, 1500000);
});

console.log('\nKẾT QUẢ KIỂM THỬ: ' + passed + '/' + (passed + failed) + ' PASS');
if (failed > 0) {
  process.exit(1);
}
