import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App baseline smoke test', () => {
  it('renders EveryGyan brand title and tagline', () => {
    render(<App />);
    expect(screen.getByText('everygyan')).toBeInTheDocument();
    expect(screen.getByText(/Knowledge for Everyone, Everywhere/i)).toBeInTheDocument();
  });

  it('renders baseline indicator badge', () => {
    render(<App />);
    expect(screen.getByText(/Baseline OK/i)).toBeInTheDocument();
  });
});
