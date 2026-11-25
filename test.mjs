import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ENTRY, validateEntry } from './main.ts';

test('entry is a single line of 1-200 characters', () => {
  assert.equal(typeof ENTRY, 'string');
  assert.ok(ENTRY.length >= 1 && ENTRY.length <= 200, `length ${ENTRY.length}`);
  assert.ok(!ENTRY.includes('\n') && !ENTRY.includes('\r'));
  assert.equal(ENTRY.trim(), ENTRY);
});

test('entry passes its own validator', () => {
  assert.doesNotThrow(() => validateEntry(ENTRY));
});

test('validator rejects an over-limit entry', () => {
  assert.throws(() => validateEntry('x'.repeat(201)), /200/);
});

test('validator rejects whitespace-only entries', () => {
  assert.throws(() => validateEntry('   '), /whitespace/);
});

test('validator rejects multi-line entries', () => {
  assert.throws(() => validateEntry('line one\nline two'), /single line/);
});

test('validator rejects leading or trailing space', () => {
  assert.throws(() => validateEntry(' ' + ENTRY), /leading or trailing/);
  assert.throws(() => validateEntry(ENTRY + ' '), /leading or trailing/);
});

test('validator rejects control characters', () => {
  assert.throws(() => validateEntry('hello\u0007world'), /control/);
});

test('validator rejects double spaces', () => {
  assert.throws(() => validateEntry('hello  world'), /double spaces/);
});

test('validator rejects entries without terminal punctuation', () => {
  assert.throws(() => validateEntry('hello world'), /terminal punctuation/);
});

test('validator rejects URLs', () => {
  assert.throws(() => validateEntry('see https://example.com now.'), /URL/);
});

test('validator rejects a repeated word in a row', () => {
  assert.throws(() => validateEntry('hello hello world.'), /repeat a word/);
});

test('running main.ts twice in different dirs gives byte-identical entry.txt', () => {
  const dirA = mkdtempSync(join(tmpdir(), 'boring-a-'));
  const dirB = mkdtempSync(join(tmpdir(), 'boring-b-'));
  try {
    for (const dir of [dirA, dirB]) {
      const r = spawnSync(process.execPath, ['main.ts'], {
        cwd: import.meta.dirname,
        env: { ...process.env, MAKEFUN_OUTPUT_DIR: dir },
        encoding: 'utf8',
      });
      assert.equal(r.status, 0, r.stderr);
    }
    const a = readFileSync(join(dirA, 'entry.txt'));
    const b = readFileSync(join(dirB, 'entry.txt'));
    assert.ok(a.equals(b), 'entry.txt differs between runs');
    assert.equal(a.toString('utf8'), ENTRY);
  } finally {
    rmSync(dirA, { recursive: true, force: true });
    rmSync(dirB, { recursive: true, force: true });
  }
});
