import { describe, it, expect } from 'vitest';
import { subscore, passesHardFilters, scoreRow } from '../src/lib/scoring/engine';
import type { Criterion, Canonical, Profile } from '../src/lib/scoring/types';

describe('scoring primitives', () => {
  it('headroom', () => {
    const c: Criterion = { name: 'p', type: 'headroom', field: 'f', weight: 1, params: { min: 1, prefer: 2 } };
    expect(subscore(c, 0.5)).toBe(0);
    expect(subscore(c, 1.5)).toBeCloseTo(0.5);
    expect(subscore(c, 3)).toBe(1);
  });
  it('lower_better', () => {
    const c: Criterion = { name: 'l', type: 'lower_better', field: 'f', weight: 1, params: { ref: 10 } };
    expect(subscore(c, 5)).toBeCloseTo(0.5);
  });
  it('higher_better', () => {
    const c: Criterion = { name: 'h', type: 'higher_better', field: 'f', weight: 1, params: { ref: 10, max: 20 } };
    expect(subscore(c, 15)).toBeCloseTo(0.5);
  });
  it('lower_better_vs_target', () => {
    const c: Criterion = { name: 't', type: 'lower_better_vs_target', field: 'f', weight: 1, params: { target: 5 } };
    expect(subscore(c, 5)).toBeCloseTo(1 / (1 + 1));
  });
  it('stock_saturating', () => {
    const c: Criterion = { name: 's', type: 'stock_saturating', field: 'f', weight: 1 };
    expect(subscore(c, 0)).toBe(0);
    expect(subscore(c, 1000)).toBeCloseTo(0.5, 1);
  });
  it('nearer_is_better', () => {
    const c: Criterion = { name: 'n', type: 'nearer_is_better', field: 'f', weight: 1, params: { target: 10, tol: 5 } };
    expect(subscore(c, 10)).toBe(1);
    expect(subscore(c, 15)).toBe(0);
  });
  it('prefer_list', () => {
    const c: Criterion = { name: 'p', type: 'prefer_list', field: 'f', weight: 1, params: { order: ['a', 'b'] } };
    expect(subscore(c, 'a')).toBe(1);
    expect(subscore(c, 'b')).toBe(0.5);
  });
  it('bool_bonus', () => {
    const c: Criterion = { name: 'b', type: 'bool_bonus', field: 'f', weight: 1 };
    expect(subscore(c, true)).toBe(1);
    expect(subscore(c, false)).toBe(0);
  });
});

describe('hard filters', () => {
  it('drops non-active', () => {
    const profile: Profile = { id: 'x', aliases: {}, criteria: [], columns: [], hard_filters: { lifecycle: ['Active'] } };
    const row: Canonical = { lifecycle: 'Obsolete', attrs: {} };
    expect(passesHardFilters(row, profile)).toBe(false);
    const scored = scoreRow(row, profile);
    expect(scored.score).toBe(0);
    expect(scored.explain?.drop).toBe(1);
  });
});
