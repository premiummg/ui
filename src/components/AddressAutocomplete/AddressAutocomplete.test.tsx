import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddressAutocomplete } from './AddressAutocomplete';
import { searchAddress, type AddressSuggestion } from './nominatim';

vi.mock('./nominatim', async () => {
  const actual = await vi.importActual<typeof import('./nominatim')>('./nominatim');
  return { ...actual, searchAddress: vi.fn() };
});

const mockedSearchAddress = vi.mocked(searchAddress);

const suggestion: AddressSuggestion = {
  placeId: '1',
  displayName: '123 Main St, Moncton, New Brunswick, Canada',
  street: '123 Main St',
  city: 'Moncton',
  province: 'New Brunswick',
  postalCode: 'E1C 1A1',
  lat: 46.0878,
  lng: -64.7782,
  countryCode: 'CA',
};

describe('AddressAutocomplete', () => {
  afterEach(() => {
    vi.useRealTimers();
    mockedSearchAddress.mockReset();
  });

  test('does not search until focused', () => {
    render(<AddressAutocomplete value="123 main" onChange={() => {}} onSelect={() => {}} />);
    expect(mockedSearchAddress).not.toHaveBeenCalled();
  });

  test('searches after the debounce once focused, and renders results', async () => {
    mockedSearchAddress.mockResolvedValue([suggestion]);
    render(<AddressAutocomplete value="123 main" onChange={() => {}} onSelect={() => {}} debounceMs={10} />);
    fireEvent.focus(screen.getByRole('textbox'));
    await waitFor(() => expect(mockedSearchAddress).toHaveBeenCalledWith('123 main', expect.anything()));
    expect(await screen.findByText(suggestion.displayName, { exact: false })).toBeInTheDocument();
  });

  test('picking a suggestion calls onSelect with it', async () => {
    mockedSearchAddress.mockResolvedValue([suggestion]);
    const onSelect = vi.fn();
    render(<AddressAutocomplete value="123 main" onChange={() => {}} onSelect={onSelect} debounceMs={10} />);
    fireEvent.focus(screen.getByRole('textbox'));
    const option = await screen.findByText(suggestion.displayName, { exact: false });
    await userEvent.click(option);
    expect(onSelect).toHaveBeenCalledWith(suggestion);
  });

  test('shows the loading label while a search is in flight', async () => {
    let resolveSearch: (v: AddressSuggestion[]) => void = () => {};
    mockedSearchAddress.mockReturnValue(new Promise(resolve => { resolveSearch = resolve; }));
    render(<AddressAutocomplete value="123 main" onChange={() => {}} onSelect={() => {}} debounceMs={10} searchingLabel="Chargement…" />);
    fireEvent.focus(screen.getByRole('textbox'));
    expect(await screen.findByText('Chargement…')).toBeInTheDocument();
    resolveSearch([]);
  });

  test('renders the required Nominatim attribution line', () => {
    render(<AddressAutocomplete value="" onChange={() => {}} onSelect={() => {}} />);
    expect(screen.getByText('Data from OpenStreetMap contributors')).toBeInTheDocument();
  });

  test('typing calls onChange with the raw text', async () => {
    const onChange = vi.fn();
    render(<AddressAutocomplete value="" onChange={onChange} onSelect={() => {}} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '456 Elm' } });
    expect(onChange).toHaveBeenCalledWith('456 Elm');
  });

  test('arrow keys highlight a suggestion and Enter selects it', async () => {
    const other: AddressSuggestion = { ...suggestion, placeId: '2', displayName: '789 Oak Ave, Moncton, New Brunswick, Canada' };
    mockedSearchAddress.mockResolvedValue([suggestion, other]);
    const onSelect = vi.fn();
    render(<AddressAutocomplete value="123 main" onChange={() => {}} onSelect={onSelect} debounceMs={10} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    await screen.findByText(suggestion.displayName, { exact: false });

    // First ArrowDown highlights the first option, not the second - starting
    // index is -1 (nothing highlighted), so +1 lands on 0.
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(suggestion);
  });

  test('Enter with nothing highlighted does not select anything', async () => {
    mockedSearchAddress.mockResolvedValue([suggestion]);
    const onSelect = vi.fn();
    render(<AddressAutocomplete value="123 main" onChange={() => {}} onSelect={onSelect} debounceMs={10} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    await screen.findByText(suggestion.displayName, { exact: false });

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  test('Escape closes the suggestions list', async () => {
    mockedSearchAddress.mockResolvedValue([suggestion]);
    render(<AddressAutocomplete value="123 main" onChange={() => {}} onSelect={() => {}} debounceMs={10} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    await screen.findByText(suggestion.displayName, { exact: false });

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByText(suggestion.displayName, { exact: false })).not.toBeInTheDocument();
  });
});
