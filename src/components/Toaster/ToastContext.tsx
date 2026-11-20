import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export interface ToastContextValue {
  toasts: Toast[];
  toast: (message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
}

// Two contexts: the actions never change, the list changes with every toast. A component that only calls toast() reads
// the first and is not drawn again each time a toast appears or goes; only the Toaster reads the list.
type ToastActions = Pick<ToastContextValue, 'toast' | 'dismiss'>;
const ToastActionsContext = createContext<ToastActions & { latest: { current: Toast[] } }>({
  toast: () => {},
  dismiss: () => {},
  latest: { current: [] },
});
const ToastListContext = createContext<Toast[]>([]);

// `toasts` here is the list as it is when read, not a value that redraws the caller when it changes: a component that
// shows the toasts uses useToastList.
export function useToast(): ToastContextValue {
  const { toast, dismiss, latest } = useContext(ToastActionsContext);
  return useMemo(() => ({ toast, dismiss, get toasts() { return latest.current; } }), [toast, dismiss, latest]);
}

// The toasts on screen, redrawing the caller whenever one appears or goes (the Toaster).
export function useToastList(): Toast[] {
  return useContext(ToastListContext);
}

let counter = 0;

// Non-component code (an axios interceptor, a top-level error handler) can't
// call useToast - but a response every page handles the same way (a rate
// limit, a lost connection) belongs on screen once, from the one place that
// sees every response, not repeated in each caller's catch block. The
// provider registers itself here on mount; before that, and after unmount,
// this is a no-op rather than a crash.
let externalToast: ((message: string, type: ToastType) => void) | null = null;

export function emitToast(message: string, type: ToastType = 'info') {
  externalToast?.(message, type);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${++counter}`;
    setToasts(prev => [...prev, { id, type, message }]);
    const delay = type === 'error' ? 6000 : 4000;
    timers.current[id] = setTimeout(() => dismiss(id), delay);
  }, [dismiss]);

  useEffect(() => {
    externalToast = toast;
    return () => { externalToast = null; };
  }, [toast]);

  // Timers still pending when the provider goes away would call setState on nothing.
  useEffect(() => {
    const pending = timers.current;
    return () => { Object.values(pending).forEach(clearTimeout); };
  }, []);

  const latest = useRef<Toast[]>(toasts);
  latest.current = toasts;
  const actions = useMemo(() => ({ toast, dismiss, latest }), [toast, dismiss]);

  return (
    <ToastActionsContext.Provider value={actions}>
      <ToastListContext.Provider value={toasts}>
        {children}
      </ToastListContext.Provider>
    </ToastActionsContext.Provider>
  );
}
