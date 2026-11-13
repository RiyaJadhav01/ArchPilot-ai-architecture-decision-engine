import type {
  AnalyzeRequest,
  ArchitectureAnalysis,
  ApiError,
  WhatIfRequest,
  WhatIfResponse,
} from '../types/architecture'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
      ...options,
    })
  } catch {
    const error: ApiError = { message: 'Unable to connect to the backend. Please check that the API is running.' }
    throw error
  }

   
  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`

    try {
      const body = await response.json() as {
        detail?: string | Array<{
          loc?: Array<string | number>
          msg?: string
          type?: string
        }>
        message?: string
      }

      if (typeof body.detail === 'string') {
        message = body.detail
      } else if (Array.isArray(body.detail)) {
        message = body.detail
          .map((item) => {
            const field = item.loc?.join('.') ?? 'request'
            return `${field}: ${item.msg ?? 'Invalid value'}`
          })
          .join('; ')
      } else if (body.message) {
        message = body.message
      }
    } catch {
      // Keep the generic HTTP error.
    }

    const error: ApiError = { message, status: response.status }
    throw error
  }

  return response.json() as Promise<T>
}

 
export const architectureApi = {
  analyze(payload: AnalyzeRequest): Promise<ArchitectureAnalysis> {
    return request<ArchitectureAnalysis>('/architecture/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  whatIf(payload: WhatIfRequest): Promise<WhatIfResponse> {
    return request<WhatIfResponse>('/architecture/analyze/what-if', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
