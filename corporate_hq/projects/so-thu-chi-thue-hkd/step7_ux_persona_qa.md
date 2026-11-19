# BÁO CÁO KIỂM THỬ TRẢI NGHIỆM KHÁCH HÀNG THẬT & THẨM ĐỊNH UX CHUẨN XIAS v3.1.1 (BƯỚC 7/8)

- **Dự án:** Két Thuế Shop (Sổ thu chi và Cảnh báo ngưỡng thuế tự động cho Hộ kinh doanh / Chủ shop TMĐT)
- **Mã nhiệm vụ:** `msn-47b19760`
- **Đơn vị thực hiện:** `@tester-khach-hang` (Phòng #48 Đóng vai 5 nhóm Khách hàng thật, phối hợp Phòng #49 Triệt tiêu Ma sát UX và Phòng #20 Kiểm thử Trình duyệt thật)
- **Môi trường kiểm thử thực tế:** Trình duyệt Google Chrome thật (`chrome.exe --headless=new` điều khiển qua Chrome DevTools Protocol + chụp ảnh hiển thị trực tiếp và đối chiếu bằng mắt thường), kiểm tra đồng thời 2 địa chỉ chạy live:
  1. Ứng dụng Web PWA: `http://127.0.0.1:8765/projects/so-thu-chi-thue-hkd/app/`
  2. Trang bán hàng (Landing Page): `http://127.0.0.1:8765/projects/so-thu-chi-thue-hkd/go-to-market/landing/`

---

# TÓM TẮT QUYẾT ĐỊNH & KẾT QUẢ ĐỊNH LƯỢNG

- **Kết luận cổng kiểm định (Hard Gate Phòng #48):** **ĐẠT CHUẨN XUẤT XƯỞNG (PASS 100% SAU 2 VÒNG KIỂM THỬ THẬT)**
- **Điểm Thấu Cảm Người Dùng Thật (`User_Empathy_Score`):** **95/100** (trung bình 5 nhóm khách hàng thật: `95,4/100`, vượt chuẩn bắt buộc `>= 85/100`).
- **Trạng thái 10 lỗi phát hiện ở Vòng 1:** **10/10 lỗi đã được `@ky-su-san-pham` và `@doi-ban-hang` vá triệt để và xác minh lại trên Chrome thật ở Vòng 2 (0 lỗi tồn đọng mức Nghiêm trọng/Trung bình).**

| Chỉ số đo thực tế trên Chrome thật (Vòng 2 sau sửa lỗi) | Ứng dụng Két Thuế Shop (`app/`) | Trang bán hàng (`go-to-market/landing/`) | Trạng thái |
| :--- | :---: | :---: | :---: |
| Lỗi Console JS (`console.error` / `assert`) | `0` | `0` | ĐẠT |
| Lỗi ngoại lệ trang (`Runtime.exceptionThrown`) | `0` | `0` | ĐẠT |
| Lỗi mạng HTTP 4xx/5xx (bao gồm `/favicon.ico`) | `0` | `0` | ĐẠT |
| Tràn ngang Mobile `390x844` (Sáng & Tối) | `0px` (cả 4 tab) | `0px` | ĐẠT |
| Tràn ngang màn nhỏ `320x568` & Desktop `1280/1440` | `0px` | `0px` | ĐẠT |
| Tương phản WCAG 2.2 AA Chế độ Sáng (đo thật trên pixel) | `61/61` tổng quan, `202/202` sổ thu chi (min `6,10:1`) | `205/205` (min `5,62:1`) | ĐẠT |
| Tương phản WCAG 2.2 AA Chế độ Tối (đo thật trên pixel) | `62/62` (min `5,41:1`) | `205/205` (min `6,56:1`) | ĐẠT |
| Vùng chạm WCAG 2.5.8 (`>= 24x24px`, 0 nút dưới chuẩn) | `0` lỗi (100% nút Mobile `>= 44px`) | `0` lỗi (3 link chân trang đã nâng `44px`) | ĐẠT |
| Tỷ lệ cỡ chữ dẫn đầu (`One thing leads >= 2,5x`) | `46px / 15px = 3,07x` | Tiêu đề chính nổi bật, tách 2 cột rõ | ĐẠT |
| Kiểm tra XIAS `check_no_emoji.py` (0 emoji, 0 gạch ngang dài) | PASS (`0` lỗi / 4 tệp) | PASS (`0` lỗi / 2 tệp) | ĐẠT |
| Kiểm tra XIAS `lint_native_select.py` (0 `<select>` gốc) | PASS (`0` thẻ) | PASS (`0` thẻ) | ĐẠT |
| Kiểm tra XIAS `lint_hardcodes.py` (0 màu/px/ms cứng) | PASS (`0` lỗi) | PASS (`0` lỗi, giảm từ 9 lỗi) | ĐẠT |
| Kiểm tra XIAS `lint_taste.py --strict` | 1 gợi ý nhẹ (advisory bảng màu token) | PASS (`0` lỗi) | ĐẠT |
| Tiếng Anh kỹ thuật thừa trên giao diện hiển thị | `0` từ thừa | `0` từ kỹ thuật thừa (chỉ giữ tên gói CFO `Standard`/`Pro`) | ĐẠT |
| Viền màu một cạnh rập khuôn (anti-slop) | `0` phần tử | `0` phần tử | ĐẠT |
| Kiểm thử đơn vị lõi thuế (`node test_tax_engine.mjs`) | `10/10 PASS` | Khớp 100% 4 tình huống mẫu + chuyển tham số sang App | ĐẠT |

> **Tuyên bố phạm vi trung thực theo chuẩn XIAS v3.1.1:** Các bộ đo tự động chứng minh **tính đúng đắn khách quan** (tương phản màu thực tế, không tràn ngang, kích thước vùng chạm, hoạt động tương tác, không lỗi Console và tuân thủ token). Phần **thẩm mỹ và trải nghiệm cảm nhận** được đánh giá định tính bằng việc mở trình duyệt thật, chụp ảnh toàn bộ màn hình Sáng/Tối trên Desktop và Mobile rồi soi từng điểm ảnh kết hợp đóng vai 5 nhóm chủ shop đời thực; không có chỉ số tự động nào tự đảm bảo 100% về gu thẩm mỹ.

---

# NGUỒN THỰC TẾ VỪA TRA CỨU TRỰC TIẾP (LIVE CITATIONS)

1. **W3C WCAG 2.2 Success Criterion 2.5.8 (Target Size Minimum, Level AA) & 2.5.5 (Enhanced, Level AAA):** Quy định sàn tối thiểu vùng chạm `24x24 CSS px` cho mọi điều khiển tương tác và mức khuyến nghị `44x44px` để người dùng lớn tuổi hoặc dùng một tay không bấm trượt.
   - Nguồn tham chiếu: W3C WAI (`w3.org`) và tổng hợp tiêu chuẩn truy cập (`weaccess.ai`, tra cứu trực tiếp 19/11/2026).
2. **Nielsen Norman Group (NN/g) Touch Target Field Study (Quy tắc 1cm x 1cm):** Khuyến nghị vùng chạm tối ưu trên điện thoại tương đương `44px` đến `48px` (khớp Apple HIG `44pt` và Material Design `48dp`), giúp giảm mạnh lỗi bấm nhầm và thời gian thao tác bằng một tay.
   - Nguồn tham chiếu: Nielsen Norman Group (`nngroup.com`, tra cứu trực tiếp 19/11/2026).
3. **Baymard Institute Mobile Form Usability, Inline Validation & Undo Recovery Benchmarks:** Chỉ ra việc hiển thị thông báo lỗi cụ thể ngay sát ô nhập (nêu rõ nguyên nhân và cách sửa), không xóa trắng dữ liệu người dùng vừa gõ, và cung cấp cơ chế Hoàn tác (Undo) tức thì trên thanh thông báo khi xóa dữ liệu giúp ngăn mất dữ liệu và giảm mạnh tỷ lệ bỏ cuộc trên di động.
   - Nguồn tham chiếu: Baymard Institute (`baymard.com`, tra cứu trực tiếp 19/11/2026).

---

# NỘI DUNG CHI TIẾT: NHẬT KÝ SỬA LỖI 2 VÒNG & ĐÓNG VAI 5 NHÓM KHÁCH HÀNG THẬT

## 1. Nhật ký đối chiếu Vòng 1 (Phát hiện lỗi thật qua ảnh chụp Chrome) sang Vòng 2 (Xác minh 0 lỗi)

Trong Vòng 1 kiểm thử trực tiếp trên trình duyệt Chrome thật và đối chiếu ảnh chụp màn hình, `@tester-khach-hang` đã phát hiện và chặn xuất xưởng **10 lỗi thực tế** (gồm 4 lỗi Nghiêm trọng, 3 lỗi Trung bình và 3 lỗi Nhỏ), gửi phản hồi thẳng cho `@ky-su-san-pham` và `@doi-ban-hang` tại bản tin `#19` và khung chat Web Command Center. Toàn bộ đã được kiểm chứng lại độc lập ở Vòng 2:

| STT | Hạng mục & Phạm vi | Lỗi thực tế bắt được ở Vòng 1 | Bằng chứng xác minh lại ở Vòng 2 (Chrome thật) | Kết quả |
| :---: | :--- | :--- | :--- | :---: |
| 1 | `[Nghiêm trọng]` App `styles.css` | Thiếu quy tắc `[hidden] { display: none !important; }` nên `.notice-box` và `.form-grid` ghi đè thuộc tính `hidden`: hộp xanh handoff luôn hiện rỗng, hộp đỏ cảnh báo trừ nhầm 10% hiện sai ngay cả khi không có đơn lỗi, hộp miễn trừ không ẩn sau khi bấm "Tôi đã hiểu", và 2 ô Phí sàn/Thuế sàn lộ ra trong Modal "Thu ngoài sàn". | Đo thực tế trên Chrome Vòng 2: `handoffHiddenOnFresh: true`, `overAlertHiddenOnFresh: true`, `legalBannerHiddenAfterAccept: true`, `platformFieldsHiddenOnDirect: true`, `overWithheldHiddenOnCleanHandoff: true`. Xác nhận bằng mắt trên ảnh chụp mới. | ĐÃ KHẮC PHỤC |
| 2 | `[Nghiêm trọng]` App `app.js` & `tax_engine.js` | Gõ số âm `-500000` vào `#tx-amount` rồi bấm Lưu bị xóa dấu `-` và lưu thầm lặng thành `+500.000 đ` thay vì báo lỗi. | Đo thực tế Vòng 2: nhập `-500000` hiện ngay lỗi đỏ *"Số tiền không được là số âm. Vui lòng nhập số dương (ví dụ: 500.000)."* và giữ nguyên modal không lưu; nhập `abc` và `0` đều chặn đúng kèm hướng dẫn rõ. | ĐÃ KHẮC PHỤC |
| 3 | `[Trung bình]` App `app.js` | Chuyển dữ liệu từ Landing Page (`?sector=&gmv=&direct=&fee=`) giữ nhầm tên shop mẫu cũ (`Tổng Kho Gia Dụng Chị Hương (3,6 tỷ)`) dù số liệu mới chỉ 930 triệu. | Đo thực tế Vòng 2 sau khi bấm nút thật trên Landing Page: tiêu đề đổi sạch thành *"Két tiền Cửa hàng ước tính (từ Máy tính nhanh)"*, dữ liệu đúng `930.000.000 đ` (đạt `93% mốc 1 tỷ`, an toàn `772.050.000 đ`). | ĐÃ KHẮC PHỤC |
| 4 | `[Trung bình]` App `styles.css` & `app.js` | Toast (`z-index: 90`) đè lên Modal (`z-index: 80`) trên Mobile 390px che mất ô nhập liệu. | Đo thực tế Vòng 2: `toastHiddenWhenModalOpen: true`, ảnh chụp Modal Mobile 390px hoàn toàn sạch sẽ không bị toast che. | ĐÃ KHẮC PHỤC |
| 5 | `[Nhỏ]` App `index.html` | Thiếu favicon nội tuyến làm Chrome ghi lỗi mạng `404 http://127.0.0.1:8765/favicon.ico`. | Đo thực tế Vòng 2: `networkErrors: []` (0 lỗi 4xx/5xx). | ĐÃ KHẮC PHỤC |
| 6 | `[Nhỏ UX]` App `app.js` & `styles.css` | Phần trăm badge dùng dấu chấm (`77.4%`) thay vì dấu phẩy tiếng Việt (`77,4%`); nút `btn-sm`/Sửa/Xóa trên Mobile 390px cao `36px`. | Đo thực tế Vòng 2: hiển thị `77,4% mốc 1 tỷ`, `advisoryTargets: []` (100% nút thao tác trên Mobile 390px đạt `>= 44px`). | ĐÃ KHẮC PHỤC |
| 7 | `[Nghiêm trọng]` Landing `styles.css` | XIAS `lint_hardcodes.py` báo FAIL 9 giá trị màu/px/ms cứng; `lint_taste.py` báo 3 cảnh báo (màu `#ffffff` thuần, tiêu đề dài, nhiều mã hex). | Chạy thật Vòng 2: `lint_hardcodes.py` đạt `OK (0 lỗi)`, `lint_taste.py --strict` đạt `0 finding`, `check_no_emoji.py` đạt `OK`, `lint_native_select.py` đạt `OK`. | ĐÃ KHẮC PHỤC |
| 8 | `[Nghiêm trọng]` Landing `styles.css` | 3 liên kết chân trang `.footer-links a` đo thật cao chỉ `19px` (vi phạm WCAG 2.5.8 tối thiểu `24px`). | Đo thật Vòng 2: cả 3 liên kết đạt `[44px, 44px, 44px]`, `smallTargets: []` (0 lỗi toàn trang). | ĐÃ KHẮC PHỤC |
| 9 | `[Trung bình]` Landing `index.html` | Sót 13 từ tiếng Anh kỹ thuật (`Local-First`, `SKU`, `GMV`, `file`, `app`, `POS`, `F&B`, `voucher`, `font`, `UTF-8`, `IT`, `menu`, `COD`) gây khó hiểu cho chủ shop lớn tuổi. | Quét thật `document.body.innerText` Vòng 2: 0 từ kỹ thuật thừa (chỉ còn đúng 2 tên gói thương mại CFO `Standard`/`Pro` và tên sàn/định dạng chuẩn `Shopee`, `TikTok`, `CSV`, `Excel`). | ĐÃ KHẮC PHỤC |
| 10 | `[Nhỏ UX]` Landing `styles.css` & `index.html` | Mobile 390px nút "Trả theo tháng / Trả theo năm (Tặng 2 tháng)" bị bẻ xuống 2 dòng chật; ô tiền chưa tự chấm hàng nghìn và đọc tiền bằng chữ khi gõ. | Ảnh chụp Vòng 2 xác nhận nút chu kỳ nằm gọn trên 1 hàng duy nhất ở 390px; dưới ô nhập tiền hiện trực tiếp *"Bằng chữ: 720 triệu đồng"*, *"Bằng chữ: 210 triệu đồng"* và tự định dạng dấu chấm ngay khi gõ. | ĐÃ KHẮC PHỤC |

---

## 2. Kết quả đóng vai thực tế 5 Nhóm Khách Hàng Thật (Persona Walkthrough)

### Persona 1: Cô Hoa (52 tuổi, chủ shop mỹ phẩm và tạp hóa không rành công nghệ)
- **Điểm trải nghiệm:** **95/100**
- **Kịch bản đã bấm thật:** Mở trang bán hàng thử máy tính 10 giây, bấm mở ứng dụng Két Thuế Shop, bấm nút *"Nạp dữ liệu mẫu 15 đơn Shopee/TikTok"*, bấm đổi 4 nhóm ngành nghề trên bộ chọn tùy biến (Custom Listbox), mở bảng *"Xem chi tiết cách tính từng đồng"*.
- **Điều làm tốt:**
  - Trong 3 giây đầu tiên nhìn rõ ngay con số dẫn đầu cỡ lớn `46px` (**Tiền thật được phép xài: 333.800.000 đ**) tách biệt hẳn 2 con số phụ `28px` (**Tiền thực về ví: 608.800.000 đ** và **Tiền thuế dư có thể đòi lại: +18.240.000 đ**).
  - Ngôn ngữ 100% tiếng Việt bình dân, dễ hiểu, có dòng đọc số tiền bằng chữ ngay dưới ô nhập (*"1 triệu 500 nghìn đồng"* trên App, *"Bằng chữ: 600 triệu đồng"* trên Landing) chống gõ nhầm thừa số 0.
  - Khi đổi 4 ngành nghề (`1,5%`, `4,5%`, `7,0%`, `3,0%`) trên dữ liệu vượt 1 tỷ (`1,4 tỷ`), số tiền két thuế cập nhật lập tức từng đồng (`7.500.000 đ` -> `34.500.000 đ` -> `64.500.000 đ` -> `18.500.000 đ`).
- **Điểm có thể tinh gọn thêm (Minor):** Ở màn hình Mobile `390x844`, trong hộp thoại "Ghi thu chi nhanh" vẫn cần cuộn nhẹ xuống dưới nếu muốn xem hết phần ghi chú và nút "Bước 3: Lưu giao dịch"; ở phiên bản sau có thể gộp "Ngày ghi nhận + Ghi chú" vào mục "Tùy chọn thêm" đóng mở 1 chạm để nút Lưu nổi luôn trên màn hình đầu tiên mà không cần cuộn.

### Persona 2: Anh Minh (29 tuổi, chủ shop Shopee/TikTok vội trên điện thoại 4G màn hình `390x844`)
- **Điểm trải nghiệm:** **96/100**
- **Kịch bản đã bấm thật:** Dùng ở khung hình Mobile `390x844` và màn nhỏ `320x568`: bấm nút `+ Ghi nhanh`, chọn "Thu ngoài sàn", chạm chip `+1 triệu` và `+500 nghìn`, bấm Lưu; bấm kéo thanh trượt máy tính 10 giây trên Landing rồi bấm thẳng nút *"Mở Két Thuế Shop lưu sổ với số liệu này"*.
- **Điều làm tốt:**
  - `0px` tràn ngang trên cả `390px` và `320px` ở toàn bộ 4 tab (Tổng quan, Sổ thu chi, Radar thuế, Báo cáo) và toàn bộ Trang bán hàng.
  - Thanh điều hướng 4 tab nằm cố định dưới đáy màn hình đúng tầm ngón cái; toàn bộ nút bấm thao tác trên Mobile App đều đạt kích thước `>= 44px`.
  - Luồng chuyển tiếp từ Landing Page sang App hoạt động hoàn hảo 1 chạm: URL mang đủ tham số `?sector=retail_goods&gmv=720000000&direct=210000000&fee=20`, App tự nạp dữ liệu và hiển thị ngay `772.050.000 đ` tiền được phép xài và `93% mốc 1 tỷ`.

### Persona 3: Chị Lan (36 tuổi, chủ shop chi li, sợ tính nhầm thuế và sợ lộ dữ liệu ra ngoài)
- **Điểm trải nghiệm:** **97/100**
- **Kịch bản đã bấm thật:** Kiểm tra đối chiếu công thức bóc tách GMV vs phí sàn vs tiền về ví; bấm nạp tệp mẫu 15 đơn CSV xem trước bảng 6 dòng; lọc chip "Sàn trừ thừa" và "Đơn bom / hủy"; thử hồ sơ "Shop 3,6 tỷ"; kiểm tra 3 lớp Miễn trừ pháp lý và bảng giá 3 bậc + chính sách hạn mức AI trên Landing Page.
- **Điều làm tốt:**
  - Bóc tách rõ ràng: Tổng bán tính mốc thuế `774.000.000 đ`, Phí sàn `146.960.000 đ`, Tiền thực về ví `608.800.000 đ`, tự động loại `2 đơn (30,5 tr)` bom hàng/hủy.
  - Bắt chính xác 2 đơn sàn trừ nhầm `10%` (`SP260419006` thừa `3.570.000 đ`, `TT260809011` thừa `3.060.000 đ`, tổng thừa `6.630.000 đ`).
  - Hồ sơ `3,6 tỷ` tự động kích hoạt chế độ tính TNCN `17%` trên lợi nhuận có hóa đơn hợp lệ và cảnh báo rõ rủi ro thiếu hóa đơn đầu vào.
  - Đủ 3 lớp Miễn trừ pháp lý (thông báo mở đầu, chân trang, bản in A4 PDF + hộp thoại chi tiết), khẳng định dữ liệu lưu riêng cục bộ trên máy, có nút tải sao lưu và xuất CSV sạch chống formula injection.
  - Bảng giá Landing Page khớp 100% chuẩn CFO: `249.000 đ` (Standard, 150 lượt AI/tháng) / `399.000 đ` (Pro, 300 lượt AI/tháng) / `799.000 đ` (Chuỗi, 600 lượt AI/tháng), gói năm tặng tối đa 2 tháng (`207.500 đ` / `332.500 đ` / `665.833 đ`), tuyệt đối không hứa "AI không giới hạn".

### Persona 4: Anh Tuấn (33 tuổi, người ghét chữ rối, hay đối soát sổ vào ban đêm)
- **Điểm trải nghiệm:** **94/100**
- **Kịch bản đã bấm thật:** Bật Chế độ Tối (Dark Mode) trên cả App và Landing Page ở Desktop `1280x800` và Mobile `390x844`; bấm đóng mở 6 câu Hỏi đáp (FAQ), kiểm tra biểu đồ cột lũy kế 12 tháng trên Tab Radar thuế.
- **Điều làm tốt:**
  - Nền tối dịu mắt (không đen kịt `#000000`, không chói gắt), chữ và nút giữ độ tương phản cao đo thực tế `>= 5,41:1` (App) và `>= 6,56:1` (Landing Page), 0 phần tử trượt WCAG AA.
  - Biểu đồ lũy kế 12 tháng bằng SVG sạch (32 phần tử đồ họa render mượt, đường kẻ đứt vạch đỏ 1 tỷ rõ ràng), 0 emoji lộn xộn, 0 viền màu một cạnh gây rối mắt.
- **Điểm có thể tinh gọn thêm (Minor):** `lint_taste.py` có 1 ghi nhận tham khảo (advisory) rằng `app/styles.css` định nghĩa 36 mã màu hex trong bảng token `:root`; không gây lỗi hiển thị hay tương phản nhưng có thể rút gọn bảng token ở chu kỳ bảo trì sau.

### Persona 5: Bạn Vy (24 tuổi, người hay bấm nhầm, gõ sai số hoặc lỡ tay xóa đơn)
- **Điểm trải nghiệm:** **95/100**
- **Kịch bản đã bấm thật:** Cố tình gõ `-500000`, `abc`, `0` vào ô số tiền cả trên App lẫn Máy tính 10 giây Landing Page; tìm kiếm giao dịch mới tạo trong Sổ thu chi, bấm `Sửa` đổi từ `1.500.000 đ` sang `3.500.000 đ`, kiểm tra màu nút `Xóa`, bấm `Xóa` rồi bấm ngay `Hoàn tác (5s)`.
- **Điều làm tốt:**
  - Mọi giá trị sai (`-500000`, `abc`, `0`) đều bị chặn tức thì kèm thông báo đỏ bằng tiếng Việt nêu rõ cách sửa đúng, không làm mất form đang điền.
  - Nút `Xóa` hiển thị màu đỏ phá hủy rõ nét (`rgb(185, 28, 28)`, chữ trắng ngà `rgb(252, 251, 248)`), tách biệt hẳn với nút `Sửa` trung tính và nút `Lưu` màu xanh ngọc.
  - Luồng Sửa -> Xóa (`18 -> 17` giao dịch) -> bấm `Hoàn tác (5s)` khôi phục trọn vẹn về `18` giao dịch cùng tên ghi chú và số tiền chính xác, thanh Toast không còn đè lên Modal khi thao tác trên Mobile.

---

# CẤP ĐỘ BẰNG CHỨNG ĐẠT ĐƯỢC (LEVEL 1..5) & RỦI RO CÒN TỒN ĐỌNG

- **Cấp độ bằng chứng đạt được:** **LEVEL 3 (Simulated / Real Local Headless Chrome Smoke + Interactive End-to-End & Pixel Audit PASS)**
  - **Level 1 (Source/Contract):** PASS 100% (`check_no_emoji.py`, `lint_native_select.py`, `lint_hardcodes.py`, kiểm tra schema giá CFO & miễn trừ pháp lý).
  - **Level 2 (Build/Unit):** PASS 100% (`node test_tax_engine.mjs` đạt `10/10 PASS`).
  - **Level 3 (Real Browser Interactive & Visual Smoke):** PASS 100% trên Google Chrome thật (`1280x800`, `1440x900`, `390x844`, `320x568`, Sáng & Tối, tương tác đủ mọi nút, xác nhận bằng ảnh chụp màn hình).
  - **Level 4 (Thiết bị di động vật lý thật trên mạng 4G) & Level 5 (Production Hosting công khai):** *Chưa thực hiện trong phạm vi Bước 7 cục bộ (`PENDING`), sẽ xác nhận sau khi triển khai công khai ở bước phát hành.*
- **Rủi ro / cải tiến nhỏ còn tồn đọng (không chặn xuất xưởng):**
  1. *(Minor - App Mobile Modal)* Nút "Bước 3: Lưu giao dịch" trong Modal Ghi nhanh trên Mobile `390x844` nằm hơi thấp cần cuộn nhẹ khi hiển thị đủ 3 ô tùy chọn phụ (Kênh bán, Ngày ghi nhận, Ghi chú ngắn) -> khuyến nghị bản cập nhật v1.1 gom phần tùy chọn phụ vào nút mở rộng để nút Lưu nằm gọn ngay màn hình đầu.
  2. *(Minor - Landing Range Sliders)* 3 thanh trượt `<input type="range">` trên Landing Page có chiều cao hộp `24px` (đạt chuẩn WCAG 2.5.8 `>= 24px`, người dùng vẫn gõ trực tiếp vào ô số cao `44px` ngay bên trên) -> có thể tăng đệm vùng kéo thanh trượt lên `36px` đến `44px` ở bản cập nhật sau để dễ kéo hơn bằng ngón tay cái.
  3. *(Minor - App Token Count)* `lint_taste.py` ghi nhận tư vấn 36 biến hex trong bảng token `:root` của `app/styles.css` -> có thể gom gọn bảng màu lõi trong đợt tối ưu kế tiếp.
