#!/usr/bin/env node
// Scaffold the native Capacitor projects from this existing React/Vite app.
// This script is intended to run on the developer's machine after npm install.
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const flags = new Set(process.argv.slice(2));
const platforms = flags.has('--android') ? ['android']
  : flags.has('--ios') ? ['ios']
  : flags.has('--all') ? ['android', 'ios']
  : process.platform === 'darwin' ? ['android', 'ios'] : ['android'];

if (!existsSync(join(root, 'node_modules', '@capacitor', 'cli'))) {
  console.error('Capacitor packages are missing. Run npm install first.');
  process.exit(1);
}
function run(program, args) {
  const name = process.platform === 'win32' ? `${program}.cmd` : program;
  console.log(`\n> ${program} ${args.join(' ')}`);
  const result = spawnSync(name, args, { stdio: 'inherit', cwd: root });
  if (result.status !== 0) process.exit(result.status || 1);
}
if (platforms.includes('ios') && process.platform !== 'darwin') {
  console.error('iOS native generation/build requires a Mac with Xcode. Run this on macOS.');
  process.exit(1);
}
run('npm', ['run', 'native:build']);
for (const platform of platforms) {
  if (existsSync(join(root, platform))) {
    console.log(`Skipping existing ${platform}/ project (will sync it instead).`);
  } else {
    run('npx', ['--no-install', 'cap', 'add', platform]);
  }
}
run('npx', ['--no-install', 'cap', 'sync']);
console.log('\nNative projects are set up. Open Android Studio / Xcode to run on a device.');
