import { spawn } from 'child_process';

console.clear();
await new Promise(resolve => {
  const shell = spawn('npm', ['run', 'vue:build'], { shell: true });
  shell.stdout.setEncoding('utf8');
  shell.stdout.on('data', data => console.log(data));
  shell.addListener('close', resolve);
});

await new Promise(resolve => {
  const shell = spawn('node', ['./tools/electron-tsc.mjs'], { shell: true });
  shell.stdout.setEncoding('utf8');
  shell.stdout.on('data', data => console.log(data));
  shell.addListener('close', resolve);
});

await new Promise(resolve => {
  const shell = spawn('electron-builder', [
    'build',
    '--config',
    'electron-builder.config.js',
    '-w'
  ], { shell: true });
  shell.stdout.setEncoding('utf8');
  shell.stdout.on('data', data => console.log(data));
  shell.addListener('close', resolve);
});