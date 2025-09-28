import React, { useState, useContext } from 'react'
import { MessageSquare, Send, AtSign } from 'lucide-react'
import { toast } from 'react-toastify'
import { AppContext } from '../../context/AppContext'

const NotesSection = ({ candidateId, notes, onAddNote }) => {
  const { recruiter } = useContext(AppContext)
  const [newNote, setNewNote] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [mentionSuggestions, setMentionSuggestions] = useState([])
  const [showMentions, setShowMentions] = useState(false)

  const teamMembers = [
    { id: 1, name: 'John Smith', role: 'HR Manager' },
    { id: 2, name: 'Sarah Wilson', role: 'Tech Lead' },
    { id: 3, name: 'Mike Johnson', role: 'Recruiter' },
    { id: 4, name: 'Lisa Brown', role: 'VP Engineering' }
  ]

  const handleNoteChange = (e) => {
    const value = e.target.value
    setNewNote(value)

    const lastAtIndex = value.lastIndexOf('@')
    if (lastAtIndex !== -1) {
      const searchTerm = value.substring(lastAtIndex + 1).toLowerCase()
      const suggestions = teamMembers.filter(member => 
        member.name.toLowerCase().includes(searchTerm)
      )
      setMentionSuggestions(suggestions)
      setShowMentions(suggestions.length > 0)
    } else {
      setShowMentions(false)
    }
  }

  const insertMention = (member) => {
    const lastAtIndex = newNote.lastIndexOf('@')
    const beforeMention = newNote.substring(0, lastAtIndex)
    const afterMention = newNote.substring(newNote.length)
    setNewNote(`${beforeMention}@${member.name} `)
    setShowMentions(false)
  }

  const handleSubmit = async () => {
    if (!newNote.trim()) return

    setIsAdding(true)
    try {
      await onAddNote({
        content: newNote,
        author: recruiter?.name || 'HR Team'
      })
      setNewNote('')
      toast.success('Note added successfully')
    } catch (error) {
      toast.error('Failed to add note')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <MessageSquare className="h-5 w-5 mr-2" />
        Notes & Comments
      </h3>

      <div className="space-y-4 mb-6">
        {notes.map((note) => (
          <div key={note.id} className="border-l-4 border-blue-200 pl-4 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">{note.author}</span>
              <span className="text-xs text-gray-500">
                {new Date(note.createdAt || note.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <p className="text-sm text-gray-700">{note.content}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <textarea
          value={newNote}
          onChange={handleNoteChange}
          placeholder="Add a note... Use @mentions to notify team members"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
        
        {showMentions && (
          <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-32 overflow-y-auto z-10">
            {mentionSuggestions.map((member) => (
              <button
                key={member.id}
                onClick={() => insertMention(member)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center"
              >
                <AtSign className="h-4 w-4 mr-2 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.role}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-3">
          <div className="text-xs text-gray-500">
            Tip: Use @mentions to notify team members
          </div>
          <button
            onClick={handleSubmit}
            disabled={!newNote.trim() || isAdding}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Add Note
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotesSection