import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from './page';

describe('home page', () => {
  it('renders the project introduction and primary section', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /cada álbum tem uma história/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /conheça o projeto/i })).toHaveAttribute(
      'href',
      '#como-funciona',
    );
  });
});
