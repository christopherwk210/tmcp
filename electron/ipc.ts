import { ipcMain, shell, globalShortcut } from 'electron';
import electronSettings from 'electron-settings';

import { pluginState, loadPlugins } from './plugin-loader';
import { loadThemes, themeState } from './theme-loader';
import { windowState, hideWindow, toggleDevTools, showWindowIfHidden } from './browser-window';
import { appSettings, setSetting, pluginSettings, setPluginEnabled, applyLoadedThemes } from './settings';
import { pluginDirectory, themeDirectory } from './shared';

export function setupIPC() {
  ipcMain.handle('get-themes', () => themeState.themes);
  ipcMain.handle('get-plugins', () => pluginState.plugins);
  ipcMain.handle('reload-plugins', async () => {
    await loadPlugins();
    await loadThemes();
    await applyLoadedThemes();

    return pluginState.plugins;
  });

  ipcMain.handle('get-plugin-settings', () => pluginSettings);
  ipcMain.handle('get-settings', () => appSettings);

  ipcMain.handle('set-setting', async (event, key: string, value: any) => {
    await setSetting(key, value);

    switch (key) {
      case 'height':
        if (windowState.window) {
          windowState.window.setResizable(true);
          windowState.window.setSize(windowState.window.getSize()[0], value);
          windowState.window.setResizable(false);
          windowState.window.center();
        }
        break;
      case 'width':
        if (windowState.window) {
          windowState.window.setResizable(true);
          windowState.window.setSize(value, windowState.window.getSize()[1]);
          windowState.window.setResizable(false);
          windowState.window.center();
        }
        break;
      case 'shortcut':
        globalShortcut.unregisterAll();

        globalShortcut.register(value, () => {
          showWindowIfHidden();
        });
        break;
    }

    return true;
  });

  ipcMain.handle('set-plugin-enabled', async (event, name: string, enabled: boolean) => {
    await setPluginEnabled(name, enabled);
    return true;
  });

  ipcMain.handle('set-plugin-settings', async (event, name: string, settings: any) => {
    const pluginSetting = pluginSettings.find(s => s.name === name)!;
    pluginSetting.settings = settings;
    await electronSettings.set(name, pluginSetting as any);

    return true;
  });

  ipcMain.on('hide-window', () => hideWindow());
  ipcMain.on('toggle-dev-tools', () => toggleDevTools());
  ipcMain.on('open-settings-file', () => {
    const settingsFilePath = electronSettings.file();
    shell.showItemInFolder(settingsFilePath);
  });

  ipcMain.on('open-plugins-folder', () => shell.openPath(pluginDirectory));
  ipcMain.on('open-themes-folder', () => shell.openPath(themeDirectory));

  ipcMain.on('set-keep-open', (event, keepOpen: boolean) => {
    windowState.keepOpen = keepOpen;
  });

  ipcMain.on('ignore-mouse', () => {
    if (!windowState.window) return;
    windowState.window.setIgnoreMouseEvents(true, { forward: true });
  });

  ipcMain.on('unignore-mouse', () => {
    if (!windowState.window) return;
    windowState.window.setIgnoreMouseEvents(false);
  });
}