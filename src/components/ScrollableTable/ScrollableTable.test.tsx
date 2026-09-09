import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollableTable } from './ScrollableTable';

describe('ScrollableTable', () => {
  test('renders its children', () => {
    render(
      <ScrollableTable>
        <table><tbody><tr><td>Row</td></tr></tbody></table>
      </ScrollableTable>,
    );
    expect(screen.getByText('Row')).toBeInTheDocument();
  });

  test('shows no nudge buttons when content does not overflow (jsdom reports 0 scroll extent)', () => {
    render(
      <ScrollableTable>
        <div>content</div>
      </ScrollableTable>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
