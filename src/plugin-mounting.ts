import { type PluginConfig } from './electron';

export function mountPlugin(plugin: PluginConfig) {
  console.info(`⚒️ Mounting plugin: ${plugin.name}`);

  // const combinedScriptContent = plugin.scripts.join('\n');
  let combinedScriptContent = `let __dirname = '', __filename = '';\n`;
  for (const script of plugin.scripts) {
    combinedScriptContent +=
    `__dirname = '${script.dirpath.replace(/\\/g, '\\\\')}';\n` +
    `__filename = '${script.path.replace(/\\/g, '\\\\')}';\n` +
    `${script.contents}\n`;
  }

  const scriptElement = document.createElement('script');
  scriptElement.textContent = 
  `_tmcp.register('${plugin.name}', {\n`
  + `\tinit: async (tmcp) => {\n${combinedScriptContent}\n`
  + `\t}\n`
  + `});`;
  scriptElement.dataset.pluginName = plugin.name;
  document.head.appendChild(scriptElement);

  for (const style of plugin.styles || []) {
    const styleElement = document.createElement('style');
    styleElement.textContent = style;
    styleElement.dataset.pluginName = plugin.name;
    document.head.appendChild(styleElement);
  }
}

export function unmountPlugin(pluginName: string) {
  console.log('⚒️ Unmounting plugin:', pluginName);

  const pluginScripts = document.head.querySelectorAll(`script[data-plugin-name="${pluginName}"]`);
  for (const pluginScript of pluginScripts) {
    pluginScript.remove();
  }

  const pluginStyles = document.head.querySelectorAll(`style[data-plugin-name="${pluginName}"]`);
  for (const pluginStyle of pluginStyles) {
    pluginStyle.remove();
  }
}