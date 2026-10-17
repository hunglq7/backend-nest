import { ConflictException } from "@nestjs/common";
import { Repository, Not } from "typeorm";

/**
 * Hàm kiểm tra tính duy nhất dùng chung cho mọi Entity
 * @param repository Repository của TypeORM (ví dụ: donviRepository, userRepository,...)
 * @param fieldsObj Các trường cần kiểm tra (ví dụ: { ma_don_vi: '01', ten_don_vi: 'Kho' })
 * @param exceptId ID của bản ghi hiện tại cần loại trừ (dùng khi Cập nhật - Update)
 * @param labels Từ điển tên hiển thị tiếng Việt tương ứng với từng trường
 */
export async function assertUniqueFields<T extends { id: any }>(
  repository: Repository<T>,
  fieldsObj: Partial<Record<keyof T, any>>,
  exceptId?: any,
  labels?: Partial<Record<keyof T, string>>,
): Promise<void> {
  for (const [key, value] of Object.entries(fieldsObj)) {
    // Bỏ qua nếu giá trị không được truyền vào
    if (value === undefined || value === null) continue;

    // Xây dựng điều kiện tìm kiếm: { [key]: value, id: Not(exceptId) nếu có }
    const where: any = { [key]: value };
    if (exceptId !== undefined) {
      where.id = Not(exceptId);
    }

    const existing = await repository.findOne({ where });
    if (existing) {
      const fieldKey = key as keyof T;
      const label = labels?.[fieldKey] || String(key);

      throw new ConflictException({
        field: key,
        message: `${label} đã tồn tại. Vui lòng nhập ${label.toLowerCase()} khác.`,
      });
    }
  }
}

/**
 * Hàm bắt lỗi trùng lặp từ Database chung (hỗ trợ MySQL: ER_DUP_ENTRY)
 */
export function isDuplicateEntryError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }
  return (error as any).code === "ER_DUP_ENTRY";
}
