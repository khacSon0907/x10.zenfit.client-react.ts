import { z } from 'zod';

/**
 * Regex kiểm tra ký tự username: chỉ cho phép chữ cái (a-z, A-Z), số (0-9), gạch dưới (_) và chấm (.)
 */
const USERNAME_REGEX = /^[a-zA-Z0-9_.]+$/;

/**
 * Regex kiểm tra độ phức tạp password: bắt buộc có ít nhất 1 chữ cái và 1 số
 */
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/;

/**
 * Schema validation cho form tạo tài khoản người dùng
 * Tuân thủ 100% rule và thông báo lỗi tiếng Việt khớp với Backend
 */
export const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Tên người dùng không được để trống')
    .min(3, 'Tên người dùng phải từ 3 đến 30 ký tự')
    .max(30, 'Tên người dùng phải từ 3 đến 30 ký tự')
    .regex(USERNAME_REGEX, 'Tên người dùng chỉ được chứa chữ, số, dấu gạch dưới và dấu chấm'),

  phone: z
    .string()
    .trim()
    .min(1, 'Số điện thoại không được để trống')
    .refine((val) => {
      const cleaned = val.replace(/\s+/g, '');
      return /^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(cleaned);
    }, 'Số điện thoại không hợp lệ (VD: 0912345678)'),

  email: z
    .string()
    .trim()
    .min(1, 'Email không được để trống')
    .max(100, 'Email tối đa 100 ký tự')
    .email('Email không hợp lệ'),

  password: z
    .string()
    // TUYỆT ĐỐI KHÔNG TRIM PASSWORD
    .min(1, 'Mật khẩu không được để trống')
    .min(8, 'Mật khẩu phải từ 8 đến 50 ký tự')
    .max(50, 'Mật khẩu phải từ 8 đến 50 ký tự')
    .regex(PASSWORD_REGEX, 'Mật khẩu phải chứa cả chữ và số'),
});

export type CreateUserForm = z.infer<typeof createUserSchema>;
