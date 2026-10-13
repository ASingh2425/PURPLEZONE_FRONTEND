import { test } from 'node:test';
import assert from 'node:assert/strict';

// Helper parser to test RFC-4180 parsing in frontend
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

test('Frontend Preflight: parseCsvLine handles commas, quotes, whitespace', () => {
  assert.deepEqual(parseCsvLine('"Sanctuary_ID","Survival_Probability"'), ['Sanctuary_ID', 'Survival_Probability']);
  assert.deepEqual(parseCsvLine('SANC-0091,0.8500'), ['SANC-0091', '0.8500']);
  assert.deepEqual(parseCsvLine('  "SANC-0091"  ,  0.8500  '), ['SANC-0091', '0.8500']);
});

test('Frontend Preflight: strict numeric regex rejects "0.7junk"', () => {
  const isNumeric = (str: string) => /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(str);
  assert.equal(isNumeric('0.7junk'), false);
  assert.equal(isNumeric('0.8500'), true);
  assert.equal(isNumeric('1.0'), true);
  assert.equal(isNumeric('0.0'), true);
  assert.equal(isNumeric('8.5e-1'), true);
  assert.equal(isNumeric('NaN'), false);
  assert.equal(isNumeric('Infinity'), false);
});

test('Frontend Preflight: strips UTF-8 BOM prefix', () => {
  const rawWithBom = '\uFEFFSanctuary_ID,Survival_Probability\nSANC-0091,0.8500';
  const clean = rawWithBom.replace(/^\uFEFF/, '').trim();
  assert.equal(clean.startsWith('Sanctuary_ID'), true);
});
