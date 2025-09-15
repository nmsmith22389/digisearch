import { calcTableHeight, APP_BAR_H, FOOTER_H } from '../src/lib/util/layout';
import { describe, it, expect } from 'vitest';

describe('calcTableHeight', () => {
  it('computes remaining height', () => {
    const h = calcTableHeight(100, 1000);
    expect(h).toBe(1000 - APP_BAR_H - FOOTER_H - 100);
  });
});
