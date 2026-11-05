import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArticleAudioPlayer } from '../components/article/ArticleAudioPlayer';

describe('ArticleAudioPlayer Component', () => {
  const mockArticle = {
    title: 'Exploring Alpine Glaciers',
    excerpt: 'A comprehensive journey into the icy peaks of the European Alps.',
    content:
      'The Swiss Alps provide some of the most spectacular scenery in Europe. Hiking paths wind through emerald valleys and icy glaciers.',
    read_time: '4 min read',
  };

  beforeEach(() => {
    // Mock SpeechSynthesis
    const mockSpeechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn().mockReturnValue([
        {
          name: 'Google US English',
          lang: 'en-US',
          voiceURI: 'Google US English',
          default: true,
          localService: true,
        },
        {
          name: 'Microsoft Jenny Natural',
          lang: 'en-US',
          voiceURI: 'Microsoft Jenny Natural',
          default: false,
          localService: true,
        },
      ]),
      onvoiceschanged: null,
      paused: false,
      pending: false,
      speaking: false,
    };

    // Attach to global window
    Object.defineProperty(window, 'speechSynthesis', {
      value: mockSpeechSynthesis,
      writable: true,
    });

    // Mock SpeechSynthesisUtterance constructor
    class MockUtterance {
      text: string;
      rate = 1;
      pitch = 1;
      volume = 1;
      voice: any = null;
      onend: any = null;
      onerror: any = null;
      constructor(text: string) {
        this.text = text;
      }
    }

    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: MockUtterance,
      writable: true,
    });
  });

  it('renders "Listen to this article" header and play button', () => {
    render(<ArticleAudioPlayer article={mockArticle} />);

    expect(screen.getByText(/Listen to this article/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^play$/i })).toBeInTheDocument();
    expect(screen.getByText(/1x/i)).toBeInTheDocument();
  });

  it('triggers speech synthesis when clicking play', () => {
    render(<ArticleAudioPlayer article={mockArticle} />);

    const playBtn = screen.getByRole('button', { name: /^play$/i });
    fireEvent.click(playBtn);

    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it('toggles voice settings options panel', () => {
    render(<ArticleAudioPlayer article={mockArticle} />);

    const settingsBtn = screen.getByLabelText(/Voice settings/i);
    fireEvent.click(settingsBtn);

    expect(screen.getByText(/Voice Narration Options/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Narrator Voice/i)).toBeInTheDocument();
  });

  it('toggles mute button state', () => {
    render(<ArticleAudioPlayer article={mockArticle} />);

    const muteBtn = screen.getByLabelText(/Mute/i);
    fireEvent.click(muteBtn);

    expect(screen.getByLabelText(/Unmute/i)).toBeInTheDocument();
  });
});
