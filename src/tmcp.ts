import { marked } from 'marked';
import { appState, sortResults, type PaletteItem } from './state';
import { builtInItems } from './built-in-items';
import { electronState, setPluginSettings, type AppSetting } from './electron';
import { workerState } from './worker-host';

interface TMCPRegisterOptions {
  init: (tmcp: any) => Promise<any | void> | void | any;
}

interface TMCPPlugin {
  name: string;
  options: TMCPRegisterOptions;
  buttons: PluginSettingButton[];
  resultHandler: (result: any) => boolean;
  showHandler: () => void;
  displayMountedHandler: () => void;
  queryHandler?: (query: string, addItem: (options: PaletteItem) => void) => any;
}

class TMCP {
  plugins: TMCPPlugin[] = [];

  get queryText() {
    return appState.value.queryText;
  }

  register(pluginName: string, options: TMCPRegisterOptions) {
    this.plugins.push({
      name: pluginName,
      options,
      buttons: [],
      resultHandler: () => true,
      showHandler: () => {},
      displayMountedHandler: () => {}
    });
  }

  triggerQuery(query: string) {
    for (const plugin of this.plugins) {
      if (plugin.queryHandler) {
        plugin.queryHandler(query, (options: PaletteItem) => {
          if (options.display) {
            if (options.display.type === 'markdown') {
              options.display.type = 'marked-html' as any;
              options.display.content = marked(options.display.content);
            }
          }
    
          const item = {
            ...options,
            source: plugin.name
          };
    
          if (workerState.value.pending) {
            appState.value.queryResults.push(item);
            sortResults();
          } else {
            appState.value.pendingQueryResults.push(item);
          }
        });
      }
    }
  }
}

export const tmcp = new TMCP();

export async function tmcpInit() {
  console.time('✅ Initializing all plugins in parallel');

  await Promise.all(
    tmcp.plugins
      .filter(plugin => electronState.value.pluginSettings.find(pluginSetting => pluginSetting.name === plugin.name)!.enabled)
      .map(plugin => initializePlugin(plugin.name))
  );

  console.timeEnd('✅ Initializing all plugins in parallel');

  for (const builtInItem of builtInItems) {
    appState.value.paletteMap[builtInItem.text] = builtInItem;
    appState.value.palette.push(builtInItem);
  }
}

export async function initializePlugin(pluginName: string) {
  const plugin = tmcp.plugins.find(plugin => plugin.name === pluginName)!;
  console.time(`⚙️ Initializing plugin: ${plugin.name}`);

  const init = plugin.options.init(createTmcpOpForPlugin(plugin));
  if (init instanceof Promise) await init;
  await commitSettingsForPlugin(plugin);

  console.timeEnd(`⚙️ Initializing plugin: ${plugin.name}`);
}

export type PluginSetting = Omit<AppSetting, 'category' | 'key'>;
export interface PluginSettingButton {
  text: string;
  help?: string;
  action: () => void;
}

function createTmcpOpForPlugin(plugin: TMCPPlugin) {
  const tmcpOp = {
    addItem(options: PaletteItem) {
      if (options.display) {
        if (options.display.type === 'markdown') {
          options.display.type = 'marked-html' as any;
          options.display.content = marked(options.display.content);
        }
      }

      const item = {
        ...options,
        source: plugin.name
      };

      appState.value.paletteMap[options.text] = item;
      appState.value.palette.push(item);
    },

    addSetting(settingsOptions: PluginSettingButton) {
      const pluginSetting = electronState.value.pluginSettings.find(pluginSetting => pluginSetting.name === plugin.name)!;
      if (pluginSetting.settings[settingsOptions.text] === undefined) {
        pluginSetting.settings[settingsOptions.text] = settingsOptions;
      }

      return (newValue?: any) => {
        const pluginSetting = electronState.value.pluginSettings.find(pluginSetting => pluginSetting.name === plugin.name)!;
        if (newValue !== undefined) {
          pluginSetting.settings[settingsOptions.text].value = newValue;
          commitSettingsForPlugin(plugin);
        } else {
          return pluginSetting.settings[settingsOptions.text].value;
        }
      };
    },

    addSettingButton(settingsOptions: PluginSettingButton) {
      plugin.buttons.push(settingsOptions);
    },

    onResult(handler: (result: any) => boolean) {
      plugin.resultHandler = handler;
    },

    onShow(handler: () => void) {
      plugin.showHandler = handler;
    },

    onQuery(handler: (query: string, addItem: (options: PaletteItem) => void) => any) {
      plugin.queryHandler = handler;
    },

    onDisplay(handler: () => void) {
      plugin.displayMountedHandler = handler;
    }
  };

  return tmcpOp;
}

async function commitSettingsForPlugin(plugin: TMCPPlugin) {
  const pluginSetting = electronState.value.pluginSettings.find(pluginSetting => pluginSetting.name === plugin.name)!;
  await setPluginSettings(pluginSetting.name, JSON.parse(JSON.stringify(pluginSetting.settings)));
}

export function uninitializePlugin(pluginName: string) {
  console.log('⚙️ Uninitializing plugin:', pluginName);

  const pluginItems = appState.value.palette.filter(item => item.source === pluginName);
  for (const pluginItem of pluginItems) {
    delete appState.value.paletteMap[pluginItem.text];
  }

  appState.value.palette = appState.value.palette.filter(item => item.source !== pluginName);
  tmcp.plugins = tmcp.plugins.filter(plugin => plugin.name !== pluginName);
}