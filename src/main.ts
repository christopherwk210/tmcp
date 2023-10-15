import './assets/jet-brains-mono.css';
import './assets/global.css';

import { createApp } from 'vue';
import { electron, ignoreMouse, unignoreMouse } from './electron';
import { appState } from './state';
import { sendPaletteToWorker } from './worker-host';
import { tmcp, tmcpInit } from './tmcp';
import { loadThemes } from './themes';
import { loadPlugins, loadSettings } from './electron';

import App from './App.vue';

(async () => {
  (window as any)._tmcp = tmcp;

  await loadSettings();
  await loadThemes();
  await loadPlugins();
  await tmcpInit();

  sendPaletteToWorker();

  electron.ipcRenderer.on('hide-window', () => {
    appState.value.queryText = '';
    appState.value.queryResults = [];
    appState.value.selectedIndex = -1;
    appState.value.fullviewDisplay = false;
  });

  electron.ipcRenderer.on('show-settings', () => {
    appState.value.queryResults = [
      {
        source: 'tmcp',
        text: 'TMCP Settings'
      }
    ];

    appState.value.selectedIndex = 0;
    appState.value.fullviewDisplay = true;
  });

  electron.ipcRenderer.on('show-window', () => {
    tmcp.plugins.forEach(plugin => plugin.showHandler());
  });

  console.log('👍 Ready!');

  const app = createApp(App);
  app.mount('#app');
})();

window.addEventListener('keydown', event => {
  switch (event.key) {
    case 'Escape':
      electron.ipcRenderer.send('hide-window');
      break;
    case 'Tab':
      appState.value.fullviewDisplay = !appState.value.fullviewDisplay;
      event.preventDefault();
      break;
  }
});

let ignoringMouse = false;
window.addEventListener('mousemove', e => {
  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  
  if (elements.some(el => el.classList.contains('container'))) {
    if (ignoringMouse) {
      ignoringMouse = false;
      unignoreMouse();
    }
  } else {
    if (!ignoringMouse) {
      ignoringMouse = true;
      ignoreMouse();
    }
  }
});

document.addEventListener('dragover', e => { e.preventDefault(); return false; }, false);
document.addEventListener('drop', e => { e.preventDefault(); return false; }, false);