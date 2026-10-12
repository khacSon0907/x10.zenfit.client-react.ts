import CreateUserForm from './CreateUserForm';

/**
 * RegisterForm Adapter
 * Duy trì khả năng tương thích với các route hiện tại và sử dụng CreateUserForm chuẩn hóa
 */
export default function RegisterForm() {
  return <CreateUserForm />;
}
