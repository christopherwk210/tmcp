<script setup lang="ts">
import { appState, executeItemAction, getPluginForItem, type PaletteItem } from '@/state';
import { getSetting } from '@/electron';

function itemClicked(item: PaletteItem, index: number) {
  if (getSetting('highlight-on-hover').value) {
    executeItemAction(item);
  } else {
    appState.value.selectedIndex = index;
  }
}

function itemHovered(index: number) {
  if (getSetting('highlight-on-hover').value) {
    appState.value.selectedIndex = index
  }
}

function itemDoubleClicked(item: PaletteItem) {
  if (!getSetting('highlight-on-hover').value) {
    executeItemAction(item);
  }
}

function itemHasIcon(item: PaletteItem) {
  if (item.icon) return true;
  return !!getPluginForItem(item)?.icon;
}

function itemIcon(item: PaletteItem) {
  if (item.icon) return item.icon;
  return getPluginForItem(item)?.icon;
}
</script>

<template>
  <div class="items" :class="{ hidden: appState.fullviewDisplay }">
    <div
      class="item"
      v-for="(item, index) of appState.queryResults"
      :class="{ selected: index === appState.selectedIndex }"
      :data-source="item.source"
      @mousemove="itemHovered(index)"
      @click="itemClicked(item, index)"
      @dblclick="itemDoubleClicked(item)"
    >
      <img class="icon" v-if="itemHasIcon(item)" :src="itemIcon(item)" />
      {{ item.text }}
    </div>
  </div>
</template>

<style scoped>
.items {
  overflow: auto;
  height: 100%;
  border-right: 3px solid var(--borders);
  transition: max-width var(--animationSpeed) ease;
  max-width: 50%;
}

.item {
  text-overflow: ellipsis;
  overflow: hidden;
  border-bottom: 1px solid var(--borders);
  padding: 0.5em 0.75em;
  user-select: none;
  color: rgb(188, 188, 188);
  cursor: pointer;
  display: flex;
  align-items: center;

}

.hidden {
  max-width: 0;
  border-right: none;
}

.selected {
  color: var(--background);
  background: var(--highlightColor);
}

.icon {
  height: 1em;
  width: 1em;
  margin-right: 0.75em;
}
</style>