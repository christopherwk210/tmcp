<script setup lang="ts">
import { isAppSetting, setSetting, type Setting } from './shared';
import { electronState, setPluginSettings } from '@/electron';

const props = defineProps<{
  setting: Setting;
  plugin?: string;
}>();

async function inputBlur(event: Event, setting: Setting) {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  if (isAppSetting(setting)) {
    setSetting(setting.key, value);
  } else {
    const plugin = electronState.value.pluginSettings.find(plugin => plugin.name === props.plugin!)!;
    plugin.settings[setting.text].value = value;
    setPluginSettings(props.plugin!, plugin.settings);
  }
}

async function inputKeydown(event: KeyboardEvent, setting: Setting) {
  if (event.key === 'Enter') {
    inputBlur(event, setting);
  }
}
</script>

<template>
  <label class="setting-name">{{ setting.text }}</label>
  <input
    spellcheck="false"
    autocomplete="off"
    type="text"
    :value="setting.value"
    @blur="e => inputBlur(e, setting)"
    @keydown="e => inputKeydown(e, setting)"
  >
</template>