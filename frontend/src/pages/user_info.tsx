import { useEffect, useState, useMemo } from 'react'
import { HttpError, Users, type UserInfo } from '../api/client'
import { useSearchParams } from 'react-router-dom';
import './index.css'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: UserInfo }

export function UserInfo() {
  const [searchParams] = useSearchParams();
  const [userId, setUserId] = useState('')
  const [state, setState] = useState<State>({ status: 'loading' })
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<UserInfo | null>(null)


  useEffect(() => {
    const idFromUrl = searchParams.get('id') || ''
    setUserId(idFromUrl) // get the user id from the url 
    loadUserInfo(idFromUrl)
  }, [searchParams])

  async function loadUserInfo(id?: string) {
    const userIdToUse = id || userId
    if (!userIdToUse.trim()) {
      setState({ status: 'error', message: 'Please enter a user ID' })
      return
    }

    setState({ status: 'loading' })
    try {
      const data = await Users.getUserInfo(userIdToUse.trim())
      setState({ status: 'ready', data })
    } catch (e) {
      const err = e as HttpError
      setState({ status: 'error', message: err.message })
    }
  }

  function startEdit() {
    if (state.status === 'ready') {
      setEditData({ ...state.data })
      setIsEditing(true)
    }
  }

  function cancelEdit() {
    setIsEditing(false)
    setEditData(null)
  }

  async function saveChanges() {
    if (!editData || !userId.trim()) return

    setState({ status: 'loading' })
    try {
      await Users.updateUser(userId.trim(), editData)
      setState({ status: 'ready', data: editData })
      setIsEditing(false)
      setEditData(null)
    } catch (e) {
      const err = e as HttpError
      setState({ status: 'error', message: err.message })
    }
  }

  function updateEditField(field: keyof UserInfo, value: string | number) {
    if (editData) {
      setEditData({ ...editData, [field]: value })
    }
  }


  const body = useMemo(() => {
    if (state.status === 'loading') return <p className="p-4">Loading user information…</p>
    if (state.status === 'error') return <p className="p-4 text-red-600">{state.message}</p>
    
    const user = isEditing && editData ? editData : state.data
    
    const renderField = (field: keyof UserInfo, label: string, type: 'text' | 'number' | 'textarea' = 'text') => {
      if (isEditing && editData) {
        return (
          <div className="flex items-center space-x-2">
            {type === 'textarea' ? (
              <textarea
                value={editData[field] || ''}
                onChange={(e) => updateEditField(field, e.target.value)}
                className="flex-1 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                rows={4}
              />
            ) : (
              <input
                type={type}
                value={editData[field] || ''}
                onChange={(e) => updateEditField(field, type === 'number' ? Number(e.target.value) : e.target.value)}
                className="flex-1 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            )}
          </div>
        )
      } else {
        return (
          <div className="flex items-center space-x-2">
            <div className="flex-1 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
              {user[field] || (field === 'email' ? 'Not provided' : field === 'phone_number' ? 'Not provided' : field === 'vibe' ? 'Not specified' : field === 'bio' ? 'No bio provided' : '')}
            </div>
          </div>
        )
      }
    }
    
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
              {renderField('first_name', 'First Name')}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              {renderField('last_name', 'Last Name')}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              {renderField('age', 'Age', 'number')}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              {renderField('email', 'Email')}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              {renderField('phone_number', 'Phone Number')}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vibe</label>
              {renderField('vibe', 'Vibe')}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              {renderField('bio', 'Bio', 'textarea')}
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t flex justify-between">
          <button 
            onClick={() => setState({ status: 'loading' })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Refresh User Info
          </button>
          
          {!isEditing ? (
            <button
              onClick={startEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Edit User Info
            </button>
          ) : (
            <div className="space-x-2">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }, [state, isEditing, editData])

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

      <div className="border rounded">{body}</div>
    </div>
  )
}
