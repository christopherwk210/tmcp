<script setup lang="ts">
import { ref } from 'vue';
import { setSetting, type AppSetting } from './shared';

defineProps<{
  setting: AppSetting;
  plugin?: string;
}>();

const shortcutKeys = ref<string[]>([]);

function shortcutKeydown(event: KeyboardEvent, setting: AppSetting) {
  event.preventDefault();
  
  const key = event.key;
  if (!shortcutKeys.value.includes(key)) {
    shortcutKeys.value.push(key);
  }
}

function shortcutKeyup(event: KeyboardEvent, setting: AppSetting) {
  event.preventDefault();
  if (shortcutKeys.value.length === 0) return;

  let accelerator = '';

  if (shortcutKeys.value.includes('Control')) {
    accelerator += 'Ctrl+';
    shortcutKeys.value = shortcutKeys.value.filter(key => key !== 'Control');
  }

  if (shortcutKeys.value.includes('Shift')) {
    accelerator += 'Shift+';
    shortcutKeys.value = shortcutKeys.value.filter(key => key !== 'Shift');
  }

  if (shortcutKeys.value.includes('Alt')) {
    accelerator += 'Alt+';
    shortcutKeys.value = shortcutKeys.value.filter(key => key !== 'Alt');
  }

  if (shortcutKeys.value.includes('Meta')) {
    accelerator += 'Meta+';
    shortcutKeys.value = shortcutKeys.value.filter(key => key !== 'Meta');
  }

  shortcutKeys.value = shortcutKeys.value.filter(key => key !== 'Control' && key !== 'Shift' && key !== 'Alt' && key !== 'Meta');

  if (shortcutKeys.value.length > 0) {
    shortcutKeys.value = shortcutKeys.value.map(key => {
      if (key === ' ') return 'Space';
      return key;
    });
  
    accelerator += shortcutKeys.value.join('+');
    setSetting(setting.key, accelerator);
  }

  shortcutKeys.value = [];
}
</script>

<template>
  <label class="setting-name">{{ setting.text }}</label>
  <input
    spellcheck="false"
    autocomplete="off"
    type="text"
    :value="setting.value"
    @keydown="e => shortcutKeydown(e, setting)"
    @keyup="e => shortcutKeyup(e, setting)"
    @focus="e => shortcutKeys = []"
  >
</template>