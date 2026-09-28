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

  register: async (userData: any) => {
    // Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true }), 1000);
    });
  },

  forgotPassword: async (email: string) => {
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000));
  },

  verifyOtp: async (email: string, otp: string) => {
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000));
  }
};
