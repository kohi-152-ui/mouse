# Chuột Máy Tính — Slide trình chiếu tương tác

Bộ slide trình chiếu môn **Tâm lý học Kỹ sư**, chủ đề *Chuột máy tính*, dựng bằng HTML/CSS/JS thuần (không cần cài framework hay build tool).

## Cấu trúc file

```
├── index.html          → toàn bộ nội dung 8 slide
├── style.css            → design tokens, layout, hiệu ứng
├── script.js            → điều hướng slide + các tab/timeline tương tác
├── assets/img/          → toàn bộ hình ảnh minh họa (đã tối ưu dung lượng)
└── README.md
```

## Cách mở trong VS Code

1. Giải nén thư mục này, mở cả thư mục bằng **File → Open Folder…** trong VS Code (không mở lẻ file `index.html`).
2. Cài extension **Live Server** (tác giả *Ritwick Dey*) từ tab Extensions nếu chưa có.
3. Click chuột phải vào `index.html` → **Open with Live Server** (hoặc bấm nút "Go Live" ở góc dưới phải). Trình duyệt sẽ tự mở và tự tải lại mỗi khi bạn lưu file.

> Không dùng Live Server cũng được: chỉ cần bấm đúp vào `index.html` để mở trực tiếp bằng trình duyệt (Chrome/Edge/Firefox). Vì trang không gọi API hay cần server riêng, mọi thứ vẫn chạy đúng — chỉ khác là sẽ không tự tải lại khi bạn sửa code.

## Điều hướng khi trình chiếu

- Phím `→` / `←` (hoặc `Space` / `Backspace`) để chuyển slide.
- Click hai mũi tên tròn hai bên mép màn hình, hoặc các chấm tròn phía dưới.
- Vuốt trái/phải trên máy cảm ứng.
- Các thẻ tab (phân loại chuột, 3 loại chuột đang dùng) và dòng thời gian ở slide "Bốn thời kỳ thiết kế" bấm được để đổi nội dung — bấm nút thời kỳ sẽ tự trượt sang nút kế tiếp, tiện thao tác trên điện thoại.
- Slide "Lịch sử ra đời" có thẻ video "The Mother of All Demos" — bấm vào để mở video có âm thanh trong hộp thoại; nhấn `Esc`, bấm nút X, hoặc bấm ra ngoài để đóng.
- Panel "Công thái học & Không dây" có nút chuyển giữa "Hình ảnh" và "Mô hình 3D".
- Slide "BioMorph Mesh" có 4 mục bấm để mở rộng chi tiết.

## ⚠️ File còn thiếu: mô hình 3D

Panel "Công thái học & Không dây" đã nối sẵn khung `<model-viewer>` trỏ tới `assets/Mouse1.glb`, nhưng file này **chưa có** trong dữ liệu đã gửi. Cần bổ sung:

1. Đặt file mô hình 3D (định dạng `.glb`) vào `assets/Mouse1.glb`.
2. Mở lại bằng Live Server — nút "Mô hình 3D" sẽ hiển thị mô hình ngay, không cần sửa code.

Trước khi có file, bấm nút "Mô hình 3D" sẽ không hiển thị gì (khung trống).

## Tuỳ chỉnh nhanh

- **Đổi màu chủ đạo**: sửa các biến ở đầu `style.css`, trong khối `:root` (`--cyan`, `--violet`, `--magenta`, `--bg`...).
- **Đổi nội dung chữ**: sửa trực tiếp trong `index.html`, mỗi slide nằm trong một thẻ `<section class="slide">`.
- **Đổi/thêm ảnh**: bỏ ảnh mới vào `assets/img/`, rồi sửa đường dẫn `src="assets/img/...">` tương ứng.
- **Thêm slide mới**: copy một khối `<section class="slide" data-index="N">...</section>`, đổi số `data-index` tăng dần, script sẽ tự nhận diện (không cần sửa `script.js`).

## Yêu cầu mạng

Trang dùng Google Fonts (Space Grotesk, Inter, JetBrains Mono) tải qua CDN — cần máy có Internet khi mở để hiển thị đúng font. Nếu mất mạng, trình duyệt sẽ tự dùng font hệ thống thay thế, bố cục và nội dung vẫn nguyên vẹn.
