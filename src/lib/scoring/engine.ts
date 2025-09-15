import type { Canonical, Criterion, Profile } from './types';

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function passesHardFilters(row: Canonical, profile: Profile): boolean {
  const hf = profile.hard_filters || {};
  if (hf.lifecycle && row.lifecycle && !hf.lifecycle.includes(row.lifecycle)) return false;
  if (hf.package_allow && row.package && !hf.package_allow.includes(row.package)) return false;
  if (hf.dielectric_allow && typeof row.attrs.dielectric === 'string' && !hf.dielectric_allow.includes(String(row.attrs.dielectric))) return false;
  if (hf.min_voltage_V !== undefined) {
    const v = (row.attrs.voltage_V as number) ?? (row.attrs.max_work_V as number);
    if (typeof v === 'number' && v < hf.min_voltage_V) return false;
  }
  if (hf.max_tolerance_pct !== undefined) {
    const v = row.attrs.tol_pct as number;
    if (typeof v === 'number' && v > hf.max_tolerance_pct) return false;
  }
  return true;
}

export function subscore(c: Criterion, value: number | boolean | undefined): number {
  if (value === undefined || value === null) return 0;
  switch (c.type) {
    case 'headroom': {
      const { min, prefer } = c.params!;
      if (typeof value !== 'number') return 0;
      if (value <= min) return 0;
      if (value >= prefer) return 1;
      return clamp01((value - min) / (prefer - min));
    }
    case 'lower_better': {
      const { ref } = c.params!;
      if (typeof value !== 'number') return 0;
      return clamp01(1 - value / ref);
    }
    case 'higher_better': {
      const { ref, max } = c.params!;
      if (typeof value !== 'number') return 0;
      if (max !== undefined) return clamp01((value - ref) / (max - ref));
      return clamp01(value / ref);
    }
    case 'lower_better_vs_target': {
      const { target } = c.params!;
      if (typeof value !== 'number') return 0;
      return clamp01(1 / (1 + value / target));
    }
    case 'stock_saturating': {
      if (typeof value !== 'number') return 0;
      return clamp01(1 - Math.pow(0.5, value / 1000));
    }
    case 'nearer_is_better': {
      const { target, tol } = c.params!;
      if (typeof value !== 'number') return 0;
      const diff = Math.abs(value - target);
      if (diff >= tol) return 0;
      return clamp01(1 - diff / tol);
    }
    case 'prefer_list': {
      const { order } = c.params!;
      const idx = order.indexOf(String(value));
      if (idx === -1) return 0;
      return clamp01(1 - idx / order.length);
    }
    case 'bool_bonus': {
      return value ? 1 : 0;
    }
    default:
      return 0;
  }
}

export function scoreRow(row: Canonical, profile: Profile): Canonical {
  if (!passesHardFilters(row, profile)) {
    return { ...row, score: 0, explain: { drop: 1 } };
  }
  let total = 0;
  let weightSum = 0;
  const explain: Record<string, number> = {};
  for (const c of profile.criteria) {
    const value = (row as Record<string, unknown>)[c.field] ?? row.attrs[c.field];
    const s = subscore(c, value as number | boolean | undefined);
    explain[c.name] = Number(s.toFixed(3));
    total += s * c.weight;
    weightSum += c.weight;
  }
  const score = weightSum > 0 ? total / weightSum : 0;
  return { ...row, explain, score: Number(score.toFixed(3)) };
}
