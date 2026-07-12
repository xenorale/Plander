function shift(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const defaultCategories = [
  { id: 'fittin', name: 'Стажировка Fittin', color: 'clay' },
  { id: 'life', name: 'Личное', color: 'pine' }
]

export const defaultTasks = [
  { id: 't1', categoryId: 'fittin', text: 'Доделать тестовое по фронту', done: false, due: shift(2), time: null },
  { id: 't2', categoryId: 'fittin', text: 'Созвон с ментором', done: false, due: shift(0), time: '15:00' },
  { id: 't3', categoryId: 'fittin', text: 'Отправить фидбек по макету', done: true, due: null, time: null },
  { id: 'l1', categoryId: 'life', text: 'Забрать посылку с почты', done: false, due: shift(1), time: '12:30' }
]

export const defaultEvents = [{ id: 'ev1', title: 'Поездка в Питер', dates: [shift(5), shift(6), shift(7), shift(8)], color: 'denim' }]

export const defaultSubscriptions = [
  { id: 'sub1', name: 'Spotify', price: 199, period: 'monthly', nextDate: shift(9) },
  { id: 'sub2', name: 'ChatGPT Plus', price: 2000, period: 'monthly', nextDate: shift(3) },
  { id: 'sub3', name: 'PSN Plus', price: 6999, period: 'yearly', nextDate: shift(120) }
]
