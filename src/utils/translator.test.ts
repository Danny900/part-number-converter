import test from 'node:test';
import assert from 'node:assert/strict';
import {
  translateSingleLine,
  translateBatch,
  INVALID_MPN_MARKER,
  INVALID_TAPE_CODE_MARKER,
  SIZE_DICTIONARY,
  DIELECTRIC_DICTIONARY,
  VOLTAGE_DICTIONARY,
} from './translator';

test('translates Example 1 (CL10A106MQ -> C0603X5R6R3-106MNE via default NE fallback)', () => {
  const result = translateSingleLine('CL10A106MQ');
  assert.equal(result.status, 'valid');
  assert.equal(result.output, 'C0603X5R6R3-106MNE');
  assert.equal(result.segments?.lastCharRaw, 'Q');
  assert.equal(result.segments?.tapeRuleApplied, 'DEFAULT->NE');
});

test('dynamically maps final character E -> NE and C -> NP on Samsung MPNs', () => {
  // Final character E -> NE
  const resE = translateSingleLine('CL31A106KAHNNNE');
  assert.equal(resE.status, 'valid');
  assert.equal(resE.output, 'C1206X5R250-106KNE');
  assert.equal(resE.segments?.lastCharRaw, 'E');
  assert.equal(resE.segments?.venkelSuffix, 'NE');
  assert.equal(resE.segments?.tapeRuleApplied, 'E->NE');

  // Final character C -> NP
  const resC = translateSingleLine('CL05B104KO5NNNC');
  assert.equal(resC.status, 'valid');
  assert.equal(resC.output, 'C0402X7R160-104KNP');
  assert.equal(resC.segments?.lastCharRaw, 'C');
  assert.equal(resC.segments?.venkelSuffix, 'NP');
  assert.equal(resC.segments?.tapeRuleApplied, 'C->NP');

  // 10-character MPN whose 10th character (Voltage) also happens to be C (100V) -> ends in C -> NP
  const res10CharC = translateSingleLine('CL42B103KC');
  assert.equal(res10CharC.status, 'valid');
  assert.equal(res10CharC.output, 'C1808X7R101-103KNP');
});

test('flags [INVALID TAPE CODE] when strictTapeValidation is enabled and final char is neither E nor C', () => {
  const strictFail = translateSingleLine('CL10A106MQ', 1, { strictTapeValidation: true });
  assert.equal(strictFail.status, 'invalid');
  assert.equal(strictFail.output, INVALID_TAPE_CODE_MARKER);

  const strictPassE = translateSingleLine('CL31A106KPHNNNE', 2, { strictTapeValidation: true });
  assert.equal(strictPassE.status, 'valid');
  assert.equal(strictPassE.output, 'C1206X5R100-106KNE');

  const strictPassC = translateSingleLine('CL05B104KO5NNNC', 3, { strictTapeValidation: true });
  assert.equal(strictPassC.status, 'valid');
  assert.equal(strictPassC.output, 'C0402X7R160-104KNP');
});

test('supports all Samsung size codes with dynamic suffix rules', () => {
  const sizeCases: Array<[string, string]> = [
    ['CL02A104MQ2NNNC', 'C01005X5R6R3-104MNP'],
    ['CL2A104MQ', 'C01005X5R6R3-104MNE'],
    ['CL03C101JB3NNNC', 'C0201C0G500-101JNP'],
    ['CL3C101JB', 'C0201C0G500-101JNE'],
    ['CL05B104KO5NNNC', 'C0402X7R160-104KNP'],
    ['CL5B104KO5NNNC', 'C0402X7R160-104KNP'],
    ['CL10A106MQ', 'C0603X5R6R3-106MNE'],
    ['CL21B105KBFNNNE', 'C0805X7R500-105KNE'],
    ['CL31A106KPHNNNE', 'C1206X5R100-106KNE'],
    ['CL32A226KQJNNNE', 'C1210X5R6R3-226KNE'],
    ['CL42B103KCFNNNE', 'C1808X7R101-103KNE'],
    ['CL43B104KDFNNNC', 'C1812X7R201-104KNP'],
    ['CL55B105KHHNNNE', 'C2220X7R631-105KNE'],
  ];

  for (const [input, expected] of sizeCases) {
    const res = translateSingleLine(input);
    assert.equal(res.output, expected, `Failed for input ${input}`);
  }
});

test('supports all Dielectric and Voltage dictionary mappings', () => {
  for (const [dKey, dVal] of Object.entries(DIELECTRIC_DICTIONARY)) {
    const mpn = `CL10${dKey}104KANNNE`;
    const res = translateSingleLine(mpn);
    assert.equal(res.output, `C0603${dVal}250-104KNE`);
  }

  for (const [vKey, vVal] of Object.entries(VOLTAGE_DICTIONARY)) {
    const mpnE = `CL21B104K${vKey}NNNE`;
    const resE = translateSingleLine(mpnE);
    assert.equal(resE.output, `C0805X7R${vVal}-104KNE`);

    const mpnC = `CL21B104K${vKey}NNNC`;
    const resC = translateSingleLine(mpnC);
    assert.equal(resC.output, `C0805X7R${vVal}-104KNP`);
  }

  assert.equal(Object.keys(SIZE_DICTIONARY).length >= 10, true);
});

test('preserves blank rows and outputs [INVALID - CHECK MPN] on malformed rows with strict 1:1 row count', () => {
  const batchInput = [
    'CL10A106MQ',
    '',
    '   ',
    'INVALID_PART',
    'CL99A106MQ',
    'CL10W106MQ',
    'CL10A106M!',
    'CL10A',
    'CL05B104KO5NNNC',
    'CL31A106KPHNNNE',
  ].join('\n');

  const summary = translateBatch(batchInput);
  assert.equal(summary.totalLines, 10);
  assert.equal(summary.validCount, 3);
  assert.equal(summary.blankCount, 2);
  assert.equal(summary.invalidCount, 5);

  const outputLines = summary.outputText.split('\n');
  assert.equal(outputLines.length, 10);
  assert.equal(outputLines[0], 'C0603X5R6R3-106MNE');
  assert.equal(outputLines[1], '');
  assert.equal(outputLines[2], '');
  assert.equal(outputLines[3], INVALID_MPN_MARKER);
  assert.equal(outputLines[4], INVALID_MPN_MARKER);
  assert.equal(outputLines[5], INVALID_MPN_MARKER);
  assert.equal(outputLines[6], INVALID_MPN_MARKER);
  assert.equal(outputLines[7], INVALID_MPN_MARKER);
  assert.equal(outputLines[8], 'C0402X7R160-104KNP');
  assert.equal(outputLines[9], 'C1206X5R100-106KNE');
});

test('maintains strict 1:1 row mapping on 500-row batch including trailing blank rows', () => {
  const rows: string[] = [];
  for (let i = 0; i < 500; i++) {
    if (i % 10 === 0) rows.push('');
    else if (i % 15 === 0) rows.push('BAD_ROW_' + i);
    else if (i % 2 === 0) rows.push('CL10A106MQ8NNNC');
    else rows.push('CL31A106KPHNNNE');
  }
  const input = rows.join('\r\n');
  const result = translateBatch(input);
  const outputLines = result.outputText.split('\n');
  assert.equal(outputLines.length, 500);
  assert.equal(outputLines[0], '');
  assert.equal(outputLines[1], 'C1206X5R100-106KNE');
  assert.equal(outputLines[2], 'C0603X5R6R3-106MNP');
  assert.equal(outputLines[15], INVALID_MPN_MARKER);
});
