<script setup lang="ts">
import { computed } from 'vue';
import { appState } from '@/state';
import { electronState, setPluginEnabled, toggleDevTools, openSettingsFile, openPluginsFolder, openThemesFolder, type AppSetting } from '@/electron';
import { sendPaletteToWorker } from '@/worker-host';
import { mountPlugin, unmountPlugin } from '@/plugin-mounting';
import { initializePlugin, uninitializePlugin, tmcp } from '@/tmcp';

import SettingsControl from './settings/SettingsControl.vue';
import SettingsGroup from './settings/SettingsGroup.vue';

const groupedSettings = computed(() => {
  const groupMap = [] as { name: string; settings: AppSetting[] }[];

  for (const setting of electronState.value.settings) {
    const groupName = setting.category;
    
    if (!groupMap.some(group => group.name === groupName)) {
      groupMap.push({ name: groupName, settings: [] });
    }

    groupMap.find(group => group.name === groupName)?.settings.push(setting);
  }

  return groupMap;
});

async function pluginEnabledInput(checked: boolean, pluginName: string) {
  await setPluginEnabled(pluginName, checked);

  if (checked) {
    const rawPlugin = electronState.value.rawPlugins.find(plugin => plugin.name === pluginName)!;
    mountPlugin(rawPlugin);
    await initializePlugin(pluginName);
  } else {
    unmountPlugin(pluginName);
    uninitializePlugin(pluginName);
  }

  sendPaletteToWorker();
  appState.value.queryText = '';
  appState.value.queryResults = appState.value.queryResults.filter(result => result.text === 'TMCP Settings');
  appState.value.selectedIndex = 0;
}

function reload() {
  (window as any).fullReload();
}

function pluginSettingsAsArray(settings: any) {
  return Object.keys(settings).map(key => settings[key] );
}

function pluginButtons(pluginName: string) {
  const tmcpPlugin = tmcp.plugins.find(plugin => plugin.name === pluginName);
  if (!tmcpPlugin) return [];

  return tmcpPlugin.buttons;
}
</script>

<template>
  <div class="settings">
    <template v-for="group of groupedSettings">
      <SettingsGroup>
        <template #header>
          <img class="plugin-header-icon" src="@/assets/tmcp_logo_256.png">
          {{ group.name }}
        </template>
        <template #content>
          <SettingsControl :settings="group.settings" />
        </template>
      </SettingsGroup>
    </template>

    <template v-for="plugin of electronState.pluginSettings">
      <SettingsGroup>
        <template #header>
          <img class="plugin-header-icon" v-if="electronState.pluginMap[plugin.name].icon" :src="electronState.pluginMap[plugin.name].icon">
          Plugin: {{ plugin.name }}
        </template>
        <template #content>
          <div>
            <label class="description-text" v-if="electronState.pluginMap[plugin.name].description">{{ electronState.pluginMap[plugin.name].description }}</label>
            <label class="checkbox-label">
              <input
                type="checkbox"
                :checked="plugin.enabled"
                @input="e => pluginEnabledInput((e.target as HTMLInputElement).checked, plugin.name)"
              />
              Enabled
            </label>
          </div>

          <SettingsControl :plugin="plugin.name" :settings="pluginSettingsAsArray(plugin.settings)" />

          <div class="" v-for="button of pluginButtons(plugin.name)">
            <button @click="button.action()">{{ button.text }}</button>
            <label class="help-text" v-if="button.help">{{ button.help }}</label>
          </div>
        </template>
      </SettingsGroup>
    </template>

    <SettingsGroup>
      <template #header>
        <img class="plugin-header-icon" src="@/assets/tmcp_logo_256.png">
        Extras
      </template>
      <template #content>
        <div class="button-row">
          <button @click="openPluginsFolder()">Open plugins folder</button>
          <button @click="openThemesFolder()">Open themes folder</button> 
        </div>
        <div class="button-row">
          <button @click="toggleDevTools()">Dev tools</button>
          <button @click="openSettingsFile()">Open settings file</button>
          <button @click="reload()">Reload TMCP</button>
        </div>
        <a href="#">Open wiki</a>
      </template>
    </SettingsGroup>
  </div>
</template>

<style scoped>
.settings {
  flex: 1;
  overflow: auto;
}

.settings > *:first-child {
  margin-top: 0;
}

h4 {
  background: var(--borders);
  padding: 0.5em;
  user-select: none;
  margin: 0;
  display: flex;
  align-items: center;
}

.setting-container {
  padding: 1em;
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.description-text {
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.5;
  display: block;
  padding: 0.5rem;
  background: var(--bordersDim);
  margin: -1rem;
  margin-bottom: 1em;
  font-size: 0.85em;
}

.plugin-header-icon {
  height: 1em;
  width: 1em;
  margin-right: 0.5em;
}

.button-row {
  display: flex;
  gap: 1em;
  flex-wrap: wrap;
}
</style>

<style>
.setting-name {
  display: block;
  margin-bottom: 0.25em;
}

.settings select, .settings input[type="text"] {
  display: block;
  width: 100%;
}

.help-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9em;
  margin-top: 0.2em;
  display: block;
  line-height: 1.5;
}
</style>