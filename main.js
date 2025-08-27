const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development' || !fs.existsSync(path.join(__dirname, 'dist'));

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, 'assets/icon.png'), // Add your app icon here
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false, // Allow loading local files
    },
    titleBarStyle: 'default',
    show: false, // Don't show until ready
  });

  // Load the React app
  if (isDev) {
    console.log('Running in development mode - Loading from webpack dev server...');
    console.log('Make sure webpack dev server is running on http://localhost:3000');
    
    mainWindow.loadURL('http://localhost:3000').catch(err => {
      console.error('Failed to load development server. Make sure to run "npm start" first!');
      console.error('Error:', err.message);
      
      // Show error dialog
      const { dialog } = require('electron');
      dialog.showErrorBox(
        'Development Server Not Running',
        'Please start the development server first:\n\n1. Run "npm start" in terminal\n2. Wait for "webpack compiled successfully"\n3. Then run "npm run electron"'
      );
    });
    
    // Only open dev tools if explicitly requested
    // mainWindow.webContents.openDevTools();
  } else {
    console.log('Running in production mode - Loading from dist folder...');
    const distPath = path.join(__dirname, 'dist', 'index.html');
    
    if (fs.existsSync(distPath)) {
      mainWindow.loadFile(distPath);
    } else {
      console.error('Production build not found! Run "npm run build" first.');
      dialog.showErrorBox(
        'Production Build Not Found',
        'Please build the app first:\n\n1. Run "npm run build"\n2. Then run "npm run electron"'
      );
      app.quit();
      return;
    }
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      console.log('✅ Photo Editor Desktop App is running in development mode');
      console.log('📁 Ready to load and edit photos!');
    } else {
      console.log('✅ Photo Editor Desktop App is running in production mode');
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent new window creation (keep it as desktop app)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle loading errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    if (isDev && validatedURL.includes('localhost:3000')) {
      console.error('❌ Failed to connect to development server!');
      console.log('💡 Please make sure to:');
      console.log('   1. Run "npm start" first');
      console.log('   2. Wait for "webpack compiled successfully"');
      console.log('   3. Then run "npm run electron"');
    }
  });
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Folder',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('open-folder');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        ...(isDev ? [{ role: 'toggleDevTools' }] : []),
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Handle file selection
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Photo Folder'
  });
  
  if (!result.canceled) {
    const folderPath = result.filePaths[0];
    try {
      const files = fs.readdirSync(folderPath);
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'].includes(ext);
      });
      
      return {
        folderPath,
        images: imageFiles.map(file => ({
          name: file,
          path: path.join(folderPath, file),
          url: `file://${path.join(folderPath, file).replace(/\\/g, '/')}`
        }))
      };
    } catch (error) {
      console.error('Error reading folder:', error);
      return null;
    }
  }
  
  return null;
});

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent navigation to external websites
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (navigationEvent, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:3000' && parsedUrl.protocol !== 'file:') {
      navigationEvent.preventDefault();
    }
  });
});

// =======================================

// const { app, BrowserWindow, dialog, ipcMain } = require('electron');
// const path = require('path');
// const fs = require('fs');
// const isDev = process.env.NODE_ENV === 'development';

// let mainWindow;

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 1400,
//     height: 900,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false,
//       enableRemoteModule: true,
//     },
//   });

//   // Load the React app
//   if (isDev) {
//     mainWindow.loadURL('http://localhost:3000');
//     mainWindow.webContents.openDevTools();
//   } else {
//     mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
//   }

//   mainWindow.on('closed', () => {
//     mainWindow = null;
//   });
// }

// // Handle file selection
// ipcMain.handle('select-folder', async () => {
//   const result = await dialog.showOpenDialog(mainWindow, {
//     properties: ['openDirectory'],
//   });
  
//   if (!result.canceled) {
//     const folderPath = result.filePaths[0];
//     const files = fs.readdirSync(folderPath);
//     const imageFiles = files.filter(file => {
//       const ext = path.extname(file).toLowerCase();
//       return ['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(ext);
//     });
    
//     return {
//       folderPath,
//       images: imageFiles.map(file => ({
//         name: file,
//         path: path.join(folderPath, file),
//         url: `file://${path.join(folderPath, file)}`
//       }))
//     };
//   }
  
//   return null;
// });

// app.whenReady().then(createWindow);

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// app.on('activate', () => {
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow();
//   }
// });

// ===========================================

// const { app, BrowserWindow, dialog, ipcMain } = require('electron');
// const path = require('path');
// const fs = require('fs');

// let mainWindow;

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 1400,
//     height: 900,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false,
//       enableRemoteModule: true,
//     },
//   });

//   // Load the React app
//   if (process.env.NODE_ENV === 'development') {
//     mainWindow.loadURL('http://localhost:3000');
//     mainWindow.webContents.openDevTools();
//   } else {
//     mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
//   }

//   mainWindow.on('closed', () => {
//     mainWindow = null;
//   });
// }

// // Handle file selection
// ipcMain.handle('select-folder', async () => {
//   const result = await dialog.showOpenDialog(mainWindow, {
//     properties: ['openDirectory'],
//   });
  
//   if (!result.canceled) {
//     const folderPath = result.filePaths[0];
//     const files = fs.readdirSync(folderPath);
//     const imageFiles = files.filter(file => {
//       const ext = path.extname(file).toLowerCase();
//       return ['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(ext);
//     });
    
//     return {
//       folderPath,
//       images: imageFiles.map(file => ({
//         name: file,
//         path: path.join(folderPath, file),
//         url: `file://${path.join(folderPath, file)}`
//       }))
//     };
//   }
  
//   return null;
// });

// app.whenReady().then(createWindow);

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// app.on('activate', () => {
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow();
//   }
// });