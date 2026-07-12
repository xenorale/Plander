const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  getData: (key) => ipcRenderer.invoke('store:get', key),
  setData: (key, value) => ipcRenderer.invoke('store:set', key, value),
  deleteData: (key) => ipcRenderer.invoke('store:delete', key),
  notify: (title, body) => ipcRenderer.invoke('notify', { title, body }),
  getAutostart: () => ipcRenderer.invoke('autostart:get'),
  setAutostart: (enabled) => ipcRenderer.invoke('autostart:set', enabled),
  minimize: () => ipcRenderer.invoke('win:minimize'),
  hide: () => ipcRenderer.invoke('win:hide'),
  quit: () => ipcRenderer.invoke('app:quit'),
  exportData: () => ipcRenderer.invoke('data:export'),
  importData: () => ipcRenderer.invoke('data:import'),
  onNavigate: (cb) => {
    const handler = (_e, view) => cb(view)
    ipcRenderer.on('navigate', handler)
    return () => ipcRenderer.removeListener('navigate', handler)
  }
})
