import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { fetchArticleBySlug, fetchAllPublicArticles } from './services/articleService';

describe('EveryGyan Visual System & Public Shell Tests', () => {
  it('renders EveryGyan brand mark and official tagline in the header', async () => {
    render(<App />);
    const brandElements = await screen.findAllByText(/every/i);
    expect(brandElements.length).toBeGreaterThan(0);
    const taglines = screen.getAllByText(/Knowledge for Everyone, Everywhere/i);
    expect(taglines.length).toBeGreaterThan(0);
  });

  it('renders primary public navigation links', async () => {
    render(<App />);
    const navNews = screen.getAllByRole('link', { name: /Latest News/i });
    expect(navNews.length).toBeGreaterThan(0);
    const navLearning = screen.getAllByRole('link', { name: /Learning/i });
    expect(navLearning.length).toBeGreaterThan(0);
    const navTravel = screen.getAllByRole('link', { name: /Travel/i });
    expect(navTravel.length).toBeGreaterThan(0);
  });

  it('renders the prominent lead story and Latest News section', async () => {
    render(<App />);
    const leadStory = await screen.findByText(/10 Amazing Places to Visit in Europe with Family/i);
    expect(leadStory).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Latest News/i })).toBeInTheDocument();
  });

  it('renders category pill options', async () => {
    render(<App />);
    await waitFor(() => {
      const techElements = screen.getAllByText('Tech');
      expect(techElements.length).toBeGreaterThan(0);
    });
    const healthElements = screen.getAllByText('Health');
    expect(healthElements.length).toBeGreaterThan(0);
  });

  it('renders the Featured Articles section heading and cards', async () => {
    render(<App />);
    const featuredHeading = await screen.findByText(/Featured Articles/i);
    expect(featuredHeading).toBeInTheDocument();
    const featuredStory = await screen.findByText(/Best Laptops for Students in 2026/i);
    expect(featuredStory).toBeInTheDocument();
  });

  it('renders the scenic newsletter CTA band', async () => {
    render(<App />);
    expect(screen.getByText(/Join Our Newsletter/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your email address/i)).toBeInTheDocument();
    const subscribeButtons = screen.getAllByRole('button', { name: /Subscribe/i });
    expect(subscribeButtons.length).toBeGreaterThan(0);
  });

  it('renders the dark navy footer with legal links and copyright', async () => {
    render(<App />);
    expect(screen.getByText(/© 2026 EveryGyan. All rights reserved./i)).toBeInTheDocument();
    const privacyLinks = screen.getAllByRole('link', { name: /Privacy Policy/i });
    expect(privacyLinks.length).toBeGreaterThan(0);
  });
});

describe('Public Security & Reader Data Isolation Tests', () => {
  it('strictly isolates drafts: anonymous readers cannot fetch draft content', async () => {
    const draftArticle = await fetchArticleBySlug('test-draft-secret-slug');
    expect(draftArticle).toBeNull();
  });

  it('fetchAllPublicArticles returns only articles with status === "published"', async () => {
    const articles = await fetchAllPublicArticles();
    expect(articles.length).toBeGreaterThan(0);
    articles.forEach((art) => {
      expect(art.status).toBe('published');
    });
  });

  it('does not leak sensitive user secrets in article author payloads', async () => {
    const articles = await fetchAllPublicArticles();
    articles.forEach((art) => {
      expect(art.author).toBeDefined();
      const authorRecord = art.author as Record<string, unknown>;
      expect(authorRecord['password']).toBeUndefined();
      expect(authorRecord['email']).toBeUndefined();
      expect(authorRecord['service_role']).toBeUndefined();
    });
  });
});
