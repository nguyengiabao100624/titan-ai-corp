/* Két Thuế Shop - Điều khiển giao diện Local-First, 3 chạm, Hoàn tác 5 giây, XSS-safe */
(function () {
  'use strict';

  const Engine = window.KetThueEngine;
  if (!Engine) {
    return;
  }

  const STORAGE_KEY = 'ket_thue_shop_state_v1';

  const SAMPLE_15_CSV = [
    'Mã đơn hàng,Ngày hoàn thành,Sàn,Trạng thái đơn hàng,Tổng số tiền đơn hàng,Phí sàn,Thuế sàn đã trừ,Tiền về ví,Ghi chú sản phẩm',
    'SP260115001,2026-01-15,Shopee,Hoàn thành,48000000,8640000,720000,38640000,Lô kem dưỡng da tháng 1 (120 đơn gom)',
    'TT260208002,2026-02-08,TikTok Shop,Hoàn thành,62000000,12400000,930000,48670000,Phiên live đầu xuân mỹ phẩm nội địa',
    'SP260220003,2026-02-20,Shopee,Đã hủy - Khách bom hàng,18500000,0,0,0,Đơn bom hàng chưa giao thành công',
    'SP260312004,2026-03-12,Shopee,Hoàn thành,55000000,9900000,825000,44275000,Đơn sỉ lẻ dầu gội thảo dược tháng 3',
    'TT260405005,2026-04-05,TikTok Shop,Hoàn thành,74000000,14800000,1110000,58090000,Combo chăm sóc tóc phiên live 4/4',
    'SP260419006,2026-04-19,Shopee,Hoàn thành,42000000,7560000,4200000,30240000,Cảnh báo: Sàn trừ nhầm 10% do lệch danh mục',
    'TT260510007,2026-05-10,TikTok Shop,Trả hàng hoàn tiền,12000000,0,0,0,Khách hoàn hàng đổi mẫu',
    'SP260524008,2026-05-24,Shopee,Hoàn thành,68000000,12240000,1020000,54740000,Đợt khuyến mãi giữa năm tháng 5',
    'TT260615009,2026-06-15,TikTok Shop,Hoàn thành,79000000,15800000,1185000,62015000,Phiên live 6/6 mỹ phẩm chống nắng',
    'SP260711010,2026-07-11,Shopee,Hoàn thành,54000000,9720000,810000,43470000,Đơn hàng bán lẻ tháng 7',
    'TT260809011,2026-08-09,TikTok Shop,Hoàn thành,36000000,7200000,3600000,25200000,Cảnh báo: Sàn trừ nhầm 10% đơn dịch vụ gắn hàng',
    'SP260828012,2026-08-28,Shopee,Hoàn thành,61000000,10980000,915000,49105000,Chuẩn bị tựu trường tháng 8',
    'TT260914013,2026-09-14,TikTok Shop,Hoàn thành,58000000,11600000,870000,45530000,Phiên live 9/9 dưỡng ẩm thu đông',
    'SP261010014,2026-10-10,Shopee,Hoàn thành,64000000,11520000,960000,51520000,Phiên sale 10/10 hàng gia dụng nhỏ',
    'TT261111015,2026-11-11,TikTok Shop,Hoàn thành,73000000,14600000,1095000,57305000,Đại tiệc 11/11 đơn thành công'
  ].join('\n');

  const SECTOR_OPTIONS = [
    {
      code: 'retail_goods',
      label: 'Bán lẻ, phân phối hàng hóa (1,5%: 1% GTGT + 0,5% TNCN)',
      shortLabel: 'Bán lẻ hàng hóa (1,5%)'
    },
    {
      code: 'production_fnb_transport',
      label: 'Sản xuất, ăn uống, vận tải gắn hàng hóa (4,5%: 3% GTGT + 1,5% TNCN)',
      shortLabel: 'Sản xuất / Ăn uống / Vận tải (4,5%)'
    },
    {
      code: 'services_no_materials',
      label: 'Dịch vụ, xây dựng không bao thầu vật liệu (7,0%: 5% GTGT + 2% TNCN)',
      shortLabel: 'Dịch vụ không bao thầu vật liệu (7,0%)'
    },
    {
      code: 'other_business',
      label: 'Hoạt động kinh doanh khác (3,0%: 2% GTGT + 1% TNCN)',
      shortLabel: 'Hoạt động kinh doanh khác (3,0%)'
    }
  ];

  const defaultState = {
    shopName: 'Cửa hàng của tôi',
    sectorCode: 'retail_goods',
    theme: 'light',
    legalAccepted: false,
    rules: {
      exempt_threshold_vnd: Engine.TAX_RULES_CONFIG_2026.exempt_threshold_vnd,
      profit_method_threshold_vnd: Engine.TAX_RULES_CONFIG_2026.profit_method_threshold_vnd
    },
    transactions: []
  };

  let state = loadState();
  let activeTab = 'overview';
  let activeFilter = 'all';
  let searchQuery = '';
  let pendingCsvResult = null;
  let undoSnapshot = null;
  let undoTimerId = null;
  let undoCountdownId = null;
  let activeModalReturnFocus = null;
  let activeTxKind = 'direct_sale';
  let userEditedTaxManually = false;

  const $ = function (id) { return document.getElementById(id); };

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneDefault();
      const parsed = JSON.parse(raw);
      return {
        shopName: typeof parsed.shopName === 'string' && parsed.shopName.trim() ? parsed.shopName.trim() : defaultState.shopName,
        sectorCode: Engine.TAX_RULES_CONFIG_2026.sectors[parsed.sectorCode] ? parsed.sectorCode : defaultState.sectorCode,
        theme: parsed.theme === 'dark' ? 'dark' : 'light',
        legalAccepted: Boolean(parsed.legalAccepted),
        rules: {
          exempt_threshold_vnd: Number(parsed.rules && parsed.rules.exempt_threshold_vnd) > 0
            ? Math.round(Number(parsed.rules.exempt_threshold_vnd))
            : defaultState.rules.exempt_threshold_vnd,
          profit_method_threshold_vnd: Number(parsed.rules && parsed.rules.profit_method_threshold_vnd) > 0
            ? Math.round(Number(parsed.rules.profit_method_threshold_vnd))
            : defaultState.rules.profit_method_threshold_vnd
        },
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : []
      };
    } catch (_err) {
      return cloneDefault();
    }
  }

  function cloneDefault() {
    return {
      shopName: defaultState.shopName,
      sectorCode: defaultState.sectorCode,
      theme: defaultState.theme,
      legalAccepted: defaultState.legalAccepted,
      rules: Object.assign({}, defaultState.rules),
      transactions: []
    };
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_err) {
      // Bỏ qua nếu trình duyệt chặn lưu trữ cục bộ
    }
  }

  function todayIso() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function formatMoneyInputString(num) {
    const n = Math.round(Math.abs(Number(num) || 0));
    if (n === 0) return '';
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    state.theme = isDark ? 'dark' : 'light';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    const btn = $('btn-theme-toggle');
    const txt = $('theme-toggle-text');
    const iconUse = $('theme-icon-svg').querySelector('use');
    if (btn) btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    if (txt) txt.textContent = isDark ? 'Sáng' : 'Tối';
    if (iconUse) iconUse.setAttribute('href', isDark ? '#i-sun' : '#i-moon');
    saveState();
  }

  function handleUrlHandoff() {
    try {
      const params = new URLSearchParams(window.location.search);
      const sectorParam = params.get('sector');
      const gmvParam = Engine.parseMoneyValue(params.get('gmv') || params.get('platform') || params.get('san') || '');
      const directParam = Engine.parseMoneyValue(params.get('direct') || params.get('ngoaisan') || '');
      const feeParam = Engine.parseMoneyValue(params.get('fee') || params.get('phisan') || '');
      const demoParam = params.get('demo');

      if (sectorParam && Engine.TAX_RULES_CONFIG_2026.sectors[sectorParam]) {
        state.sectorCode = sectorParam;
      }

      if (demoParam === '15') {
        loadSample15(true);
        return;
      }

      if (gmvParam > 0 || directParam > 0) {
        const shopParam = (params.get('shop') || '').trim();
        state.shopName = shopParam || 'Cửa hàng ước tính (từ Máy tính nhanh)';
        const sec = Engine.TAX_RULES_CONFIG_2026.sectors[state.sectorCode];
        const rate = sec.vat + sec.pit;
        const imported = [];
        const today = todayIso();
        if (gmvParam > 0) {
          let estFee = Math.round(gmvParam * 0.18);
          if (feeParam > 0 && feeParam <= 100) {
            estFee = Math.round(gmvParam * (feeParam / 100));
          } else if (feeParam > 100) {
            estFee = feeParam;
          }
          imported.push({
            id: 'handoff_platform_' + Date.now(),
            date: today,
            kind: 'platform_sale',
            channel: 'Shopee / TikTok Shop',
            status: 'completed',
            order_code: 'UOC-TINH-SAN',
            gmv: gmvParam,
            platform_fee: estFee,
            tax_withheld: Math.round(gmvParam * rate),
            amount: gmvParam,
            has_valid_invoice: true,
            note: 'Số liệu doanh thu sàn mang sang từ máy tính nhanh'
          });
        }
        if (directParam > 0) {
          imported.push({
            id: 'handoff_direct_' + (Date.now() + 1),
            date: today,
            kind: 'direct_sale',
            channel: 'Facebook / Zalo / Tại quầy',
            status: 'completed',
            order_code: 'UOC-TINH-NGOAI',
            gmv: directParam,
            platform_fee: 0,
            tax_withheld: 0,
            amount: directParam,
            has_valid_invoice: true,
            note: 'Số liệu doanh thu ngoài sàn mang sang từ máy tính nhanh'
          });
        }
        state.transactions = imported;
        saveState();

        const banner = $('handoff-banner');
        const desc = $('handoff-banner-desc');
        if (banner && desc) {
          banner.hidden = false;
          desc.textContent = 'Đã nhận doanh thu sàn ' + Engine.formatVnd(gmvParam) + ' và ngoài sàn ' + Engine.formatVnd(directParam) + ' từ công cụ tính nhanh. Bạn có thể bấm Sửa hoặc nạp thêm tệp CSV Shopee/TikTok bất cứ lúc nào.';
        }
      }
    } catch (_err) {
      // Bỏ qua nếu URL không có tham số hợp lệ
    }
  }

  /* ========================================================================
     Custom Accessible Listbox (2 bộ chọn đồng bộ, đầy đủ phím mũi tên)
     ======================================================================== */

  function initCustomListboxes() {
    const wraps = document.querySelectorAll('.listbox-wrap');
    wraps.forEach(function (wrap) {
      const trigger = wrap.querySelector('.listbox-trigger');
      const menu = wrap.querySelector('.listbox-menu');
      if (!trigger || !menu) return;

      menu.textContent = '';
      SECTOR_OPTIONS.forEach(function (opt, idx) {
        const li = document.createElement('li');
        li.className = 'listbox-option';
        li.setAttribute('role', 'option');
        li.setAttribute('id', wrap.dataset.listbox + '-opt-' + idx);
        li.setAttribute('data-value', opt.code);
        li.setAttribute('aria-selected', opt.code === state.sectorCode ? 'true' : 'false');

        const span = document.createElement('span');
        span.textContent = opt.label;
        li.appendChild(span);

        const checkIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        checkIcon.setAttribute('class', 'icon-sm');
        checkIcon.setAttribute('aria-hidden', 'true');
        const useEl = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        useEl.setAttribute('href', '#i-check');
        checkIcon.appendChild(useEl);
        checkIcon.style.visibility = opt.code === state.sectorCode ? 'visible' : 'hidden';
        li.appendChild(checkIcon);

        li.addEventListener('click', function () {
          selectSector(opt.code);
          closeListbox(trigger, menu);
          trigger.focus();
        });

        menu.appendChild(li);
      });

      trigger.addEventListener('click', function () {
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        closeAllListboxes();
        if (!expanded) {
          openListbox(trigger, menu);
        }
      });

      trigger.addEventListener('keydown', function (e) {
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        const items = Array.from(menu.querySelectorAll('[role="option"]'));
        const currentIdx = Math.max(0, items.findIndex(function (el) {
          return el.classList.contains('is-active') || el.getAttribute('aria-selected') === 'true';
        }));

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (!expanded) {
            openListbox(trigger, menu);
            setActiveOption(items, currentIdx);
          } else {
            const nextIdx = e.key === 'ArrowDown'
              ? (currentIdx + 1) % items.length
              : (currentIdx - 1 + items.length) % items.length;
            setActiveOption(items, nextIdx);
          }
        } else if (e.key === 'Home' && expanded) {
          e.preventDefault();
          setActiveOption(items, 0);
        } else if (e.key === 'End' && expanded) {
          e.preventDefault();
          setActiveOption(items, items.length - 1);
        } else if ((e.key === 'Enter' || e.key === ' ') && expanded) {
          e.preventDefault();
          const active = items[currentIdx];
          if (active) {
            selectSector(active.getAttribute('data-value'));
          }
          closeListbox(trigger, menu);
        } else if (e.key === 'Escape' && expanded) {
          e.preventDefault();
          closeListbox(trigger, menu);
        }
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.listbox-wrap')) {
        closeAllListboxes();
      }
    });
  }

  function setActiveOption(items, idx) {
    items.forEach(function (el, i) {
      el.classList.toggle('is-active', i === idx);
    });
  }

  function openListbox(trigger, menu) {
    trigger.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    const items = Array.from(menu.querySelectorAll('[role="option"]'));
    const selIdx = Math.max(0, items.findIndex(function (el) { return el.getAttribute('aria-selected') === 'true'; }));
    setActiveOption(items, selIdx);
  }

  function closeListbox(trigger, menu) {
    trigger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  }

  function closeAllListboxes() {
    document.querySelectorAll('.listbox-wrap').forEach(function (wrap) {
      const trigger = wrap.querySelector('.listbox-trigger');
      const menu = wrap.querySelector('.listbox-menu');
      if (trigger && menu) closeListbox(trigger, menu);
    });
  }

  function selectSector(code) {
    if (!Engine.TAX_RULES_CONFIG_2026.sectors[code]) return;
    state.sectorCode = code;
    saveState();
    syncListboxDisplays();
    renderAll();
    const found = SECTOR_OPTIONS.find(function (o) { return o.code === code; });
    showToast('Đã chuyển ngành nghề sang: ' + (found ? found.shortLabel : code), false);
  }

  function syncListboxDisplays() {
    const found = SECTOR_OPTIONS.find(function (o) { return o.code === state.sectorCode; }) || SECTOR_OPTIONS[0];
    const ovVal = $('overview-sector-value');
    const stVal = $('settings-sector-value');
    if (ovVal) ovVal.textContent = found.label;
    if (stVal) stVal.textContent = found.label;

    document.querySelectorAll('.listbox-option').forEach(function (li) {
      const isSel = li.getAttribute('data-value') === state.sectorCode;
      li.setAttribute('aria-selected', isSel ? 'true' : 'false');
      const svg = li.querySelector('svg');
      if (svg) svg.style.visibility = isSel ? 'visible' : 'hidden';
    });
  }

  /* ========================================================================
     Tab Navigation
     ======================================================================== */

  function switchTab(tabName) {
    activeTab = tabName;
    const tabs = ['overview', 'ledger', 'radar', 'reports'];
    tabs.forEach(function (name) {
      const btn = $('tab-btn-' + name);
      const panel = $('panel-' + name);
      const selected = name === tabName;
      if (btn) btn.setAttribute('aria-selected', selected ? 'true' : 'false');
      if (panel) panel.hidden = !selected;
    });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* ========================================================================
     3 Hồ sơ dùng thử 1 chạm
     ======================================================================== */

  function loadSample15(silent) {
    const parsed = Engine.parseEcommerceCsv(SAMPLE_15_CSV, state.sectorCode, state.rules);
    if (!parsed.ok) return;
    const prev = state.transactions.slice();
    state.shopName = 'Shop Mỹ Phẩm Cô Lan (Mẫu 15 đơn)';
    state.sectorCode = 'retail_goods';
    state.transactions = parsed.transactions.concat(parsed.excluded_bom);
    // Thêm 2 khoản chi nhập hàng thực tế để con số "Tiền thật được phép xài" chân thực
    state.transactions.push(
      {
        id: 'sample_exp_1',
        date: '2026-04-10',
        kind: 'expense',
        channel: 'Nhập hàng mỹ phẩm (có hóa đơn)',
        status: 'completed',
        order_code: 'HD-NHAP-01',
        amount: 210000000,
        has_valid_invoice: true,
        note: 'Lô nhập hàng Quý 1 và Quý 2 có hóa đơn đỏ'
      },
      {
        id: 'sample_exp_2',
        date: '2026-09-05',
        kind: 'expense',
        channel: 'Bao bì, băng keo và đóng gói',
        status: 'completed',
        order_code: 'CHI-DONG-GOI',
        amount: 65000000,
        has_valid_invoice: false,
        note: 'Chi phí hộp carton, túi chống sốc và công đóng gói'
      }
    );
    saveState();
    syncListboxDisplays();
    syncSettingsInputs();
    renderAll();
    if (!silent) {
      registerUndo(prev, 'Đã nạp 15 đơn mẫu Shopee/TikTok (tự loại 2 đơn bom hàng, bắt 2 đơn sàn trừ nhầm 10%).');
    }
  }

  function loadPreset850m() {
    const prev = state.transactions.slice();
    state.shopName = 'Shop Thời Trang Anh Minh (850 triệu)';
    state.sectorCode = 'retail_goods';
    state.transactions = [
      { id: 'p850_1', date: '2026-02-15', kind: 'platform_sale', channel: 'Shopee', status: 'completed', order_code: 'SP-Q1-850', gmv: 190000000, platform_fee: 34200000, tax_withheld: 2850000, amount: 190000000, has_valid_invoice: true, note: 'Doanh thu Shopee Quý 1' },
      { id: 'p850_2', date: '2026-05-20', kind: 'platform_sale', channel: 'TikTok Shop', status: 'completed', order_code: 'TT-Q2-850', gmv: 210000000, platform_fee: 37800000, tax_withheld: 3150000, amount: 210000000, has_valid_invoice: true, note: 'Doanh thu TikTok Shop Quý 2' },
      { id: 'p850_3', date: '2026-08-25', kind: 'platform_sale', channel: 'Shopee', status: 'completed', order_code: 'SP-Q3-850', gmv: 200000000, platform_fee: 36000000, tax_withheld: 3000000, amount: 200000000, has_valid_invoice: true, note: 'Doanh thu Shopee Quý 3' },
      { id: 'p850_4', date: '2026-09-18', kind: 'direct_sale', channel: 'Facebook / Zalo', status: 'completed', order_code: 'FB-ZALO-01', amount: 130000000, gmv: 130000000, platform_fee: 0, tax_withheld: 0, has_valid_invoice: true, note: 'Đơn khách quen chuyển khoản Zalo' },
      { id: 'p850_5', date: '2026-10-22', kind: 'direct_sale', channel: 'Bán tại cửa hàng', status: 'completed', order_code: 'QUAY-02', amount: 120000000, gmv: 120000000, platform_fee: 0, tax_withheld: 0, has_valid_invoice: true, note: 'Bán trực tiếp tại cửa hàng tháng 10' },
      { id: 'p850_6', date: '2026-07-05', kind: 'expense', channel: 'Nhập hàng sỉ', status: 'completed', order_code: 'CHI-NHAP-850', amount: 520000000, has_valid_invoice: true, note: 'Tổng vốn nhập hàng và vận hành' }
    ];
    saveState();
    syncListboxDisplays();
    syncSettingsInputs();
    renderAll();
    registerUndo(prev, 'Đã nạp hồ sơ mẫu Shop 850 triệu (cảnh báo đỏ 85% mốc 1 tỷ và 9 triệu thuế dư đòi hoàn).');
  }

  function loadPreset3b6() {
    const prev = state.transactions.slice();
    state.shopName = 'Tổng Kho Gia Dụng Chị Hương (3,6 tỷ)';
    state.sectorCode = 'retail_goods';
    state.transactions = [
      { id: 'p36_1', date: '2026-03-10', kind: 'platform_sale', channel: 'Shopee', status: 'completed', order_code: 'SP-Q1-3B6', gmv: 950000000, platform_fee: 171000000, tax_withheld: 14250000, amount: 950000000, has_valid_invoice: true, note: 'Doanh thu sàn Shopee nửa đầu năm' },
      { id: 'p36_2', date: '2026-08-18', kind: 'platform_sale', channel: 'TikTok Shop', status: 'completed', order_code: 'TT-Q3-3B6', gmv: 1050000000, platform_fee: 189000000, tax_withheld: 15750000, amount: 1050000000, has_valid_invoice: true, note: 'Doanh thu phiên live TikTok Shop' },
      { id: 'p36_3', date: '2026-06-15', kind: 'direct_sale', channel: 'Khách sỉ chuyển khoản', status: 'completed', order_code: 'SI-Q2-3B6', amount: 800000000, gmv: 800000000, platform_fee: 0, tax_withheld: 0, has_valid_invoice: true, note: 'Bán buôn khách tỉnh chuyển khoản' },
      { id: 'p36_4', date: '2026-10-28', kind: 'direct_sale', channel: 'Khách sỉ và Zalo', status: 'completed', order_code: 'SI-Q4-3B6', amount: 800000000, gmv: 800000000, platform_fee: 0, tax_withheld: 0, has_valid_invoice: true, note: 'Đơn ngoài sàn cuối năm' },
      { id: 'p36_5', date: '2026-05-12', kind: 'expense', channel: 'Nhập hàng có hóa đơn đỏ', status: 'completed', order_code: 'HD-NHAP-2B04', amount: 2040000000, has_valid_invoice: true, note: 'Hóa đơn điện tử nhập kho chính ngạch' },
      { id: 'p36_6', date: '2026-09-20', kind: 'expense', channel: 'Chi phí thuê kho, đóng gói thiếu hóa đơn', status: 'completed', order_code: 'CHI-KHONG-HD', amount: 350000000, has_valid_invoice: false, note: 'Chi tiền mặt chưa lấy hóa đơn đầu vào' }
    ];
    saveState();
    syncListboxDisplays();
    syncSettingsInputs();
    renderAll();
    registerUndo(prev, 'Đã nạp hồ sơ Shop 3,6 tỷ (vượt mốc 3 tỷ, cảnh báo thiếu 350 triệu hóa đơn làm tăng 59,5 triệu thuế TNCN).');
  }

  /* ========================================================================
     Render Toàn bộ Giao diện (100% textContent - chống XSS)
     ======================================================================== */

  function renderAll() {
    const summary = Engine.aggregateTransactions(state.transactions, state.sectorCode, state.rules);

    const legalBanner = $('onboarding-legal-banner');
    if (legalBanner) legalBanner.hidden = Boolean(state.legalAccepted);

    const shopLabel = $('header-shop-label');
    if (shopLabel) shopLabel.textContent = state.shopName + ' · Lưu riêng trên máy bạn';

    const titleEl = $('overview-title');
    if (titleEl) titleEl.textContent = 'Két tiền ' + state.shopName;

    const regimeEl = $('overview-regime-text');
    if (regimeEl) regimeEl.textContent = 'Chế độ hiện tại: ' + summary.regime + '.';

    // 1. Số dẫn đầu: Tiền thật được phép xài
    const safeCashEl = $('metric-safe-cash');
    if (safeCashEl) {
      safeCashEl.textContent = Engine.formatVnd(summary.safe_spendable_cash);
      safeCashEl.classList.toggle('hero-amount-negative', summary.safe_spendable_cash < 0);
    }

    // Badge trạng thái & lời khuyên 1 câu đời thường
    const statusInfo = buildStatusInfo(summary);
    const badgeEl = $('hero-status-badge');
    if (badgeEl) {
      badgeEl.className = 'badge ' + statusInfo.badgeClass;
      badgeEl.textContent = statusInfo.shortBadge;
    }
    const verdictEl = $('hero-verdict');
    if (verdictEl) {
      verdictEl.textContent = state.transactions.length === 0
        ? 'Sổ đang trống. Hãy bấm Ghi thu chi nhanh (3 chạm) hoặc bấm Nạp dữ liệu mẫu 15 đơn Shopee/TikTok để xem ngay kết quả trong 2 giây.'
        : statusInfo.verdict;
    }

    // Chi tiết từng đồng (Chị Hương 38t)
    $('bd-total-gmv').textContent = Engine.formatVnd(summary.total_taxable_gmv);
    $('bd-platform-fees').textContent = '-' + Engine.formatVnd(summary.platform_fees_total);
    $('bd-platform-tax').textContent = '-' + Engine.formatVnd(summary.platform_withheld_actual);
    $('bd-net-cash').textContent = Engine.formatVnd(summary.net_cash_received);
    $('bd-expenses').textContent = '-' + Engine.formatVnd(summary.operating_expenses_other);
    $('bd-vault-self').textContent = '-' + Engine.formatVnd(summary.vault_conservative_recommended);
    $('bd-safe-cash').textContent = Engine.formatVnd(summary.safe_spendable_cash);

    // 2. Thẻ phụ A: Tiền thực về ví
    $('metric-net-cash').textContent = Engine.formatVnd(summary.net_cash_received);
    $('meta-taxable-gmv').textContent = Engine.formatVnd(summary.total_taxable_gmv);
    $('meta-platform-fees').textContent = Engine.formatVnd(summary.platform_fees_total);
    $('meta-bom-excluded').textContent = summary.excluded_bom_count + ' đơn (' + Engine.formatCompactVnd(summary.excluded_bom_gmv) + ')';

    // 3. Thẻ phụ B: Két cất đóng thuế / hoặc Tiền thuế dư được hoàn
    const vaultHeading = $('metric-vault-heading');
    const vaultAmount = $('metric-vault-amount');
    if (summary.refundable_platform_tax_est > 0 && summary.vault_conservative_recommended === 0) {
      vaultHeading.textContent = 'Tiền thuế dư có thể đòi lại (NĐ 141)';
      vaultAmount.textContent = '+' + Engine.formatVnd(summary.refundable_platform_tax_est);
      vaultAmount.className = 'support-amount tabular meta-val-safe';
    } else {
      vaultHeading.textContent = 'Két cất đóng thuế';
      vaultAmount.textContent = Engine.formatVnd(summary.vault_conservative_recommended);
      vaultAmount.className = 'support-amount tabular';
    }
    $('meta-platform-withheld').textContent = Engine.formatVnd(summary.platform_withheld_actual);
    $('meta-refundable-tax').textContent = Engine.formatVnd(summary.refundable_platform_tax_est);
    $('meta-self-vault').textContent = Engine.formatVnd(summary.vault_conservative_recommended);

    // Cảnh báo sàn trừ nhầm 10%
    const overAlert = $('over-withheld-alert');
    const overDesc = $('over-withheld-desc');
    if (summary.over_withheld_10pct_alert) {
      overAlert.hidden = false;
      const flaggedCodes = summary.flagged_over_withheld_orders.map(function (o) {
        return o.order_code + ' (trừ ' + Engine.formatPctVi(o.actual_pct) + ', thừa ' + Engine.formatVnd(o.diff) + ')';
      });
      const detailText = flaggedCodes.length > 0
        ? 'Các đơn bị trừ cao bất thường: ' + flaggedCodes.join('; ') + '. '
        : '';
      overDesc.textContent = detailText + 'Tổng tiền thuế sàn đang trừ vượt mức chuẩn ngành (' + Engine.formatPctVi((summary.total_rate * 100).toFixed(1)) + ') ước tính khoảng ' + Engine.formatVnd(summary.over_withheld_diff) + '. Bạn nên kiểm tra lại ngành hàng khai báo trên Kênh Người Bán và lưu bảng đối soát để đề nghị hoàn thuế.';
    } else {
      overAlert.hidden = true;
    }

    // Thanh Radar trên Tổng quan & tab Radar thuế
    renderRadar(summary, statusInfo);
    renderCumulativeChart(summary);
    renderLedgerList(summary);
  }

  function buildStatusInfo(s) {
    const t1Str = Engine.formatCompactVnd(s.exempt_threshold_vnd);
    const t2Str = Engine.formatCompactVnd(s.profit_method_threshold_vnd);
    switch (s.alert_level) {
      case 'CRITICAL_OVER_3B':
        return {
          badgeClass: 'badge-alert',
          boxClass: 'notice-box-alert',
          barClass: 'meter-fill-alert',
          shortBadge: 'Vượt mốc ' + t2Str + ' (tính theo lợi nhuận)',
          verdict: 'Doanh thu tính thuế đã đạt ' + Engine.formatCompactVnd(s.total_taxable_gmv) + ', vượt mốc ' + t2Str + '. Cần cất ' + Engine.formatVnd(s.vault_conservative_recommended) + ' vào két thuế.' + (s.missing_invoice_tax_penalty_est > 0 ? ' Cảnh báo: ' + Engine.formatCompactVnd(s.missing_invoice_expenses) + ' chi phí thiếu hóa đơn đang làm tăng thuế TNCN thêm ' + Engine.formatVnd(s.missing_invoice_tax_penalty_est) + '.' : ''),
          guidanceHead: 'Chế độ bảo vệ biên lãi (vượt mốc ' + t2Str + ')',
          guidanceBody: 'Theo NĐ 68/2026, trên mốc ' + t2Str + ' bạn tính thuế TNCN 17% trên lợi nhuận (Doanh thu trừ Chi phí có hóa đơn hợp lệ, bao gồm cả hóa đơn phí sàn Shopee/TikTok). Hãy lấy đủ hóa đơn đầu vào cho mọi khoản nhập hàng.'
        };
      case 'WARN_NEAR_3B':
        return {
          badgeClass: 'badge-warn',
          boxClass: 'notice-box-warn',
          barClass: 'meter-fill-warn',
          shortBadge: 'Đạt ' + Engine.formatPctVi(s.pct_of_3b) + ' mốc ' + t2Str,
          verdict: 'Shop đã vượt mốc ' + t1Str + ' và đang tiến sát mốc ' + t2Str + ' (còn ' + Engine.formatCompactVnd(s.remaining_to_t2) + '). Hãy bắt đầu giữ toàn bộ hóa đơn đầu vào từ bây giờ để không bị đóng thuế 17% oan khi chạm ' + t2Str + '.',
          guidanceHead: 'Cảnh báo gom hóa đơn đầu vào (đạt trên 80% mốc ' + t2Str + ')',
          guidanceBody: 'Bạn đã ở chế độ kê khai theo quý và bắt buộc dùng hóa đơn điện tử máy tính tiền. Khi sắp vượt ' + t2Str + ', việc lưu hóa đơn đầu vào hợp lệ quyết định trực tiếp số thuế TNCN phải nộp.'
        };
      case 'OVER_1B_EINVOICE_30DAYS':
        return {
          badgeClass: 'badge-alert',
          boxClass: 'notice-box-alert',
          barClass: 'meter-fill-alert',
          shortBadge: 'Đã vượt vạch đỏ ' + t1Str + ' (bắt buộc HĐĐT)',
          verdict: 'Doanh thu tính thuế (chưa trừ phí sàn) là ' + Engine.formatCompactVnd(s.total_taxable_gmv) + ', đã vượt mốc ' + t1Str + '. Bạn cần đăng ký hóa đơn điện tử máy tính tiền trong vòng 30 ngày và cất ' + Engine.formatVnd(s.vault_conservative_recommended) + ' cho phần tự khai.' + (s.refundable_platform_tax_est > 0 ? ' Sàn đã trừ dư ' + Engine.formatVnd(s.refundable_platform_tax_est) + ' có thể bù trừ/hoàn.' : ''),
          guidanceHead: 'Kích hoạt chế độ kê khai quý và hóa đơn máy tính tiền (NĐ 70/2025)',
          guidanceBody: 'Lưu ý quan trọng: Doanh thu tính mốc ' + t1Str + ' tính trên giá bán trước phí sàn. Theo NĐ 141/2026, thuế GTGT tính trên 100% doanh thu, còn thuế TNCN theo tỷ lệ % chỉ tính trên phần doanh thu vượt mốc ' + t1Str + '.'
        };
      case 'RED_NEAR_1B':
        return {
          badgeClass: 'badge-alert',
          boxClass: 'notice-box-alert',
          barClass: 'meter-fill-alert',
          shortBadge: 'Đỏ: Đạt ' + Engine.formatPctVi(s.pct_of_1b) + ' vạch ' + t1Str,
          verdict: 'Chỉ còn cách vạch đỏ ' + t1Str + ' đúng ' + Engine.formatCompactVnd(s.remaining_to_t1) + '. Hệ thống tạm khoanh dự phòng ' + Engine.formatVnd(s.vault_conservative_recommended) + ' để bạn không bị sốc tiền mặt. Nếu chốt cả năm từ ' + t1Str + ' trở xuống, bạn có quyền đề nghị hoàn ' + Engine.formatVnd(s.refundable_platform_tax_est) + ' thuế sàn đã trừ hộ.',
          guidanceHead: 'Sắp chạm vạch đỏ ' + t1Str + ' (đã đạt từ 85% trở lên)',
          guidanceBody: 'Hãy tìm hiểu sẵn nhà cung cấp hóa đơn điện tử máy tính tiền để kịp đăng ký trong hạn 30 ngày ngay khi tổng doanh thu vượt ' + t1Str + ', tránh rủi ro bị phạt 5 đến 10 triệu đồng theo NĐ 125/2020.'
        };
      case 'AMBER_WATCH_1B':
        return {
          badgeClass: 'badge-warn',
          boxClass: 'notice-box-warn',
          barClass: 'meter-fill-warn',
          shortBadge: 'Vàng: Đạt ' + Engine.formatPctVi(s.pct_of_1b) + ' mốc ' + t1Str,
          verdict: 'Doanh thu tính thuế đã đạt ' + Engine.formatCompactVnd(s.total_taxable_gmv) + ' (còn ' + Engine.formatCompactVnd(s.remaining_to_t1) + ' nữa chạm vạch đỏ ' + t1Str + '). Hiện vẫn thuộc diện miễn thuế NĐ 141/2026 và có thể đối soát đòi hoàn ' + Engine.formatVnd(s.refundable_platform_tax_est) + ' tiền thuế sàn đang giữ hộ.',
          guidanceHead: 'Mức theo dõi vàng (70% đến 84% mốc ' + t1Str + ')',
          guidanceBody: 'Chủ shop nên theo dõi sát doanh thu bán trên sàn (trước phí sàn) cộng với doanh thu chuyển khoản ngoài sàn. Hệ thống tạm khoanh nhẹ phần dự phòng ngoài sàn để bạn chủ động dòng tiền.'
        };
      default:
        return {
          badgeClass: 'badge-safe',
          boxClass: 'notice-box-safe',
          barClass: '',
          shortBadge: 'An toàn (' + Engine.formatPctVi(s.pct_of_1b) + ' mốc ' + t1Str + ')',
          verdict: 'Shop đang trong vùng miễn thuế (còn cách vạch ' + t1Str + ' là ' + Engine.formatCompactVnd(s.remaining_to_t1) + ').' + (s.refundable_platform_tax_est > 0 ? ' Cuối năm nếu tổng doanh thu vẫn từ ' + t1Str + ' trở xuống, bạn có quyền làm hồ sơ đòi hoàn khoảng ' + Engine.formatVnd(s.refundable_platform_tax_est) + ' tiền thuế sàn đã tạm trừ.' : ' Bạn chưa phải cất tiền thuế tự khai.'),
          guidanceHead: 'Vùng xanh an toàn (dưới 70% mốc miễn thuế ' + t1Str + ')',
          guidanceBody: 'Theo NĐ 141/2026, hộ kinh doanh có tổng doanh thu năm từ ' + t1Str + ' trở xuống được miễn thuế GTGT và TNCN, chỉ cần ghi sổ đầy đủ và gửi thông báo doanh thu năm chậm nhất ngày 31/01 năm sau.'
        };
    }
  }

  function renderRadar(s, statusInfo) {
    const t1Str = Engine.formatCompactVnd(s.exempt_threshold_vnd);
    const t2Str = Engine.formatCompactVnd(s.profit_method_threshold_vnd);

    $('radar-pill-overview').className = 'badge tabular ' + statusInfo.badgeClass;
    $('radar-pill-overview').textContent = Engine.formatPctVi(s.pct_of_1b) + ' mốc ' + t1Str;

    $('meter-1b-label').textContent = 'Vạch đỏ ' + t1Str + ' (Hóa đơn máy tính tiền NĐ 70/2025)';
    $('meter-1b-numbers').textContent = Engine.formatCompactVnd(s.total_taxable_gmv) + ' / ' + t1Str + ' (' + Engine.formatPctVi(s.pct_of_1b) + ')';
    const pct1Clamped = Math.min(100, Math.max(0, s.pct_of_1b));
    const fill1 = $('meter-1b-fill');
    fill1.style.width = pct1Clamped + '%';
    fill1.className = 'meter-fill ' + statusInfo.barClass;
    $('meter-1b-track').setAttribute('aria-valuenow', String(Math.round(pct1Clamped)));

    $('meter-3b-label').textContent = 'Mốc ' + t2Str + ' (Tính TNCN 17% theo lợi nhuận có hóa đơn)';
    $('meter-3b-numbers').textContent = Engine.formatCompactVnd(s.total_taxable_gmv) + ' / ' + t2Str + ' (' + Engine.formatPctVi(s.pct_of_3b) + ')';
    const pct3Clamped = Math.min(100, Math.max(0, s.pct_of_3b));
    const fill3 = $('meter-3b-fill');
    fill3.style.width = pct3Clamped + '%';
    fill3.className = 'meter-fill ' + (s.pct_of_3b >= 100 ? 'meter-fill-alert' : (s.pct_of_3b >= 80 ? 'meter-fill-warn' : ''));
    $('meter-3b-track').setAttribute('aria-valuenow', String(Math.round(pct3Clamped)));

    $('radar-short-advice').textContent = statusInfo.guidanceHead + ': ' + statusInfo.guidanceBody;

    // Tab 3 chi tiết
    $('radar-detail-regime').textContent = s.regime;
    $('radar-detail-badge').className = 'badge ' + statusInfo.badgeClass;
    $('radar-detail-badge').textContent = statusInfo.shortBadge;
    $('radar-guidance-box').className = 'notice-box ' + statusInfo.boxClass;
    $('radar-guidance-heading').textContent = statusInfo.guidanceHead;
    $('radar-guidance-body').textContent = statusInfo.guidanceBody;

    $('radar-rem-1b').textContent = s.remaining_to_t1 > 0 ? Engine.formatVnd(s.remaining_to_t1) : 'Đã vượt mốc ' + t1Str;
    $('radar-rem-3b').textContent = s.remaining_to_t2 > 0 ? Engine.formatVnd(s.remaining_to_t2) : 'Đã vượt mốc ' + t2Str;
    $('radar-gmv-gap').textContent = Engine.formatVnd(s.gmv_vs_net_gap) + ' (phí sàn + thuế sàn trừ)';
    $('radar-missing-inv').textContent = Engine.formatVnd(s.missing_invoice_expenses);
    $('radar-missing-inv-tax').textContent = Engine.formatVnd(s.missing_invoice_tax_penalty_est);
  }

  function renderCumulativeChart(summary) {
    const svg = $('cumulative-chart-svg');
    if (!svg) return;
    svg.textContent = '';

    const series = summary.monthly_series || [];
    const t1 = summary.exempt_threshold_vnd;
    const maxCum = series.reduce(function (mx, p) { return Math.max(mx, p.cumulative); }, 0);
    const yMax = Math.max(t1 * 1.15, maxCum * 1.12, 100000000);

    const W = 680;
    const H = 250;
    const padL = 62;
    const padR = 16;
    const padT = 22;
    const padB = 34;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const svgNS = 'http://www.w3.org/2000/svg';
    function makeEl(tag, attrs, text) {
      const el = document.createElementNS(svgNS, tag);
      Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, String(attrs[k])); });
      if (text != null) el.textContent = text;
      return el;
    }

    // Lưới ngang 3 mức
    [0, 0.5, 1].forEach(function (ratio) {
      const y = padT + plotH * (1 - ratio);
      svg.appendChild(makeEl('line', {
        x1: padL, y1: y, x2: W - padR, y2: y,
        stroke: 'var(--color-border-subtle)', 'stroke-width': 1
      }));
      svg.appendChild(makeEl('text', {
        x: padL - 8, y: y + 4,
        'text-anchor': 'end', fill: 'var(--color-text-muted)', 'font-size': 11
      }, Engine.formatCompactVnd(yMax * ratio)));
    });

    // Đường vạch đỏ ngưỡng 1 tỷ
    const t1Y = padT + plotH * (1 - Math.min(1, t1 / yMax));
    svg.appendChild(makeEl('line', {
      x1: padL, y1: t1Y, x2: W - padR, y2: t1Y,
      stroke: 'var(--color-alert-bar)', 'stroke-width': 1.5, 'stroke-dasharray': '6 4'
    }));
    svg.appendChild(makeEl('text', {
      x: W - padR, y: Math.max(14, t1Y - 6),
      'text-anchor': 'end', fill: 'var(--color-alert-text)', 'font-size': 11, 'font-weight': 700
    }, 'Vạch đỏ ' + Engine.formatCompactVnd(t1) + ' (HĐĐT)'));

    // 12 cột lũy kế
    const step = plotW / 12;
    const barW = Math.max(14, step - 14);
    series.forEach(function (pt, idx) {
      const x = padL + idx * step + (step - barW) / 2;
      const barH = Math.max(pt.cumulative > 0 ? 3 : 0, (pt.cumulative / yMax) * plotH);
      const y = padT + plotH - barH;
      let fill = 'var(--color-safe-bar)';
      if (pt.cumulative >= t1 * 0.85) fill = 'var(--color-alert-bar)';
      else if (pt.cumulative >= t1 * 0.70) fill = 'var(--color-warn-bar)';

      svg.appendChild(makeEl('rect', {
        x: x, y: y, width: barW, height: barH, rx: 4,
        fill: fill
      }));
      svg.appendChild(makeEl('text', {
        x: x + barW / 2, y: H - 12,
        'text-anchor': 'middle', fill: 'var(--color-text-muted)', 'font-size': 11, 'font-weight': 600
      }, pt.label));
    });
  }

  function renderLedgerList(summary) {
    const container = $('tx-list');
    const caption = $('ledger-count-caption');
    if (!container) return;
    container.textContent = '';

    const flaggedIds = new Set((summary.flagged_over_withheld_orders || []).map(function (o) { return o.id; }));
    const query = searchQuery.trim().toLowerCase();

    const filtered = state.transactions
      .slice()
      .sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); })
      .filter(function (tx) {
        const isCancelled = tx.status === 'cancelled' || tx.status === 'returned';
        if (activeFilter === 'platform_sale' && (tx.kind !== 'platform_sale' || isCancelled)) return false;
        if (activeFilter === 'direct_sale' && (tx.kind !== 'direct_sale' || isCancelled)) return false;
        if (activeFilter === 'expense' && tx.kind !== 'expense') return false;
        if (activeFilter === 'flagged' && !flaggedIds.has(tx.id)) return false;
        if (activeFilter === 'cancelled' && !isCancelled) return false;

        if (query) {
          const hay = [tx.order_code, tx.channel, tx.note, tx.date].join(' ').toLowerCase();
          if (hay.indexOf(query) === -1) return false;
        }
        return true;
      });

    if (caption) {
      caption.textContent = 'Hiển thị ' + filtered.length + ' / ' + state.transactions.length + ' giao dịch trong sổ.';
    }

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const p = document.createElement('p');
      p.textContent = state.transactions.length === 0
        ? 'Sổ thu chi đang trống. Hãy bấm Thêm đơn / chi phí hoặc nạp thử 15 đơn Shopee/TikTok ở trên.'
        : 'Không tìm thấy giao dịch phù hợp với bộ lọc hoặc từ khóa đang chọn.';
      empty.appendChild(p);
      container.appendChild(empty);
      return;
    }

    filtered.forEach(function (tx) {
      const isCancelled = tx.status === 'cancelled' || tx.status === 'returned';
      const isFlagged = flaggedIds.has(tx.id);

      const card = document.createElement('article');
      card.className = 'tx-item' + (isCancelled ? ' tx-item-cancelled' : '');

      const top = document.createElement('div');
      top.className = 'tx-top';

      const info = document.createElement('div');
      info.className = 'tx-info';

      const title = document.createElement('div');
      title.className = 'tx-title';
      title.textContent = tx.note || tx.channel || (tx.order_code ? 'Đơn ' + tx.order_code : 'Giao dịch thu chi');
      info.appendChild(title);

      const sub = document.createElement('div');
      sub.className = 'tx-sub';

      const dateSpan = document.createElement('span');
      dateSpan.textContent = tx.date || 'Chưa rõ ngày';
      sub.appendChild(dateSpan);

      const chanBadge = document.createElement('span');
      chanBadge.className = 'badge';
      chanBadge.textContent = tx.channel || (tx.kind === 'expense' ? 'Chi phí' : 'Bán hàng');
      sub.appendChild(chanBadge);

      if (tx.order_code) {
        const codeSpan = document.createElement('span');
        codeSpan.textContent = 'Mã: ' + tx.order_code;
        sub.appendChild(codeSpan);
      }

      if (isCancelled) {
        const bomBadge = document.createElement('span');
        bomBadge.className = 'badge badge-warn';
        bomBadge.textContent = 'Đơn hủy / bom hàng (đã loại)';
        sub.appendChild(bomBadge);
      }

      if (isFlagged) {
        const flagBadge = document.createElement('span');
        flagBadge.className = 'badge badge-alert';
        flagBadge.textContent = 'Sàn trừ thừa thuế (>105% chuẩn)';
        sub.appendChild(flagBadge);
      }

      if (tx.kind === 'expense') {
        const invBadge = document.createElement('span');
        invBadge.className = tx.has_valid_invoice ? 'badge badge-safe' : 'badge badge-warn';
        invBadge.textContent = tx.has_valid_invoice ? 'Có hóa đơn hợp lệ' : 'Chưa có hóa đơn';
        sub.appendChild(invBadge);
      }

      info.appendChild(sub);
      top.appendChild(info);

      const amtCol = document.createElement('div');
      amtCol.className = 'tx-amount-col';
      const amtEl = document.createElement('div');
      const mainVal = tx.kind === 'platform_sale' ? tx.gmv : (tx.amount != null ? tx.amount : tx.gmv);
      const prefix = tx.kind === 'expense' ? '-' : '+';
      amtEl.className = 'tx-amount ' + (isCancelled ? 'tx-amount-cancelled' : (tx.kind === 'expense' ? 'tx-amount-out' : 'tx-amount-in'));
      amtEl.textContent = prefix + Engine.formatVnd(mainVal);
      amtCol.appendChild(amtEl);
      top.appendChild(amtCol);

      card.appendChild(top);

      if (tx.kind === 'platform_sale' && !isCancelled) {
        const details = document.createElement('div');
        details.className = 'tx-details tabular';
        const netOrder = Math.max(0, (tx.gmv || 0) - (tx.platform_fee || 0) - (tx.tax_withheld || 0));

        const s1 = document.createElement('span');
        s1.textContent = 'Phí sàn: ' + Engine.formatVnd(tx.platform_fee || 0);
        const s2 = document.createElement('span');
        s2.textContent = 'Thuế sàn trừ: ' + Engine.formatVnd(tx.tax_withheld || 0);
        const s3 = document.createElement('span');
        s3.textContent = 'Thực về ví: ' + Engine.formatVnd(netOrder);

        details.appendChild(s1);
        details.appendChild(s2);
        details.appendChild(s3);
        card.appendChild(details);
      }

      const actions = document.createElement('div');
      actions.className = 'tx-actions no-print';

      const btnEdit = document.createElement('button');
      btnEdit.type = 'button';
      btnEdit.className = 'btn btn-secondary btn-sm';
      btnEdit.setAttribute('aria-label', 'Sửa giao dịch ' + (tx.order_code || tx.note || ''));
      btnEdit.appendChild(createSvgUse('#i-edit', 'icon-sm'));
      const editTxt = document.createElement('span');
      editTxt.textContent = 'Sửa';
      btnEdit.appendChild(editTxt);
      btnEdit.addEventListener('click', function () {
        openTxModal(tx);
      });

      const btnDelete = document.createElement('button');
      btnDelete.type = 'button';
      btnDelete.className = 'btn btn-danger btn-sm';
      btnDelete.setAttribute('aria-label', 'Xóa giao dịch ' + (tx.order_code || tx.note || ''));
      btnDelete.appendChild(createSvgUse('#i-trash', 'icon-sm'));
      const delTxt = document.createElement('span');
      delTxt.textContent = 'Xóa';
      btnDelete.appendChild(delTxt);
      btnDelete.addEventListener('click', function () {
        deleteTransaction(tx.id);
      });

      actions.appendChild(btnEdit);
      actions.appendChild(btnDelete);
      card.appendChild(actions);

      container.appendChild(card);
    });
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
     CRUD Giao dịch + Sửa / Xóa / Hoàn tác 5 giây
     ======================================================================== */

  function deleteTransaction(id) {
    const prev = state.transactions.slice();
    const target = state.transactions.find(function (t) { return t.id === id; });
    if (!target) return;
    state.transactions = state.transactions.filter(function (t) { return t.id !== id; });
    saveState();
    renderAll();
    registerUndo(prev, 'Đã xóa giao dịch "' + (target.note || target.order_code || target.channel || 'thu chi') + '".');
  }

  function registerUndo(previousTransactions, message) {
    undoSnapshot = previousTransactions;
    showToast(message, true);
  }

  function showToast(message, canUndo) {
    const toast = $('undo-toast');
    const msgEl = $('toast-message');
    const undoBtn = $('btn-undo-action');
    if (!toast || !msgEl || !undoBtn) return;

    if (undoTimerId) clearTimeout(undoTimerId);
    if (undoCountdownId) clearInterval(undoCountdownId);

    msgEl.textContent = message;
    toast.hidden = false;

    if (canUndo && undoSnapshot) {
      let secondsLeft = 5;
      undoBtn.hidden = false;
      undoBtn.textContent = 'Hoàn tác (' + secondsLeft + 's)';
      undoCountdownId = setInterval(function () {
        secondsLeft -= 1;
        if (secondsLeft > 0) {
          undoBtn.textContent = 'Hoàn tác (' + secondsLeft + 's)';
        }
      }, 1000);
      undoTimerId = setTimeout(function () {
        hideToast();
        undoSnapshot = null;
      }, 5200);
    } else {
      undoBtn.hidden = true;
      undoTimerId = setTimeout(function () {
        hideToast();
      }, 3600);
    }
  }

  function hideToast() {
    const toast = $('undo-toast');
    if (toast) toast.hidden = true;
    if (undoTimerId) clearTimeout(undoTimerId);
    if (undoCountdownId) clearInterval(undoCountdownId);
    undoTimerId = null;
    undoCountdownId = null;
  }

  function performUndo() {
    if (!undoSnapshot) return;
    state.transactions = undoSnapshot;
    undoSnapshot = null;
    saveState();
    renderAll();
    hideToast();
    showToast('Đã khôi phục lại dữ liệu trước đó.', false);
  }

  /* ========================================================================
     Modal Management (Focus Trap + Escape + Return Focus)
     ======================================================================== */

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

  function setupFocusTrap(backdropId) {
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
          'button:not([disabled]):not([hidden]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), a[href]'
        )).filter(function (el) {
          return el.offsetParent !== null;
        });
        if (focusables.length === 0) return;
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
      if (e.target === backdrop) {
        closeModal(backdropId);
      }
    });
  }

  /* ========================================================================
     Quick Add / Edit Transaction Modal (3 Chạm)
     ======================================================================== */

  function setTxKind(kind) {
    activeTxKind = kind;
    document.querySelectorAll('[data-tx-kind]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-tx-kind') === kind ? 'true' : 'false');
    });

    const isPlatform = kind === 'platform_sale';
    const isExpense = kind === 'expense';
    $('platform-extra-fields').hidden = !isPlatform;
    $('expense-invoice-wrap').hidden = !isExpense;
    $('tx-status-wrap').hidden = isExpense;

    const amtLabel = $('tx-amount-label');
    const chanInput = $('tx-channel');
    if (isPlatform) {
      amtLabel.textContent = 'Bước 2: Nhập tổng giá trị đơn trên sàn trước phí sàn (VNĐ)';
      if (!chanInput.value.trim() || chanInput.value === 'Facebook / Zalo' || chanInput.value === 'Chi phí vận hành') {
        chanInput.value = 'Shopee';
      }
      syncDefaultPlatformTax();
    } else if (isExpense) {
      amtLabel.textContent = 'Bước 2: Nhập số tiền chi ra (VNĐ)';
      if (!chanInput.value.trim() || chanInput.value === 'Shopee' || chanInput.value === 'Facebook / Zalo') {
        chanInput.value = 'Chi phí vận hành';
      }
    } else {
      amtLabel.textContent = 'Bước 2: Nhập số tiền thu ngoài sàn (VNĐ)';
      if (!chanInput.value.trim() || chanInput.value === 'Shopee' || chanInput.value === 'Chi phí vận hành') {
        chanInput.value = 'Facebook / Zalo';
      }
    }
  }

  function syncDefaultPlatformTax() {
    if (activeTxKind !== 'platform_sale' || userEditedTaxManually) return;
    const gmv = Engine.parseMoneyValue($('tx-amount').value);
    const sec = Engine.TAX_RULES_CONFIG_2026.sectors[state.sectorCode];
    const rate = sec ? (sec.vat + sec.pit) : 0.015;
    if (gmv > 0) {
      const estTax = Math.round(gmv * rate);
      $('tx-tax-withheld').value = formatMoneyInputString(estTax);
      $('tx-tax-readout').textContent = 'Gợi ý ' + (rate * 100).toFixed(1).replace('.', ',') + '%: ' + Engine.readVietnameseMoney(estTax);
    } else {
      $('tx-tax-withheld').value = '';
    }
  }

  function updateAmountReadout(inputId, readoutId) {
    const input = $(inputId);
    const readout = $(readoutId);
    if (!input || !readout) return;
    const val = Engine.parseMoneyValue(input.value);
    input.value = formatMoneyInputString(val);
    readout.textContent = val > 0 ? Engine.readVietnameseMoney(val) : 'Nhập số tiền (tự động thêm dấu chấm và đọc bằng chữ)';
    return val;
  }

  function openTxModal(editTx) {
    userEditedTaxManually = Boolean(editTx);
    $('tx-amount-error').hidden = true;
    $('tx-amount').setAttribute('aria-invalid', 'false');

    if (editTx) {
      $('tx-modal-title').textContent = 'Sửa giao dịch';
      $('btn-save-tx-label').textContent = 'Lưu thay đổi';
      $('tx-edit-id').value = editTx.id;
      setTxKind(editTx.kind || 'direct_sale');
      const mainVal = editTx.kind === 'platform_sale' ? editTx.gmv : (editTx.amount != null ? editTx.amount : editTx.gmv);
      $('tx-amount').value = formatMoneyInputString(mainVal);
      $('tx-amount-readout').textContent = Engine.readVietnameseMoney(mainVal);
      $('tx-platform-fee').value = formatMoneyInputString(editTx.platform_fee || 0);
      $('tx-tax-withheld').value = formatMoneyInputString(editTx.tax_withheld || 0);
      $('tx-has-invoice').checked = editTx.has_valid_invoice !== false;
      $('tx-channel').value = editTx.channel || '';
      $('tx-date').value = editTx.date || todayIso();
      $('tx-note').value = editTx.note || '';
      $('tx-is-cancelled').checked = editTx.status === 'cancelled' || editTx.status === 'returned';
    } else {
      $('tx-modal-title').textContent = 'Ghi thu chi nhanh (3 chạm)';
      $('btn-save-tx-label').textContent = 'Bước 3: Lưu giao dịch';
      $('tx-edit-id').value = '';
      $('tx-channel').value = 'Facebook / Zalo';
      setTxKind('direct_sale');
      $('tx-amount').value = '';
      $('tx-amount-readout').textContent = 'Nhập số tiền, hệ thống sẽ tự đọc bằng chữ để tránh thừa số 0';
      $('tx-platform-fee').value = '';
      $('tx-tax-withheld').value = '';
      $('tx-has-invoice').checked = true;
      $('tx-date').value = todayIso();
      $('tx-note').value = '';
      $('tx-is-cancelled').checked = false;
    }

    openModal('tx-modal-backdrop', $('tx-amount'));
  }

  function handleSaveTx(e) {
    e.preventDefault();
    const rawAmount = $('tx-amount').value;
    const check = Engine.validatePositiveMoneyInput(rawAmount);
    const errEl = $('tx-amount-error');
    if (!check.ok) {
      $('tx-amount').setAttribute('aria-invalid', 'true');
      errEl.textContent = check.error;
      errEl.hidden = false;
      $('tx-amount').focus();
      return;
    }

    const amountVal = check.value;
    const rawFee = $('tx-platform-fee').value.trim();
    const rawTax = $('tx-tax-withheld').value.trim();
    if (activeTxKind === 'platform_sale' && (rawFee.indexOf('-') !== -1 || rawTax.indexOf('-') !== -1)) {
      $('tx-amount').setAttribute('aria-invalid', 'false');
      errEl.textContent = 'Phí sàn và thuế sàn đã trừ không được là số âm. Vui lòng nhập số dương hoặc để trống.';
      errEl.hidden = false;
      return;
    }

    const editId = $('tx-edit-id').value.trim();
    const feeVal = activeTxKind === 'platform_sale' ? Engine.parseMoneyValue(rawFee) : 0;
    const taxVal = activeTxKind === 'platform_sale' ? Engine.parseMoneyValue(rawTax) : 0;
    const channelVal = $('tx-channel').value.trim() || (
      activeTxKind === 'platform_sale' ? 'Shopee' : (activeTxKind === 'expense' ? 'Chi phí vận hành' : 'Facebook / Zalo')
    );
    const noteVal = $('tx-note').value.trim();
    const dateVal = $('tx-date').value || todayIso();
    const isCancelled = activeTxKind !== 'expense' && $('tx-is-cancelled').checked;

    const record = {
      id: editId || ('tx_' + Date.now() + '_' + Math.floor(Math.random() * 1000)),
      date: dateVal,
      kind: activeTxKind,
      channel: channelVal,
      status: isCancelled ? 'cancelled' : 'completed',
      order_code: editId ? (findOrderCode(editId) || 'GHI-TAY') : ('GHI-' + String(Date.now()).slice(-4)),
      gmv: activeTxKind === 'expense' ? 0 : amountVal,
      platform_fee: isCancelled ? 0 : feeVal,
      tax_withheld: isCancelled ? 0 : taxVal,
      amount: amountVal,
      has_valid_invoice: activeTxKind === 'expense' ? $('tx-has-invoice').checked : true,
      note: noteVal || (activeTxKind === 'expense' ? channelVal : ('Đơn ' + channelVal))
    };

    const prev = state.transactions.slice();
    if (editId) {
      state.transactions = state.transactions.map(function (item) {
        return item.id === editId ? record : item;
      });
    } else {
      state.transactions.unshift(record);
    }

    saveState();
    closeModal('tx-modal-backdrop');
    renderAll();
    registerUndo(prev, editId ? 'Đã cập nhật giao dịch.' : 'Đã lưu giao dịch ' + Engine.formatVnd(amountVal) + ' vào sổ.');
  }

  function findOrderCode(id) {
    const found = state.transactions.find(function (t) { return t.id === id; });
    return found ? found.order_code : '';
  }

  /* ========================================================================
     Smart CSV Importer UI (Xem trước 5 dòng + Tự loại đơn bom)
     ======================================================================== */

  function previewCsvText(csvText) {
    const errEl = $('csv-error-msg');
    const previewBox = $('csv-preview-box');
    errEl.hidden = true;

    const res = Engine.parseEcommerceCsv(csvText, state.sectorCode, state.rules);
    if (!res.ok || (res.transactions.length === 0 && res.excluded_bom.length === 0)) {
      pendingCsvResult = null;
      previewBox.hidden = true;
      errEl.textContent = res.error || 'Không đọc được dòng đơn hàng nào. Vui lòng kiểm tra lại định dạng tệp CSV.';
      errEl.hidden = false;
      return;
    }

    pendingCsvResult = res;
    previewBox.hidden = false;

    const badges = $('csv-preview-badges');
    badges.textContent = '';

    const b1 = document.createElement('span');
    b1.className = 'badge badge-safe';
    b1.textContent = res.transactions.length + ' đơn thành công hợp lệ';
    badges.appendChild(b1);

    const b2 = document.createElement('span');
    b2.className = 'badge badge-warn';
    b2.textContent = 'Tự loại ' + res.excluded_bom.length + ' đơn hủy / bom hàng';
    badges.appendChild(b2);

    if (res.flagged_over_withheld.length > 0) {
      const b3 = document.createElement('span');
      b3.className = 'badge badge-alert';
      b3.textContent = 'Phát hiện ' + res.flagged_over_withheld.length + ' đơn sàn trừ nhầm >105%';
      badges.appendChild(b3);
    }

    const tbody = $('csv-preview-tbody');
    tbody.textContent = '';
    const sampleRows = res.transactions.concat(res.excluded_bom).slice(0, 6);
    sampleRows.forEach(function (tx) {
      const tr = document.createElement('tr');
      const cols = [
        tx.order_code,
        tx.date,
        tx.channel,
        tx.status === 'cancelled' ? 'Đã loại (Bom/Hủy)' : 'Hoàn thành',
        Engine.formatVnd(tx.gmv),
        Engine.formatVnd(tx.platform_fee),
        Engine.formatVnd(tx.tax_withheld)
      ];
      cols.forEach(function (val) {
        const td = document.createElement('td');
        td.textContent = val;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    $('btn-confirm-csv-text').textContent = 'Xác nhận nạp ' + res.transactions.length + ' đơn hợp lệ (kèm lưu vết ' + res.excluded_bom.length + ' đơn hủy đã loại)';
  }

  function confirmCsvImport() {
    if (!pendingCsvResult) return;
    const prev = state.transactions.slice();
    const toAdd = pendingCsvResult.transactions.concat(pendingCsvResult.excluded_bom);
    state.transactions = toAdd.concat(state.transactions);
    const activeCount = pendingCsvResult.transactions.length;
    const bomCount = pendingCsvResult.excluded_bom.length;
    pendingCsvResult = null;
    $('csv-preview-box').hidden = true;
    $('csv-paste-input').value = '';
    $('csv-file-input').value = '';
    saveState();
    renderAll();
    registerUndo(prev, 'Đã nạp ' + activeCount + ' đơn từ tệp CSV (tự động loại ' + bomCount + ' đơn hủy / bom hàng).');
  }

  /* ========================================================================
     Cài đặt ngưỡng động, Xuất CSV sạch & Sao lưu JSON
     ======================================================================== */

  function syncSettingsInputs() {
    $('setting-shop-name').value = state.shopName;
    $('setting-t1').value = formatMoneyInputString(state.rules.exempt_threshold_vnd);
    $('setting-t1-readout').textContent = Engine.readVietnameseMoney(state.rules.exempt_threshold_vnd);
    $('setting-t2').value = formatMoneyInputString(state.rules.profit_method_threshold_vnd);
    $('setting-t2-readout').textContent = Engine.readVietnameseMoney(state.rules.profit_method_threshold_vnd);
  }

  function handleSaveSettings(e) {
    e.preventDefault();
    const check1 = Engine.validatePositiveMoneyInput($('setting-t1').value);
    const check2 = Engine.validatePositiveMoneyInput($('setting-t2').value);
    const err1 = $('setting-t1-error');
    const err2 = $('setting-t2-error');
    err1.hidden = true;
    err2.hidden = true;
    $('setting-t1').setAttribute('aria-invalid', 'false');
    $('setting-t2').setAttribute('aria-invalid', 'false');

    if (!check1.ok || check1.value < 100000000) {
      $('setting-t1').setAttribute('aria-invalid', 'true');
      err1.textContent = !check1.ok ? check1.error : 'Ngưỡng miễn thuế cần tối thiểu 100 triệu đồng.';
      err1.hidden = false;
      $('setting-t1').focus();
      return;
    }
    if (!check2.ok || check2.value <= check1.value) {
      $('setting-t2').setAttribute('aria-invalid', 'true');
      err2.textContent = !check2.ok ? check2.error : 'Ngưỡng tính theo lợi nhuận phải lớn hơn ngưỡng miễn thuế.';
      err2.hidden = false;
      $('setting-t2').focus();
      return;
    }

    const t1 = check1.value;
    const t2 = check2.value;
    const nameVal = $('setting-shop-name').value.trim();
    state.shopName = nameVal || 'Cửa hàng của tôi';
    state.rules.exempt_threshold_vnd = t1;
    state.rules.profit_method_threshold_vnd = t2;
    saveState();
    renderAll();
    showToast('Đã lưu cài đặt cửa hàng và cập nhật ngưỡng thuế mới.', false);
  }

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ========================================================================
     Gắn toàn bộ sự kiện & Khởi động
     ======================================================================== */

  function bindEvents() {
    // Theme toggle
    $('btn-theme-toggle').addEventListener('click', function () {
      applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    });

    // 4 Tabs + phím mũi tên
    const tabBtns = Array.from(document.querySelectorAll('[data-tab]'));
    tabBtns.forEach(function (btn, idx) {
      btn.addEventListener('click', function () {
        switchTab(btn.getAttribute('data-tab'));
      });
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const next = e.key === 'ArrowRight'
            ? (idx + 1) % tabBtns.length
            : (idx - 1 + tabBtns.length) % tabBtns.length;
          tabBtns[next].focus();
          switchTab(tabBtns[next].getAttribute('data-tab'));
        }
      });
    });

    // Legal banner & modal
    $('btn-accept-legal-banner').addEventListener('click', function () {
      state.legalAccepted = true;
      saveState();
      $('onboarding-legal-banner').hidden = true;
    });
    $('btn-open-legal-modal').addEventListener('click', function () {
      openModal('legal-modal-backdrop', $('btn-ok-legal-modal'));
    });
    $('btn-footer-legal-modal').addEventListener('click', function () {
      openModal('legal-modal-backdrop', $('btn-ok-legal-modal'));
    });
    $('btn-close-legal-modal').addEventListener('click', function () { closeModal('legal-modal-backdrop'); });
    $('btn-ok-legal-modal').addEventListener('click', function () {
      state.legalAccepted = true;
      saveState();
      $('onboarding-legal-banner').hidden = true;
      closeModal('legal-modal-backdrop');
    });

    // Toggle xem chi tiết công thức từng đồng
    $('btn-toggle-breakdown').addEventListener('click', function () {
      const btn = $('btn-toggle-breakdown');
      const panel = $('formula-breakdown');
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      panel.hidden = expanded;
    });

    // Nút mở Ghi nhanh 3 chạm
    $('btn-open-quick-add').addEventListener('click', function () { openTxModal(null); });
    $('btn-hero-quick-add').addEventListener('click', function () { openTxModal(null); });
    $('btn-ledger-quick-add').addEventListener('click', function () { openTxModal(null); });

    // Nút nạp dữ liệu mẫu & 3 hồ sơ thực tế
    $('btn-load-sample-15').addEventListener('click', function () { loadSample15(false); });
    $('btn-preset-15').addEventListener('click', function () { loadSample15(false); });
    $('btn-preset-850m').addEventListener('click', loadPreset850m);
    $('btn-preset-3b6').addEventListener('click', loadPreset3b6);

    // Chuyển thẳng tới danh sách đơn sàn trừ nhầm 10%
    $('btn-inspect-overwithheld').addEventListener('click', function () {
      setLedgerFilter('flagged');
      switchTab('ledger');
    });

    // Modal thêm / sửa giao dịch
    $('btn-close-tx-modal').addEventListener('click', function () { closeModal('tx-modal-backdrop'); });
    $('btn-cancel-tx-modal').addEventListener('click', function () { closeModal('tx-modal-backdrop'); });
    $('tx-form').addEventListener('submit', handleSaveTx);

    document.querySelectorAll('[data-tx-kind]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTxKind(btn.getAttribute('data-tx-kind'));
      });
    });

    $('tx-amount').addEventListener('input', function () {
      const raw = $('tx-amount').value;
      const errEl = $('tx-amount-error');
      const readoutEl = $('tx-amount-readout');
      if (!raw.trim()) {
        $('tx-amount').setAttribute('aria-invalid', 'false');
        errEl.hidden = true;
        readoutEl.textContent = 'Nhập số tiền, hệ thống sẽ tự đọc bằng chữ để tránh thừa số 0';
        syncDefaultPlatformTax();
        return;
      }
      const check = Engine.validatePositiveMoneyInput(raw);
      if (!check.ok) {
        $('tx-amount').setAttribute('aria-invalid', 'true');
        errEl.textContent = check.error;
        errEl.hidden = false;
        readoutEl.textContent = '';
        return;
      }
      $('tx-amount').setAttribute('aria-invalid', 'false');
      errEl.hidden = true;
      $('tx-amount').value = formatMoneyInputString(check.value);
      readoutEl.textContent = Engine.readVietnameseMoney(check.value);
      syncDefaultPlatformTax();
    });

    $('tx-platform-fee').addEventListener('input', function () {
      const v = Engine.parseMoneyValue($('tx-platform-fee').value);
      $('tx-platform-fee').value = formatMoneyInputString(v);
      $('tx-fee-readout').textContent = v > 0 ? Engine.readVietnameseMoney(v) : 'Phí cố định + thanh toán + dịch vụ';
    });

    $('tx-tax-withheld').addEventListener('input', function () {
      userEditedTaxManually = true;
      const v = Engine.parseMoneyValue($('tx-tax-withheld').value);
      $('tx-tax-withheld').value = formatMoneyInputString(v);
      $('tx-tax-readout').textContent = v > 0 ? Engine.readVietnameseMoney(v) : 'Mặc định tự tính theo tỷ lệ ngành';
    });

    document.querySelectorAll('[data-add-money]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const delta = Number(btn.getAttribute('data-add-money')) || 0;
        const curCheck = Engine.validatePositiveMoneyInput($('tx-amount').value);
        const cur = curCheck.ok ? curCheck.value : 0;
        const next = cur + delta;
        $('tx-amount').value = formatMoneyInputString(next);
        $('tx-amount-readout').textContent = Engine.readVietnameseMoney(next);
        $('tx-amount').setAttribute('aria-invalid', 'false');
        $('tx-amount-error').hidden = true;
        syncDefaultPlatformTax();
      });
    });

    // CSV Importer
    $('csv-file-input').addEventListener('change', function (e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () {
        previewCsvText(String(reader.result || ''));
      };
      reader.readAsText(file, 'UTF-8');
    });

    const dropzone = $('csv-dropzone');
    dropzone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropzone.classList.add('is-dragover');
    });
    dropzone.addEventListener('dragleave', function () {
      dropzone.classList.remove('is-dragover');
    });
    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () {
        previewCsvText(String(reader.result || ''));
      };
      reader.readAsText(file, 'UTF-8');
    });

    $('btn-load-sample-csv-preview').addEventListener('click', function () {
      previewCsvText(SAMPLE_15_CSV);
    });
    $('btn-parse-paste').addEventListener('click', function () {
      previewCsvText($('csv-paste-input').value);
    });
    $('btn-confirm-csv-import').addEventListener('click', confirmCsvImport);
    $('btn-cancel-csv-preview').addEventListener('click', function () {
      pendingCsvResult = null;
      $('csv-preview-box').hidden = true;
    });

    // Lọc & tìm kiếm sổ thu chi
    $('ledger-search-input').addEventListener('input', function (e) {
      searchQuery = e.target.value || '';
      renderAll();
    });
    document.querySelectorAll('[data-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLedgerFilter(btn.getAttribute('data-filter'));
      });
    });

    // Báo cáo, In PDF & Cài đặt
    $('btn-export-csv').addEventListener('click', function () {
      const summary = Engine.aggregateTransactions(state.transactions, state.sectorCode, state.rules);
      const csv = Engine.exportTransactionsToCsv(state.transactions, summary, state.rules, state.shopName);
      downloadFile('doi_soat_ket_thue_shop_2026.csv', csv, 'text/csv;charset=utf-8;');
      showToast('Đã tải xuống bảng đối soát CSV sạch (chuẩn tiếng Việt, chống công thức độc hại).', false);
    });

    $('btn-print-pdf').addEventListener('click', function () {
      window.print();
    });

    $('btn-backup-json').addEventListener('click', function () {
      const payload = JSON.stringify({
        app: 'KetThueShop',
        exported_at: new Date().toISOString(),
        state: state
      }, null, 2);
      downloadFile('sao_luu_ket_thue_shop.json', payload, 'application/json;charset=utf-8;');
      showToast('Đã tải tệp sao lưu toàn bộ sổ về máy của bạn.', false);
    });

    $('restore-json-input').addEventListener('change', function (e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () {
        try {
          const parsed = JSON.parse(String(reader.result || '{}'));
          const restored = parsed.state || parsed;
          if (!Array.isArray(restored.transactions)) {
            showToast('Tệp sao lưu không đúng định dạng của Két Thuế Shop.', false);
            return;
          }
          const prev = state.transactions.slice();
          state.shopName = typeof restored.shopName === 'string' ? restored.shopName : state.shopName;
          if (Engine.TAX_RULES_CONFIG_2026.sectors[restored.sectorCode]) {
            state.sectorCode = restored.sectorCode;
          }
          if (restored.rules) {
            state.rules = Object.assign({}, state.rules, restored.rules);
          }
          state.transactions = restored.transactions;
          saveState();
          syncListboxDisplays();
          syncSettingsInputs();
          renderAll();
          registerUndo(prev, 'Đã khôi phục ' + state.transactions.length + ' giao dịch từ tệp sao lưu.');
        } catch (_err) {
          showToast('Không đọc được tệp sao lưu. Vui lòng chọn đúng tệp đã xuất từ Két Thuế Shop.', false);
        }
        e.target.value = '';
      };
      reader.readAsText(file, 'UTF-8');
    });

    // Settings form
    $('setting-t1').addEventListener('input', function () { updateAmountReadout('setting-t1', 'setting-t1-readout'); });
    $('setting-t2').addEventListener('input', function () { updateAmountReadout('setting-t2', 'setting-t2-readout'); });
    $('settings-form').addEventListener('submit', handleSaveSettings);
    $('btn-reset-rules').addEventListener('click', function () {
      state.rules.exempt_threshold_vnd = Engine.TAX_RULES_CONFIG_2026.exempt_threshold_vnd;
      state.rules.profit_method_threshold_vnd = Engine.TAX_RULES_CONFIG_2026.profit_method_threshold_vnd;
      saveState();
      syncSettingsInputs();
      renderAll();
      showToast('Đã khôi phục ngưỡng mặc định 1 tỷ và 3 tỷ theo NĐ 141/2026.', false);
    });

    // Wipe danger modal
    $('btn-open-wipe-modal').addEventListener('click', function () {
      openModal('wipe-modal-backdrop', $('btn-cancel-wipe'));
    });
    $('btn-close-wipe-modal').addEventListener('click', function () { closeModal('wipe-modal-backdrop'); });
    $('btn-cancel-wipe').addEventListener('click', function () { closeModal('wipe-modal-backdrop'); });
    $('btn-confirm-wipe').addEventListener('click', function () {
      const prev = state.transactions.slice();
      state.transactions = [];
      saveState();
      closeModal('wipe-modal-backdrop');
      renderAll();
      registerUndo(prev, 'Đã xóa sạch toàn bộ giao dịch trong sổ.');
    });

    // Undo toast button
    $('btn-undo-action').addEventListener('click', performUndo);

    // Focus trap cho 3 modal
    setupFocusTrap('tx-modal-backdrop');
    setupFocusTrap('wipe-modal-backdrop');
    setupFocusTrap('legal-modal-backdrop');
  }

  function setLedgerFilter(filterName) {
    activeFilter = filterName;
    document.querySelectorAll('[data-filter]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-filter') === filterName ? 'true' : 'false');
    });
    renderAll();
  }

  // Khởi động ứng dụng
  applyTheme(state.theme);
  handleUrlHandoff();
  initCustomListboxes();
  syncListboxDisplays();
  syncSettingsInputs();
  bindEvents();
  renderAll();
})();
