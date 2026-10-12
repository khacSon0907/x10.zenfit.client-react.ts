import AuthLayout from '../../../components/layout/AuthLayout';
import ForgotPasswordForm from '../components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout 
      title="Khôi phục mật khẩu" 
      subtitle="Nhập email của bạn để nhận liên kết đặt lại mật khẩu."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
