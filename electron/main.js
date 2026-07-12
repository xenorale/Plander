const { app, BrowserWindow, Tray, Menu, Notification, ipcMain, nativeImage, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const Store = require('electron-store')
const { autoUpdater } = require('electron-updater')

const BACKUP_KEYS = ['tasks', 'categories', 'events', 'focusLog', 'focusLabel', 'subscriptions']

const isDev = process.env.NODE_ENV === 'development'
const iconPath = path.join(__dirname, '..', 'assets', 'icon.png')

const store = new Store({ name: 'plander-data' })

let mainWindow = null
let tray = null
let trayNotified = false
let updateReady = false

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
      hideToTray()
    }
  })
}

function showWindow() {
  if (!mainWindow) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  mainWindow.focus()
}

function hideToTray() {
  if (!mainWindow) return
  mainWindow.hide()
  if (!trayNotified && tray) {
    trayNotified = true
    try {
      tray.displayBalloon({
        icon: iconPath,
        title: 'Plander свернулся в трей',
        content: 'Открыть можно кликом по иконке внизу справа. Если её не видно, нажми на стрелку вверх'
      })
    } catch (e) {}
  }
}

function trayMenuTemplate() {
  const items = [
    { label: 'Открыть', click: showWindow },
    {
      label: 'Настройки',
      click: () => {
        showWindow()
        if (mainWindow) mainWindow.webContents.send('navigate', 'settings')
      }
    }
  ]
  if (updateReady) {
    items.push({
      label: 'Установить обновление и перезапустить',
      click: () => {
        app.isQuitting = true
        autoUpdater.quitAndInstall()
      }
    })
  }
  items.push(
    { type: 'separator' },
    {
      label: 'Выход',
      click: () => {
        app.isQuitting = true
        app.quit()
      }
    }
  )
  return items
}

function refreshTrayMenu() {
  if (tray) tray.setContextMenu(Menu.buildFromTemplate(trayMenuTemplate()))
}

function buildTray() {
  let image = nativeImage.createFromPath(iconPath)
  if (!image.isEmpty()) image = image.resize({ width: 18, height: 18 })
  tray = new Tray(image.isEmpty() ? nativeImage.createEmpty() : image)

  tray.setToolTip('Plander')
  refreshTrayMenu()
  tray.on('click', showWindow)
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

ipcMain.handle('data:export', async () => {
  if (!mainWindow) return { ok: false }
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Экспорт данных Plander',
    defaultPath: `plander-backup-${new Date().toISOString().slice(0, 10)}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }]
  })
  if (canceled || !filePath) return { ok: false }
  const data = {}
  BACKUP_KEYS.forEach((key) => (data[key] = store.get(key)))
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  return { ok: true, path: filePath }
})

ipcMain.handle('data:import', async () => {
  if (!mainWindow) return { ok: false }
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Импорт данных Plander',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile']
  })
  if (canceled || !filePaths[0]) return { ok: false }
  let data
  try {
    data = JSON.parse(fs.readFileSync(filePaths[0], 'utf-8'))
  } catch (e) {
    return { ok: false, error: 'bad-json' }
  }
  if (!data || typeof data !== 'object') return { ok: false, error: 'bad-json' }
  BACKUP_KEYS.forEach((key) => {
    if (key in data) store.set(key, data[key])
  })
  mainWindow.reload()
  return { ok: true }
})

ipcMain.handle('win:minimize', () => {
  if (mainWindow) mainWindow.minimize()
})
ipcMain.handle('win:hide', () => hideToTray())
ipcMain.handle('app:quit', () => {
  app.isQuitting = true
  app.quit()
})

function localDayKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function checkReminders() {
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const todayStr = localDayKey(today)

  let seen = store.get('remindersSeen')
  if (!seen || seen.date !== todayStr) seen = { date: todayStr, taskIds: [], subIds: [] }

  const tasks = store.get('tasks') || []
  const dueToday = tasks.filter((t) => t && !t.done && t.due === todayStr && !seen.taskIds.includes(t.id))
  if (dueToday.length === 1) {
    new Notification({ title: 'Задача на сегодня', body: dueToday[0].text }).show()
  } else if (dueToday.length > 1) {
    new Notification({ title: 'Задачи на сегодня', body: `Сегодня запланировано дел: ${dueToday.length}` }).show()
  }
  seen.taskIds.push(...dueToday.map((t) => t.id))

  const subs = store.get('subscriptions') || []
  subs.forEach((s) => {
    if (!s || !s.nextDate || seen.subIds.includes(s.id)) return
    const diff = (new Date(s.nextDate) - today) / 86400000
    if (diff >= 0 && diff <= 3) {
      new Notification({ title: 'Скоро спишется подписка', body: `${s.name}, ${s.price} рублей` }).show()
      seen.subIds.push(s.id)
    }
  })

  store.set('remindersSeen', seen)
}

autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

autoUpdater.on('update-downloaded', () => {
  updateReady = true
  refreshTrayMenu()
  new Notification({ title: 'Обновление Plander готово', body: 'Перезапусти приложение через трей, чтобы обновиться' }).show()
})
autoUpdater.on('error', () => {})

function checkForUpdates() {
  if (isDev) return
  autoUpdater.checkForUpdates().catch(() => {})
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
    setInterval(checkReminders, 60 * 60 * 1000)
    setTimeout(checkForUpdates, 5000)
    setInterval(checkForUpdates, 4 * 60 * 60 * 1000)

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
      else showWindow()
    })
  })

  app.on('window-all-closed', () => {})
}
