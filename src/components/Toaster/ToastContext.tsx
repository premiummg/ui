import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

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

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
});

export function useToast() {
  return useContext(ToastContext);
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

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}
