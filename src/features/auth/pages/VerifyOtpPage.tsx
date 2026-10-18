import AuthLayout from '../../../components/layout/AuthLayout';
import OtpForm from '../components/OtpForm';

export default function VerifyOtpPage() {
  return (
    <AuthLayout
      title="Xác thực tài khoản"
      subtitle="Nhập mã OTP 6 chữ số vừa được gửi đến email của bạn để kích hoạt tài khoản."
      leftTitle="Bảo mật & Kích hoạt tài khoản"
      leftSubtitle="Hệ thống xác thực mã OTP thời gian thực giúp bảo vệ tối đa dữ liệu và tài khoản huấn luyện viên của bạn trên ZenFit."
    >
      <OtpForm />
    </AuthLayout>
  );
}
