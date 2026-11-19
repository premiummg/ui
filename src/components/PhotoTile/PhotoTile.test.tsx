import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoTile } from './PhotoTile';

describe('PhotoTile', () => {
  test('renders the photo, eyebrow and caption', () => {
    render(<PhotoTile imageSrc="/a.jpg" imageAlt="Facade sealing" eyebrow="Caulking" title="Tower, Moncton" />);
    expect(screen.getByAltText('Facade sealing')).toHaveAttribute('src', '/a.jpg');
    expect(screen.getByText('Caulking')).toBeInTheDocument();
    expect(screen.getByText('Tower, Moncton')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  test('feature spans two columns and rows from md up', () => {
    const { container } = render(<PhotoTile imageSrc="/a.jpg" imageAlt="a" title="t" size="feature" />);
    expect(container.firstElementChild).toHaveClass('md:col-span-2', 'md:row-span-2');
  });

  test('with href it is a link, and a plain click goes through onClick', async () => {
    const onClick = vi.fn();
    render(<PhotoTile imageSrc="/a.jpg" imageAlt="a" title="t" href="/projects/tower" onClick={onClick} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/projects/tower');
    await userEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('with onClick and no href it is a button, and the click is not dropped', async () => {
    const onClick = vi.fn();
    render(<PhotoTile imageSrc="/a.jpg" imageAlt="a" title="t" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
