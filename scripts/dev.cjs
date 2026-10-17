const { spawn } = require('node:child_process');
const path = require('node:path');

const electronVitePackage = require.resolve('electron-vite/package.json');
const electronViteCli = path.join(path.dirname(electronVitePackage), 'bin', 'electron-vite.js');
const childEnv = { ...process.env };

// VS Code and other Electron-based shells may set this for their own Node processes.
// Electron itself needs it removed, otherwise it starts as plain Node.js.
delete childEnv.ELECTRON_RUN_AS_NODE;

const child = spawn(
  process.execPath,
  [electronViteCli, 'dev', '--ignoreConfigWarning', ...process.argv.slice(2)],
  {
  stdio: 'inherit',
  env: childEnv,
  windowsHide: false,
  },
);

child.on('error', (error) => {
  console.error('[dev] failed to start electron-vite:', error);
  process.exitCode = 1;
});

child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
