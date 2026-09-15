export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export function formatCurrency(value) {
  if (value === null || value === undefined) return '—'
  return Number(value).toLocaleString()
}
