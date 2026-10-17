import { app, BrowserWindow, shell } from 'electron';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

const configDirectory = app.isPackaged ? process.resourcesPath : app.getAppPath();
const envPath = path.join(configDirectory, '.env');
const exampleEnvPath = path.join(configDirectory, '.env.example');
dotenv.config({ path: fs.existsSync(envPath) ? envPath : exampleEnvPath });

function getCurrentUrl(): URL {
  const value = process.env.CURRENT_URL?.trim();
  if (!value) {
    throw new Error('Missing CURRENT_URL. Set the page URL in the local .env file.');
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error('CURRENT_URL must be an absolute HTTP or HTTPS URL.');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('CURRENT_URL must use HTTP or HTTPS.');
  }

  return parsed;
}

function openExternal(url: string): void {
  void shell.openExternal(url).catch((error: unknown) => {
    console.error('[external link] failed to open:', error);
  });
}

function createWindow(currentUrl: URL): void {
  const targetOrigin = currentUrl.origin;
  const window = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 720,
    minHeight: 560,
    title: 'Electron Embedding Lab',
    backgroundColor: '#f5f7fb',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) openExternal(url);
    return { action: 'deny' };
  });

  window.webContents.on('will-navigate', (event, url) => {
    try {
      const parsed = new URL(url);
      if (parsed.origin !== targetOrigin) {
        event.preventDefault();
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') openExternal(url);
      }
    } catch {
      event.preventDefault();
    }
  });

  window.webContents.once('did-finish-load', () => {
    console.log(`[app] loaded ${currentUrl.toString()}`);
  });

  window.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[app] failed to load ${validatedURL}: ${errorDescription} (${errorCode})`);
  });

  void window.loadURL(currentUrl.toString());
}

app.whenReady().then(() => {
  let currentUrl: URL;
  try {
    currentUrl = getCurrentUrl();
  } catch (error) {
    console.error('[config] invalid CURRENT_URL:', error);
    app.quit();
    return;
  }

  createWindow(currentUrl);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(currentUrl);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
