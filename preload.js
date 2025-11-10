const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  addWasteEntry: (wasteData) => ipcRenderer.invoke('add-waste-entry', wasteData),
  getTodayStats: () => ipcRenderer.invoke('get-today-stats')
});
