import { FiAlertTriangle } from 'react-icons/fi';

export interface AuthErrorProps {
  message: string;
}

// Failure is the one thing MAIN red is reserved for, so this stays red - but
// left-aligned with the fields rather than centred, and with the warning
// icon, so it reads as one specific thing that went wrong rather than as a
// banner.
export function AuthError({ message }: AuthErrorProps) {
  return (
    <div
      className="rounded-lg px-3 py-2.5 border flex gap-2.5"
      style={{ backgroundColor: 'var(--premium-red-light)', borderColor: '#FFBCC0' }}
    >
      <FiAlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--premium-red-dark)' }} />
      <p className="text-sm" style={{ color: 'var(--premium-red-dark)' }}>{message}</p>
    </div>
  );
}
