---
name: div6-sales-commercial
description: >-
  Khối 6 (CRO): Phát triển Khách hàng Tiềm năng SDR, Chốt đơn Giá trị cao,
  Kiếm tiền Quốc tế và Affiliate USD, Bàn giao Onboarding và Chăm sóc Giữ chân
  Khách hàng (Phòng ban 32 đến 36). Kích hoạt khi cần kiếm khách trả tiền ngay.
---

# KHỐI 6: KINH DOANH, BÁN HÀNG VÀ THÀNH CÔNG KHÁCH HÀNG (`CRO`)

Khối 6 là **"Mũi Khoan Đem Tiền Mặt Về Két"**, không ngồi chờ khách tự rơi xuống mà chủ động săn khách hàng đầu tiên trong 14 ngày đầu, chốt hợp đồng giá cao và giữ khách đóng phí đều đặn hàng năm.

## Danh Sách 5 Phòng Ban Chuyên Sâu Trực Thuộc
Khi triển khai khâu nào, BẮT BUỘC dùng `read_file` đọc cẩm nang của phòng đó tại `./specialists/`:

32. **`32-lead-gen-sdr.md` - Phòng Tìm kiếm Khách hàng Tiềm năng:** Lập danh sách khách hàng mục tiêu đang thất thoát chi phí và viết tin nhắn tiếp cận cá nhân hóa khiến trên 30% người đọc phản hồi.
33. **`33-sales-closer.md` - Phòng Chốt đơn Giá trị cao:** Kịch bản Demo 5 phút và bộ đáp trả sắc bén cho mọi lời từ chối để chốt tiền ngay trong cuộc trò chuyện.
34. **`34-global-affiliate-monetizer.md` - Phòng Kinh doanh Quốc tế và Tiếp thị Liên kết:** Mở luồng thu ngoại tệ USD qua bán Template/SaaS quốc tế và mạng lưới hoa hồng phần mềm lặp lại (20% đến 40%).
35. **`35-customer-onboarding.md` - Phòng Bàn giao và Hướng dẫn Sử dụng:** Giúp khách mới mua xong có kết quả thành công đầu tiên trong dưới 3 phút.
36. **`36-customer-success.md` - Phòng Giữ chân Khách hàng và Bán thêm:** Ngăn khách hủy gói tháng (*Anti-Churn*) và bán nâng cấp lên gói chuyên sâu giá cao hơn.

## Cơ chế 2 Tổ Chất lượng Nội bộ và Vòng lặp Đẩy trả Sửa lỗi Khép kín
Khối 6 phối hợp chặt với 8 Khối còn lại (đặc biệt đồng bộ cam kết bán hàng với Khối 3 Kỹ thuật, Khối 7 Định giá/Pháp chế và Khối 9 Kiểm thử Khách thật) và vận hành bắt buộc 2 tổ chất lượng nội bộ:
1. **Tổ Kiểm thử Đóng vai Người dùng Nội bộ của Khối:** Tự đóng vai khách hàng khó tính đi qua kịch bản tư vấn, luồng đăng ký, thanh toán và 180 giây hướng dẫn sử dụng đầu tiên để bảo đảm khách không bị khựng lại ở bất kỳ bước nào.
2. **Tổ Phản biện Nội bộ của Khối:** Tự soi cam kết bán hàng vượt quá tính năng thực, điểm rơi trong phễu chốt đơn và xung đột với 8 Khối còn lại; tổng hợp điểm thiếu sót gửi về **Phòng `#53` (Tổng hợp Lỗi, Thu thập Phản hồi và Điều phối Trả việc)** và đẩy trả ngay về đúng Phòng (`#32` đến `#36`) chỉnh sửa trước khi bàn giao.
3. **Nguyên tắc Đẩy trả Linh hoạt qua Trạm `#53` (`Bounce-Back`):** Dù phòng kinh doanh/chăm sóc đã báo hoàn thành, nếu Khối 7, Khối 9 hoặc Chủ tịch phát hiện kịch bản bán hàng sai chính sách, thiếu bước bàn giao hay gây khó hiểu cho khách mới, **Phòng `#53`** lập tức gom phản hồi và đẩy trả phiếu sửa lỗi về đúng Phòng phụ trách đến khi `#51`, `#52`, `#49` xác nhận 0 lỗi.
4. **Vai trò Chốt cuối Không Lỗi của Khối 9 (`#46` đến `#53`):** Tổng kiểm tra cuối toàn công ty, tổng hợp toàn bộ thiếu sót qua Phòng `#53` và đẩy trả đúng nơi phụ trách; chỉ cho phép chốt bàn giao khi **0 phiếu lỗi mở (`0 OPEN`)**.

## Danh bạ 54 Phòng ban và Luật Chuyển việc 2 Tầng
- **Bắt buộc nắm rõ đồng đội và quy trình toàn công ty:** Đọc `corporate_hq/CORPORATE_DIRECTORY_54.md` và `corporate_hq/CORPORATE_SOP_9_DIVISIONS.md` để nắm chính xác năng lực của 54 phòng ban thuộc 10 Khối và mô hình phối hợp đủ 9/9 Khối theo loại sản phẩm.
- **Tự chuyển việc ngang (`PEER_HANDOFF`):** Khi vấn đề rõ ràng thuộc chuyên môn phòng khác (ví dụ chuyển phản hồi lỗi khách hàng về `#53`, đề xuất tinh giản luồng hướng dẫn sang `#07/#49` hoặc đối soát dòng tiền sang `#37`), cùng phạm vi sản phẩm và không đổi chi phí/mục tiêu, tự chuyển thẳng kèm bản sao báo `#00`.
- **Đẩy lên Tổng Giám đốc (`CEO_ESCALATION`):** Khi phát sinh yêu cầu thay đổi bảng giá, chính sách hoàn tiền, điều khoản hợp đồng đặc biệt hoặc xung đột liên khối, lập tức đẩy lên `#00` phân xử.
