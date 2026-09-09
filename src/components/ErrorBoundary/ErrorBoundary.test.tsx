import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

function Bomb({ message }: { message: string }): never {
  throw new Error(message);
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    sessionStorage.clear();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  test('shows the default fallback for a plain render error', () => {
    render(
      <ErrorBoundary>
        <Bomb message="boom" />
      </ErrorBoundary>,
    );
    expect(screen.getByText('This page could not load.')).toBeInTheDocument();
  });

  test('a custom fallback overrides the default one', () => {
    render(
      <ErrorBoundary fallback={<p>Custom fallback</p>}>
        <Bomb message="boom" />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    expect(screen.queryByText('This page could not load.')).not.toBeInTheDocument();
  });

  test('a stale-chunk error triggers exactly one reload attempt, tracked in sessionStorage', () => {
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadSpy },
      writable: true,
    });
    render(
      <ErrorBoundary>
        <Bomb message="Failed to fetch dynamically imported module" />
      </ErrorBoundary>,
    );
    expect(reloadSpy).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('chunk-reload-attempted')).toBe('1');
  });
});
