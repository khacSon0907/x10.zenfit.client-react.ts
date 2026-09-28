import AuthLayout from '../../../components/layout/AuthLayout';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Enter your details to access your account."
    >
      <LoginForm />
    </AuthLayout>
  );
}
