/**
 * Tiện ích kiểm tra hạn sử dụng của JWT Token
 */
export function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    // Buffer an toàn 30 giây trước khi hết hạn chính thức
    return Date.now() >= payload.exp * 1000 - 30000;
  } catch {
    return true;
  }
}

