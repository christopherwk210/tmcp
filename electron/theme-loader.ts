import * as fsp from 'fs/promises';
import * as path from 'path';
import { themeDirectory, safeParseJSON } from './shared';

interface ThemeConfig {
  name: string;
  styles: string[];
}

export const themeState = {
  themes: [] as ThemeConfig[]
};

export async function loadThemes() {
  themeState.themes = [];

  const contents = await fsp.readdir(themeDirectory);
  for (const n of contents) {
    const npath = path.join(themeDirectory, n);
    const nstat = await fsp.stat(npath);
    if (nstat.isDirectory()) {
      await loadTheme(npath);
    }
  }

  themeState.themes.sort((a, b) => a.name.localeCompare(b.name));
}

async function loadTheme(themePath: string) {
  const pluginConfig = await fsp.readFile(path.join(themePath, 'config.json'), 'utf8').catch(() => null);
  if (!pluginConfig) return;

  const config = safeParseJSON<ThemeConfig>(pluginConfig);
  if (!config) return;

  const styles = await Promise.all(
    config.styles
      .map(s => path.join(themePath, s))
      .map(s => fsp.readFile(s, 'utf8').catch(() => null))
  );

  if (styles.some(s => !s)) return;
  config.styles = styles as string[];

  themeState.themes.push(config);
}