import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  test('renders children', () => {
    render(<Card>hello</Card>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  test('padding defaults to false (no p-6)', () => {
    render(<Card id="c">content</Card>);
    expect(document.getElementById('c')!.className).not.toContain('p-6');
  });

  test('padding=true adds p-6', () => {
    render(
      <Card id="c" padding>
        content
      </Card>,
    );
    expect(document.getElementById('c')!.className).toContain('p-6');
  });
});
