import { app, protocol, globalShortcut } from 'electron';
import { initialize } from '@electron/remote/main';
import { createApplicationProtocol } from './create-protocol';
import { createWindow, showWindowIfHidden } from './browser-window';
import { setupIPC } from './ipc';
import { loadThemes } from './theme-loader';
import { loadPlugins } from './plugin-loader';
import { createTrayIcon } from './tray';
import { getSettingLocal, loadSettings } from './settings';
import { isDevelopment } from './shared';

initialize();

// I know what I'm doing Electron, please shut up
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true, stream: true, supportFetchAPI: true } }
]);

app.on('ready', async () => {
  createApplicationProtocol();
  setupIPC();
  await loadThemes();
  await loadSettings();
  await loadPlugins();
  await createWindow();
  createTrayIcon();

  globalShortcut.register(getSettingLocal('shortcut'), () => {
    showWindowIfHidden();
  });
});

app.on('window-all-closed', () => app.quit());

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.once('SIGUSR2', function () {
      app.quit();
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
