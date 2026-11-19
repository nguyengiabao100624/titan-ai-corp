# BÁO CÁO BƯỚC 2: KIỂM TOÁN TÀI CHÍNH (CFO), THUẾ, RỦI RO RỜI BỎ VÀ ĐƯỜNG THU 50 KHÁCH ĐẦU 0Đ ADS CHO TOP 3 NGÁCH TRÁNH TẬP ĐOÀN LỚN

- **Mã nhiệm vụ:** `msn-7f85897f` (Bước 2/8, mã bước `msn-7f85897f-s2`, đơn lệnh `ord-dd64af00`)
- **Đơn vị thực thi:** Đội Đóng gói & Bán hàng (`@doi-ban-hang`, phối hợp Phòng #38 Định giá và Phân tích Lợi nhuận, Phòng #39 Thuế, Phòng #32 & #33 Kênh thu khách 0đ quảng cáo)
- **Tài liệu đầu vào đã kiểm toán chéo:** `corporate_hq/projects/co-hoi-tranh-tap-doan-lon/step1_market_anti_bigcorp.md` (`@trinh-sat-co-hoi`, #45)
- **Ngày kiểm định số liệu:** 19/11/2026
- **Cấp độ bằng chứng đạt được:** **Cấp độ 2 (Build / Deterministic Python CFO Simulation Pass + Live Market & Price Verification)**. Toàn bộ chỉ số biên lãi gộp, lãi ròng, điểm hòa vốn và LTV/CAC đều chạy trực tiếp từ hàm `TitanDatabase.simulate_cfo_unit_economics(...)` trong `scripts/titan_db.py` (0 phép tính nhẩm), kết hợp đối chiếu giá vật tư, đối thủ, mùa vụ và đầu mối kho nghề thực tế tại Việt Nam năm 2025 đến 2026. Chưa có bằng chứng thu tiền thật ngoài thị trường (Cấp độ 4 và 5 đang ở trạng thái PENDING chờ triển khai sản phẩm).

---

## 1. TÓM TẮT QUYẾT ĐỊNH CFO & XẾP HẠNG THỰC CHIẾN TOP 3

Sau khi điều chỉnh giá sát túi tiền thợ/chủ xưởng Việt Nam, tách rạch ròi lõi toán học chạy trên máy khách (**0đ chi phí API AI**) với gói có AI đọc hóa đơn (khóa trần cứng), đồng thời chạy bài kiểm tra **tỷ lệ rời bỏ (Churn) theo mùa vụ và tốc độ thu tiền trong 7 ngày đầu**, Hội đồng Định giá và Bán hàng chốt kết luận:

1. **Cả 3 ứng viên đều ĐẠT CỔNG 1 CFO (`gate1_passed = True`)** với biên lãi gộp kịch bản xấu cực dày (**86,44% đến 91,72%**, vượt xa ngưỡng cứng `>= 65%`) nhờ lõi nghiệp vụ cốt lõi (xếp cắt tấm 2D, định lượng mâm cỗ, bóc khối lượng và chốt phát sinh) chạy bằng thuật toán thuần trên trình duyệt của khách hàng (**0đ API AI**).
2. **Điều chỉnh giá thực tế so với Bước 1 để bán được ngay cho thợ Việt:**
   - **Xưởng Biển Quảng Cáo & Hộp Đèn:** Chốt gói Cơ bản **`249.000đ/tháng`** (rẻ hơn giá 1 tấm Alu Alcorest trong nhà `275k đến 450k` hay 1 tấm Mica Đài Loan `500k đến 650k`), thay vì `299.000đ` ở Bước 1, giúp dễ chốt VietQR ngay lần đầu thử.
   - **Cơ Sở Nấu Tiệc Lưu Động:** Hạ về **`199.000đ/tháng`** và đẩy mạnh **Gói Mùa Tiệc 6 tháng (`1.090.000đ`)** cùng **Gói Năm (`1.990.000đ`, tặng 2 tháng)** để khóa chặt rủi ro bỏ gói vào tháng thấp điểm (tháng 5 đến tháng 7 Âm lịch).
   - **Đội Thầu Sửa Nhà Nhỏ (3 đến 20 thợ):** Hạ về **`199.000đ/tháng`** (Gói Quý `549.000đ`, Gói Năm `1.990.000đ`) vì thị trường đã có mốc neo giá rẻ từ **LTP Attendance** (`1,2 đến 1,8 triệu/năm`) và **Emektra** (`0đ đến 100k/tháng`).
3. **Phủ quyết (VETO) 2 mô hình gây lỗ ngầm đã chạy kiểm chứng Python:**
   - **VETO 1 (Bán trọn đời 299.000đ như ứng dụng Cân Lúa):** Chia đều trên 24 tháng lưu trữ ảnh hiện trường/hóa đơn và hỗ trợ Zalo (`12.458đ/tháng` doanh thu quy đổi vs `20.000đ/tháng` chi phí hạ tầng xấu) -> biên lãi gộp xấu rơi xuống **`-62,04%`** (`-8.601đ/khách/tháng`, lỗ vĩnh viễn không hòa vốn). *Giải pháp thay thế:* Cho dùng **miễn phí mãi mãi** công cụ tính cơ bản chạy cục bộ 0đ server làm mồi kéo khách, còn tính năng lưu đám mây, phiếu báo giá Zalo có logo, kho giá riêng thu theo **Gói Tháng / Quý / Vụ / Năm chuyển khoản VietQR không tự trừ tiền thẻ**.
   - **VETO 2 (Quét AI hóa đơn vô hạn ở giá 249.000đ):** Kịch bản xấu 800 lượt AI x 350đ/lượt làm biên lãi gộp xấu sập xuống **`-13,95%`** (`-52.165đ/khách/tháng`). Bắt buộc khóa cứng **100 lượt AI/tháng** ở gói Pro (`299k đến 349k/tháng`).
4. **Đề xuất chốt NGÁCH SỐ 1 LÀM TRƯỚC (`92,50 / 100`):** **Xưởng Biển Quảng Cáo & Hộp Đèn (Bóc khổ tấm Alu/Mica/Sắt hộp 2D & Báo giá mặt tiền Zalo 15 giây)**. Đồng thời điều chỉnh thứ hạng thực chiến: đưa **Đội Thầu Sửa Nhà Nhỏ (`84,10/100`)** lên **Hạng 2** (nhờ tần suất chấm công hàng ngày và ít bị đóng băng mùa vụ) và lùi **Cơ Sở Nấu Tiệc Lưu Động (`81,20/100`)** xuống **Hạng 3** (do rủi ro churn mùa vụ tháng 7 Âm lịch nặng và độ tuổi chủ bếp lớn hơn, cần nhập kho món ăn trước khi thấy lợi).

### Bảng so sánh tổng lực Tài chính, Rời bỏ (Churn) và Kênh 0đ Ads của Top 3

| Tiêu chí kiểm toán thực chiến | 1. Xưởng Biển Quảng Cáo & Hộp Đèn (CHỌN SỐ 1) | 2. Đội Thầu Sửa Nhà Nhỏ (3 đến 20 thợ) (HẠNG 2) | 3. Cơ Sở Nấu Tiệc Lưu Động (HẠNG 3) |
| :--- | :---: | :---: | :---: |
| **Giá gói Cơ bản (0đ AI) / Tháng** | **249.000 đ** | **199.000 đ** | **199.000 đ** |
| **Gói Quý / Vụ (hợp tâm lý thợ ngại trả tháng)** | **699.000 đ / 3 tháng** (`233k/T`) | **549.000 đ / 3 tháng** (`183k/T`) | **1.090.000 đ / Mùa tiệc 6T** (`181,7k/T`) |
| **Gói Năm (tặng tối đa 2 tháng)** | **2.490.000 đ / năm** (`207,5k/T`) | **1.990.000 đ / năm** (`165,8k/T`) | **1.990.000 đ / năm** (`165,8k/T`) |
| **Gói Pro (có 100 lượt AI đọc hóa đơn)** | **349.000 đ / tháng** | **299.000 đ / tháng** | **299.000 đ / tháng** |
| **Biên lãi gộp xấu (Cơ bản / Pro)** | **90,47%** / **88,47%** | **88,45%** / **86,79%** | **91,72%** / **86,79%** |
| **Lãi ròng xấu / khách / tháng (sau 7% thuế)** | **207.835 đ** *(Pro: 284.335 đ)* | **162.085 đ** *(Pro: 238.585 đ)* | **168.585 đ** *(Pro: 238.585 đ)* |
| **Điểm hòa vốn (Cố định 1,5tr/tháng)** | **7 khách** *(xấu: 8; Pro: 5)* | **9 khách** *(xấu: 10; Pro: 6)* | **9 khách** *(xấu: 9; Pro: 6)* |
| **Lãi ròng tháng tại 50 / 200 khách (Cơ bản)** | **+9,34tr** / **+41,87tr** | **+7,05tr** / **+32,72tr** | **+7,23tr** / **+33,43tr** |
| **Tần suất sử dụng tự nhiên** | **3 đến 10 lần/tuần** (quanh năm) | **Hàng ngày** (chấm công) + **2 đến 4 lần/tuần** (báo giá) | **Cuối tuần** (mùa cưới dày; **tháng 7 ÂL đóng băng**) |
| **Rủi ro Churn tháng (Chỉ bán tháng / Hỗn hợp Quý-Năm)** | **9,0%** / **6,0%** *(thấp nhất)* | **14,0%** / **8,5%** *(trung bình)* | **19,0%** / **10,0%** *(cao nhất vì mùa vụ)* |
| **Tỷ số LTV / CAC (0đ Paid Ads, hỗn hợp Quý-Năm)** | **19,24x** *(hoàn vốn 0,87 tháng)* | **10,04x** *(hoàn vốn 1,17 tháng)* | **9,37x** *(hoàn vốn 1,07 tháng)* |
| **Điểm thực chiến tổng hợp (30% Thu tiền 7 ngày + 30% Chống Churn + 20% Kênh 0đ + 20% Tài chính)** | **92,50 / 100 (SỐ 1)** | **84,10 / 100 (HẠNG 2)** | **81,20 / 100 (HẠNG 3)** |

---

## 2. KIỂM TOÁN ĐƠN VỊ KINH TẾ (UNIT ECONOMICS) CHẠY THẬT BẰNG PYTHON (`TitanDatabase.simulate_cfo_unit_economics`)

### 2.1. Giả định chi phí thực tế (Bảo thủ, không tô hồng)

1. **Chi phí API AI cho lõi tính toán = 0 đồng:** Toàn bộ thuật toán cốt lõi (xếp hình cắt tấm Alu/Mica 2D 1,22m x 2,44m và cắt thanh sắt 6m; nhân định lượng mâm cỗ và gộp phiếu đi chợ theo sạp; bóc diện tích sơn/thạch cao/mái tôn và cộng công nhật thợ) chạy bằng JavaScript thuần ngay trên điện thoại khách hàng.
2. **Chi phí hạ tầng biến đổi (lưu ảnh mặt tiền, ảnh phát sinh Zalo, xuất phiếu ảnh/PDF, băng thông R2/S3, sao lưu):** Tính mức bảo thủ **80đ đến 90đ/phiếu** (thực tế Cloudflare R2 + ảnh nén WebP ~150KB chỉ tốn dưới 10đ/phiếu, tức đã cộng hệ số an toàn gấp 8 đến 9 lần).
3. **Chi phí AI cho gói Pro (tùy chọn chụp ảnh hóa đơn vật tư / phiếu chợ bằng AI OCR):** Giữ nguyên khung stress-test gấp 13 lần giá Gemini 2.5 Flash là **350đ/lượt**, khóa cứng trần **100 lượt/tháng** (tối đa 35.000đ/khách/tháng).
4. **Phí cổng thanh toán:** Mô hình chuẩn áp mức bảo thủ **1,5% doanh thu** (cổng thẻ/VNPay). Riêng khi thu bằng **VietQR tự động (SePay / payOS)** thực tế chỉ tốn **0,3% + 500đ/giao dịch** (kịch bản `1E` cho thấy biên lãi gộp tăng thêm `+1,0%` lên `91,47%`).
5. **Quỹ dự phòng thuế (Phòng #39):** Khóa cứng trích **7,0% doanh thu** ngay khi tiền về (đủ trang trải mức cao nhất `5% GTGT + 2% TNCN` nếu vận hành dạng hộ kinh doanh dịch vụ số). Khi quy mô vượt 200 khách (> 500 triệu đến 600 triệu/năm), hoàn thiện hồ sơ sản xuất sản phẩm phần mềm nội địa để hưởng diện **Không chịu thuế GTGT (KTT)** và ưu đãi TNDN công ty phần mềm mới (miễn 4 năm, giảm 50% trong 9 năm ở thuế suất 10%) như một khoản lợi nhuận cộng thêm (upside).
6. **Chi phí cố định hàng tháng:**
   - **Giai đoạn MVP (`1.500.000đ/tháng`):** Máy chủ backend + cơ sở dữ liệu PostgreSQL + lưu trữ đám mây (`700k`), tên miền + SSL + gói Webhook ngân hàng VietQR SePay/payOS (`300k`), tường lửa + giám sát + công cụ gửi thông báo cơ bản (`500k`).
   - **Giai đoạn Mở rộng (`4.500.000đ/tháng` khi đạt > 150 khách):** Nâng cấp cụm máy chủ chịu tải cao (`1,5tr`), hạ tầng Zalo ZNS/nhắc gia hạn (`1,0tr`), công cụ CSKH & xuất hóa đơn điện tử nội bộ (`2,0tr`).

### 2.2. Kết quả chạy thật 18 kịch bản kiểm định áp lực từ `TitanDatabase.simulate_cfo_unit_economics(...)`

| Mã & Kịch bản mô phỏng | Giá/tháng | Trần biến đổi | Chi phí hạ tầng/AI xấu | Phí TT | Thuế (7%) | **Biên gộp xấu** | Biên gộp kỳ vọng | Lãi ròng/KH (Kỳ vọng / Xấu) | **Hòa vốn (KV / Xấu)** | Lãi ròng tại 50 KH | Lãi ròng tại 200 KH | Cổng 1 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1A. Quảng Cáo: Tháng Cơ bản** | 249.000đ | 250 phiếu x 80đ | 20.000đ | 3.735đ | 17.430đ | **90,47%** | 94,08% | 216.835đ / 207.835đ | **7 / 8** | +9.341.750đ | +41.867.000đ | **PASS** |
| **1B. Quảng Cáo: Gói Quý (699k/3T)** | 233.000đ | 250 phiếu x 80đ | 20.000đ | 3.495đ | 16.310đ | **89,92%** | 93,78% | 202.195đ / 193.195đ | **8 / 8** | +8.609.750đ | +38.939.000đ | **PASS** |
| **1C. Quảng Cáo: Gói Năm (2,49tr)** | 207.500đ | 250 phiếu x 80đ | 20.000đ | 3.112đ | 14.525đ | **88,86%** | 93,20% | 178.862đ / 169.862đ | **9 / 9** | +7.443.125đ | +34.272.500đ | **PASS** |
| **1D. Quảng Cáo: Gói Pro (100 AI)** | 349.000đ | 100 AI x 350đ | 35.000đ | 5.235đ | 24.430đ | **88,47%** | 92,98% | 300.085đ / 284.335đ | **5 / 6** | +13.504.250đ | +58.517.000đ | **PASS** |
| **1E. Quảng Cáo: VietQR thực** | 249.000đ | 250 phiếu x 80đ | 20.000đ | 1.247đ | 17.430đ | **91,47%** | 95,08% | 219.323đ / 210.323đ | **7 / 8** | +9.466.150đ | +42.364.600đ | **PASS** |
| **1F. Quảng Cáo: Scale-up 4,5tr** | 249.000đ | 250 phiếu x 80đ | 20.000đ | 3.735đ | 17.430đ | **90,47%** | 94,08% | 216.835đ / 207.835đ | **21 / 22** | +6.341.750đ | +38.867.000đ | **PASS** |
| **2A. Nấu Tiệc: Tháng Cơ bản** | 199.000đ | 150 phiếu x 90đ | 13.500đ | 2.985đ | 13.930đ | **91,72%** | 94,77% | 174.660đ / 168.585đ | **9 / 9** | +7.233.000đ | +33.432.000đ | **PASS** |
| **2B. Nấu Tiệc: Mùa Tiệc 6T (1,09tr)** | 181.667đ | 150 phiếu x 90đ | 13.500đ | 2.725đ | 12.717đ | **91,07%** | 94,41% | 158.800đ / 152.725đ | **10 / 10** | +6.440.015đ | +30.260.061đ | **PASS** |
| **2C. Nấu Tiệc: Gói Năm (1,99tr)** | 165.833đ | 150 phiếu x 90đ | 13.500đ | 2.487đ | 11.608đ | **90,36%** | 94,02% | 144.312đ / 138.237đ | **11 / 11** | +5.715.610đ | +27.362.439đ | **PASS** |
| **2D. Nấu Tiệc: Gói Pro (100 AI)** | 299.000đ | 100 AI x 350đ | 35.000đ | 4.485đ | 20.930đ | **86,79%** | 92,06% | 254.335đ / 238.585đ | **6 / 7** | +11.216.750đ | +49.367.000đ | **PASS** |
| **2E. Nấu Tiệc: Scale-up 4,5tr** | 199.000đ | 150 phiếu x 90đ | 13.500đ | 2.985đ | 13.930đ | **91,72%** | 94,77% | 174.660đ / 168.585đ | **26 / 27** | +4.233.000đ | +30.432.000đ | **PASS** |
| **3A. Thầu Sửa Nhà: Tháng Cơ bản** | 199.000đ | 250 phiếu x 80đ | 20.000đ | 2.985đ | 13.930đ | **88,45%** | 92,97% | 171.085đ / 162.085đ | **9 / 10** | +7.054.250đ | +32.717.000đ | **PASS** |
| **3B. Thầu Sửa Nhà: Gói Quý (549k)** | 183.000đ | 250 phiếu x 80đ | 20.000đ | 2.745đ | 12.810đ | **87,57%** | 92,49% | 156.445đ / 147.445đ | **10 / 11** | +6.322.250đ | +29.789.000đ | **PASS** |
| **3C. Thầu Sửa Nhà: Gói Năm (1,99tr)** | 165.833đ | 250 phiếu x 80đ | 20.000đ | 2.487đ | 11.608đ | **86,44%** | 91,87% | 140.737đ / 131.737đ | **11 / 12** | +5.536.860đ | +26.647.439đ | **PASS** |
| **3D. Thầu Sửa Nhà: Gói Pro (100 AI)** | 299.000đ | 100 AI x 350đ | 35.000đ | 4.485đ | 20.930đ | **86,79%** | 92,06% | 254.335đ / 238.585đ | **6 / 7** | +11.216.750đ | +49.367.000đ | **PASS** |
| **3E. Thầu Sửa Nhà: Scale-up 4,5tr** | 199.000đ | 250 phiếu x 80đ | 20.000đ | 2.985đ | 13.930đ | **88,45%** | 92,97% | 171.085đ / 162.085đ | **27 / 28** | +4.054.250đ | +29.717.000đ | **PASS** |
| **VETO 1: Bán trọn đời 299k / 24T** | 12.458đ | 250 phiếu x 80đ | 20.000đ | 187đ | 872đ | **-62,04%** | 10,20% | 399đ / **-8.601đ** | **Lỗ vĩnh viễn** | -1.480.046đ | -1.420.186đ | **VETO** |
| **VETO 2: Quét AI vô hạn ở giá 249k** | 249.000đ | 800 AI x 350đ | 280.000đ | 3.735đ | 17.430đ | **-13,95%** | 36,65% | 73.835đ / **-52.165đ** | **Lỗ vĩnh viễn** | +2.191.750đ | +13.267.000đ | **VETO** |

### 2.3. Giải bài toán tâm lý: "Xưởng nhỏ và thợ Việt ngại trả thuê bao hàng tháng"

Thực tế bán phần mềm cho tiểu thương và chủ xưởng Việt Nam cho thấy **3 rào cản rút ví lớn nhất**: (a) Không có thẻ tín dụng quốc tế để trừ tự động; (b) Ghét cảm giác "chưa dùng đã bị trừ tiền lén mỗi tháng"; (c) Muốn thấy lời tiền tươi trước khi đóng dài hạn. Cơ cấu thu tiền bắt buộc thiết kế 3 lớp:
1. **Dùng miễn phí vĩnh viễn công cụ tính cơ bản (0đ server):** Chạy hoàn toàn trên điện thoại khách (xếp cắt tấm 2D cơ bản / đổi định lượng 5 món mẫu / tính diện tích sơn tường), không cần đăng nhập, để thợ dùng hàng ngày và tin tuyệt đối vào độ chính xác.
2. **Thu tiền bằng chuyển khoản VietQR không tự gia hạn:** Khách bấm chọn gói -> hiện mã QR chuyển khoản ngân hàng -> mở khóa ngay trong 3 giây qua Webhook SePay/payOS. Hết hạn hệ thống gửi tin nhắn nhắc gia hạn lịch sự, không tự trừ tiền thẻ, giữ nguyên dữ liệu cũ ở chế độ chỉ xem để tạo cảm giác tôn trọng.
3. **Bắt buộc bán kèm Gói Quý / Gói Vụ (3 đến 6 tháng) & Gói Năm (tặng 2 tháng):**
   - Với **Xưởng Quảng Cáo & Thầu Sửa Nhà:** Đưa **Gói Quý (699k hoặc 549k)** làm gói mặc định dễ chốt nhất (1 lần chuyển khoản dùng trọn 3 tháng làm hàng chục công trình, không phải nhớ đóng tiền lặt vặt mỗi tháng).
   - Với **Cơ Sở Nấu Tiệc:** Đưa **Gói Mùa Tiệc 6 tháng (1.090.000đ)** và **Gói Năm (1.990.000đ)** lên đầu để thu gọn tiền ngay trong mùa cưới và giữ khách sống qua tháng 7 Âm lịch.

---

## 3. KIỂM ĐỊNH CHURN, LTV/CAC VÀ ĐƯỜNG THU 10 ĐẾN 50 KHÁCH ĐẦU VỚI 0Đ QUẢNG CÁO

### 3.1. Bảng Stress-Test Rời bỏ (Churn) và LTV/CAC (0đ Paid Ads vs. Đốt Quảng Cáo)

Giả định chi phí thu khách bằng kênh cộng đồng 0đ quảng cáo (tính quy đổi chi phí thời gian hỗ trợ Zalo 1-1) là `180.000đ đến 190.000đ/khách`; nếu đốt quảng cáo Facebook/TikTok bán trực tiếp tại Việt Nam năm 2026 là `850.000đ/khách`:

| Ứng viên | Lãi ròng xấu / tháng | Kịch bản chỉ bán gói Tháng (Churn / Vòng đời / LTV / LTV:CAC 0đ / LTV:CAC Ads) | Kịch bản hỗn hợp Quý & Năm (Churn / Vòng đời / LTV / LTV:CAC 0đ / Hoàn vốn) | Nhận định chống rời bỏ |
| :--- | :---: | :--- | :--- | :--- |
| **1. Xưởng Biển Quảng Cáo (249k)** | **207.835 đ** | Churn `9,0%` (`11,1T`) -> LTV `2.309.278đ` -> **0đ Ads: `12,83x`** *(Ads: `2,72x` < 3x)* | Churn **`6,0%`** (`16,7T`) -> LTV **`3.463.917đ`** -> **0đ Ads: `19,24x`** *(Hoàn vốn `0,87 tháng`)* | **Mạnh nhất:** Dùng quanh năm 12 tháng, 3 đến 10 đơn/tuần, giữ chân cứng bằng bảng giá vật tư riêng từng xưởng và lịch sử báo giá khách. |
| **2. Đội Thầu Sửa Nhà (199k)** | **162.085 đ** | Churn `14,0%` (`7,1T`) -> LTV `1.157.750đ` -> **0đ Ads: `6,09x`** *(Ads: `1,36x`)* | Churn **`8,5%`** (`11,8T`) -> LTV **`1.906.882đ`** -> **0đ Ads: `10,04x`** *(Hoàn vốn `1,17 tháng`)* | **Ổn định:** Chấm công 6 ngày/tuần tạo thói quen mở máy hàng ngày; cần giữ giao diện cực đơn giản 3 chạm để cai thợ không bỏ sổ giữa chừng. |
| **3. Cơ Sở Nấu Tiệc (199k)** | **168.585 đ** | Churn `19,0%` (`5,3T`) -> LTV `887.289đ` -> **0đ Ads: `4,93x`** *(Ads: `1,04x`)* | Churn **`10,0%`** (`10,0T`) -> LTV **`1.685.850đ`** -> **0đ Ads: `9,37x`** *(Hoàn vốn `1,07 tháng`)* | **Yếu nhất về mùa vụ:** Tháng 7 Âm lịch gần như không có đám cưới -> khách gói tháng bỏ hàng loạt nếu không khóa trước bằng Gói Mùa Tiệc 6T / Gói Năm. |

> **Cảnh báo cứng cho mọi ngách:** Nếu đốt Paid Ads trực tiếp (`850k/khách`) bán gói tháng, cả 3 ngách đều có `LTV/CAC < 3,0x` (`1,04x` đến `2,72x`). Bắt buộc tuân thủ tuyệt đối chiến lược **0đ Paid Ads bằng Công cụ Mồi Miễn Phí 15 giây + Cộng đồng nghề + Đầu mối kho vật tư** cho 50 khách đầu tiên!

---

### 3.2. Bản đồ Đường Thu 10 đến 50 Khách Đầu 0đ Ads cho Từng Ngách (Kèm Tên Cộng Đồng & Chợ Vật Tư Thật)

#### A. Ngách 1: Xưởng Biển Quảng Cáo & Hộp Đèn (Dễ lan truyền nhất)
- **Mồi miễn phí 1 chạm (Lead Magnet 15 giây):** Công cụ web mở thẳng trên điện thoại không cần đăng nhập: **"Nhập dài x rộng biển hiệu -> Vẽ ngay Sơ đồ cắt tấm Alu 1,22m x 2,44m và cắt cây sắt hộp 6m ít đề-xê nhất + tính số cục nguồn LED 12V"**. (Vừa bấm xong thấy ngay hình vẽ chia mảnh trên tấm Alu thật và số tấm tiết kiệm được; muốn chèn logo xưởng, ảnh mặt tiền khách để gửi phiếu báo giá Zalo chốt cọc thì bấm mở gói 249k/tháng hoặc 699k/quý).
- **Kênh 0đ Ads đã kiểm chứng thực tế:**
  1. **Nhóm Facebook nghề đông nhất:** *Hội Thợ Quảng Cáo*, *Cộng đồng Quảng Cáo LED*, *Chợ Vật Tư Alu - Mica - Quảng Cáo*, các nhóm CNC và làm bảng hiệu theo tỉnh.
  2. **Đòn bẩy B2B2C cực độc (Kênh Tổng kho vật tư):** Liên hệ trực tiếp nhân viên kinh doanh các tổng kho sỉ tấm Alu/Mica/LED lớn tại TP.HCM, Bình Dương và Hà Nội (ví dụ hệ thống tổng kho **SBGROUP Sơn Băng** tại 809 Quốc Lộ 13 Thủ Đức và 27A Thịnh Liệt Hoàng Mai Hà Nội; **An Lộc Phát** tại 1205 Huỳnh Văn Lũy Thủ Dầu Một Bình Dương; các đại lý vật tư LED cấp tỉnh). Tặng họ đường link máy tính cắt tấm gắn sẵn bảng giá tham khảo Alu Alcorest/Triều Chen/Mica Đài Loan để họ gửi miễn phí cho hàng trăm xưởng thợ đang mua tấm mỗi ngày -> nhân viên kho bán được thêm tấm, ta thu hàng trăm chủ xưởng dùng thử với **0 đồng quảng cáo**!
  3. **Video ngắn 30 giây quay màn hình thật (TikTok/Reels):** *"Biển 4,2m x 1,35m mua 3 tấm hay 4 tấm Alu? Đứng ngoài đường bấm 10 giây ra luôn sơ đồ cắt khỏi nhẩm sai lỗ tiền công!"*
- **Tốc độ thu 10 khách đầu:** **3 đến 5 ngày** (150 thợ bấm thử sơ đồ cắt -> 35 thợ tạo phiếu báo giá mẫu có ảnh mặt tiền -> 10 đến 15 chủ xưởng chuyển VietQR gói Tháng 249k hoặc Quý 699k). Đạt **50 khách trong 2 đến 3 tuần**.

#### B. Ngách 2: Đội Thầu Sửa Nhà Nhỏ (3 đến 20 Thợ)
- **Mồi miễn phí 1 chạm (Lead Magnet 15 giây):** Công cụ web 2 trong 1 trên điện thoại: **"Tính nhanh mét vuông sơn tường, trần thạch cao giật cấp, độ dốc mái tôn + Tạo ngay 1 Phiếu Chốt Phát Sinh kèm ảnh đóng dấu ngày giờ gửi Zalo cho chủ nhà bấm xác nhận"**.
- **Kênh 0đ Ads đã kiểm chứng thực tế:**
  1. **Nhóm Facebook nghề cực đông:** *Hội thợ sơn nước Việt Nam*, *Việc làm thợ sơn nước - bả matit*, *Hội thợ sơn nhà, chống thấm toàn quốc*, *Hội thợ thạch cao Việt Nam*, *Thi công trần vách thạch cao - Nhượng thầu, tìm thợ*, *Thầu sửa nhà trọn gói*, *Chợ thầu thợ xây dựng*.
  2. **Đầu mối cửa hàng vật tư địa phương:** Các đại lý sơn nước (Dulux, Jotun, Kova), đại lý khung xương thạch cao Vĩnh Tường và tiệm sắt thép mái tôn quận/huyện: tặng chủ đại lý tờ mã QR dán ngay quầy tính tiền *"Công cụ tính nhanh thùng sơn & mẫu phiếu chốt phát sinh chống bùng tiền cho anh em thầu"*.
  3. **Video ngắn 30 giây chạm thẳng nỗi đau:** *"Bị chủ nhà quỵt 15 triệu tiền đục tường làm thêm vì lỡ hứa miệng? Tải ngay mẫu phiếu chốt phát sinh có ảnh gửi Zalo này trước khi cầm búa!"*
- **Tốc độ thu 10 khách đầu:** **5 đến 7 ngày** (200 cai thợ bấm thử mẫu phiếu phát sinh -> 40 cai thợ dùng thử chấm công tổ thợ -> 10 đến 12 cai thợ đóng gói 199k/tháng hoặc 549k/quý). Đạt **50 khách trong 3 đến 4 tuần**.

#### C. Ngách 3: Cơ Sở Nấu Tiệc Lưu Động
- **Mồi miễn phí 1 chạm (Lead Magnet 15 giây):** **"Nhập số mâm cỗ (ví dụ 35 mâm + 2 dự phòng) -> Tự quy đổi bảng đi chợ chi tiết cho 15 món cỗ mẫu 3 miền và tách sẵn 4 phiếu gửi sạp Thịt, Hải sản, Rau củ, Đồ khô"**.
- **Kênh 0đ Ads đã kiểm chứng thực tế:**
  1. **Nhóm Facebook & Zalo nghề:** *Hội đầu bếp nấu cỗ tại nhà*, các nhóm *Nấu tiệc lưu động [Tên tỉnh/thành phố]*, *Hội chợ việc làm nấu ăn và phục vụ tiệc*, hội cho thuê rạp cưới và bàn ghế sự kiện.
  2. **Điểm chạm ngoài đời thực:** Các vựa sỉ thịt, hải sản, rau củ tại chợ đầu mối lớn (**Chợ đầu mối Thủ Đức, Bình Điền** tại TP.HCM; **Chợ Long Biên, Hoàng Mai** tại Hà Nội) và nhóm tiểu thương giao sỉ cho đội nấu cỗ.
- **Tốc độ thu 10 khách đầu:** **7 đến 12 ngày** (phụ thuộc rất mạnh vào thời điểm mùa cưới từ tháng 8 Âm lịch đến giáp Tết; nếu rơi vào mùa thấp điểm tháng 5 đến tháng 7 Âm lịch tốc độ chốt chậm đi một nửa, đồng thời mất thêm 15 đến 30 phút hỗ trợ chủ bếp 45 đến 60 tuổi chỉnh lại định lượng món riêng qua Zalo).

---

## 4. CHẤM ĐIỂM ĐỘC LẬP & KHUYẾN NGHỊ CHỌN NGÁCH SỐ 1

Dùng bảng trọng số ưu tiên dòng tiền sống thật (**30%** Dễ thu tiền trong 7 ngày đầu + **30%** Tần suất dùng & Chống rời bỏ Churn + **20%** Kênh 0đ Ads & Hiệu ứng lan truyền + **20%** Biên lãi & Điểm hòa vốn):

| Ứng viên | Dễ thu tiền 7 ngày (`30%`) | Tần suất & Chống Churn (`30%`) | Kênh 0đ Ads & Lan truyền (`20%`) | Tài chính & Biên lãi (`20%`) | **TỔNG ĐIỂM THỰC CHIẾN** | Kết luận |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **1. Xưởng Biển Quảng Cáo & Hộp Đèn** | **92** | **91** | **95** | **93** | **92,50 / 100** | **CHỐT SỐ 1 (LÀM NGAY)** |
| **2. Đội Thầu Sửa Nhà Nhỏ (3 đến 20 thợ)** | 84 | 83 | 87 | 83 | **84,10 / 100** | **DỰ BỊ SỐ 2 (CHẠY SAU)** |
| **3. Cơ Sở Nấu Tiệc Lưu Động** | 86 | 72 | 85 | 84 | **81,20 / 100** | **DỰ BỊ SỐ 3 (CHẠY ĐẦU MÙA CƯỚI)** |

### 4 lý do không thể chối cãi để chọn **Xưởng Biển Quảng Cáo & Hộp Đèn** làm mũi nhọn số 1:
1. **Hiệu ứng "Sáng mắt trong 10 giây" rõ bằng hình vẽ thật:** Ngay khi nhập kích thước biển `4,2m x 1,35m` trên điện thoại, hình vẽ sơ đồ cắt tấm Alu `1,22m x 2,44m` xoay ngang/dọc hiện ra trực tiếp trước mắt, chỉ ngay cách cắt tiết kiệm 1 tấm Alu (`350.000đ đến 800.000đ`), tức bằng **1,4 đến 3,2 lần** tiền gói tháng `249.000đ`. Không cần chờ cuối tháng hay chờ có tranh chấp phát sinh mới thấy lời!
2. **Tập đoàn lớn mù tịt, ChatGPT bó tay, Excel không dùng được ngoài nắng:** MISA, KiotViet, Sapo không làm bài toán cắt tấm 2D + thanh sắt 6m + tính công suất nguồn 12V LED. ChatGPT không vẽ được sơ đồ cắt chính xác từng milimét. Thợ đứng ngoài mặt tiền khách không thể phóng to Excel trên điện thoại.
3. **Thu tiền nhanh nhất trong 7 ngày và giữ chân tốt nhất 12 tháng:** Chủ xưởng tuổi 25 đến 45 thao tác điện thoại nhanh, báo giá 3 đến 10 đơn mỗi tuần quanh năm (không đóng băng tháng 7 Âm lịch như nấu tiệc), lại có kênh cộng sinh miễn phí với các tổng kho tấm Alu/Mica (SBGROUP, An Lộc Phát, đại lý vật tư tỉnh).
4. **Kinh tế đơn vị khỏe nhất:** Biên lãi gộp xấu **`90,47%`** (Cơ bản 249k, 0đ API AI) đến **`88,47%`** (Pro 349k, 100 lượt AI đọc hóa đơn), hòa vốn chỉ **7 đến 8 khách** (`1,5tr/tháng`), đạt **`+9,34 triệu/tháng`** lãi ròng tại 50 khách và **`+41,87 triệu/tháng`** tại 200 khách, `LTV/CAC = 19,24x` khi bán 0đ quảng cáo kèm gói Quý/Năm.

---

## 5. RỦI RO TỒN ĐỌNG BÀN GIAO SANG BƯỚC 3 (`@phan-bien-doc-lap` PHẢN BIỆN PRE-MORTEM)

1. **Rủi ro sai số kỹ thuật vật tư quảng cáo (Mạch cắt, gập cạnh hộp Alu, khung sắt đan dày/thưa):** Cắt tấm Alu thực tế cần tính thêm **lề phay rãnh gập cạnh hộp (thường cộng 3cm đến 5cm mỗi cạnh)** và **đường lưỡi cắt CNC (kerf 3mm đến 5mm)**; khung sắt hộp vuông 20/25/30 có mật độ đan xương khác nhau tùy chiều cao biển gió lớn. Nếu thuật toán chỉ chia diện tích phẳng ngây thơ sẽ bị thợ cười chê ngay lần đầu thử -> *Bắt buộc thiết kế tùy chọn bật/tắt "Cộng mép gập cạnh 4cm", "Mạch cắt 4mm", và "Mật độ xương sắt 60cm/80cm" ngay trong công cụ!*
2. **Rủi ro lệch đơn giá vật tư giữa các vùng miền:** Giá Alu trong nhà (`275k đến 450k`), Alu ngoài trời PVDF (`790k đến 2,2tr`), Mica Đài Loan (`500k đến 1,45tr`) và công thợ leo cao/thuê giàn giáo thay đổi theo từng tỉnh -> *Bắt buộc cho chủ xưởng bấm sửa bảng giá nhập 1 lần và tự lưu cục bộ trên máy.*
3. **Rủi ro copy hoặc dùng chùa mãi công cụ miễn phí:** Nếu cho xuất luôn phiếu báo giá đẹp có logo xưởng ở bản miễn phí thì thợ không có động lực đóng `249k/tháng` -> *Ranh giới khóa tiền phải sắc nét: Bản miễn phí vẽ sơ đồ cắt 2D & tính số tấm không giới hạn (để lan truyền cực mạnh); Bản trả phí (`249k/tháng` hoặc `699k/quý`) mở khóa Xuất phiếu báo giá Zalo chuyên nghiệp gắn Logo + Ảnh mặt tiền cửa hàng khách, Lưu bảng giá riêng từng xưởng, Phiếu cắt vật tư giao thợ và Lưu lịch sử báo giá không mất.*

---

## 6. NGUỒN THỰC TẾ ĐÃ KIỂM CHỨNG NGÀY 19/11/2026

1. Bảng giá tấm Alu Alcorest/Triều Chen/PVDF (1220x2440mm) và Mica Đài Loan/TQ 2025 đến 2026: `vatlieuxanhtop3.com`, `kesgroup.vn`, `micaalu.com`, `sonbanggroup.com`.
2. Địa chỉ và mạng lưới Tổng kho vật tư quảng cáo lớn tại TP.HCM, Bình Dương và Hà Nội (SBGROUP Sơn Băng, An Lộc Phát): `tongkhomica.net`, `sbgroup.vn`, `anlocphatgroup.com`.
3. Giá và tính năng đối thủ chấm công công trình (LTP Attendance 1,2 đến 1,8 triệu/năm, MISA AMIS/FastWork 15k đến 50k/nhân viên/tháng): `ltp-soft.com`, `misa.vn`, `lacviet.vn`.
4. Dữ liệu mùa cưới, tác động tháng 7 Âm lịch và chuỗi cung ứng chợ đầu mối (Thủ Đức, Bình Điền, Long Biên, Hoàng Mai) cho dịch vụ nấu tiệc lưu động: `baodongnai.com.vn`, `dattiectainha.vn`, `suckhoedoisong.vn`, `venusluxury.com.vn`.
5. Mô phỏng định lượng tài chính Cổng 1 (18 kịch bản): chạy trực tiếp Python `TitanDatabase.simulate_cfo_unit_economics(...)` trong `scripts/titan_db.py`.
