import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import FormInput from '../components/FormInput'

export default function Signup() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_number: '',
    password: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccess('')
    setLoading(true)

    try {
      const res = await api.post('/users/signup/', form)
      setSuccess(res.data.message)
      setTimeout(() => navigate('/login'), 1500)
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
            <p className="text-gray-500 mt-1">Join us today</p>
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
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                id="first_name"
                name="first_name"
                placeholder="Pukar"
                value={form.first_name}
                onChange={handleChange}
                error={errors.first_name}
              />
              <FormInput
                label="Last Name"
                id="last_name"
                name="last_name"
                placeholder="Rimal"
                value={form.last_name}
                onChange={handleChange}
                error={errors.last_name}
              />
            </div>

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
              label="Email"
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <FormInput
              label="Phone Number"
              id="phone_number"
              name="phone_number"
              placeholder="9866337295"
              value={form.phone_number}
              onChange={handleChange}
              error={errors.phone_number}
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
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
