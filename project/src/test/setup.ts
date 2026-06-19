import '@testing-library/jest-dom';

// Robust mock for localStorage to satisfy testing environment and Zustand persistence
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string): string | null => {
      return store[key] !== undefined ? store[key] : null;
    },
    setItem: (key: string, value: string): void => {
      store[key] = value ? value.toString() : '';
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    key: (index: number): string | null => {
      return Object.keys(store)[index] || null;
    },
    get length(): number {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});
