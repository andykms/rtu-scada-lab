import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getProjectsList: () => ipcRenderer.invoke('get-projects-list'),
  deleteProject: (data: any) => ipcRenderer.invoke('delete-project', data),
  // ... другие методы
});