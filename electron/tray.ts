import { Tray, Menu, shell } from 'electron';
import * as path from 'path';
import { mediaDirectory } from './shared';
import { getSettingLocal } from './settings';
import { showWindowIfHidden, windowState } from './browser-window';

const iconImagePath = path.join(mediaDirectory, 'tmcp_logo_16.png');
const iconImagePathLarge = path.join(mediaDirectory, 'tmcp_logo_256.png');

const state = {
  tray: null as Tray | null
};

export async function createTrayIcon() {
  const menu = Menu.buildFromTemplate([
    { enabled: false, label: 'Topher\'s Modular Command Palette', icon: iconImagePath },
    { type: 'separator' },
    { label: 'Open', click: showWindowIfHidden },
    {
      label: 'Settings',
      click: () => {
        showWindowIfHidden();
        windowState.window?.webContents.send('show-settings');
      }
    },
    { type: 'separator' },
    { label: 'View on itch.io', click: () => shell.openExternal('https://topherlicious.itch.io/tmcp') },
    { label: 'View on GitHub', click: () => shell.openExternal('https://github.com/christopherwk210/tmcp') },
    { type: 'separator' },
    { label: 'Exit', click: () => process.exit(0) }
  ]);

  state.tray = new Tray(iconImagePathLarge);
  state.tray.setToolTip(`Topher's Modular Command Palette`);
  state.tray.setContextMenu(menu);
  state.tray.on('click', () => showWindowIfHidden());

  if (getSettingLocal('show-tray-balloon')) {
    state.tray.displayBalloon({
      title: 'Topher\'s Modular Command Palette',
      content: 'TMCP lives in your system tray! Check it out!'
    });
  }
}