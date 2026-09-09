import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FieldGroup } from './FieldGroup';

describe('FieldGroup', () => {
  test('renders the title and children', () => {
    render(<FieldGroup title="Compensation">Fields go here</FieldGroup>);
    expect(screen.getByText('Compensation')).toBeInTheDocument();
    expect(screen.getByText('Fields go here')).toBeInTheDocument();
  });

  test('renders the note only when given one', () => {
    const { rerender } = render(<FieldGroup title="Compensation">Fields</FieldGroup>);
    expect(screen.queryByText('Visible to admins only.')).not.toBeInTheDocument();
    rerender(
      <FieldGroup title="Compensation" note="Visible to admins only.">
        Fields
      </FieldGroup>,
    );
    expect(screen.getByText('Visible to admins only.')).toBeInTheDocument();
  });
});
