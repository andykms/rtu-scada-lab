import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // скомпилированный preload
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const devServerUrl = process.env.ELECTRON_START_URL;

  if (devServerUrl) {
    // Dev-режим: грузим страницу с Angular dev-сервера
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools();
  } else {
    // Prod-режим: грузим собранные статические файлы
    const indexPath = path.join(
      __dirname,
      '..',
      '..',
      'dist',
      'rtu-scada-frontend',
      'browser',
      'index.html'
    );
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // macOS: пересоздаём окно при клике на иконку в доке
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Завершаем приложение, когда все окна закрыты (кроме macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});