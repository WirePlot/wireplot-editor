import { app, BrowserWindow } from "electron";
import path from "path";

const isDev = !app.isPackaged;

function createWindow() {
  console.log("Started window creation.");

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      contextIsolation: true
    }
  });

  win.webContents.on("did-fail-load", (_e, code, desc, url) => {
    console.error("❌ did-fail-load", code, desc, url);
  });

  win.webContents.on("did-finish-load", () => {
    console.log("✅ did-finish-load");
  });

  if (isDev) {
    console.log("DEV MODE (Vite)");
    win.loadURL("http://localhost:50000");
    win.webContents.openDevTools();
  } else {
    const indexPath = path.join(app.getAppPath(), "dist", "index.html");
    console.log("PROD MODE (dist)", indexPath);
    win.loadFile(indexPath);
    win.webContents.openDevTools();
  }
}
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
