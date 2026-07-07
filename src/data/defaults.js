function iso(date) {
  return date.toISOString().slice(0, 10)
}

function shift(days) {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return iso(d)
}

export const defaultCategories = [
  { id: 'fittin', name: 'Стажировка Fittin', color: 'blush' },
  { id: 'life', name: 'Личное', color: 'mint' }
]

export const defaultTasks = [
  { id: 't1', categoryId: 'fittin', text: 'Доделать тестовое по фронту', done: false, due: shift(2) },
  { id: 't2', categoryId: 'fittin', text: 'Созвон с ментором в 15:00', done: false, due: shift(0) },
  { id: 't3', categoryId: 'fittin', text: 'Отправить фидбек по макету', done: true, due: null },
  { id: 'l1', categoryId: 'life', text: 'Забрать посылку с почты', done: false, due: shift(1) }
]

export const defaultSubscriptions = [
  { id: 'sub1', name: 'Spotify', price: 199, period: 'monthly', nextDate: shift(9) },
  { id: 'sub2', name: 'ChatGPT Plus', price: 2000, period: 'monthly', nextDate: shift(3) },
  { id: 'sub3', name: 'PSN Plus', price: 6999, period: 'yearly', nextDate: shift(120) }
]
