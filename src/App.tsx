import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { SearchModal } from './components/common/SearchModal';
import { AuthModal } from './components/common/AuthModal';
import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { CategoryPage } from './pages/CategoryPage';
import { TagPage } from './pages/TagPage';
import { SearchPage } from './pages/SearchPage';
import { AboutPage } from './pages/AboutPage';
import { DealsPage } from './pages/DealsPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { NewsletterConfirmPage } from './pages/NewsletterConfirmPage';
import { UnsubscribePage } from './pages/UnsubscribePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';

// Code-split dashboard routes so anonymous visitors never download internal CMS chunks
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome').then((m) => ({ default: m.DashboardHome })));
const DashboardArticles = lazy(() => import('./pages/dashboard/DashboardArticles').then((m) => ({ default: m.DashboardArticles })));
const ArticleEditor = lazy(() => import('./pages/dashboard/ArticleEditor').then((m) => ({ default: m.ArticleEditor })));
const DashboardComments = lazy(() => import('./pages/dashboard/DashboardComments').then((m) => ({ default: m.DashboardComments })));
const DashboardSubscribers = lazy(() => import('./pages/dashboard/DashboardSubscribers').then((m) => ({ default: m.DashboardSubscribers })));
const DashboardNewsletter = lazy(() => import('./pages/dashboard/DashboardNewsletter').then((m) => ({ default: m.DashboardNewsletter })));
const DashboardSettings = lazy(() => import('./pages/dashboard/DashboardSettings').then((m) => ({ default: m.DashboardSettings })));

const DashboardLoadingFallback: React.FC = () => (
  <div className="py-24 flex flex-col items-center justify-center gap-3">
    <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    <p className="text-xs text-slate-500 font-medium">Loading editorial workspace...</p>
  </div>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const { user, profile, role, signOut } = useAuth();

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

  const currentUserData = user
    ? {
        name: profile?.full_name || user.email?.split('@')[0] || 'Member',
        role: role,
        email: user.email || '',
      }
    : null;

  return (
    <>
      {/* Search and Auth Modals */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />

      {isDashboardRoute ? (
        /* Protected Editorial Dashboard Shell */
        <DashboardLayout
          user={currentUserData || { name: 'Member', role: 'reader', email: '' }}
          onSignOut={signOut}
        >
          <Suspense fallback={<DashboardLoadingFallback />}>
            <Routes>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/articles"
                element={
                  <ProtectedRoute allowedRoles={['author', 'editor', 'admin']}>
                    <DashboardArticles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/articles/new"
                element={
                  <ProtectedRoute allowedRoles={['author', 'editor', 'admin']}>
                    <ArticleEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/articles/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['author', 'editor', 'admin']}>
                    <ArticleEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/comments"
                element={
                  <ProtectedRoute allowedRoles={['moderator', 'editor', 'admin']}>
                    <DashboardComments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/subscribers"
                element={
                  <ProtectedRoute allowedRoles={['editor', 'admin']}>
                    <DashboardSubscribers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/newsletter"
                element={
                  <ProtectedRoute allowedRoles={['editor', 'admin']}>
                    <DashboardNewsletter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/settings"
                element={
                  <ProtectedRoute>
                    <DashboardSettings />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </DashboardLayout>
      ) : (
        /* Public Publication Shell */
        <div className="min-h-screen flex flex-col bg-brand-surface text-slate-900 selection:bg-red-500 selection:text-white">
          {/* Accessible Skip Navigation Link */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-red-600 focus:text-white focus:font-semibold focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
          >
            Skip to main content
          </a>

          <Header
            onOpenSearch={() => setSearchOpen(true)}
            onOpenAuth={handleOpenAuth}
            onOpenSubscribe={handleOpenSubscribe}
            currentUser={currentUserData}
          />

          <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full outline-none">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/article/:slug" element={<ArticlePage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/tag/:slug" element={<TagPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/newsletter/confirm" element={<NewsletterConfirmPage />} />
              <Route path="/unsubscribe" element={<UnsubscribePage />} />
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
