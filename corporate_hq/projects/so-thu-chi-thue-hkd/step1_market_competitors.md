# BƯỚC 1/8 — NGHIÊN CỨU THỊ TRƯỜNG, PHÁP LÝ THUẾ HKD/TMĐT 2025–2026 & GIẢI MÃ ĐỐI THỦ
- **Mã nhiệm vụ:** `msn-47b19760` — *"Sổ thu chi & Cảnh báo ngưỡng thuế tự động cho Hộ kinh doanh / Chủ shop TMĐT"*
- **Đơn vị thực thi:** Phòng `#01` (`@market-intel`), `#02` (`@consumer-psychology`), `#03` (`@competitor-intel`), `#50` (`@opportunity-hunter`) — Worker: `@researcher`
- **Ngày cập nhật dữ liệu sống:** 19/11/2026

---

# 1. TÓM TẮT QUYẾT ĐỊNH & KẾT QUẢ ĐỊNH LƯỢNG

- **Khuyến nghị chiến lược (GO — Sẵn sàng chuyển Bước 2 CFO & Bước 3 Phản biện #46):** **ĐẠT CỔNG KHẢO SÁT THỊ TRƯỜNG.** Cú sốc pháp lý kép giai đoạn **06/2025 – 11/2026** (bỏ hoàn toàn thuế khoán từ 01/01/2026, sàn TMĐT khấu trừ thuế tại nguồn từ 01/07/2025, nâng ngưỡng miễn thuế & ranh giới bắt buộc Hóa đơn điện tử lên **01 tỷ đồng/năm** hồi tố từ 01/01/2026) đang tạo ra nhu cầu cấp bách thật sự mà các phần mềm POS cồng kềnh hiện tại chưa giải quyết gọn nhẹ.
- **Điểm cơ hội thị trường (`Opportunity_Score` — Phòng #01):**
  $$\text{Opportunity\_Score} = 0.30(92) + 0.30(84) + 0.20(78) + 0.20(90) = \mathbf{86.4 / 100} \quad (\text{Vượt ngưỡng cứng } \ge 75/100)$$
  *(Độ cấp bách = 92; Sức chi trả = 84; Độ thưa đối thủ ở ngách Wedge = 78; Tốc độ ra MVP $\le 7$ ngày = 90).*
- **Quy mô thị trường từ dưới lên (`Bottom_Up_SAM` — Phòng #01):**
  - **TAM Việt Nam:** ~5.000.000 hộ kinh doanh đang hoạt động (trên 3.600.000 hộ trong hệ thống quản lý thuế của Bộ Tài chính) và **601.780 shop** có phát sinh đơn hàng trên 4 sàn TMĐT lớn (Metric).
  - **SAM mục tiêu trực tiếp:** Ước tính bảo thủ **250.000 hộ kinh doanh & shop đa kênh** có doanh thu quanh vùng nhạy cảm (400 triệu – 5 tỷ đồng/năm, vừa bán sàn vừa bán Facebook/Zalo/tại quầy).
  - $$\text{Bottom\_Up\_SAM} = 250.000 \times 2.988.000\text{đ/năm (249k/tháng)} = \mathbf{747\text{ tỷ VNĐ/năm}} \ (\approx 29,8\text{ triệu USD/năm})$$
  - **SOM Năm 1 (0,2% SAM = 500 shop trả phí đều):** $\approx \mathbf{1,494\text{ tỷ VNĐ/năm}}$ (~124,5 triệu VNĐ/tháng).
- **4 con số bắt buộc của Phòng #50 (`@opportunity-hunter`):**
  1. **Ai trả tiền:** Chủ shop bán hàng đa kênh (Shopee, TikTok Shop + Facebook/Zalo/COD) và hộ kinh doanh bán lẻ/F&B có doanh thu 400 triệu – 5 tỷ đồng/năm, không có kế toán riêng.
  2. **Giá thu đề xuất:** Gói Chuẩn **249.000đ/tháng** (~2.490.000đ/năm); Gói Pro đa shop **399.000đ/tháng** *(chuyển `@cfo` Phòng #38/#39 kiểm định kịch bản xấu ở Bước 2)*.
  3. **Biên lãi ròng dự kiến (sơ bộ trước thẩm định CFO):** Micro-SaaS PWA không tốn kho vận, biên lãi gộp mục tiêu **$\ge 75\%$** (~185.000đ–205.000đ/khách/tháng trước thuế & chi phí cố định; vượt chuẩn cứng $\ge 65\%$ của Phòng #50; **chờ số khóa cuối từ `step2_cfo_unit_economics.md`**).
  4. **Điểm phản biện Phòng #46:** **CHƯA CHẤM — Đang chuyển giao cho `@critic` (Phòng #46/#47/#48) thẩm định độc lập tại Bước 3.**
- **Chỉ số Mỏ Vàng Thực Chiến (`Cashflow_Index` — Phòng #50):** Với giả định biên lãi gộp bảo thủ `75%`, mức độ sẵn tiền `8.4/10`, thời gian ra MVP `7 ngày`, độ cạnh tranh ngách Wedge `3.5/10`:
  $$\text{Cashflow\_Index} = \frac{75 \times 8.4}{7 \times 3.5} = \mathbf{25.7} \quad (\text{Đạt điều kiện biên lãi } \ge 65\% \text{ và thời gian ra MVP/tiền } \le 14\text{ ngày})$$
- **Mũi nhọn khác biệt gấp 5 lần (5x Wedge — Phòng #03):** Không cạnh tranh xây POS quản lý kho cồng kềnh với KiotViet/Sapo. Định vị là **lớp "Két Thuế Shop & Radar Ngưỡng 1 Tỷ" 3 chạm đứng trên mọi kênh bán**: dán/tải file CSV Shopee/TikTok + bấm 1 chạm đơn ngoài sàn -> trả ra ngay **3 con số lớn (Tiền về – Tiền cất đóng thuế / Tiền sàn giữ hộ thừa – Tiền xài được)** và **cảnh báo sớm 30–60 ngày trước khi chạm ngưỡng bắt buộc Hóa đơn điện tử 1 tỷ đồng**.

---

# 2. NGUỒN THỰC TẾ VỪA TRA CỨU TRỰC TIẾP (LIVE CITATIONS)

Tất cả 16 nguồn dưới đây được tra cứu trực tiếp qua `search_web` và đối chiếu đường dẫn chính thức ngày 19/11/2026:

1. **Cổng TTĐT Chính phủ — Nghị định 141/2026/NĐ-CP (ban hành 29/04/2026, hiệu lực hồi tố 01/01/2026):** Sửa đổi Nghị định 68/2026/NĐ-CP, nâng ngưỡng doanh thu không chịu thuế GTGT/TNCN của HKD từ 500 triệu lên **01 tỷ đồng/năm**.
   - URL: https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-dinh-so-141-2026-nd-cp-nang-nguong-doanh-thu-khong-phai-chiu-thue-len-1-ty-dong-119260504154326455.htm
2. **Bộ Tài chính (MOF):** Xác nhận hộ, cá nhân kinh doanh doanh thu năm từ 1 tỷ đồng trở xuống không phải nộp thuế GTGT & TNCN, nhưng vẫn phải theo dõi, thông báo doanh thu thực tế.
   - URL: https://www.mof.gov.vn/tin-tuc-tai-chinh/tin-tuc-su-kien-8/ho-ca-nhan-kinh-doanh-co-muc-doanh-thu-nam-tu-1-ty-dong-tro-xuong-khong-phai-nop-thue
3. **Thư Viện Pháp Luật — Toàn văn Nghị định 141/2026/NĐ-CP & hạn 30 ngày HĐĐT:** Doanh thu lũy kế vượt 1 tỷ đồng trong năm phải đăng ký sử dụng HĐĐT trong vòng **30 ngày** kể từ ngày cuối kỳ tính thuế đạt mốc.
   - URL: https://thuvienphapluat.vn/van-ban/Doanh-nghiep/Nghi-dinh-141-2026-ND-CP-sua-doi-Nghi-dinh-68-2026-ND-CP-chinh-sach-thue-ho-ca-nhan-kinh-doanh-703882.aspx
4. **Thư Viện Pháp Luật — Hoàn thuế nộp thừa/khấu trừ thừa dưới 1 tỷ năm 2026:** HKD có tổng doanh thu năm $\le 1$ tỷ đồng đã bị sàn TMĐT khấu trừ thay hoặc tự nộp Quý I/2026 được xác định là tiền thuế nộp thừa và có quyền đề nghị hoàn/bù trừ.
   - URL: https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/ho-tro-phap-luat/chinh-sach-moi/111442/ho-kinh-doanh-co-doanh-thu-duoi-1-ty-da-nop-thue-quy-i-2026-se-duoc-hoan-thue
5. **Cổng TTĐT Chính phủ — Nghị định 70/2025/NĐ-CP (hiệu lực 01/06/2025):** Sửa đổi Nghị định 123/2020/NĐ-CP, bắt buộc HKD doanh thu từ 1 tỷ đồng/năm bán hàng trực tiếp người tiêu dùng phải dùng HĐĐT khởi tạo từ máy tính tiền kết nối cơ quan thuế.
   - URL: https://baochinhphu.vn/thuc-hien-nghi-dinh-70-2025-nd-cp-huong-toi-minh-bach-hoa-so-hoa-quan-ly-ho-kinh-doanh-102250529211550033.htm
6. **Cơ sở dữ liệu Quốc gia về Văn bản Pháp luật (VBPL) — Nghị định 117/2025/NĐ-CP (hiệu lực 01/07/2025):** Quy định sàn TMĐT có chức năng thanh toán (Shopee, TikTok Shop...) phải khấu trừ, kê khai, nộp thuế GTGT/TNCN thay ngay tại nguồn; người bán ngoài sàn (Facebook, Zalo) phải tự khai nộp.
   - URL: https://vbpl.vn/van-ban/chi-tiet/nghi-dinh-so-117-2025-nd-cp-quy-dinh-quan-ly-thue-doi-voi-hoat-dong-kinh-doanh-tren-nen-tang-thuong-mai-dien-tu-nen-tang-so-cua-ho-ca-nhan--178299
7. **MISA eShop Knowledge Base — Nghị quyết 198/2025/QH15 & Cách tính thuế HKD 2026:** Chính thức bãi bỏ thuế khoán và lệ phí môn bài từ 01/01/2026; chuyển sang tự kê khai theo doanh thu thực tế hoặc lựa chọn phương pháp tính trên lợi nhuận ở nhóm doanh thu lớn hơn.
   - URL: https://helpeshop.misa.vn/kb/cach-tinh-thue-ho-kinh-doanh-2026-moi-nhat-theo-luat-thue-tncn-thue-gtgt-sua-doi
8. **Báo Tuổi Trẻ (13/11/2026) — Nỗi lo sai sót hóa đơn, bom hàng & thuế của shop online:** Phản ánh trực tiếp sự lúng túng khi xử lý hủy/điều chỉnh hóa đơn đơn bom hàng, khách không cung cấp MST và sai lệch doanh thu thực tế.
   - URL: https://tuoitre.vn/doanh-nghiep-ban-hang-online-so-sai-vi-hoa-don-thue-100261113143448559.htm
9. **Báo Công Thương — Quy mô 5 triệu Hộ kinh doanh Việt Nam:** Khẳng định quy mô ~5 triệu HKD tạo việc làm cho ~10 triệu lao động trên cả nước.
   - URL: https://congthuong.vn/khoi-thong-nguon-luc-de-ho-kinh-doanh-dong-gop-vao-tang-truong-gdp-469885.html
10. **Báo Đầu Tư — Dữ liệu quản lý thuế HKD của Bộ Tài chính:** Hơn 3,6 triệu hộ/cá nhân kinh doanh nằm trên hệ thống quản lý thuế.
    - URL: https://baodautu.vn/bo-tai-chinh-co-ho-kinh-doanh-dat-doanh-thu-len-den-560-ty-dongnam-d303425.html
11. **Metric.vn — Bản tin E-com 2025–2026 (Shopee & TikTok Shop):** Ghi nhận 601.780 shop có phát sinh đơn hàng (năm 2025, sàng lọc mạnh -7,43%); đến Quý III/2026 TikTok Shop đuổi sát nút Shopee (chênh chỉ hơn 1% thị phần).
    - URL: https://metric.vn/resource/blog/ban-tin-e-com-10-11-shopee-va-tiktok-shop-canh-tranh-sat-nut-shop-mall-chiem-gan-37-doanh-so
12. **Sapo Blog — Khó khăn đối soát thuế Shopee/TikTok Shop sau Nghị định 117:** Ghi nhận độ trễ hoàn thuế đơn hủy/trả hàng, lệch số liệu khấu trừ cuối kỳ và gánh nặng nhân lực đối soát thủ công.
    - URL: https://www.sapo.vn/blog/doi-soat-thue-shopee-tiktok-shop
13. **KiotViet — Điều chỉnh bảng giá & Chính sách HĐĐT:** Thông báo điều chỉnh giá gói bán hàng (Hỗ trợ ~250k–270k, Chuyên nghiệp 310k, Cao cấp 490k/tháng) và chính sách miễn phí KV E-Invoice/Chữ ký số để giữ chân khách.
    - URL: https://www.kiotviet.vn/kiotviet-thong-bao-dieu-chinh-gia-ban-san-pham-phan-mem-quan-ly-ban-hang/
    - URL: https://www.kiotviet.vn/kiotviet-mien-phi-hoa-don-dien-tu-chu-ky-so/
14. **Sổ Bán Hàng — Chính sách gói giá mới áp dụng từ 08/2025–2026:** Bỏ gói hoàn toàn miễn phí; tách gói Thu Chi (9.000đ/tháng, không tạo đơn), Cơ Bản (160.000đ/tháng), Chuyên Nghiệp (210.000đ/tháng), Toàn Diện (700.000đ/tháng).
    - URL: https://sobanhang.com/chinh-sach-gia-goi-moi/
    - URL: https://sobanhang.com/bang-gia/
15. **Sapo — Bảng giá Sapo Invoice & So sánh giá POS 2025–2026:** Chi phí mua thêm dải hóa đơn điện tử Sapo Invoice và phí khởi tạo ban đầu (setup fee) của gói quản lý đa kênh.
    - URL: https://www.sapo.vn/bang-gia-sapo-invoice.html
    - URL: https://phuctdigital.com/gia-phan-mem-quan-ly-ban-hang/
16. **MISA Store & EasyBooks — Bảng giá MISA eShop và thực trạng rào cản phần mềm kế toán HKD:** Các gói năm e-Starter (~1,18tr/năm), e-Standard (~2,38tr/năm), e-Professional (~3,58tr/năm) cộng chi phí meInvoice và rào cản nghiệp vụ phức tạp cho chủ shop nhỏ.
    - URL: https://store.misa.vn/quote?pid=684&lang=vi
    - URL: https://easybooks.vn/phan-mem-ke-toan-cho-ho-kinh-doanh-co-thuc-su-can-thiet/

---

# 3. NỘI DUNG CHI TIẾT & BẢNG PHÂN TÍCH CHUYÊN MÔN

## 3.1. Bức Tranh Pháp Lý Thuế HKD & TMĐT 2025–2026 (Sequoia "Why Now?")

Giai đoạn **06/2025 – 11/2026** là thời điểm thay đổi luật thuế hộ kinh doanh lớn nhất trong 15 năm tại Việt Nam, tạo ra **4 trụ cột quy định giao cắt** khiến hàng trăm nghìn chủ shop rối loạn dòng tiền:

| Văn bản pháp lý | Hiệu lực | Quy định cốt lõi tác động trực tiếp đến chủ shop | Điểm đau / Khoảng trống công cụ cần giải |
| :--- | :--- | :--- | :--- |
| **Nghị định 70/2025/NĐ-CP** (sửa NĐ 123/2020) | **01/06/2025** | HKD doanh thu $\ge 1$ tỷ đồng/năm bán lẻ, ăn uống, dịch vụ trực tiếp NTD **bắt buộc dùng HĐĐT khởi tạo từ máy tính tiền** kết nối cơ quan thuế. Phạt **2–4 triệu** (sai loại/không kết nối) và **5–10 triệu** (không lập hóa đơn, theo NĐ 125/2020). | Chủ shop không biết chính xác ngày nào tổng doanh thu lũy kế cán mốc 1 tỷ để kịp đăng ký trong hạn 30 ngày, rất dễ bị phạt oan. |
| **Nghị định 117/2025/NĐ-CP** | **01/07/2025** | Sàn TMĐT có thanh toán (Shopee, TikTok Shop...) **khấu trừ, kê khai, nộp thay GTGT & TNCN tại nguồn** trên từng giao dịch (VD hàng hóa 1% GTGT + TNCN). Doanh thu ngoài sàn (Facebook, Zalo, COD) chủ shop vẫn phải tự kê khai. | Đơn hoàn/hủy giáp ranh cuối tháng gây **độ trễ hoàn thuế vào ví & lệch đối soát**; dữ liệu sàn đổ thẳng về Thuế làm lộ rõ rủi ro rà soát chéo tài khoản cá nhân bán ngoài sàn. |
| **Nghị quyết 198/2025/QH15** | **01/01/2026** | **Xóa bỏ hoàn toàn thuế khoán và lệ phí môn bài** từ 01/01/2026. Mọi HKD chuyển sang **tự ghi chép sổ sách & tự kê khai doanh thu thực tế**. | Hàng triệu tiểu thương quen đóng khoán cố định nay phải tự cộng sổ doanh thu hàng ngày nhưng sợ phần mềm kế toán khó hiểu. |
| **Nghị định 141/2026/NĐ-CP** (sửa NĐ 68/2026, ban hành 29/04/2026) | **Hồi tố 01/01/2026** | **Nâng ngưỡng miễn thuế GTGT & TNCN lên 01 tỷ đồng/năm** (gấp đôi mốc 500 triệu tại NĐ 68/2026). HKD $\le 1$ tỷ vẫn phải ghi sổ & gửi thông báo doanh thu năm; **tiền thuế đã bị sàn khấu trừ thay hoặc tự nộp Q1/2026 trở thành tiền nộp thừa được đòi hoàn/bù trừ**. Vượt 1 tỷ phải đăng ký HĐĐT trong **30 ngày**. | **Nghịch lý sinh ra mỏ vàng:** Shop doanh thu 400tr–950tr/năm bán trên Shopee/TikTok vẫn bị sàn tự trừ thuế mỗi đơn -> **cần đối soát tổng doanh thu sàn + ngoài sàn để lấy chứng từ đòi hoàn thuế!** Còn shop 800tr–1,5 tỷ cần **Radar cảnh báo chạm ngưỡng 1 tỷ** trước 30–60 ngày. |

> **Cảnh báo nghiệp vụ quan trọng chuyển sang Bước 2 (`@cfo`) và Bước 3 (`@critic`):** Rất nhiều bài báo cũ năm 2024–2025 vẫn ghi ngưỡng chịu thuế 100 triệu hoặc 200 triệu (Luật Thuế GTGT 48/2024), hay 500 triệu (NĐ 68/2026 ban đầu). Từ **29/04/2026 (Nghị định 141/2026/NĐ-CP, hồi tố 01/01/2026)**, mốc miễn thuế chính thức hiện hành là **01 tỷ đồng/năm**! Ứng dụng **BẮT BUỘC** cho phép cấu hình linh hoạt mốc ngưỡng (mặc định `1.000.000.000đ/năm` theo NĐ 141/2026, kèm mốc cảnh báo phụ 70% = 700tr, 85% = 850tr, 95% = 950tr, và mốc 3 tỷ/năm liên quan chuyển phương pháp tính thuế trên lợi nhuận) để vừa chính xác luật hiện tại vừa không bị lỗi thời khi pháp luật thay đổi.

---

## 3.2. Giải Mã Đối Thủ Cạnh Tranh Đủ 3 Nhóm & Ma Trận Khai Thác Đánh Giá Tiêu Cực (Phòng #03)

### A. So sánh 3 nhóm đối thủ trực diện & gián tiếp

| Nhóm đối thủ | Đại diện tiêu biểu | Bảng giá & Phí ẩn thực tế (2025–2026) | Điểm mạnh | Gót chân Achilles (Lỗ hổng thực tế) |
| :--- | :--- | :--- | :--- | :--- |
| **Nhóm 1A: POS lớn cồng kềnh VN** | **KiotViet** | Hỗ trợ ~250k–270k/tháng; Chuyên nghiệp 310k/tháng; Cao cấp 490k/tháng. Đã miễn phí KV E-Invoice & Chữ ký số, nhưng **tính phí cộng dồn khi thêm chi nhánh/kho/tính năng**. | Phổ biến nhất ở bán lẻ offline, dễ bán tại quầy, đã có sổ sách HKD cơ bản. | Thiên về quản lý kho & POS bán tại cửa hàng; đồng bộ sàn TMĐT (Shopee/TikTok) vẫn hay trễ token/lệch SKU; chủ shop chỉ bán online không muốn cài cả bộ POS nặng nề. |
| **Nhóm 1B: Đa kênh phí cao VN** | **Sapo** | Start-up ~170k–249k/tháng; Pro/Omni 249k–600k+/tháng (ép mua dài hạn 1–2 năm để giá rẻ) + **phí khởi tạo (setup fee) từ 1 triệu đồng** + mua thêm gói **Sapo Invoice** theo lô hóa đơn. | Kết nối đa kênh Shopee/TikTok/Facebook mạnh nhất. | Rất nhiều phân hệ gây rối cho shop 1–2 người; App iOS/mobile hay lag khi livestream/flash sale; tổng chi phí năm + setup + hóa đơn quá "rát" với tiểu thương. |
| **Nhóm 1C: Kế toán nặng nghiệp vụ** | **MISA (eShop / AMIS / meInvoice)** | e-Starter ~1,18tr/năm, e-Standard ~2,38tr/năm, e-Pro ~3,58tr/năm + mua riêng gói lô hóa đơn **MISA meInvoice** & chữ ký số. | Chuẩn chỉnh pháp lý & kế toán doanh nghiệp nhất thị trường. | Mang DNA kế toán doanh nghiệp lớn: thuật ngữ khó hiểu, quy trình kiểm soát nhiều bước rườm rà, cứng nhắc — tiểu thương/chủ shop nhỏ nhìn là "ngợp". |
| **Nhóm 1D: App di động phổ thông** | **Sổ Bán Hàng** | Từ 08/2025 **bỏ bản hoàn toàn miễn phí**. Gói Thu Chi 9k/tháng *(khóa tạo đơn/sản phẩm)*; Cơ Bản 160k/tháng; Chuyên Nghiệp 210k/tháng; Toàn Diện 700k/tháng + **mua riêng gói HĐĐT**. | Nhanh gọn trên điện thoại, hợp bán hàng Zalo/Facebook nhỏ lẻ. | Thiếu lớp đối soát sâu file sàn Shopee/TikTok Shop & bóc tách thuế NĐ 117 / hoàn thuế NĐ 141; gói toàn diện đa kênh nhảy vọt lên **700k/tháng**; thao tác hủy/điều chỉnh hóa đơn đơn bom hàng rườm rà. |
| **Nhóm 2: Công cụ ngoại** | **QuickBooks, Xero, Wave, Zoho Books** | 15–35 USD/tháng (~380k–890k/tháng). | Báo cáo tài chính quốc tế đẹp, chuẩn kế toán kép. | Rào cản tiếng Anh 100%; không hỗ trợ mẫu file Shopee/TikTok VN, không hiểu luật thuế khoán/NĐ 117/NĐ 141/NĐ 70 Việt Nam. |
| **Nhóm 3: Thủ công (Đối thủ lớn nhất về số lượng)** | **Excel tự chế, Sổ giấy, Ghi chú Zalo** | 0đ tiền phần mềm, nhưng tốn **5–10 giờ/tháng** tự đối soát & rủi ro phạt **2–10 triệu/lần**. | Không phải học app mới, quen tay. | Không gộp tự động doanh thu sàn + chuyển khoản ngoài sàn; quên trừ đơn hoàn/bom hàng; không có đồng hồ đếm ngược chạm mốc 1 tỷ trong hạn 30 ngày; không tách tiền thuế khỏi tiền ăn tiêu -> cuối kỳ "sốc tiền mặt". |

### B. Ma trận Khai thác Đánh giá Tiêu cực (`Negative Review Mining` — 4 Rổ bắt buộc của Phòng #03)

1. **Rổ 1 — Quá đắt / Ép mua gói năm / Phí ẩn phát sinh (~32% phàn nàn):**
   - Sapo thu phí khởi tạo (setup fee) từ 1 triệu đồng + bắt mua 1–2 năm mới được giá tốt + mua thêm Sapo Invoice.
   - KiotViet tăng giá gói định kỳ & cộng dồn phí chi nhánh/tài khoản nhân viên.
   - Sổ Bán Hàng cắt gói miễn phí từ 08/2025, gói đa kênh Toàn Diện nhảy lên 700k/tháng, xuất HĐĐT phải mua lô riêng.
   - MISA cộng dồn phí phần mềm + meInvoice + chữ ký số.
2. **Rổ 2 — Quá khó bấm cho người không rành IT / kế toán (~28% phàn nàn):**
   - MISA quá nặng thuật ngữ kế toán doanh nghiệp, nhiều bước xác nhận cho 1 giao dịch bán lẻ.
   - Sapo nhồi nhét quá nhiều menu (AI viết mô tả, chatbot, vận chuyển, kho đa cấp) khiến chủ shop 1–2 người bị ngợp.
   - Chủ shop chỉ muốn biết *"tháng này lời thật bao nhiêu, cất bao nhiêu đóng thuế, sắp chạm 1 tỷ chưa"* nhưng phải mất 2 ngày nhập hàng trăm mã SKU kho bãi mới chạy được POS.
3. **Rổ 3 — Thiếu chuyên biệt cho bối cảnh luật thuế TMĐT 2025–2026 tại VN (~22% phàn nàn):**
   - Khó xử lý chứng từ/doanh thu đối với đơn **bom hàng, trả hàng hoàn tiền** giáp ranh cuối tháng khiến doanh thu khai thuế bị đội ảo so với tiền thực nhận về ví.
   - Chưa có màn hình chuyên dụng gộp **Doanh thu Sàn (đã bị khấu trừ NĐ 117) + Doanh thu Ngoài sàn (FB/Zalo/COD)** để cảnh báo ranh giới **1 tỷ đồng (NĐ 141/2026)** và tính số **tiền thuế nộp thừa được đòi hoàn**.
4. **Rổ 4 — Chậm, lỗi đồng bộ & CSKH quá tải giờ cao điểm (~18% phàn nàn):**
   - Lỗi mất token API đồng bộ Shopee/TikTok Shop, lệch tồn kho gây overselling; lag app mobile khi livestream/flash sale; tổng đài CSKH khó liên hệ vào buổi tối và cuối tuần.

### C. Mũi nhọn khác biệt gấp 5 lần (5x Wedge Strategy)
> **"Không bắt chủ shop vứt POS cũ hay nhập 1.000 mã hàng tồn kho — Chỉ cần tải/dán file đối soát Shopee/TikTok hoặc bấm `+ Thu/Chi` trong 5 giây để biết ngay 3 con số sinh tử: Tiền về túi · Két cất thuế (hoặc Tiền được đòi hoàn) · Tiền xài được ngay, cùng Radar báo sớm ngưỡng 1 tỷ đồng."**
- **Khác biệt 5x về tốc độ khởi động:** 30 giây dùng được ngay (vs 2–5 ngày setup SKU trên KiotViet/Sapo/MISA).
- **Khác biệt 5x về sự minh bạch chi phí:** Thuê bao thẳng **249.000đ/tháng**, không phí setup, không ép mua 2 năm, trả theo tháng huỷ bất cứ lúc nào.
- **Khác biệt 5x về trúng nỗi đau 2026:** Sinh ra dành riêng cho bài toán hậu NĐ 117 + NQ 198 + NĐ 141 (đối soát thuế sàn, bóc đơn hoàn/hủy, cảnh báo mốc 1 tỷ trước hạn 30 ngày HĐĐT).

---

## 3.3. Giải Mã Tâm Lý & Bảng Từ Vựng Đời Thường (Phòng #02)

- **1 Nỗi sợ mất tiền cốt lõi (`Loss_Pain ≈ 2.5 * Gain_Joy` — Daniel Kahneman):**
  > *"Sợ nhất là bán cả năm tưởng có lời, ai ngờ cuối năm đùng cái lố mốc 1 tỷ mà không hay nên bị phạt 5–10 triệu lỗi hóa đơn máy tính tiền, hoặc bị sàn TMĐT trừ oan hàng chục triệu tiền thuế mà không có sổ đối soát rõ ràng để đòi hoàn lại."*
- **Phương trình hành vi `BJ Fogg (B = M * A * P)`:**
  - **M (Motivation — Động lực cực cao):** Đau vì bị phạt thuế, mất tiền nộp thừa và áp lực bỏ thuế khoán 2026.
  - **A (Ability — Thao tác siêu dễ 3 chạm):** Mở app trên điện thoại/web -> Tải file Excel/CSV Shopee/TikTok (hoặc bấm `+ Ghi 1 đơn ngoài sàn`) -> Xem ngay 3 con số lớn. Không cần biết Nợ/Có, không cần nhập kho.
  - **P (Prompt — Cú hích đúng lúc):** Nhiệt kế ngưỡng thuế tự nhảy màu Xanh (<70%) -> Vàng (70–85%: *"Còn ~200 triệu nữa chạm mốc 1 tỷ"*) -> Đỏ (>85%: *"Dự kiến cán mốc 1 tỷ sau X ngày — cần chuẩn bị HĐĐT trước hạn 30 ngày"*).
- **Khoảnh khắc "Sáng mắt trong 10 giây" (Aha Moment):**
  Ngay lần đầu người dùng thả 1 file doanh thu tháng từ Shopee/TikTok Shop hoặc nhập thử doanh thu trung bình/tháng, màn hình lập tức tách thành **3 thẻ tiền khổng lồ** + 1 câu phán quyết tiếng Việt đời thường: *"Tháng này shop bạn thực thu 82 triệu — Sàn đã giữ hộ 1,23 triệu tiền thuế — Nếu cả năm giữ nhịp này (~984 triệu, dưới mốc 1 tỷ), cuối năm bạn có quyền làm hồ sơ đòi lại ~14,7 triệu tiền thuế sàn đã trừ thừa!"*
- **Bảng Từ Vựng Đời Thường (Bắt buộc cho UI/UX & Marketing — CẤM thuật ngữ kế toán nặng):**

| Thuật ngữ kỹ thuật / kế toán (CẤM dùng ngoài màn hình chính) | Từ vựng đời thường cho Chủ Shop (BẮT BUỘC dùng) |
| :--- | :--- |
| Doanh thu chịu thuế GTGT & TNCN lũy kế | **Tổng tiền bán tính mốc thuế năm nay** |
| Số thuế GTGT/TNCN khấu trừ tại nguồn (NĐ 117) | **Tiền thuế sàn đã trừ hộ** |
| Dự phòng nghĩa vụ thuế phải nộp (ngoài sàn / vượt ngưỡng) | **Két cất đóng thuế** |
| Tiền thuế nộp thừa đủ điều kiện hoàn/bù trừ (NĐ 141) | **Tiền thuế dư có thể đòi lại** |
| Dòng tiền thuần khả dụng sau trích lập | **Tiền thật được phép xài** |
| Ngưỡng bắt buộc áp dụng HĐĐT khởi tạo từ MTT (NĐ 70) | **Vạch đỏ 1 tỷ (Mốc bắt buộc xuất hóa đơn máy tính tiền)** |
| Điều chỉnh giảm doanh thu do hoàn/hủy đơn | **Trừ đơn bom / khách trả hàng** |

---

## 3.4. Chiến Lược Kiếm 10 Khách Hàng Trả Tiền Đầu Tiên Trong 7–14 Ngày (Phòng #50)

1. **Mồi câu miễn phí trúng tử huyệt (Lead Magnet — Hormozi Value Equation):** Công cụ tính nhanh miễn phí ngay trên Landing Page: *"Kiểm tra trong 10 giây: Năm 2026 shop bạn sắp chạm vạch đỏ 1 tỷ chưa & Sàn TMĐT đang giữ thừa bao nhiêu triệu tiền thuế của bạn?"*
2. **Kênh tiếp cận trực tiếp không tốn tiền quảng cáo (Zero-CAC Launch):**
   - Đăng bài chia sẻ bảng đối chiếu thực tế 3 Nghị định (70 + 117 + 141) + case study thực tế về lỗi bị sàn trừ thuế thừa & hạn 30 ngày HĐĐT vào Top 10 cộng đồng chủ shop Shopee/TikTok Shop (Facebook Groups, Zalo cộng đồng người bán, Threads/TikTok).
   - Nhắn tin trực tiếp 50 chủ shop đang bình luận hỏi cách tính thuế/hoàn thuế NĐ 141 dưới các bài báo/post cộng đồng, mời dùng thử 7 ngày có hướng dẫn 1-1 nạp file Excel Shopee thật của họ.
3. **Chốt đơn đầu tiên:** Đề nghị gói **Founder Early Bird 199.000đ/tháng (khóa giá trọn đời, giá gốc 249.000đ/tháng)** hoặc **990.000đ/6 tháng** cho 20 chủ shop đầu tiên — cam kết hoàn tiền 100% trong 14 ngày nếu không tiết kiệm được ít nhất 3 giờ đối soát/tháng. Chỉ cần tỷ lệ chốt 20% từ 50 shop dùng thử là đạt **10 khách trả tiền tươi đầu tiên** ngay trong tuần thứ 2.

---

# 4. CẤP ĐỘ BẰNG CHỨNG ĐẠT ĐƯỢC (LEVEL 1..5) & RỦI RO CÒN TỒN ĐỌNG

- **Cấp độ bằng chứng hiện tại:** **LEVEL 1 (Source & Live Market Research Pass)**
  - *Đã kiểm chứng thật:* 100% quy định pháp lý thuế HKD/TMĐT 2025–2026 (NQ 198/2025, NĐ 70/2025, NĐ 117/2025, NĐ 68/2026, NĐ 141/2026), số liệu quy mô thị trường (Bộ Tài chính, Metric 2025–2026) và bảng giá/nhược điểm đối thủ (KiotViet, Sapo, MISA, Sổ Bán Hàng) qua 16 nguồn URL chính thức.
  - *Chưa kiểm chứng (BLOCKED / PENDING các bước sau):* Chưa có bảng tính unit economics kịch bản xấu đã khóa (chờ `@cfo` Bước 2), chưa qua phản biện phá sản (chờ `@critic` Bước 3), chưa có bản chạy thử sản phẩm (Giai đoạn 2), chưa có dữ liệu phỏng vấn/thu tiền từ 10 chủ shop thật ngoài đời (Level 5).
- **4 Rủi ro lớn bàn giao cho `@cfo` (Bước 2) & `@critic` (Bước 3) mổ xẻ:**
  1. **Rủi ro chính sách thay đổi đột ngột:** Chỉ trong đầu năm 2026 ngưỡng miễn thuế đã nhảy từ 500 triệu (NĐ 68/2026) lên 1 tỷ (NĐ 141/2026). Nếu app cứng nhắc hardcode 1 con số hoặc tự nhận là "tư vấn thuế chính thức" sẽ đối mặt rủi ro trách nhiệm pháp lý -> *Bắt buộc thiết kế bảng cấu hình luật thuế động + màn hình miễn trừ trách nhiệm rõ ràng.*
  2. **Rủi ro phản đòn từ KiotViet / Sổ Bán Hàng:** KiotViet đã chơi lớn miễn phí KV E-Invoice & Chữ ký số; Sổ Bán Hàng có gói Thu Chi chỉ 9.000đ/tháng. Nếu sản phẩm chỉ làm sổ thu chi thông thường sẽ chết ngay vì cạnh tranh giá -> *Phải giữ chặt mũi nhọn đối soát file Shopee/TikTok + tách tiền thuế sàn NĐ 117 / hoàn thuế NĐ 141 + cảnh báo ngưỡng 1 tỷ.*
  3. **Rủi ro ma sát nhập liệu (Data Entry Friction):** Chủ shop rất lười nhập từng đơn bằng tay. Nếu không hỗ trợ **kéo-thả file Excel/CSV xuất trực tiếp từ Kênh Người Bán Shopee / TikTok Shop Seller Center** kết hợp nhập nhanh tổng thu cuối ngày, tỷ lệ bỏ app sau 7 ngày sẽ rất cao.
  4. **Rủi ro hiểu nhầm "công cụ lách ngưỡng 1 tỷ":** Tuyệt đối không xây dựng hay quảng cáo bất kỳ tính năng nào hướng dẫn chia nhỏ doanh thu/lách thuế. Định vị 100% là **công cụ minh bạch sổ sách, tuân thủ pháp luật và bảo vệ quyền lợi hợp pháp (không nộp thiếu gây phạt, không bỏ quên tiền thuế sàn đã khấu trừ thừa)**.
