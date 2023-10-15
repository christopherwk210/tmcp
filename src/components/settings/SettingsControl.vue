<script setup lang="ts">
import SettingsBool from './SettingsBool.vue';
import SettingsSelect from './SettingsSelect.vue';
import SettingsNumber from './SettingsNumber.vue';
import SettingShortcut from './SettingShortcut.vue';
import SettingsString from './SettingsString.vue';
import { isAppSetting, type Setting } from './shared';

defineProps<{
  settings: Setting[];
  plugin?: string;
}>();
</script>

<template>
  <div v-for="setting of settings">
    <SettingsBool v-if="setting.type === 'boolean'" :setting="setting" :plugin="plugin" />
    <SettingsSelect v-if="setting.type === 'select'" :setting="setting" :plugin="plugin" />
    <SettingsNumber v-if="setting.type === 'number'" :setting="setting" :plugin="plugin" />
    <SettingsString v-if="!(isAppSetting(setting) && setting.key === 'shortcut') && setting.type === 'string'" :setting="setting" :plugin="plugin" />
    <SettingShortcut v-if="isAppSetting(setting) && setting.key === 'shortcut'" :setting="setting" :plugin="plugin" />
    <label class="help-text" v-if="setting.help">{{ setting.help }}</label>
  </div>
</template>