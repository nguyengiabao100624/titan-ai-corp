# Titan AI Corp v4.0 — Tập Đoàn Đa Tác Tử AI Tự Học Liên Tục & Trung Tâm Chỉ Huy Đa Thiết Bị 24/7

**Titan AI Corp v4.0** là hệ điều hành doanh nghiệp AI toàn năng gồm **1 Ban Tổng Giám Đốc (`00` `@ceo`) + 8 Khối C-Level + 45 Phòng Ban Chuyên Gia Sâu (`01`–`45`)**. Toàn bộ 46 vị trí được trang bị **Bộ Não Thiên Tài 6 Tầng**, tự động đọc báo chí thực tế & công trình khoa học mỗi ngày, tuân thủ **Dây chuyền Vận hành 12 Giai đoạn** và được giám sát trực quan qua giao diện dịu mắt **`Titan Command Center` (Web & Mobile PWA)**.

---

## 1. Kiến Trúc Nổi Bật

| Trụ cột cốt lõi | Công nghệ & Chuẩn mực tích hợp |
| :--- | :--- |
| **46 Bộ Não Thiên Tài 6 Tầng** | Tích hợp tinh hoa từ `paperclipai/paperclip` (Atomic Checkout), `obra/superpowers` (TDD), `gstack` (Sprint), `MetaGPT` (SOP), `Stanford Generative Agents` (3D Memory Recall), `Reflexion` (Tự kiểm điểm khi bị bác bỏ) & `Voyager`. |
| **Động Cơ Tự Học Liên Tục 8 Nguồn** | `scripts/learning_engine.py` quét song song RSS VnExpress, CafeF, VnEconomy, Google News VN, arXiv API, GitHub Open-Source, HackerNews, CISA Security + Trình bóc tách sâu URL bất kỳ (`Deep URL Extractor`). |
| **Cơ Sở Dữ Liệu Tốc Độ Cao `< 15ms`** | `SQLite WAL` đa luồng + chỉ mục tìm kiếm toàn văn `FTS5 BM25`, nén `Gzip`, kiểm tra `ETag / HTTP 304` và luồng đẩy trực tiếp `Server-Sent Events (SSE)`. |
| **Giao Diện Dịu Mắt & Mobile PWA** | 28 biến màu tinh chỉnh (`Light Editorial` & `Midnight Slate`), 8 Tab quản trị, phím tắt `Ctrl+K`, thanh điều hướng ngón cái di động, ngăn kéo Bottom Sheet `90dvh`, cài đặt ra màn hình chính Điện thoại/iPad. |
| **Online 24/7 Trên GitHub & Cloud** | Tích hợp sẵn GitHub Pages CDN (`.github/workflows/deploy_command_center.yml`), GitHub Actions tự thức dậy đọc báo mỗi 6 giờ (`autonomous_learning_cron.yml`), đồng bộ CRDT 2 chiều không mất dữ liệu & `Dockerfile`. |

---

## 2. Khởi Chạy Nhanh Trên Máy Trạm (`Local Workstation`)

```powershell
cd C:\Users\baobe\.gemini\antigravity\scratch\titan-ai-corp

# 1. Kiểm toán toàn bộ 46 Bộ Não Thiên Tài 6 Tầng
python scripts/titan_cli.py audit

# 2. Cho cả Tập đoàn quét tin tức & báo chí thực tế mới nhất
python scripts/titan_cli.py learn --scope all

# 3. Bật Máy chủ Trung Tâm Chỉ Huy (http://127.0.0.1:8765)
python scripts/command_center_server.py --host 127.0.0.1 --port 8765
```

Mở trình duyệt tại **`http://127.0.0.1:8765`** để điều hành trực tiếp toàn bộ 8 Tab quản trị.

---

## 3. Đưa Lên GitHub Để Chạy Online Liên Tục 24/7 & Đồng Bộ Điện Thoại

Dự án đã được khởi tạo Git sạch và cấu hình đầy đủ 3 luồng tự động trong `.github/workflows/`. Để đẩy lên tài khoản GitHub của bạn và bật chế độ chạy 24/7 miễn phí trọn đời:

```powershell
cd C:\Users\baobe\.gemini\antigravity\scratch\titan-ai-corp

# Bước 1: Đăng nhập GitHub CLI một lần duy nhất trên máy
gh auth login

# Bước 2: Tạo kho GitHub và đẩy toàn bộ mã nguồn + cấu hình Actions lên mây
gh repo create titan-ai-corp --public --source=. --remote=origin --push
```

Sau khi đẩy lên:
1. Vào mục **Settings -> Pages** trên kho GitHub -> phần *Build and deployment / Source* chọn **`GitHub Actions`**.
2. Ngay lập tức, trang quản trị của bạn sẽ online 24/7 trên mạng CDN toàn cầu `https://<ten-tai-khoan>.github.io/titan-ai-corp/` (không bao giờ ngủ đông!).
3. Cứ mỗi **6 tiếng/lần**, `autonomous_learning_cron.yml` tự động thức dậy trên máy chủ GitHub, đọc báo mới cho cả 46 phòng ban và cập nhật lên giao diện kể cả khi máy tính ở nhà đang tắt nguồn!
4. Để đồng bộ ghi 2 chiều giữa Điện thoại và Máy tính: bấm nút **`☁ Cloud 24/7`** trên thanh đầu trang -> nhập `owner/repo`, Fine-Grained Token (quyền `Contents: Read & Write`) và mã PIN bảo vệ két `AES-256-GCM`, đồng thời chạy cầu nối trên máy trạm khi mở máy:
   ```powershell
   $env:TITAN_GITHUB_REPO="ten-tai-khoan/titan-ai-corp"
   $env:TITAN_GITHUB_TOKEN="github_pat_..."
   python scripts/cloud_sync_daemon.py --interval 25
   ```

---

## 4. Chạy Bộ Kiểm Thử Toàn Diện & Đo Độ Trễ Chịu Tải (`QA & Stress Suite`)

```powershell
python -m unittest discover -s tests -v
```
