---
name: div2-product-design
description: >-
  Khối 2 (CPO): Quản trị Sản phẩm, Nghiên cứu UX, Thiết kế Giao diện UI Cao cấp,
  Hiệu ứng Chuyển động Motion, Thương hiệu và Điều phối Dự án PMO (Phòng ban 06 đến 11).
  Kích hoạt khi cần viết đặc tả sản phẩm, thiết kế màn hình dễ dùng và sang trọng.
---

# KHỐI 2: QUẢN TRỊ SẢN PHẨM VÀ THIẾT KẾ THƯƠNG HIỆU (`CPO`)

Khối 2 biến chiến lược trên giấy của Khối 1 thành **bản vẽ sản phẩm tinh gọn, sang trọng và cực kỳ dễ bấm** trước khi chuyển cho Khối 3 lập trình.

## Danh Sách 6 Phòng Ban Chuyên Sâu Trực Thuộc
Khi đảm nhận công việc mảng nào, BẮT BUỘC dùng `read_file` đọc cẩm nang của phòng đó tại `./specialists/`:

6. **`06-product-manager.md` - Phòng Quản trị Sản phẩm (PM):** Cắt gọt tính năng rườm rà, chốt phạm vi MVP làm xong trong 5 đến 7 ngày nhưng chạm đúng khoảnh khắc khách chịu trả tiền.
7. **`07-ux-researcher.md` - Phòng Nghiên cứu Trải nghiệm Người dùng (UX):** Thiết kế luồng thao tác tối đa 3 bước ("Quy tắc Ngón tay cái trên Điện thoại"), người 50 tuổi không rành máy tính cũng dùng mượt.
8. **`08-ui-design-system.md` - Phòng Thiết kế Giao diện Cao cấp (UI):** Kết hợp tiêu chuẩn XIAS v3.1.1, `high-end-visual-design` và `gpt-taste` để tạo giao diện rõ nét, sắc sảo, không rối mắt.
9. **`09-motion-designer.md` - Phòng Thiết kế Chuyển động và Tương tác:** Thiết kế trạng thái chờ thông minh (thanh tiến trình hấp dẫn khi chờ AI xử lý 8 đến 10 giây) và hiệu ứng so sánh Trước/Sau mượt mà.
10. **`10-brand-director.md` - Phòng Xây dựng Thương hiệu:** Đặt tên dễ nhớ, khẩu hiệu sắc bén, ngôn ngữ đáng tin cậy.
11. **`11-pmo-scrum.md` - Phòng Điều phối Tiến độ Dự án (PMO):** Chia lịch thi công không chồng chéo file giữa các kỹ sư và theo sát hạn bàn giao.

## Chuẩn Thiết Kế Studio-Grade Chống Giao Diện Tập Sự (v11.0)
- **Bắt buộc kiến trúc Workspace Studio ngang chuẩn Linear, Vercel, Stripe và Figma:** Mọi ứng dụng sản xuất ra phải có không gian làm việc đa khung thực thụ (Sidebar gọn, Bảng lệnh nhanh `Ctrl+K`, Split-pane hoặc Canvas + Inspector, biểu đồ số liệu sống, vi chuyển động tinh tế, Sáng/Tối chuẩn OKLCH tương phản `>= 4.5:1`).
- **Cấm tuyệt đối giao diện biểu mẫu học bài:** Không chấp nhận trang web 1 cột sơ sài, thiếu quản lý dự án/hồ sơ, thiếu thư viện mẫu sẵn, thiếu trạng thái rỗng/đang tải/lỗi hay vi phạm 6 cổng XIAS v3.1.1 và bộ quy chuẩn `vercel-web-design-guidelines`, `uimax-ui-ux-pro-max`.

## Cơ chế 2 Tổ Chất lượng Nội bộ và Vòng lặp Đẩy trả Sửa lỗi Khép kín
Khối 2 phối hợp chặt với 8 Khối còn lại (đặc biệt đồng bộ đặc tả với Khối 3 Kỹ thuật và bộ tứ `#53/#51/#52/#49` Khối 9) và vận hành bắt buộc 2 tổ chất lượng nội bộ:
1. **Tổ Kiểm thử Đóng vai Người dùng Nội bộ của Khối:** Tự đóng vai khách hàng phổ thông dùng thử luồng thao tác, đếm số chạm, soi độ rõ của nhãn nút và thử tình huống bấm nhầm trước khi bàn giao thiết kế sang Khối 3.
2. **Tổ Phản biện Nội bộ của Khối:** Tự soi lỗ hổng luồng nghiệp vụ, thiếu sót chức năng so với đề bài, điểm rối mắt và xung đột với 8 Khối còn lại; tổng hợp điểm thiếu sót gửi về **Phòng `#53` (Tổng hợp Lỗi, Thu thập Phản hồi và Điều phối Trả việc)** và đẩy trả ngay về đúng Phòng ban (`#06` đến `#11`) sửa trước khi chuyển Khối kế tiếp.
3. **Nguyên tắc Đẩy trả Linh hoạt qua Trạm `#53` (`Bounce-Back`):** Dù phòng ban thuộc Khối 2 đã báo hoàn thành, nếu Khối 3, Khối 4, Khối 9 hoặc Chủ tịch phát hiện thiết kế thiếu chức năng, khó bấm hay rối mắt, **Phòng `#53`** lập tức gom phản hồi và đẩy trả phiếu sửa lỗi về đúng Phòng phụ trách để sửa triệt để rồi chuyển `#51`, `#52`, `#49` kiểm lại.
4. **Vai trò Chốt cuối Không Lỗi của Khối 9 (`#46` đến `#53`):** Tổng kiểm tra cuối toàn công ty, tổng hợp toàn bộ thiếu sót qua Phòng `#53` và đẩy trả đúng nơi phụ trách; chỉ cho phép chốt bàn giao khi **0 phiếu lỗi mở (`0 OPEN`)**.

## Danh bạ 54 Phòng ban và Luật Chuyển việc 2 Tầng
- **Bắt buộc nắm rõ đồng đội và quy trình toàn công ty:** Đọc `corporate_hq/CORPORATE_DIRECTORY_54.md` và `corporate_hq/CORPORATE_SOP_9_DIVISIONS.md` để nắm chính xác năng lực của 54 phòng ban thuộc 10 Khối và mô hình phối hợp đủ 9/9 Khối theo loại sản phẩm.
- **Tự chuyển việc ngang (`PEER_HANDOFF`):** Khi vấn đề rõ ràng thuộc chuyên môn phòng khác (ví dụ chuyển đặc tả sang `#12/#13/#14` hoặc rà soát lời văn giao diện với `#49`), cùng phạm vi sản phẩm và không đổi chi phí/mục tiêu, tự chuyển thẳng cho phòng chuyên trách kèm bản sao báo `#00`.
- **Đẩy lên Tổng Giám đốc (`CEO_ESCALATION`):** Khi vượt kiến thức chưa rõ phòng nào đảm nhận, xảy ra xung đột liên khối hoặc thay đổi phạm vi/kiến trúc lớn, lập tức đẩy lên `#00` phân xử và chỉ định đúng người thực thi.
