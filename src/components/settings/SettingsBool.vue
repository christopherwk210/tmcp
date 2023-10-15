<script setup lang="ts">
import { isAppSetting, setSetting, type Setting } from './shared';
import { electronState, setPluginSettings } from '@/electron';

const props = defineProps<{
  setting: Setting;
  plugin?: string;
}>();

function checkboxInput(checked: boolean, setting: Setting) {
  if (isAppSetting(setting)) {
    setSetting(setting.key, checked);
  } else {
    const plugin = electronState.value.pluginSettings.find(plugin => plugin.name === props.plugin!)!;
    plugin.settings[setting.text].value = checked;
    setPluginSettings(props.plugin!, plugin.settings);
  }
}
</script>

<template>
  <label class="checkbox-label">
    <input
      type="checkbox"
      :checked="setting.value"
      @input="e => checkboxInput((e.target as HTMLInputElement).checked, setting)"
    />
    {{ setting.text }}
  </label>
</template>