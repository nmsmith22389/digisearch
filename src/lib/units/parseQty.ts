export function parseQty(str: string): number | undefined {
  if (!str) return undefined;
  const s = str
    .trim()
    .replace(/[_,]/g, '')
    .replace(/ohms?/gi, 'ohm')
    .replace(/Ω/gi, 'ohm')
    .replace(/[\u00b5µ]/gi, 'u');
  const ppm = s.match(/^([+-]?(?:\d+\.?\d*|\.\d+))\s*ppm/i);
  if (ppm) {
    return Number(ppm[1]);
  }
  const match = s.match(/^([+-]?(?:\d+\.?\d*|\.\d+))(?:\s*)([pnumkMG]?)([a-zA-Z]*)/);
  if (!match) return undefined;
  const [, num, prefix, unitRaw] = match;
  let value = Number(num);
  if (isNaN(value)) return undefined;
  const prefixes: Record<string, number> = {
    p: 1e-12,
    n: 1e-9,
    u: 1e-6,
    m: 1e-3,
    k: 1e3,
    M: 1e6,
    G: 1e9,
  };
  if (prefix && prefixes[prefix]) {
    value *= prefixes[prefix];
  }
  const unit = unitRaw.toLowerCase();
  if (unit === 'ma' || unit === 'ua' || unit === 'na') {
    // already handled by prefix
  } else if (
    [
      'ohm',
      'f',
      'h',
      'v',
      'a',
      'w',
      'c',
      'ppm',
    ].includes(unit) || unit === ''
  ) {
    // unit recognized or absent
  } else {
    return undefined;
  }
  return value;
}
