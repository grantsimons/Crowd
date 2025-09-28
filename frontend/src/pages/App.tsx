import { useEffect, useMemo, useState } from 'react'
import { HttpError, Idea, Ideas } from '../api/client'
import './index.css'


type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: { items: Idea[]; total: number; page: number; size: number } }

export function App() {
  const [query, setQuery] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [state, setState] = useState<State>({ status: 'loading' })
  const [sort, setSort] = useState<'created_at' | 'votes'>('created_at')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  async function load() {
    setState({ status: 'loading' })
    try {
      const data = await Ideas.list({ q: query, sort, order })
      setState({ status: 'ready', data })
    } catch (e) {
      const err = e as HttpError
      setState({ status: 'error', message: err.message })
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, order])

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (title.trim().length < 3 || title.trim().length > 120) return
    try {
      await Ideas.create({ title: title.trim(), description: description.trim() })
      setTitle('')
      setDescription('')
      await load()
    } catch (e) {
      alert((e as Error).message)
    }
  }

  async function onVote(id: number) {
    try {
      await Ideas.vote(id)
      await load()
    } catch (e) {
      alert((e as Error).message)
    }
  }

  const body = useMemo(() => {
    if (state.status === 'loading') return <p className="p-4">Loading…</p>
    if (state.status === 'error') return <p className="p-4 text-red-600">{state.message}</p>
    if (state.data.items.length === 0) return <p className="p-4">No ideas yet.</p>
    return (
      <ul className="divide-y">
        {state.data.items.map((i) => (
          <li key={i.id} className="p-4 flex items-start gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{i.votes_count}</div>
              <button className="mt-2 px-3 py-1 rounded bg-blue-600 text-white" onClick={() => onVote(i.id)}>
                Vote
              </button>
            </div>
            <div className="flex-1">
              <div className="font-semibold">{i.title}</div>
              <div className="text-sm opacity-80">{i.description}</div>
            </div>
          </li>
        ))}
      </ul>
    )
  }, [state])

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Crowd Ideas</h1>

      <form className="flex gap-2" onSubmit={onCreate} aria-label="create-idea-form">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Idea title"
          className="flex-1 border rounded px-3 py-2"
          required
          minLength={3}
          maxLength={120}
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="flex-1 border rounded px-3 py-2"
          maxLength={2000}
        />
        <button className="px-4 py-2 bg-green-600 text-white rounded" type="submit">
          Add
        </button>
      </form>

      <div className="flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="border rounded px-3 py-2"
          aria-label="search-input"
        />
        <button className="px-3 py-2 border rounded" onClick={load}>
          Search
        </button>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="border rounded px-2 py-2">
          <option value="created_at">Newest</option>
          <option value="votes">Most voted</option>
        </select>
        <select value={order} onChange={(e) => setOrder(e.target.value as any)} className="border rounded px-2 py-2">
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>

      <div className="border rounded">{body}</div>
    </div>
  )
}

