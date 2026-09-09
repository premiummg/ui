import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusDot } from './StatusDot';

describe('StatusDot', () => {
  test('inactive renders gray with the inactive title', () => {
    render(<StatusDot active={false} />);
    const dot = screen.getByLabelText('Inactive - no access to this app');
    expect(dot.className).toContain('bg-gray-300');
  });

  test('active and identityActive=false renders amber with the deactivated title', () => {
    render(<StatusDot active identityActive={false} />);
    const dot = screen.getByLabelText('Deactivated across all Premium apps - cannot sign in');
    expect(dot.className).toContain('bg-[#FAAD00]');
  });

  test('active with identityActive null (unknown) renders green', () => {
    render(<StatusDot active identityActive={null} />);
    expect(screen.getByLabelText('Active').className).toContain('bg-green-500');
  });

  test('presence variant positions the dot absolutely with a ring', () => {
    render(<StatusDot active variant="presence" />);
    expect(screen.getByLabelText('Active').className).toContain('absolute');
  });
});
