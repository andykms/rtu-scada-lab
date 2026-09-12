import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { ApiEntryConstructorMode } from "./tools/api-entry/api-entry.constructor-mode.tool";
import { InitializatorTool } from "./tools/initializator/initialization.tool";
import { SettingsManager } from "./tools/settings-manager/settings-manager.tool";
import { ITcpServerBlock } from "./types/blocks/network-blocks/tcp-server/tcp-server.type";
import { ITcpClientBlock } from "./types/blocks/network-blocks/tcp-client/tcp-client.type";
import { IMqttClientBlock } from "./types/blocks/network-blocks/mqtt-client/mqtt-client.type";
import { IModbusRtuBlock } from "./types/blocks/network-blocks/modbus/modbus-rtu.type";
import { IModbusTcpBlock } from "./types/blocks/network-blocks/modbus/modbus-tcp.type";
import { IHttpClientBlock } from "./types/blocks/network-blocks/http-client/http-client.type";
import { IComBlock } from "./types/blocks/network-blocks/com/com.type";
import { IConverterBlock } from "./types/blocks/internal-blocks/converter/converter.type";
import { IGraphBlock } from "./types/blocks/internal-blocks/graphs/graphs.type";
import { IIndicatorsBlock } from "./types/blocks/internal-blocks/indicators/indicators.type";
import { IMediaBlock } from "./types/blocks/internal-blocks/media/media.type";

let mainWindow: BrowserWindow | null = null;
const initializationTool = new InitializatorTool();
const settingsManager = new SettingsManager();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const devServerUrl = process.env.ELECTRON_START_URL;

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(
      __dirname,
      "..",
      "..",
      "dist",
      "rtu-scada-frontend",
      "browser",
      "index.html",
    );
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function registerConstructorModeHandlers(
  apiEntryConstructorMode: ApiEntryConstructorMode,
): void {
  ipcMain.handle("openProjectFile", async (_event, filePath: string) => {
    return apiEntryConstructorMode.openProjectFile(filePath);
  });

  ipcMain.handle("createProject", async (_event, projectName: string) => {
    return apiEntryConstructorMode.createNewProject(projectName);
  });

  ipcMain.handle(
    "setTcpServerBlock",
    async (
      _event,
      projectId: number,
      data: ITcpServerBlock,
      inputBlocks: number[],
      outputBlocks: number[],
    ) => {
      return apiEntryConstructorMode.setTcpServerBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      );
    },
  );

  ipcMain.handle(
    "setTcpClientBlock",
    async (
      _event,
      projectId: number,
      data: ITcpClientBlock,
      inputBlocks: number[],
      outputBlocks: number[],
    ) => {
      return apiEntryConstructorMode.setTcpClientBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      );
    },
  );

  ipcMain.handle(
    "setMqttClientBlock",
    async (
      _event,
      projectId: number,
      data: IMqttClientBlock,
      inputBlocks: number[],
      outputBlocks: number[],
    ) => {
      return apiEntryConstructorMode.setMqttBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      );
    },
  );

  ipcMain.handle(
    "setModbusRtuBlock",
    async (
      _event,
      projectId: number,
      data: IModbusRtuBlock,
      inputBlocks: number[],
      outputBlocks: number[],
    ) => {
      return apiEntryConstructorMode.setModbusRtuBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      );
    },
  );

  ipcMain.handle(
    "setModbusTcpBlock",
    async (
      _event,
      projectId: number,
      data: IModbusTcpBlock,
      inputBlocks: number[],
      outputBlocks: number[],
    ) => {
      return apiEntryConstructorMode.setModbusTcpBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      );
    },
  );

  ipcMain.handle(
    "setHttpClientBlock",
    async (
      _event,
      projectId: number,
      data: IHttpClientBlock,
      inputBlocks: number[],
      outputBlocks: number[],
    ) => {
      return apiEntryConstructorMode.setHttpClientBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      );
    },
  );

  ipcMain.handle(
    "setComBlock",
    async (
      _event,
      projectId: number,
      data: IComBlock,
      inputBlocks: number[],
      outputBlocks: number[],
    ) => {
      return apiEntryConstructorMode.setComBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      );
    },
  );

  ipcMain.handle(
    "setConverterBlock",
    async (
      _event,
      projectId: number,
      data: IConverterBlock,
      inputBlocks: number[],
      outputBlocks: number[],
    ) => {
      return apiEntryConstructorMode.setConverterBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      );
    },
  );

  ipcMain.handle(
    "setGraphBlock",
    async (
      _event,
      projectId: number,
      data: IGraphBlock,
      inputBlocks: number[],
      outputBlocks: number[],
    ) => {
      return apiEntryConstructorMode.setGraphBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      );
    },
  );

  ipcMain.handle(
    "setIndicatorsBlock",
    async (
      _event,
      projectId: number,
      data: IIndicatorsBlock,
      inputBlocks: number[],
      outputBlocks: number[],
    ) => {
      return apiEntryConstructorMode.setIndicatorsBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      );
    },
  );

  ipcMain.handle(
    "setMediaBlock",
    async (
      _event,
      projectId: number,
      data: IMediaBlock,
      inputBlocks: number[],
      outputBlocks: number[],
    ) => {
      return apiEntryConstructorMode.setMediaBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      );
    },
  );

  ipcMain.handle("saveProject", async () => {
    return apiEntryConstructorMode.saveProjectFile();
  });
}

app.whenReady().then(async () => {
  const apiEntryConstructorMode =
    await initializationTool.initializeFactory(settingsManager);

  ipcMain.handle("getAppMode", async () => {
    const settings = await settingsManager.loadSettings();
    return settings.appMode;
  });

  if (apiEntryConstructorMode) {
    registerConstructorModeHandlers(apiEntryConstructorMode);
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
