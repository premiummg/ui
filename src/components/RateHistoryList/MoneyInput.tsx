import { Input, type InputProps } from '../Input';

// An amount in dollars: the field with a "$" in front. By default a number field with two decimals and no
// negatives; a field that shows its own formatting (thousands separators) passes type="text" with
// inputMode="decimal". Every native attribute passes through to the <input> (react-hook-form's register() included).
// `wrapperClassName` sizes the field (max-w-xs).
export function MoneyInput({ className = '', wrapperClassName = '', type = 'number', ...rest }: InputProps & { wrapperClassName?: string }) {
  const numeric = type === 'number' ? { step: '0.01', min: '0' } : {};
  return (
    <div className={`relative ${wrapperClassName}`.trim()}>
      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 font-heading font-bold text-gray-400">$</span>
      <Input
        type={type}
        {...numeric}
        placeholder="0.00"
        {...rest}
        className={`input-field pl-7 font-heading tabular-nums ${className}`.trim()}
      />
    </div>
  );
}
