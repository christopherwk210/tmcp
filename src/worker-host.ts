import { ref } from 'vue';
import { appState, sortResults } from './state';
import { tmcp } from './tmcp';
import QueryWorker from './worker?worker';

export const workerState = ref({
  pending: false
});

export const queryWorker = new QueryWorker();

queryWorker.addEventListener('message', (event) => {
  const { signal, data } = JSON.parse(event.data);
  switch (signal) {
    case 'query-response':
      workerState.value.pending = false;

      const fullResults = data.map((item: { source: string; text: string; }) => {
        return appState.value.paletteMap[item.text];
      });

      appState.value.queryResults = [
        ...appState.value.pendingQueryResults,
        ...fullResults.filter((item: any) => {
          const source = item.source;
          const plugin = tmcp.plugins.find(plugin => plugin.name === source)!;
          if (plugin) return plugin.resultHandler(item);
          return true;
        })
      ];

      sortResults();

      if (appState.value.queryResults.length > 0) appState.value.selectedIndex = 0;
      break;
  }
});

export function sendPaletteToWorker() {
  const cleanedPalette = appState.value.palette.map(item => {
    const cleanedItem: any = { ...item };
    delete cleanedItem.display;
    delete cleanedItem.action;
    return cleanedItem;
  });

  queryWorker.postMessage(JSON.stringify({
    signal: 'palette-load',
    data: cleanedPalette
  }));
}

export function executeQuery() {
  workerState.value.pending = true;

  queryWorker.postMessage(JSON.stringify({
    signal: 'query',
    data: appState.value.queryText,
  }));
}