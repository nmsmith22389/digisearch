import { parseQty } from '../units/parseQty';
import type { Canonical, Profile } from '../scoring/types';

function normKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function buildAliasMap(profile: Profile): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [key, aliases] of Object.entries(profile.aliases)) {
    for (const a of aliases) {
      map[normKey(a)] = key;
    }
  }
  return map;
}

export function normalizeRow(
  row: Record<string, string>,
  profile: Profile,
  priceQty = 1
): Canonical {
  const lowerRow: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    lowerRow[normKey(k)] = v;
  }
  const entries = Object.entries(lowerRow);
  const get = (canon: string): string | undefined => {
    const aliases = profile.aliases[canon];
    if (!aliases) return undefined;
    const keys = aliases.map((a) => normKey(a));
    const findByKey = (target: string): string | undefined => {
      const exact = lowerRow[target];
      if (exact !== undefined) return exact;
      const found = entries.find(([k]) => k.startsWith(target));
      return found ? found[1] : undefined;
    };
    if (canon === 'price') {
      const qtyKey = normKey(`price ${priceQty}`);
      const qtyVal = findByKey(qtyKey);
      if (qtyVal !== undefined) return qtyVal;
      const unitVal = findByKey(normKey('unit price'));
      if (unitVal !== undefined) return unitVal;
    }
    for (const key of keys) {
      const v = findByKey(key);
      if (v !== undefined) return v;
    }
    return undefined;
  };

  const out: Canonical = { attrs: {} };
  out.mpn = get('mpn');
  out.dkpn = get('dkpn');
  out.lifecycle = get('lifecycle');
  out.packaging = get('packaging');
  out.package = get('package');
  const stockStr = get('stock');
  if (stockStr) out.stock = Number(stockStr.replace(/,/g, ''));
  const priceStr = get('price');
  if (priceStr) out.price = Number(priceStr.replace(/[^\d.]/g, ''));

  if (out.lifecycle)
    out.attrs.lifecycle_active = /active/i.test(out.lifecycle);

  for (const [canon] of Object.entries(profile.aliases)) {
    if (
      [
        'mpn',
        'dkpn',
        'lifecycle',
        'packaging',
        'package',
        'stock',
        'price',
      ].includes(canon)
    )
      continue;
    const val = get(canon);
    if (val !== undefined) {
      const parsed = parseQty(String(val));
      out.attrs[canon] = parsed !== undefined ? parsed : val;
    }
  }
  return out;
}
