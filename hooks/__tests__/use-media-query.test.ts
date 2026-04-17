import { renderHook } from '@testing-library/react';
import { useMediaQuery } from '../use-media-query';

describe('useMediaQuery Hook - Component Testing', () => {
  let matchMediaMock: jest.Mock;
  let listeners: Array<(e: MediaQueryListEvent) => void> = [];

  beforeEach(() => {
    listeners = [];
    
    matchMediaMock = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
        listeners.push(listener);
      }),
      removeEventListener: jest.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
        listeners = listeners.filter(l => l !== listener);
      }),
      dispatchEvent: jest.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with false when media query does not match', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    expect(result.current).toBe(false);
  });

  it('should call window.matchMedia with correct query', () => {
    const query = '(min-width: 1024px)';
    renderHook(() => useMediaQuery(query));
    
    expect(matchMediaMock).toHaveBeenCalledWith(query);
  });

  it('should set up event listener', () => {
    renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    expect(listeners.length).toBe(1);
  });

  it('should handle different media queries', () => {
    const queries = [
      '(min-width: 640px)',
      '(min-width: 768px)',
      '(min-width: 1024px)',
      '(max-width: 640px)',
      '(orientation: portrait)',
    ];

    queries.forEach(query => {
      matchMediaMock.mockClear();
      renderHook(() => useMediaQuery(query));
      expect(matchMediaMock).toHaveBeenCalledWith(query);
    });
  });

  it('should cleanup event listener on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    const initialListenersCount = listeners.length;
    unmount();
    
    expect(initialListenersCount).toBe(1);
  });

  it('should handle complex media queries', () => {
    const complexQuery = '(min-width: 768px) and (max-width: 1024px)';
    renderHook(() => useMediaQuery(complexQuery));
    
    expect(matchMediaMock).toHaveBeenCalledWith(complexQuery);
  });

  it('should handle print media queries', () => {
    const printQuery = 'print';
    renderHook(() => useMediaQuery(printQuery));
    
    expect(matchMediaMock).toHaveBeenCalledWith(printQuery);
  });

  it('should handle dark mode media query', () => {
    const darkModeQuery = '(prefers-color-scheme: dark)';
    renderHook(() => useMediaQuery(darkModeQuery));
    
    expect(matchMediaMock).toHaveBeenCalledWith(darkModeQuery);
  });

  it('should handle reduced motion query', () => {
    const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
    renderHook(() => useMediaQuery(reducedMotionQuery));
    
    expect(matchMediaMock).toHaveBeenCalledWith(reducedMotionQuery);
  });

  it('should re-setup listener when query changes', () => {
    const { rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      { initialProps: { query: '(min-width: 768px)' } }
    );

    const firstCallCount = matchMediaMock.mock.calls.length;
    
    rerender({ query: '(min-width: 1024px)' });
    
    expect(matchMediaMock.mock.calls.length).toBeGreaterThan(firstCallCount);
  });
});
