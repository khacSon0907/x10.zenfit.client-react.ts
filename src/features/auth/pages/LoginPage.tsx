import AuthLayout from '../../../components/layout/AuthLayout';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout 
      title="Chào mừng trở lại" 
      subtitle="Nhập thông tin tài khoản của bạn để tiếp tục."
    >
      <LoginForm />
    </AuthLayout>
  );
}
