/**
 * Enriches aircraft records that have registrations but missing airline/operator names.
 *
 * OpenSky's operator field is only populated for ~17% of EU/North Africa 737 records.
 * This module maps registration prefixes + country combinations to known 737 operators
 * using publicly available fleet data.
 */

// Country-prefix → list of known 737 operators in that country
// For countries with a single dominant 737 operator, we can assign with high confidence.
// For countries with multiple operators, we list them but only auto-assign when there's
// a single operator (or when the typecode narrows it down).
const COUNTRY_OPERATORS: Record<string, { airlines: string[]; dominant?: string }> = {
  // Ireland — Ryanair operates virtually all EI- registered 737s
  'EI-': { airlines: ['Ryanair', 'ASL Airlines Ireland'], dominant: 'Ryanair' },

  // Turkey — multiple operators
  'TC-': {
    airlines: ['Turkish Airlines', 'Pegasus Airlines', 'SunExpress', 'AnadoluJet', 'Corendon Airlines'],
  },

  // Norway — Norwegian dominates
  'LN-': { airlines: ['Norwegian Air Shuttle', 'Flyr'], dominant: 'Norwegian Air Shuttle' },

  // United Kingdom — multiple operators
  'G-': { airlines: ['Jet2', 'TUI Airways', 'Ryanair UK'] },

  // Netherlands — Transavia + KLM + TUI
  'PH-': { airlines: ['Transavia', 'KLM', 'TUI fly Netherlands'] },

  // Malta — Malta Air (Ryanair subsidiary) dominates
  '9H-': { airlines: ['Malta Air', 'HiSky Malta', 'SmartLynx Malta'], dominant: 'Malta Air' },

  // Germany — TUI fly + SunExpress Germany
  'D-': { airlines: ['TUI fly Deutschland', 'SunExpress Germany', 'Eurowings'] },

  // France — Transavia France dominates 737 ops
  'F-': { airlines: ['Transavia France'], dominant: 'Transavia France' },

  // Poland — Ryanair Sun/Buzz + Enter Air + LOT (though LOT uses 737 MAX)
  'SP-': { airlines: ['Buzz', 'Enter Air', 'LOT Polish Airlines'] },

  // Sweden — Norwegian + Ryanair
  'SE-': { airlines: ['Norwegian Air Shuttle', 'Ryanair', 'BRA'] },

  // Czech Republic — Smartwings dominates
  'OK-': { airlines: ['Smartwings', 'Travel Service'], dominant: 'Smartwings' },

  // Austria — Lauda Europe (Ryanair subsidiary)
  'OE-': { airlines: ['Lauda Europe', 'Austrian Airlines'], dominant: 'Lauda Europe' },

  // Belgium — TUI fly Belgium
  'OO-': { airlines: ['TUI fly Belgium'], dominant: 'TUI fly Belgium' },

  // Romania — Blue Air + HiSky
  'YR-': { airlines: ['Blue Air', 'HiSky', 'Tarom'] },

  // Denmark — Ryanair + SAS (few 737s)
  'OY-': { airlines: ['Ryanair', 'Jet Time', 'SAS'] },

  // Spain — Air Europa + Ryanair
  'EC-': { airlines: ['Air Europa', 'Ryanair', 'AlbaStar', 'Iberia Express'] },

  // Iceland — Icelandair operates all TF- 737s
  'TF-': { airlines: ['Icelandair', 'PLAY'], dominant: 'Icelandair' },

  // Luxembourg — Luxair
  'LX-': { airlines: ['Luxair'], dominant: 'Luxair' },

  // Egypt — EgyptAir dominates
  'SU-': { airlines: ['EgyptAir', 'Nile Air', 'Air Cairo'] },

  // Morocco — Royal Air Maroc
  'CN-': { airlines: ['Royal Air Maroc'], dominant: 'Royal Air Maroc' },

  // Algeria — Air Algerie + Tassili
  '7T-': { airlines: ['Air Algerie', 'Tassili Airlines'] },

  // Tunisia — Tunisair
  'TS-': { airlines: ['Tunisair', 'Nouvelair'], dominant: 'Tunisair' },

  // Slovakia
  'OM-': { airlines: ['AirExplore', 'Smartwings Slovakia'] },

  // Bulgaria — Bulgaria Air
  'LZ-': { airlines: ['Bulgaria Air', 'BH Air'] },

  // Lithuania — GetJet Airlines
  'LY-': { airlines: ['GetJet Airlines', 'Klasjet'] },

  // Latvia — SmartLynx Airlines
  'YL-': { airlines: ['SmartLynx Airlines'] , dominant: 'SmartLynx Airlines' },

  // Portugal
  'CS-': { airlines: ['EuroAtlantic Airways'] },

  // Croatia
  '9A-': { airlines: ['Trade Air'] },

  // Libya
  '5A-': { airlines: ['Libyan Airlines', 'Afriqiyah Airways'] },

  // Italy — Aeroitalia, Neos, Ryanair
  'I-': { airlines: ['Aeroitalia', 'Neos', 'Air Italy'] },

  // Switzerland
  'HB-': { airlines: ['PrivatAir'] },

  // Greece
  'SX-': { airlines: ['Aegean Airlines'] },

  // Finland
  'OH-': { airlines: ['Finnair'] },

  // Hungary
  'HA-': { airlines: ['Wizz Air'] },

  // Cyprus
  '5B-': { airlines: ['Cyprus Airways'] },

  // Estonia
  'ES-': { airlines: ['Nordica'] },

  // Slovenia
  'S5-': { airlines: ['Adria Airways'] },
};

/**
 * If the aircraft has no airline and we can confidently assign one
 * (single dominant operator for that country's 737 fleet), do so.
 * Otherwise, list the possible operators.
 */
export function enrichAirline(
  registration: string,
  currentAirline: string,
  _typecode: string,
): { airline: string; confidence: 'known' | 'high' | 'medium' | 'low' } {
  // If we already have an airline, keep it
  if (currentAirline && currentAirline !== 'Unknown' && currentAirline !== '') {
    return { airline: currentAirline, confidence: 'known' };
  }

  const upper = registration.toUpperCase();

  // Find matching prefix (longest first)
  const sortedPrefixes = Object.keys(COUNTRY_OPERATORS).sort((a, b) => b.length - a.length);
  const prefix = sortedPrefixes.find(p => upper.startsWith(p));

  if (!prefix) {
    return { airline: 'Unknown', confidence: 'low' };
  }

  const entry = COUNTRY_OPERATORS[prefix];

  // If there's a single dominant operator for this country's 737 fleet
  if (entry.dominant) {
    return { airline: entry.dominant, confidence: 'high' };
  }

  // Multiple operators — we can't be sure which one
  if (entry.airlines.length === 1) {
    return { airline: entry.airlines[0], confidence: 'high' };
  }

  // Multiple operators — return the first as best guess with medium confidence
  return { airline: entry.airlines[0] + ' (est.)', confidence: 'medium' };
}

/**
 * Returns possible airlines for a given registration prefix
 */
export function getPossibleAirlines(registration: string): string[] {
  const upper = registration.toUpperCase();
  const sortedPrefixes = Object.keys(COUNTRY_OPERATORS).sort((a, b) => b.length - a.length);
  const prefix = sortedPrefixes.find(p => upper.startsWith(p));
  if (!prefix) return [];
  return COUNTRY_OPERATORS[prefix].airlines;
}
