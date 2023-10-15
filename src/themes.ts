import { ref } from 'vue';
import { getThemes, getSetting, type ThemeConfig } from './electron';

const themeState = ref({
  themes: [] as ThemeConfig[]
});

export async function loadThemes() {
  console.time('🎨 Loading themes');
  themeState.value.themes = await getThemes();
  applyTheme(getSetting('theme').value);
  console.timeEnd('🎨 Loading themes');
}

export function applyTheme(themeName: string) {
  removeTheme();
  const theme = themeState.value.themes.find(t => t.name === themeName);
  if (!theme) return;

  for (const style of theme.styles) {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = style;
    styleTag.type = 'text/css';
    styleTag.dataset.theme = themeName;
    styleTag.dataset.source = 'tmcp-theme';
    document.body.appendChild(styleTag);
  }
}

function removeTheme() {
  const themeTags = document.querySelectorAll('style[data-source="tmcp-theme"]');
  for (const tag of themeTags) {
    tag.remove();
  }
}