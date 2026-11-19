(function () {
  "use strict";

  /* =========================================================================
     1. Live Browser Privacy & Offline Network Indicator
     ========================================================================= */
  var liveNetText = document.getElementById("live-net-text");

  function updateNetworkIndicator() {
    if (!liveNetText) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      liveNetText.textContent = "Đang ngoại tuyến: vẫn chạy 100%";
    } else {
      liveNetText.textContent = "0 byte gửi ra ngoài";
    }
  }

  window.addEventListener("online", updateNetworkIndicator);
  window.addEventListener("offline", updateNetworkIndicator);
  updateNetworkIndicator();

  /* =========================================================================
     2. Interactive Cost & Time Savings Calculator (0 range slider, 0 select)
     ========================================================================= */
  var COST_STUDIO_PHOTO = 80000;
  var COST_SELF_PRINT_SHEET = 3000;
  var SAVE_PER_PHOTO_TRIP = COST_STUDIO_PHOTO - COST_SELF_PRINT_SHEET; /* 77.000 d */
  var SAVE_PER_DOC_SET = 15000;
  var MINS_SAVED_PER_PHOTO = 30;
  var MINS_SAVED_PER_DOC = 12;
  var FAMILY_ANNUAL_PRICE = 59000;

  var calcState = {
    photoTrips: 3,
    docSets: 8,
    members: 2
  };

  var inputPhoto = document.getElementById("input-photo-trips");
  var inputDocs = document.getElementById("input-doc-sets");
  var errPhoto = document.getElementById("err-photo-trips");
  var errDocs = document.getElementById("err-doc-sets");

  var resMoneySaved = document.getElementById("res-money-saved");
  var resMoneySub = document.getElementById("res-money-sub");
  var resTimeSaved = document.getElementById("res-time-saved");
  var resTimeSub = document.getElementById("res-time-sub");
  var resRoiRatio = document.getElementById("res-roi-ratio");
  var resRoiSub = document.getElementById("res-roi-sub");
  var resPrivacyVerdict = document.getElementById("res-privacy-verdict");

  var chipBtns = Array.prototype.slice.call(document.querySelectorAll(".chip-btn"));
  var stepBtns = Array.prototype.slice.call(document.querySelectorAll(".step-btn"));

  function formatVnd(amount) {
    var rounded = Math.max(0, Math.round(Number(amount) || 0));
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  }

  function formatDurationVi(totalMinutes) {
    var mins = Math.max(0, Math.round(totalMinutes));
    var hours = Math.floor(mins / 60);
    var rem = mins % 60;
    if (hours === 0) {
      return rem + " phút / năm";
    }
    if (rem === 0) {
      return hours + " giờ / năm";
    }
    return hours + " giờ " + rem + " phút / năm";
  }

  function parseCountInput(raw, maxVal) {
    var trimmed = String(raw || "").trim();
    if (trimmed === "") {
      return { ok: true, value: 0 };
    }
    if (/^-/.test(trimmed)) {
      return { ok: false, error: "Số lần không được âm. Hãy nhập số từ 0 đến " + maxVal + "." };
    }
    if (!/^\d+$/.test(trimmed)) {
      return { ok: false, error: "Chỉ nhập chữ số nguyên (ví dụ 3 hoặc 8). Xóa chữ để tính tiếp." };
    }
    var num = parseInt(trimmed, 10);
    if (!Number.isFinite(num) || num > maxVal) {
      return { ok: false, error: "Số lần tối đa cho phép tính nhanh là " + maxVal + ". Hãy nhập nhỏ hơn." };
    }
    return { ok: true, value: num };
  }

  function syncChips() {
    chipBtns.forEach(function (btn) {
      var key = btn.getAttribute("data-target");
      var val = parseInt(btn.getAttribute("data-val"), 10);
      var pressed = calcState[key] === val;
      btn.setAttribute("aria-pressed", pressed ? "true" : "false");
    });
  }

  function renderSavings() {
    var totalPhotoTrips = calcState.photoTrips * calcState.members;
    var totalDocSets = calcState.docSets * calcState.members;

    var photoSaving = totalPhotoTrips * SAVE_PER_PHOTO_TRIP;
    var docSaving = totalDocSets * SAVE_PER_DOC_SET;
    var totalSaving = photoSaving + docSaving;

    var totalMinutes = (totalPhotoTrips * MINS_SAVED_PER_PHOTO) + (totalDocSets * MINS_SAVED_PER_DOC);
    var roiMultiple = totalSaving > 0 ? (totalSaving / FAMILY_ANNUAL_PRICE) : 0;

    resMoneySaved.textContent = formatVnd(totalSaving);
    resMoneySub.textContent = "Gồm " + formatVnd(photoSaving) + " tiết kiệm từ ảnh thẻ (" + totalPhotoTrips + " lượt x 77.000 đ) và " + formatVnd(docSaving) + " từ ghép, nén và ký " + totalDocSets + " bộ hồ sơ tại nhà.";

    resTimeSaved.textContent = formatDurationVi(totalMinutes);
    resTimeSub.textContent = "Tiết kiệm trung bình 30 phút mỗi lần đi chụp ảnh thẻ và 12 phút mỗi bộ hồ sơ nộp trực tuyến.";

    if (totalSaving === 0) {
      resRoiRatio.textContent = "Dùng miễn phí 0 đ";
      resRoiSub.textContent = "Hãy tăng số lần chụp ảnh thẻ hoặc bộ hồ sơ để xem mức tiết kiệm cụ thể cho gia đình bạn.";
    } else {
      resRoiRatio.textContent = "Tiết kiệm gấp " + roiMultiple.toFixed(1).replace(".", ",") + " lần";
      resRoiSub.textContent = "Còn nếu chỉ dùng 6 công cụ lõi cơ bản, chi phí của bạn luôn là 0 đ trọn đời.";
    }

    var peopleText = calcState.members === 1 ? "bạn" : (calcState.members + " thành viên");
    resPrivacyVerdict.innerHTML = "<strong>Giá trị lớn nhất không đo bằng tiền:</strong> Toàn bộ " + totalDocSets + " bộ ảnh CCCD và hồ sơ của " + peopleText + " được xử lý sạch trên máy, 0 lần gửi ảnh giấy tờ tùy thân lên máy chủ nước ngoài.";

    syncChips();
  }

  function setNumericField(key, inputEl, errEl, val) {
    var clamped = Math.max(0, Math.min(200, Math.round(val)));
    calcState[key] = clamped;
    inputEl.value = String(clamped);
    inputEl.setAttribute("aria-invalid", "false");
    errEl.setAttribute("hidden", "");
    errEl.textContent = "";
    renderSavings();
  }

  chipBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-target");
      var val = parseInt(btn.getAttribute("data-val"), 10);
      if (key === "photoTrips") {
        setNumericField("photoTrips", inputPhoto, errPhoto, val);
      } else if (key === "docSets") {
        setNumericField("docSets", inputDocs, errDocs, val);
      } else if (key === "members") {
        calcState.members = val;
        renderSavings();
      }
    });
  });

  stepBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-step-target");
      var delta = parseInt(btn.getAttribute("data-delta"), 10);
      if (key === "photoTrips") {
        setNumericField("photoTrips", inputPhoto, errPhoto, calcState.photoTrips + delta);
      } else if (key === "docSets") {
        setNumericField("docSets", inputDocs, errDocs, calcState.docSets + delta);
      }
    });
  });

  function bindCountInput(inputEl, errEl, key) {
    inputEl.addEventListener("input", function () {
      var parsed = parseCountInput(inputEl.value, 200);
      if (!parsed.ok) {
        inputEl.setAttribute("aria-invalid", "true");
        errEl.textContent = parsed.error;
        errEl.removeAttribute("hidden");
        return;
      }
      inputEl.setAttribute("aria-invalid", "false");
      errEl.setAttribute("hidden", "");
      errEl.textContent = "";
      calcState[key] = parsed.value;
      renderSavings();
    });

    inputEl.addEventListener("blur", function () {
      var parsed = parseCountInput(inputEl.value, 200);
      if (parsed.ok) {
        inputEl.value = String(parsed.value);
      }
    });
  }

  bindCountInput(inputPhoto, errPhoto, "photoTrips");
  bindCountInput(inputDocs, errDocs, "docSets");
  renderSavings();

  /* =========================================================================
     3. Smooth 0fr -> 1fr FAQ Accordion
     ========================================================================= */
  var faqTriggers = Array.prototype.slice.call(document.querySelectorAll(".faq-trigger"));
  faqTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var item = trigger.closest(".faq-item");
      if (!item) return;
      var isOpen = item.getAttribute("data-open") === "true";
      item.setAttribute("data-open", isOpen ? "false" : "true");
      trigger.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
  });

  /* =========================================================================
     4. Honest VietQR Activation Guide Modal (with Focus Return & Escape)
     ========================================================================= */
  var PLANS = {
    single15: {
      name: "Gói Lẻ Theo Nhu Cầu",
      price: "15.000 đ / lần mở khóa",
      perk: "Dàn ảnh thẻ 300 DPI không viền, nén hàng loạt 20 tệp, ký PDF đa trang"
    },
    family59: {
      name: "Gói Gia Đình Cả Năm",
      price: "59.000 đ / 365 ngày",
      perk: "Mở toàn bộ tính năng nâng cao 365 ngày, lưu mẫu dấu chìm và tắt quảng cáo"
    }
  };

  var modalBackdrop = document.getElementById("vietqr-modal");
  var modalCloseBtn = document.getElementById("modal-close-btn");
  var modalDismissBtn = document.getElementById("modal-dismiss-btn");
  var modalPlanName = document.getElementById("modal-plan-name");
  var modalPlanPrice = document.getElementById("modal-plan-price");
  var modalPlanPerk = document.getElementById("modal-plan-perk");
  var planTriggers = Array.prototype.slice.call(document.querySelectorAll("[data-open-plan]"));
  var lastFocusedEl = null;

  function openModal(planKey, triggerEl) {
    var info = PLANS[planKey] || PLANS.family59;
    lastFocusedEl = triggerEl || document.activeElement;
    modalPlanName.textContent = info.name;
    modalPlanPrice.textContent = info.price;
    modalPlanPerk.textContent = info.perk;
    modalBackdrop.removeAttribute("hidden");
    document.body.classList.add("modal-open");
    modalCloseBtn.focus();
  }

  function closeModal() {
    if (modalBackdrop.hasAttribute("hidden")) return;
    modalBackdrop.setAttribute("hidden", "");
    document.body.classList.remove("modal-open");
    if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
      lastFocusedEl.focus();
    }
  }

  planTriggers.forEach(function (btn) {
    btn.addEventListener("click", function () {
      openModal(btn.getAttribute("data-open-plan"), btn);
    });
  });

  modalCloseBtn.addEventListener("click", closeModal);
  modalDismissBtn.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", function (ev) {
    if (ev.target === modalBackdrop) {
      closeModal();
    }
  });

  document.addEventListener("keydown", function (ev) {
    if (modalBackdrop.hasAttribute("hidden")) return;
    if (ev.key === "Escape") {
      ev.preventDefault();
      closeModal();
      return;
    }
    if (ev.key === "Tab") {
      var focusables = Array.prototype.slice.call(
        modalBackdrop.querySelectorAll("a[href], button:not([disabled])")
      );
      if (focusables.length === 0) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (ev.shiftKey && document.activeElement === first) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault();
        first.focus();
      }
    }
  });

  /* =========================================================================
     5. Light / Dark Theme Toggle (Persisted in localStorage)
     ========================================================================= */
  var themeToggle = document.getElementById("theme-toggle");
  var themeIcon = document.getElementById("theme-icon");
  var themeText = document.getElementById("theme-text");

  function applyTheme(theme) {
    var isDark = theme === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    themeIcon.querySelector("use").setAttribute("href", isDark ? "#i-sun" : "#i-moon");
    themeText.textContent = isDark ? "Giao diện sáng" : "Giao diện tối";
    try {
      window.localStorage.setItem("hsrt_landing_theme", isDark ? "dark" : "light");
    } catch (e) {
      /* Ignore storage block in strict private browsing */
    }
  }

  var initTheme = "light";
  try {
    var stored = window.localStorage.getItem("hsrt_landing_theme");
    if (stored === "dark" || stored === "light") {
      initTheme = stored;
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      initTheme = "dark";
    }
  } catch (e) {
    initTheme = "light";
  }
  applyTheme(initTheme);

  themeToggle.addEventListener("click", function () {
    var cur = document.documentElement.getAttribute("data-theme");
    applyTheme(cur === "dark" ? "light" : "dark");
  });
})();
