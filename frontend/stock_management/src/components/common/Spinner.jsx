export default function Spinner({ className = 'h-8 w-8' }) {
  return (
    <div className={`mx-auto animate-spin rounded-full border-2 border-emerald-500 border-t-transparent ${className}`} />
  )
}
