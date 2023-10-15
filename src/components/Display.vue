<script setup lang="ts">
import { nextTick } from 'vue';
import { selectedResult } from '@/state';
import { tmcp } from '@/tmcp';
import { setKeepOpen } from '@/electron';

import Settings from './Settings.vue';
import Info from './Info.vue';

function onDisplay() {
  if (selectedResult.value) {
    setKeepOpen(!!selectedResult.value.keepOpen);
  }

  nextTick().then(() => {
    tmcp.plugins.forEach(plugin => {
      if (!selectedResult.value) return false;
      if (plugin.name === selectedResult.value.source) {
        plugin.displayMountedHandler();
        return true;
      }
    });
  });

  return false;
}
</script>

<template>
  <div v-if="selectedResult && selectedResult.display" class="display">
    <div
      v-if="selectedResult.display.type === 'html'"
      :data-source="selectedResult.source"
      class="html"
      v-html="selectedResult.display.content"
    ></div>

    <div
      v-if="selectedResult.display.type === ('marked-html' as any)"
      :data-source="selectedResult.source"
      class="marked-html"
      v-html="selectedResult.display.content"
    ></div>

    <!-- a hack I came up with to get a callback without an extra watcher lol -->
    <template v-if="onDisplay()"></template>
  </div>

  <Settings v-if="selectedResult && selectedResult.text === 'TMCP Settings'" />
  <Info v-if="selectedResult && selectedResult.text === 'TMCP Info'" />
</template>

<style scoped>
.display {
  display: flex;
}

.display > * {
  flex: 1;
}

.marked-html {
  padding: 1em;
  overflow: auto;
}
</style>

<style>
.marked-html > *:first-child {
  margin-top: 0;
}

.marked-html table {
  border-collapse: collapse;
  border-spacing: 0;
  border: 1px solid #ddd;
}

.marked-html table td,
.marked-html table th {
  border: 1px solid #ddd;
  padding: 5px;
}
</style>