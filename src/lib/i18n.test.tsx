import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { UiLangProvider } from './i18n';
import { Pagination } from '../components/Pagination';
import { FormLabel } from '../components/FormLabel';
import { UnitField } from '../components/UnitField';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StatusDot } from '../components/StatusDot';

// Without a provider the package speaks English; inside <UiLangProvider lang="fr"> every built-in text is French,
// and a label prop still wins over both.

function Boom(): never { throw new Error('boom'); }

describe('built-in text follows the language', () => {
  test('English without a provider', () => {
    render(<FormLabel text="Name" optional />);
    expect(screen.getByText('(optional)')).toBeTruthy();
  });

  test('French inside the provider', () => {
    render(<UiLangProvider lang="fr"><FormLabel text="Nom" optional /></UiLangProvider>);
    expect(screen.getByText('(facultatif)')).toBeTruthy();
  });

  test('a label prop overrides the language', () => {
    render(<UiLangProvider lang="fr"><FormLabel text="Nom" optional optionalLabel="(opt.)" /></UiLangProvider>);
    expect(screen.getByText('(opt.)')).toBeTruthy();
  });

  test('pagination speaks French', () => {
    render(<UiLangProvider lang="fr"><Pagination page={1} totalPages={3} total={120} limit={50} onPageChange={() => {}} /></UiLangProvider>);
    expect(screen.getByLabelText('Page suivante')).toBeTruthy();
    expect(screen.getByLabelText('Page précédente')).toBeTruthy();
  });

  test('the unit field has a blank option while nothing is chosen', () => {
    render(<UnitField value="" onChange={() => {}} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('');
    expect(select.options[0].value).toBe('');
  });

  test('the unit field speaks French', () => {
    render(<UiLangProvider lang="fr"><UnitField value="" onChange={() => {}} /></UiLangProvider>);
    expect(screen.getByRole('option', { name: 'Autre…' })).toBeTruthy();
  });

  test('the crash screen speaks French', () => {
    const spy = console.error;
    console.error = () => {};
    render(<UiLangProvider lang="fr"><ErrorBoundary><Boom /></ErrorBoundary></UiLangProvider>);
    console.error = spy;
    expect(screen.getByText('Recharger')).toBeTruthy();
  });

  test('the confirm dialog cancel button speaks French', () => {
    render(<UiLangProvider lang="fr"><ConfirmDialog open onClose={() => {}} title="x" message="y" /></UiLangProvider>);
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeTruthy();
  });

  test('the status dot tooltip speaks French', () => {
    render(<UiLangProvider lang="fr"><StatusDot active={false} /></UiLangProvider>);
    expect(screen.getByLabelText('Inactif : aucun accès à cette application')).toBeTruthy();
  });
});

import { Modal } from '../components/Modal';
import { SearchPicker } from '../components/SearchPicker';

describe('modal header and search picker', () => {
  test('the modal can show an eyebrow and a close button that speaks the language', () => {
    render(<UiLangProvider lang="fr"><Modal onClose={() => {}} eyebrow="Catalogue" title="Nouveau" showClose>x</Modal></UiLangProvider>);
    expect(screen.getByText('Catalogue')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Fermer' })).toBeTruthy();
  });

  test('without those props the modal looks as before', () => {
    render(<Modal onClose={() => {}} title="Plain">x</Modal>);
    expect(screen.queryByRole('button')).toBeNull();
  });

  test('the search picker clear button speaks French', () => {
    render(
      <UiLangProvider lang="fr">
        <SearchPicker groups={[]} placeholder="Chercher" value={{ id: '1', label: 'Un' }} onChange={() => {}} />
      </UiLangProvider>,
    );
    expect(screen.getByLabelText('Effacer la sélection')).toBeTruthy();
  });
});
