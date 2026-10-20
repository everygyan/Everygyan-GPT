import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { UserRole } from '../types';
import { User } from '@supabase/supabase-js';

// Mock useAuth
import * as AuthModule from '../contexts/AuthContext';

describe('Role Enforcement & Route Guard Tests', () => {
  it('blocks reader role from accessing author/editor protected routes', () => {
    // Spy on useAuth returning a reader
    const useAuthSpy = vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      user: { id: 'reader-user-1', email: 'reader@example.com' } as unknown as User,
      profile: { id: 'reader-user-1', email: 'reader@example.com', full_name: 'Reader One', role: 'reader', created_at: '' },
      role: 'reader',
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
      updateProfile: vi.fn(),
      hasRole: (roles: UserRole[]) => roles.includes('reader'),
      isAdmin: false,
      isEditor: false,
      isAuthor: false,
      isModerator: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['author', 'editor', 'admin']}>
          <div>Secret CMS Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Verify Secret CMS Content is NOT rendered
    expect(screen.queryByText('Secret CMS Content')).not.toBeInTheDocument();

    // Verify Access Restricted screen is rendered
    expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
    expect(screen.getByText(/\[reader\]/i)).toBeInTheDocument();

    useAuthSpy.mockRestore();
  });

  it('allows author role to access author protected route', () => {
    const useAuthSpy = vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      user: { id: 'author-user-1', email: 'author@example.com' } as unknown as User,
      profile: { id: 'author-user-1', email: 'author@example.com', full_name: 'Author One', role: 'author', created_at: '' },
      role: 'author',
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
      updateProfile: vi.fn(),
      hasRole: (roles: UserRole[]) => roles.includes('author'),
      isAdmin: false,
      isEditor: false,
      isAuthor: true,
      isModerator: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['author', 'editor', 'admin']}>
          <div>Author Dashboard Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Verify Author Dashboard Content IS rendered
    expect(screen.getByText('Author Dashboard Content')).toBeInTheDocument();
    expect(screen.queryByText(/Access Restricted/i)).not.toBeInTheDocument();

    useAuthSpy.mockRestore();
  });
});
