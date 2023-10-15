import { BrowserWindow, Menu, screen } from 'electron';
import { enable } from '@electron/remote/main';
import { isDevelopment, iconPath } from './shared';
import { getSettingLocal } from './settings';

export const windowState = {
  window: null as BrowserWindow | null,
  keepOpen: false
};

export function toggleDevTools() {
  if (!windowState.window) return;

  if (windowState.window.webContents.isDevToolsOpened()) {
    windowState.window.webContents.closeDevTools();
  } else {
    windowState.window.webContents.openDevTools({ mode: 'detach' });
  }
}

export function hideWindow() {
  if (!windowState.window) return;

  windowState.window.setOpacity(0);
  windowState.window.setIgnoreMouseEvents(true);
  windowState.window.setFocusable(false);

  windowState.window.webContents.send('hide-window');
}

function showWindow() {
  if (!windowState.window) return;

  windowState.window.setIgnoreMouseEvents(false);
  windowState.window.setFocusable(true);

  const { x, y } = screen.getCursorScreenPoint();
  const currentDisplay = screen.getDisplayNearestPoint({ x, y });
  windowState.window.setPosition(currentDisplay.workArea.x, currentDisplay.workArea.y);
  windowState.window.center();

  windowState.window.focus();
  windowState.window.setOpacity(1);
  windowState.window.setSkipTaskbar(true);

  windowState.window.webContents.send('show-window');
}

export function showWindowIfHidden() {
  if (!windowState.window) return;
  if (windowState.window.getOpacity() === 0) {
    showWindow();
  }
}

export async function createWindow() {
  const win = new BrowserWindow({
    width: getSettingLocal('width'),
    height: getSettingLocal('height'),
    backgroundColor: '#00000000',
    icon: iconPath,
    frame: false,
    resizable: false,
    transparent: true,
    skipTaskbar: true,
    alwaysOnTop: true,
    focusable: false,
    opacity: 0,
    show: true,
    center: true,
    closable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    movable: false,
    webPreferences: {
      autoplayPolicy: 'no-user-gesture-required',
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  win.addListener('blur', () => {
    if (windowState.keepOpen) return;
    if (win.webContents.isDevToolsOpened()) return;
    if (getSettingLocal('hide-on-blur')) hideWindow();
  });

  enable(win.webContents);

  Menu.setApplicationMenu(null);

  if (isDevelopment) {
    const url = process.env.__VITE_LOCAL_URL || 'http://localhost:3000/';
    win.loadURL(url);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.setFullScreen(true);
    await win.loadURL('app://./index.html');
  }

  windowState.window = win;

  return win;
}
