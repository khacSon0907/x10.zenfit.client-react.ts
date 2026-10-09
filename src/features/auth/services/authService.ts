// This is a placeholder for your authentication API calls
export const authService = {
  login: async (credentials: any) => {
    // Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { id: '1', name: 'John Doe', email: credentials.email } });
      }, 1000);
    });
  },

  register: async (_userData: any) => {
    // Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true }), 1000);
    });
  },

  forgotPassword: async (_email: string) => {
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000));
  },

  verifyOtp: async (_email: string, _otp: string) => {
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000));
  }
};
