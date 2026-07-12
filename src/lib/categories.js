export const TONES = { clay: 'bg-clay', pine: 'bg-pine', slate: 'bg-slate', amber: 'bg-amber', olive: 'bg-olive', denim: 'bg-denim' }
export const TONE_KEYS = ['clay', 'pine', 'slate', 'amber', 'olive', 'denim']

export function toneClass(color) {
  return TONES[color] || 'bg-pine'
}
