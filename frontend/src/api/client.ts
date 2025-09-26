const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${baseURL}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : undefined
  if (!res.ok) {
    const message = data?.detail || res.statusText
    throw new HttpError(res.status, message)
  }
  return data as T
}

export type Idea = {
  id: number
  title: string
  description: string
  created_at: string
  updated_at: string
  votes_count: number
}

export type Paginated<T> = { items: T[]; total: number; page: number; size: number }

export const Ideas = {
  list(params: { page?: number; size?: number; q?: string; sort?: 'created_at' | 'votes'; order?: 'asc' | 'desc' } = {}) {
    const qs = new URLSearchParams()
    if (params.page) qs.set('page', String(params.page))
    if (params.size) qs.set('size', String(params.size))
    if (params.q) qs.set('q', params.q)
    if (params.sort) qs.set('sort', params.sort)
    if (params.order) qs.set('order', params.order)
    const query = qs.toString() ? `?${qs.toString()}` : ''
    return fetchJson<Paginated<Idea>>(`/api/v1/ideas${query}`)
  },
  create(payload: { title: string; description: string }) {
    return fetchJson<Idea>(`/api/v1/ideas`, { method: 'POST', body: JSON.stringify(payload) })
  },
  get(id: number) {
    return fetchJson<Idea>(`/api/v1/ideas/${id}`)
  },
  update(id: number, payload: Partial<{ title: string; description: string }>) {
    return fetchJson<Idea>(`/api/v1/ideas/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  },
  remove(id: number) {
    return fetchJson<void>(`/api/v1/ideas/${id}`, { method: 'DELETE' })
  },
  vote(id: number, voter?: string) {
    return fetchJson<void>(`/api/v1/ideas/${id}/vote`, { method: 'POST', body: JSON.stringify({ voter }) })
  },
  votesCount(id: number) {
    return fetchJson<{ idea_id: number; votes_count: number }>(`/api/v1/ideas/${id}/votes_count`)
  },
  top(params: { page?: number; size?: number } = {}) {
    const qs = new URLSearchParams()
    if (params.page) qs.set('page', String(params.page))
    if (params.size) qs.set('size', String(params.size))
    const query = qs.toString() ? `?${qs.toString()}` : ''
    return fetchJson<Idea[]>(`/api/v1/ideas/top${query}`)
  },
}

