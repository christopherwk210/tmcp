<script setup lang="ts">
import { isAppSetting, setSetting, type Setting } from './shared';
import { electronState, setPluginSettings } from '@/electron';

const props = defineProps<{
  setting: Setting;
  plugin?: string;
}>();

async function numberBlur(event: Event, setting: Setting) {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  let parsedValue = Math.floor(+value);

  if (isNaN(parsedValue)) {
    target.value = setting.value;
    return;
  }

  if (setting.min !== undefined && parsedValue < setting.min) {
    parsedValue = setting.min;
    target.value = parsedValue.toString();
  }

  if (setting.max !== undefined && parsedValue > setting.max) {
    parsedValue = setting.max;
    target.value = parsedValue.toString();
  }

  if (isAppSetting(setting)) {
    setSetting(setting.key, parsedValue);
  } else {
    const plugin = electronState.value.pluginSettings.find(plugin => plugin.name === props.plugin!)!;
    plugin.settings[setting.text].value = parsedValue;
    setPluginSettings(props.plugin!, plugin.settings);
  }
}

async function numberKeydown(event: KeyboardEvent, setting: Setting) {
  if (event.key === 'Enter') {
    numberBlur(event, setting);
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
    @blur="e => numberBlur(e, setting)"
    @keydown="e => numberKeydown(e, setting)"
  >
</template>