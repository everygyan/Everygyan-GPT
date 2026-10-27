import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InlineImageModal } from '../components/common/InlineImageModal';
import { renderMarkdownBlocks } from '../utils/markdownRenderer';

describe('Inline Image Insertion & Markdown Rendering', () => {
  it('renders InlineImageModal with tabs when open', () => {
    const handleClose = vi.fn();
    const handleInsert = vi.fn();

    render(
      <InlineImageModal
        isOpen={true}
        onClose={handleClose}
        onInsert={handleInsert}
      />
    );

    expect(screen.getByText(/Insert Image into Article/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload File \(Auto-WebP\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Image by URL/i })).toBeInTheDocument();
  });

  it('allows inserting an image via URL tab with custom alt text and caption', async () => {
    const handleClose = vi.fn();
    const handleInsert = vi.fn();

    render(
      <InlineImageModal
        isOpen={true}
        onClose={handleClose}
        onInsert={handleInsert}
      />
    );

    // Switch to URL tab
    const urlTabBtn = screen.getByRole('button', { name: /Image by URL/i });
    fireEvent.click(urlTabBtn);

    // Enter Image URL
    const urlInput = screen.getByPlaceholderText(/https:\/\/images\.unsplash\.com/i);
    fireEvent.change(urlInput, { target: { value: 'https://images.unsplash.com/photo-tech-sample' } });

    // Enter Alt text
    const altInput = screen.getByPlaceholderText(/e\.g\. Distributed database cluster architecture/i);
    fireEvent.change(altInput, { target: { value: 'SAP TechEd Cloud Architecture' } });

    // Enter Caption
    const captionInput = screen.getByPlaceholderText(/e\.g\. Figure 1: Event streaming replication pipeline/i);
    fireEvent.change(captionInput, { target: { value: 'Figure 1: High level Joule AI agent pipeline' } });

    // Click Insert
    const insertBtn = screen.getByRole('button', { name: /Insert into Article/i });
    expect(insertBtn).not.toBeDisabled();
    fireEvent.click(insertBtn);

    await waitFor(() => {
      expect(handleInsert).toHaveBeenCalledWith(
        expect.stringContaining('![SAP TechEd Cloud Architecture](https://images.unsplash.com/photo-tech-sample)')
      );
      expect(handleInsert).toHaveBeenCalledWith(
        expect.stringContaining('*Figure 1: High level Joule AI agent pipeline*')
      );
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('renderMarkdownBlocks parses headings, quotes, and inline images with captions', () => {
    const markdown = `# Title\n\n## Section 1\n\n> Important quote\n\n![System Diagram](https://example.com/diagram.webp)\n\n*Figure A: System architecture*`;

    const { container } = render(<div>{renderMarkdownBlocks(markdown)}</div>);

    expect(screen.getByRole('heading', { level: 1, name: /Title/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Section 1/i })).toBeInTheDocument();
    expect(screen.getByText(/Important quote/i)).toBeInTheDocument();

    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/diagram.webp');
    expect(img).toHaveAttribute('alt', 'System Diagram');

    expect(screen.getByText('Figure A: System architecture')).toBeInTheDocument();
  });
});
