# DANH BẠ NHẬN THỨC CHUNG 54 PHÒNG BAN TITAN AI CORP (v10.1)

Tài liệu tra cứu chung bắt buộc cho toàn bộ **10 Khối (Ban Điều hành + Khối 1 đến Khối 9)** và **54 Phòng ban (`#00` đến `#53`)** để mọi phòng đều nắm rõ chuyên môn lõi của đồng đội, tuyến bàn giao đầu vào/đầu ra và quyền tự chuyển việc ngang (`PEER_HANDOFF`) hoặc đẩy lên Tổng Giám đốc `#00` (`CEO_ESCALATION`).

- **Nguồn dữ liệu cấu trúc JSON:** `corporate_hq/intel_sources/corporate_directory_54.json`
- **Quy trình phối hợp chuẩn 9 Khối:** `corporate_hq/CORPORATE_SOP_9_DIVISIONS.md`
- **Cập nhật lần cuối:** `2026-11-19T13:06:44Z`

---

## Ban Tổng Giám đốc Điều hành (`exec-board`)
- **Lãnh đạo Khối:** Tổng Giám đốc | **Cẩm nang Khối:** `.agents/skills/titan-ceo-orchestrator/SKILL.md`

| Mã | Tên Phòng ban | Chuyên môn lõi giỏi nhất | Nhận đầu vào từ | Bàn giao / Phối hợp ngang | Loại sản phẩm kích hoạt |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `#00` | **Tổng Giám đốc và Chánh Văn phòng** (`ceo`) | Nắm trọn Danh bạ 54 phòng ban, điều phối chuẩn đủ 9 Khối theo đúng loại sản phẩm, phân xử khi có đẩy việc vượt thẩm quyền và trình Chủ tịch nghiệm thu tại Cổng 1 và Cổng 2. | #01, #05, #38, #46, #51, #52, #53 | #01, #06, #11, #12, #20, #25, #32, #38, #42, #53 | `ALL` |

## Khối 1: Chiến lược, Tình báo Thị trường và Nghiên cứu Công nghệ (`div1-strategy-intel`)
- **Lãnh đạo Khối:** Giám đốc Chiến lược | **Cẩm nang Khối:** `.agents/skills/div1-strategy-intel/SKILL.md`

| Mã | Tên Phòng ban | Chuyên môn lõi giỏi nhất | Nhận đầu vào từ | Bàn giao / Phối hợp ngang | Loại sản phẩm kích hoạt |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `#01` | **Tình báo Thị trường Toàn cầu** (`market-intel`) | Quét dữ liệu thị trường thật, xác định nhu cầu cấp bách, biến động chính sách và quy mô người sẵn sàng trả tiền tại Việt Nam và quốc tế. | #00, #50 | #02, #03, #05, #06, #38 | `ALL` |
| `#02` | **Nghiên cứu Tâm lý và Hành vi Khách hàng** (`consumer-psychology`) | Phân tích nỗi đau thật, ngôn ngữ đời thường, rào cản tâm lý và động lực kích hoạt hành vi dùng thử hoặc trả tiền của từng nhóm người dùng. | #01, #50 | #05, #06, #07, #26, #31, #32 | `ALL` |
| `#03` | **Phân tích Đối thủ Cạnh tranh** (`competitor-intel`) | Giải phẫu sản phẩm đối thủ thật, thu thập phàn nàn 1 đến 2 sao của người dùng và tìm góc đánh ngách tránh đụng trực diện tập đoàn lớn. | #01, #50 | #05, #06, #30, #33, #46 | `ALL` |
| `#04` | **Nghiên cứu Công nghệ mới và Trí tuệ nhân tạo** (`ai-tech-rnd`) | Đánh giá tính khả thi kỹ thuật, chi phí API mô hình AI, công nghệ xử lý cục bộ trên trình duyệt và xu hướng công nghệ mới để tối ưu giá vốn. | #00, #01, #05 | #06, #12, #16, #18, #38 | `B2B_SAAS, EMBEDDED_IOT, MOBILE_APP, WEB_APP` |
| `#05` | **Kiến trúc Mô hình Kinh doanh** (`biz-model-architect`) | Thiết kế mô hình kiếm tiền thực tế (thuê bao, trả lẻ VietQR, freemium, quảng cáo, tiếp thị liên kết) gắn chặt với biên lợi nhuận và khả năng lan truyền. | #01, #02, #03, #04 | #06, #34, #38, #46, #50 | `ALL` |

## Khối 2: Quản trị Sản phẩm và Thiết kế Thương hiệu (`div2-product-design`)
- **Lãnh đạo Khối:** Giám đốc Sản phẩm | **Cẩm nang Khối:** `.agents/skills/div2-product-design/SKILL.md`

| Mã | Tên Phòng ban | Chuyên môn lõi giỏi nhất | Nhận đầu vào từ | Bàn giao / Phối hợp ngang | Loại sản phẩm kích hoạt |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `#06` | **Quản trị Sản phẩm** (`product-manager`) | Chốt đặc tả tính năng cốt lõi, ưu tiên phạm vi ra mắt nhanh gọn nhưng trọn vẹn giá trị và bảo đảm sản phẩm giải quyết đúng yêu cầu đề bài. | #00, #01, #02, #03, #05 | #07, #08, #11, #12, #52 | `ALL` |
| `#07` | **Nghiên cứu Trải nghiệm Người dùng** (`ux-researcher`) | Thiết kế hành trình người dùng tối đa 3 chạm, trực quan ngay trong 5 giây đầu tiên trên cả điện thoại lẫn máy tính cho mọi đối tượng phổ thông. | #02, #06 | #08, #09, #13, #14, #48, #49 | `ALL` |
| `#08` | **Thiết kế Giao diện Cao cấp** (`ui-design-system`) | Xây dựng hệ thống biến thiết kế OKLCH Sáng/Tối đạt chuẩn tương phản WCAG AA, bố cục rõ nét, không biểu tượng thừa và dễ thao tác. | #06, #07, #10 | #09, #13, #14, #20, #49 | `WEB_APP, MOBILE_APP, B2B_SAAS, EMBEDDED_IOT` |
| `#09` | **Thiết kế Chuyển động và Tương tác** (`motion-designer`) | Thiết kế hiệu ứng chuyển trạng thái mượt mà, trạng thái chờ phản hồi rõ ràng và vi tương tác giúp cảm giác dùng sản phẩm nhẹ nhàng, tinh tế. | #07, #08 | #13, #14, #21, #49 | `WEB_APP, MOBILE_APP, B2B_SAAS, MEDIA_CHANNEL` |
| `#10` | **Xây dựng Thương hiệu** (`brand-director`) | Định vị tên gọi dễ nhớ, khẩu hiệu sắc bén, bộ nhận diện màu sắc, kiểu chữ và giọng văn nhất quán trên sản phẩm lẫn trang bán hàng. | #02, #05, #06 | #08, #25, #27, #29, #31 | `ALL` |
| `#11` | **Điều phối Tiến độ Dự án** (`pmo-scrum`) | Phân chia ranh giới tệp tin không xung đột, lập lịch bàn giao giữa các phòng kỹ thuật và theo dõi mốc tiến độ xuyên suốt 8 bước. | #00, #06, #12 | #12, #13, #14, #15, #19, #43 | `B2B_SAAS, MOBILE_APP, EMBEDDED_IOT, WEB_APP` |

## Khối 3: Kỹ thuật Phần mềm, Trí tuệ nhân tạo và Phần cứng (`div3-engineering-ai`)
- **Lãnh đạo Khối:** Giám đốc Công nghệ | **Cẩm nang Khối:** `.agents/skills/div3-engineering-ai/SKILL.md`

| Mã | Tên Phòng ban | Chuyên môn lõi giỏi nhất | Nhận đầu vào từ | Bàn giao / Phối hợp ngang | Loại sản phẩm kích hoạt |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `#12` | **Kiến trúc Hệ thống Trưởng** (`system-architect`) | Thiết kế kiến trúc mô-đun sâu, hợp đồng API, kiến trúc 0 đồng hạ tầng hoặc cô lập dữ liệu đa khách hàng, bảo đảm hệ thống ổn định và dễ mở rộng. | #04, #06, #11 | #13, #14, #15, #16, #17, #18, #19 | `WEB_APP, MOBILE_APP, B2B_SAAS, EMBEDDED_IOT` |
| `#13` | **Kỹ thuật Giao diện Trực tuyến** (`frontend-web`) | Lập trình ứng dụng Web và PWA chạy mượt trên trình duyệt di động lẫn máy tính, xử lý dữ liệu trực tiếp trên máy người dùng và chuẩn SEO kỹ thuật. | #07, #08, #09, #12 | #15, #19, #20, #21, #49, #52 | `WEB_APP, B2B_SAAS, MEDIA_CHANNEL` |
| `#14` | **Phát triển Ứng dụng Di động** (`mobile-app`) | Phát triển ứng dụng Android và iOS gốc hoặc đa nền tảng tích hợp camera, ghi âm, Bluetooth, thông báo đẩy và lưu trữ ngoại tuyến. | #07, #08, #09, #12 | #15, #18, #20, #21, #48 | `MOBILE_APP, EMBEDDED_IOT` |
| `#15` | **Kỹ thuật Máy chủ và Cổng Thanh toán** (`backend-payment`) | Xây dựng API máy chủ, xử lý nghiệp vụ bảo mật và tích hợp thanh toán tự động VietQR, SePay, payOS hoặc cổng quốc tế. | #12, #17, #38 | #13, #14, #19, #20, #23, #37 | `WEB_APP, MOBILE_APP, B2B_SAAS, EMBEDDED_IOT` |
| `#16` | **Kỹ sư Trí tuệ nhân tạo và Tự động hóa** (`ai-ml-engineer`) | Xây dựng luồng xử lý AI, mô hình ngôn ngữ lớn, nhận diện ảnh/âm thanh, tìm kiếm tri thức chính xác và tối ưu chi phí vận hành AI. | #04, #12, #17 | #15, #20, #22, #27, #43 | `B2B_SAAS, MOBILE_APP, EMBEDDED_IOT, MEDIA_CHANNEL` |
| `#17` | **Quản trị Cơ sở Dữ liệu** (`database-engineer`) | Thiết kế lược đồ dữ liệu chuẩn hóa, đánh chỉ mục tìm kiếm nhanh, viết kịch bản nâng cấp an toàn không mất dữ liệu và cơ chế sao lưu khôi phục. | #12, #15 | #15, #16, #19, #21, #24, #42 | `B2B_SAAS, MOBILE_APP, EMBEDDED_IOT` |
| `#18` | **Kỹ thuật Nhúng và Thiết bị Thông minh** (`embedded-iot`) | Thiết kế mạch điện tử, lập trình vi điều khiển ESP32/C++, đọc cảm biến thời gian thực và truyền dữ liệu tin cậy với ứng dụng di động và máy chủ. | #04, #12 | #14, #15, #20, #21, #23 | `EMBEDDED_IOT` |
| `#19` | **Hạ tầng Đám mây và Vận hành Hệ thống** (`cloud-devops`) | Đóng gói triển khai lên Cloudflare Pages, Render hoặc máy chủ đám mây với chi phí tối ưu từ 0 đồng, cấu hình CI/CD, HTTPS và giám sát sự cố. | #12, #13, #15, #17 | #20, #21, #23, #43, #51 | `ALL` |

## Khối 4: Kiểm định Chất lượng và An ninh mạng (`div4-qa-cybersecurity`)
- **Lãnh đạo Khối:** Giám đốc Chất lượng và Bảo mật | **Cẩm nang Khối:** `.agents/skills/div4-qa-cybersecurity/SKILL.md`

| Mã | Tên Phòng ban | Chuyên môn lõi giỏi nhất | Nhận đầu vào từ | Bàn giao / Phối hợp ngang | Loại sản phẩm kích hoạt |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `#20` | **Kiểm thử Phần mềm và Tự động hóa** (`qa-functional-tester`) | Viết và chạy kiểm thử đơn vị, kiểm thử tích hợp và kiểm thử trình duyệt tự động để phát hiện sớm lỗi logic, lỗi giao diện và lỗi hồi quy. | #13, #14, #15, #16, #18, #19 | #13, #15, #21, #51, #52, #53 | `ALL` |
| `#21` | **Kiểm thử Chịu tải, Tốc độ và Ổn định** (`performance-tester`) | Đo tốc độ tải trang, giới hạn bộ nhớ trên điện thoại cấu hình thấp, độ trễ API và khả năng chịu tải khi hàng nghìn người truy cập đồng thời. | #13, #14, #15, #17, #19 | #13, #15, #19, #51, #53 | `WEB_APP, MOBILE_APP, B2B_SAAS, EMBEDDED_IOT` |
| `#22` | **Kiểm định Độ chuẩn xác và An toàn Trí tuệ nhân tạo** (`ai-redteam-auditor`) | Kiểm thử tấn công câu lệnh, phát hiện AI bịa đặt số liệu hoặc sai lệch đầu ra và khóa chặt giới hạn an toàn cho các tính năng dùng AI. | #16, #20 | #16, #23, #51, #53 | `B2B_SAAS, MOBILE_APP, EMBEDDED_IOT, MEDIA_CHANNEL` |
| `#23` | **An ninh Mạng và Chống Xâm nhập** (`cybersecurity-pentest`) | Rà soát lỗ hổng bảo mật web, gian lận thanh toán, lộ khóa bí mật, tấn công chèn mã độc và bảo vệ hạ tầng triển khai. | #15, #18, #19, #20 | #15, #19, #24, #51, #53 | `WEB_APP, MOBILE_APP, B2B_SAAS, EMBEDDED_IOT` |
| `#24` | **Bảo vệ Dữ liệu Cá nhân và Cô lập Khách hàng** (`data-privacy`) | Bảo đảm tuân thủ quy định bảo vệ dữ liệu cá nhân, kiểm tra cơ chế không tải dữ liệu nhạy cảm lên mạng hoặc cô lập tuyệt đối giữa các khách hàng. | #17, #23, #40 | #15, #17, #40, #51, #53 | `ALL` |

## Khối 5: Truyền thông Video, Kênh nội dung và Tăng trưởng (`div5-media-youtube-studio`)
- **Lãnh đạo Khối:** Giám đốc Truyền thông | **Cẩm nang Khối:** `.agents/skills/div5-media-youtube-studio/SKILL.md`

| Mã | Tên Phòng ban | Chuyên môn lõi giỏi nhất | Nhận đầu vào từ | Bàn giao / Phối hợp ngang | Loại sản phẩm kích hoạt |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `#25` | **Chiến lược Hệ thống Kênh Video và Nội dung Ngắn** (`channel-strategist`) | Quy hoạch hệ thống kênh YouTube, TikTok, Facebook và Zalo để kéo người dùng tự nhiên với chi phí quảng cáo 0 đồng và chuyển đổi sang sản phẩm. | #02, #10, #30 | #26, #27, #29, #30, #31 | `ALL` |
| `#26` | **Biên kịch Lan truyền và Câu Mở đầu 3 giây** (`viral-scriptwriter`) | Viết kịch bản video ngắn, câu mở đầu 3 giây giữ chân người xem và nội dung chia sẻ tự nhiên đánh đúng nỗi đau thực tế của người dùng. | #02, #25 | #27, #28, #29, #31 | `ALL` |
| `#27` | **Đạo diễn Hình ảnh và Kỹ xảo Video** (`ai-visual-director`) | Sản xuất hình ảnh minh họa, khung hình trước sau và tài nguyên thị giác sắc nét cho kênh video, bài đăng mạng xã hội và tài liệu giới thiệu. | #10, #26 | #28, #29, #31 | `MEDIA_CHANNEL, WEB_APP, MOBILE_APP` |
| `#28` | **Đạo diễn Âm thanh và Lồng tiếng** (`ai-audio-producer`) | Xử lý giọng đọc tự nhiên, nhịp điệu truyền cảm và hiệu ứng âm thanh chuẩn cho video dài, video ngắn và hướng dẫn sản phẩm. | #26, #27 | #25, #29 | `MEDIA_CHANNEL` |
| `#29` | **Thiết kế Ảnh bìa và Tối ưu Tỷ lệ Bấm** (`thumbnail-packaging`) | Thiết kế ảnh bìa, thẻ chia sẻ mạng xã hội và cặp tiêu đề hình ảnh đạt tỷ lệ bấm cao trên YouTube, TikTok, Facebook và Zalo. | #10, #26, #27 | #25, #30, #31 | `ALL` |
| `#30` | **Tối ưu Tìm kiếm Trực tuyến và Khám phá Nội dung** (`seo-geo-specialist`) | Đưa sản phẩm và bài viết lên đầu kết quả tìm kiếm Google, YouTube và các công cụ trả lời AI bằng từ khóa thực tế có nhu cầu cao quanh năm. | #01, #03, #25 | #13, #25, #26, #31, #42 | `ALL` |
| `#31` | **Quảng cáo và Tối ưu Phễu Chuyển đổi** (`growth-funnel-ads`) | Xây dựng trang đích chuyển đổi cao, vòng lặp lan truyền tự nhiên qua chia sẻ link và tối ưu từng điểm rơi từ lượt xem sang hành động trả phí. | #02, #25, #26, #29, #30 | #13, #32, #33, #42, #49 | `ALL` |

## Khối 6: Kinh doanh, Bán hàng và Chăm sóc Khách hàng (`div6-sales-commercial`)
- **Lãnh đạo Khối:** Giám đốc Kinh doanh | **Cẩm nang Khối:** `.agents/skills/div6-sales-commercial/SKILL.md`

| Mã | Tên Phòng ban | Chuyên môn lõi giỏi nhất | Nhận đầu vào từ | Bàn giao / Phối hợp ngang | Loại sản phẩm kích hoạt |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `#32` | **Tìm kiếm Khách hàng Tiềm năng** (`lead-gen-sdr`) | Xác định nhóm người dùng tiên phong, cộng đồng mục tiêu và kịch bản tiếp cận trực tiếp để có những khách hàng trả tiền đầu tiên nhanh nhất. | #02, #03, #31 | #33, #35, #42 | `ALL` |
| `#33` | **Chốt đơn Giá trị cao và Gói thuê bao** (`sales-closer`) | Xây dựng lời chào giá rõ ràng, kịch bản trình diễn nhanh, xử lý băn khoăn phổ biến và tối ưu chốt đơn VietQR hoặc gói năm. | #05, #31, #32, #38 | #35, #36, #37 | `ALL` |
| `#34` | **Kinh doanh Quốc tế và Tiếp thị Liên kết** (`global-affiliate-monetizer`) | Mở rộng bản tiếng Anh toàn cầu, xây dựng cơ chế giới thiệu bạn bè và tích hợp nguồn thu tiếp thị liên kết bền vững. | #05, #30, #31 | #31, #37, #38, #42 | `WEB_APP, B2B_SAAS, MEDIA_CHANNEL, MOBILE_APP` |
| `#35` | **Bàn giao và Hướng dẫn Khách hàng 180 giây** (`customer-onboarding`) | Giúp người mới vào sử dụng đạt kết quả đầu tiên trong chưa đầy 3 phút với dữ liệu mẫu sẵn và hướng dẫn ngắn gọn không cần đọc tài liệu dài. | #07, #33 | #36, #48, #49, #52 | `ALL` |
| `#36` | **Giữ chân Khách hàng và Bán thêm** (`customer-success`) | Theo dõi tần suất quay lại, giảm tỷ lệ rời bỏ, thu thập góp ý khách hàng thực tế chuyển về Trạm #53 và đề xuất gói nâng cấp phù hợp. | #33, #35, #42 | #06, #33, #42, #53 | `B2B_SAAS, MOBILE_APP, WEB_APP, EMBEDDED_IOT` |

## Khối 7: Tài chính, Kế toán, Thuế và Pháp chế (`div7-finance-tax-legal`)
- **Lãnh đạo Khối:** Giám đốc Tài chính và Pháp chế | **Cẩm nang Khối:** `.agents/skills/div7-finance-tax-legal/SKILL.md`

| Mã | Tên Phòng ban | Chuyên môn lõi giỏi nhất | Nhận đầu vào từ | Bàn giao / Phối hợp ngang | Loại sản phẩm kích hoạt |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `#37` | **Kế toán Tổng hợp và Đối soát Dòng tiền** (`chief-accountant`) | Quản lý sổ thu chi theo từng dự án, tách bạch tuyệt đối tiền thực thu với dự toán kế hoạch và đối soát chính xác từng khoản chi hạ tầng. | #15, #33, #34, #38 | #00, #39, #42 | `ALL` |
| `#38` | **Định giá và Phân tích Lợi nhuận** (`pricing-fpa`) | Mô phỏng bài toán kinh tế đơn vị, tính biên lãi gộp kịch bản xấu, điểm hòa vốn và ngưỡng doanh thu an toàn để quyết định thời điểm nâng cấp hạ tầng. | #01, #04, #05 | #00, #33, #37, #39, #46 | `ALL` |
| `#39` | **Chuyên gia Thuế và Hóa đơn Điện tử** (`tax-specialist`) | Tính đúng nghĩa vụ thuế GTGT, TNCN, hóa đơn điện tử theo quy định Việt Nam 2025 đến 2026 và khoanh quỹ dự phòng thuế riêng cho từng dự án. | #37, #38 | #00, #37, #40 | `ALL` |
| `#40` | **Pháp chế và Hợp đồng Thương mại** (`legal-counsel`) | Soạn điều khoản sử dụng, chính sách quyền riêng tư, miễn trừ trách nhiệm rõ ràng và kiểm tra rủi ro pháp lý trước khi công bố sản phẩm. | #06, #24, #39 | #24, #33, #41, #51 | `ALL` |
| `#41` | **Bản quyền và Chính sách Nền tảng** (`ip-policy-guardian`) | Kiểm tra tuân thủ chính sách Google AdSense, YouTube, TikTok, App Store và bản quyền hình ảnh, mã nguồn mở, phông chữ. | #25, #27, #28, #40 | #25, #29, #34, #51 | `MEDIA_CHANNEL, WEB_APP, MOBILE_APP` |

## Khối 8: Phân tích Dữ liệu, Vận hành Nội bộ và Nhân sự (`div8-data-ops-hr`)
- **Lãnh đạo Khối:** Giám đốc Vận hành và Nhân sự | **Cẩm nang Khối:** `.agents/skills/div8-data-ops-hr/SKILL.md`

| Mã | Tên Phòng ban | Chuyên môn lõi giỏi nhất | Nhận đầu vào từ | Bàn giao / Phối hợp ngang | Loại sản phẩm kích hoạt |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `#42` | **Phân tích Dữ liệu Kinh doanh** (`bi-data-analyst`) | Đo lường lưu lượng, tỷ lệ chuyển đổi, tỷ lệ quay lại, doanh thu thực và chỉ ra chính xác điểm nghẽn để các khối tối ưu liên tục. | #17, #30, #31, #36, #37 | #00, #05, #31, #38, #50 | `ALL` |
| `#43` | **Tự động hóa Quy trình Nội bộ** (`ops-automation`) | Kết nối tự động hóa giữa các khối, đồng bộ trạng thái bảng việc, lịch học tin tức và quy trình triển khai nhằm giảm thao tác thủ công. | #00, #11, #16, #19 | #19, #44, #53 | `ALL` |
| `#44` | **Lưu trữ Tri thức và Bộ nhớ Tập đoàn** (`knowledge-librarian`) | Quản lý kho tri thức, bài học kinh nghiệm, nhật ký quyết định của Chủ tịch và kho kỹ năng mã nguồn mở cho toàn bộ 54 phòng ban. | #00, #43, #53 | #00, #45, #47 | `ALL` |
| `#45` | **Tuyển dụng, Đào tạo và Kiểm định Nhân sự** (`ai-hr-trainer`) | Cập nhật cẩm nang chuyên môn, huấn luyện kỹ năng GitHub mới và tổ chức rút kinh nghiệm khi một phòng ban lặp lại lỗi nhiều lần. | #44, #47, #51, #53 | #00, #44 | `B2B_SAAS, WEB_APP, MOBILE_APP, EMBEDDED_IOT, MEDIA_CHANNEL` |

## Khối 9: Kiểm tra Cuối 0 Lỗi, Tổng hợp Lỗi, QA/QC, Chức năng và Phản biện (`div9-critique-ux-lab`)
- **Lãnh đạo Khối:** Giám đốc Phản biện và Trải nghiệm | **Cẩm nang Khối:** `.agents/skills/div9-critique-ux-lab/SKILL.md`

| Mã | Tên Phòng ban | Chuyên môn lõi giỏi nhất | Nhận đầu vào từ | Bàn giao / Phối hợp ngang | Loại sản phẩm kích hoạt |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `#46` | **Hội đồng Phản biện Mô hình Kiếm tiền** (`devils-advocate-biz`) | Phản biện độc lập mô hình kinh doanh, chỉ rõ rủi ro chết người trước khi làm sản phẩm và buộc phải có khóa phòng vệ thực tế. | #03, #05, #38 | #00, #05, #06, #53 | `ALL` |
| `#47` | **Thanh tra Phản biện Chéo Quy trình và Phòng ban** (`process-challenger`) | Kiểm tra chéo chất lượng bàn giao giữa 9 Khối, phát hiện lỗ hổng phối hợp và chuyển báo cáo sai sót về Trạm #53. | #06, #11, #44, #51 | #00, #45, #53 | `ALL` |
| `#48` | **Kiểm thử viên đóng vai 5 nhóm Khách hàng thật** (`persona-customer-tester`) | Hóa thân thành 5 mẫu người dùng đời thực (kể cả người không rành công nghệ dùng điện thoại 4G) để trải nghiệm thực tế và gửi lỗi về Trạm #53. | #07, #13, #14, #35 | #07, #49, #52, #53 | `ALL` |
| `#49` | **Thanh tra Tối giản Thao tác và Diệt Rối mắt** (`ux-friction-destroyer`) | Cắt sạch chữ thừa, loại bỏ rối mắt, bảo đảm thao tác chính tối đa 3 chạm và phối hợp bộ tứ chốt cuối #53, #51, #52 trước khi bàn giao. | #07, #08, #13, #35, #48 | #08, #13, #51, #52, #53 | `ALL` |
| `#50` | **Trinh sát Săn Cơ hội và Thiết kế Sản phẩm Sinh lời** (`opportunity-hunter`) | Chủ động săn tìm cơ hội sản phẩm thực tế, nhu cầu đại chúng lớn, chi phí hạ tầng 0 đồng và khả năng lan truyền tự nhiên mạnh. | #01, #03, #42 | #00, #01, #02, #05 | `ALL` |
| `#51` | **Kiểm định Chất lượng Tổng thể QA và QC** (`qa-qc-master`) | Bảo đảm chất lượng quy trình (QA) và kiểm định chất lượng thành phẩm (QC), xác minh bằng chứng kiểm thử và tái kiểm định mọi phiếu sửa lỗi. | #19, #20, #21, #23, #24, #53 | #00, #52, #53 | `ALL` |
| `#52` | **Kiểm tra Hoàn thiện Chức năng và Rà soát Lỗi** (`feature-completeness-auditor`) | Đối chiếu 100% yêu cầu đề bài với sản phẩm thực tế, xác minh đủ mọi chức năng, không lỗi nút bấm/liên kết chéo và phối hợp #51, #49, #53 chốt 0 lỗi. | #06, #13, #14, #15, #20, #53 | #00, #49, #51, #53 | `ALL` |
| `#53` | **Tổng hợp Lỗi, Thu thập Phản hồi và Điều phối Trả việc** (`defect-triage-dispatcher`) | Trạm trung chuyển tập trung gom mọi lỗi và góp ý từ 2 Tổ nội bộ của 9 Khối, #46..#52 và Chủ tịch; phân loại, đẩy trả chính xác về đúng phòng sửa và khóa chốt khi 0 OPEN. | #20, #36, #46, #47, #48, #49, #51, #52 | #00, #06, #08, #13, #15, #20, #31, #38, #51, #52 | `ALL` |

## Mẫu Phân Công Đủ 9 Khối Theo Loại Sản Phẩm

### `WEB_APP`: Ứng dụng Web và PWA Đại chúng (0 đồng hạ tầng)
- **Nguyên tắc phân công:** Huy động đủ 9/9 Khối và Ban Điều hành; tập trung Web/PWA, xử lý trực tiếp trên trình duyệt, SEO, lan truyền Zalo/TikTok và Bộ Tứ chốt cuối Khối 9; không huy động thừa Mobile gốc (#14) hay Nhúng IoT (#18).
- **Đội hình 10 Khối tham gia:** `exec-board` (#00); `div1-strategy-intel` (#01, #02, #03, #05); `div2-product-design` (#06, #07, #08, #10); `div3-engineering-ai` (#12, #13, #15, #19); `div4-qa-cybersecurity` (#20, #21, #23, #24); `div5-media-youtube-studio` (#25, #26, #29, #30, #31); `div6-sales-commercial` (#32, #33, #35); `div7-finance-tax-legal` (#37, #38, #39, #40); `div8-data-ops-hr` (#42, #43, #44); `div9-critique-ux-lab` (#46, #47, #48, #49, #50, #51, #52, #53).
- **Phòng không cần huy động để tránh loãng:** #14, #18, #28.

### `B2B_SAAS`: Phần mềm Quản trị Thuê bao Doanh nghiệp và Hộ kinh doanh (SaaS)
- **Nguyên tắc phân công:** Huy động đủ 9/9 Khối và Ban Điều hành; nhấn mạnh kiến trúc đa khách hàng, cơ sở dữ liệu, thanh toán VietQR/thuê bao, bảo vệ dữ liệu, giữ chân khách hàng và pháp lý thuế.
- **Đội hình 10 Khối tham gia:** `exec-board` (#00); `div1-strategy-intel` (#01, #02, #03, #04, #05); `div2-product-design` (#06, #07, #08, #10, #11); `div3-engineering-ai` (#12, #13, #15, #16, #17, #19); `div4-qa-cybersecurity` (#20, #21, #22, #23, #24); `div5-media-youtube-studio` (#25, #26, #29, #30, #31); `div6-sales-commercial` (#32, #33, #35, #36); `div7-finance-tax-legal` (#37, #38, #39, #40); `div8-data-ops-hr` (#42, #43, #44); `div9-critique-ux-lab` (#46, #47, #48, #49, #50, #51, #52, #53).
- **Phòng không cần huy động để tránh loãng:** #14, #18, #28.

### `MOBILE_APP`: Ứng dụng Di động Android và iOS
- **Nguyên tắc phân công:** Huy động đủ 9/9 Khối và Ban Điều hành; kích hoạt chủ lực Phát triển Di động (#14), trải nghiệm 3 chạm (#07, #08, #09), kiểm thử chịu tải di động (#21) và chính sách kho ứng dụng (#41).
- **Đội hình 10 Khối tham gia:** `exec-board` (#00); `div1-strategy-intel` (#01, #02, #03, #04, #05); `div2-product-design` (#06, #07, #08, #09, #10, #11); `div3-engineering-ai` (#12, #14, #15, #17, #19); `div4-qa-cybersecurity` (#20, #21, #23, #24); `div5-media-youtube-studio` (#25, #26, #27, #29, #30, #31); `div6-sales-commercial` (#32, #33, #35, #36); `div7-finance-tax-legal` (#37, #38, #39, #40, #41); `div8-data-ops-hr` (#42, #43, #44); `div9-critique-ux-lab` (#46, #47, #48, #49, #50, #51, #52, #53).
- **Phòng không cần huy động để tránh loãng:** #18, #28.

### `EMBEDDED_IOT`: Thiết bị Thông minh, Phần cứng Nhúng và IoT
- **Nguyên tắc phân công:** Huy động đủ 9/9 Khối và Ban Điều hành; kích hoạt lõi Nhúng IoT (#18), Ứng dụng Di động (#14), Máy chủ thời gian thực (#15), AI tín hiệu (#16) và an ninh thiết bị (#23).
- **Đội hình 10 Khối tham gia:** `exec-board` (#00); `div1-strategy-intel` (#01, #02, #03, #04, #05); `div2-product-design` (#06, #07, #08, #10, #11); `div3-engineering-ai` (#12, #14, #15, #16, #17, #18, #19); `div4-qa-cybersecurity` (#20, #21, #22, #23, #24); `div5-media-youtube-studio` (#25, #26, #29, #30, #31); `div6-sales-commercial` (#32, #33, #35, #36); `div7-finance-tax-legal` (#37, #38, #39, #40); `div8-data-ops-hr` (#42, #43, #44); `div9-critique-ux-lab` (#46, #47, #48, #49, #50, #51, #52, #53).
- **Phòng không cần huy động để tránh loãng:** #28, #34.

### `MEDIA_CHANNEL`: Hệ thống Kênh Video YouTube, TikTok và Truyền thông Tăng trưởng
- **Nguyên tắc phân công:** Huy động đủ 9/9 Khối và Ban Điều hành; huy động toàn lực 7 phòng Khối 5 (#25..#31), bản quyền chính sách nền tảng (#41), tiếp thị liên kết (#34) và tối ưu giao diện trang đích (#13).
- **Đội hình 10 Khối tham gia:** `exec-board` (#00); `div1-strategy-intel` (#01, #02, #03, #05); `div2-product-design` (#06, #07, #09, #10); `div3-engineering-ai` (#13, #16, #19); `div4-qa-cybersecurity` (#20, #22, #24); `div5-media-youtube-studio` (#25, #26, #27, #28, #29, #30, #31); `div6-sales-commercial` (#32, #33, #34, #35); `div7-finance-tax-legal` (#37, #38, #39, #40, #41); `div8-data-ops-hr` (#42, #43, #44); `div9-critique-ux-lab` (#46, #47, #48, #49, #50, #51, #52, #53).
- **Phòng không cần huy động để tránh loãng:** #14, #17, #18.
