import AuthLayout from '../../../components/layout/AuthLayout';
import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout 
      title="Tạo tài khoản mới" 
      subtitle="Bắt đầu hành trình sống khỏe cùng Zenfit ngay hôm nay."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
