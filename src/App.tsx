import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import AppRoutes from './routes/AppRoutes';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

export default function App() {
  return (
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
  );
}
