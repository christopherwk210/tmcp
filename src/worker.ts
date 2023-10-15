import type { PaletteItem } from './state';

const state = {
  palette: [] as PaletteItem[]
};

self.addEventListener('message', (e) => {
  const { signal, data } = JSON.parse(e.data);
  switch (signal) {
    case 'palette-load':
      state.palette = data;
      break;
    case 'query':
      search(data)
      break;
  }
});

function search(query: string) {
  const results = [];
  const includesResults = [];

  const normalizedQuery = query.toLowerCase();
  for (const item of state.palette) {
    const normalizedItemText = item.text.toLowerCase();
    if (normalizedItemText.startsWith(normalizedQuery)) {
      results.push(item);
    } else if (normalizedItemText.includes(normalizedQuery)) {
      includesResults.push(item);
    }
  }

  postMessage(JSON.stringify({
    signal: 'query-response',
    data: [...results, ...includesResults]
  }));
}