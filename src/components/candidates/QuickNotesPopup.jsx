import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { toast } from 'react-toastify'

const QuickNotesPopup = ({ candidate, isOpen, onClose, onAddNote }) => {
  const [note, setNote] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setNote('')
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen || !candidate) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!note.trim()) return

    setIsAdding(true)
    try {
      await onAddNote(candidate.id, note)
      setNote('')
      onClose()
      toast.success('Quick note added!')
    } catch (error) {
      toast.error('Failed to add note')
    } finally {
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="font-semibold text-gray-900">Quick Note</h3>
            <p className="text-sm text-gray-600 mt-1">
              Add a note for {candidate.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your note here..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            autoFocus
          />
          
          <div className="flex justify-between items-center mt-4">
            <p className="text-xs text-gray-500">
              Press Ctrl+Enter to save quickly
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!note.trim() || isAdding}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAdding ? 'Adding...' : 'Add Note'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuickNotesPopup