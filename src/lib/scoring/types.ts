export type Canonical = {
  mpn?: string;
  dkpn?: string;
  lifecycle?: string;
  packaging?: string;
  package?: string;
  stock?: number;
  price?: number;
  attrs: Record<string, number | string | boolean | undefined>;
  explain?: Record<string, number>;
  score?: number;
};

interface BaseCriterion<T extends string, P = unknown> {
  name: string;
  type: T;
  field: string;
  weight: number;
  params?: P;
}

export type Criterion =
  | BaseCriterion<'headroom', { min: number; prefer: number }>
  | BaseCriterion<'lower_better', { ref: number }>
  | BaseCriterion<'higher_better', { ref: number; max?: number }>
  | BaseCriterion<'lower_better_vs_target', { target: number }>
  | BaseCriterion<'stock_saturating'>
  | BaseCriterion<'nearer_is_better', { target: number; tol: number }>
  | BaseCriterion<'prefer_list', { order: string[] }>
  | BaseCriterion<'bool_bonus'>;

export type Profile = {
  id: string;
  detect?: { anyCategory?: string[]; anyColumn?: string[] };
  aliases: Record<string, string[]>;
  hard_filters?: Record<string, unknown>;
  criteria: Criterion[];
  columns: string[];
};
