const bridge = typeof window !== 'undefined' ? window.api : null

export async function loadData(key, fallback) {
  try {
    if (bridge) {
      const value = await bridge.getData(key)
      return value === undefined || value === null ? fallback : value
    }
    const raw = localStorage.getItem('plander:' + key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    return fallback
  }
}

export async function saveData(key, value) {
  if (bridge) return bridge.setData(key, value)
  try {
    localStorage.setItem('plander:' + key, JSON.stringify(value))
  } catch (e) {}
}

export function notify(title, body) {
  if (bridge) return bridge.notify(title, body)
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification(title, { body })
  }
}
