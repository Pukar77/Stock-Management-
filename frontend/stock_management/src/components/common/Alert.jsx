export default function Alert({ type = 'error', message }) {
  if (!message) return null
  const styles = type === 'success'
    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
    : 'bg-red-50 border-red-200 text-red-700'
  return (
    <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${styles}`}>
      {message}
    </div>
  )
}
