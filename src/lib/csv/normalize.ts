import { parseQty } from '../units/parseQty';
import type { Canonical, Profile } from '../scoring/types';

export function buildAliasMap(profile: Profile): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [key, aliases] of Object.entries(profile.aliases)) {
    for (const a of aliases) {
      map[a.toLowerCase()] = key;
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
    lowerRow[k.toLowerCase()] = v;
  }
  const get = (canon: string): string | undefined => {
    const aliases = profile.aliases[canon];
    if (!aliases) return undefined;
    if (canon === 'price') {
      let target = aliases.find(
        (a) => a.toLowerCase() === `price ${priceQty}`.toLowerCase()
      );
      if (target && lowerRow[target.toLowerCase()] !== undefined)
        return lowerRow[target.toLowerCase()];
      target = aliases.find((a) => a.toLowerCase() === 'unit price');
      if (target && lowerRow[target.toLowerCase()] !== undefined)
        return lowerRow[target.toLowerCase()];
      for (const a of aliases) {
        const v = lowerRow[a.toLowerCase()];
        if (v !== undefined) return v;
      }
      return undefined;
    }
    for (const a of aliases) {
      const v = lowerRow[a.toLowerCase()];
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
