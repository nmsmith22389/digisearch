import { describe, it, expect } from 'vitest';
import fs from 'fs';
import yaml from 'js-yaml';
import { normalizeRow } from '../src/lib/csv/normalize';
import type { Profile } from '../src/lib/scoring/types';

describe('normalize', () => {
  const profile = yaml.load(fs.readFileSync('profiles/resistor.yaml', 'utf8')) as Profile;
  it('maps aliases and parses units', () => {
    const row = {
      'Manufacturer Part Number': 'ABC',
      'Digi-Key Part Number': 'DK123',
      'Part Status': 'Active',
      Packaging: 'Cut Tape',
      'Package / Case': '0603',
      'Quantity Available': '1,000',
      'Unit Price': '0.02',
      Resistance: '4.7kΩ',
      'Power (Watts)': '0.25W',
      Tolerance: '1%',
      'Temperature Coefficient': '100 ppm',
      'Max Working Voltage': '50V',
    } as Record<string, string>;
    const norm = normalizeRow(row, profile, 1);
    expect(norm.mpn).toBe('ABC');
    expect(norm.dkpn).toBe('DK123');
    expect(norm.stock).toBe(1000);
    expect(norm.price).toBe(0.02);
    expect(norm.attrs.resistance_Ohm).toBeCloseTo(4700);
    expect(norm.attrs.power_W).toBeCloseTo(0.25);
    expect(norm.attrs.tol_pct).toBe(1);
    expect(norm.attrs.tcr_ppm).toBe(100);
    expect(norm.attrs.max_work_V).toBe(50);
    expect(norm.attrs.lifecycle_active).toBe(true);
  });
});
