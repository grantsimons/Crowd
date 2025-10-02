import { useEffect, useState, useMemo } from 'react'
import { HttpError, Users, type UserInfo } from '../api/client'
import './index.css'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: UserInfo }

export function UserInfo() {
  const [userId, setUserId] = useState('')
  const [state, setState] = useState<State>({ status: 'loading' })

  async function loadUserInfo() {
    if (!userId.trim()) {
      setState({ status: 'error', message: 'Please enter a user ID' })
      return
    }

    setState({ status: 'loading' })
    try {
      const data = await Users.getUserInfo(userId.trim())
      setState({ status: 'ready', data })
    } catch (e) {
      const err = e as HttpError
      setState({ status: 'error', message: err.message })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadUserInfo()
  }

  const body = useMemo(() => {
    if (state.status === 'loading') return <p className="p-4">Loading user information…</p>
    if (state.status === 'error') return <p className="p-4 text-red-600">{state.message}</p>
    
    const user = state.data
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {user.first_name} {user.last_name}
          </h2>
          <p className="text-gray-600">User ID: {user.user_id}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <div className="p-3 bg-gray-50 rounded border">{user.first_name}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <div className="p-3 bg-gray-50 rounded border">{user.last_name}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <div className="p-3 bg-gray-50 rounded border">{user.age}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="p-3 bg-gray-50 rounded border">{user.email || 'Not provided'}</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="p-3 bg-gray-50 rounded border">{user.phone_number || 'Not provided'}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vibe</label>
              <div className="p-3 bg-gray-50 rounded border">{user.vibe || 'Not specified'}</div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <div className="p-3 bg-gray-50 rounded border min-h-[100px]">
                {user.bio || 'No bio provided'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <button 
            onClick={() => setState({ status: 'loading' })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Refresh User Info
          </button>
        </div>
      </div>
    )
  }, [state])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">User Information</h1>
        <a 
          href="/home" 
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Back to Home
        </a>
      </div>

      <form className="flex gap-2" onSubmit={handleSubmit} aria-label="get-user-form">
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter User ID"
          className="flex-1 border rounded px-3 py-2"
          required
        />
        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors" type="submit">
          Get User Info
        </button>
      </form>

      <div className="border rounded">{body}</div>
    </div>
  )
}
