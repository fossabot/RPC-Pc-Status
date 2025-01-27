const { app, dialog, Notification, nativeImage } = require("electron");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const path = require("path");
const iconpath = nativeImage.createFromPath(
  // eslint-disable-next-line no-undef
  path.join(__dirname, "assets/icon/connected.png")
);
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
let allow = true;

exports.Checkupdates = () => {
  if (allow === true) {
    allow = false;
    autoUpdater.currentChannel = autoUpdater.channel;
    autoUpdater.allowPrerelease = false;
    autoUpdater.allowDowngrade = false;
    autoUpdater.setFeedURL({
      provider: "github",
      owner: "Faelayis",
      repo: "RPC-Pc-Status",
    });
    autoUpdater.checkForUpdates();
    autoUpdater.once("checking-for-update", () => {
      log.info("Checking for update...");
    });
    autoUpdater.once("update-available", (UpdateInfo) => {
      log.info("Update available.");
      new Notification({
        title: "Update available",
        body: `Found version ${UpdateInfo.version} download automatically \ncomplete you will be notified.`,
      }).show();
    });
    autoUpdater.once("update-not-available", () => {
      log.info("Update not available.");
      new Notification({
        title: "Update not available",
        body: `You are now using ${app.getVersion()} the latest version.`,
      }).show();
      allow = true;
    });
    autoUpdater.once("error", (message) => {
      allow = false;
      dialog
        .showMessageBox({
          type: "error",
          buttons: ["ok"],
          title: "RPC Pc Status Update Error",
          message: "There was a problem updating the application",
          detail: `${message}`,
          noLink: true,
        })
        .then((returnValue) => {
          if (returnValue.response === 0) {
            allow = true;
          }
        });
    });
    autoUpdater.once("download-progress", (progressObj) => {
      allow = false;
      let log_message = "Download speed: " + progressObj.bytesPerSecond;
      log_message = log_message + " - Downloaded " + progressObj.percent + "%";
      log_message =
        log_message +
        " (" +
        progressObj.transferred +
        "/" +
        progressObj.total +
        ")";
      log.info(log_message);
    });
    autoUpdater.once("update-downloaded", (event, releaseName) => {
      allow = false;
      dialog
        .showMessageBox({
          type: "info",
          buttons: ["Restart App", "Later"],
          title: "RPC Pc Status Update",
          message: releaseName,
          detail: `${event.releaseName} \nA new version has been downloaded. Restart the application to apply the updates.`,
          noLink: true,
          icon: iconpath,
        })
        .then((returnValue) => {
          if (returnValue.response === 0) {
            allow = true;
            autoUpdater.quitAndInstall();
          } else if (returnValue.response === 1) {
            allow = true;
          }
        });
    });
  }
};
