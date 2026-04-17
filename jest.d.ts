/// <reference types="@testing-library/jest-dom" />

// Extend Jest matchers with @testing-library/jest-dom
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeDisabled(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(...classNames: string[]): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeChecked(): R;
      toHaveValue(value: string | string[] | number): R;
    }
  }
}
