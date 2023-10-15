<script setup lang="ts">
import { isAppSetting, setSetting, type Setting } from './shared';
import { applyTheme } from '@/themes';
import { electronState, setPluginSettings } from '@/electron';

const props = defineProps<{
  setting: Setting;
  plugin?: string;
}>();

function dropdownInput(value: string, setting: Setting) {
  if (isAppSetting(setting)) {
    setSetting(setting.key, value);
    
    if (setting.key === 'theme') applyTheme(value);
  } else {
    const plugin = electronState.value.pluginSettings.find(plugin => plugin.name === props.plugin!)!;
    plugin.settings[setting.text].value = value;
    setPluginSettings(props.plugin!, plugin.settings);
  }
}
</script>

<template>
  <label class="setting-name">{{ setting.text }}</label>
  <select :value="setting.value" @input="e => dropdownInput((e.target as HTMLSelectElement).value, setting)">
    <option v-for="option of setting.options" :value="option">{{ option }}</option>
  </select>
</template>