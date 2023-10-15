<script setup lang="ts">
import { appState } from './state';
import { getSetting } from './electron';

import QueryInput from './components/QueryInput.vue';
import ItemList from './components/ItemList.vue';
import Display from './components/Display.vue';
import { computed } from 'vue';

const containerStyle = computed(() => {
  const targetHeight = getSetting('height').value;

  if (appState.value.queryResults.length > 0) {
    return { height: `${targetHeight}px` };
  } else {
    return { height: '100px' };
  }
});
</script>

<template>
  <div class="container" :style="containerStyle">
    <QueryInput />
    <div class="results">
      <ItemList />
      <Display />
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100px;
  padding: 0;
  background-color: var(--background);
  border: solid 3px var(--borders);
  border-radius: 50px;
  border-radius: 25px;
  transition: height var(--animationSpeed) ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.results {
  flex: 1;
  display: flex;
  border-top: 3px solid var(--borders);
  overflow: hidden;
}
</style>

<style>
.results > * {
  flex: 1;
  width: 50%;
}
</style>