const { app, BrowserWindow, ipcMain, autoUpdater } = require("electron");

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

app.on("ready", () => {
  createWindow();
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdates();
  });
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.on("ping", (event, msg) => {
  console.log(msg); // msg from web page
  event.reply("pong", "hi web page"); // send to web page
});

ipcMain.on("check-for-update", (event, msg) => {
  autoUpdater.checkForUpdates();
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

function sendStatusToWindow(text) {
  if (mainWindow) {
    mainWindow.webContents.send("message", `${text}`);
  }
}
