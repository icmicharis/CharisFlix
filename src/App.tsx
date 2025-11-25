import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { HomePage } from '@/pages/HomePage';
import { AuthPage } from '@/pages/AuthPage';
import { UploadPage } from '@/pages/UploadPage';
import { WatchPage } from '@/pages/WatchPage';
import { ChannelPage } from '@/pages/ChannelPage';
import { SearchPage } from '@/pages/SearchPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/watch/:id" element={<WatchPage />} />
        <Route path="/channel" element={<ChannelPage />} />
        <Route path="/channel/:handle" element={<ChannelPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
      <Toaster position="top-center" />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
