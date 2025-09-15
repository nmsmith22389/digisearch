import type { Canonical, Criterion, Profile } from './types';

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function passesHardFilters(row: Canonical, profile: Profile): boolean {
  const hf = (profile.hard_filters ?? {}) as { [k: string]: unknown };
  if (Array.isArray(hf.lifecycle) && row.lifecycle && !(hf.lifecycle as string[]).includes(row.lifecycle)) return false;
  if (Array.isArray(hf.package_allow) && row.package) {
    const pkg = row.package.toLowerCase();
    const ok = (hf.package_allow as string[]).some((p) => pkg.includes(p.toLowerCase()));
    if (!ok) return false;
  }
  if (Array.isArray(hf.dielectric_allow) && typeof row.attrs.dielectric === 'string') {
    const diel = String(row.attrs.dielectric).toLowerCase();
    const ok = (hf.dielectric_allow as string[]).some((d) => diel.includes(d.toLowerCase()));
    if (!ok) return false;
  }
  if (typeof hf.min_voltage_V === 'number') {
    const v = (row.attrs.voltage_V as number) ?? (row.attrs.max_work_V as number);
    if (typeof v === 'number' && v < (hf.min_voltage_V as number)) return false;
  }
  if (typeof hf.max_tolerance_pct === 'number') {
    const v = row.attrs.tol_pct as number;
    if (typeof v === 'number' && v > (hf.max_tolerance_pct as number)) return false;
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
