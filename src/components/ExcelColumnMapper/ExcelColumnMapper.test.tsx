import { describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
    expect(screen.getByLabelText('Field: Project name')).toHaveValue('name');
    expect(screen.getByLabelText('Field: Budget')).toHaveValue('budget');
  });

  test('a partial match also guesses on its own', async () => {
    const file = excelFile([{ 'Total Budget (CAD)': 1000 }]);
    render(<ExcelColumnMapper file={file} fields={FIELDS} onConfirm={() => {}} onCancel={() => {}} />);
    await waitFor(() => expect(screen.getByLabelText('Field: Total Budget (CAD)')).toHaveValue('budget'));
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
    await waitFor(() => expect(screen.getByLabelText('Field: Montant')).toHaveValue('budget'));
  });

  test('an unrecognized column defaults to Ignore', async () => {
    const file = excelFile([{ Whatever: 'x' }]);
    render(<ExcelColumnMapper file={file} fields={FIELDS} onConfirm={() => {}} onCancel={() => {}} />);
    await waitFor(() => expect(screen.getByLabelText('Field: Whatever')).toHaveValue(''));
  });

  test('requiredFields disables Confirm until satisfied, and the user can remap by hand', async () => {
    const onConfirm = vi.fn();
    const file = excelFile([{ 'Column A': 'Tower' }]);
    render(
      <ExcelColumnMapper file={file} fields={FIELDS} requiredFields={['name']} onConfirm={onConfirm} onCancel={() => {}} />,
    );
    await screen.findByTitle('Column A');
    expect(screen.getByText('Import').closest('button')).toBeDisabled();

    await userEvent.selectOptions(screen.getByLabelText('Field: Column A'), 'name');
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

    await userEvent.selectOptions(screen.getByLabelText('Field: Project name'), 'vendor');
    expect(onMappingChange).toHaveBeenLastCalledWith({ 'Project name': 'vendor' });
  });

  test('Confirm hands back the parsed rows and the final mapping', async () => {
    const onConfirm = vi.fn();
    const file = excelFile([{ 'Project name': 'Tower', Budget: 500 }, { 'Project name': 'House', Budget: 250 }]);
    render(<ExcelColumnMapper file={file} fields={FIELDS} onConfirm={onConfirm} onCancel={() => {}} />);
    await screen.findByTitle('Project name');

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
