import * as fsp from 'fs/promises';
import * as path from 'path';
import { pluginDirectory, safeParseJSON } from './shared';
import { pluginSettings, commitPluginSettings } from './settings';

interface PluginConfig {
  name: string;
  description?: string;
  icon?: string;
  scripts: string[];
  styles?: string[];
}

interface PluginConfigLoaded extends Omit<PluginConfig, 'scripts'> {
  scripts: {
    path: string;
    dirpath: string;
    contents: string;
  }[];
}

export const pluginState = {
  plugins: [] as PluginConfigLoaded[]
};

export async function loadPlugins() {
  pluginState.plugins = [];
  pluginSettings.splice(0, pluginSettings.length);

  const contents = await fsp.readdir(pluginDirectory);
  for (const n of contents) {
    const npath = path.join(pluginDirectory, n);
    const nstat = await fsp.stat(npath);
    if (nstat.isDirectory()) {
      await loadPlugin(npath);
    }
  }

  await commitPluginSettings();
}

async function loadPlugin(pluginPath: string) {
  const pluginConfig = await fsp.readFile(path.join(pluginPath, 'config.json'), 'utf8').catch(() => null);
  if (!pluginConfig) return;

  const config = safeParseJSON<PluginConfig>(pluginConfig);
  if (!config) return;

  const scripts: any[] = [];
  for (const script of config.scripts) {
    const scriptPath = path.join(pluginPath, script);
    const scriptContents = await fsp.readFile(scriptPath, 'utf8').catch(() => null);
    if (!scriptContents) return;
    scripts.push({
      path: scriptPath,
      dirpath: path.dirname(scriptPath),
      contents: scriptContents
    });
  }

  if (scripts.some(s => !s)) return;
  config.scripts = scripts;

  if (config.styles) {
    const styles = await Promise.all(
      config.styles
        .map(s => path.join(pluginPath, s))
        .map(s => fsp.readFile(s, 'utf8').catch(() => null))
    );

    if (styles.some(s => !s)) return;
    config.styles = styles as string[];
  }

  if (config.icon) config.icon = path.join(pluginPath, config.icon);

  pluginSettings.push({
    name: config.name,
    enabled: true,
    settings: {}
  });

  pluginState.plugins.push(config as any);
}