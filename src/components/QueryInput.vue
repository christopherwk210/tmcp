<script setup lang="ts">
import { electron, getSetting, setKeepOpen } from '@/electron';
import { tmcp } from '@/tmcp';
import { appState, executeItemAction, selectedResult } from '@/state';
import { executeQuery } from '@/worker-host';
import { ref, computed } from 'vue';

const queryInput = ref<HTMLInputElement>();

electron.ipcRenderer.on('show-window', () => {
  if (!queryInput.value) return;

  queryInput.value.focus();
});

function onInputUpdate(event: Event) {
  setKeepOpen(false);

  const target = event.target as HTMLInputElement;
  appState.value.queryText = target.value;
  appState.value.fullviewDisplay = false;
  appState.value.pendingQueryResults = [];
  
  if (appState.value.queryText.length < getSetting('min-query-length').value) {
    appState.value.queryResults = [];
    appState.value.selectedIndex = -1;
    return;
  }
  
  tmcp.triggerQuery(appState.value.queryText);
  executeQuery();
}

function onKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowUp':
      if (appState.value.selectedIndex !== 0) {
        appState.value.selectedIndex--;
      } else {
        appState.value.selectedIndex = appState.value.queryResults.length - 1;
      }
      event.preventDefault();
      break;
    case 'ArrowDown':
      if (appState.value.selectedIndex !== appState.value.queryResults.length - 1) {
        appState.value.selectedIndex++;
      } else {
        appState.value.selectedIndex = 0;
      }
      event.preventDefault();
      break;
    case 'Enter':
      const item = selectedResult.value;
      if (!item) return;
      executeItemAction(item);
      break;
  }
}

const showPreview = computed(() => {
  if (!getSetting('preview-result-text').value) return false;
  return appState.value.queryText.length > 0 && appState.value.queryResults.length > 0;
});

const previewText = computed(() => {
  if (!showPreview.value || !selectedResult.value) return '';
  
  const normalizedQuery = appState.value.queryText.toLowerCase();
  const normalizedResult = selectedResult.value.text.toLowerCase();

  if (!normalizedResult.startsWith(normalizedQuery)) return '';

  return appState.value.queryText + selectedResult.value.text.substring(appState.value.queryText.length);
});
</script>

<template>
  <input
    ref="queryInput"
    :value="appState.queryText"
    @keydown="onKeydown"
    @input="onInputUpdate"
    autocomplete="off"
    spellcheck="false"
    class="query"
    type="text"
    placeholder="Start typing..."
  />

  <input
    v-if="showPreview"
    :value="previewText"
    class="query preview-text"
    type="text"
  />

  <div class="query-holder"></div>
</template>

<style scoped>
.query-holder {
  width: 100%;
  height: 100px;
  flex-shrink: 0;
}

.query {
  width: 100%;
  height: 100px;
  padding: 0 65px;
  font-size: 1.5em;
  border: none;
  color: white;
  outline: none;
  background: transparent;
  font-family: inherit;
  display: block;
  flex-shrink: 0;
  position: absolute;
  top: 0;
  left: 0;
}

.preview-text {
  z-index: 10;
  color: white;
  opacity: 0.3;
  pointer-events: none;
}
</style>