import { computed, ref, watch } from 'vue';
import { electron, electronState, type PluginConfig } from './electron';
import tmcpLogo from '@/assets/tmcp_logo_256.png';

export interface PaletteItem {
  source: string;
  text: string;
  action?: () => any;
  keepOpen?: boolean;
  icon?: string;
  display?: {
    type: 'markdown' | 'html';
    content: string;
  };
}

export const appState = ref({
  queryText: '',
  palette: [] as PaletteItem[],
  paletteMap: {} as Record<string, PaletteItem>,
  queryResults: [] as PaletteItem[],
  selectedIndex: -1,
  fullviewDisplay: false,
  pendingQueryResults: [] as PaletteItem[]
});

export const selectedResult = computed(() => {
  if (appState.value.selectedIndex === -1) return null;
  return appState.value.queryResults[appState.value.selectedIndex];
});

export function executeItemAction(item: PaletteItem) {
  const action = item.action;
  if (action) {
    action();
    electron.ipcRenderer.send('hide-window');
  }
}

export function getPluginForItem(item: PaletteItem): PluginConfig {
  if (item.source === 'tmcp') {
    return {
      name: 'TMCP',
      scripts: [],
      icon: tmcpLogo
    } as PluginConfig;
  }

  const plugin = electronState.value.pluginMap[item.source];
  return plugin;
}

function scrollItemIntoView(index: number) {
  const items = document.querySelectorAll('.item');
  const item = items[index];
  if (!item) return;
  item.scrollIntoView({ block: 'nearest' });
}

watch(() => appState.value.selectedIndex, () => {
  scrollItemIntoView(appState.value.selectedIndex);
});

export function sortResults() {
  /**
   * Sorting rules:
   * 1. If appState.value.queryText starts with the item text, it should appear first
   * 2. Otherwise, sort alphabetically
   */
  appState.value.queryResults.sort((a, b) => {
    const aText = a.text.toLowerCase();
    const bText = b.text.toLowerCase();
    const queryText = appState.value.queryText.toLowerCase();

    if (aText.startsWith(queryText) && !bText.startsWith(queryText)) return -1;
    if (!aText.startsWith(queryText) && bText.startsWith(queryText)) return 1;
    if (aText < bText) return -1;
    if (aText > bText) return 1;
    return 0;
  });
}