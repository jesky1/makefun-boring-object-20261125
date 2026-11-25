// Entry for make.fun's "The Most Boring Object, Reviewed in One Line".
//
// One job: put a single one-line review of the dullest everyday object
// into entry.txt inside the output directory, byte for byte the same on
// every run. The grader points MAKEFUN_OUTPUT_DIR at its own scratch
// output folder; on a plain machine the fallback is /output, the path
// the competition reads.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// and the review lands in out/entry.txt, with no trailing newline: the
// judge reads exactly what is in the file, so the text below is the
// entire entry.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

// The review itself. A doorstop is the honest pick: it does one thing,
// it does it forever, nobody notices it until it fails, and its whole
// reward for six years of loyal service is being kicked every morning.
// The joke is true about how the object really behaves, which is what
// the judge brief asks for.
export const ENTRY =
  "Our doorstop has held the same door open for six years, never asked for a raise, and still gets kicked every single morning.";

// Competition limits ("The Most Boring Object"): the entry must be a
// single line of 1-200 characters. Enforced here so a bad edit fails
// loudly instead of silently producing an entry the judge rejects.
export const MIN_ENTRY_LENGTH = 1;
export const MAX_ENTRY_LENGTH = 200;

export function validateEntry(entry: string): void {
  if (entry.length < MIN_ENTRY_LENGTH || entry.length > MAX_ENTRY_LENGTH) {
    throw new Error(
      `Entry must be ${MIN_ENTRY_LENGTH}-${MAX_ENTRY_LENGTH} characters, got ${entry.length}.`,
    );
  }
  if (entry.includes('\n') || entry.includes('\r')) {
    throw new Error('Entry must be a single line (no newline characters).');
  }
  if (entry.trim().length === 0) {
    throw new Error('Entry must not be only whitespace.');
  }
  if (entry !== entry.trim()) {
    throw new Error('Entry must not have leading or trailing space.');
  }
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(entry)) {
    throw new Error('Entry must not contain control characters.');
  }
  if (entry.includes('  ')) {
    throw new Error('Entry must not contain double spaces.');
  }
}

if (import.meta.main) {
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  validateEntry(ENTRY);
  writeFileSync(join(outputDir, 'entry.txt'), ENTRY, 'utf8');
}
