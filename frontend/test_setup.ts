import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const API = process.env.VITE_API_URL || 'http://localhost:8000'

const ideas = [
  { id: 1, title: 'Dark Mode', description: 'add dark theme', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), votes_count: 1 },
]

export const handlers = [
  http.get(`${API}/api/v1/ideas`, () => {
    return HttpResponse.json({ items: ideas, total: ideas.length, page: 1, size: 10 })
  }),
  http.post(`${API}/api/v1/ideas`, async ({ request }) => {
    const body = await request.json() as any
    const created = { id: ideas.length + 1, votes_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...body }
    ideas.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),
  http.post(`${API}/api/v1/ideas/:id/vote`, () => HttpResponse.text('', { status: 204 })),
]

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

