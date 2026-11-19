# BƯỚC 2/8 (GIAI ĐOẠN 1) — ĐỊNH GIÁ, KINH TẾ ĐƠN VỊ (UNIT ECONOMICS) & CHUẨN HÓA CÔNG THỨC THUẾ HKD / TMĐT

- **Mã nhiệm vụ:** `msn-47b19760` — *Sổ thu chi & Cảnh báo ngưỡng thuế tự động cho Hộ kinh doanh / Chủ shop TMĐT*
- **Đơn vị thực hiện:** Phòng `#38` (Giám đốc Định giá & FP&A `@pricing-fpa`) & Phòng `#39` (Chuyên gia Thuế & Hóa đơn điện tử `@tax-specialist`) — Khối `div7-finance-tax-legal` (`@cfo`)
- **Ngày kiểm định số liệu:** `19/11/2026`
- **Kết luận Cổng 1 (CFO Hard Gate):** **ĐẠT CHUẨN PHÊ DUYỆT (`gate1_passed = True`)** trên cả 3 bậc giá đề xuất (biên lãi gộp kịch bản xấu 100% hạn mức đạt **72,18% – 77,42%**, vượt ngưỡng cứng **≥ 65%**; đồng thời **biên lãi ròng sau trừ cả 7% quỹ dự phòng thuế** ở kịch bản xấu vẫn đạt **65,18% – 70,42%**).

---

# 1. TÓM TẮT QUYẾT ĐỊNH & KẾT QUẢ ĐỊNH LƯỢNG

| Chỉ số CFO & Thuế Cốt lõi | Gói Tiêu chuẩn (Chủ lực) | Gói Pro (Shop Đa Kênh) | Gói Chuỗi / Đại lý (Mỏ neo) | Gói Phủ quyết (Unlimited AI) |
| :--- | :---: | :---: | :---: | :---: |
| **Giá bán niêm yết / tháng** | **249.000 đ** | **399.000 đ** | **799.000 đ** | ~~249.000 đ~~ |
| **Giá quy đổi gói Năm (tặng 2 tháng)** | 207.500 đ/tháng (2.490.000đ/năm) | 332.500 đ/tháng (3.990.000đ/năm) | 665.833 đ/tháng (7.990.000đ/năm) | Không áp dụng |
| **Hạn mức cứng tác vụ AI / tháng** *(nhập tay & import CSV không giới hạn)* | **150 lượt AI** (OCR hóa đơn + hỏi đáp) | **300 lượt AI** (OCR + đa sàn + cảnh báo) | **600 lượt AI** (tối đa 5 shop) | ~~800 lượt~~ (không khóa trần) |
| **Đơn giá biến đổi AI + Lưu trữ/Server** *(đã cộng biên an toàn gấp >10x Gemini 2.5 Flash)* | 350 đ/lượt | 350 đ/lượt | 350 đ/lượt | 350 đ/lượt |
| **Chi phí AI + Hạ tầng kịch bản xấu (100% hạn mức)** | 52.500 đ | 105.000 đ | 210.000 đ | 280.000 đ |
| **Phí cổng thanh toán bảo thủ (1,5%)** | 3.735 đ | 5.985 đ | 11.985 đ | 3.735 đ |
| **Dự phòng thuế Titan AI Corp (7,0%)** | 17.430 đ | 27.930 đ | 55.930 đ | 17.430 đ |
| **Biên lãi gộp kịch bản xấu (`worst_gross_margin_pct`)** | **77,42%** | **72,18%** | **72,22%** | **-13,95% (LỖ NGƯỢC)** |
| **Biên lãi gộp kỳ vọng (`expected_gross_margin_pct`)** | **86,90%** | **82,71%** | **82,73%** | 31,03% |
| **Lãi ròng / khách (Kỳ vọng / Xấu 100%)** | **198.960 đ** / 175.335 đ | **302.085 đ** / 260.085 đ | **605.085 đ** / 521.085 đ | 59.835 đ / **-52.165 đ** |
| **Biên lãi ròng kịch bản xấu (sau 7% thuế)** | **70,42%** | **65,18%** | **65,22%** | **-20,95%** |
| **Điểm hòa vốn (Chi phí cố định MVP 1.500.000đ/tháng)** | **8 khách** *(xấu: 9)* | **5 khách** *(xấu: 6)* | **3 khách** *(xấu: 3)* | 26 khách *(xấu: không hòa vốn)* |
| **Phán quyết Cổng 1 (`TitanDatabase.simulate_cfo_unit_economics`)** | **ĐẠT CHUẨN CỔNG 1** | **ĐẠT CHUẨN CỔNG 1** | **ĐẠT CHUẨN CỔNG 1** | **BÁC BỎ (VETO ĐỎ)** |

### Chốt 4 quyết định nền tảng bàn giao cho `@critic` (Bước 3) & `@builder` (GĐ 2):
1. **Cơ cấu giá 3 bậc chuẩn Simon-Kucher & Dan Ariely:** Gói Tiêu chuẩn **249.000đ/tháng** là mũi nhọn mở thị trường (rẻ hơn gói đa kênh Sapo 599k–699k và Sổ Bán Hàng Toàn diện 700k tới 60%), gói Pro **399.000đ/tháng** đánh thẳng nhóm shop doanh thu > 1 tỷ/năm cần gom hóa đơn đầu vào & xuất sổ kế toán, gói Chuỗi **799.000đ/tháng** làm mỏ neo tâm lý. Với tỷ trọng hỗn hợp thực tế *(65% Standard + 30% Pro + 5% Business)*, ARPU đạt **321.500đ/khách/tháng**, **hòa vốn ở chỉ 6 khách (kỳ vọng) / 7 khách (xấu 100%)** tại chi phí cố định 1,5 triệu/tháng, hoặc **18–21 khách** khi mở rộng chi phí cố định lên 4,5 triệu/tháng.
2. **Luật Trọng tài số 2 (Khóa trần AI cứng):** Nghiêm cấm quảng cáo *"Quét AI không giới hạn"*. Mọi thao tác **nhập tay, import CSV/Excel sàn Shopee/TikTok Shop, tính thuế GTGT/TNCN và cảnh báo ngưỡng** chạy bằng **công thức deterministic chi phí AI = 0đ** nên cho phép dùng không giới hạn; chỉ **OCR ảnh hóa đơn & Trợ lý AI phân loại chứng từ** bị khóa hạn mức cứng (150 / 300 / 600 lượt/tháng) kèm gói nạp thêm trả phí.
3. **Chuẩn hóa khung pháp lý Thuế HKD & TMĐT 2025–2026:** Toàn bộ bộ tính thuế của app phải phản ánh **đúng hiện hành đến tháng 11/2026**:
   - Xóa thuế khoán & bỏ lệ phí môn bài từ 01/01/2026 (*Nghị quyết 198/2025/QH15*).
   - **Ngưỡng sinh tử 1 = 1.000.000.000đ/năm** (*Nghị định 141/2026/NĐ-CP* sửa *Nghị định 68/2026/NĐ-CP* có hiệu lực từ 01/01/2026, đồng bộ với *Nghị định 70/2025/NĐ-CP*): từ 1 tỷ trở xuống miễn GTGT & TNCN và chưa bắt buộc HĐĐT; vượt 1 tỷ bắt buộc nộp thuế và dùng **Hóa đơn điện tử khởi tạo từ máy tính tiền**. Ngưỡng này phải là **tham số cấu hình động** trong app (do Luật sửa đổi 24/04/2026 giao Chính phủ quyền điều chỉnh linh hoạt).
   - **Ngưỡng sinh tử 2 = 3.000.000.000đ/năm** (*Nghị định 68/2026/NĐ-CP*): vượt 3 tỷ bắt buộc chuyển sang tính thuế TNCN theo lợi nhuận thực tế `(Doanh thu - Chi phí có hóa đơn hợp lệ) × 17%` (duy trì ổn định 2 năm liên tục).
   - **Chống đóng thuế 2 lần trên sàn TMĐT (*Nghị định 117/2025/NĐ-CP*):** Bắt buộc tách **Doanh thu Đã bị sàn khấu trừ tại nguồn** (Shopee/TikTok/Lazada đã trích 1,5% / 4,5% / 7% trên từng đơn) và **Doanh thu Tự khai ngoài sàn** (Facebook/Zalo/COD/tại quầy). Đồng thời tự động tính **Quỹ Thuế Dự Kiến Được Hoàn** cho các shop có tổng doanh thu năm ≤ 1 tỷ nhưng đã bị sàn tạm trừ thuế.
4. **Công thức 3 con số lớn trên màn hình chính ("Két Thuế Shop"):**
   - **Tiền về thực nhận** = `Tổng Doanh thu - Chi phí vận hành - Thuế sàn đã khấu trừ (NĐ 117/2025)`
   - **Tiền phải cất vào Két Thuế** = `Thuế tự khai theo tỷ lệ ngành (hoặc theo lợi nhuận nếu > 3 tỷ) + Quỹ dự phòng vượt ngưỡng nếu đã chạm ≥ 70% mốc 1 tỷ`
   - **Tiền xài được an toàn** = `Tiền về thực nhận - Tiền cất vào Két Thuế`

---

# 2. NGUỒN THỰC TẾ VỪA TRA CỨU TRỰC TIẾP (LIVE CITATIONS)

Mọi quy định pháp luật thuế, biểu phí cổng thanh toán, giá đối thủ và đơn giá API AI dưới đây đều được Phòng `#38` & `#39` tra cứu sống trực tiếp ngày `19/11/2026`:

1. **Chính phủ Việt Nam — Nghị định 141/2026/NĐ-CP (ban hành 29/04/2026, hiệu lực hồi tố từ 01/01/2026)** sửa đổi, bổ sung **Nghị định 68/2026/NĐ-CP** (ban hành 05/03/2026): chính thức thay toàn bộ mốc *"500 triệu đồng"* thành **"01 tỷ đồng/năm"** cho ngưỡng doanh thu không phải nộp thuế GTGT, TNCN của hộ kinh doanh/cá nhân kinh doanh; quy định hoàn trả/bù trừ thuế đã nộp thừa nếu dưới 1 tỷ; quy định bắt buộc dùng HĐĐT khi doanh thu > 1 tỷ.
   - Nguồn xác thực: Cổng TTĐT Bộ Tài chính (`mof.gov.vn`), Cổng TTĐT Chính phủ (`chinhphu.vn`), Cổng TTĐT Thanh Hóa (`thanhhoa.gov.vn`), Thư Viện Pháp Luật (`thuvienphapluat.vn`).
2. **Nghị định 68/2026/NĐ-CP & Luật Sửa đổi các Luật Thuế (Quốc hội thông qua 24/04/2026):** Bỏ ngưỡng cứng trong luật, giao Chính phủ điều chỉnh ngưỡng miễn thuế theo thực tế vĩ mô; phân tầng phương pháp tính thuế TNCN theo lợi nhuận (`15%` cho 1–3 tỷ nếu tự chọn, `17%` cho >3–50 tỷ, `20%` cho >50 tỷ; ổn định 2 năm); chốt lịch nộp tờ khai quý (**30/04, 31/07, 31/10, 31/01 năm sau**) và quyết toán năm (**31/03 năm sau**).
   - Nguồn xác thực: `luatvietnam.vn`, `chinhphu.vn`, `fdvn.vn`, `thuvienphapluat.vn`, `vnexpress.net`.
3. **Nghị quyết 198/2025/QH15 (17/05/2025) & Nghị định 70/2025/NĐ-CP:** Xóa bỏ hoàn toàn thuế khoán từ 01/01/2026, bãi bỏ lệ phí môn bài đối với HKD, chuyển sang tự khai – tự nộp và bắt buộc sử dụng **Hóa đơn điện tử khởi tạo từ máy tính tiền** kết nối dữ liệu cơ quan thuế cho HKD doanh thu từ 1 tỷ đồng/năm.
   - Nguồn xác thực: `baochinhphu.vn`, `hanoi.gov.vn`, `thuvienphapluat.vn`.
4. **Nghị định 117/2025/NĐ-CP (hiệu lực từ 01/07/2025) & Phụ lục I Thông tư 40/2021/TT-BTC:** Quy định sàn TMĐT có chức năng thanh toán khấu trừ, nộp thuế thay tại nguồn theo từng giao dịch thành công với tỷ lệ **1,5%** (hàng hóa), **4,5%** (vận tải & dịch vụ gắn hàng hóa), **7%** (dịch vụ), hoặc **10%** (nếu không xác định được loại hình); người bán có quyền đề nghị hoàn thuế nếu tổng doanh thu năm không vượt ngưỡng chịu thuế.
   - Nguồn xác thực: `chinhphu.vn`, `dongnai.gov.vn`, `ata-legal.com`, `misa.vn`.
5. **Chính sách thuế phần mềm Việt Nam (cho chính Titan AI Corp):** Sản phẩm/dịch vụ phần mềm nội địa thuộc diện **Không chịu thuế GTGT (KTT)**; dự án đầu tư mới sản xuất phần mềm đáp ứng quy trình chuẩn hưởng ưu đãi TNDN **10% trong 15 năm (miễn 4 năm, giảm 50% trong 9 năm)**.
   - Nguồn xác thực: `baochinhphu.vn`, `ketoanthienung.org`, `man.net.vn`.
6. **Bảng giá đối thủ SaaS HKD tại Việt Nam (2025–2026):** Sổ Bán Hàng (Cơ bản 160k–200k, Chuyên nghiệp 210k–250k, Toàn diện 700k/tháng); KiotViet (200k–250k / 270k–310k / 370k–490k/tháng); Sapo (Start-up 170k, Pro 249k–299k, Omnichannel 599k–699k/tháng); MISA eShop (Starter 199k, Standard 299k, Pro/Enterprise 399k–599k/tháng).
   - Nguồn xác thực: `sobanhang.com`, `misa.vn`, `misaeshop.vn`, `vnpaypos.vn`.
7. **Biểu phí cổng thanh toán SaaS Việt Nam & Đơn giá API AI 2026:**
   - **payOS / SePay VietQR:** 0đ – 500đ/giao dịch (~0%–0,3%) + phí gói webhook ~96.000đ/tháng, tiền về tức thì; **VNPay / thẻ:** 1,1%–2,5% (T+1 đến T+3). CFO áp mức bảo thủ **1,5%** trong toàn bộ phép tính.
   - **Gemini 2.5 Flash API:** Input `$0.30 / 1M tokens`, Output `$2.50 / 1M tokens` → trung bình 1 ảnh hóa đơn OCR (~1.000 input + 300 output tokens) tốn **~$0.00105 (~27 VNĐ/lượt)**. CFO áp mức stress-test gấp **~13 lần = 350 VNĐ/lượt** (đã bao gồm lưu trữ ảnh hóa đơn trên cloud, retry lỗi, băng thông server/DB biến đổi và dự phòng đổi model) và kiểm thử thêm mức cực đoan **500 VNĐ/lượt**.
   - Nguồn xác thực: `payos.vn`, `sepay.vn`, `vnpay.vn`, `aipricing.guru`.

---

# 3. NỘI DUNG CHI TIẾT, BẢNG TÍNH & MÃ NGUỒN CHUYÊN MÔN

## 3.1. Chuẩn hóa Khung Thuế HKD & TMĐT Việt Nam (Phòng `#39`)

### A. Bảng tỷ lệ % tính thuế GTGT & TNCN theo ngành nghề (Phụ lục I TT 40/2021/TT-BTC & NĐ 117/2025/NĐ-CP)

| Mã ngành trong App | Danh mục ngành nghề chuẩn pháp luật | Tỷ lệ GTGT | Tỷ lệ TNCN | Tổng tỷ lệ trên doanh thu | Khấu trừ trên sàn TMĐT (NĐ 117/2025) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `retail_goods` | **Phân phối, cung cấp/bán lẻ hàng hóa** *(Shop Shopee, TikTok Shop, Lazada, tạp hóa, thời trang, mỹ phẩm)* | **1,0%** | **0,5%** | **1,5%** | Sàn trừ trực tiếp **1,5%**/đơn |
| `production_fnb_transport` | **Sản xuất, vận tải, dịch vụ gắn với hàng hóa, xây dựng có bao thầu NVL** *(F&B/GrabFood/ShopeeFood, xưởng may, gia công, ship gắn hàng)* | **3,0%** | **1,5%** | **4,5%** | Sàn trừ trực tiếp **4,5%**/đơn |
| `services_no_materials` | **Dịch vụ, xây dựng không bao thầu NVL** *(Spa, cắt tóc, sửa chữa, lưu trú, tư vấn, booking/quảng cáo số, môi giới)* | **5,0%** | **2,0%** | **7,0%** | Sàn trừ trực tiếp **7,0%**/đơn |
| `other_business` | **Hoạt động kinh doanh khác** *(Chưa phân loại vào 3 nhóm trên)* | **2,0%** | **1,0%** | **3,0%** | Tự khai **3,0%** *(sàn không phân loại được sẽ trừ 10%)* |

> **Cảnh báo nghiệp vụ quan trọng từ NĐ 117/2025/NĐ-CP:** Nếu chủ shop bán đa ngành mà cấu hình sai danh mục trên sàn khiến sàn không xác định được là hàng hóa hay dịch vụ, sàn có quyền khấu trừ mức trần **10%**. App phải có nút **Kiểm tra chênh lệch thuế sàn đã trừ vs. mức chuẩn 1,5% / 4,5% / 7%** ngay khi import file đối soát Excel từ Shopee/TikTok Shop!

### B. Hệ thống 2 Ngưỡng Sinh Tử & Cơ chế Cảnh báo Sớm trong App

| Mốc doanh thu tích lũy năm (tất cả kênh gộp lại) | Căn cứ pháp lý | Nghĩa vụ pháp lý kích hoạt | Ngưỡng cảnh báo tự động trong App |
| :--- | :--- | :--- | :--- |
| **≤ 1.000.000.000 đ/năm** *(~83,3 triệu/tháng)* | NĐ 141/2026/NĐ-CP (hiệu lực 01/01/2026) & NĐ 70/2025/NĐ-CP | **Miễn thuế GTGT & TNCN**; không bắt buộc HĐĐT; chỉ cần ghi sổ & thông báo doanh thu năm chậm nhất **31/01** năm sau. Nếu đã bị sàn TMĐT khấu trừ 1,5%–7%, được làm hồ sơ **hoàn thuế nộp thừa**. | • `< 70%` (< 700tr): **XANH** (An toàn)<br>• `70%–84%` (700–849tr): **VÀNG** (Bắt đầu khoanh dự phòng để tránh sốc)<br>• `85%–99%` (850–999tr): **ĐỎ** (Chuẩn bị đăng ký HĐĐT máy tính tiền!) |
| **> 1 tỷ đến 3 tỷ đ/năm** *(~83,3–250 triệu/tháng)* | NĐ 68/2026/NĐ-CP, NĐ 141/2026/NĐ-CP, NĐ 70/2025/NĐ-CP | **Bắt buộc kê khai & nộp thuế theo quý** (GTGT 1%–5% + TNCN 0,5%–2% trên doanh thu tự khai, tránh trùng phần sàn đã khấu trừ) + **Bắt buộc xuất HĐĐT từ máy tính tiền**. Được quyền tự nguyện chọn tính TNCN `15%` trên lợi nhuận nếu đủ chứng từ (giữ ổn định 2 năm). | • `≥ 100% mốc 1 tỷ`: **KÍCH HOẠT CHẾ ĐỘ KÊ KHAI QUÝ & HĐĐT**<br>• `80% mốc 3 tỷ` (2,4 tỷ): **CẢNH BÁO GOM HÓA ĐƠN ĐẦU VÀO** |
| **> 3.000.000.000 đ/năm** *(~250 triệu/tháng)* | NĐ 68/2026/NĐ-CP | **Bắt buộc tính TNCN theo lợi nhuận thực tế:** `TNCN = (Doanh thu - Chi phí có hóa đơn hợp lệ) × 17%` (đến 50 tỷ; >50 tỷ là `20%`) + vẫn nộp GTGT theo tỷ lệ % ngành. Ổn định tối thiểu 2 năm liên tục. | • `≥ 100% mốc 3 tỷ`: **CHẾ ĐỘ BẢO VỆ BIÊN LÃI** — cảnh báo từng đồng chi phí thiếu hóa đơn làm tăng thuế 17% ngay lập tức! |

### C. Lịch nhắc việc Thuế tự động (Tích hợp Calendar/Zalo Alert trong App)
- **Khai & nộp thuế Quý 1:** Chậm nhất ngày **30/04**
- **Khai & nộp thuế Quý 2:** Chậm nhất ngày **31/07**
- **Khai & nộp thuế Quý 3:** Chậm nhất ngày **31/10**
- **Khai & nộp thuế Quý 4 / Thông báo doanh thu năm (nhóm ≤ 1 tỷ):** Chậm nhất ngày **31/01 năm sau**
- **Quyết toán thuế TNCN năm (nhóm tính theo lợi nhuận) & Hồ sơ đề nghị hoàn thuế sàn TMĐT nộp thừa:** Chậm nhất ngày **31/03 năm sau**

---

## 3.2. Thiết kế Bảng giá 3 Bậc & Kiểm định Unit Economics (`TitanDatabase.simulate_cfo_unit_economics`)

### A. Định vị giá so với thị trường (Monetizing Innovation — Simon-Kucher)
- Chủ shop online/HKD đang sợ nhất **2 nỗi đau**: (1) mua phần mềm bán hàng tổng hợp như Sapo/KiotViet/Sổ Bán Hàng giá 250k–700k/tháng nhưng **quá rườm rà tính năng kho/nhân viên mà vẫn không trả lời được 1 câu: *"Tháng này cất bao nhiêu đóng thuế, xài được bao nhiêu?"***; (2) sợ bị truy thu/phạt chậm HĐĐT hàng chục triệu đồng.
- Với giá **249.000đ/tháng (~8.300đ/ngày, rẻ hơn nửa ly cà phê)** cho gói Tiêu chuẩn và **399.000đ/tháng** cho gói Pro đa sàn, sản phẩm định vị **ngay vùng ngọt (sweet spot)** của chủ shop, đồng thời thấp hơn 43%–64% so với gói đa kênh của Sapo (599k–699k) và Sổ Bán Hàng Toàn diện (700k).

### B. Cấu trúc Chi phí Cố định hàng tháng (Fixed Monthly Cost Breakdown)
- **Cấu hình Lean MVP (`1.500.000 đ/tháng`):**
  1. Cloud Backend + Managed PostgreSQL + Object Storage lưu ảnh hóa đơn/backup tự động: `700.000 đ/tháng`
  2. Tên miền, SSL, Email giao dịch, gói Webhook ngân hàng tự động (SePay / payOS): `300.000 đ/tháng`
  3. Giám sát hệ thống, tường lửa, CDN & hạn mức tin nhắn nhắc lịch thuế cơ bản: `500.000 đ/tháng`
- **Cấu hình Scale-up (`4.500.000 đ/tháng` khi đạt > 150 khách):** Nâng cấp cụm DB/Redis HA (`1.500.000đ`) + Zalo ZNS / hạ tầng cảnh báo (`1.000.000đ`) + công cụ kế toán/CSKH & hóa đơn điện tử vận hành nội bộ (`2.000.000đ`).

### C. Kết quả Chạy thật Python `TitanDatabase.simulate_cfo_unit_economics(...)` (8 Kịch bản Kiểm định Áp lực)

Toàn bộ các số liệu trong bảng sau là **kết quả xuất trực tiếp từ lệnh gọi hàm `TitanDatabase.simulate_cfo_unit_economics(...)` trong `scripts/titan_db.py`** (Zero LLM Math — kiểm chứng chạy thật ngày `19/11/2026`):

| Kịch bản mô phỏng | Giá/tháng | Hạn mức AI | Đơn giá AI+Server | Phí TT (1,5%) | Dự phòng thuế (7%) | Giá vốn xấu 100% (COGS) | **Biên lãi gộp xấu** | Biên lãi gộp kỳ vọng | Lãi ròng/khách (Kỳ vọng / Xấu) | **Biên ròng xấu** | **Hòa vốn (KH)** *(Kỳ vọng / Xấu)* | Kết quả Cổng 1 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Standard Tháng (Chủ lực)** | 249.000đ | 150 | 350đ | 3.735đ | 17.430đ | 56.235đ | **77,42%** | 86,90% | 198.960đ / 175.335đ | **70,42%** | **8 / 9** | **PASS** |
| **2. Standard Năm (Tặng 2 tháng)** | 207.500đ | 150 | 350đ | 3.113đ | 14.525đ | 55.613đ | **73,20%** | 84,58% | 160.988đ / 137.363đ | **66,20%** | **10 / 11** | **PASS** |
| **3. Standard Cực đoan (AI = 500đ/lượt)** | 249.000đ | 150 | 500đ | 3.735đ | 17.430đ | 78.735đ | **68,38%** | 80,43% | 182.835đ / 152.835đ | 61,38% | **9 / 10** | **PASS** |
| **4. Pro Tháng (Đa kênh + OCR)** | 399.000đ | 300 | 350đ | 5.985đ | 27.930đ | 110.985đ | **72,18%** | 82,71% | 302.085đ / 260.085đ | **65,18%** | **5 / 6** | **PASS** |
| **5. Pro Năm (Tặng 2 tháng)** | 332.500đ | 300 | 350đ | 4.988đ | 23.275đ | 109.988đ | **66,92%** | 79,55% | 241.238đ / 199.238đ | 59,92% | **7 / 8** | **PASS** |
| **6. Pro Scale-up (Cố định 4,5tr)** | 399.000đ | 300 | 350đ | 5.985đ | 27.930đ | 110.985đ | **72,18%** | 82,71% | 302.085đ / 260.085đ | **65,18%** | **15 / 18** | **PASS** |
| **7. Business / Chuỗi 5 Shop (Mỏ neo)** | 799.000đ | 600 | 350đ | 11.985đ | 55.930đ | 221.985đ | **72,22%** | 82,73% | 605.085đ / 521.085đ | **65,22%** | **3 / 3** | **PASS** |
| **8. Phép thử VETO (Unlimited AI)** | 249.000đ | 800 | 350đ | 3.735đ | 17.430đ | 283.735đ | **-13,95%** | 31,03% | 59.835đ / **-52.165đ** | -20,95% | 26 / **Lỗ vĩnh viễn** | **FAIL (VETO)** |

> **Chốt quy tắc giảm giá cho đội Sales (`#33`):** Mức ưu đãi tối đa cho gói thanh toán cả năm là **tặng tối đa 2 tháng (giảm ~16,67%)** — tại mức này biên lãi gộp kịch bản xấu của gói Pro vẫn đạt **66,92% (≥ 65%)** và Standard đạt **73,20%**. Nghiêm cấm giảm giá sâu hơn 20% nếu không giảm tương ứng hạn mức AI!

---

## 3.3. Dự phóng Dòng tiền & Lợi nhuận Ròng (10 / 50 / 200 / 500 Khách hàng)

Kết quả trực tiếp từ `projections` của `TitanDatabase.simulate_cfo_unit_economics(...)` (đơn vị: VNĐ/tháng, đã trừ đủ COGS kỳ vọng, 1,5% phí thanh toán, 7% quỹ dự phòng thuế và 1.500.000đ chi phí cố định MVP):

| Quy mô khách trả phí | Gói Standard 249.000đ *(Doanh thu / Quỹ thuế 7% / Lãi ròng)* | Gói Pro 399.000đ *(Doanh thu / Quỹ thuế 7% / Lãi ròng)* | Hỗn hợp mục tiêu *(65% Std + 30% Pro + 5% Biz — ARPU 321.500đ)* |
| :---: | :---: | :---: | :---: |
| **10 khách** | 2.490.000đ / 174.300đ / **+489.600đ** | 3.990.000đ / 279.300đ / **+1.520.850đ** | 3.215.000đ / 225.050đ / **+1.002.038đ** |
| **50 khách** *(Mục tiêu Tháng 1–2)* | 12.450.000đ / 871.500đ / **+8.448.000đ** | 19.950.000đ / 1.396.500đ / **+13.604.250đ** | 16.075.000đ / 1.125.250đ / **+11.010.188đ** |
| **200 khách** *(Mục tiêu Tháng 3–4)* | 49.800.000đ / 3.486.000đ / **+38.292.000đ** | 79.800.000đ / 5.586.000đ / **+58.917.000đ** | 64.300.000đ / 4.501.000đ / **+48.540.750đ** *(sau Scale 4,5tr vẫn lãi +45,54tr)* |
| **500 khách** *(Mục tiêu Tháng 6)* | 124.500.000đ / 8.715.000đ / **+97.980.000đ** | 199.500.000đ / 13.965.000đ / **+149.542.500đ** | 160.750.000đ / 11.252.500đ / **+123.601.875đ** *(sau Scale 4,5tr vẫn lãi +120,60tr)* |

### Phân tách nghĩa vụ thuế của chính Titan AI Corp (Phòng `#39`)
- **Nguyên tắc khoanh quỹ bảo thủ (áp dụng trong mô hình CFO):** Khóa cứng trích **7,0% doanh thu** vào ngăn quỹ thuế riêng ngay khi tiền về (đủ trang trải mức cao nhất của dịch vụ số chịu thuế `5% GTGT + 2% TNCN` nếu vận hành dạng HKD/cá nhân chưa hoàn tất hồ sơ phần mềm).
- **Lộ trình tối ưu thuế hợp pháp khi vượt 200 khách (> 750 triệu/năm):** Đóng gói đầy đủ hồ sơ kỹ thuật sản xuất sản phẩm phần mềm theo Luật CNTT/Công nghiệp công nghệ số để xuất hóa đơn diện **Không chịu thuế GTGT (KTT)**, và khi lập pháp nhân Công ty TNHH sản xuất phần mềm mới đáp ứng quy trình chuẩn thì đăng ký **ưu đãi thuế TNDN miễn 4 năm đầu, giảm 50% trong 9 năm tiếp theo (thuế suất 10% trong 15 năm)**. Khoản chênh lệch thuế tiết kiệm hợp pháp sẽ trở thành **biên lợi nhuận cộng thêm (upside)**, không dùng để che giấu rủi ro ở Cổng 1.

---

## 3.4. Mã nguồn Python Chuẩn hóa (Sẵn sàng cho GĐ 2 `@builder`)

### A. Lệnh kiểm định CFO chạy thật với `TitanDatabase.simulate_cfo_unit_economics`

```python
from scripts.titan_db import TitanDatabase

# 1. Gói Tiêu chuẩn 249.000đ/tháng (150 lượt AI cứng, 350đ/lượt, 1.5% phí TT, 7% thuế, 1.5tr cố định)
sim_standard = TitanDatabase.simulate_cfo_unit_economics(
    price_per_month=249000,
    max_quota_units=150,
    api_cost_per_unit=350,
    avg_usage_ratio=0.55,
    payment_fee_pct=1.5,
    payment_fixed_fee=0.0,
    tax_reserve_pct=7.0,
    fixed_monthly_cost=1500000,
)
assert sim_standard["gate1_passed"] is True
assert sim_standard["worst_gross_margin_pct"] == 77.42
assert sim_standard["breakeven_customers"] == 8

# 2. Gói Pro 399.000đ/tháng (300 lượt AI cứng)
sim_pro = TitanDatabase.simulate_cfo_unit_economics(
    price_per_month=399000,
    max_quota_units=300,
    api_cost_per_unit=350,
    avg_usage_ratio=0.60,
    payment_fee_pct=1.5,
    payment_fixed_fee=0.0,
    tax_reserve_pct=7.0,
    fixed_monthly_cost=1500000,
)
assert sim_pro["gate1_passed"] is True
assert sim_pro["worst_gross_margin_pct"] == 72.18
assert sim_pro["breakeven_customers"] == 5
```

### B. Công thức Khoanh Quỹ Thuế & Cảnh báo Ngưỡng Tự động (`calculate_hkd_tax_vault`)

Đây là lõi tính toán deterministic (0đ API AI, độ chính xác tuyệt đối đến từng đồng VNĐ) bàn giao cho đội lập trình Giai đoạn 2:

```python
SECTOR_RATES = {
    "retail_goods": {
        "name": "Phân phối, bán lẻ hàng hóa (Shopee/TikTok/Cửa hàng)",
        "vat": 0.01,
        "pit": 0.005,
    },
    "production_fnb_transport": {
        "name": "Sản xuất, vận tải, F&B/dịch vụ gắn hàng hóa",
        "vat": 0.03,
        "pit": 0.015,
    },
    "services_no_materials": {
        "name": "Dịch vụ, xây dựng không bao thầu NVL",
        "vat": 0.05,
        "pit": 0.02,
    },
    "other_business": {
        "name": "Hoạt động kinh doanh khác",
        "vat": 0.02,
        "pit": 0.01,
    },
}


def calculate_hkd_tax_vault(
    sector_code: str,
    rev_platform_withheld: float,
    rev_direct_self_declare: float,
    operating_expenses_total: float,
    valid_invoice_expenses: float = 0.0,
    exempt_threshold_vnd: float = 1_000_000_000.0,
    profit_method_threshold_vnd: float = 3_000_000_000.0,
    prefer_profit_method: bool = False,
) -> dict:
    """
    Tính toán 3 con số sống còn cho HKD / Chủ shop TMĐT:
    (1) Thuế sàn đã khấu trừ theo NĐ 117/2025/NĐ-CP
    (2) Tiền cần cất vào Két Thuế (tự khai / dự phòng vượt ngưỡng 1 tỷ / chế độ lợi nhuận > 3 tỷ)
    (3) Tiền xài được an toàn (Safe Spendable Cash)
    """
    rates = SECTOR_RATES[sector_code]
    vat_rate = rates["vat"]
    pit_rate = rates["pit"]
    total_rate = vat_rate + pit_rate

    total_rev = rev_platform_withheld + rev_direct_self_declare
    platform_withheld_tax = round(rev_platform_withheld * total_rate)

    ratio_t1 = total_rev / exempt_threshold_vnd if exempt_threshold_vnd > 0 else 0.0
    ratio_t2 = total_rev / profit_method_threshold_vnd if profit_method_threshold_vnd > 0 else 0.0

    if ratio_t2 >= 1.0:
        alert_level = "CRITICAL_PROFIT_REGIME"
    elif ratio_t2 >= 0.80:
        alert_level = "WARN_APPROACHING_3B"
    elif ratio_t1 >= 1.0:
        alert_level = "OVER_EXEMPT_AND_EINVOICE_MANDATORY"
    elif ratio_t1 >= 0.85:
        alert_level = "RED_NEAR_THRESHOLD_85PCT"
    elif ratio_t1 >= 0.70:
        alert_level = "AMBER_WATCH_70PCT"
    else:
        alert_level = "SAFE_BELOW_70PCT"

    if total_rev <= exempt_threshold_vnd:
        # Miễn thuế theo NĐ 141/2026/NĐ-CP; vẫn khoanh dự phòng khi >= 70% ngưỡng để chống sốc dòng tiền
        refundable_platform_tax = platform_withheld_tax
        recommended_vault_self = round(rev_direct_self_declare * total_rate) if ratio_t1 >= 0.70 else 0
        regime = "MIỄN THUẾ (<= 1 tỷ/năm, NĐ 141/2026)"
    elif total_rev <= profit_method_threshold_vnd and not prefer_profit_method:
        # Kê khai theo tỷ lệ % doanh thu cho phần chưa bị sàn khấu trừ + bắt buộc HĐĐT
        vat_due_self = round(rev_direct_self_declare * vat_rate)
        pit_due_self = round(rev_direct_self_declare * pit_rate)
        refundable_platform_tax = 0
        recommended_vault_self = vat_due_self + pit_due_self
        regime = "TỰ KHAI THEO TỶ LỆ DOANH THU + BẮT BUỘC HĐĐT (1–3 tỷ/năm)"
    else:
        # > 3 tỷ/năm (hoặc tự chọn): GTGT theo tỷ lệ % + TNCN trên lợi nhuận có hóa đơn hợp lệ
        pit_profit_rate = 0.15 if total_rev <= 3_000_000_000 else (0.17 if total_rev <= 50_000_000_000 else 0.20)
        taxable_profit = max(0.0, total_rev - valid_invoice_expenses)
        vat_total = round(total_rev * vat_rate)
        pit_total = round(taxable_profit * pit_profit_rate)
        gross_tax_total = vat_total + pit_total
        recommended_vault_self = max(0, gross_tax_total - platform_withheld_tax)
        refundable_platform_tax = max(0, platform_withheld_tax - gross_tax_total)
        regime = f"BẮT BUỘC TÍNH TNCN {int(pit_profit_rate * 100)}% TRÊN LỢI NHUẬN + GTGT {vat_rate * 100:.0f}% (> 3 tỷ/năm)"

    safe_spendable_cash = total_rev - operating_expenses_total - platform_withheld_tax - recommended_vault_self
    return {
        "sector": rates["name"],
        "total_revenue": total_rev,
        "platform_withheld_tax_nd117": platform_withheld_tax,
        "recommended_tax_vault_self": recommended_vault_self,
        "refundable_platform_tax_est": refundable_platform_tax,
        "safe_spendable_cash": safe_spendable_cash,
        "threshold_1b_pct": round(ratio_t1 * 100, 1),
        "threshold_3b_pct": round(ratio_t2 * 100, 1),
        "alert_level": alert_level,
        "regime": regime,
    }
```

### C. Kết quả Kiểm thử Thật trên 4 Hồ sơ Shop Điển hình tại Việt Nam

| Hồ sơ kiểm thử thực tế | Ngành & Tỷ lệ | Doanh thu Sàn / Ngoài sàn | Chi phí thực (Có HĐ hợp lệ) | Sàn đã trừ (NĐ 117) | **Cất vào Két Thuế (Tự khai/Dự phòng)** | **Thuế dự kiến được hoàn** | **Tiền xài được an toàn** | Cảnh báo tự động |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Shop Shopee nhỏ** *(850tr/năm)* | Bán lẻ (1,5%) | 600tr / 250tr | 580tr (—) | 9.000.000đ | **3.750.000đ** *(tạm dự phòng vì đạt 85%)* | **9.000.000đ** *(nếu chốt năm ≤ 1 tỷ)* | **257.250.000đ** | `RED_NEAR_THRESHOLD_85PCT` |
| **2. Shop Đa kênh** *(1,4 tỷ/năm)* | Bán lẻ (1,5%) | 900tr / 500tr | 980tr (—) | 13.500.000đ | **7.500.000đ** *(không đóng trùng 13,5tr sàn!)* | 0đ | **399.000.000đ** | `OVER_EXEMPT_AND_EINVOICE_MANDATORY` |
| **3. Quán F&B / GrabFood** *(1,8 tỷ/năm)* | F&B (4,5%) | 700tr / 1,1 tỷ | 1,15 tỷ (—) | 31.500.000đ | **49.500.000đ** | 0đ | **569.000.000đ** | `OVER_EXEMPT_AND_EINVOICE_MANDATORY` |
| **4. Shop Lớn > 3 tỷ** *(3,6 tỷ/năm)* | Bán lẻ (1% GTGT + 17% lãi) | 2,0 tỷ / 1,6 tỷ | 2,75 tỷ *(chỉ 2,4 tỷ có HĐ!)* | 30.000.000đ | **210.000.000đ** *(350tr thiếu HĐ làm mất oan 59,5tr thuế!)* | 0đ | **610.000.000đ** | `CRITICAL_PROFIT_REGIME` |

> **Giá trị thuyết phục chốt sales cực mạnh từ Hồ sơ #4:** Khi chủ shop vượt mốc 3 tỷ, chỉ riêng việc thất lạc 350 triệu hóa đơn nhập hàng đã khiến họ **mất oan 59.500.000đ tiền thuế TNCN** — gấp **12,4 lần tiền mua gói Pro cả năm (3.990.000đ)**. Đây là luận điểm ROI hoàn hảo cho đội Marketing/Sales ở Bước 6!

---

# 4. CẤP ĐỘ BẰNG CHỨNG ĐẠT ĐƯỢC (LEVEL 1..5) & RỦI RO CÒN TỒN ĐỌNG

- **Cấp độ bằng chứng hiện tại:** **Level 2 — Build / Unit & Deterministic Python Simulation Pass + Live Legal Verification.**
  - Đã kiểm chứng trực tiếp bằng trình thông dịch Python gọi thật `TitanDatabase.simulate_cfo_unit_economics(...)` trên 8 kịch bản và chạy unit verification trên 4 hồ sơ shop thực tế.
  - Đã đối chiếu văn bản pháp luật thuế có hiệu lực đến tháng `11/2026` qua tìm kiếm trực tiếp (`search_web`).
  - **Chưa đạt Level 3–5:** Chưa có giao diện web thật, chưa có số liệu tỷ lệ chuyển đổi (conversion rate) hoặc dữ liệu thanh toán thực tế từ khách hàng thật (sẽ kiểm chứng ở Giai đoạn 2 và thị trường thật).

### 4 Rủi ro CFO & Pháp lý bàn giao `@critic` (Bước 3) phản biện và khóa chặt:
1. **Rủi ro chính sách ngưỡng miễn thuế thay đổi theo năm:** Luật sửa đổi ngày 24/04/2026 giao Chính phủ quyền điều chỉnh ngưỡng miễn thuế linh hoạt. *Yêu cầu kiến trúc:* Tham số `exempt_threshold_vnd` (mặc định `1.000.000.000đ`) và `profit_method_threshold_vnd` (`3.000.000.000đ`) bắt buộc đọc từ bảng cấu hình cập nhật từ xa, không hardcode cứng trong giao diện.
2. **Rủi ro miễn trừ trách nhiệm pháp lý thuế:** Sản phẩm là **công cụ quản trị dòng tiền & ước tính dự phòng thuế tham khảo**, KHÔNG phải đại lý thuế hay tư vấn né/lách thuế. Bắt buộc gắn tuyên bố miễn trừ pháp lý rõ ràng trên màn hình kết quả và file PDF/Excel xuất ra.
3. **Rủi ro tính phần TNCN vượt ngưỡng vs. toàn bộ doanh thu:** Với nhóm 1–3 tỷ, cơ quan thuế hướng dẫn chi tiết theo từng sắc thuế (GTGT tính trên toàn bộ doanh thu khi vượt 1 tỷ; TNCN có thể áp dụng nguyên tắc tính phần vượt ngưỡng hoặc khấu trừ tùy thông tư hướng dẫn chi tiết từng kỳ). Công thức Két Thuế mặc định **khoanh dự phòng theo phương án thận trọng cao hơn (dư tốt hơn thiếu)** và hiển thị chú thích minh bạch để chủ shop đối chiếu khi nộp tờ khai trên eTax Mobile.
4. **Rủi ro lạm dụng OCR AI (User dùng bot quét hàng nghìn ảnh):** Khóa cứng hạn mức `150 / 300 / 600 lượt AI/tháng` ở backend kèm rate-limit theo ngày; chạm trần thì chuyển về nhập tay / import Excel (vẫn dùng bình thường, không gián đoạn sổ sách) và mời nâng gói hoặc mua thêm gói nạp `100 lượt AI = 49.000đ` (biên lãi gộp vẫn đạt **> 70%**).
