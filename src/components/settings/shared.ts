import type { AppSetting } from '@/electron';
import type { PluginSetting } from '@/tmcp';

export { type AppSetting, setSetting } from '@/electron';
export { type PluginSetting } from '@/tmcp';

export type Setting = AppSetting | PluginSetting;

export function isAppSetting(setting: AppSetting | PluginSetting): setting is AppSetting {
  return (setting as AppSetting).key !== undefined;
}

