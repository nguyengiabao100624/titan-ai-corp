/* Két Thuế Shop - Lõi tính toán thuế HKD / TMĐT (NĐ 141/2026, NĐ 117/2025, NĐ 70/2025, NĐ 68/2026) */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.KetThueEngine = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const TAX_RULES_CONFIG_2026 = {
    version: '2026.11-ND141-ND117-ND70-ND68',
    effective_date: '2026-01-01',
    legal_basis: 'NĐ 141/2026/NĐ-CP, NĐ 68/2026/NĐ-CP, NĐ 117/2025/NĐ-CP, NĐ 70/2025/NĐ-CP',
    exempt_threshold_vnd: 1000000000,
    profit_method_threshold_vnd: 3000000000,
    warn_amber_pct: 0.70,
    warn_red_pct: 0.85,
    over_withheld_tolerance: 1.05,
    sectors: {
      retail_goods: {
        code: 'retail_goods',
        name: 'Bán lẻ, phân phối hàng hóa (Shopee, TikTok, tạp hóa)',
        short_name: 'Bán lẻ hàng hóa (1,5%)',
        vat: 0.01,
        pit: 0.005
      },
      production_fnb_transport: {
        code: 'production_fnb_transport',
        name: 'Sản xuất, ăn uống, vận tải, dịch vụ gắn hàng hóa',
        short_name: 'Sản xuất / Ăn uống / Vận tải (4,5%)',
        vat: 0.03,
        pit: 0.015
      },
      services_no_materials: {
        code: 'services_no_materials',
        name: 'Dịch vụ, xây dựng không bao thầu vật liệu',
        short_name: 'Dịch vụ không bao thầu vật liệu (7,0%)',
        vat: 0.05,
        pit: 0.02
      },
      other_business: {
        code: 'other_business',
        name: 'Hoạt động kinh doanh khác',
        short_name: 'Kinh doanh khác (3,0%)',
        vat: 0.02,
        pit: 0.01
      }
    }
  };

  function mergeRules(customRules) {
    if (!customRules || typeof customRules !== 'object') {
      return TAX_RULES_CONFIG_2026;
    }
    const merged = Object.assign({}, TAX_RULES_CONFIG_2026, customRules);
    merged.sectors = Object.assign({}, TAX_RULES_CONFIG_2026.sectors, customRules.sectors || {});
    if (!Number.isFinite(Number(merged.exempt_threshold_vnd)) || Number(merged.exempt_threshold_vnd) <= 0) {
      merged.exempt_threshold_vnd = TAX_RULES_CONFIG_2026.exempt_threshold_vnd;
    } else {
      merged.exempt_threshold_vnd = Math.round(Number(merged.exempt_threshold_vnd));
    }
    if (!Number.isFinite(Number(merged.profit_method_threshold_vnd)) || Number(merged.profit_method_threshold_vnd) <= merged.exempt_threshold_vnd) {
      merged.profit_method_threshold_vnd = Math.max(TAX_RULES_CONFIG_2026.profit_method_threshold_vnd, merged.exempt_threshold_vnd * 3);
    } else {
      merged.profit_method_threshold_vnd = Math.round(Number(merged.profit_method_threshold_vnd));
    }
    return merged;
  }

  function safeNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) && num > 0 ? num : 0;
  }

  function round1(val) {
    return Math.round(val * 10) / 10;
  }

  /**
   * Lõi tính toán Két Thuế Shop v2 (khớp 100% với đặc tả Bước 3):
   * - Tách bạch GMV tính thuế trên sàn, phí sàn, thuế sàn trừ hộ, và tiền thực về ví.
   * - Áp đúng NĐ 141/2026: <= ngưỡng miễn thuế (mặc định 1 tỷ) miễn GTGT/TNCN và tính thuế sàn trừ dư được đòi hoàn.
   * - Mốc 1 tỷ đến 3 tỷ: GTGT trên 100% doanh thu, TNCN chỉ tính trên phần doanh thu vượt mốc miễn thuế.
   * - Vượt 3 tỷ (NĐ 68/2026): GTGT theo tỷ lệ ngành + TNCN 17% (hoặc 20% > 50 tỷ) trên lợi nhuận có hóa đơn hợp lệ (gồm cả phí sàn có hóa đơn điện tử).
   * - Phát hiện lỗi sàn trừ nhầm thuế (vượt > 105% tỷ lệ ngành, ví dụ trừ 10%).
   */
  function calculateHkdTaxVaultV2(input, customRules) {
    const params = input || {};
    const rules = mergeRules(customRules || params.rules);
    const sectorCode = rules.sectors[params.sector_code] ? params.sector_code : 'retail_goods';
    const sec = rules.sectors[sectorCode];

    const vatR = sec.vat;
    const pitR = sec.pit;
    const totR = vatR + pitR;
    const t1 = rules.exempt_threshold_vnd;
    const t2 = rules.profit_method_threshold_vnd;

    const gmvPlatformTaxable = safeNumber(params.gmv_platform_taxable);
    const platformFeesTotal = safeNumber(params.platform_fees_total);
    const actualPlatformWithheld = safeNumber(params.actual_platform_withheld);
    const revDirectSelfDeclare = safeNumber(params.rev_direct_self_declare);
    const operatingExpensesOther = safeNumber(params.operating_expenses_other);
    const validInvoiceExpensesOther = Math.min(
      safeNumber(params.valid_invoice_expenses_other),
      operatingExpensesOther > 0 ? operatingExpensesOther : safeNumber(params.valid_invoice_expenses_other)
    );

    const totalTaxableRev = gmvPlatformTaxable + revDirectSelfDeclare;
    const expectedPlatformTax = Math.round(gmvPlatformTaxable * totR);
    const overWithheldAlert = (
      gmvPlatformTaxable > 0 &&
      actualPlatformWithheld > expectedPlatformTax * rules.over_withheld_tolerance
    );
    const overWithheldDiff = overWithheldAlert
      ? Math.max(0, Math.round(actualPlatformWithheld - expectedPlatformTax))
      : 0;

    // 1. Tiền thực về ví / tài khoản ngân hàng
    const netCashIn = (gmvPlatformTaxable - platformFeesTotal - actualPlatformWithheld) + revDirectSelfDeclare;

    const ratioT1 = t1 > 0 ? totalTaxableRev / t1 : 0;
    const ratioT2 = t2 > 0 ? totalTaxableRev / t2 : 0;

    let vatLawTotal = 0;
    let pitLawTotal = 0;
    let selfVatQuarterly = 0;
    let lawSelfNetDue = 0;
    let refundableTaxEst = 0;
    let vaultConservative = 0;
    let pitProfitRate = 0;
    let taxableProfit = 0;
    let missingInvoiceExpenses = 0;
    let missingInvoiceTaxPenaltyEst = 0;
    let regime = '';

    // 2. Két cất đóng thuế và Quỹ thuế dư có thể đòi lại
    if (totalTaxableRev <= t1) {
      vatLawTotal = 0;
      pitLawTotal = 0;
      selfVatQuarterly = 0;
      lawSelfNetDue = 0;
      refundableTaxEst = Math.round(actualPlatformWithheld);
      vaultConservative = ratioT1 >= rules.warn_amber_pct
        ? Math.round(revDirectSelfDeclare * totR)
        : 0;
      regime = 'Miễn thuế (từ ' + formatShortThreshold(t1) + '/năm trở xuống theo NĐ 141/2026)';
    } else if (totalTaxableRev <= t2) {
      vatLawTotal = Math.round(totalTaxableRev * vatR);
      pitLawTotal = Math.round(Math.max(0, totalTaxableRev - t1) * pitR);
      const totalLaw = vatLawTotal + pitLawTotal;
      selfVatQuarterly = Math.round(revDirectSelfDeclare * vatR);
      lawSelfNetDue = Math.max(0, totalLaw - Math.round(actualPlatformWithheld));
      refundableTaxEst = Math.max(0, Math.round(actualPlatformWithheld) - totalLaw);
      vaultConservative = Math.max(
        lawSelfNetDue,
        selfVatQuarterly + Math.round(revDirectSelfDeclare * pitR)
      );
      regime = 'Kê khai theo quý và bắt buộc hóa đơn máy tính tiền (GTGT toàn bộ, TNCN phần vượt ' + formatShortThreshold(t1) + ')';
    } else {
      pitProfitRate = totalTaxableRev <= 50000000000 ? 0.17 : 0.20;
      vatLawTotal = Math.round(totalTaxableRev * vatR);
      const validDeductibleTotal = validInvoiceExpensesOther + platformFeesTotal;
      taxableProfit = Math.max(0, totalTaxableRev - validDeductibleTotal);
      pitLawTotal = Math.round(taxableProfit * pitProfitRate);
      const totalLaw = vatLawTotal + pitLawTotal;
      selfVatQuarterly = Math.round(revDirectSelfDeclare * vatR);
      lawSelfNetDue = Math.max(0, totalLaw - Math.round(actualPlatformWithheld));
      refundableTaxEst = Math.max(0, Math.round(actualPlatformWithheld) - totalLaw);
      vaultConservative = lawSelfNetDue;
      missingInvoiceExpenses = Math.max(0, operatingExpensesOther - validInvoiceExpensesOther);
      missingInvoiceTaxPenaltyEst = Math.round(missingInvoiceExpenses * pitProfitRate);
      regime = 'Tính thuế TNCN ' + Math.round(pitProfitRate * 100) + '% trên lợi nhuận có hóa đơn hợp lệ + GTGT ' + round1(vatR * 100) + '% (vượt ' + formatShortThreshold(t2) + '/năm)';
    }

    // 3. Tiền thật được phép xài an toàn
    const safeSpendableCash = Math.round(netCashIn - operatingExpensesOther - vaultConservative);

    // Mức cảnh báo Radar
    let alertLevel = 'SAFE_GREEN';
    if (ratioT2 >= 1.0) {
      alertLevel = 'CRITICAL_OVER_3B';
    } else if (ratioT2 >= 0.80) {
      alertLevel = 'WARN_NEAR_3B';
    } else if (ratioT1 >= 1.0) {
      alertLevel = 'OVER_1B_EINVOICE_30DAYS';
    } else if (ratioT1 >= rules.warn_red_pct) {
      alertLevel = 'RED_NEAR_1B';
    } else if (ratioT1 >= rules.warn_amber_pct) {
      alertLevel = 'AMBER_WATCH_1B';
    }

    return {
      sector_code: sectorCode,
      sector_name: sec.name,
      vat_rate: vatR,
      pit_rate: pitR,
      total_rate: totR,
      exempt_threshold_vnd: t1,
      profit_method_threshold_vnd: t2,
      gmv_platform_taxable: Math.round(gmvPlatformTaxable),
      rev_direct_self_declare: Math.round(revDirectSelfDeclare),
      total_taxable_gmv: Math.round(totalTaxableRev),
      net_cash_received: Math.round(netCashIn),
      platform_fees_total: Math.round(platformFeesTotal),
      platform_withheld_actual: Math.round(actualPlatformWithheld),
      expected_platform_tax: expectedPlatformTax,
      operating_expenses_other: Math.round(operatingExpensesOther),
      valid_invoice_expenses_other: Math.round(validInvoiceExpensesOther),
      gmv_vs_net_gap: Math.round(Math.max(0, totalTaxableRev - netCashIn)),
      vat_law_total: vatLawTotal,
      pit_law_total: pitLawTotal,
      law_tax_total_est: vatLawTotal + pitLawTotal,
      self_vat_quarterly: selfVatQuarterly,
      law_self_net_due_est: lawSelfNetDue,
      vault_conservative_recommended: vaultConservative,
      refundable_platform_tax_est: refundableTaxEst,
      safe_spendable_cash: safeSpendableCash,
      taxable_profit: Math.round(taxableProfit),
      pit_profit_rate: pitProfitRate,
      missing_invoice_expenses: Math.round(missingInvoiceExpenses),
      missing_invoice_tax_penalty_est: missingInvoiceTaxPenaltyEst,
      remaining_to_t1: Math.max(0, Math.round(t1 - totalTaxableRev)),
      remaining_to_t2: Math.max(0, Math.round(t2 - totalTaxableRev)),
      pct_of_1b: round1(ratioT1 * 100),
      pct_of_3b: round1(ratioT2 * 100),
      alert_level: alertLevel,
      over_withheld_10pct_alert: overWithheldAlert,
      over_withheld_diff: overWithheldDiff,
      regime: regime
    };
  }

  function formatShortThreshold(amount) {
    if (amount >= 1000000000) {
      const billions = amount / 1000000000;
      const str = Number.isInteger(billions) ? String(billions) : billions.toFixed(1).replace('.', ',');
      return str + ' tỷ';
    }
    if (amount >= 1000000) {
      const millions = amount / 1000000;
      const str = Number.isInteger(millions) ? String(millions) : millions.toFixed(1).replace('.', ',');
      return str + ' triệu';
    }
    return formatVnd(amount);
  }

  /**
   * Tổng hợp toàn bộ sổ giao dịch -> gọi calculateHkdTaxVaultV2,
   * đồng thời tách riêng số đơn bom/hủy đã tự động loại bỏ và danh sách đơn sàn trừ nhầm 10%.
   */
  function aggregateTransactions(transactions, sectorCode, customRules) {
    const list = Array.isArray(transactions) ? transactions : [];
    const rules = mergeRules(customRules);
    const sec = rules.sectors[sectorCode] || rules.sectors.retail_goods;
    const totR = sec.vat + sec.pit;

    let gmvPlatform = 0;
    let platformFees = 0;
    let platformWithheld = 0;
    let revDirect = 0;
    let opExpenses = 0;
    let validInvoiceExpenses = 0;

    let activeOrdersCount = 0;
    let excludedBomCount = 0;
    let excludedBomGmv = 0;
    const flaggedOrders = [];
    const monthlyMap = {};

    for (let i = 0; i < list.length; i += 1) {
      const tx = list[i];
      if (!tx) continue;

      const status = String(tx.status || 'completed').toLowerCase();
      const isCancelled = status === 'cancelled' || status === 'returned' || isCancelledStatusText(status);

      if (tx.kind === 'platform_sale') {
        const gmv = safeNumber(tx.gmv);
        const fee = safeNumber(tx.platform_fee);
        const withheld = safeNumber(tx.tax_withheld);

        if (isCancelled) {
          excludedBomCount += 1;
          excludedBomGmv += gmv;
          continue;
        }

        activeOrdersCount += 1;
        gmvPlatform += gmv;
        platformFees += fee;
        platformWithheld += withheld;

        const expectedOrderTax = Math.round(gmv * totR);
        if (gmv > 0 && withheld > expectedOrderTax * rules.over_withheld_tolerance) {
          const actualPct = round1((withheld / gmv) * 100);
          flaggedOrders.push({
            id: tx.id,
            order_code: tx.order_code || tx.note || ('Đơn #' + (i + 1)),
            channel: tx.channel || 'Sàn TMĐT',
            gmv: Math.round(gmv),
            tax_withheld: Math.round(withheld),
            expected_tax: expectedOrderTax,
            diff: Math.round(withheld - expectedOrderTax),
            actual_pct: actualPct
          });
        }

        addMonthlyPoint(monthlyMap, tx.date, gmv, 0);
      } else if (tx.kind === 'direct_sale') {
        const amount = safeNumber(tx.amount != null ? tx.amount : tx.gmv);
        if (isCancelled) {
          excludedBomCount += 1;
          excludedBomGmv += amount;
          continue;
        }
        activeOrdersCount += 1;
        revDirect += amount;
        addMonthlyPoint(monthlyMap, tx.date, 0, amount);
      } else if (tx.kind === 'expense') {
        if (isCancelled) continue;
        const amount = safeNumber(tx.amount);
        opExpenses += amount;
        if (tx.has_valid_invoice) {
          validInvoiceExpenses += amount;
        }
      }
    }

    const vault = calculateHkdTaxVaultV2({
      sector_code: sectorCode,
      gmv_platform_taxable: gmvPlatform,
      platform_fees_total: platformFees,
      actual_platform_withheld: platformWithheld,
      rev_direct_self_declare: revDirect,
      operating_expenses_other: opExpenses,
      valid_invoice_expenses_other: validInvoiceExpenses
    }, rules);

    const anyOrderOverWithheld = flaggedOrders.length > 0;
    const totalFlaggedDiff = flaggedOrders.reduce(function (sum, item) {
      return sum + item.diff;
    }, 0);

    vault.over_withheld_10pct_alert = vault.over_withheld_10pct_alert || anyOrderOverWithheld;
    vault.over_withheld_diff = Math.max(vault.over_withheld_diff, totalFlaggedDiff);
    vault.flagged_over_withheld_orders = flaggedOrders;
    vault.active_orders_count = activeOrdersCount;
    vault.excluded_bom_count = excludedBomCount;
    vault.excluded_bom_gmv = Math.round(excludedBomGmv);
    vault.monthly_series = buildMonthlySeries(monthlyMap);

    return vault;
  }

  function addMonthlyPoint(map, dateStr, platformGmv, directRev) {
    const m = extractMonthKey(dateStr);
    if (!map[m]) {
      map[m] = { month: m, platform: 0, direct: 0, total: 0 };
    }
    map[m].platform += platformGmv;
    map[m].direct += directRev;
    map[m].total += platformGmv + directRev;
  }

  function extractMonthKey(dateStr) {
    const raw = String(dateStr || '').trim();
    const iso = raw.match(/^(\d{4})-(\d{2})/);
    if (iso) return Number(iso[2]);
    const vn = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (vn) return Number(vn[2]);
    return new Date().getMonth() + 1;
  }

  function buildMonthlySeries(monthlyMap) {
    const series = [];
    let cumulative = 0;
    for (let m = 1; m <= 12; m += 1) {
      const bucket = monthlyMap[m] || { month: m, platform: 0, direct: 0, total: 0 };
      cumulative += bucket.total;
      series.push({
        month: m,
        label: 'T' + m,
        platform: Math.round(bucket.platform),
        direct: Math.round(bucket.direct),
        total: Math.round(bucket.total),
        cumulative: Math.round(cumulative)
      });
    }
    return series;
  }

  function normalizeHeader(text) {
    return String(text || '')
      .replace(/^\uFEFF/, '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function validatePositiveMoneyInput(raw) {
    const str = String(raw == null ? '' : raw).trim();
    if (!str) {
      return { ok: false, value: 0, error: 'Vui lòng nhập số tiền lớn hơn 0 đồng trước khi lưu.' };
    }
    if (str.indexOf('-') !== -1 || str.indexOf('\u2212') !== -1) {
      return { ok: false, value: 0, error: 'Số tiền không được là số âm. Vui lòng nhập số dương (ví dụ: 500.000).' };
    }
    const strippedCurrency = str.replace(/\s*(vnđ|vnd|đ)\s*$/i, '').trim();
    if (!strippedCurrency || /[^0-9.,\s]/.test(strippedCurrency)) {
      return { ok: false, value: 0, error: 'Số tiền chưa hợp lệ. Vui lòng chỉ nhập chữ số (ví dụ: 1.500.000).' };
    }
    const val = parseMoneyValue(strippedCurrency);
    if (!Number.isFinite(val) || val <= 0) {
      return { ok: false, value: 0, error: 'Vui lòng nhập số tiền lớn hơn 0 đồng trước khi lưu.' };
    }
    return { ok: true, value: val, error: '' };
  }

  function formatPctVi(pct) {
    const n = Number(pct) || 0;
    return String(n).replace('.', ',') + '%';
  }

  function parseMoneyValue(raw) {
    if (typeof raw === 'number') {
      return Number.isFinite(raw) ? Math.abs(raw) : 0;
    }
    const str = String(raw || '').trim();
    if (!str) return 0;
    // Bỏ ký tự tiền tệ, giữ dấu chấm/phẩy và chữ số
    let cleaned = str.replace(/[^\d.,-]/g, '');
    if (!cleaned) return 0;

    // Xử lý dấu chấm hoặc dấu phẩy ngăn cách hàng nghìn kiểu VN/US
    const dotCount = (cleaned.match(/\./g) || []).length;
    const commaCount = (cleaned.match(/,/g) || []).length;

    if (dotCount > 1 && commaCount === 0) {
      cleaned = cleaned.replace(/\./g, '');
    } else if (commaCount > 1 && dotCount === 0) {
      cleaned = cleaned.replace(/,/g, '');
    } else if (dotCount === 1 && commaCount === 0) {
      const parts = cleaned.split('.');
      if (parts[1] && parts[1].length === 3) {
        cleaned = cleaned.replace(/\./g, '');
      }
    } else if (commaCount === 1 && dotCount === 0) {
      const parts = cleaned.split(',');
      if (parts[1] && parts[1].length === 3) {
        cleaned = cleaned.replace(/,/g, '');
      } else {
        cleaned = cleaned.replace(',', '.');
      }
    } else if (dotCount > 0 && commaCount > 0) {
      if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      } else {
        cleaned = cleaned.replace(/,/g, '');
      }
    }

    const num = Number(cleaned);
    return Number.isFinite(num) ? Math.abs(Math.round(num)) : 0;
  }

  function isCancelledStatusText(rawStatus) {
    const s = normalizeHeader(rawStatus);
    if (!s) return false;
    const keywords = [
      'huy', 'da huy', 'bom', 'hoan tien', 'tra hang', 'that bai',
      'khong thanh cong', 'hoan hang', 'tu choi',
      'cancel', 'canceled', 'cancelled', 'refund', 'returned', 'return', 'failed', 'void'
    ];
    for (let i = 0; i < keywords.length; i += 1) {
      if (s.indexOf(keywords[i]) !== -1) return true;
    }
    return false;
  }

  function detectDelimiter(firstLine) {
    const commas = (firstLine.match(/,/g) || []).length;
    const semis = (firstLine.match(/;/g) || []).length;
    const tabs = (firstLine.match(/\t/g) || []).length;
    if (tabs > commas && tabs >= semis) return '\t';
    if (semis > commas) return ';';
    return ',';
  }

  function splitCsvRows(text) {
    const cleanText = String(text || '').replace(/^\uFEFF/, '');
    const firstBreak = cleanText.search(/\r?\n/);
    const firstLine = firstBreak === -1 ? cleanText : cleanText.slice(0, firstBreak);
    const delimiter = detectDelimiter(firstLine);

    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < cleanText.length; i += 1) {
      const ch = cleanText[i];
      const next = cleanText[i + 1];

      if (inQuotes) {
        if (ch === '"' && next === '"') {
          cell += '"';
          i += 1;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          cell += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === delimiter) {
          row.push(cell.trim());
          cell = '';
        } else if (ch === '\r' && next === '\n') {
          row.push(cell.trim());
          if (row.some(function (c) { return c !== ''; })) rows.push(row);
          row = [];
          cell = '';
          i += 1;
        } else if (ch === '\n' || ch === '\r') {
          row.push(cell.trim());
          if (row.some(function (c) { return c !== ''; })) rows.push(row);
          row = [];
          cell = '';
        } else {
          cell += ch;
        }
      }
    }

    if (cell !== '' || row.length > 0) {
      row.push(cell.trim());
      if (row.some(function (c) { return c !== ''; })) rows.push(row);
    }

    return rows;
  }

  function normalizeDateValue(rawDate) {
    const s = String(rawDate || '').trim();
    const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (iso) {
      return iso[1] + '-' + iso[2].padStart(2, '0') + '-' + iso[3].padStart(2, '0');
    }
    const vn = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (vn) {
      return vn[3] + '-' + vn[2].padStart(2, '0') + '-' + vn[1].padStart(2, '0');
    }
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  /**
   * Trình đọc file CSV Shopee / TikTok Shop thông minh:
   * - Tự nhận diện cột tiếng Việt và tiếng Anh.
   * - Tự cộng gộp nhiều cột phí sàn / nhiều cột thuế nếu file Shopee tách riêng.
   * - Tự lọc bỏ đơn Hủy / Bom hàng / Trả hàng hoàn tiền.
   * - Đánh dấu riêng các đơn bị sàn trừ nhầm thuế (> 105% tỷ lệ ngành, ví dụ trừ 10%).
   */
  function parseEcommerceCsv(csvText, sectorCode, customRules) {
    const rows = splitCsvRows(csvText);
    if (rows.length < 2) {
      return {
        ok: false,
        error: 'Tệp chưa đủ dữ liệu (cần ít nhất 1 dòng tiêu đề và 1 dòng đơn hàng).',
        transactions: [],
        excluded_bom: [],
        flagged_over_withheld: []
      };
    }

    const rules = mergeRules(customRules);
    const sec = rules.sectors[sectorCode] || rules.sectors.retail_goods;
    const totR = sec.vat + sec.pit;

    // Tìm dòng tiêu đề thật (bỏ qua các dòng ghi chú miễn trừ nếu người dùng nạp lại tệp xuất)
    let headerIdx = 0;
    for (let r = 0; r < Math.min(rows.length, 6); r += 1) {
      const joined = rows[r].map(normalizeHeader).join(' | ');
      if (
        joined.indexOf('don hang') !== -1 ||
        joined.indexOf('order') !== -1 ||
        joined.indexOf('doanh thu') !== -1 ||
        joined.indexOf('gross sales') !== -1 ||
        joined.indexOf('so tien') !== -1
      ) {
        headerIdx = r;
        break;
      }
    }

    const headers = rows[headerIdx].map(normalizeHeader);

    const colMap = {
      orderCode: -1,
      date: -1,
      channel: -1,
      status: -1,
      gmv: -1,
      netPayout: -1,
      note: -1,
      feeCols: [],
      taxCols: []
    };

    for (let c = 0; c < headers.length; c += 1) {
      const h = headers[c];
      if (!h) continue;

      if (colMap.orderCode === -1 && (h.indexOf('ma don') !== -1 || h.indexOf('order id') !== -1 || h.indexOf('order adjustment') !== -1 || h === 'ma')) {
        colMap.orderCode = c;
      } else if (colMap.date === -1 && (h.indexOf('ngay') !== -1 || h.indexOf('date') !== -1 || h.indexOf('time') !== -1)) {
        colMap.date = c;
      } else if (colMap.channel === -1 && (h === 'san' || h.indexOf('kenh') !== -1 || h.indexOf('platform') !== -1 && h.indexOf('fee') === -1 && h.indexOf('commission') === -1)) {
        colMap.channel = c;
      } else if (colMap.status === -1 && (h.indexOf('trang thai') !== -1 || h.indexOf('status') !== -1)) {
        colMap.status = c;
      } else if (colMap.gmv === -1 && (
        h.indexOf('tong so tien don hang') !== -1 ||
        h.indexOf('doanh thu tinh thue') !== -1 ||
        h.indexOf('gia tri don') !== -1 ||
        h.indexOf('gross sales') !== -1 ||
        h.indexOf('order amount') !== -1 ||
        h.indexOf('gmv') !== -1 ||
        h.indexOf('tong tien hang') !== -1
      )) {
        colMap.gmv = c;
      } else if (
        h.indexOf('thue') !== -1 ||
        h.indexOf('tax withheld') !== -1 ||
        h.indexOf('withholding tax') !== -1
      ) {
        colMap.taxCols.push(c);
      } else if (
        h.indexOf('phi ') !== -1 ||
        h.indexOf('phi san') !== -1 ||
        h.indexOf('commission') !== -1 ||
        h.indexOf('service fee') !== -1 ||
        h.indexOf('transaction fee') !== -1 ||
        h.indexOf('platform fee') !== -1
      ) {
        colMap.feeCols.push(c);
      } else if (colMap.netPayout === -1 && (
        h.indexOf('tien ve vi') !== -1 ||
        h.indexOf('da thanh toan') !== -1 ||
        h.indexOf('settlement') !== -1 ||
        h.indexOf('net payout') !== -1 ||
        h.indexOf('thuc nhan') !== -1
      )) {
        colMap.netPayout = c;
      } else if (colMap.note === -1 && (
        h.indexOf('ghi chu') !== -1 ||
        h.indexOf('san pham') !== -1 ||
        h.indexOf('note') !== -1 ||
        h.indexOf('product') !== -1 ||
        h.indexOf('mo ta') !== -1
      )) {
        colMap.note = c;
      }
    }

    if (colMap.gmv === -1 && colMap.netPayout === -1) {
      return {
        ok: false,
        error: 'Không tìm thấy cột tiền đơn hàng (ví dụ: Tổng số tiền đơn hàng, Doanh thu tính thuế, Order Amount).',
        transactions: [],
        excluded_bom: [],
        flagged_over_withheld: []
      };
    }

    const transactions = [];
    const excludedBom = [];
    const flaggedOverWithheld = [];
    const nowStamp = Date.now();

    for (let r = headerIdx + 1; r < rows.length; r += 1) {
      const cells = rows[r];
      if (!cells || cells.length === 0) continue;

      const rawCode = colMap.orderCode !== -1 ? (cells[colMap.orderCode] || '') : ('CSV-' + r);
      const rawStatus = colMap.status !== -1 ? (cells[colMap.status] || 'Hoàn thành') : 'Hoàn thành';
      const rawChannel = colMap.channel !== -1 ? (cells[colMap.channel] || '') : '';
      const rawDate = colMap.date !== -1 ? (cells[colMap.date] || '') : '';
      const rawNote = colMap.note !== -1 ? (cells[colMap.note] || '') : '';

      // Bỏ qua dòng chân trang tổng kết hoặc miễn trừ
      const normCode = normalizeHeader(rawCode);
      if (normCode.indexOf('tong cong') === 0 || normCode.indexOf('luu y') === 0 || normCode.indexOf('mien tru') === 0) {
        continue;
      }

      let feeTotal = 0;
      for (let f = 0; f < colMap.feeCols.length; f += 1) {
        feeTotal += parseMoneyValue(cells[colMap.feeCols[f]]);
      }

      let taxTotal = 0;
      for (let t = 0; t < colMap.taxCols.length; t += 1) {
        taxTotal += parseMoneyValue(cells[colMap.taxCols[t]]);
      }

      let gmv = colMap.gmv !== -1 ? parseMoneyValue(cells[colMap.gmv]) : 0;
      const netPayout = colMap.netPayout !== -1 ? parseMoneyValue(cells[colMap.netPayout]) : 0;
      if (gmv === 0 && netPayout > 0) {
        gmv = netPayout + feeTotal + taxTotal;
      }
      if (gmv === 0 && feeTotal === 0 && taxTotal === 0) {
        continue;
      }

      let channelName = String(rawChannel || '').trim();
      if (!channelName) {
        const lowerHeaderJoin = headers.join(' ');
        if (lowerHeaderJoin.indexOf('settlement') !== -1 || lowerHeaderJoin.indexOf('tiktok') !== -1 || /^TT/i.test(rawCode)) {
          channelName = 'TikTok Shop';
        } else {
          channelName = 'Shopee';
        }
      }

      const isBom = isCancelledStatusText(rawStatus);
      const txObj = {
        id: 'tx_' + nowStamp + '_' + r,
        date: normalizeDateValue(rawDate),
        kind: 'platform_sale',
        channel: channelName,
        status: isBom ? 'cancelled' : 'completed',
        status_label: String(rawStatus || (isBom ? 'Đã hủy / Bom hàng' : 'Hoàn thành')).trim(),
        order_code: String(rawCode || ('Đơn #' + r)).trim(),
        gmv: gmv,
        platform_fee: isBom ? 0 : feeTotal,
        tax_withheld: isBom ? 0 : taxTotal,
        amount: gmv,
        has_valid_invoice: true,
        note: String(rawNote || (channelName + ' - ' + rawCode)).trim()
      };

      if (isBom) {
        excludedBom.push(txObj);
      } else {
        const expectedTax = Math.round(gmv * totR);
        if (gmv > 0 && taxTotal > expectedTax * rules.over_withheld_tolerance) {
          txObj.over_withheld_flag = true;
          flaggedOverWithheld.push({
            order_code: txObj.order_code,
            channel: txObj.channel,
            gmv: gmv,
            tax_withheld: taxTotal,
            expected_tax: expectedTax,
            diff: Math.round(taxTotal - expectedTax),
            actual_pct: round1((taxTotal / gmv) * 100)
          });
        }
        transactions.push(txObj);
      }
    }

    return {
      ok: true,
      transactions: transactions,
      excluded_bom: excludedBom,
      flagged_over_withheld: flaggedOverWithheld,
      total_rows_read: transactions.length + excludedBom.length
    };
  }

  /**
   * Chống lỗ hổng CSV Formula Injection (=, +, -, @, Tab, CR) khi xuất file mở trên Excel.
   */
  function sanitizeCsvCell(value) {
    let str = value == null ? '' : String(value);
    str = str.replace(/\r\n/g, ' ').replace(/[\r\n]/g, ' ');
    const trimmedStart = str.replace(/^[ \t]+/, '');
    if (/^[=+\-@\t\r]/.test(str) || /^[=+\-@]/.test(trimmedStart)) {
      str = "'" + str;
    }
    if (/[",;\n]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  function exportTransactionsToCsv(transactions, summary, rules, shopName) {
    const activeRules = mergeRules(rules);
    const lines = [];
    const pushRow = function (cols) {
      lines.push(cols.map(sanitizeCsvCell).join(','));
    };

    pushRow(['BẢNG ĐỐI SOÁT THU CHI & ƯỚC TÍNH DỰ PHÒNG THUẾ - KÉT THUẾ SHOP']);
    pushRow(['Tên cửa hàng', shopName || 'Cửa hàng của tôi', 'Căn cứ đối chiếu', activeRules.legal_basis]);
    pushRow(['Miễn trừ pháp lý', 'Số liệu dùng cho quản trị dòng tiền và đối soát nội bộ dựa trên dữ liệu bạn tự nhập. Không phải đại lý thuế, không thay thế tờ khai chính thức trên eTax Mobile. Nghiêm cấm sử dụng để che giấu hay chia nhỏ doanh thu.']);
    pushRow([]);

    if (summary) {
      pushRow(['TÓM TẮT KÉT THUẾ HIỆN TẠI', 'Số tiền (VNĐ)']);
      pushRow(['Tổng tiền bán tính mốc thuế năm nay', summary.total_taxable_gmv]);
      pushRow(['Tiền thực về ví / ngân hàng', summary.net_cash_received]);
      pushRow(['Tổng phí sàn đã trừ', summary.platform_fees_total]);
      pushRow(['Tiền thuế sàn đã trừ hộ (NĐ 117/2025)', summary.platform_withheld_actual]);
      pushRow(['Két cất đóng thuế tự khai / dự phòng', summary.vault_conservative_recommended]);
      pushRow(['Tiền thuế dư có thể đòi lại (NĐ 141/2026)', summary.refundable_platform_tax_est]);
      pushRow(['Chi phí vận hành ngoài sàn', summary.operating_expenses_other]);
      pushRow(['Tiền thật được phép xài an toàn', summary.safe_spendable_cash]);
      pushRow(['Tỷ lệ tiến sát vạch đỏ 1 tỷ (%)', formatPctVi(summary.pct_of_1b)]);
      pushRow([]);
    }

    pushRow([
      'Ngày',
      'Mã đơn / Chứng từ',
      'Loại giao dịch',
      'Kênh bán / Hạng mục',
      'Trạng thái',
      'Doanh thu tính thuế (VNĐ)',
      'Phí sàn (VNĐ)',
      'Thuế sàn trừ hộ (VNĐ)',
      'Chi phí ngoài sàn (VNĐ)',
      'Có hóa đơn hợp lệ',
      'Ghi chú'
    ]);

    const list = Array.isArray(transactions) ? transactions : [];
    for (let i = 0; i < list.length; i += 1) {
      const tx = list[i];
      const kindLabel = tx.kind === 'platform_sale'
        ? 'Bán trên sàn TMĐT'
        : (tx.kind === 'direct_sale' ? 'Bán ngoài sàn (tự khai)' : 'Chi phí vận hành');
      const statusLabel = tx.status === 'cancelled' || tx.status === 'returned'
        ? 'Đã hủy / Bom hàng (đã loại)'
        : 'Hoàn thành';
      const gmvVal = tx.kind === 'platform_sale' ? safeNumber(tx.gmv) : (tx.kind === 'direct_sale' ? safeNumber(tx.amount != null ? tx.amount : tx.gmv) : 0);
      const feeVal = tx.kind === 'platform_sale' ? safeNumber(tx.platform_fee) : 0;
      const taxVal = tx.kind === 'platform_sale' ? safeNumber(tx.tax_withheld) : 0;
      const expVal = tx.kind === 'expense' ? safeNumber(tx.amount) : 0;
      const invLabel = tx.kind === 'expense' ? (tx.has_valid_invoice ? 'Có hóa đơn' : 'Không có hóa đơn') : 'Theo đơn';

      pushRow([
        tx.date || '',
        tx.order_code || '',
        kindLabel,
        tx.channel || '',
        statusLabel,
        gmvVal,
        feeVal,
        taxVal,
        expVal,
        invLabel,
        tx.note || ''
      ]);
    }

    pushRow([]);
    pushRow(['Lưu ý cuối trang', 'Công cụ ước tính tham khảo nội bộ. Vui lòng đối chiếu chứng từ gốc và kê khai trung thực đúng hạn trên eTax Mobile theo quy định của cơ quan thuế.']);

    return '\uFEFF' + lines.join('\r\n');
  }

  function formatVnd(amount) {
    const n = Math.round(Number(amount) || 0);
    const sign = n < 0 ? '-' : '';
    const absStr = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return sign + absStr + ' đ';
  }

  function formatCompactVnd(amount) {
    const n = Number(amount) || 0;
    const sign = n < 0 ? '-' : '';
    const abs = Math.abs(n);
    if (abs >= 1000000000) {
      return sign + (abs / 1000000000).toFixed(2).replace(/\.00$/, '').replace('.', ',') + ' tỷ';
    }
    if (abs >= 1000000) {
      return sign + (abs / 1000000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + ' tr';
    }
    if (abs >= 1000) {
      return sign + Math.round(abs / 1000) + ' nghìn';
    }
    return sign + Math.round(abs) + ' đ';
  }

  function readVietnameseMoney(amount) {
    const n = Math.round(Math.abs(Number(amount) || 0));
    if (n === 0) return 'Không đồng';
    if (n >= 1000000000) {
      const ty = Math.floor(n / 1000000000);
      const trieu = Math.floor((n % 1000000000) / 1000000);
      return ty + ' tỷ' + (trieu > 0 ? ' ' + trieu + ' triệu' : '') + ' đồng';
    }
    if (n >= 1000000) {
      const trieu = Math.floor(n / 1000000);
      const nghin = Math.floor((n % 1000000) / 1000);
      return trieu + ' triệu' + (nghin > 0 ? ' ' + nghin + ' nghìn' : '') + ' đồng';
    }
    if (n >= 1000) {
      const nghin = Math.floor(n / 1000);
      const le = n % 1000;
      return nghin + ' nghìn' + (le > 0 ? ' ' + le : '') + ' đồng';
    }
    return n + ' đồng';
  }

  return {
    TAX_RULES_CONFIG_2026: TAX_RULES_CONFIG_2026,
    mergeRules: mergeRules,
    calculateHkdTaxVaultV2: calculateHkdTaxVaultV2,
    aggregateTransactions: aggregateTransactions,
    parseEcommerceCsv: parseEcommerceCsv,
    sanitizeCsvCell: sanitizeCsvCell,
    exportTransactionsToCsv: exportTransactionsToCsv,
    parseMoneyValue: parseMoneyValue,
    validatePositiveMoneyInput: validatePositiveMoneyInput,
    formatPctVi: formatPctVi,
    isCancelledStatusText: isCancelledStatusText,
    formatVnd: formatVnd,
    formatCompactVnd: formatCompactVnd,
    readVietnameseMoney: readVietnameseMoney
  };
});
