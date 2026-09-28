import AuthLayout from '../../../components/layout/AuthLayout';
import OtpForm from '../components/OtpForm';

export default function VerifyOtpPage() {
  return (
    <AuthLayout 
      title="Verify your email" 
      subtitle="We have sent a verification code to your email."
    >
      <OtpForm />
    </AuthLayout>
  );
}
