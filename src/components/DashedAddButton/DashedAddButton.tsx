import { FiPlus } from 'react-icons/fi';

export interface DashedAddButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export function DashedAddButton({ label, onClick, className, disabled }: DashedAddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-gray-200 dark:border-white/20 text-sm text-gray-400 hover:border-(--premium-red) hover:text-(--premium-red) transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 dark:disabled:hover:border-gray-600 disabled:hover:text-gray-400 ${className ?? ''}`}
    >
      <FiPlus size={14} />
      {label}
    </button>
  );
}
