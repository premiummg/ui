import { describe, expect, test, vi } from 'vitest';
import { render, screen, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { Toaster } from './Toaster';
import { ToastProvider, useToast, emitToast, ToastType } from './ToastContext';

const wrapper = ({ children }: { children: ReactNode }) => <ToastProvider>{children}</ToastProvider>;

describe('Toaster + ToastProvider', () => {
  test('renders nothing with no toasts', () => {
    const { container } = render(<Toaster />, { wrapper });
    expect(container).toBeEmptyDOMElement();
  });

  test('toast() adds a message that Toaster renders', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => result.current.toast('Saved successfully', 'success'));
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({ type: 'success', message: 'Saved successfully' });
  });

  test('dismiss removes a toast, including via the Toaster close button', async () => {
    function Demo() {
      const { toast } = useToast();
      return (
        <>
          <button onClick={() => toast('Hello', 'info')}>Fire</button>
          <Toaster />
        </>
      );
    }
    render(<Demo />, { wrapper });
    await userEvent.click(screen.getByText('Fire'));
    expect(screen.getByText('Hello')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '' }));
    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
  });

  test('an error toast auto-dismisses after its longer delay', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => result.current.toast('Something broke', 'error'));
    expect(result.current.toasts).toHaveLength(1);
    act(() => vi.advanceTimersByTime(6000));
    expect(result.current.toasts).toHaveLength(0);
    vi.useRealTimers();
  });

  test('emitToast reaches the mounted provider (for non-component callers)', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => emitToast('From an interceptor', 'warning'));
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({ type: 'warning', message: 'From an interceptor' });
  });

  test('emitToast is a no-op once no provider is mounted', () => {
    const { unmount } = renderHook(() => useToast(), { wrapper });
    unmount();
    expect(() => emitToast('Nobody is listening')).not.toThrow();
  });

  test('an unrecognized toast type falls back to the info style instead of crashing', async () => {
    function Demo() {
      const { toast } = useToast();
      return (
        <>
          <button onClick={() => toast('Odd toast', 'unexpected' as ToastType)}>Fire</button>
          <Toaster />
        </>
      );
    }
    render(<Demo />, { wrapper });
    await userEvent.click(screen.getByText('Fire'));
    expect(screen.getByText('Odd toast')).toBeInTheDocument();
  });
});
