import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FieldError } from './FieldError';

describe('FieldError', () => {
  test('renders nothing without a message', () => {
    const { container } = render(<FieldError />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders the message when given one', () => {
    render(<FieldError message="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});
