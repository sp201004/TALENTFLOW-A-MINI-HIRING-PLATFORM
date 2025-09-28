
const API_BASE_URL = '/api'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(errorData.message || 'Request failed', response.status)
  }
  return response.json()
}

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  const response = await fetch(url, config)
  return handleResponse(response)
}

export const jobsApi = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })
    const queryString = searchParams.toString()
    return request(`/jobs${queryString ? `?${queryString}` : ''}`)
  },

  getById: (id) => request(`/jobs/${id}`),

  create: (jobData) => request('/jobs', {
    method: 'POST',
    body: jobData
  }),

  update: (id, jobData) => request(`/jobs/${id}`, {
    method: 'PATCH',
    body: jobData
  }),

  reorder: (id, newOrder) => request(`/jobs/${id}/reorder`, {
    method: 'PATCH',
    body: { order: newOrder }
  })
}

export const candidatesApi = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })
    const queryString = searchParams.toString()
    return request(`/candidates${queryString ? `?${queryString}` : ''}`)
  },

  getById: (id) => request(`/candidates/${id}`),

  create: (candidateData) => request('/candidates', {
    method: 'POST',
    body: candidateData
  }),

  update: (id, candidateData) => request(`/candidates/${id}`, {
    method: 'PATCH',
    body: candidateData
  }),

  getTimeline: (id) => request(`/candidates/${id}/timeline`)
}

export const notesApi = {
  getCandidateNotes: (candidateId) => request(`/candidates/${candidateId}/notes`),

  addNote: (candidateId, noteData) => request(`/candidates/${candidateId}/notes`, {
    method: 'POST',
    body: noteData
  })
}

export const assessmentsApi = {
  getByJobId: (jobId) => request(`/assessments/${jobId}`),

  update: (jobId, assessmentData) => request(`/assessments/${jobId}`, {
    method: 'PUT',
    body: assessmentData
  }),

  submit: (jobId, responseData) => request(`/assessments/${jobId}/submit`, {
    method: 'POST',
    body: responseData
  })
}

export default {
  jobs: jobsApi,
  candidates: candidatesApi,
  notes: notesApi,
  assessments: assessmentsApi
}