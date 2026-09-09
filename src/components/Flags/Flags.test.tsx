import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import { FlagCanada, FlagAcadian, AcadianStar } from './Flags';

describe('Flags', () => {
  test('FlagCanada renders an svg', () => {
    const { container } = render(<FlagCanada />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('FlagAcadian renders an svg', () => {
    const { container } = render(<FlagAcadian />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('AcadianStar renders an svg', () => {
    const { container } = render(<AcadianStar />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('className is applied to the svg element', () => {
    const { container } = render(<FlagCanada className="h-4 w-4" />);
    expect(container.querySelector('svg')!.getAttribute('class')).toBe('h-4 w-4');
  });
});
