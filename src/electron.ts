import { ref } from 'vue';
import type { default as electronType } from 'electron';
import { mountPlugin } from './plugin-mounting';

export interface PluginConfig {
  name: string;
  description?: string;
  icon?: string;
  scripts: {
    path: string;
    dirpath: string;
    contents: string;
  }[];
  styles?: string[];
}

export const electron: typeof electronType = window.require('electron');

export const electronState = ref({
  rawPlugins: [] as PluginConfig[],
  plugins: [] as PluginConfig[],
  pluginMap: {} as Record<string, PluginConfig>,
  settings: [] as AppSetting[],
  pluginSettings: [] as PluginSetting[]
});

export async function loadPlugins() {
  const plugins: PluginConfig[] = await electron.ipcRenderer.invoke('get-plugins');
  electronState.value.rawPlugins = JSON.parse(JSON.stringify(plugins));

  for (const plugin of plugins) {
    if (electronState.value.pluginSettings.find(pluginSetting => pluginSetting.name === plugin.name)!.enabled) {
      mountPlugin(plugin);
    }

    if (!electronState.value.pluginMap[plugin.name]) {
      const cleanedPlugin: any = { ...plugin };
      delete cleanedPlugin.scripts;
      delete cleanedPlugin.styles;
      
      electronState.value.plugins.push(cleanedPlugin);
      electronState.value.pluginMap[plugin.name] = cleanedPlugin;
    }
  }
}

export async function fullReload() {
  await electron.ipcRenderer.invoke('reload-plugins');
  location.reload();
}

(window as any).fullReload = fullReload;

export interface AppSetting {
  text: string;
  help?: string;
  category: string;
  options?: string[];
  key: string;
  type: string;
  value: any;
  min?: number;
  max?: number;
}

export async function loadSettings() {
  electronState.value.settings = await electron.ipcRenderer.invoke('get-settings');
  electronState.value.pluginSettings = await electron.ipcRenderer.invoke('get-plugin-settings');
}

export interface ThemeConfig {
  name: string;
  styles: string[];
}

export async function getThemes(): Promise<ThemeConfig[]> {
  return await electron.ipcRenderer.invoke('get-themes');
}

export function getSetting(key: string) {
  return electronState.value.settings.find(setting => setting.key === key)!;
}

export async function setSetting(key: string, value: any) {
  const setting = getSetting(key);
  setting.value = value;
  await electron.ipcRenderer.invoke('set-setting', key, value);
}

export interface PluginSetting {
  name: string;
  enabled: boolean;
  settings: any;
}

export async function setPluginEnabled(name: string, enabled: boolean) {
  const setting = electronState.value.pluginSettings.find(s => s.name === name);
  if (!setting) throw new Error(`Setting ${name} not found`);
  setting.enabled = enabled;
  await electron.ipcRenderer.invoke('set-plugin-enabled', name, setting.enabled);
}

export async function setPluginSettings(name: string, settings: any) {
  const pluginSetting = electronState.value.pluginSettings.find(s => s.name === name)!;
  pluginSetting.settings = settings;
  await electron.ipcRenderer.invoke('set-plugin-settings', name, JSON.parse(JSON.stringify(settings)));
}

export function toggleDevTools() {
  electron.ipcRenderer.send('toggle-dev-tools');
}

export function openSettingsFile() {
  electron.ipcRenderer.send('open-settings-file');
}

export function openPluginsFolder() {
  electron.ipcRenderer.send('open-plugins-folder');
}

export function openThemesFolder() {
  electron.ipcRenderer.send('open-themes-folder');
}

export function ignoreMouse() {
  electron.ipcRenderer.send('ignore-mouse');
}

export function unignoreMouse() {
  electron.ipcRenderer.send('unignore-mouse');
}

export function setKeepOpen(keepOpen: boolean) {
  electron.ipcRenderer.send('set-keep-open', keepOpen);
}