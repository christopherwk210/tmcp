import settings from 'electron-settings';
import { themeState } from './theme-loader';

settings.configure({
  prettify: true
});

interface AppSetting {
  key: string;
  type: string;
  text: string;
  help?: string;
  value: any;
  category: string;
  options?: string[];
  min?: number;
  max?: number;
}

export const appSettings: AppSetting[] = [
  {
    text: 'Preview result text',
    help: 'Show the text of the selected item over your input box, when possible.',
    category: 'UI',
    key: 'preview-result-text',
    type: 'boolean',
    value: true
  },
  {
    text: 'Window width',
    help: 'Default: 960',
    category: 'UI',
    key: 'width',
    type: 'number',
    value: 960,
    min: 300,
    max: 1920
  },
  {
    text: 'Window max height',
    help: 'Default: 600',
    category: 'UI',
    key: 'height',
    type: 'number',
    value: 600,
    min: 300,
    max: 1080
  },
  {
    text: 'Theme',
    category: 'UI',
    key: 'theme',
    type: 'select',
    options: [],
    value: 'Default'
  },

  {
    text: 'Shortcut',
    help: `This key combination will open the palette window.`,
    category: 'Behavior',
    key: 'shortcut',
    type: 'string',
    value: 'Control+Alt+Space'
  },
  {
    text: 'Hide window on blur',
    help: 'Hide the palette window automatically when it loses focus.',
    category: 'Behavior',
    key: 'hide-on-blur',
    type: 'boolean',
    value: true
  },
  {
    text: 'Highlight on hover',
    help: `Allow highlighting results by hovering over them with the mouse, and clicking to execute that item's action.`
    + ` When disabled, clicking on an item highlights it, and double clicking executes it.`,
    category: 'Behavior',
    key: 'highlight-on-hover',
    type: 'boolean',
    value: true
  },
  {
    text: 'Minimum query length',
    help: `The minimum number of characters required before executing a search. Lower values will cause more frequent searches, but potentially slower results.`,
    category: 'Behavior',
    key: 'min-query-length',
    type: 'number',
    value: 3,
    min: 1,
    max: 10
  },
  {
    text: 'Show notification on launch',
    key: 'show-tray-balloon',
    category: 'Behavior',
    type: 'boolean',
    value: true
  }
];

export const defaultSettings = JSON.parse(JSON.stringify(appSettings));

export async function setSetting(key: string, value: any) {
  const setting = appSettings.find(s => s.key === key);
  if (!setting) throw new Error(`Setting ${key} not found`);
  setting.value = value;
  await settings.set(key, value);
}

export async function getSetting<T>(key: string): Promise<T> {
  const setting = await settings.get(key);
  return setting as T;
}

export function getSettingLocal<T>(key: string) {
  const setting = appSettings.find(s => s.key === key);
  if (!setting) throw new Error(`Setting ${key} not found`);
  return setting.value as T;
}

export async function resetSetting(key: string) {
  const setting = appSettings.find(s => s.key === key);
  if (!setting) throw new Error(`Setting ${key} not found`);
  setting.value = defaultSettings.find(s => s.key === key)!.value;
  await settings.set(key, setting.value);
}

export async function loadSettings() {
  for (const setting of appSettings) {
    const value = await settings.get(setting.key);
    if (value === undefined) {
      await settings.set(setting.key, setting.value);
    } else {
      setting.value = value as any;
    }
  }

  await applyLoadedThemes();
}

export async function applyLoadedThemes() {
  const themeSetting = appSettings.find(s => s.key === 'theme')!;
  themeSetting.options = [
    'Default',
    ...themeState.themes.map(t => t.name)
  ];

  if (!themeSetting.options.includes(themeSetting.value)) {
    themeSetting.value = themeSetting.options[0];
    await settings.set(themeSetting.key, themeSetting.value);
  }
}

export async function saveSettings() {
  for (const setting of appSettings) {
    await settings.set(setting.key, setting.value);
  }
}

export async function resetSettingsToDefault() {
  for (const setting of defaultSettings) {
    await settings.set(setting.key, setting.value);
  }
}

interface PluginSetting {
  name: string;
  enabled: boolean;
  settings: any;
}

export const pluginSettings: PluginSetting[] = [];

export async function commitPluginSettings() {
  for (const pluginSetting of pluginSettings) {
    const exists = await settings.has(pluginSetting.name);
    if (!exists) {
      await settings.set(pluginSetting.name, pluginSetting as any);
    } else {
      const existingSettings: PluginSetting = await settings.get(pluginSetting.name) as any;
      pluginSetting.enabled = existingSettings.enabled;
      pluginSetting.settings = existingSettings.settings;
    }
  }
}

export async function setPluginEnabled(name: string, enabled: boolean) {
  const setting = pluginSettings.find(s => s.name === name);
  if (!setting) throw new Error(`Setting ${name} not found`);
  setting.enabled = enabled;
  await settings.set(`${name}.enabled`, enabled);
}

export async function setPluginSettings(name: string, settings: any) {
  const setting = pluginSettings.find(s => s.name === name);
  if (!setting) throw new Error(`Setting ${name} not found`);
  setting.settings = settings;
  await settings.set(`${name}.settings`, settings);
}