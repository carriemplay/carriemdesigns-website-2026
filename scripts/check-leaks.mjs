#!/usr/bin/env node
/**
 * Leak-check script for gated portfolio content, plaintext passwords,
 * and source map (.map) files.
 *
 * Scans portfolio.html, script.js, and all git-staged files, plus checks
 * the workspace for any .map files. Exits 0 if clean, 1 if any leak is found.
 */

import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const selfRelPath = path.relative(repoRoot, path.join(import.meta.dirname, 'check-leaks.mjs'));

const FORBIDDEN_SLIDE_PATTERNS = [
  '<article class="gated-presentation"',
  'deck-01-title',
  'Scaling Global Compliance Infrastructure',
  'Modernizing Enterprise Platforms',
  'Conversational AI',
];

const FORBIDDEN_PASSWORD_LITERALS = [
  'VALID_PASSWORDS',
  'carriemah2026',
  "'portfolio'",
  "'nda'",
];

// Precomputed SHA-256 hex digests of known/target passphrases (add hashes here without storing literals).
const FORBIDDEN_PASSWORD_HASHES = new Set([
  // sha256('carriemah2026')
  '219d825a5a57814ace41c1ff6778d682cddd0922152128ef6f75a14591da9f18',
]);

if (process.env.PORTFOLIO_PASSWORD) {
  FORBIDDEN_PASSWORD_HASHES.add(sha256Hex(process.env.PORTFOLIO_PASSWORD));
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

function getStagedFiles() {
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return out
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function findMapFiles(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findMapFiles(fullPath, results);
    } else if (entry.isFile() && entry.name.endsWith('.map')) {
      results.push(path.relative(repoRoot, fullPath));
    }
  }
  return results;
}

function extractCandidateTokens(content) {
  const tokens = new Set();

  // Individual word/delimiter-separated tokens
  const splitTokens = content.match(/[^\s"'`<>=,;(){}[\]]+/g) || [];
  for (const token of splitTokens) {
    if (token.length >= 4) {
      tokens.add(token);
    }
  }

  // Quoted string literals (supports passphrases containing spaces)
  const quotedRegex = /(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
  let match;
  while ((match = quotedRegex.exec(content)) !== null) {
    if (match[2].length >= 4) {
      tokens.add(match[2]);
    }
  }

  return tokens;
}

const findings = [];

// 1. Check workspace and staged files for .map source maps
for (const mapFile of findMapFiles(repoRoot)) {
  findings.push(`Source map file present in workspace: ${mapFile}`);
}

const stagedFiles = getStagedFiles();
for (const staged of stagedFiles) {
  if (staged.endsWith('.map')) {
    findings.push(`Source map file is git-staged: ${staged}`);
  }
}

// 2. Build deduplicated list of files to scan for plaintext leaks
const filesToScan = new Set(['portfolio.html', 'script.js', ...stagedFiles]);
filesToScan.delete(selfRelPath);

for (const relPath of filesToScan) {
  const absPath = path.resolve(repoRoot, relPath);
  if (!fs.existsSync(absPath) || !fs.statSync(absPath).isFile()) {
    continue;
  }

  const content = fs.readFileSync(absPath, 'utf8');

  for (const pattern of FORBIDDEN_SLIDE_PATTERNS) {
    if (content.includes(pattern)) {
      findings.push(`Plaintext slide copy leak in ${relPath}: matched "${pattern}"`);
    }
  }

  for (const literal of FORBIDDEN_PASSWORD_LITERALS) {
    if (content.includes(literal)) {
      findings.push(`Plaintext password/credential leak in ${relPath}: matched ${literal}`);
    }
  }

  if (FORBIDDEN_PASSWORD_HASHES.size > 0) {
    for (const token of extractCandidateTokens(content)) {
      if (FORBIDDEN_PASSWORD_HASHES.has(sha256Hex(token))) {
        findings.push(`Hashed password match detected in ${relPath} (token length ${token.length})`);
      }
    }
  }
}

if (findings.length > 0) {
  console.error('[check-leaks] FAIL — potential leaks detected:');
  for (const finding of findings) {
    console.error(`  - ${finding}`);
  }
  process.exit(1);
}

console.log(`[check-leaks] PASS — scanned ${filesToScan.size} file(s), no leaks or .map files found.`);
