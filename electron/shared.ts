import { app } from 'electron';
import * as path from 'path';

export const isDevelopment = !app.isPackaged;
let appPath = path.dirname(app.getPath('exe'));

export const mediaDirectory = isDevelopment ?
  path.join(__dirname, '../media') :
  path.join(appPath, './media');

if (process.env.PORTABLE_EXECUTABLE_FILE) {
  appPath = path.dirname(process.env.PORTABLE_EXECUTABLE_FILE);
}

export const pluginDirectory = isDevelopment ?
  path.join(__dirname, '../build/plugins') :
  path.join(appPath, './plugins');

export const themeDirectory = isDevelopment ?
  path.join(__dirname, '../build/themes') :
  path.join(appPath, './themes');


export const iconPath = path.join(mediaDirectory, 'tmcp.ico');

export function safeParseJSON<T>(json: string): T | null {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}