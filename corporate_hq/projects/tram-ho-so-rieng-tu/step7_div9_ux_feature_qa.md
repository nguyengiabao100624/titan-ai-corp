# BÁO CÁO KIỂM THỬ KHÁCH HÀNG THẬT, CHỨC NĂNG 6/6 VÀ UX CHUẨN XIAS v3.1.1 (BƯỚC 7 PHẦN A)

- **Sản phẩm:** Hồ Sơ Riêng Tư (Trạm 6 công cụ xử lý CCCD, Ảnh Thẻ và PDF 100% cục bộ trên trình duyệt)
- **Mã nhiệm vụ:** `msn-bd5ce243` (Bước `msn-bd5ce243-s7` Phần A)
- **Đơn vị thực hiện:** `@tester-khach-hang` (Khối 9: Phòng `#48` 5 Nhóm Khách hàng thật + Phòng `#49` Diệt Rối mắt + Phòng `#52` Kiểm tra Hoàn thiện Chức năng)
- **Môi trường kiểm thử thực tế:** Trình duyệt Google Chrome thật (`chrome.exe --headless=new` điều khiển qua Chrome DevTools Protocol, chụp và soi trực tiếp 14 ảnh màn hình Desktop/Mobile Sáng/Tối, đọc trực tiếp byte đầu/cuối tệp PNG/JPG/WebP/PDF xuất ra, bật chế độ Ngoại tuyến `Network.emulateNetworkConditions({ offline: true })`), kiểm tra đồng thời 2 địa chỉ chạy live:
  1. Ứng dụng chính: `http://127.0.0.1:8765/projects/tram-ho-so-rieng-tu/app/`
  2. Trang giới thiệu bán hàng: `http://127.0.0.1:8765/projects/tram-ho-so-rieng-tu/go-to-market/landing/`

---

# TÓM TẮT QUYẾT ĐỊNH & KẾT QUẢ ĐỊNH LƯỢNG

- **Kết luận cổng Khối 9 (`#48`, `#49`, `#52`):** **ĐẠT CHUẨN 100% (0 LỖI NGHIÊM TRỌNG / TRUNG BÌNH, KHÔNG CẦN PHIẾU ĐẨY TRẢ `bounce-back`)**
- **Điểm Thấu Cảm Người Dùng Thật (`User_Empathy_Score`):** **97/100** (trung bình 5 nhóm người dùng thật: `96,8/100`, vượt xa sàn bắt buộc `>= 85/100`).
- **Hoàn thiện chức năng (`#52`):** **6/6** liên kết chéo từ Trang bán hàng sang Ứng dụng mở đúng công cụ; **6/6** công cụ chạy thật và xuất tệp nhị phân hợp lệ (`PNG`, `JPG`, `WebP`, `PDF %PDF-1.4 ... %%EOF`); **100%** hoạt động khi tắt mạng thật (`offline: true`, `0` yêu cầu gửi ra mạng).

| Chỉ số đo thực tế trên Chrome thật (CDP) | Ứng dụng (`app/`) | Trang bán hàng (`go-to-market/landing/`) | Kết quả |
| :--- | :---: | :---: | :---: |
| Lỗi Console JS (`console.error` / `assert`) | `0` | `0` | ĐẠT |
| Ngoại lệ trang (`Runtime.exceptionThrown`) | `0` | `0` | ĐẠT |
| Lỗi mạng HTTP 4xx/5xx | `0` | `0` | ĐẠT |
| Yêu cầu mạng ra tên miền ngoài (Zero-Upload / 0 CDN) | `0` | `0` | ĐẠT |
| Hoạt động Ngoại tuyến thật (`offline: true` qua CDP) | Xuất PDF CCCD `359,3 KB` thành công, `0` request | Bảng chứng minh riêng tư sẵn sàng | ĐẠT |
| Tràn ngang Desktop `1440x900`, Mobile `390x844` & `320x568` | `0px` (cả 6 công cụ, Sáng & Tối) | `0px` (Sáng & Tối) | ĐẠT |
| Tương phản WCAG 2.2 AA Chế độ Sáng (đo Canvas 2D) | `0` lỗi (min `5,57:1` trên cả 6 công cụ) | `171/171` PASS (min `6,11:1`) | ĐẠT |
| Tương phản WCAG 2.2 AA Chế độ Tối (đo Canvas 2D) | `0` lỗi (min `5,54:1` trên cả 6 công cụ) | `171/171` PASS (min `7,32:1`) | ĐẠT |
| Vùng chạm WCAG 2.5.8 (`>= 24x24px`) | `0` nút dưới `24px` | `0` nút dưới `24px` (3 link chân trang `44px`) | ĐẠT |
| Tỷ lệ cỡ chữ dẫn đầu (`One thing leads >= 2,5x`) | Khối mở đầu bất đối xứng 7/5 rõ điểm nhấn | `3,35x` (Hero 8/4 sắc nét) | ĐẠT |
| Thẻ `<select>` gốc & `<input type="range">` | `0` `<select>`, `0` `range` | `0` `<select>`, `0` `range` | ĐẠT |
| Cổng XIAS `check_no_emoji`, `lint_native_select`, `lint_hardcodes`, `validate_theme_refs`, `lint_taste --strict` | **5/5 EXIT=0 (0 lỗi, 129/129 token)** | **5/5 EXIT=0 (0 lỗi, 140/140 token)** | ĐẠT |
| Tiếng Anh kỹ thuật thừa, gạch ngang dài, viền 1 cạnh | `0` từ thừa, `0` em/en dash, `0` viền 1 cạnh | `0` từ thừa, `0` em/en dash, `0` viền 1 cạnh | ĐẠT |

> **Tuyên bố phạm vi trung thực theo chuẩn XIAS v3.1.1:** Các bộ đo tự động chứng minh **tính đúng đắn kỹ thuật và khả năng truy cập khách quan** (tương phản màu thực tế, tràn ngang 0px, kích thước vùng chạm, nhị phân tệp xuất ra, ngoại tuyến 0 byte và tuân thủ token). Phần **thẩm mỹ và trải nghiệm cảm nhận** được đánh giá định tính bằng việc xem trực tiếp 14 ảnh chụp màn hình thật và đóng vai 5 nhóm người dân đời thực; không có chỉ số tự động nào tự chứng minh 100% về gu thẩm mỹ.

---

# NGUỒN THỰC TẾ VỪA TRA CỨU TRỰC TIẾP (LIVE CITATIONS)

1. **W3C WCAG 2.2 Success Criterion 2.5.8 (Target Size Minimum, Level AA) & 2.5.5 (Enhanced, Level AAA):** Sàn tối thiểu `24x24 CSS px` cho mọi điều khiển tương tác và khuyến nghị `44x44px` cho trải nghiệm một tay trên điện thoại (`w3.org`, `weaccess.ai`).
2. **Nielsen Norman Group (NN/g) Mobile Ergonomics (Quy tắc 1cm x 1cm):** Khuyến nghị vùng chạm tối ưu `44px` đến `48px` giúp người lớn tuổi và người dùng di động không bấm trượt (`nngroup.com`).
3. **Baymard Institute Mobile Form Validation & Undo Recovery Patterns:** Nêu rõ lỗi ngay sát ô nhập bằng ngôn ngữ tự nhiên kèm hướng dẫn cách sửa, giữ nguyên dữ liệu đã nhập và có Hoàn tác 5 giây cho hành động xóa (`baymard.com`).

---

# NỘI DUNG CHI TIẾT: KIỂM THỬ 6/6 CHỨC NĂNG, NGOẠI TUYẾN THẬT & 5 NHÓM KHÁCH HÀNG

## 1. Kiểm tra liên kết chéo Landing Page sang 6 Công cụ App (`#52`)

Bấm trực tiếp lần lượt cả 6 thẻ công cụ `.tool-card` trên Trang bán hàng (`go-to-market/landing/index.html`):

| Liên kết trên Landing Page | Đường dẫn đích thực tế | Tab kích hoạt trên App (`aria-selected`) | Bảng công cụ hiển thị (`panelVisible`) | Kết quả |
| :--- | :--- | :---: | :---: | :---: |
| 1. Ghép 2 mặt CCCD A4 + Dấu chìm | `../../app/index.html#cccd` | `#tab-cccd = true` | `#panel-cccd = true` | ĐẠT |
| 2. Nén ảnh và PDF `<= 2 MB` | `../../app/index.html#compress` | `#tab-compress = true` | `#panel-compress = true` | ĐẠT |
| 3. Tạo ảnh thẻ 3x4 / 4x6 dàn 10x15cm | `../../app/index.html#idphoto` | `#tab-idphoto = true` | `#panel-idphoto = true` | ĐẠT |
| 4. Ký tên tay lên đơn + xuất PDF | `../../app/index.html#sign` | `#tab-sign = true` | `#panel-sign = true` | ĐẠT |
| 5. Gộp nhiều ảnh ra PDF A4 | `../../app/index.html#merge` | `#tab-merge = true` | `#panel-merge = true` | ĐẠT |
| 6. Xóa GPS / EXIF & đổi định dạng | `../../app/index.html#exif` | `#tab-exif = true` | `#panel-exif = true` | ĐẠT |

## 2. Kết quả chạy thật 6/6 Công cụ & Kiểm chứng Nhị phân Đầu ra (`#52`)

1. **Công cụ 1 (Ghép CCCD 2 mặt A4 + Dấu chìm):**
   - Nạp ảnh CCCD mẫu 2 mặt (`29.386` điểm mẫu không trắng trên Canvas xem trước), xoay mặt trước 4x90 độ, chọn mẫu dấu chìm `Xin việc`, độ đậm `Rõ nét (38%)`, mở Custom Listbox đổi màu chữ sang `Xám than trung tính (trang nhã)`.
   - Xuất thật **PNG** (`879.787 bytes`, header nhị phân chuẩn `89 50 4e 47 ... IEND`) và **PDF A4** (`359.296 bytes`, header `%PDF-1.4`, `1 trang`, đuôi `%%EOF`).
2. **Công cụ 2 (Nén ảnh & PDF chuẩn Dịch vụ công `<= 2 MB`):**
   - Thử nhập số âm `-100` vào ô giới hạn tùy chọn -> lập tức chặn và hiện lỗi tiếng Việt rõ ràng: *"Vui lòng nhập số dương tính bằng KB (ví dụ: 2048 cho 2 MB, tối thiểu 50 KB)."*
   - Nạp ảnh tài liệu mẫu `8,66 MB` (`9.084.579 bytes`), chọn mốc `<= 2 MB (Dịch vụ công)`, bấm `Nén đúng mức ngay` -> thuật toán tìm kiếm nhị phân nén thành công xuống **`1,90 MB` (giảm `-78%`, trạng thái `Đạt chuẩn Dịch vụ công`)**, xuất thật **PDF nén** (`1.991.158 bytes`, `%PDF-1.4 ... %%EOF`, đạt chuẩn `< 2,00 MB`).
3. **Công cụ 3 (Ảnh thẻ 3x4 dàn 8 ảnh 10x15cm + Đổi nền xanh/trắng):**
   - Nạp ảnh chân dung mẫu, đo trực tiếp màu nền góc ảnh trên Canvas khi bấm đổi `Xanh dương ảnh thẻ` (`rgba(34, 108, 214, 255)`) sang `Trắng hộ chiếu` (`rgba(248, 250, 252, 255)`) xác nhận `bgChanged: true`.
   - Thử phóng to `110%`, căn giữa, chuyển chế độ xem `Tờ in 10x15cm` (8 ảnh 3x4 kèm đường cắt), xuất thật **JPG 300 DPI** (`140.278 bytes`, header `ff d8 ff e0 JFIF ... ff d9`) và **PDF A6** (`128.674 bytes`, `%PDF-1.4 ... %%EOF`).
4. **Công cụ 4 (Ký tên tay lên Canvas + Dán lên đơn + Xuất PDF A4):**
   - Nạp mẫu `Đơn xin xác nhận`, vẽ nét chữ ký thật bằng chuỗi sự kiện chuột CDP (`mousePressed -> mouseMoved -> mouseReleased`) lên `#sign-pad-canvas` -> đo thật `3.834` điểm mực trên bảng ký.
   - Nhấp vào vị trí mới trên trang đơn `#sign-preview-canvas` -> huy hiệu tọa độ cập nhật lập tức (`Vị trí: 74%, 76%` -> `Vị trí: 65%, 70%`), xuất thật **PDF A4 đã ký** (`136.884 bytes`, `%PDF-1.4 ... %%EOF`).
5. **Công cụ 5 (Gộp 3 ảnh mẫu ra PDF A4 + Xoay / Đổi thứ tự / Xóa & Hoàn tác 5s):**
   - Nạp 3 trang hồ sơ mẫu (`3 trang`), bấm đẩy trang 1 xuống dưới (đổi thứ tự `ho_so_trang_1.jpg` -> `ho_so_trang_2.jpg` lên đầu thành công), bấm xoay `90 độ`.
   - Kiểm tra nút `Xóa` dùng đúng màu đỏ phá hủy `rgb(185, 28, 28)` trên chữ sáng `rgb(252, 251, 248)` -> bấm `Xóa` (`3 trang` -> `2 trang`), thanh thông báo Hoàn tác 5 giây hiện tức thì -> bấm `Hoàn tác (5s)` khôi phục trọn vẹn về `3 trang`.
   - Xuất thật **PDF A4 đa trang** (`340.528 bytes`, header `%PDF-1.4`, xác minh `/Count 3` đủ 3 trang, đuôi `%%EOF`).
6. **Công cụ 6 (Quét & Xóa vị trí GPS / EXIF + Đổi định dạng):**
   - Nạp ảnh mẫu có gắn EXIF/GPS (`15.176 bytes`, header `ff d8 ff e1 ... Exif ... DEMO-CAM`), bảng quét phát hiện ngay *"EXIF (Thông tin máy ảnh / thời gian chụp), Tọa độ vị trí GPS"*.
   - Chọn định dạng `WebP (Siêu nhẹ)` rồi bấm `Gỡ sạch EXIF/GPS và Chuyển đổi` -> báo *"Đã gỡ sạch 100% EXIF / GPS"*, dung lượng giảm còn `8,0 KB` (`8.230 bytes`, header chuẩn `RIFF...WEBPVP8X`).

## 3. Kiểm chứng Chế độ Ngoại Tuyến Thật (`offline: true`) & Xóa sạch RAM

- Kích hoạt cắt mạng thật qua Chrome DevTools Protocol (`Network.emulateNetworkConditions({ offline: true })`):
  - Trình duyệt xác nhận `navigator.onLine === false`.
  - Thanh Chứng nhận Riêng Tư Sống trên đỉnh trang tự động đổi thành: **"Đang ngoại tuyến: 6 công cụ vẫn chạy 100% trên máy!"**.
  - Thực hiện nạp ảnh CCCD mẫu 2 mặt và bấm `Tải tệp PDF A4` trong lúc mất mạng hoàn toàn: xuất thành công tệp PDF hợp lệ `359.296 bytes` (`%PDF-1.4 ... %%EOF`), **`attemptedNetworkRequestsDuringOffline: []` (`0` yêu cầu mạng)** và **`0` lỗi Console**.
- Thử nút đỏ `Xóa sạch ảnh đang mở` -> hộp thoại xác nhận hiện nút đỏ `rgb(185, 28, 28)` -> bấm `Xác nhận xóa sạch ngay` -> giải phóng sạch bộ nhớ, trạng thái CCCD chuyển về *"Đã xóa sạch ảnh CCCD khỏi bộ nhớ máy."*.

## 4. Kiểm thử Trang Giới Thiệu Bán Hàng (`go-to-market/landing/`)

- **Máy tính tiết kiệm (0 slider):** Bấm chip `5 lần` + nút `+` + `Gia đình 4 người` -> kết quả cập nhật tức thì từ `702.000 đ` lên `2.328.000 đ` (`18 giờ 24 phút / năm`). Nhập số âm `-5` báo lỗi đỏ rõ: *"Số lần không được âm. Hãy nhập số từ 0 đến 200."*
- **Bảng giá & Hộp thoại VietQR trung thực:** Khớp chuẩn CFO `0 đ` / `15.000 đ` / `59.000 đ`, không gắn cổng thanh toán giả; bấm mở hộp thoại cả gói `15.000 đ` và `59.000 đ` đều hiển thị đúng nội dung, đóng mượt bằng phím `Escape` lẫn nút `Đóng hướng dẫn`.
- **Hỏi đáp (FAQ) & Miễn trừ Nghị định 13/2023/NĐ-CP:** Đóng/mở mượt, 3 liên kết chân trang đạt chiều cao `44px`, đầy đủ tuyên bố miễn trừ pháp lý và bảo vệ dữ liệu cá nhân.

## 5. Chấm điểm 5 Nhóm Khách Hàng Thật (`#48` & `#49`)

| Nhóm khách hàng đóng vai | Kịch bản trải nghiệm thực tế | Điểm UX | Nhận xét cốt lõi |
| :--- | :--- | :---: | :--- |
| 1. Sinh viên nộp hồ sơ xin việc / nhập học | Vào Landing bấm thẻ `#merge` và `#idphoto`, gộp 3 ảnh ra PDF A4, xoay & đổi thứ tự, tạo tờ 8 ảnh 3x4 | **96/100** | Đúng 3 chạm là có tệp PDF và tờ ảnh in 3.000đ, 0 logo che ảnh, có nút Hoàn tác 5s cứu khi xóa nhầm trang. |
| 2. Cô chú 55 tuổi ghép CCCD gửi thuê nhà / ngân hàng | Mở `#cccd`, nạp mẫu 2 mặt, chọn 1 chạm mẫu dấu chìm "Thuê nhà", tải PDF A4 | **96/100** | 100% tiếng Việt bình dân, 0 từ tiếng Anh kỹ thuật gây sợ, không có thanh trượt khó kéo, tương phản chữ cao `>= 5,57:1`. |
| 3. Nhân viên văn phòng nén hồ sơ nộp Dịch vụ công | Mở `#compress`, chọn 1 chạm `<= 2 MB (Dịch vụ công)`, nén tệp `8,66 MB` xuống `1,90 MB` tải PDF | **97/100** | Nhìn bảng Trước/Sau hiểu ngay giảm `-78%` và đạt chuẩn nộp cổng Dịch vụ công; chặn nhập số âm rất rõ ràng. |
| 4. Người cần ảnh thẻ gấp buổi tối | Mở `#idphoto`, đổi nền xanh/trắng cục bộ, căn khung bằng nút bấm, xuất tờ 8 ảnh 10x15cm 300 DPI | **97/100** | Xem trực tiếp tờ 8 ảnh có đường cắt mảnh rõ nét, đổi nền xanh/trắng tức thì không cần ra tiệm. |
| 5. Người kỹ tính sợ lộ ảnh CCCD & vị trí nhà | Bật tắt mạng thật kiểm chứng ngoại tuyến, quét gỡ 100% EXIF/GPS sang WebP, bấm Xóa sạch ảnh đang mở | **98/100** | Thanh trạng thái tự báo ngoại tuyến, 0 byte gửi ra mạng, phát hiện & xóa sạch GPS có kiểm chứng lại, nút Xóa sạch màu đỏ tách biệt. |

- **Điểm trung bình 5 nhóm khách hàng (`User_Empathy_Score`):** **`97/100`** (trung bình thực `96,8/100`).

---

# CẤP ĐỘ BẰNG CHỨNG ĐẠT ĐƯỢC (LEVEL 1..5) & CẢI TIẾN NHỎ KHUYẾN NGHỊ

- **Cấp độ bằng chứng đạt được:** **LEVEL 3 (Real Chrome Headless CDP End-to-End, Binary Output & True Offline Smoke PASS)**
  - **Level 1 (Source/Contract):** PASS 100% (5/5 cổng XIAS EXIT=0 trên cả `app/` và `go-to-market/landing/`).
  - **Level 2 (Build/Unit):** PASS 100% (đã khớp dữ liệu từ `test_engines.mjs` và kiểm chứng nhị phân thực tế trên Chrome).
  - **Level 3 (Real Browser Interactive, Offline & Visual Pixel Audit):** PASS 100% trên Desktop `1440x900` (Sáng/Tối), Mobile `390x844` (Sáng/Tối), `320x568`, soi trực tiếp 14 ảnh chụp màn hình.
  - **Level 4 (Điện thoại thật chạy Chế độ Máy bay vật lý) & Level 5 (Triển khai công khai trên GitHub Pages):** *PENDING sau bước xuất bản công khai.*
- **2 gợi ý tinh chỉnh thẩm mỹ nhỏ cho bản v1.1 (mức Minor / Advisory, không chặn xuất xưởng):**
  1. *(Công cụ 6 EXIF, `app/styles.css`)*: Khi soi ảnh `hsrt_app_t6_exif_light.png`, huy hiệu trạng thái `.badge` nhiều dòng trong ô bảng hẹp bo tròn dạng `pill` tạo hình bầu dục hơi cao; ở bản v1.1 nên đổi huy hiệu trong ô bảng sang góc bo chữ nhật gọn (`var(--radius-sm)`) để dòng bảng thanh thoát hơn.
  2. *(Mobile `390x844` khi đi từ liên kết `#cccd..#exif`)*: Trên điện thoại, phần thanh riêng tư và khối giới thiệu phía trên đẩy khu vực 6 tab xuống sát đáy màn hình đầu tiên; bản v1.1 có thể tự động cuộn mượt tới khung công cụ tương ứng khi người dùng mở từ liên kết có mã neo `#...` để giảm thêm 1 thao tác vuốt tay.
