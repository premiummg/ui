import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '', debounceMs = 350 }: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value);

  // Sync when the parent clears the field (e.g. a "clear filters" action).
  useEffect(() => {
    if (value === '') setInputValue('');
  }, [value]);

  // Debounce: call onChange after the user stops typing.
  useEffect(() => {
    const t = setTimeout(() => onChange(inputValue), debounceMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, debounceMs]);

  return (
    <div className={`relative ${className}`}>
      <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="input-field w-full pl-8 pr-8"
      />
      {inputValue && (
        <button
          onClick={() => { setInputValue(''); onChange(''); }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <FiX size={14} />
        </button>
      )}
    </div>
  );
}
