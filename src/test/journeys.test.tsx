/**
 * Critical User Journeys, Route Fallbacks, and Empty/Error States Test Suite
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';
import { fetchArticleBySlug } from '../services/articleService';
import fs from 'fs';
import path from 'path';

describe('Critical User Journeys & Route State Regression', () => {
  describe('Anonymous Article Consumption & Draft Invisibility Journey', () => {
    it('successfully fetches published article for public reading', async () => {
      const article = await fetchArticleBySlug('10-amazing-places-to-visit-in-europe-with-family');
      expect(article).not.toBeNull();
      expect(article?.title).toContain('Europe');
      expect(article?.status).toBe('published');
    });

    it('returns null for non-existent or unpublished articles', async () => {
      const article = await fetchArticleBySlug('private-unapproved-draft-article-xyz');
      expect(article).toBeNull();
    });
  });

  describe('Password Reset Lifecycle & Form Validation Journey', () => {
    it('renders password reset form and validates minimum password length', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <ResetPasswordPage />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: 'Set New Password' })).toBeInTheDocument();

      const newPasswordInput = screen.getByPlaceholderText('At least 6 characters');
      const confirmPasswordInput = screen.getByPlaceholderText('Repeat new password');
      const submitButton = screen.getByRole('button', { name: /Update Password/i });

      // Enter short password
      fireEvent.change(newPasswordInput, { target: { value: '123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
      fireEvent.click(submitButton);

      expect(await screen.findByText('Password must be at least 6 characters long.')).toBeInTheDocument();
    });

    it('validates that password and confirm password match', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <ResetPasswordPage />
          </AuthProvider>
        </MemoryRouter>
      );

      const newPasswordInput = screen.getByPlaceholderText('At least 6 characters');
      const confirmPasswordInput = screen.getByPlaceholderText('Repeat new password');
      fireEvent.change(newPasswordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
      fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

      expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    });
  });

  describe('Protected Route Role Enforcement Journey', () => {
    it('renders authentication barrier for unauthenticated visitors', async () => {
      render(
        <MemoryRouter initialEntries={['/dashboard/articles']}>
          <AuthProvider>
            <Routes>
              <Route
                path="/dashboard/articles"
                element={
                  <ProtectedRoute allowedRoles={['editor', 'admin']}>
                    <div>Protected Editorial Content</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      // Default unauthenticated state must show Authentication Required
      expect(await screen.findByText('Authentication Required')).toBeInTheDocument();
      expect(screen.queryByText('Protected Editorial Content')).toBeNull();
    });
  });

  describe('Empty and Error States Journey', () => {
    it('renders 404 NotFoundPage with return home navigation', () => {
      render(
        <MemoryRouter>
          <NotFoundPage />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Return to Home/i })).toHaveAttribute('href', '/');
    });
  });

  describe('Nested-Route Refresh & Hostinger SPA Rewrite Rules', () => {
    it('verifies public/.htaccess includes mod_rewrite SPA fallback for deep links', () => {
      const htaccessPath = path.resolve(process.cwd(), 'public', '.htaccess');
      expect(fs.existsSync(htaccessPath)).toBe(true);

      const content = fs.readFileSync(htaccessPath, 'utf8');
      expect(content).toContain('RewriteEngine On');
      expect(content).toContain('RewriteRule ^index\\.html$ - [L]');
      expect(content).toContain('RewriteCond %{REQUEST_FILENAME} !-f');
      expect(content).toContain('RewriteCond %{REQUEST_FILENAME} !-d');
      expect(content).toContain('RewriteRule . /index.html [L]');
    });

    it('verifies public/.htaccess enforces canonical HTTPS and non-www domain', () => {
      const htaccessPath = path.resolve(process.cwd(), 'public', '.htaccess');
      const content = fs.readFileSync(htaccessPath, 'utf8');
      expect(content).toContain('RewriteCond %{HTTPS} !=on');
      expect(content).toContain('RewriteCond %{HTTP_HOST} ^www\\.everygyan\\.com$ [NC]');
      expect(content).toContain('https://everygyan.com/');
    });
  });
});
