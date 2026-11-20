import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingState, EmptyState } from './LoadingState';
import { UiLangProvider } from '../../lib/i18n';

describe('LoadingState and EmptyState', () => {
  test('say the built-in text in the app language, or what the caller passes', () => {
    render(<UiLangProvider lang="fr"><LoadingState /><EmptyState>No rows</EmptyState></UiLangProvider>);
    expect(screen.getByRole('status')).toHaveTextContent('Chargement...');
    expect(screen.getByText('No rows')).toBeInTheDocument();
  });

  test('size sets the room around the line', () => {
    render(<LoadingState size="page" />);
    expect(screen.getByRole('status').className).toContain('py-16');
  });
});
