<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const container = ref<HTMLDivElement>();
const loaded = ref(false);
const targetHeight = ref(0);
const expanded = ref(true);

onMounted(() => {
  if (!container.value) return;

  targetHeight.value = container.value.clientHeight;
  loaded.value = true;
});

const containerStyle = computed(() => {
  if (!loaded.value) return {};

  return {
    maxHeight: expanded.value ? `${targetHeight.value}px` : '0px'
  };
});
</script>

<template>
  <h4 @click="expanded = !expanded" :class="{ expanded: expanded }">
    <slot name="header" />
    <svg class="arrow" xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M6 9l6 6l6 -6" />
    </svg>
  </h4>

  <div class="setting-container" ref="container" :style="containerStyle" :class="{ expanded: expanded }">
    <div class="setting-container-inner">
      <slot name="content" />
    </div>
  </div>
</template>

<style scoped>
h4 {
  background: var(--borders);
  padding: 0.5em;
  user-select: none;
  margin: 0;
  display: flex;
  align-items: center;
  position: relative;
}

h4, h4 * {
  cursor: pointer;
}

h4:hover {
  background: var(--bordersHighlight);
}

.arrow {
  position: absolute;
  right: 0;
  height: 100%;
  transition: transform var(--animationSpeed) ease;
  transform: scaleY(-1);
}

.expanded .arrow {
  transform: scaleY(1);
}

.setting-container {
  display: flex;
  flex-direction: column;
  transition: max-height var(--animationSpeed) ease;
  overflow: hidden;
}

.setting-container-inner {
  flex: 1;
  padding: 1em;
  display: flex;
  flex-direction: column;
  gap: 1em;
}
</style>