# SỔ RÚT KINH NGHIỆM TOÀN TẬP ĐOÀN (`LESSONS_LEARNED.md`)

Mỗi khi hoàn thành một dự án hoặc phát hiện bài học thực chiến quan trọng, `44-knowledge-librarian` cập nhật tại đây để 45 Phòng ban không lặp lại sai lầm.

## Nguyên Tắc Xương Máu Đã Đúc Kết
1. **Tránh thị trường đã bão hòa:** Không làm lại các sản phẩm chung chung đã tràn ngập (như chatbot trả lời tin nhắn đơn thuần) nếu không có góc đánh ngách hoàn toàn mới. Luôn dùng `01-market-intel` kiểm tra thực tế đối thủ trước khi code.
2. **Giao tiếp đời thường, rõ việc:** Mọi giải thích và thiết kế sản phẩm hướng tới Chủ tịch cũng như khách hàng cuối đều phải cụ thể, bình dân, nhìn vào hiểu ngay trong 10 giây — tránh lạm dụng biệt ngữ gây rối.
3. **Kiến trúc Phân tầng Tiết kiệm Tài nguyên:** Duy trì 9 gói Skill cấp Khối ở tầng ngoài và 45 cẩm nang chuyên gia ở tầng trong để vừa giữ độ chuyên sâu tối đa, vừa không làm tràn bộ nhớ ngữ cảnh (Context Window).
4. **Không dùng LLM nhẩm tính tiền bạc/thuế:** Mọi phép tính diện tích, báo giá, đối soát, thuế suất bắt buộc viết bằng hàm code toán học chính xác 100%, kiểm tra bởi `22-ai-redteam-auditor` và `38-pricing-fpa`.
