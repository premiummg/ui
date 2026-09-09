import { ReactNode, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import type { IconType } from 'react-icons';

export interface PasswordInputProps {
  label: string;
  // react-hook-form's register() result, spread onto the input.
  registration: any;
  // Browser autofill hint - 'current-password' when signing in,
  // 'new-password' when setting one, so password managers behave.
  autoComplete?: string;
  error?: string;
  autoFocus?: boolean;
  // Optional leading icon. Best for a form of two fields on an otherwise
  // empty screen, where the fields need to be findable at a glance.
  icon?: IconType;
  // Rendered under the field, in place of the error, when there is no error
  // (e.g. a live password-length counter).
  hint?: ReactNode;
}

// Password field with a show/hide toggle. tabIndex={-1} on the button keeps
// it out of the tab order: tabbing from the password should reach Submit,
// not the eye. The icon shows the state you are IN, not the action - an open
// eye means the password is currently visible.
export function PasswordInput({
  label,
  registration,
  autoComplete = 'current-password',
  error,
  autoFocus,
  icon: Icon,
  hint,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  // registration.name (react-hook-form's register() always sets it) doubles
  // as the field id, so the visible label stays programmatically associated
  // with the input without asking callers to pass a separate id prop.
  const id = registration?.name;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
          />
        )}
        <input
          {...registration}
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={`input-field pr-10 ${Icon ? 'pl-9' : ''}`}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <FiEye size={18} /> : <FiEyeOff size={18} />}
        </button>
      </div>
      {error ? (
        <p className="mt-1 text-xs" style={{ color: 'var(--premium-red)' }}>
          {error}
        </p>
      ) : hint ? (
        <div className="mt-1.5">{hint}</div>
      ) : null}
    </div>
  );
}
