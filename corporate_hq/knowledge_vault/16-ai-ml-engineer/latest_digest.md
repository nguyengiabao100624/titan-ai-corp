# SỔ TRI THỨC CẬP NHẬT HÀNG NGÀY — PHÒNG 16: KỸ SƯ TRÍ TUỆ NHÂN TẠO & TỰ ĐỘNG HÓA
- **Cập nhật lần cuối:** `2026-11-18T21:58:37Z`
- **Tổng số tài liệu/bài báo đã nạp:** `3`

---

### 1. [Spool: Low-Latency Streaming Inference for Hybrid Vision-Language Models](https://arxiv.org/abs/2611.23228v1)
- **Nguồn:** `arxiv` | **Độ quan trọng:** `8/10` | **Thu thập:** `2026-11-18T19:28:39Z`
- **Tóm tắt cốt lõi:** Applications such as visual accessibility agents and robotics require answering questions about recent video content promptly, over a bounded window of past frames (e.g., the last two minutes). Hybrid vision-language models (VLMs), which interleave attention with linear recurrent layers such as Gated DeltaNet (GDN), are attractive for this setting, but maintaining a sliding window is expensive. The reason is that recurrent layers combine all past
- **Ứng dụng thực chiến:** Áp dụng vào quy trình đóng gói Tiêu đề/Thumbnail, kịch bản Hook 3 giây và cấu trúc GEO/SEO của Khối 5.

### 2. [FastFrames: Video Generation at Interactive Latency](https://arxiv.org/abs/2611.23226v1)
- **Nguồn:** `arxiv` | **Độ quan trọng:** `8/10` | **Thu thập:** `2026-11-18T19:28:39Z`
- **Tóm tắt cốt lõi:** Autoregressive video diffusion models generate frames based on new observations and inputs, making them a promising medium for interactive visual experiences. However, existing models are orders of magnitude too slow for fluid interaction. This paper introduces FastFrames, a family of fast autoregressive video diffusion models that achieves interactive latency without compromising quality. We profile the inference pipeline of state-of-the-art mod
- **Ứng dụng thực chiến:** Áp dụng vào quy trình đóng gói Tiêu đề/Thumbnail, kịch bản Hook 3 giây và cấu trúc GEO/SEO của Khối 5.

### 3. [Multimodal Masked Diffusion Autoencoder for Modeling Impaired Driving](https://arxiv.org/abs/2611.23211v1)
- **Nguồn:** `arxiv` | **Độ quan trọng:** `8/10` | **Thu thập:** `2026-11-18T19:28:39Z`
- **Tóm tắt cốt lõi:** Human cognitive state (e.g., distraction, stress), gaze, and behavior interact with the driving environment in subtle ways that AI could use to assist drivers, but ground-truth labels for human cognitive state levels are costly to obtain at scale. We propose a multimodal masked-diffusion autoencoder, ID-MAE, that adds a self-supervised objective to impairment prediction: alongside predicting the impairment label as a masked token, it reconstructs
- **Ứng dụng thực chiến:** Thử nghiệm kỹ thuật mới trong Phòng AI R&D (04) và Kỹ sư AI (16) nhằm tăng độ chính xác và giảm chi phí token.
