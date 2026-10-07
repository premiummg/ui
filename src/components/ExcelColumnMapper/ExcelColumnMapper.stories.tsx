import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { ExcelColumnMapper } from './ExcelColumnMapper';
import { Button } from '../Button';

const meta: Meta<typeof ExcelColumnMapper> = {
  title: 'Components/ExcelColumnMapper',
  component: ExcelColumnMapper,
};
export default meta;

type Story = StoryObj<typeof ExcelColumnMapper>;

const FIELDS = [
  { key: 'name', label: 'Project name' },
  { key: 'budget', label: 'Budget' },
  { key: 'address', label: 'Address' },
  { key: 'vendor', label: 'Vendor' },
];

// Only this story's own domain knowledge - a real app's guessField usually
// knows several synonyms per field, in several languages.
function guessField(header: string): string | undefined {
  const h = header.trim().toLowerCase();
  if (/amount|montant/.test(h)) return 'budget';
  if (/client|fournisseur/.test(h)) return 'vendor';
  return undefined;
}

export const Default: Story = {
  render: () => {
    function Demo() {
      const inputRef = useRef<HTMLInputElement>(null);
      const [file, setFile] = useState<File | null>(null);
      const [result, setResult] = useState<string | null>(null);

      return (
        <div className="max-w-sm">
          <Button onClick={() => inputRef.current?.click()}>Choose an .xlsx file</Button>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={e => { setResult(null); setFile(e.target.files?.[0] ?? null); e.target.value = ''; }}
          />
          {result && <p className="mt-3 text-sm text-gray-600">{result}</p>}
          <ExcelColumnMapper
            file={file}
            fields={FIELDS}
            guessField={guessField}
            requiredFields={['name']}
            onConfirm={(rows, mapping) => {
              setResult(`Confirmed ${rows.length} row(s) with mapping ${JSON.stringify(mapping)}`);
              setFile(null);
            }}
            onCancel={() => setFile(null)}
          />
        </div>
      );
    }
    return <Demo />;
  },
};
