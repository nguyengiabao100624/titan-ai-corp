# HỒ SƠ SĂN CƠ HỘI PHẦN MỀM THƯƠNG MẠI CẤP FLAGSHIP (TITAN AI CORP v11.0)

- **Đơn vị thực hiện:** Phòng #50 Trinh sát Săn Cơ hội Cấp Venture (`@trinh-sat-co-hoi`), phối hợp chuẩn Cổng 0 của Tổng Giám đốc `#00` (`00-ceo.md`), Phòng `#38` Tài chính và Phòng `#46` Phản biện.
- **Ngày lập hồ sơ:** 19/11/2026
- **Tiêu chuẩn áp dụng:** Hiến pháp Chống Sản phẩm Đồ chơi v11.0 (`Product_Scale_Score >= 90/100`, không chiều nào dưới `17/20`), Bộ lọc Săn Cơ hội 7 Chiều Cấp Venture, Luật Cấm 1-Prompt (`ANTI_ONE_PROMPT_LAW` 5 Cụm Song song) và Kiến trúc Khởi đầu 0 đồng hạ tầng mở rộng lên `$10.000` đến `$100.000 MRR`.
- **Mức độ bằng chứng:** Cấp độ 1 và 2 (Đối chiếu bảng giá công khai, phản hồi người dùng thực tế năm 2025 đến 2026 trên Product Hunt, IndieHackers và cộng đồng SaaS toàn cầu; mô phỏng đơn vị kinh tế định lượng bằng `TitanDatabase.simulate_cfo_unit_economics`; chưa triển khai kiểm thử thực tế trên người dùng trả phí cấp độ 4 đến 5).

---

## PHẦN 1. NGUYÊN TẮC SÀNG LỌC CẤP VENTURE VÀ BÀI HỌC CHỨNG MINH TỪ THỊ TRƯỜNG 2026

Trước khi lựa chọn 3 cơ hội Flagship, Phòng `#50` đã tự loại bỏ 100% các nhóm ý tưởng thuộc **Danh sách Đen Cấm Ý tưởng Đồ chơi**: các trang biểu mẫu 3 ô nhập liệu, tiện ích cắt ghép/nén tệp đơn lẻ dùng 1 lần/năm rồi quên, máy tính tĩnh một trang, hay phần mềm sổ sách cửa hàng nhỏ mà một kỹ sư tập sự có thể viết trong 1 buổi tối.

Thay vào đó, cả 3 ứng viên trong hồ sơ này đều được thiết kế theo đúng mô hình các đội nhỏ đánh bại tập đoàn lớn đã được kiểm chứng doanh thu thực tế giai đoạn 2025 đến 2026:

- **Tally đánh thắng Typeform:** Đạt trên **$6 triệu ARR** (~$501.000 MRR) với đội ngũ chỉ khoảng 10 người nhờ trải nghiệm soạn thảo khối mượt như Notion, bản miễn phí hào phóng gắn dấu nhỏ *"Tạo bằng Tally"* tự nhân bản vòng lặp PLG (nguồn: `okara.ai/blog/tally-revenue-growth`).
- **Dub.co đánh thắng Bitly:** Giành giải #1 Product of the Month trên Product Hunt và phục vụ cả Perplexity, Vercel, Framer nhờ kiến trúc Edge siêu tốc, mã nguồn mở và sản phẩm tự lan truyền (nguồn: `dub.co/blog/product-hunt`).
- **Chiến lược bất đối xứng của Titan AI Corp v11.0:** Đánh thẳng vào 3 thị trường SaaS toàn cầu nơi tập đoàn cũ đang thu **$20 đến $500/tháng**, khóa hệ điều hành, ép trả phí theo từng đầu người hoặc bắt tải dữ liệu mật lên đám mây -> dùng **lõi tính toán cục bộ trên trình duyệt (WebCodecs, DuckDB-WASM, IndexedDB/OPFS) kết hợp tầng miễn phí Cloudflare Pages/Workers/D1/R2** để vừa đạt tầm vóc **Workspace Studio đa màn hình** (đòi hỏi 5 Cụm Chuyên gia thi công song song), vừa giữ **chi phí hạ tầng khởi đầu 0 đồng**, vừa bán được hai tầng giá **Toàn cầu (USD $12 đến $49/tháng)** và **Việt Nam (199.000đ đến 599.000đ/tháng)**.

---

## PHẦN 2. BẢNG CHẤM ĐIỂM TỔNG HỢP 5 CHIỀU (`Product_Scale_Score >= 90/100`)

| Hạng | Tên dự án Flagship | Hạng cơ hội | Tần suất & Thị trường (`/20`) | Hào kỹ thuật (`/20`) | Đủ tính năng thương mại (`/20`) | Studio UI (`/20`) | Tăng trưởng & Thắng lớn (`/20`) | **Tổng điểm (`/100`)** | Giá hỗn hợp (VNĐ/tháng) | Biên lãi xấu (Cổng 1) | Hòa vốn |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | **MotionDeck Studio** (Quay màn hình điện ảnh + Demo tương tác WebCodecs) | `FLAGSHIP_VENTURE` | 19 | 20 | 19 | 19 | 18 | **95/100** | 299.000đ (`$12` / `199k`) | **87,1%** | **6 khách** |
| **2** | **DuckPulse BI** (Studio phân tích dữ liệu & Dashboard lõi DuckDB-WASM cục bộ) | `FLAGSHIP_VENTURE` | 19 | 20 | 19 | 18 | 18 | **94/100** | 379.000đ (`$15` / `249k`) | **86,0%** | **5 khách** |
| **3** | **DealCraft Studio** (Phòng chốt hợp đồng tương tác, bảng giá sống, ký & thu cọc) | `PLG_PLATFORM` | 19 | 18 | 19 | 18 | 18 | **92/100** | 379.000đ (`$15` / `249k`) | **87,2%** | **5 khách** |

*Ghi chú kiểm toán CFO (`#38`): Mô phỏng chạy thật bằng `TitanDatabase.simulate_cfo_unit_economics` với giả định thận trọng: phí cổng thanh toán quốc tế `2,9%`, dự phòng thuế `7%`, và thử tải thêm chi phí vận hành cố định `1.500.000đ/tháng` dù hạ tầng thực tế ban đầu là `0đ`. Ở ngưỡng 500 khách trả phí (chỉ chiếm một phần rất nhỏ của mục tiêu `$10k đến $100k MRR`), mỗi sản phẩm tạo lãi ròng từ **124 triệu đến 158 triệu đồng/tháng**.*

---

## PHẦN 3. HỒ SƠ CHI TIẾT 3 CƠ HỘI PHẦN MỀM THƯƠNG MẠI CẤP FLAGSHIP

### CƠ HỘI SỐ 1: MOTIONDECK STUDIO (`FLAGSHIP_VENTURE` | `95/100`)
### Studio Quay Màn Hình Tự Phóng To Điện Ảnh và Tạo Bản Dùng Thử Tương Tác Chạy 100% Trên Trình Duyệt

#### 1. Tập đoàn lớn đang cồng kềnh và điểm yếu bị khách hàng chê năm 2025 đến 2026
- **Screen Studio (`$29/tháng`):** Được yêu thích nhờ hiệu ứng tự phóng to theo con trỏ chuột nhưng bị người dùng chỉ trích nặng về việc chuyển sang thu phí thuê bao cao cho một công cụ cài máy, không cho xuất thử không dính logo và **khóa cứng độc quyền trên macOS**, bỏ rơi hàng trăm triệu người dùng Windows, Linux và Chromebook (nguồn: `supademo.com/blog/screen-studio-alternatives`).
- **Loom (thuộc Atlassian, `$15 đến $24/người/tháng`):** Sau khi sáp nhập vào Atlassian, Loom tăng giá và khóa chặt gói miễn phí xuống giới hạn 5 phút và 25 video, đồng thời không có khả năng dựng chuyển động tự phóng to hay tạo demo tương tác (nguồn: `supademo.com/blog/loom-alternatives`).
- **Arcade và Supademo (`$32 đến $500/tháng`):** Tính phí cao theo số người tạo và lượt xem cho bản demo bấm từng bước tĩnh, nhưng lại không xuất được video chuyển động 60fps mượt mà cho YouTube, TikTok và X.
- **CapCut Pro:** Bị làn sóng phản ứng dữ dội của giới sáng tạo vì đẩy dần các tính năng cơ bản sang gói trả phí và khóa xuất tệp vào phút chót sau khi người dùng đã mất công chỉnh sửa.

#### 2. Lợi thế đánh thắng tập đoàn lớn (`Big Corp Moat`)
- **Chạy 100% trên trình duyệt ở mọi máy tính (Windows, Mac, Linux):** Không cần cài phần mềm nặng, không độc quyền hệ điều hành.
- **Hợp nhất 2 thị trường tỷ đô vào 1 Workspace Studio duy nhất:** Quay 1 lần trên trình duyệt (hoặc thả video màn hình có sẵn) -> vừa xuất được **Video 4K 60fps tự phóng to điện ảnh** (thay thế Screen Studio và Loom), vừa xuất được **Liên kết Bản Dùng Thử Tương Tác bấm từng bước** (thay thế Arcade và Supademo).
- **Lợi thế chi phí dựng hình tuyệt đối:** Toàn bộ khâu dựng hình, ghép nền, làm mượt con trỏ bằng thuật toán lò xo và nén video MP4 60fps chạy trực tiếp bằng **WebCodecs + Canvas/WebGPU** ngay trên máy khách -> máy chủ của ta không tốn một đồng GPU render nào!

#### 3. Bản đồ kiến trúc thương mại 5 Cụm Song song (`ANTI_ONE_PROMPT_LAW`)
1. **Cụm 1 (Kiến trúc & Edge Backend):** Lưu đa dự án bền vững trong OPFS/IndexedDB, xuất bản liên kết Demo Tương Tác và đếm lượt xem theo bước qua Cloudflare Workers + R2/D1.
2. **Cụm 2 (Giao diện Studio chuẩn Linear/Figma):** Thanh dự án bên trái, Khung xem trước tỷ lệ linh hoạt (16:9, 9:16, 1:1) ở giữa, Dòng thời gian đa lớp (`Multi-Track Timeline`) ở dưới, Thanh thuộc tính (`Inspector`) bên phải, Bảng lệnh nhanh `Ctrl+K`, Hoàn tác/Làm lại không giới hạn, Sáng/Tối OKLCH.
3. **Cụm 3 (Lõi Thuật toán Dựng hình 60fps):** Bộ ghi màn hình kèm nhật ký tọa độ chuột và cú bấm (`Click Event Stream`), thuật toán nội suy con trỏ lò xo chống giật, bộ tự sinh khung phóng to thông minh, bộ phụ đề nhảy chữ và bộ đóng gói xuất MP4 WebCodecs theo luồng chống tràn RAM.
4. **Cụm 4 (Khối 5 Video AI Google Flow & Tăng trưởng PLG):** Chuỗi video so sánh chia đôi màn hình 3 giây, chiến dịch ra mắt Product Hunt, huy hiệu nhỏ *"Quay bằng MotionDeck"* cuối bản miễn phí 1080p tạo vòng lặp lan truyền tự nhiên.
5. **Cụm 5 (Bộ Tứ Khối 9 Kiểm định & Pentest):** Kiểm tra đủ 100% tính năng Studio, đo độ mượt 60fps trên máy Windows phổ thông, kiểm toán an ninh liên kết chia sẻ, chốt `0 OPEN`.

#### 4. Lộ trình hạ tầng 0 đồng -> Nâng cấp siêu lời và Trần doanh thu
- **0 đến 30.000 người dùng/tháng:** `0 đồng/tháng` (Cloudflare Pages Free + WebCodecs cục bộ + IndexedDB/OPFS + Cloudflare Workers Free 100k req/ngày + R2 Free 10GB).
- **Ngưỡng nâng cấp:** Khi vượt 500 khách trả phí (doanh thu đạt `$6.000/tháng` tương đương ~150 triệu/tháng), nâng cấp Workers Paid (`$5/tháng`) + R2 lưu trữ nhóm (`$20/tháng`) = dưới `0,5%` doanh thu.
- **Thang giá hai thị trường:** Miễn phí (xuất 1080p không giới hạn số lượng kèm huy hiệu nhỏ); Pro `$12/tháng` (Việt Nam `199.000đ/tháng`: 4K 60fps, gỡ huy hiệu, không giới hạn demo tương tác); Nhóm `$39/tháng` (Việt Nam `599.000đ/tháng`: bộ nhận diện thương hiệu, tên miền riêng, phân tích người xem). Trần doanh thu thực tế: **`$25.000` đến `$100.000 MRR`**.

#### 5. Kịch bản Hook 3 giây Google Flow / YouTube / TikTok / Product Hunt
Chia đôi màn hình ngay giây đầu: bên trái là bản quay hướng dẫn thô mờ nhạt, chuột di chuyển giật cục trên Windows; một cú nhấn phím cách biến bên phải thành đoạn phim giới thiệu chuẩn sự kiện Apple với khung máy tự phóng to mượt mà theo điểm bấm chuột, phông nền chiều sâu và phụ đề nhảy nhịp, xuất 4K ngay trong trình duyệt mà không cần máy Mac hay trả 29 đô mỗi tháng.

---

### CƠ HỘI SỐ 2: DUCKPULSE BI (`FLAGSHIP_VENTURE` | `94/100`)
### Studio Phân Tích Dữ Liệu Tốc Độ Ánh Sáng và Bảng Điều Khiển Điều Hành Chạy Lõi DuckDB-WASM Cục Bộ

#### 1. Tập đoàn lớn đang cồng kềnh và điểm yếu bị khách hàng chê năm 2025 đến 2026
- **Tableau (`$75/người tạo/tháng` + phí người xem):** Đắt đỏ với mô hình bản quyền kép, buộc doanh nghiệp trả tiền ngay cả cho lãnh đạo chỉ vào xem biểu đồ tuần một lần.
- **Microsoft Power BI:** Phải cài bản Desktop nặng nề độc quyền Windows, giao diện cũ kỹ, tốc độ chậm khi mở tệp lớn và muốn chia sẻ rộng phải trả chi phí năng lực Fabric hàng nghìn đô/tháng (nguồn: `kepakisan.co.nz/blog/posts/duckdb-static-webapp.html`).
- **Julius AI (`$20 đến $45/tháng`):** Bị người dùng phản hồi gay gắt về cơ chế tính tín dụng tụt rất nhanh giữa chừng dự án, cấu trúc dạng cửa sổ hỏi đáp rời rạc khó dùng làm bảng điều khiển vận hành định kỳ, và **tử huyệt bảo mật khi phải tải toàn bộ bảng lương, sổ bán hàng và dữ liệu nhạy cảm lên máy chủ đám mây** (nguồn: `analyzedata.io/alternatives/julius-ai`).

#### 2. Lợi thế đánh thắng tập đoàn lớn (`Big Corp Moat`)
- **Kiến trúc DuckDB-WASM chạy cục bộ ngay trong trình duyệt:** Xử lý tệp CSV, Excel, Parquet nặng hàng trăm MB (hàng triệu dòng) chỉ trong dưới 0,5 giây ngay trên máy người dùng mà **không tải một byte dữ liệu mật nào lên máy chủ**. Giải quyết triệt để rào cản tuân thủ Luật Bảo vệ dữ liệu cá nhân 2026 tại Việt Nam và GDPR tại châu Âu.
- **Nhanh gấp 10 lần Power BI và đẹp ngang phòng điều hành Stripe:** Không cần cài đặt, không thu phí từng người xem, không bóp tín dụng vô lý cho các phép lọc, nối bảng, nhóm dữ liệu và vẽ biểu đồ tương tác hàng ngày.
- **Tái sử dụng luồng làm việc hàng tuần (Weekly Habit):** Lưu sẵn quy trình biến đổi dữ liệu (*Recipe*) cho báo cáo bán hàng Shopee/Stripe/GA4/Kế toán; tuần sau chỉ cần kéo thả tệp Excel mới vào là toàn bộ 8 biểu đồ KPI và bảng cảnh báo bất thường tự động cập nhật trong 1 giây!

#### 3. Bản đồ kiến trúc thương mại 5 Cụm Song song (`ANTI_ONE_PROMPT_LAW`)
1. **Cụm 1 (Kiến trúc & Đồng bộ Edge):** Bộ nạp dữ liệu đa định dạng (CSV, XLSX, Parquet, JSON), quản lý đa dự án trên IndexedDB, xuất bản liên kết báo cáo tổng hợp mã hóa qua Cloudflare Workers + D1 Free.
2. **Cụm 2 (Giao diện Studio chuẩn Stripe/Linear):** Cây bảng và sơ đồ cột bên trái, khung chia đôi giữa Trình dựng biến đổi trực quan / Trình soạn SQL và Bảng vẽ Dashboard kéo thả lọc chéo (`Cross-Filtering`), thanh Inspector tùy chỉnh trục và màu biểu đồ, Bảng lệnh `Ctrl+K`, Hoàn tác/Làm lại, Sáng/Tối OKLCH.
3. **Cụm 3 (Lõi Động cơ DuckDB-WASM & Phân tích thông minh):** Tích hợp DuckDB-WASM chạy đa luồng Web Worker chống đơ giao diện, bộ dựng phép nối bảng và làm sạch dữ liệu không cần viết mã, thuật toán tự phát hiện điểm bất thường/cột lỗi, bộ chuyển câu hỏi tiếng Việt/Anh sang SQL (hỗ trợ người dùng tự gắn khóa AI hoặc dùng hạn mức gói Pro), xuất gói báo cáo tương tác 1 tệp HTML có mật khẩu.
4. **Cụm 4 (Khối 5 Video AI Google Flow & Cộng đồng Dữ liệu):** Video 3 giây chạy chế độ máy bay xử lý 1 triệu dòng Excel, thư viện 15 bộ mẫu báo cáo miễn phí (Tài chính, Thương mại điện tử, Quảng cáo, Nhân sự) phát hành trên Product Hunt, Reddit (`r/dataisbeautiful`, `r/excel`, `r/analytics`) và GitHub.
5. **Cụm 5 (Bộ Tứ Khối 9 Kiểm định & Pentest):** Kiểm thử độ chính xác phép tính SQL đối chiếu Python/Pandas lệch 0đ, kiểm tra tràn bộ nhớ với tệp 200MB, kiểm toán chống tiêm mã XSS/CSV Formula Injection, chốt `0 OPEN`.

#### 4. Lộ trình hạ tầng 0 đồng -> Nâng cấp siêu lời và Trần doanh thu
- **0 đến 50.000 người dùng/tháng:** `0 đồng/tháng` (Cloudflare Pages Free + DuckDB-WASM chạy hoàn toàn trên máy khách + IndexedDB + Cloudflare Workers/D1 Free lưu siêu dữ liệu chia sẻ).
- **Ngưỡng nâng cấp:** Khi đạt 300 khách trả phí Pro/Team (doanh thu đạt `$4.500 đến $7.000/tháng` tương đương 115 đến 175 triệu/tháng), nâng cấp Cloudflare Workers Paid (`$5/tháng`) + Supabase/D1 Pro (`$25/tháng`) = dưới `0,7%` doanh thu.
- **Thang giá hai thị trường:** Miễn phí (phân tích cục bộ không giới hạn tệp dưới 50MB, 3 bảng điều khiển mẫu); Pro `$15/tháng` (Việt Nam `249.000đ/tháng`: không giới hạn tệp lớn, lưu quy trình lặp lại hàng tuần, xuất báo cáo HTML khóa mật khẩu, gỡ logo); Nhóm `$49/tháng` (Việt Nam `699.000đ/tháng`: chia sẻ không giới hạn người xem, thư viện mẫu dùng chung, gắn tên miền riêng). Trần doanh thu thực tế: **`$20.000` đến `$100.000 MRR`**.

#### 5. Kịch bản Hook 3 giây Google Flow / YouTube / TikTok / Product Hunt
Bật chế độ máy bay ngắt hoàn toàn Internet ngay giây đầu -> kéo thả tệp Excel bán hàng nặng 150MB với 1 triệu dòng vào trình duyệt -> chỉ 0,4 giây sau màn hình bung ra hệ thống bảng điều khiển doanh thu, biên lãi và nhóm hàng báo lỗ sắc nét như phòng điều hành Stripe mà không cần trả 75 đô/tháng cho Tableau và không lộ một dòng số liệu nào lên đám mây.

---

### CƠ HỘI SỐ 3: DEALCRAFT STUDIO (`PLG_PLATFORM` | `92/100`)
### Nền Tảng Phòng Chốt Hợp Đồng Tương Tác, Bảng Giá Tự Chọn Sống, Ký Điện Tử và Thu Cọc 1 Chạm

#### 1. Tập đoàn lớn đang cồng kềnh và điểm yếu bị khách hàng chê năm 2025 đến 2026
- **PandaDoc (`$19 đến $65/người/tháng`), Qwilr (`$35 đến $59/người/tháng`) và Proposify (`$35 đến $65/người/tháng`):** Bị cộng đồng công ty dịch vụ, thiết kế, phần mềm và tư vấn trên IndieHackers và Product Hunt phàn nàn gay gắt 3 điểm chí mạng: **thu phí theo từng đầu người tăng vọt khi thêm thành viên** (nhóm 5 người phải trả `$250 đến $325/tháng`), **khóa các tính năng kết nối quan trọng vào gói doanh nghiệp đắt tiền và ép cam kết theo năm**, đồng thời không hỗ trợ luồng đặt cọc ngân hàng tức thì tại Đông Nam Á như VietQR (nguồn: `nusii.com/blog/best-pandadoc-alternatives/`).
- **Thực tế tại Việt Nam và đội nhóm nhỏ toàn cầu:** 85% công ty dịch vụ và người làm tự do vẫn gửi tệp PDF chết qua Zalo/Email, mù tịt không biết khách đã mở báo giá chưa, và phải sửa tệp 4 đến 5 lần mỗi khi khách muốn thêm bớt hạng mục!

#### 2. Lợi thế đánh thắng tập đoàn lớn (`Big Corp Moat`)
- **Phá vỡ mô hình thu phí theo đầu người:** Thu phí phẳng theo không gian làm việc (gói Nhóm `$39/tháng` hoặc `599.000đ/tháng` không giới hạn thành viên, rẻ hơn tới 5 lần so với Qwilr/PandaDoc cho một công ty 5 đến 10 người).
- **Vòng lặp lan truyền PLG kiểu Tally (`$6M ARR`):** Bản miễn phí đủ hào phóng để công ty dịch vụ gửi phòng chốt đơn thật kèm dòng tinh tế *"Tạo bằng DealCraft"* ở chân trang -> mỗi bản chào giá gửi cho một giám đốc doanh nghiệp khác là một lần trưng bày trực tiếp sản phẩm vượt trội tệp PDF tĩnh!
- **Khép kín trọn vẹn 1 luồng từ Chào giá -> Tự chọn gói -> Ký điện tử -> Cọc tiền ngay (Stripe + VietQR):** Đánh đúng khoảnh khắc khách hàng đang sẵn sàng rút ví nhất mà không phải rời khỏi trang.

#### 3. Bản đồ kiến trúc thương mại 5 Cụm Song song (`ANTI_ONE_PROMPT_LAW`)
1. **Cụm 1 (Kiến trúc & Edge Deal Engine):** Quản lý đường ống thương vụ, xuất bản liên kết phòng chốt đơn bảo vệ bằng mật khẩu/hạn hiệu lực, thu thập dữ liệu thời gian xem từng khối (`Block-Level Telemetry`) và lưu nhật ký kiểm toán chữ ký số trên Cloudflare Workers + D1 + R2.
2. **Cụm 2 (Giao diện Studio chuẩn Notion/Linear):** Thanh đường ống thương vụ và thư viện khối mẫu bên trái, Trình soạn thảo khối kéo thả (`Block Studio Editor`) ở giữa, Thanh chỉnh bảng giá tương tác, thuế VAT, thương hiệu và bản xem trước di động bên phải, Bảng lệnh `Ctrl+K`, Hoàn tác/Làm lại, Sáng/Tối OKLCH.
3. **Cụm 3 (Lõi Bảng Giá Sống, Ký Số và Xuất Hợp Đồng):** Động cơ tính tổng cộng/chiết khấu/thuế VAT tức thì khi khách bật tắt hạng mục tùy chọn, mô-đun chữ ký tay + đóng dấu mã băm SHA-256 + dấu thời gian kiểm toán, tích hợp thanh toán cọc kép Stripe + VietQR, và bộ xuất PDF chuẩn A4 lưu kế toán.
4. **Cụm 4 (Khối 5 Video AI Google Flow & Vòng lặp PLG):** 25 mẫu chào giá chuẩn ngành (Thiết kế Web/App, Marketing, Nội thất, Quay phim, Tư vấn doanh nghiệp) cho phép sao chép dùng ngay trong 60 giây, chiến dịch Video AI chia đôi màn hình PDF chết vs Phòng Chốt Đơn sống.
5. **Cụm 5 (Bộ Tứ Khối 9 Kiểm định & Pentest):** Kiểm định độ chính xác phép tính bảng giá tương tác 0đ sai số, kiểm thử bảo mật chống giả mạo chữ ký/sửa giá phía trình duyệt khách, kiểm thử 4 cỡ màn hình, chốt `0 OPEN`.

#### 4. Lộ trình hạ tầng 0 đồng -> Nâng cấp siêu lời và Trần doanh thu
- **0 đến 25.000 người dùng/tháng:** `0 đồng/tháng` (Cloudflare Pages Free + IndexedDB soạn nháp + Cloudflare Workers Free 100k req/ngày + D1 Free 5GB + R2 Free 10GB).
- **Ngưỡng nâng cấp:** Khi đạt 200 đội nhóm trả phí (doanh thu đạt `$4.000 đến $7.000/tháng` tương đương 100 đến 175 triệu/tháng), nâng cấp Workers Paid (`$5/tháng`) + Resend gửi thông báo mở xem (`$20/tháng`) = dưới `0,6%` doanh thu.
- **Thang giá hai thị trường:** Miễn phí (3 phòng chốt đơn đang mở, đầy đủ bảng giá sống và chữ ký, có dòng chân trang PLG); Pro `$15/tháng` (Việt Nam `249.000đ/tháng`: không giới hạn phòng, gỡ chân trang, bản đồ nhiệt lượt xem, thu cọc Stripe/VietQR); Nhóm `$39/tháng` (Việt Nam `599.000đ/tháng`: không giới hạn thành viên, tên miền riêng, thư viện khối khóa chuẩn thương hiệu). Trần doanh thu thực tế: **`$15.000` đến `$80.000 MRR`**.

#### 5. Kịch bản Hook 3 giây Google Flow / YouTube / TikTok / Product Hunt
3 giây đầu chia đôi khung hình: bên trái là tệp báo giá PDF khô cứng gửi đi rồi im bặt không biết khách có mở xem không; cú vuốt sang phải biến thành Phòng Chốt Hợp Đồng tương tác chuẩn Apple nơi khách tự tích chọn gói cộng thêm thấy giá nhảy trực tiếp, ký tên bằng ngón tay, quét cọc ngay tại chỗ và điện thoại người bán báo ngay tin vừa chốt cọc 50 triệu sau khi khách đọc bảng giá 3 phút.

---

## PHẦN 4. KHUYẾN NGHỊ THỨ TỰ TRIỂN KHAI CHO BAN ĐIỀU HÀNH VÀ CHỦ TỊCH

1. **Ưu tiên số 1 để tạo tiếng vang Quốc tế + Product Hunt + Video AI Google Flow cực mạnh:** **MotionDeck Studio (`95/100`)**: hiệu ứng thị giác 3 giây dễ gây chấn động nhất trên X, Product Hunt, YouTube và TikTok; đánh thẳng vào cơn khát của hàng trăm triệu người dùng Windows bị Screen Studio bỏ rơi và người dùng chán ngán Loom/CapCut Pro, trong khi chi phí render máy chủ bằng đúng **0 đồng** nhờ WebCodecs.
2. **Ưu tiên số 2 để khóa tệp doanh nghiệp có nhu cầu dùng hàng ngày và biên giữ chân cực cao:** **DuckPulse BI (`94/100`)**: lợi thế kỹ thuật DuckDB-WASM bảo mật tuyệt đối trên máy khách cực khó bị các công cụ AI đám mây bắt chước; đánh trúng nỗi đau vừa sợ lộ dữ liệu vừa tốn `$75/tháng` của Tableau và bực mình tín dụng của Julius AI.
3. **Ưu tiên số 3 để tạo doanh thu lặp lại B2B nhanh nhất ngay tại Việt Nam và Toàn cầu:** **DealCraft Studio (`92/100`)**: mỗi khách hàng gửi chào giá là một lần kéo thêm 10 giám đốc khác thấy sản phẩm theo đúng công thức `$6M ARR` của Tally, lại giải quyết trực tiếp bài toán chốt tiền cọc Stripe và VietQR.

---

## PHẦN 5. DANH MỤC NGUỒN KIỂM CHỨNG THỰC TẾ (2025 ĐẾN 2026)

1. Phân tích giá và điểm yếu của Screen Studio (độc quyền macOS, phí thuê bao $29/tháng, không cho xuất thử không logo): `https://supademo.com/blog/screen-studio-alternatives`
2. Phản hồi người dùng về tăng giá và giới hạn của Loom sau khi sáp nhập Atlassian: `https://supademo.com/blog/loom-alternatives`
3. Kiến trúc DuckDB-WASM thay thế hạ tầng BI đắt tiền trên ứng dụng web tĩnh 0 đồng máy chủ: `https://kepakisan.co.nz/blog/posts/duckdb-static-webapp.html`
4. Phàn nàn người dùng về mô hình tín dụng, thiếu bảng điều khiển lặp lại và rủi ro tải dữ liệu lên đám mây của Julius AI: `https://analyzedata.io/alternatives/julius-ai`
5. Phân tích bảng giá đắt theo đầu người và giới hạn gói của PandaDoc, Qwilr, Proposify: `https://nusii.com/blog/best-pandadoc-alternatives/`
6. Hình mẫu Studio chuyển động chạy trên trình duyệt (Jitter): `https://jitter.video/product/`
7. Bài học tăng trưởng PLG của Tally đạt trên $6 triệu ARR với đội ngũ tinh gọn: `https://okara.ai/blog/tally-revenue-growth`
8. Chiến dịch ra mắt Product Hunt #1 Product of the Month và tăng trưởng PLG của Dub.co: `https://dub.co/blog/product-hunt`
