export const APP_BAR_H = 64;
export const FOOTER_H = 40;
export function calcTableHeight(summary = 160, win?: number): number {
  const h = win ?? (typeof window !== 'undefined' ? window.innerHeight : 800);
  return h - APP_BAR_H - FOOTER_H - summary;
}
