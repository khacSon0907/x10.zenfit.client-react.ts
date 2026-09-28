import AuthLayout from '../../../components/layout/AuthLayout';
import ForgotPasswordForm from '../components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Enter your email to receive a password reset link."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
