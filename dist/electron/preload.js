"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    getAppMode: () => electron_1.ipcRenderer.invoke("getAppMode"),
    openProjectFile: (filePath) => electron_1.ipcRenderer.invoke("openProjectFile", filePath),
    pickAndOpenProjectFile: () => electron_1.ipcRenderer.invoke("pickAndOpenProjectFile"),
    createProject: (projectName) => electron_1.ipcRenderer.invoke("createProject", projectName),
    setTcpServerBlock: (projectId, data, inputBlocks, outputBlocks) => electron_1.ipcRenderer.invoke("setTcpServerBlock", projectId, data, inputBlocks, outputBlocks),
    setTcpClientBlock: (projectId, data, inputBlocks, outputBlocks) => electron_1.ipcRenderer.invoke("setTcpClientBlock", projectId, data, inputBlocks, outputBlocks),
    setMqttClientBlock: (projectId, data, inputBlocks, outputBlocks) => electron_1.ipcRenderer.invoke("setMqttClientBlock", projectId, data, inputBlocks, outputBlocks),
    setModbusRtuBlock: (projectId, data, inputBlocks, outputBlocks) => electron_1.ipcRenderer.invoke("setModbusRtuBlock", projectId, data, inputBlocks, outputBlocks),
    setModbusTcpBlock: (projectId, data, inputBlocks, outputBlocks) => electron_1.ipcRenderer.invoke("setModbusTcpBlock", projectId, data, inputBlocks, outputBlocks),
    setHttpClientBlock: (projectId, data, inputBlocks, outputBlocks) => electron_1.ipcRenderer.invoke("setHttpClientBlock", projectId, data, inputBlocks, outputBlocks),
    setDatabaseBlock: (projectId, data, inputBlocks, outputBlocks) => electron_1.ipcRenderer.invoke("setDatabaseBlock", projectId, data, inputBlocks, outputBlocks),
    setComBlock: (projectId, data, inputBlocks, outputBlocks) => electron_1.ipcRenderer.invoke("setComBlock", projectId, data, inputBlocks, outputBlocks),
    setConverterBlock: (projectId, data, inputBlocks, outputBlocks) => electron_1.ipcRenderer.invoke("setConverterBlock", projectId, data, inputBlocks, outputBlocks),
    setGraphBlock: (projectId, data, inputBlocks, outputBlocks) => electron_1.ipcRenderer.invoke("setGraphBlock", projectId, data, inputBlocks, outputBlocks),
    setIndicatorsBlock: (projectId, data, inputBlocks, outputBlocks) => electron_1.ipcRenderer.invoke("setIndicatorsBlock", projectId, data, inputBlocks, outputBlocks),
    setMediaBlock: (projectId, data, inputBlocks, outputBlocks) => electron_1.ipcRenderer.invoke("setMediaBlock", projectId, data, inputBlocks, outputBlocks),
    connectBlocks: (projectId, fromBlockId, toBlockId) => electron_1.ipcRenderer.invoke("connectBlocks", projectId, fromBlockId, toBlockId),
    disconnectBlocks: (projectId, fromBlockId, toBlockId) => electron_1.ipcRenderer.invoke("disconnectBlocks", projectId, fromBlockId, toBlockId),
    deleteBlocks: (projectId, blockIds) => electron_1.ipcRenderer.invoke("deleteBlocks", projectId, blockIds),
    setSceneNodePositions: (projectId, positions) => electron_1.ipcRenderer.invoke("setSceneNodePositions", projectId, positions),
    saveProject: (projectId) => electron_1.ipcRenderer.invoke("saveProject", projectId),
    saveProjectAs: (projectId) => electron_1.ipcRenderer.invoke("saveProjectAs", projectId),
    openDemoMode: (projectId) => electron_1.ipcRenderer.invoke("openDemoMode", projectId),
    configureApp: (projectId) => electron_1.ipcRenderer.invoke("configureApp", projectId),
});
//# sourceMappingURL=preload.js.map