const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store').default;
const store = new Store();


let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 450,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../../build/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

// 📌 初始化資料（第一次預設）
if (!store.get('experience')) store.set('experience', 0);
if (!store.get('lastCodingTime')) store.set('lastCodingTime', Date.now());

// 📩 提供資料給 renderer
ipcMain.handle('get-coding-data', () => {
  return {
    experience: store.get('experience'),
    lastCodingTime: store.get('lastCodingTime')
  };
});

// 📤 更新資料
ipcMain.handle('update-coding-data', (event, { experience, lastCodingTime }) => {
  store.set('experience', experience);
  store.set('lastCodingTime', lastCodingTime);
});
