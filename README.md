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
