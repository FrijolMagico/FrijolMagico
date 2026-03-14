
export type NomenclatureType = 'arabic' | 'roman'

const ROMAN_NUMERALS: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
  10: 'X',
  11: 'XI',
  12: 'XII',
  13: 'XIII',
  14: 'XIV',
  15: 'XV',
  16: 'XVI',
  17: 'XVII',
  18: 'XVIII',
  19: 'XIX',
  20: 'XX',
  21: 'XXI',
  22: 'XXII',
  23: 'XXIII',
  24: 'XXIV',
  25: 'XXV',
  26: 'XXVI',
  27: 'XXVII',
  28: 'XXVIII',
  29: 'XXIX',
  30: 'XXX',
  31: 'XXXI',
  32: 'XXXII',
  33: 'XXXIII',
  34: 'XXXIV',
  35: 'XXXV',
  36: 'XXXVI',
  37: 'XXXVII',
  38: 'XXXVIII',
  39: 'XXXIX',
  40: 'XL',
  41: 'XLI',
  42: 'XLII',
  43: 'XLIII',
  44: 'XLIV',
  45: 'XLV',
  46: 'XLVI',
  47: 'XLVII',
  48: 'XLVIII',
  49: 'XLIX',
  50: 'L'
}

const ROMAN_TO_ARABIC: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
  XI: 11,
  XII: 12,
  XIII: 13,
  XIV: 14,
  XV: 15,
  XVI: 16,
  XVII: 17,
  XVIII: 18,
  XIX: 19,
  XX: 20,
  XXI: 21,
  XXII: 22,
  XXIII: 23,
  XXIV: 24,
  XXV: 25,
  XXVI: 26,
  XXVII: 27,
  XXVIII: 28,
  XXIX: 29,
  XXX: 30,
  XXXI: 31,
  XXXII: 32,
  XXXIII: 33,
  XXXIV: 34,
  XXXV: 35,
  XXXVI: 36,
  XXXVII: 37,
  XXXVIII: 38,
  XXXIX: 39,
  XL: 40,
  XLI: 41,
  XLII: 42,
  XLIII: 43,
  XLIV: 44,
  XLV: 45,
  XLVI: 46,
  XLVII: 47,
  XLVIII: 48,
  XLIX: 49,
  L: 50
}

export function toRoman(n: number): string {
  if (n < 1 || n > 50) {
    throw new Error(`Cannot convert ${n} to roman numeral (range: 1-50)`)
  }
  return ROMAN_NUMERALS[n]!
}

export function fromRoman(s: string): number {
  const upper = s.toUpperCase()
  if (!(upper in ROMAN_TO_ARABIC)) {
    throw new Error(`Cannot convert "${s}" from roman numeral`)
  }
  return ROMAN_TO_ARABIC[upper]!
}

export function isRoman(s: string): boolean {
  const upper = s.toUpperCase()
  return upper in ROMAN_TO_ARABIC
}

export function detectNomenclature(
  editions: string[]
): NomenclatureType | null {
  if (editions.length === 0) return null

  const first = editions[0]!

  if (isRoman(first)) {
    return 'roman'
  }

  if (/^\d+$/.test(first)) {
    return 'arabic'
  }

  return null
}

export function getNextValue(current: string, type: NomenclatureType): string {
  if (type === 'roman') {
    const num = fromRoman(current)
    return toRoman(num + 1)
  }

  const num = parseInt(current, 10)
  if (isNaN(num)) {
    throw new Error(`Cannot parse "${current}" as arabic numeral`)
  }
  return (num + 1).toString()
}

export function suggestNextEdicion(existingEditions: string[]): {
  suggested: string
  type: NomenclatureType | null
} {
  if (existingEditions.length === 0) {
    return { suggested: '1', type: null }
  }

  const detectedType = detectNomenclature(existingEditions)

  if (!detectedType) {
    return { suggested: '1', type: null }
  }

  const last = existingEditions[existingEditions.length - 1]!
  const next = getNextValue(last, detectedType)

  return { suggested: next, type: detectedType }
}
