import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';

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

  const startUrl =
    url.format({
      pathname: path.join(
        __dirname,
        '..',
        '..',
        'dist',
        'rtu-scada-frontend',
        'browser',
        'index.html'
      )
    });

  mainWindow.loadURL(startUrl);

  if (process.env.ELECTRON_START_URL) {
    mainWindow.webContents.openDevTools();
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