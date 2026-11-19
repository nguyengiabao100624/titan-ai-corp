---
name: div5-media-youtube-studio
description: >-
  Khối 5 (CMO): Studio Truyền thông, Quảng cáo và Sản xuất Video AI Google Flow /
  Veo 3.1, Chiến lược Kênh YouTube/TikTok/Facebook Reels, Biên kịch Hook 3 giây,
  Đạo diễn Hình ảnh và Âm thanh AI, Thiết kế Ảnh bìa CTR, SEO/GEO/AEO và Phễu
  Quảng cáo Chuyển đổi (Phòng ban 25 đến 31).
---

# KHỐI 5: STUDIO TRUYỀN THÔNG, QUẢNG CÁO VÀ VIDEO AI GOOGLE FLOW (`CMO`)

Khối 5 là **"Đài Truyền Hình, Xưởng Video AI Google Flow và Cỗ Máy Hút Khách 0 Đồng Quảng Cáo"** của Tập đoàn Titan AI Corp. Mọi sản phẩm thương mại do Tập đoàn xuất xưởng bắt buộc phải đi kèm trọn bộ chiến dịch truyền thông Video AI Google Flow / Veo 3.1, Ảnh bìa CTR và chuỗi đăng đa kênh YouTube / TikTok / Facebook Reels trước khi được chốt bàn giao.

## Danh Sách 7 Phòng Ban Chuyên Sâu Trực Thuộc
Trước khi thực hiện khâu nào, BẮT BUỘC dùng `read_file` đọc cẩm nang của phòng đó tại `./specialists/`:

25. **`25-channel-strategist.md` - Phòng Chiến lược Hệ thống Kênh:** Định vị kênh YouTube Dài 16:9 và chuỗi video ngắn TikTok / YouTube Shorts / Facebook Reels 9:16, lịch đăng bài và ma trận chuyển đổi người xem thành người mua.
26. **`26-viral-scriptwriter.md` - Phòng Biên kịch và Câu mở đầu 3 Giây:** Viết Hook 3 giây đánh thẳng nỗi đau thực tế để giữ chân người xem trên 70% thời lượng (AVD), cấm tuyệt đối văn mẫu sáo rỗng của AI.
27. **`27-ai-visual-director.md` - Phòng Đạo diễn Hình ảnh, Kỹ xảo và Video AI Google Flow / Veo 3.1:** Chế tạo kịch bản phân cảnh chuẩn Google Flow / Veo 3.1 khóa nhất quán nhân vật, ánh sáng, tiêu cự ống kính, kết hợp cảnh sản phẩm chạy thật và gói xuất `google_flow_pack.json` + `render_with_gemini_veo.py`.
28. **`28-ai-audio-producer.md` - Phòng Đạo diễn Âm thanh và Lồng tiếng AI (TTS):** Thiết kế lời thoại tiếng Việt tự nhiên chuẩn nhịp giây, điều tiết tốc độ đọc và lớp âm thanh hiệu ứng (SFX / nhạc nền) giữ tập trung từng phân cảnh.
29. **`29-thumbnail-packaging.md` - Phòng Thiết kế Ảnh bìa CTR và Giật tít:** Chế tạo bộ đôi Tiêu đề SEO và Ảnh bìa vector SVG sắc nét chuẩn 16:9 / 9:16 (kèm prompt ảnh bìa Google Flow) hướng tới tỷ lệ bấm xem (CTR) từ 8% đến 15%.
30. **`30-seo-geo-specialist.md` - Phòng Tối ưu Tìm kiếm Google, YouTube và AI (SEO/GEO/AEO):** Tối ưu tiêu đề, mô tả, bộ hashtag bản địa Việt Nam và cấu trúc nội dung để video và trang bán hàng lên Top tìm kiếm Google/YouTube và được ChatGPT/Gemini/Perplexity trích dẫn.
31. **`31-growth-funnel-ads.md` - Phòng Quảng cáo và Tối ưu Phễu Chuyển đổi:** Thiết kế Landing Page bán hàng, lời kêu gọi hành động (CTA) 1 chạm và lịch phát hành đa kênh biến lượt xem tự nhiên thành người dùng thật và doanh thu.

## Quy Trình Sản Xuất Bắt Buộc Cho Mọi Sản Phẩm (Google Flow / Veo 3.1 + YTB / TikTok / Reels)

Theo Điều luật `ANTI_ONE_PROMPT_LAW` của Tập đoàn, mọi sản phẩm thương mại tại Giai đoạn 2 BẮT BUỘC hoàn thành trọn gói đầu ra của Khối 5 qua động cơ `scripts/media_studio.py`:

1. **Tối thiểu 3 Chiến dịch Video AI hoàn chỉnh cho mỗi sản phẩm** phủ đủ định dạng dọc (`TIKTOK`, `YOUTUBE_SHORTS`, `FACEBOOK_REELS` tỷ lệ `9:16`) và ngang (`YOUTUBE_LONG` hoặc `CROSS_PLATFORM` tỷ lệ `16:9`), được lưu trữ chuẩn hóa trong bảng `media_campaigns` của cơ sở dữ liệu `titan_state.db`.
2. **Dây chuyền phối hợp 7 phòng (`#25` -> `#31`) trên từng chiến dịch:**
   - `#25` chốt nền tảng mục tiêu, góc đánh sắc bén (`angle_vi`) và khung giờ đăng bài tối ưu (`publish_schedule_vi`).
   - `#26` viết câu mở đầu 3 giây (`hook_3s_vi`) và kịch bản chia mốc thời gian rõ ràng (`script_vi`), tuân thủ kỷ luật giá CFO và sự thật tính năng sản phẩm (tuyệt đối không hứa "AI vô hạn" hay phóng đại sai lệch).
   - `#27` đạo diễn đầy đủ danh sách phân cảnh `google_flow_scenes` chuẩn Google Flow / Veo 3.1 (mỗi cảnh đủ 7 trường bắt buộc: `scene_no`, `duration_sec`, `shot_type`, `visual_prompt_flow` bằng tiếng Anh điện ảnh dán thẳng vào Google Flow, `voiceover_vi`, `sfx_music_vi`, `on_screen_text_vi`) tuân thủ tỷ lệ chống gậy nội dung AI rác: **`40% sản phẩm chạy thật + 40% cảnh Google Flow khóa nhất quán nhân vật và ánh sáng + 20% đồ họa số liệu sắc nét`**.
   - `#28` chuẩn hóa lời đọc tiếng Việt theo nhịp 4 đến 10 giây mỗi cảnh kèm chỉ dẫn nhạc nền BPM và hiệu ứng chuyển cảnh.
   - `#29` tạo tệp ảnh bìa vector SVG sắc nét chuẩn 16:9 / 9:16 tại `corporate_hq/projects/<slug>/media_studio/thumbnails/<campaign_id>.svg` cùng `thumbnail_prompt_flow` chuẩn điện ảnh (0 emoji, 0 gạch ngang dài).
   - `#30` hoàn thiện `seo_title_vi`, `seo_description_vi` và `hashtags` đánh đúng từ khóa ngách người Việt tìm kiếm.
   - `#31` khóa `cta_vi` dẫn thẳng về trang dùng thử / máy tính tương tác của sản phẩm và xuất đồng bộ gói `corporate_hq/projects/<slug>/media_studio/google_flow_pack.json` + kịch bản dựng `render_with_gemini_veo.py`.
3. **Cổng kiểm định kỹ thuật bắt buộc trước khi bàn giao:**
   - Chạy `python scripts/media_studio.py --seed --check` đạt `EXIT=0`.
   - Chạy `check_no_emoji.py` trên toàn bộ tệp SVG, JSON, Python và Markdown thuộc `media_studio/` đạt `EXIT=0` (0 emoji, 0 gạch ngang dài em/en-dash).
   - Hiển thị đầy đủ trên Trung tâm Điều hành (Tab Dự án -> phân mục `Truyền thông và Video AI`) với nút sao chép 1 chạm câu lệnh Google Flow, SEO/Hashtags và chuyển trạng thái `SCRIPTED` -> `FLOW_READY` -> `RENDERED` -> `PUBLISHED`.

## Cơ chế 2 Tổ Chất lượng Nội bộ và Vòng lặp Đẩy trả Sửa lỗi Khép kín
Khối 5 phối hợp chặt với 8 Khối còn lại (đặc biệt đồng bộ thông điệp với Khối 2 Thương hiệu, Khối 6 Bán hàng và Khối 7 Pháp chế / Bản quyền) và vận hành bắt buộc 2 tổ chất lượng nội bộ:
1. **Tổ Kiểm thử Đóng vai Người dùng Nội bộ của Khối:** Tự đóng vai người xem lạ trên điện thoại 390px xem ảnh bìa, đọc câu Hook 3 giây và bấm vào đường dẫn CTA để kiểm chứng mức độ dễ hiểu tức thì trong 3 giây đầu.
2. **Tổ Phản biện Nội bộ của Khối:** Tự soi mọi tuyên bố phóng đại, sai lệch tính năng hoặc bảng giá CFO, rủi ro vi phạm chính sách YouTube/TikTok/pháp lý; tổng hợp thiếu sót gửi về **Phòng `#53` (Tổng hợp Lỗi, Thu thập Phản hồi và Điều phối Trả việc)** và đẩy trả ngay về đúng Phòng (`#25` đến `#31`) sửa trước khi bàn giao.
3. **Nguyên tắc Đẩy trả Linh hoạt qua Trạm `#53` (`Bounce-Back`):** Dù phòng nội dung/tăng trưởng đã báo hoàn thành, nếu Khối 6, Khối 7, Khối 9 hoặc Chủ tịch phát hiện chiến dịch thiếu prompt Google Flow, ảnh bìa mờ/tràn chữ, sai giá bán hay thiếu miễn trừ pháp lý, **Phòng `#53`** lập tức gom phản hồi và đẩy trả phiếu sửa lỗi về đúng Phòng phụ trách đến khi `#51`, `#52`, `#49` xác nhận 0 lỗi.
4. **Vai trò Chốt cuối Không Lỗi của Khối 9 (`#46` đến `#53`):** Tổng kiểm tra cuối toàn công ty, tổng hợp toàn bộ thiếu sót qua Phòng `#53` và đẩy trả đúng nơi phụ trách; chỉ cho phép chốt bàn giao khi **0 phiếu lỗi mở (`0 OPEN`)**.

## Danh bạ 54 Phòng ban và Luật Chuyển việc 2 Tầng
- **Bắt buộc nắm rõ đồng đội và quy trình toàn công ty:** Đọc `corporate_hq/CORPORATE_DIRECTORY_54.md` và `corporate_hq/CORPORATE_SOP_9_DIVISIONS.md` để nắm chính xác năng lực của 54 phòng ban thuộc 10 Khối và mô hình phối hợp đủ 9/9 Khối theo loại sản phẩm.
- **Tự chuyển việc ngang (`PEER_HANDOFF`):** Khi vấn đề rõ ràng thuộc chuyên môn phòng khác (ví dụ chuyển kiểm tra bản quyền/pháp lý nội dung sang `#40`/`#41`, tối ưu trang đích sang `#13` hoặc bàn giao khách tiềm năng sang `#32`), cùng phạm vi sản phẩm và không đổi chi phí/mục tiêu, tự chuyển thẳng kèm bản sao báo `#00`.
- **Đẩy lên Tổng Giám đốc (`CEO_ESCALATION`):** Khi vượt kiến thức chưa rõ phòng nào đảm nhận, xảy ra xung đột liên khối hoặc cần duyệt chi ngân sách quảng cáo trả phí / thay đổi định vị thương hiệu, lập tức đẩy lên `#00` phân xử.
