import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Initialize i18n before rendering
import './i18n';

import { GoalsProvider } from './hooks/useGoals';
import { AnalyticsProvider } from './hooks/useAnalytics';
import { NotificationsProvider } from './hooks/useNotifications';
import { ThemeProvider } from './hooks/useTheme';
import App from './App.tsx';
import { ToastProvider } from './components/ui/ToastProvider';
import ErrorBoundary from './components/ErrorBoundary';


import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';

// Loading fallback for Suspense
const LoadingScreen = () => (
  <div className="min-h-screen bg-[#0c0f1a] flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-white/60">Loading...</p>
    </div>
  </div>
);

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <BrowserRouter>
          <ToastProvider>
            <ThemeProvider>
              <NotificationsProvider>
                <AuthProvider initialUser={null}>
                  <GoalsProvider>
                    <AnalyticsProvider>
                      <App />
                    </AnalyticsProvider>
                  </GoalsProvider>
                </AuthProvider>
              </NotificationsProvider>
            </ThemeProvider>
          </ToastProvider>
        </BrowserRouter>
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
);
