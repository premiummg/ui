import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Reveal } from './Reveal';

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;
  disconnected = false;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }
  observe() {}
  disconnect() { this.disconnected = true; }
  unobserve() {}
  trigger(isIntersecting: boolean) {
    this.callback([{ isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

describe('Reveal', () => {
  afterEach(() => {
    MockIntersectionObserver.instances = [];
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  test('starts hidden (opacity-0) and reveals once the observer reports intersection', () => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    render(<Reveal>content</Reveal>);
    const wrapper = screen.getByText('content');
    expect(wrapper.className).toContain('opacity-0');

    act(() => { MockIntersectionObserver.instances[0].trigger(true); });
    expect(wrapper.className).not.toContain('opacity-0');
    expect(MockIntersectionObserver.instances[0].disconnected).toBe(true);
  });

  test('the deadman-switch timeout reveals the content even if the observer never fires', () => {
    vi.useFakeTimers();
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    render(<Reveal>content</Reveal>);
    const wrapper = screen.getByText('content');
    expect(wrapper.className).toContain('opacity-0');
    act(() => { vi.advanceTimersByTime(1500); });
    expect(wrapper.className).not.toContain('opacity-0');
  });

  test('shows immediately when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<Reveal>content</Reveal>);
    expect(screen.getByText('content').className).not.toContain('opacity-0');
  });
});
