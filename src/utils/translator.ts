export const INVALID_MPN_MARKER = '[INVALID - CHECK MPN]';
export const INVALID_TAPE_CODE_MARKER = '[INVALID TAPE CODE]';

export const TAPE_SUFFIX_DICTIONARY: Record<string, string> = {
  E: 'NE',
  C: 'NP',
};

export const SIZE_DICTIONARY: Record<string, string> = {
  '2': '01005',
  '02': '01005',
  '3': '0201',
  '03': '0201',
  '5': '0402',
  '05': '0402',
  '10': '0603',
  '21': '0805',
  '31': '1206',
  '32': '1210',
  '42': '1808',
  '43': '1812',
  '55': '2220',
};

export const DISPLAY_SIZE_DICTIONARY: Array<{ samsung: string; venkel: string; metric: string }> = [
  { samsung: '02 (2)', venkel: '01005', metric: '0402 Metric' },
  { samsung: '03 (3)', venkel: '0201', metric: '0603 Metric' },
  { samsung: '05 (5)', venkel: '0402', metric: '1005 Metric' },
  { samsung: '10', venkel: '0603', metric: '1608 Metric' },
  { samsung: '21', venkel: '0805', metric: '2012 Metric' },
  { samsung: '31', venkel: '1206', metric: '3216 Metric' },
  { samsung: '32', venkel: '1210', metric: '3225 Metric' },
  { samsung: '42', venkel: '1808', metric: '4520 Metric' },
  { samsung: '43', venkel: '1812', metric: '4532 Metric' },
  { samsung: '55', venkel: '2220', metric: '5750 Metric' },
];

export const DIELECTRIC_DICTIONARY: Record<string, string> = {
  C: 'C0G',
  A: 'X5R',
  B: 'X7R',
  X: 'X6S',
  F: 'Y5V',
  Y: 'X7S',
  Z: 'X7T',
};

export const VOLTAGE_DICTIONARY: Record<string, string> = {
  R: '4R0',
  Q: '6R3',
  P: '100',
  O: '160',
  A: '250',
  L: '350',
  B: '500',
  C: '101',
  D: '201',
  E: '251',
  G: '501',
  H: '631',
};

export const VOLTAGE_LABELS: Record<string, string> = {
  R: '4V DC',
  Q: '6.3V DC',
  P: '10V DC',
  O: '16V DC',
  A: '25V DC',
  L: '35V DC',
  B: '50V DC',
  C: '100V DC',
  D: '200V DC',
  E: '250V DC',
  G: '500V DC',
  H: '630V DC',
};

export interface ParsedSegments {
  prefixRaw: string;
  sizeRaw: string;
  dielectricRaw: string;
  valueRaw: string;
  toleranceRaw: string;
  voltageRaw: string;
  ignoredSuffix: string;
  lastCharRaw: string;
  tapeRuleApplied: 'E->NE' | 'C->NP' | 'DEFAULT->NE';
  venkelPrefix: string;
  venkelSize: string;
  venkelDielectric: string;
  venkelVoltage: string;
  venkelValue: string;
  venkelTolerance: string;
  venkelSuffix: string;
}

export interface TranslationRowResult {
  lineNumber: number;
  rawInput: string;
  trimmedInput: string;
  output: string;
  status: 'valid' | 'invalid' | 'blank';
  errorReason?: string;
  segments?: ParsedSegments;
}

export interface BatchTranslationOptions {
  strictTapeValidation?: boolean;
}

export interface BatchTranslationSummary {
  outputText: string;
  rows: TranslationRowResult[];
  totalLines: number;
  validCount: number;
  invalidCount: number;
  blankCount: number;
}

/**
 * Translates a single line of Samsung MLCC MPN into a Venkel IPN.
 * Dynamically evaluates the final character of the Samsung MPN for the taping/packaging suffix:
 * - 'E' -> 'NE'
 * - 'C' -> 'NP'
 * - Otherwise -> defaults to 'NE' (or returns '[INVALID TAPE CODE]' when strictTapeValidation is true).
 */
export function translateSingleLine(
  rawLine: string,
  lineNumber = 1,
  options: BatchTranslationOptions = {}
): TranslationRowResult {
  const { strictTapeValidation = false } = options;
  const trimmed = rawLine.trim();

  if (trimmed === '') {
    return {
      lineNumber,
      rawInput: rawLine,
      trimmedInput: '',
      output: '',
      status: 'blank',
    };
  }

  const normalized = trimmed.toUpperCase();

  // Check prefix (Characters 1-2: CL -> C)
  if (!normalized.startsWith('CL')) {
    return {
      lineNumber,
      rawInput: rawLine,
      trimmedInput: trimmed,
      output: INVALID_MPN_MARKER,
      status: 'invalid',
      errorReason: `Characters 1–2 must be "CL" (found "${normalized.slice(0, 2) || normalized}")`,
    };
  }

  // Determine whether size code is 2 characters (standard: 02, 03, 05, 10, 21, 31, 32, 42, 43, 55)
  // or 1 character ('2', '3', '5' when leading zero is omitted in a spreadsheet).
  const twoCharSizeCandidate = normalized.slice(2, 4);
  const oneCharSizeCandidate = normalized.slice(2, 3);

  let sizeRaw = '';
  let venkelSize = '';
  let offsetAfterSize = 4;

  if (twoCharSizeCandidate.length === 2 && SIZE_DICTIONARY[twoCharSizeCandidate]) {
    sizeRaw = twoCharSizeCandidate;
    venkelSize = SIZE_DICTIONARY[twoCharSizeCandidate];
    offsetAfterSize = 4;
  } else if (
    (oneCharSizeCandidate === '2' || oneCharSizeCandidate === '3' || oneCharSizeCandidate === '5') &&
    SIZE_DICTIONARY[oneCharSizeCandidate]
  ) {
    sizeRaw = oneCharSizeCandidate;
    venkelSize = SIZE_DICTIONARY[oneCharSizeCandidate];
    offsetAfterSize = 3;
  } else {
    const minRequiredLength = 10;
    if (normalized.length < minRequiredLength) {
      return {
        lineNumber,
        rawInput: rawLine,
        trimmedInput: trimmed,
        output: INVALID_MPN_MARKER,
        status: 'invalid',
        errorReason: `Part number too short (${normalized.length} chars; minimum 10 required)`,
      };
    }
    return {
      lineNumber,
      rawInput: rawLine,
      trimmedInput: trimmed,
      output: INVALID_MPN_MARKER,
      status: 'invalid',
      errorReason: `Unrecognized Samsung size code "${twoCharSizeCandidate}" at positions 3–4`,
    };
  }

  const requiredMinLength = offsetAfterSize + 6; // Dielectric (1) + Value (3) + Tolerance (1) + Voltage (1)
  if (normalized.length < requiredMinLength) {
    return {
      lineNumber,
      rawInput: rawLine,
      trimmedInput: trimmed,
      output: INVALID_MPN_MARKER,
      status: 'invalid',
      errorReason: `Part number too short (${normalized.length} chars; minimum ${requiredMinLength} required)`,
    };
  }

  const dielectricRaw = normalized.slice(offsetAfterSize, offsetAfterSize + 1);
  const valueRaw = normalized.slice(offsetAfterSize + 1, offsetAfterSize + 4);
  const toleranceRaw = normalized.slice(offsetAfterSize + 4, offsetAfterSize + 5);
  const voltageRaw = normalized.slice(offsetAfterSize + 5, offsetAfterSize + 6);
  const ignoredSuffix = normalized.slice(offsetAfterSize + 6);

  const venkelDielectric = DIELECTRIC_DICTIONARY[dielectricRaw];
  if (!venkelDielectric) {
    return {
      lineNumber,
      rawInput: rawLine,
      trimmedInput: trimmed,
      output: INVALID_MPN_MARKER,
      status: 'invalid',
      errorReason: `Unrecognized dielectric code "${dielectricRaw}" at character 5`,
    };
  }

  // Value / Capacitance (3 chars, e.g. 106, 104, 4R7, 0R5, 225)
  if (!/^[0-9R]{3}$/.test(valueRaw)) {
    return {
      lineNumber,
      rawInput: rawLine,
      trimmedInput: trimmed,
      output: INVALID_MPN_MARKER,
      status: 'invalid',
      errorReason: `Invalid capacitance value code "${valueRaw}" at characters 6–8`,
    };
  }

  // Tolerance (1 letter, e.g. M, K, J, F, G, D, C, B, Z)
  if (!/^[A-Z]$/.test(toleranceRaw)) {
    return {
      lineNumber,
      rawInput: rawLine,
      trimmedInput: trimmed,
      output: INVALID_MPN_MARKER,
      status: 'invalid',
      errorReason: `Invalid tolerance code "${toleranceRaw}" at character 9`,
    };
  }

  const venkelVoltage = VOLTAGE_DICTIONARY[voltageRaw];
  if (!venkelVoltage) {
    return {
      lineNumber,
      rawInput: rawLine,
      trimmedInput: trimmed,
      output: INVALID_MPN_MARKER,
      status: 'invalid',
      errorReason: `Unrecognized voltage code "${voltageRaw}" at character 10`,
    };
  }

  // Dynamic Suffix Evaluation: Isolate the very last character of the input Samsung MPN
  const lastCharRaw = normalized.charAt(normalized.length - 1);
  let venkelSuffix = 'NE';
  let tapeRuleApplied: 'E->NE' | 'C->NP' | 'DEFAULT->NE' = 'DEFAULT->NE';

  if (lastCharRaw === 'E') {
    venkelSuffix = 'NE';
    tapeRuleApplied = 'E->NE';
  } else if (lastCharRaw === 'C') {
    venkelSuffix = 'NP';
    tapeRuleApplied = 'C->NP';
  } else if (strictTapeValidation) {
    return {
      lineNumber,
      rawInput: rawLine,
      trimmedInput: trimmed,
      output: INVALID_TAPE_CODE_MARKER,
      status: 'invalid',
      errorReason: `Final character "${lastCharRaw}" is neither "E" (NE) nor "C" (NP) under strict tape validation`,
    };
  } else {
    venkelSuffix = 'NE';
    tapeRuleApplied = 'DEFAULT->NE';
  }

  const venkelPrefix = 'C';
  // Final Assembly: [Prefix][Size][Dielectric][Voltage]-[Value][Tolerance][Suffix]
  const output = `${venkelPrefix}${venkelSize}${venkelDielectric}${venkelVoltage}-${valueRaw}${toleranceRaw}${venkelSuffix}`;

  return {
    lineNumber,
    rawInput: rawLine,
    trimmedInput: trimmed,
    output,
    status: 'valid',
    segments: {
      prefixRaw: 'CL',
      sizeRaw,
      dielectricRaw,
      valueRaw,
      toleranceRaw,
      voltageRaw,
      ignoredSuffix,
      lastCharRaw,
      tapeRuleApplied,
      venkelPrefix,
      venkelSize,
      venkelDielectric,
      venkelVoltage,
      venkelValue: valueRaw,
      venkelTolerance: toleranceRaw,
      venkelSuffix,
    },
  };
}

/**
 * Translates a multi-line batch of Samsung MPNs into Venkel IPNs with strict 1:1 row mapping.
 */
export function translateBatch(
  inputText: string,
  options: BatchTranslationOptions = {}
): BatchTranslationSummary {
  // Normalize CRLF to LF while strictly preserving every line break
  const normalizedText = inputText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rawLines = normalizedText.split('\n');

  let validCount = 0;
  let invalidCount = 0;
  let blankCount = 0;

  const rows: TranslationRowResult[] = rawLines.map((line, idx) => {
    const result = translateSingleLine(line, idx + 1, options);
    if (result.status === 'valid') validCount++;
    else if (result.status === 'invalid') invalidCount++;
    else blankCount++;
    return result;
  });

  const outputText = rows.map((r) => r.output).join('\n');

  return {
    outputText,
    rows,
    totalLines: rows.length,
    validCount,
    invalidCount,
    blankCount,
  };
}

export const SAMPLE_WAREHOUSE_BATCH = [
  'CL10A106MQ',
  'CL31A106KPHNNNE',
  'CL31A106KAHNNNE',
  'CL05B104KO5NNNC',
  'CL21B105KBFNNNE',
  '',
  'CL03C101JB3NNNC',
  'CL32A226KQJNNNE',
  'CL99X106MQ',
  'CL21A475KAQNNNE',
  'CL02A104MQ2NNNC',
  'SHORT12',
  'CL43B104KCFNNNE',
  'CL55B105KCHNNNE',
].join('\n');
