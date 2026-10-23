import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './routes/AppRoutes';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <AuthProvider>
          <AppProvider>
            <BrowserRouter>
              <Toaster richColors position="top-right" closeButton />
              <AppRoutes />
            </BrowserRouter>
          </AppProvider>
        </AuthProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
