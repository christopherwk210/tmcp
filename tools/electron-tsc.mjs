import { spawn } from 'child_process';

console.log('Compiling Electron TypeScript...');

const tsc = spawn('npx', ['tsc', '--project', 'tsconfig.electron.json'], { shell: true })
await new Promise(resolve => tsc.addListener('close', resolve));

if (process.argv.includes('--run')) {
  console.log('Running Electron...');
  const shell = spawn('npx', ['electron', '.'], { shell: true });
  shell.stdout.setEncoding('utf8');
  shell.stdout.on('data', data => {
    if (removeJunk(data)) console.log(data);
  });
}

// Remove electron junk
const removeJunk = chunk => {
  // Example: 2018-08-10 22:48:42.866 Electron[90311:4883863] *** WARNING: Textured window <AtomNSWindow: 0x7fb75f68a770>
  if (/\d+-\d+-\d+ \d+:\d+:\d+\.\d+ Electron(?: Helper)?\[\d+:\d+] /.test(chunk)) {
    return false;
  }

  // Example: [90789:0810/225804.894349:ERROR:CONSOLE(105)] "Uncaught (in promise) Error: Could not instantiate: ProductRegistryImpl.Registry", source: chrome-devtools://devtools/bundled/inspector.js (105)
  if (/\[\d+:\d+\/|\d+\.\d+:ERROR:CONSOLE\(\d+\)\]/.test(chunk)) {
    return false;
  }

  // Example: ALSA lib confmisc.c:767:(parse_card) cannot find card '0'
  if (/ALSA lib [a-z]+\.c:\d+:\([a-z_]+\)/.test(chunk)) {
    return false;
  }

  return true;
};
