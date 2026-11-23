#!/usr/bin/env node
/**
 * Encrypts a private HTML deck file into assets/data/slides.enc.json
 * using PBKDF2-SHA256 (600,000 iterations) and AES-256-GCM.
 *
 * Usage:
 *   PORTFOLIO_PASSWORD="your-passphrase" node scripts/encrypt-slides.mjs <path-to-plaintext-html>
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PBKDF2_ITERATIONS = 600_000;
const KEY_LENGTH = 32;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const MIN_PASSWORD_LENGTH = 12;

function fail(message) {
  console.error(`[encrypt-slides] Error: ${message}`);
  process.exit(1);
}

function expandHome(filePath) {
  if (filePath === '~') {
    return os.homedir();
  }
  if (filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

const rawInputPath = process.argv[2];
if (!rawInputPath) {
  fail('Missing input file path. Usage: node scripts/encrypt-slides.mjs <path-to-plaintext-html>');
}

const resolvedInputPath = path.resolve(expandHome(rawInputPath));
if (!fs.existsSync(resolvedInputPath) || !fs.statSync(resolvedInputPath).isFile()) {
  fail(`Input file does not exist or is not a regular file: ${resolvedInputPath}`);
}

const password = process.env.PORTFOLIO_PASSWORD;
if (!password) {
  fail('PORTFOLIO_PASSWORD environment variable is missing.');
}
if (password.length < MIN_PASSWORD_LENGTH) {
  fail(`PORTFOLIO_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
}

const plaintext = fs.readFileSync(resolvedInputPath, 'utf8');
const salt = crypto.randomBytes(SALT_BYTES);
const iv = crypto.randomBytes(IV_BYTES);
const key = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');

const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
const authTag = cipher.getAuthTag();
const ciphertextWithTag = Buffer.concat([encrypted, authTag]);

const envelope = {
  v: 1,
  kdf: 'PBKDF2-SHA256',
  iter: PBKDF2_ITERATIONS,
  salt: salt.toString('base64'),
  iv: iv.toString('base64'),
  ct: ciphertextWithTag.toString('base64'),
};

const repoRoot = path.resolve(import.meta.dirname, '..');
const outputPath = path.join(repoRoot, 'assets', 'data', 'slides.enc.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(envelope, null, 2)}\n`, 'utf8');

console.log(`[encrypt-slides] Encrypted ${resolvedInputPath} -> ${path.relative(repoRoot, outputPath)}`);
