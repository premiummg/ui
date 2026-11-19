import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ItemPicker } from './ItemPicker';
import { UiLangProvider } from '../../lib/i18n';

interface Project { id: string; number: string; name: string }
const PROJECTS: Project[] = [
  { id: '1', number: 'CAU-1', name: 'Harbour tower' },
  { id: '2', number: 'DRY-7', name: 'School gym' },
];

function Picker({ selected = null, onSelect = () => {}, placeholder = 'Search projects' }: { selected?: Project | null; onSelect?: (p: Project | null) => void; placeholder?: string }) {
  return (
    <ItemPicker<Project>
      items={PROJECTS}
      selected={selected}
      onSelect={onSelect}
      getKey={p => p.id}
      matches={(p, q) => `${p.number} ${p.name}`.toLowerCase().includes(q)}
      renderOption={p => <span>{p.number} {p.name}</span>}
      renderSelected={p => <span>Chosen {p.name}</span>}
      searchPlaceholder={placeholder}
    />
  );
}

describe('ItemPicker', () => {
  test('filters with the caller own match rule and picks one', async () => {
    const onSelect = vi.fn();
    render(<Picker onSelect={onSelect} />);
    await userEvent.type(screen.getByPlaceholderText('Search projects'), 'dry-7');
    expect(screen.queryByText(/Harbour/)).toBeNull();
    await userEvent.click(screen.getByText(/School gym/));
    expect(onSelect).toHaveBeenCalledWith(PROJECTS[1]);
  });

  test('says so when nothing matches', async () => {
    render(<Picker />);
    await userEvent.type(screen.getByPlaceholderText('Search projects'), 'zzz');
    expect(screen.getByText('No matches')).toBeTruthy();
  });

  test('shows the chosen item and clears it', async () => {
    const onSelect = vi.fn();
    render(<Picker selected={PROJECTS[0]} onSelect={onSelect} />);
    expect(screen.getByText('Chosen Harbour tower')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  test('speaks French inside the provider', () => {
    render(<UiLangProvider lang="fr"><Picker selected={PROJECTS[0]} placeholder="Chercher" /></UiLangProvider>);
    expect(screen.getByRole('button', { name: 'Effacer la sélection' })).toBeTruthy();
  });

  test('Escape closes the list and is not passed on, so a Modal around it stays open', async () => {
    const outer = vi.fn();
    document.addEventListener('keydown', outer);
    render(<Picker />);
    await userEvent.click(screen.getByPlaceholderText('Search projects'));
    expect(screen.getByText(/School gym/)).toBeTruthy();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByText(/School gym/)).toBeNull();
    // Modal closes on an Escape that nobody handled: this one arrives already handled.
    expect(outer.mock.calls.every(([e]) => (e as KeyboardEvent).defaultPrevented)).toBe(true);
    document.removeEventListener('keydown', outer);
  });

  test('after clearing the chosen item, the search box has the focus', async () => {
    function Controlled() {
      const [p, setP] = useState<Project | null>(PROJECTS[0]);
      return <Picker selected={p} onSelect={setP} />;
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(document.activeElement).toBe(screen.getByPlaceholderText('Search projects'));
  });

  test('the search box is 16px, so iOS does not zoom in on it', () => {
    render(<Picker />);
    expect(screen.getByPlaceholderText('Search projects').className).toMatch(/\btext-base\b/);
  });

  test('clears the typed text', async () => {
    render(<Picker />);
    await userEvent.type(screen.getByPlaceholderText('Search projects'), 'abc');
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect((screen.getByPlaceholderText('Search projects') as HTMLInputElement).value).toBe('');
  });
});
