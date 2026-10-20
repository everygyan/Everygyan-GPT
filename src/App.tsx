import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { SearchModal } from './components/common/SearchModal';
import { AuthModal } from './components/common/AuthModal';
import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { CategoryPage } from './pages/CategoryPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { DashboardArticles } from './pages/dashboard/DashboardArticles';
import { DashboardComments } from './pages/dashboard/DashboardComments';
import { DashboardSubscribers } from './pages/dashboard/DashboardSubscribers';
import { DashboardNewsletter } from './pages/dashboard/DashboardNewsletter';
import { DashboardSettings } from './pages/dashboard/DashboardSettings';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; email: string } | null>({
    name: 'Sandeep',
    role: 'author',
    email: 'sandeep@everygyan.com',
  });

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleOpenSubscribe = () => {
    const el = document.querySelector('input[type="email"]');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (el as HTMLInputElement).focus();
    } else {
      handleOpenAuth('register');
    }
  };

  return (
    <>
      {/* Search and Auth Modals */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      {isDashboardRoute ? (
        /* Dedicated Dashboard Shell */
        <DashboardLayout
          user={currentUser || { name: 'Member', role: 'reader', email: 'user@example.com' }}
          onSignOut={() => setCurrentUser(null)}
        >
          <Routes>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/dashboard/articles" element={<DashboardArticles />} />
            <Route path="/dashboard/comments" element={<DashboardComments />} />
            <Route path="/dashboard/subscribers" element={<DashboardSubscribers />} />
            <Route path="/dashboard/newsletter" element={<DashboardNewsletter />} />
            <Route path="/dashboard/settings" element={<DashboardSettings />} />
          </Routes>
        </DashboardLayout>
      ) : (
        /* Public Publication Shell */
        <div className="min-h-screen flex flex-col bg-brand-surface text-slate-900 selection:bg-red-500 selection:text-white">
          <Header
            onOpenSearch={() => setSearchOpen(true)}
            onOpenAuth={handleOpenAuth}
            onOpenSubscribe={handleOpenSubscribe}
            currentUser={currentUser}
          />

          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/article/:slug" element={<ArticlePage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      )}
    </>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
