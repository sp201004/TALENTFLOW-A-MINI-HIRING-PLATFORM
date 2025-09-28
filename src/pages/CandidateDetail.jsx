import React, { useContext, useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, Clock } from 'lucide-react'
import { toast } from 'react-toastify'
import { TimelineItem, NotesSection, HIRING_STAGES } from '../components/candidates'

const sortTimelineEvents = (timeline) => {
  return timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

const canTransitionToStage = (currentStage, newStage) => {
  if (currentStage === newStage) return false
  
  const stageOrder = {
    'Applied': 0,
    'Online Assessment': 1,
    'Technical Interview': 2, 
    'Final Interview': 3,
    'Hired': 4,
    'Rejected': 5
  }
  
  const currentIndex = stageOrder[currentStage]
  const newIndex = stageOrder[newStage]
  
  if (currentIndex === undefined || newIndex === undefined) return false
  
  if (newIndex > currentIndex) return true
  
  if (newStage === 'Rejected' && currentStage !== 'Hired') return true
  
  if (currentStage === 'Rejected' && newIndex < stageOrder['Rejected']) return true
  
  if ((currentStage === 'Hired' && newStage === 'Rejected') || 
      (currentStage === 'Rejected' && newStage === 'Hired')) return true
  
  return false
}


const CandidateDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { candidates, updateCandidateStage, jobs, addCandidateNote, getCandidateNotes, getCandidateStageHistory, recruiter } = useContext(AppContext)
  
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeline, setTimeline] = useState([])
  const [notes, setNotes] = useState([])
  const [updatingStage, setUpdatingStage] = useState(false)

  const loadCandidateNotes = async (candidateId) => {
    try {
      const candidateNotes = await getCandidateNotes(candidateId)
      setNotes(candidateNotes)
    } catch (error) {
      console.error('Error loading candidate notes:', error)
      setNotes([
        {
          id: `${candidateId}-note-demo-1`,
          content: 'Great technical skills demonstrated during the online assessment.',
          author: 'Mike Johnson',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          candidateId: candidateId
        }
      ])
    }
  }

  useEffect(() => {
    const loadCandidateData = async () => {
      const foundCandidate = candidates.find(c => c.id === parseInt(id))
      if (foundCandidate) {
        setCandidate(foundCandidate)
        
        try {
          const stageHistory = await getCandidateStageHistory(foundCandidate.id)
          
          const processedTimeline = stageHistory.map(entry => ({
            id: `history-${entry.id}`,
            type: entry.toStage,
            stage: entry.toStage,
            title: entry.description || `Stage changed: ${entry.fromStage || 'Start'} → ${entry.toStage}`,
            description: entry.description || `Stage changed: ${entry.fromStage || 'Start'} → ${entry.toStage}`,
            timestamp: entry.timestamp,
            author: entry.author,
            fromStage: entry.fromStage,
            toStage: entry.toStage
          }))
          
          setTimeline(processedTimeline)
        } catch (error) {
          console.error('Error loading stage history:', error)
          const fallbackTimeline = [{
            id: `${foundCandidate.id}-applied`,
            type: 'Applied',
            stage: 'Applied',
            title: 'Application Submitted',
            description: 'Candidate applied for the position',
            timestamp: foundCandidate.createdAt,
            author: 'System'
          }]
          setTimeline(fallbackTimeline)
        }

        await loadCandidateNotes(foundCandidate.id)
      }
      setLoading(false)
    }
    
    loadCandidateData()
  }, [id, candidates, getCandidateStageHistory])


  const handleStageChange = async (newStage) => {
    if (!candidate || updatingStage) return
    
    if (!canTransitionToStage(candidate.stage, newStage)) {
      toast.error(`Cannot transition from ${candidate.stage} to ${newStage}`)
      return
    }

    setUpdatingStage(true)
    
    const optimisticTimelineEntry = {
      id: `optimistic-${Date.now()}`,
      type: newStage,
      stage: newStage,
      title: `Stage changed: ${candidate.stage} → ${newStage}`,
      description: `Stage changed: ${candidate.stage} → ${newStage}`,
      timestamp: new Date().toISOString(),
      author: 'HR Manager',
      fromStage: candidate.stage,
      toStage: newStage
    }
    
    setTimeline(prev => {
      const filtered = prev.filter(entry => !entry.id.startsWith('optimistic-'))
      return [optimisticTimelineEntry, ...filtered]
    })
    
    try {
      const success = await updateCandidateStage(candidate.id, newStage, 'HR Manager')
      if (success) {
        setCandidate(prev => ({ ...prev, stage: newStage }))
        
        try {
          const stageHistory = await getCandidateStageHistory(candidate.id)
          const processedTimeline = stageHistory.map(entry => ({
            id: `history-${entry.id}`,
            type: entry.toStage,
            stage: entry.toStage,
            title: entry.description || `Stage changed: ${entry.fromStage || 'Start'} → ${entry.toStage}`,
            description: entry.description || `Stage changed: ${entry.fromStage || 'Start'} → ${entry.toStage}`,
            timestamp: entry.timestamp,
            author: entry.author,
            fromStage: entry.fromStage,
            toStage: entry.toStage
          }))
          
          setTimeline(processedTimeline)
          
          console.log('✅ Timeline refreshed with', stageHistory.length, 'timeline entries')
        } catch (timelineError) {
          console.error('Error refreshing timeline:', timelineError)
        }
        
        toast.success(`Candidate moved to ${newStage}`)
      } else {
        setTimeline(prev => prev.filter(entry => !entry.id.startsWith('optimistic-')))
        toast.error('Failed to update candidate stage')
      }
    } catch (error) {
      setTimeline(prev => prev.filter(entry => !entry.id.startsWith('optimistic-')))
      toast.error('Error updating candidate stage')
    } finally {
      setUpdatingStage(false)
    }
  }

  const handleAddNote = async (noteData) => {
    try {
      const newNote = await addCandidateNote({
        candidateId: candidate.id,
        content: noteData.content,
        author: noteData.author
      })
      
      setNotes(prev => [newNote, ...prev])
      return newNote
    } catch (error) {
      console.error('Error adding note:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Candidate Not Found</h2>
          <Link to="/candidates" className="text-blue-600 hover:text-blue-500">
            ← Back to Candidates
          </Link>
        </div>
      </div>
    )
  }

  const appliedJob = jobs.find(job => job.id === candidate.jobId)
  const currentStage = HIRING_STAGES.find(s => s.key === candidate.stage)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link 
            to="/candidates"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Candidates
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
              <p className="text-gray-600">{candidate.email}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStage?.color || 'bg-gray-100 text-gray-800'}`}>
                {currentStage?.label || candidate.stage}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{candidate.email}</p>
                  </div>
                </div>
                {candidate.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">{candidate.phone}</p>
                    </div>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-600">{candidate.location}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Applied</p>
                    <p className="text-sm text-gray-600">
                      {new Date(candidate.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {appliedJob && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Applied Position
                </h3>
                <div className="border-l-4 border-blue-200 pl-4">
                  <h4 className="font-medium text-gray-900">{appliedJob.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{appliedJob.company}</p>
                  <p className="text-sm text-gray-500 mt-1">{appliedJob.location}</p>
                  {appliedJob.salary && (
                    <p className="text-sm text-green-600 mt-1 font-medium">{appliedJob.salary}</p>
                  )}
                </div>
              </div>
            )}

            <NotesSection 
              candidateId={candidate.id}
              notes={notes}
              onAddNote={handleAddNote}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Stage</h3>
              <div className="space-y-2">
                {HIRING_STAGES.map((stage) => {
                  const isDisabled = updatingStage || !canTransitionToStage(candidate.stage, stage.key)
                  return (
                    <button
                      key={stage.key}
                      onClick={() => handleStageChange(stage.key)}
                      disabled={isDisabled}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        candidate.stage === stage.key
                          ? `${stage.color} border border-current`
                          : isDisabled
                          ? 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                      } ${updatingStage ? 'opacity-50' : ''}`}
                    >
                      {updatingStage && candidate.stage === stage.key ? 'Updating...' : stage.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Timeline
              </h3>
              <div className="space-y-1">
                {timeline.map((item, index) => (
                  <TimelineItem
                    key={item.id}
                    item={item}
                    isLast={index === timeline.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CandidateDetail
