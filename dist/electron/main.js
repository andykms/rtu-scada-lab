"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const initialization_tool_1 = require("./tools/initializator/initialization.tool");
const settings_manager_tool_1 = require("./tools/settings-manager/settings-manager.tool");
let mainWindow = null;
const initializationTool = new initialization_tool_1.InitializatorTool();
const settingsManager = new settings_manager_tool_1.SettingsManager();
function resolveAppIconPath() {
    const candidates = [
        // Packaged / prod: frontend assets next to electron build output
        path.join(__dirname, "..", "..", "dist", "rtu-scada-frontend", "browser", "rtu-lab-logo.png"),
        // Dev: source public folder
        path.join(__dirname, "..", "..", "src", "rtu-scada-frontend", "public", "rtu-lab-logo.png"),
    ];
    return candidates.find((candidate) => fs.existsSync(candidate));
}
function createWindow() {
    const icon = resolveAppIconPath();
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        ...(icon ? { icon } : {}),
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
    }
    else {
        const indexPath = path.join(__dirname, "..", "..", "dist", "rtu-scada-frontend", "browser", "index.html");
        mainWindow.loadFile(indexPath);
    }
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}
function registerConstructorModeHandlers(apiEntryConstructorMode) {
    electron_1.ipcMain.handle("openProjectFile", async (_event, filePath) => {
        return apiEntryConstructorMode.openProjectFile(filePath);
    });
    electron_1.ipcMain.handle("createProject", async (_event, projectName) => {
        return apiEntryConstructorMode.createNewProject(projectName);
    });
    electron_1.ipcMain.handle("setTcpServerBlock", async (_event, projectId, data, inputBlocks, outputBlocks) => {
        return apiEntryConstructorMode.setTcpServerBlock(projectId, data, inputBlocks, outputBlocks);
    });
    electron_1.ipcMain.handle("setTcpClientBlock", async (_event, projectId, data, inputBlocks, outputBlocks) => {
        return apiEntryConstructorMode.setTcpClientBlock(projectId, data, inputBlocks, outputBlocks);
    });
    electron_1.ipcMain.handle("setMqttClientBlock", async (_event, projectId, data, inputBlocks, outputBlocks) => {
        return apiEntryConstructorMode.setMqttBlock(projectId, data, inputBlocks, outputBlocks);
    });
    electron_1.ipcMain.handle("setModbusRtuBlock", async (_event, projectId, data, inputBlocks, outputBlocks) => {
        return apiEntryConstructorMode.setModbusRtuBlock(projectId, data, inputBlocks, outputBlocks);
    });
    electron_1.ipcMain.handle("setModbusTcpBlock", async (_event, projectId, data, inputBlocks, outputBlocks) => {
        return apiEntryConstructorMode.setModbusTcpBlock(projectId, data, inputBlocks, outputBlocks);
    });
    electron_1.ipcMain.handle("setHttpClientBlock", async (_event, projectId, data, inputBlocks, outputBlocks) => {
        return apiEntryConstructorMode.setHttpClientBlock(projectId, data, inputBlocks, outputBlocks);
    });
    electron_1.ipcMain.handle("setDatabaseBlock", async (_event, projectId, data, inputBlocks, outputBlocks) => {
        return apiEntryConstructorMode.setDatabaseBlock(projectId, data, inputBlocks, outputBlocks);
    });
    electron_1.ipcMain.handle("setComBlock", async (_event, projectId, data, inputBlocks, outputBlocks) => {
        return apiEntryConstructorMode.setComBlock(projectId, data, inputBlocks, outputBlocks);
    });
    electron_1.ipcMain.handle("setConverterBlock", async (_event, projectId, data, inputBlocks, outputBlocks) => {
        return apiEntryConstructorMode.setConverterBlock(projectId, data, inputBlocks, outputBlocks);
    });
    electron_1.ipcMain.handle("setGraphBlock", async (_event, projectId, data, inputBlocks, outputBlocks) => {
        return apiEntryConstructorMode.setGraphBlock(projectId, data, inputBlocks, outputBlocks);
    });
    electron_1.ipcMain.handle("setIndicatorsBlock", async (_event, projectId, data, inputBlocks, outputBlocks) => {
        return apiEntryConstructorMode.setIndicatorsBlock(projectId, data, inputBlocks, outputBlocks);
    });
    electron_1.ipcMain.handle("setMediaBlock", async (_event, projectId, data, inputBlocks, outputBlocks) => {
        return apiEntryConstructorMode.setMediaBlock(projectId, data, inputBlocks, outputBlocks);
    });
    electron_1.ipcMain.handle("saveProject", async () => {
        return apiEntryConstructorMode.saveProjectFile();
    });
}
electron_1.app.whenReady().then(async () => {
    const apiEntryConstructorMode = await initializationTool.initializeFactory(settingsManager);
    electron_1.ipcMain.handle("getAppMode", async () => {
        const settings = await settingsManager.loadSettings();
        return settings.appMode;
    });
    if (apiEntryConstructorMode) {
        registerConstructorModeHandlers(apiEntryConstructorMode);
    }
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
//# sourceMappingURL=main.js.map