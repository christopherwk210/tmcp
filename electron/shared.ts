import { app } from 'electron';
import * as path from 'path';

export const isDevelopment = !app.isPackaged;

export const pluginDirectory = isDevelopment ?
  path.join(__dirname, '../build/plugins') :
  '';

export const themeDirectory = isDevelopment ?
  path.join(__dirname, '../build/themes') :
  '';

export const mediaDirectory = isDevelopment ?
  path.join(__dirname, '../media') :
  '';

export const iconPath = path.join(mediaDirectory, 'tmcp.ico');

export function safeParseJSON<T>(json: string): T | null {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}