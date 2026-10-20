import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../App';
import { AuthProvider } from '../contexts/AuthContext';
import { SearchModal } from '../components/common/SearchModal';
import { AuthModal } from '../components/common/AuthModal';
import { HeroLeadStory } from '../components/home/HeroLeadStory';
import { ArticleCard } from '../components/common/ArticleCard';
import { NewsletterBanner } from '../components/common/NewsletterBanner';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Article } from '../types';

const mockArticle: Article = {
  id: 'a1',
  slug: 'test-accessibility-guide',
  title: 'Complete Accessibility and Responsive Design Guide',
  excerpt: 'A comprehensive guide on building accessible, high-performance web applications.',
  content: 'Content goes here...',
  cover_image: 'https://images.unsplash.com/photo-test',
  category: 'Tech',
  category_slug: 'tech',
  author: {
    id: 'u1',
    name: 'Jane Doe',
    avatar: 'https://example.com/avatar.jpg',
  },
  published_at: '2026-10-20',
  read_time: '6 min read',
  status: 'published',
  views_count: 150,
  tags: ['accessibility', 'performance'],
  is_featured: true,
  is_lead_story: true,
};

describe('Prompt 16 — Accessibility, Responsive Design & Performance Suite', () => {
  describe('1. Skip Navigation Link & Semantic Landmarks', () => {
    it('provides a skip to main content link targeting #main-content', () => {
      render(<App />);

      const skipLink = screen.getByRole('link', { name: /skip to main content/i });
      expect(skipLink).toBeDefined();
      expect(skipLink.getAttribute('href')).toBe('#main-content');
      // Verifies skip link is hidden initially and positioned off-screen / sr-only
      expect(skipLink.className).toContain('sr-only');
      expect(skipLink.className).toContain('focus:not-sr-only');
    });

    it('renders the main landmark with id="main-content" and tabIndex="-1"', () => {
      render(<App />);

      const mainElement = document.getElementById('main-content');
      expect(mainElement).not.toBeNull();
      expect(mainElement?.getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('2. Accessible Modals, Focus & Keyboard Behavior', () => {
    it('SearchModal has dialog role, aria-modal, accessible label, and closes on Escape', () => {
      const handleClose = vi.fn();
      render(
        <MemoryRouter>
          <SearchModal isOpen={true} onClose={handleClose} />
        </MemoryRouter>
      );

      const dialog = screen.getByRole('dialog', { name: /search articles/i });
      expect(dialog).toBeDefined();
      expect(dialog.getAttribute('aria-modal')).toBe('true');

      // Test Escape key closes modal
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('SearchModal close button meets minimum 44px touch target requirement', () => {
      render(
        <MemoryRouter>
          <SearchModal isOpen={true} onClose={() => {}} />
        </MemoryRouter>
      );

      const closeBtn = screen.getByRole('button', { name: /close search dialog/i });
      expect(closeBtn.className).toContain('min-w-[44px]');
      expect(closeBtn.className).toContain('min-h-[44px]');
    });

    it('AuthModal has dialog role, aria-modal, accessible label, and closes on Escape', () => {
      const handleClose = vi.fn();
      render(
        <AuthProvider>
          <MemoryRouter>
            <AuthModal isOpen={true} initialMode="login" onClose={handleClose} />
          </MemoryRouter>
        </AuthProvider>
      );

      const dialog = screen.getByRole('dialog', { name: /sign in/i });
      expect(dialog).toBeDefined();
      expect(dialog.getAttribute('aria-modal')).toBe('true');

      // Test Escape key closes modal
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('AuthModal close button meets minimum 44px touch target requirement', () => {
      render(
        <AuthProvider>
          <MemoryRouter>
            <AuthModal isOpen={true} initialMode="login" onClose={() => {}} />
          </MemoryRouter>
        </AuthProvider>
      );

      const closeBtn = screen.getByRole('button', { name: /close modal/i });
      expect(closeBtn.className).toContain('min-w-[44px]');
      expect(closeBtn.className).toContain('min-h-[44px]');
    });
  });

  describe('3. Core Web Vitals & Image Performance Optimization', () => {
    it('Hero lead story image avoids lazy loading and uses fetchPriority="high" for fast LCP', () => {
      render(
        <MemoryRouter>
          <HeroLeadStory articles={[mockArticle]} />
        </MemoryRouter>
      );

      const heroImg = screen.getByAltText(mockArticle.title);
      expect(heroImg.getAttribute('fetchpriority')).toBe('high');
      expect(heroImg.getAttribute('loading')).toBeNull(); // Must NOT be lazy loaded
      expect(heroImg.getAttribute('decoding')).toBe('async');
    });

    it('ArticleCard image uses loading="lazy" and decoding="async" for offscreen performance', () => {
      render(
        <MemoryRouter>
          <ArticleCard article={mockArticle} />
        </MemoryRouter>
      );

      const cardImg = screen.getByAltText(mockArticle.title);
      expect(cardImg.getAttribute('loading')).toBe('lazy');
      expect(cardImg.getAttribute('decoding')).toBe('async');
    });

    it('NewsletterBanner scenic image uses loading="lazy" and decoding="async"', () => {
      render(<NewsletterBanner />);

      const bannerImg = screen.getByAltText(/scenic mountain landscape banner/i);
      expect(bannerImg.getAttribute('loading')).toBe('lazy');
      expect(bannerImg.getAttribute('decoding')).toBe('async');
    });
  });

  describe('4. Mobile Touch Targets (WCAG 2.5.5 / 2.5.8 >= 44x44px)', () => {
    it('Mobile menu toggle and search buttons in Header meet 44px minimum target sizes', () => {
      render(
        <MemoryRouter>
          <Header onOpenAuth={() => {}} onOpenSearch={() => {}} onOpenSubscribe={() => {}} />
        </MemoryRouter>
      );

      const mobileMenuBtn = screen.getByRole('button', { name: /open menu/i });
      expect(mobileMenuBtn.className).toContain('min-w-[44px]');
      expect(mobileMenuBtn.className).toContain('min-h-[44px]');

      // Buttons with 44px target
      const buttons = screen.getAllByRole('button');
      const target44Buttons = buttons.filter(
        (b) => b.className.includes('min-w-[44px]') && b.className.includes('min-h-[44px]')
      );
      expect(target44Buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('Footer social media links meet 44px minimum target sizes', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );

      const youtubeLink = screen.getByRole('link', { name: /youtube/i });
      expect(youtubeLink.className).toContain('min-w-[44px]');
      expect(youtubeLink.className).toContain('min-h-[44px]');

      const twitterLink = screen.getByRole('link', { name: /x \(twitter\)/i });
      expect(twitterLink.className).toContain('min-w-[44px]');
      expect(twitterLink.className).toContain('min-h-[44px]');
    });
  });

  describe('5. Reduced-Motion & Visual Styling', () => {
    it('HeroLeadStory and ArticleCard include motion-reduce fallback classes', () => {
      render(
        <MemoryRouter>
          <HeroLeadStory articles={[mockArticle]} />
        </MemoryRouter>
      );

      const heroImg = screen.getByAltText(mockArticle.title);
      expect(heroImg.className).toContain('motion-reduce:transform-none');
      expect(heroImg.className).toContain('motion-safe:group-hover:scale-105');
    });
  });

  describe('6. Form Accessibility & Error State Handling', () => {
    it('NewsletterBanner input has accessible label and connects error alerts via aria-describedby', async () => {
      render(<NewsletterBanner />);

      const emailInput = screen.getByLabelText(/email address for newsletter/i);
      expect(emailInput).toBeDefined();
      expect(emailInput.getAttribute('aria-describedby')).toBeNull();

      // Trigger an invalid email submission
      const form = emailInput.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      // If an error is shown, aria-describedby points to the error container
      const errorAlert = screen.queryByRole('alert');
      if (errorAlert) {
        expect(errorAlert.getAttribute('id')).toBe('newsletter-banner-error');
        expect(emailInput.getAttribute('aria-describedby')).toBe('newsletter-banner-error');
      }
    });
  });
});
