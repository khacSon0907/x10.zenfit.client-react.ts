import AuthLayout from '../../../components/layout/AuthLayout';
import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout 
      title="Create an account" 
      subtitle="Start your fitness journey with Zenfit today."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
