import AuthLayout from '../../../components/layout/AuthLayout';
import OtpForm from '../components/OtpForm';

export default function VerifyOtpPage() {
  return (
    <AuthLayout 
      title="Xác thực mã OTP" 
      subtitle="Chúng tôi đã gửi mã xác thực 6 số đến email của bạn."
    >
      <OtpForm />
    </AuthLayout>
  );
}
