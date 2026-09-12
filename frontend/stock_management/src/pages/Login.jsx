import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import FormInput from '../components/FormInput'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(null)
  const [form, setForm] = useState({
    username: '',
    password: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccess(null)
    setLoading(true)

    try {
      const res = await api.post('/users/login/', form)
      const { user, tokens } = res.data

      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)
      localStorage.setItem('user', JSON.stringify(user))

      setSuccess(`Welcome back, ${user.first_name || user.username}!`)
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data
        if (typeof data === 'object') {
          const fieldErrors = {}
          for (const [key, val] of Object.entries(data)) {
            if (key === 'message' || key === 'status') continue
            fieldErrors[key] = Array.isArray(val) ? val[0] : val
          }
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors)
          } else if (data.message) {
            setErrors({ general: data.message })
          }
        }
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-1">Log in to your account</p>
          </div>

          {errors.general && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {errors.general}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Username"
              id="username"
              name="username"
              placeholder="Rimal77"
              value={form.username}
              onChange={handleChange}
              error={errors.username}
              required
            />

            <FormInput
              label="Password"
              id="password"
              name="password"
              type="password"
              placeholder="pukar@123"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
