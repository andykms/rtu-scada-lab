"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getProjectsList: () => electron_1.ipcRenderer.invoke('get-projects-list'),
    deleteProject: (data) => electron_1.ipcRenderer.invoke('delete-project', data),
    // ... другие методы
});
//# sourceMappingURL=preload.js.map