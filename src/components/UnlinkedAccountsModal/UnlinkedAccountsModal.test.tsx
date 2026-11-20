import { describe, expect, test, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnlinkedAccountsModal } from './UnlinkedAccountsModal';

type Acc = { id: string; name: string; email: string; app: string; division: string };
const accounts: Acc[] = [
  { id: '1', name: 'Ana Ruiz', email: 'ana@premiummg.ca', app: 'Intranet', division: 'Moncton' },
  { id: '2', name: 'Luis Paz', email: 'luis@premiummg.ca', app: 'Intranet', division: 'Halifax' },
];

function Harness({ onActivate = vi.fn(), onActivateSelected = vi.fn() }) {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <UnlinkedAccountsModal
      open
      onClose={() => {}}
      title="Accounts not yet here"
      allLinkedText="Everyone is here."
      accounts={accounts}
      appsOf={(a) => [a.app]}
      divisionsOf={(a) => [{ id: a.division, name: a.division }]}
      companiesOf={() => []}
      tagsOf={(a) => [{ key: a.app, label: `${a.app} · ${a.division}` }]}
      selectedIds={selected}
      onSelectedChange={setSelected}
      onActivate={onActivate}
      onActivateSelected={onActivateSelected}
    />
  );
}

describe('UnlinkedAccountsModal', () => {
  test('a plain word does not match the email domain', async () => {
    render(<Harness />);
    fireEvent.change(screen.getByPlaceholderText('Search name or email…'), { target: { value: 'premiummg' } });
    expect(await screen.findByText('No accounts match these filters.')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Search name or email…'), { target: { value: 'ana' } });
    expect(await screen.findByText('Ana Ruiz')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Luis Paz')).toBeNull());
  });

  test('activates one, or the selection still on screen', () => {
    const onActivate = vi.fn();
    const onActivateSelected = vi.fn();
    render(<Harness onActivate={onActivate} onActivateSelected={onActivateSelected} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Activate' })[0]);
    expect(onActivate).toHaveBeenCalledWith(accounts[0]);
    fireEvent.click(screen.getByLabelText('Select all (2)'));
    fireEvent.click(screen.getByRole('button', { name: /Activate selected \(2\)/ }));
    expect(onActivateSelected).toHaveBeenCalledWith(accounts);
    expect(screen.getByText('Intranet · Moncton')).toBeInTheDocument();
  });
});
