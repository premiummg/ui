import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormActions } from './FormActions';
import { Button } from '../Button';

describe('FormActions', () => {
  test('keeps the buttons in the order they are given, so the main one is last', () => {
    render(<FormActions><Button variant="secondary">Cancel</Button><Button type="submit">Save</Button></FormActions>);
    const buttons = screen.getAllByRole('button').map(b => b.textContent);
    expect(buttons).toEqual(['Cancel', 'Save']);
  });

  test('a submit button inside it submits the form it is in', () => {
    render(<form><FormActions><Button type="submit">Save</Button></FormActions></form>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit');
  });
});
