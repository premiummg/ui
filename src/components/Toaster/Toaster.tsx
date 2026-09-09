import { FiCheck, FiAlertTriangle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { useToast, ToastType } from './ToastContext';

// Steel Grey is the brand book's own answer for dark chrome - a near-black
// with a blue cast appears nowhere in the brand. The coloured left edge is
// the fastest read of which variant just arrived, whether or not you're
// looking straight at it.
const CONFIG: Record<ToastType, { bg: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-(--premium-steel-grey) border-l-4 border-green-500',
    icon: <FiCheck size={15} className="text-green-400 shrink-0" />,
  },
  error: {
    bg: 'bg-(--premium-steel-grey) border-l-4 border-(--premium-red)',
    icon: <FiAlertTriangle size={15} className="text-red-400 shrink-0" />,
  },
  warning: {
    bg: 'bg-(--premium-steel-grey) border-l-4 border-(--premium-orange)',
    icon: <FiAlertCircle size={15} className="text-amber-400 shrink-0" />,
  },
  info: {
    bg: 'bg-(--premium-steel-grey) border-l-4 border-gray-400',
    icon: <FiInfo size={15} className="text-gray-300 shrink-0" />,
  },
};

// Reads from the `ToastProvider` context (wrap the app in it once, mount
// this once, call `useToast().toast(...)` anywhere). `@keyframes toast-in`
// ships in this package's styles.css.
export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => {
        const { bg, icon } = CONFIG[t.type];
        return (
          <div
            key={t.id}
            className={`${bg} text-white rounded-lg shadow-xl px-4 py-3 flex items-center gap-3 pointer-events-auto animate-in`}
            style={{ animation: 'toast-in 0.2s ease-out' }}
          >
            {icon}
            <p className="text-sm flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-gray-400 hover:text-white transition shrink-0"
            >
              <FiX size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
