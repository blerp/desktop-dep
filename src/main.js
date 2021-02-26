const {
  app,
  BrowserWindow,
  autoUpdater,
  dialog,
  ipcMain,
} = require("electron");
const path = require("path");
const electron = require("electron");
const process = require("process");
const console = require("console");

///////////////////
// Auto upadater //
///////////////////
autoUpdater.requestHeaders = { "PRIVATE-TOKEN": process.env.PRIVATE_TOKEN };
autoUpdater.autoDownload = true;

// https://example.com/<namespace>/<project>/-/jobs/artifacts/auto-updater/raw/<path_to_file>?job=<job_name>
// https://gitlab.com/blerp/desktop/-/jobs/artifacts/auto-updater/browse?job=build_windows
// process.platform
//`https://gitlab.com/blerp/desktop/-/jobs/artifacts/auto-updater/raw/out/make/squirrel.windows/x64/BlerpDesktop-${app.getVersion()} Setup.exe?job=build_windows`
// const feedUrl = `https://gitlab.com/api/v4/projects/23152299/packages/generic/BlerpDesktop/${app.getVersion()}/BlerpDesktop-${app.getVersion()}.dmg`;
const feedUrl = `https://gitlab.com/blerp/desktop/-/releases/BlerpDesktop-${app.getVersion()}_Setup.exe`;
autoUpdater.setFeedURL({
  provider: "generic",
  url: feedUrl,
});

autoUpdater.on("checking-for-update", function () {
  sendStatusToWindow(`Checking for update... ${feedUrl}`);
  console.log("checking for update");
});

// setInterval(() => {
//   autoUpdater.checkForUpdates();
// }, 10000);

autoUpdater.on("update-available", function (info) {
  sendStatusToWindow("Update available.");
  console.log("update avaliable");
});

autoUpdater.on("update-not-available", function (info) {
  sendStatusToWindow("Update not available.");
  console.log("update not avaliable");
});

autoUpdater.on("error", function (err) {
  console.log(err);
  sendStatusToWindow(`Checking for update... ${err}`);
});

autoUpdater.on("download-progress", function (progressObj) {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message =
    log_message + " - Downloaded " + parseInt(progressObj.percent) + "%";
  log_message =
    log_message +
    " (" +
    progressObj.transferred +
    "/" +
    progressObj.total +
    ")";
  sendStatusToWindow(log_message);
  console.log(log_message);
});

autoUpdater.on("update-downloaded", function (info) {
  sendStatusToWindow("Update downloaded; will install in 1 seconds");
});

autoUpdater.on("update-downloaded", function (info) {
  setTimeout(function () {
    autoUpdater.quitAndInstall();
  }, 1000);
});

autoUpdater.checkForUpdates();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

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

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

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
  event.reply("check-for-update-response", "checking");
});

function sendStatusToWindow(text) {
  console.log(text, mainWindow);
  if (mainWindow) {
    mainWindow.webContents.send("message", `${text}`);
  }
}
