import * as React from "react";
import * as ReactDOM from "react-dom";

function render() {
    if (window.isElectron) {
        window.ipcRenderer.send("ping", "hello main");
        window.ipcRenderer.on("pong", (event, msg) => console.log(msg));
        window.ipcRenderer.on("check-for-update-response", (event, msg) =>
            console.log(msg)
        );
        window.ipcRenderer.on("message", (event, message) => {
            console.log(message);
        });
        // ipcRenderer.once("autoUpdater-canUpdate", (event, info) => {
        //   console.log(
        //     `Found a new version [v${info.version}], Whether to update? `
        //   );
        // });
        // // download progress
        // ipcRenderer.on("autoUpdater-progress", (event, process) => {
        //   if (process.transferred >= 1024 * 1024) {
        //     process.transferred =
        //       (process.transferred / 1024 / 1024).toFixed(2) + "M";
        //   } else {
        //     process.transferred = (process.transferred / 1024).toFixed(2) + "K";
        //   }
        //   if (process.total >= 1024 * 1024) {
        //     process.total = (process.total / 1024 / 1024).toFixed(2) + "M";
        //   } else {
        //     process.total = (process.total / 1024).toFixed(2) + "K";
        //   }
        //   if (process.bytesPerSecond >= 1024 * 1024) {
        //     process.speed =
        //       (process.bytesPerSecond / 1024 / 1024).toFixed(2) + "M/s";
        //   } else if (process.bytesPerSecond >= 1024) {
        //     process.speed = (process.bytesPerSecond / 1024).toFixed(2) + "K/s";
        //   } else {
        //     process.speed = process.bytesPerSecond + "B/s";
        //   }
        //   process.percent = process.percent.toFixed(2);
        //   this.downloadProcess = process;
        //   this.showUpdater = true;
        // });
        // // update failed to download
        // ipcRenderer.once("autoUpdater-error", (event) => {
        //   this.$message.error("Update failed! ");
        //   this.showUpdater = false;
        // });
        // // Download completed
        // ipcRenderer.once("autoUpdater-downloaded", () => {
        //   console.log("Download finished");
        // });
    }

    const checkUpdate = () => {
        window.ipcRenderer.send("check-for-update");
    };

    ReactDOM.render(
        <h2>
            Hello from React! 1.0.11
      <button onClick={() => checkUpdate()}>check update</button>
        </h2>,
        document.body
    );
}

render();
