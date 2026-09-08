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
- Slide "Lịch sử ra đời" có dòng thời gian dạng gọn: mặc định chỉ hiện các mốc năm, phần mô tả nằm trong khung ẩn. Bấm 2 nút mũi tên lên/xuống bên phải (hoặc bấm thẳng vào một năm) để khung mô tả của mốc đó trượt xuống và hiện ra; mốc trước đó tự thu gọn lại. Đang ở mốc đầu/cuối thì nút tương ứng tự khoá.
- Các thẻ tab (phân loại chuột, 3 loại chuột đang dùng) và dòng thời gian ở slide "Bốn thời kỳ thiết kế" bấm được để đổi nội dung — bấm nút thời kỳ sẽ tự trượt sang nút kế tiếp, tiện thao tác trên điện thoại.
- Slide "Lịch sử ra đời" có thẻ video "The Mother of All Demos" — bấm vào để mở video có âm thanh trong hộp thoại; nhấn `Esc`, bấm nút X, hoặc bấm ra ngoài để đóng.
- Panel "Công thái học & Không dây" có nút chuyển giữa "Hình ảnh" và "Mô hình 3D".
- Slide "BioMorph Mesh" có 4 mục bấm để mở rộng chi tiết.

## Thanh tiến trình tự ẩn

Thanh trên cùng (logo + progress bar + số trang) giờ chỉ hiện ra khi có tác dụng, rồi tự mờ dần sau ~1.8 giây:

- Hiện lại mỗi khi chuyển slide (bấm mũi tên, chấm, phím, hoặc vuốt).
- Hiện lại khi con trỏ chuột (hoặc ngón tay chạm) tới gần mép trên cùng màn hình (~90px).
- Đứng yên (không tự ẩn) trong lúc đang di chuột trực tiếp vào thanh.

Chỉnh thời gian tự ẩn hoặc vùng nhận diện "gần mép trên" ở đầu khối `TOPBAR_HIDE_DELAY` / `TOPBAR_HOVER_ZONE` trong `script.js`.

## Chế độ Pastel / Dark

Công tắc bật ở slide bìa (slide 1), dưới dòng hướng dẫn phím tắt. Bấm để đổi toàn bộ giao diện giữa:

- **Pastel** — giao diện sáng mặc định.
- **Dark** — bảng màu tối, vẫn giữ gradient cyan–violet–magenta làm điểm nhấn.

Lựa chọn được ghi nhớ qua `localStorage` trên trình duyệt đó (mở lại lần sau vẫn giữ theme đã chọn). Toàn bộ màu sắc trong `style.css` đều đi qua biến CSS ở khối `:root`, nên khi cần chỉnh màu dark mode, chỉ cần sửa trong khối `:root[data-theme="dark"]{ ... }` ở đầu file — không phải sửa từng thành phần.

## ⚠️ File còn thiếu: mô hình 3D (2 file, một cho mỗi theme)

Panel "Công thái học & Không dây" đã nối sẵn khung `<model-viewer>`. Ở chế độ **Pastel** nó trỏ tới `assets/Mouse1.glb`; khi bật **Dark** nó tự động đổi sang `assets/Mouse1-dark.glb` — cả hai file này **chưa có** trong dữ liệu đã gửi. Cần bổ sung:

1. Đặt file mô hình 3D bản sáng (định dạng `.glb`) vào `assets/Mouse1.glb`.
2. Đặt file mô hình 3D bản tối (ví dụ đổi màu vật liệu/nền cho hợp giao diện dark) vào `assets/Mouse1-dark.glb`.
3. Mở lại bằng Live Server — nút "Mô hình 3D" sẽ hiển thị đúng file theo theme đang bật, không cần sửa code.

Muốn đổi tên/đường dẫn file khác đi? Sửa object `MODEL_SRC` trong `script.js` (khối `initThemeToggle`):

```js
const MODEL_SRC = {
  pastel: "assets/Mouse1.glb",
  dark: "assets/Mouse1-dark.glb"
};
```

Trước khi có đủ file, bấm nút "Mô hình 3D" sẽ không hiển thị gì (khung trống) ở theme tương ứng chưa có file.

## Tuỳ chỉnh nhanh

- **Đổi màu chủ đạo**: sửa các biến ở đầu `style.css`, trong khối `:root` (`--cyan`, `--violet`, `--magenta`, `--bg`...).
- **Đổi nội dung chữ**: sửa trực tiếp trong `index.html`, mỗi slide nằm trong một thẻ `<section class="slide">`.
- **Đổi/thêm ảnh**: bỏ ảnh mới vào `assets/img/`, rồi sửa đường dẫn `src="assets/img/...">` tương ứng.
- **Thêm slide mới**: copy một khối `<section class="slide" data-index="N">...</section>`, đổi số `data-index` tăng dần, script sẽ tự nhận diện (không cần sửa `script.js`).

## Yêu cầu mạng

Trang dùng Google Fonts (Space Grotesk, Inter, JetBrains Mono) tải qua CDN — cần máy có Internet khi mở để hiển thị đúng font. Nếu mất mạng, trình duyệt sẽ tự dùng font hệ thống thay thế, bố cục và nội dung vẫn nguyên vẹn.
