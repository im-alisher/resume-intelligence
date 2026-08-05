export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

interface ApiErrorBody {
  message?: string | string[]
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const isFormData = options.body instanceof FormData
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody
    const message = Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message
    throw new ApiError(message ?? 'Something went wrong', response.status)
  }

  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}
