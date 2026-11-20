import { useState, type KeyboardEvent } from 'react';
import { FiX } from 'react-icons/fi';
import { Input } from '../Input';
import { Button } from '../Button';
import { useUiText } from '../../lib/i18n';

// A list of short texts typed one at a time (the options of a select field): a field with Add (Enter adds too) and
// the list as pills, each with an x to take it away. Blank entries and repeats are not added.
export interface TagListInputLabels {
  placeholder: string;
  add: string;
  remove: (value: string) => string;
}

const TEXT: { en: TagListInputLabels; fr: TagListInputLabels } = {
  en: { placeholder: 'Add option…', add: 'Add', remove: (v) => `Remove ${v}` },
  fr: { placeholder: 'Ajouter une option…', add: 'Ajouter', remove: (v) => `Retirer ${v}` },
};

export interface TagListInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  labels?: Partial<TagListInputLabels>;
}

export function TagListInput({ values, onChange, labels }: TagListInputProps) {
  const t = { ...useUiText(TEXT), ...labels };
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setDraft('');
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); add(); }
  };
  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t.placeholder}
          aria-label={t.placeholder}
          className="input-field flex-1"
        />
        <Button variant="secondary" onClick={add} disabled={!draft.trim()}>{t.add}</Button>
      </div>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 dark:bg-white/10 dark:text-gray-200">
              {v}
              <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={t.remove(v)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-100">
                <FiX size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
