export const UT_NAMES = new Set([
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
])

export function fmtGsdp(v: number | null | undefined): string {
  if (!v) return 'N/A'
  if (v >= 100_000) return `${(v / 100_000).toFixed(2)}L`
  return `${(v / 1000).toFixed(1)}K`
}

export function stateId(name: string): string {
  return name.replace(/\s+/g, '_')
}

export function maxGsdp(
  states: { economic_metrics: { gsdp_crore_inr: number | null } }[],
): number {
  return Math.max(
    ...states
      .filter((s) => s.economic_metrics.gsdp_crore_inr)
      .map((s) => s.economic_metrics.gsdp_crore_inr as number),
  )
}

export function gsdpPercent(value: number | null, max: number): number {
  if (!value || !max) return 0
  return (value / max) * 100
}
