import { z } from 'zod';

/**
 * Regex kiểm tra ký tự username: 3-30 ký tự, gồm chữ, số, dấu gạch dưới,
 * có thể chứa dấu chấm nhưng không bắt đầu/kết thúc hoặc liền kề bằng dấu chấm
 */
export const USERNAME_REGEX = /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*$/;

/**
 * Regex chuẩn đầu số di động Việt Nam (Viettel, Vinaphone, Mobifone, Vietnamobile, Gmobile, Itelecom, Wintel)
 */
export const VN_PHONE_REGEX = /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9\d)\d{7}$/;

/**
 * Regex kiểm tra độ phức tạp password: 8-50 ký tự, bắt buộc gồm cả chữ và số
 */
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/;

/**
 * Schema validation cho form đăng ký tài khoản người dùng
 */
export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, 'Tên người dùng không được để trống')
      .min(3, 'Tên người dùng phải từ 3 đến 30 ký tự')
      .max(30, 'Tên người dùng phải từ 3 đến 30 ký tự')
      .refine((val) => !/\s/.test(val), 'Tên người dùng không được chứa khoảng trắng')
      .regex(
        USERNAME_REGEX,
        'Tên người dùng chỉ gồm chữ cái, số, gạch dưới và dấu chấm hợp lệ (VD: john_doe, user.99)'
      ),

    email: z
      .string()
      .trim()
      .min(1, 'Email không được để trống')
      .max(100, 'Email tối đa 100 ký tự')
      .email('Email không đúng định dạng (VD: example@domain.com)'),

    phone: z
      .string()
      .trim()
      .min(1, 'Số điện thoại không được để trống')
      .refine((val) => {
        const cleaned = val.replace(/\s+/g, '');
        return VN_PHONE_REGEX.test(cleaned);
      }, 'Số điện thoại không đúng định dạng di động Việt Nam (VD: 0912345678 hoặc +84912345678)'),

    password: z
      .string()
      .min(1, 'Mật khẩu không được để trống')
      .min(8, 'Mật khẩu phải từ 8 đến 50 ký tự')
      .max(50, 'Mật khẩu phải từ 8 đến 50 ký tự')
      .regex(PASSWORD_REGEX, 'Mật khẩu phải bao gồm cả chữ cái và số'),

    confirmPassword: z
      .string()
      .min(1, 'Vui lòng xác nhận lại mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp với mật khẩu đã nhập',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// Tương thích ngược với các component cũ
export const createUserSchema = registerSchema;
export type CreateUserForm = RegisterFormValues;
