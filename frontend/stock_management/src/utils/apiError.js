export function extractApiError(err) {
  const result = { fieldErrors: {}, general: '' }

  if (!err.response) {
    result.general = err.message === 'Network Error'
      ? 'Network error. Please check your connection and try again.'
      : 'Something went wrong. Please try again.'
    return result
  }

  const data = err.response.data
  const source = data && typeof data === 'object' && data.errors ? data.errors : data

  if (typeof source === 'string') {
    result.general = source
    return result
  }

  if (!source || typeof source !== 'object') {
    result.general = 'Something went wrong. Please try again.'
    return result
  }

  for (const [key, val] of Object.entries(source)) {
    if (key === 'non_field_errors' || key === 'detail') {
      result.general = Array.isArray(val) ? val[0] : val
    } else if (key === 'message') {
      result.general = Array.isArray(val) ? val[0] : val
    } else {
      result.fieldErrors[key] = Array.isArray(val) ? val[0] : val
    }
  }

  return result
}