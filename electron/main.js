const { app, BrowserWindow, Tray, Menu, Notification, ipcMain, nativeImage } = require('electron')
const path = require('path')
const Store = require('electron-store')

const isDev = process.env.NODE_ENV === 'development'
const iconPath = path.join(__dirname, '..', 'assets', 'icon.png')

const store = new Store({ name: 'plander-data' })

let mainWindow = null
let tray = null

function startedHidden() {
  if (process.argv.includes('--hidden')) return true
  try {
    return app.getLoginItemSettings().wasOpenedAsHidden
  } catch (e) {
    return false
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 460,
    height: 880,
    minWidth: 400,
    minHeight: 720,
    frame: false,
    show: false,
    backgroundColor: '#efe7d8',
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (isDev) {
    mainWindow.loadURL('http://127.0.0.1:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    if (!startedHidden()) mainWindow.show()
  })

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault()
      mainWindow.hide()
    }
  })
}

function showWindow() {
  if (!mainWindow) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  mainWindow.focus()
}

function buildTray() {
  let image = nativeImage.createFromPath(iconPath)
  if (!image.isEmpty()) image = image.resize({ width: 18, height: 18 })
  tray = new Tray(image.isEmpty() ? nativeImage.createEmpty() : image)

  const menu = Menu.buildFromTemplate([
    { label: 'Открыть', click: showWindow },
    {
      label: 'Настройки',
      click: () => {
        showWindow()
        if (mainWindow) mainWindow.webContents.send('navigate', 'settings')
      }
    },
    { type: 'separator' },
    {
      label: 'Выход',
      click: () => {
        app.isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('Plander')
  tray.setContextMenu(menu)
  tray.on('double-click', showWindow)
}

ipcMain.handle('store:get', (_e, key) => store.get(key))
ipcMain.handle('store:set', (_e, key, value) => {
  store.set(key, value)
  return true
})
ipcMain.handle('store:delete', (_e, key) => {
  store.delete(key)
  return true
})

ipcMain.handle('notify', (_e, payload) => {
  const title = (payload && payload.title) || 'Plander'
  const body = (payload && payload.body) || ''
  new Notification({ title, body }).show()
  return true
})

ipcMain.handle('autostart:get', () => app.getLoginItemSettings().openAtLogin)
ipcMain.handle('autostart:set', (_e, enabled) => {
  app.setLoginItemSettings({
    openAtLogin: !!enabled,
    openAsHidden: true,
    args: ['--hidden']
  })
  return app.getLoginItemSettings().openAtLogin
})

ipcMain.handle('win:minimize', () => {
  if (mainWindow) mainWindow.minimize()
})
ipcMain.handle('win:hide', () => {
  if (mainWindow) mainWindow.hide()
})
ipcMain.handle('app:quit', () => {
  app.isQuitting = true
  app.quit()
})

function checkReminders() {
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const todayStr = today.toISOString().slice(0, 10)

  const tasks = store.get('tasks') || []
  const dueToday = tasks.filter((t) => t && !t.done && t.due === todayStr)
  if (dueToday.length === 1) {
    new Notification({ title: 'Задача на сегодня', body: dueToday[0].text }).show()
  } else if (dueToday.length > 1) {
    new Notification({ title: 'Задачи на сегодня', body: `Сегодня запланировано дел: ${dueToday.length}` }).show()
  }

  const subs = store.get('subscriptions') || []
  subs.forEach((s) => {
    if (!s || !s.nextDate) return
    const diff = (new Date(s.nextDate) - today) / 86400000
    if (diff >= 0 && diff <= 3) {
      new Notification({ title: 'Скоро спишется подписка', body: `${s.name}, ${s.price} рублей` }).show()
    }
  })
}

const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', showWindow)

  app.whenReady().then(() => {
    if (process.platform === 'win32') app.setAppUserModelId('com.xenorale.plander')
    createWindow()
    buildTray()
    setTimeout(checkReminders, 2500)

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
      else showWindow()
    })
  })

  app.on('window-all-closed', () => {})
}
