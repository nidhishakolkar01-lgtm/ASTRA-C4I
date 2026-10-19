let electron;
try {
  electron = require('electron');
} catch (e) {
  electron = null;
}

// In a headless server environment (e.g., Render, Heroku, or raw Node.js execution):
if (!electron || typeof electron === 'string' || !electron.app) {
  console.log('[ASTRA-C4I] Headless web environment detected: Launching production HTTP server...');
  require('../server.cjs');
} else {
  const { app, BrowserWindow, ipcMain } = electron;
  const path = require('path');

  let mainWindow = null;

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1440,
      height: 920,
      minWidth: 1024,
      minHeight: 700,
      title: 'ASTRA-CUAS: AI-Enabled Drone & Counter-Drone Threat Simulation Trainer (MoD DSSC)',
      backgroundColor: '#06090e',
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true
      }
    });

    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

    if (isDev && process.env.VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F11' && input.type === 'keyDown') {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
        event.preventDefault();
      }
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
