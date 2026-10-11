# NestJS MySQL TypeORM Project

## Hướng dẫn cài đặt và khởi chạy

1. **Chuẩn bị Database MySQL:**
   Tạo cơ sở dữ liệu MySQL có tên `camera_db` (hoặc cấu hình lại trong file `.env`):
   ```sql
   CREATE DATABASE camera_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Chạy ứng dụng (Chế độ Dev):**
   ```bash
   npm run start:dev
   ```

4. **Kiểm tra các API:**
   - GET `/products`: Lấy danh sách sản phẩm
   - POST `/products`: Tạo mới sản phẩm
   - GET `/products/:id`: Chi tiết sản phẩm
   - PATCH `/products/:id`: Cập nhật sản phẩm
   - DELETE `/products/:id`: Xóa sản phẩm

## API quản lý thiết bị

Các route dưới đây cần access token như các module thiết bị hiện tại. Danh sách
dùng chung query `?page=1&limit=10&search=...` (limit tối đa 100) và trả về
`{ data, total, page, limit, totalPages }`.

### Thiết bị và thông số kỹ thuật

- CRUD thiết bị: `/thietbis` (`GET`, `POST`, `GET /:id`, `PATCH /:id`,
  `DELETE /:id`).
- Tạo thiết bị nhận `ten_thiet_bi` (bắt buộc) và các trường tùy chọn:
  `ma_thiet_bi`, `so_quan_ly`, `nhiem_vu`, `don_vi_tinh_id`,
  `ngay_dua_vao_su_dung` (ISO date), `nuoc_san_xuat`, `loai_thiet_bi_id`,
  `don_vi_id`, `khu_vuc_id`, `vi_tri_lap_dat_id`, `tai_san`, `locked`,
  `ghi_chu`, `trang_thai_thiet_bi_id`. IDs là số; `tai_san` và `locked` là
  boolean. `don_vi_nhan_id` cũng được chấp nhận cho đơn vị tiếp nhận bàn giao.
  `locked:true` chặn chỉnh sửa, xóa và các giao dịch cập nhật thiết bị; mở khóa
  bằng `PATCH /:id` với duy nhất `{ "locked": false }`. `name` vẫn được chấp
  nhận để tương thích API cũ.
- CRUD thông số thiết bị:
  `/thietbis/:deviceId/thong-so-ky-thuats` (`GET`, `POST`,
  `GET /:specId`, `PATCH /:specId`, `DELETE /:specId`). Item gồm
  `ma_thong_so`, `ten_thong_so`, `gia_tri`, `don_vi_tinh`, `locked`,
  `ghi_chu`; bắt buộc `ten_thong_so` và `gia_tri`. API tự gắn `thiet_bi_id`
  theo route và trả thêm `ma_thiet_bi` lấy từ thiết bị cha. `don_vi` được chấp
  nhận như bí danh tương thích. Thiết bị/thông số bị khóa không thể sửa hoặc xóa;
  mở khóa thông số bằng `{ "locked": false }` duy nhất.

### Danh mục

- CRUD `/loai-bao-tris`, `/loai-hieu-chuans`, `/loai-kiem-dinhs`,
  `/trang-thai-thiet-bis` (`GET`, `POST`, `GET /:id`, `PATCH /:id`,
  `DELETE /:id`).
- Item có `id`, `code`, `name`, `parent` (id mục cha cùng danh mục),
  `locked`, `notes`, `description`, `isActive`, `createdAt`, `updatedAt`.
  Tạo mới yêu cầu `code` và `name`; khóa ngăn sửa/xóa mềm cho đến khi mở khóa.
  Xóa danh mục chỉ đặt `isActive:false` để không làm mất lịch sử/tham chiếu.
- Các danh mục thiết bị và vị trí đã có sẵn tại `/loaithietbis` (body
  `ma_loai_thiet_bi`, `loai_thiet_bi`) và `/vitrilapdats` (body
  `ma_vi_tri_lap_dat`, `ten_vi_tri`).

### Giao dịch

Các collection có `GET` phân trang và `POST` tạo giao dịch:

- `/ban-giao-thiet-bi`: `thiet_bi_id` bắt buộc; hỗ trợ
  `ngay_quyet_dinh`, `don_vi_lap_id`, `so_quyet_dinh`, `don_vi_giao_id`,
  `don_vi_nhan_id`, `ngay_tiep_nhan`, `noi_dung`, `ghi_chu`. Ngày là ISO date,
  các trường đơn vị nhận id từ `/donvis`; các trường tài liệu còn lại tùy chọn.
  Bàn giao cập nhật đơn vị nhận thiết bị và ghi snapshot để hoàn tác an toàn.
- `/tiep-nhan-thiet-bi`: `POST` nên gửi
  `{ "ban_giao_id": 123, "ngay_tiep_nhan": "YYYY-MM-DD", "noi_dung": "...", "ghi_chu": "..." }`.
  `thiet_bi_id` vẫn được hỗ trợ như bí danh legacy; khi dùng, backend liên kết
  với lần bàn giao gần nhất. Chỉ tạo một receipt workflow con cho mỗi bàn giao
  đang hoạt động. Receipt bắt đầu `pending`; `PATCH /:id/approve` phê duyệt;
  `PATCH /:id/reverse` hủy tiếp nhận và hoàn tác thay đổi bàn giao nếu thiết bị
  chưa bị thay đổi sau đó. Receipt và bàn giao liên kết qua `ban_giao_id`, không
  nhân đôi hồ sơ bàn giao.
- `/di-chuyen-thiet-bi`: `thiet_bi_id`, `vi_tri_lap_dat_id` bắt buộc; hỗ trợ
  `don_vi_id`, `ngay_chung_tu`, `so_chung_tu`, `ngay_ap_dung`, `noi_dung`,
  `ghi_chu`. Việc cập nhật vị trí/đơn vị và lưu hồ sơ là nguyên tử.
- `/cap-nhat-trang-thai`: `thiet_bi_id`, `trang_thai_thiet_bi_id` bắt buộc;
  hỗ trợ `so_chung_tu`, `ngay_chung_tu`, `don_vi_lap_id`, `ngay_ap_dung`,
  `noi_dung`, `ghi_chu`. Cập nhật trạng thái và lưu hồ sơ là nguyên tử.

Ngày giao dịch nhận chuỗi ngày ISO; mỗi giao dịch lưu lịch sử và cập nhật
thiết bị trong cùng một transaction cơ sở dữ liệu. Hoàn tác tiếp nhận bị từ
chối nếu thiết bị đã thay đổi kể từ lúc duyệt, để tránh ghi đè dữ liệu mới.
