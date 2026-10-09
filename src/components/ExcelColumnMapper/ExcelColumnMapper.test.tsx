import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as XLSX from 'xlsx';
import { ExcelColumnMapper, ExcelColumnMapperField } from './ExcelColumnMapper';

const FIELDS: ExcelColumnMapperField[] = [
  { key: 'name', label: 'Project name' },
  { key: 'budget', label: 'Budget' },
  { key: 'vendor', label: 'Vendor' },
];

function excelFile(rows: Record<string, unknown>[], name = 'test.xlsx'): File {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new File([buf], name, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

// Each row's picker wrapper carries its own "Field: <header>" title, distinct
// from the header cell's own title (just the header text) - everything below
// scopes through that rather than matching on label text, which a guessed
// field and its own column header can coincidentally share (e.g. a column
// actually named "Project name").
function pickerFor(header: string): HTMLElement {
  return screen.getByTitle(`Field: ${header}`);
}

// null when the picker is showing its placeholder (nothing mapped - SearchPicker
// has no selected chip to render), the chip's label text otherwise.
function mappedLabel(header: string): string | null {
  const chip = within(pickerFor(header)).queryByText((_, el) => el?.tagName === 'P' && el.className.includes('font-medium'));
  return chip?.textContent ?? null;
}

async function pickField(header: string, fieldLabel: string) {
  const wrapper = pickerFor(header);
  // A value already selected renders as a chip + clear button, not a text
  // box - clearing it first is what reopens the search input.
  const clearBtn = within(wrapper).queryByRole('button');
  if (clearBtn) await userEvent.click(clearBtn);
  const input = within(wrapper).getByRole('textbox');
  await userEvent.click(input);
  await userEvent.type(input, fieldLabel);
  await userEvent.click(await within(wrapper).findByText(fieldLabel));
}

describe('ExcelColumnMapper', () => {
  test('renders nothing when file is null', () => {
    render(
      <ExcelColumnMapper file={null} fields={FIELDS} onConfirm={() => {}} onCancel={() => {}} />,
    );
    expect(screen.queryByText('Map the columns')).not.toBeInTheDocument();
  });

  test('guesses an exact label match on its own, with no guessField given', async () => {
    const file = excelFile([{ 'Project name': 'Tower', Budget: 1000 }]);
    render(<ExcelColumnMapper file={file} fields={FIELDS} onConfirm={() => {}} onCancel={() => {}} />);
    expect(await screen.findByTitle('Project name')).toBeInTheDocument();
    await waitFor(() => expect(mappedLabel('Project name')).toBe('Project name'));
    expect(mappedLabel('Budget')).toBe('Budget');
  });

  test('a partial match also guesses on its own', async () => {
    const file = excelFile([{ 'Total Budget (CAD)': 1000 }]);
    render(<ExcelColumnMapper file={file} fields={FIELDS} onConfirm={() => {}} onCancel={() => {}} />);
    await waitFor(() => expect(mappedLabel('Total Budget (CAD)')).toBe('Budget'));
  });

  test("the caller's guessField wins over this component's own guess", async () => {
    const file = excelFile([{ Montant: 1000 }]);
    render(
      <ExcelColumnMapper
        file={file}
        fields={FIELDS}
        guessField={h => (/montant/i.test(h) ? 'budget' : undefined)}
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    await waitFor(() => expect(mappedLabel('Montant')).toBe('Budget'));
  });

  test('an unrecognized column defaults to Ignore', async () => {
    const file = excelFile([{ Whatever: 'x' }]);
    render(<ExcelColumnMapper file={file} fields={FIELDS} onConfirm={() => {}} onCancel={() => {}} />);
    await screen.findByTitle('Whatever');
    expect(mappedLabel('Whatever')).toBeNull();
    expect(within(pickerFor('Whatever')).getByPlaceholderText('Ignore')).toBeInTheDocument();
  });

  test('requiredFields disables Confirm until satisfied, and the user can remap by hand', async () => {
    const onConfirm = vi.fn();
    const file = excelFile([{ 'Column A': 'Tower' }]);
    render(
      <ExcelColumnMapper file={file} fields={FIELDS} requiredFields={['name']} onConfirm={onConfirm} onCancel={() => {}} />,
    );
    await screen.findByTitle('Column A');
    expect(screen.getByText('Import').closest('button')).toBeDisabled();

    await pickField('Column A', 'Project name');
    expect(screen.getByText('Import').closest('button')).not.toBeDisabled();
  });

  test('confirmDisabled from the caller disables Confirm even when requiredFields is satisfied', async () => {
    const file = excelFile([{ 'Project name': 'Tower' }]);
    render(
      <ExcelColumnMapper file={file} fields={FIELDS} requiredFields={['name']} confirmDisabled onConfirm={() => {}} onCancel={() => {}} />,
    );
    await screen.findByTitle('Project name');
    expect(screen.getByText('Import').closest('button')).toBeDisabled();
  });

  test('onMappingChange fires with the guessed mapping, then with each manual change', async () => {
    const onMappingChange = vi.fn();
    const file = excelFile([{ 'Project name': 'Tower' }]);
    render(
      <ExcelColumnMapper file={file} fields={FIELDS} onMappingChange={onMappingChange} onConfirm={() => {}} onCancel={() => {}} />,
    );
    await waitFor(() => expect(onMappingChange).toHaveBeenCalledWith({ 'Project name': 'name' }));

    await pickField('Project name', 'Vendor');
    expect(onMappingChange).toHaveBeenLastCalledWith({ 'Project name': 'vendor' });
  });

  test('two columns that would both guess the same field only assign it to the first', async () => {
    const file = excelFile([{ 'Project Name': 'Tower', 'Received From (Client Info)': 'Acme' }]);
    render(
      <ExcelColumnMapper
        file={file}
        fields={FIELDS}
        guessField={h => (/project name|received from/i.test(h) ? 'name' : undefined)}
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    await screen.findByTitle('Project Name');
    await waitFor(() => expect(mappedLabel('Project Name')).toBe('Project name'));
    expect(mappedLabel('Received From (Client Info)')).toBeNull();
  });

  test('a field already assigned to one column is not offered to any other', async () => {
    const file = excelFile([{ 'Column A': 'Tower', 'Column B': 'Acme' }]);
    render(<ExcelColumnMapper file={file} fields={FIELDS} onConfirm={() => {}} onCancel={() => {}} />);
    await screen.findByTitle('Column A');

    await pickField('Column A', 'Project name');
    expect(mappedLabel('Column A')).toBe('Project name');

    const wrapperB = pickerFor('Column B');
    const input = within(wrapperB).getByRole('textbox');
    await userEvent.click(input);
    await userEvent.type(input, 'Project name');
    expect(within(wrapperB).queryByText('Project name')).not.toBeInTheDocument();
  });

  test('Confirm hands back the parsed rows and the final mapping', async () => {
    const onConfirm = vi.fn();
    const file = excelFile([{ 'Project name': 'Tower', Budget: 500 }, { 'Project name': 'House', Budget: 250 }]);
    render(<ExcelColumnMapper file={file} fields={FIELDS} onConfirm={onConfirm} onCancel={() => {}} />);
    await screen.findByTitle('Project name');
    await waitFor(() => expect(mappedLabel('Budget')).toBe('Budget'));

    await userEvent.click(screen.getByText('Import'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    const [rows, mapping] = onConfirm.mock.calls[0];
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ 'Project name': 'Tower', Budget: 500 });
    expect(mapping).toEqual({ 'Project name': 'name', Budget: 'budget' });
  });

  test('Cancel calls onCancel without calling onConfirm', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const file = excelFile([{ 'Project name': 'Tower' }]);
    render(<ExcelColumnMapper file={file} fields={FIELDS} onConfirm={onConfirm} onCancel={onCancel} />);
    await screen.findByTitle('Project name');

    await userEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test('a file with no rows shows the empty-file message instead of the mapping table', async () => {
    const file = excelFile([]);
    render(<ExcelColumnMapper file={file} fields={FIELDS} onConfirm={() => {}} onCancel={() => {}} />);
    expect(await screen.findByText('This file has no rows.')).toBeInTheDocument();
  });

  test('a file that fails to parse shows the invalid-file message', async () => {
    // XLSX.read is lenient about plain text (it lands in "no rows" rather
    // than throwing) - a truncated zip header (every .xlsx IS a zip) is
    // what actually makes it throw.
    const file = new File([new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1, 2, 3, 4, 5])], 'broken.xlsx');
    render(<ExcelColumnMapper file={file} fields={FIELDS} onConfirm={() => {}} onCancel={() => {}} />);
    expect(await screen.findByText(/Could not read this file/)).toBeInTheDocument();
  });
});
