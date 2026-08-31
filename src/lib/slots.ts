export interface SlotDef {
  slot: string;
  type: 'image' | 'voicenote';
  fallback: string;
}

const GALLERY_FALLBACKS = [
  '/assets/1_1787767467021.webp',
  '/assets/1_-_2_1787767467021.webp',
  '/assets/1_-_3_1787767467021.webp',
  '/assets/2_-_1_1787767467021.webp',
  '/assets/2_-_3_1787767467021.webp',
  '/assets/2_-_2_1787767467022.webp',
];

const TESTIMONIAL_FALLBACKS = [
  '/assets/1_-_اسامه_ركابي_1787767467020.ogg',
  '/assets/2_-_احمد_يسري_1787767467023.ogg',
  '/assets/3_-_عبدالرحمن_مدثر_1787767467023.ogg',
  '/assets/4_-_مصطفي_كلحي_1787767467023.ogg',
  '/assets/5_-_احمد_شمس_1787767467023.ogg',
  '/assets/6_-_نور_ماهر_1787767467020.ogg',
];

export const gallerySlots: SlotDef[] = GALLERY_FALLBACKS.map((fallback, index) => ({
  slot: `gallery-${index + 1}`,
  type: 'image',
  fallback,
}));

export const testimonialSlots: SlotDef[] = TESTIMONIAL_FALLBACKS.map((fallback, index) => ({
  slot: `testimonial-${index + 1}`,
  type: 'voicenote',
  fallback,
}));

export const allSlots: SlotDef[] = [...gallerySlots, ...testimonialSlots];

const fixedSlotIds = new Set(allSlots.map((s) => s.slot));

// True for the original 12 slots (with a static fallback file). Anything
// else is an admin-added asset — no fallback, and deleting it removes it
// from the public page's list entirely rather than reverting to a default.
export function isFixedSlot(slot: string): boolean {
  return fixedSlotIds.has(slot);
}

// Sorts "<prefix>-N" slot names numerically by N (falls back to string sort).
export function bySlotNumber(a: { slot: string }, b: { slot: string }): number {
  const numA = Number(a.slot.split('-').pop());
  const numB = Number(b.slot.split('-').pop());
  if (Number.isFinite(numA) && Number.isFinite(numB)) return numA - numB;
  return a.slot.localeCompare(b.slot);
}
