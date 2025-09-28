import { createContext, useState, useEffect } from "react";
import { db } from '../database/db'
import { seedData } from '../database/seed'

export const AppContext = createContext()

const STORAGE_KEYS = {
  jobs: 'talentflow_jobs',
  candidates: 'talentflow_candidates', 
  assessments: 'talentflow_assessments',
  recruiter: 'talentflow_recruiter',
  notes: 'talentflow_notes',
  stageHistory: 'talentflow_stage_history'
}

const STAGE_ORDER = [
  'Applied',
  'Online Assessment', 
  'Technical Interview',
  'Final Interview',
  'Hired',
  'Rejected'
]

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

const saveToStorage = (key, data) => {
  const jsonData = JSON.stringify(data)
  const storageKey = STORAGE_KEYS[key]
  
  localStorage.setItem(storageKey, jsonData)
  localStorage.setItem(`${storageKey}_backup`, jsonData)
  localStorage.setItem(`${storageKey}_${window.location.port || '80'}`, jsonData)
  
}

const getFromStorage = (key) => {
  const storageKey = STORAGE_KEYS[key]
  
  let data = localStorage.getItem(storageKey)
  
  if (!data) {
    data = localStorage.getItem(`${storageKey}_backup`)
  }
  
  if (!data) {
    const allKeys = Object.keys(localStorage)
    const portKey = allKeys.find(k => k.startsWith(`${storageKey}_`))
    if (portKey) {
      data = localStorage.getItem(portKey)
    }
  }
  
  if (!data || data === 'null' || data === 'undefined' || data === '[object Object]') {
    return []
  }
  
  try {
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error parsing ${key} from storage:`, error)
    return []
  }
}

const getRecruiterFromStorage = () => {
  const storageKey = STORAGE_KEYS.recruiter
  
  let data = localStorage.getItem(storageKey)
  
  if (!data) {
    data = localStorage.getItem(`${storageKey}_backup`)
  }
  
  if (!data) {
    const allKeys = Object.keys(localStorage)
    const portKey = allKeys.find(k => k.startsWith(`${storageKey}_`))
    if (portKey) {
      data = localStorage.getItem(portKey)
    }
  }
  
  if (!data || data === 'null' || data === 'undefined' || data === '[object Object]') {
    return null
  }
  
  try {
    return JSON.parse(data)
  } catch (error) {
    console.error('Error parsing recruiter from storage:', error)
    return null
  }
}

const removeFromStorage = (key) => {
  const storageKey = STORAGE_KEYS[key]
  
  localStorage.removeItem(storageKey)
  
  localStorage.removeItem(`${storageKey}_backup`)
  
  const allKeys = Object.keys(localStorage)
  allKeys.forEach(k => {
    if (k.startsWith(`${storageKey}_`)) {
      localStorage.removeItem(k)
    }
  })
  
}

export const AppContexProvider = (props) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [recruiter, setRecruiter] = useState(null)

  const [searchFilter, setSearchFilter] = useState({
    title: '',
    location: ''
  })
  const [isSeached, setIsSearched] = useState(false)
  const [jobs, setJobs] = useState([])
  const [candidates, setCandidates] = useState([])
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(false)

  const migrateDataFromOtherPorts = () => {
    
    const allKeys = Object.keys(localStorage)
    let migrated = false
    
    Object.keys(STORAGE_KEYS).forEach(dataType => {
      const currentData = getFromStorage(dataType)
      
      if (currentData.length === 0 || (dataType === 'recruiter' && !currentData)) {
        const backupKeys = allKeys.filter(key => 
          key.includes(STORAGE_KEYS[dataType]) && key !== STORAGE_KEYS[dataType]
        )
        
        for (const backupKey of backupKeys) {
          const backupData = localStorage.getItem(backupKey)
          if (backupData && backupData !== '[]' && backupData !== 'null') {
            localStorage.setItem(STORAGE_KEYS[dataType], backupData)
            migrated = true
            break
          }
        }
      }
    })
    
    if (migrated) {
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        
        migrateDataFromOtherPorts()
        
        await db.open()
        
        const existingJobs = await db.jobs.toArray()
        const existingCandidates = await db.candidates.toArray()
        const existingAssessments = await db.assessments.toArray()
        
        console.log(`   - Assessments: ${existingAssessments.length}`)
        
        if (existingJobs.length > 0 && existingCandidates.length > 0 && existingAssessments.length > 0) {
          console.log('✅ Loading existing data from IndexedDB')
          setJobs(existingJobs)
          setCandidates(existingCandidates)
          setAssessments(existingAssessments)
          
          saveToStorage('jobs', existingJobs)
          saveToStorage('candidates', existingCandidates)
          saveToStorage('assessments', existingAssessments)
          
          return
        }
        
        const localJobs = getFromStorage('jobs')
        const localCandidates = getFromStorage('candidates')
        const localAssessments = getFromStorage('assessments')
        
        console.log(`   - Jobs: ${localJobs.length}`)
        console.log(`   - Candidates: ${localCandidates.length}`)
        console.log(`   - Assessments: ${localAssessments.length}`)
        
        if (localJobs.length > 0 && localCandidates.length > 0 && localAssessments.length > 0) {
          setJobs(localJobs)
          setCandidates(localCandidates)
          setAssessments(localAssessments)
          
          setTimeout(async () => {
            try {
              await db.jobs.bulkPut(localJobs)
              await db.candidates.bulkPut(localCandidates)
              await db.assessments.bulkPut(localAssessments)
            } catch (error) {
            }
          }, 0)
          
          return
        }
        
        
        await seedData()
        
        const jobsData = await db.jobs.toArray()
        const candidatesData = await db.candidates.toArray() 
        const assessmentsData = await db.assessments.toArray()
        
        setJobs(jobsData)
        setCandidates(candidatesData)
        setAssessments(assessmentsData)
        
        saveToStorage('jobs', jobsData)
        saveToStorage('candidates', candidatesData)
        saveToStorage('assessments', assessmentsData)
        
      } catch (error) {
        console.error('❌ Error loading data:', error)
        
        if (error.name === 'BulkError') {
          try {
            const existingJobs = await db.jobs.toArray()
            const existingCandidates = await db.candidates.toArray()
            const existingAssessments = await db.assessments.toArray()
            
            setJobs(existingJobs)
            setCandidates(existingCandidates)
            setAssessments(existingAssessments)
            
          } catch (loadError) {
          }
        }
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (jobs.length === 0 && candidates.length === 0 && assessments.length === 0) {
      return
    }

    const autoSaveTimer = setTimeout(() => {
      const performAutoSave = async () => {
        try {
          
          if (jobs.length > 0) saveToStorage('jobs', jobs)
          if (candidates.length > 0) saveToStorage('candidates', candidates)  
          if (assessments.length > 0) saveToStorage('assessments', assessments)
          
          setTimeout(async () => {
            try {
              if (jobs.length > 0) await db.jobs.bulkPut(jobs).catch(() => {})
              if (candidates.length > 0) await db.candidates.bulkPut(candidates).catch(() => {})  
              if (assessments.length > 0) await db.assessments.bulkPut(assessments).catch(() => {})
            } catch (error) {
            }
          }, 0)
        } catch (error) {
        }
      }
      
      if (window.requestIdleCallback) {
        window.requestIdleCallback(performAutoSave, { timeout: 1000 })
      } else {
        setTimeout(performAutoSave, 0)
      }
    }, 2000)

    return () => clearTimeout(autoSaveTimer)
  }, [jobs, candidates, assessments])

  const login = async (email, password) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (email === 'extnt@hr.in' && password === '123456') {
        const adminRecruiter = {
          id: 1,
          name: 'HR Manager',
          email: 'extnt@hr.in',
          company: 'TechCorp Inc.',
          role: 'recruiter'
        }
        setRecruiter(adminRecruiter)
        setIsAuthenticated(true)
        saveToStorage('recruiter', adminRecruiter)
        return { success: true }
      }
      
      if (email && password) {
        const mockRecruiter = {
          id: 1,
          name: 'HR Manager',
          email: email,
          company: 'TechCorp Inc.',
          role: 'recruiter'
        }
        setRecruiter(mockRecruiter)
        setIsAuthenticated(true)
        saveToStorage('recruiter', mockRecruiter)
        return { success: true }
      }
      return { success: false, message: 'Invalid credentials' }
    } catch (error) {
      return { success: false, message: 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setRecruiter(null)
    
    removeFromStorage('recruiter')
    localStorage.removeItem('candidatesViewMode')
    
    localStorage.removeItem('lastVisitedRoute')
    localStorage.removeItem('authToken')
    localStorage.removeItem('sessionToken')
    sessionStorage.clear()
    
    window.location.href = '/'
  }

  const register = async (name, email, password) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockRecruiter = {
        id: Date.now(),
        name,
        email,
        company: 'New Company',
        role: 'recruiter'
      }
      setRecruiter(mockRecruiter)
      setIsAuthenticated(true)
      saveToStorage('recruiter', mockRecruiter)
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Registration failed' }
    } finally {
      setLoading(false)
    }
  }

  const fetchJobs = async () => {
    try {
      const jobsData = await db.jobs.orderBy('order').toArray()
      setJobs(jobsData)
      return jobsData
    } catch (error) {
      console.error('Error fetching jobs:', error)
      return []
    }
  }

  const fetchCandidates = async (filters = {}) => {
    try {
      let query = db.candidates.orderBy('createdAt')

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        query = db.candidates.filter(candidate =>
          candidate.name.toLowerCase().includes(searchTerm) ||
          candidate.email.toLowerCase().includes(searchTerm)
        )
      }

      if (filters.stage) {
        query = query.filter(candidate => candidate.stage === filters.stage)
      }

      const candidatesData = await query.toArray()
      setCandidates(candidatesData)
      return candidatesData
    } catch (error) {
      console.error('Error fetching candidates:', error)
      return []
    }
  }

  const createCandidate = async (candidateData) => {
    try {
      const newCandidate = {
        id: Date.now(),
        ...candidateData,
        appliedAt: candidateData.appliedAt || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (!newCandidate.stage) {
        newCandidate.stage = 'Applied'
      }

      const updatedCandidates = [...candidates, newCandidate]
      setCandidates(updatedCandidates)
      
      try {
        await db.candidates.put(newCandidate)
      } catch (dbError) {
        console.warn('Database save failed:', dbError)
      }
      
      saveToStorage('candidates', updatedCandidates)

      try {
        await createInitialTimeline(
          newCandidate.id, 
          newCandidate.stage, 
          newCandidate.appliedAt
        )
        console.log('✅ Initial timeline created for new candidate:', newCandidate.id)
      } catch (timelineError) {
        console.warn('Failed to create initial timeline for candidate:', timelineError)
      }
      
      return { success: true, candidate: newCandidate }
    } catch (error) {
      console.error('Error creating candidate:', error)
      return { success: false, message: 'Failed to create candidate' }
    }
  }

  const fetchCandidateById = async (id) => {
    try {
      const candidate = await db.candidates.get(id)
      return candidate
    } catch (error) {
      console.error('Error fetching candidate:', error)
      return null
    }
  }

  const updateCandidateStage = async (id, newStage, changedBy = 'HR Manager') => {
    try {
      const candidate = candidates.find(c => c.id === parseInt(id))
      if (!candidate) {
        console.error('Candidate not found:', id)
        return false
      }

      const oldStage = candidate.stage
      
      if (!canTransitionToStage(oldStage, newStage)) {
        console.warn(`Invalid stage transition: ${oldStage} → ${newStage}`)
        return false
      }

      if (oldStage === newStage) {
        console.log('Stage is the same, no update needed')
        return true
      }

      const updateData = {
        stage: newStage,
        updatedAt: new Date().toISOString()
      }

      try {
        const { candidatesApi } = await import('../services/api')
        await candidatesApi.update(id, updateData)
        console.log('✅ Candidate stage updated via API:', id, newStage)
      } catch (apiError) {
        console.warn('⚠️ API failed, using direct database:', apiError)
        const existingCandidate = await db.candidates.get(id)
        if (existingCandidate) {
          const fullUpdatedCandidate = { ...existingCandidate, ...updateData }
          await db.candidates.put(fullUpdatedCandidate)
          console.log('✅ Candidate stage updated in IndexedDB:', fullUpdatedCandidate.name, newStage)
        }
      }

      const storedCandidates = getFromStorage('candidates')
      const updatedCandidates = storedCandidates.map(candidate => 
        candidate.id === parseInt(id) ? { ...candidate, ...updateData } : candidate
      )
      saveToStorage('candidates', updatedCandidates)
      
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.id === parseInt(id) ? { ...candidate, ...updateData } : candidate
        )
      )

      try {
        const existingTimeline = await db.candidateStageHistory
          .where('candidateId').equals(parseInt(id))
          .toArray()
        
        let shouldCreateEntry = true
        let duplicateReason = ''
        
        const exactDuplicate = existingTimeline.find(entry => 
          entry.fromStage === oldStage && 
          entry.toStage === newStage &&
          Math.abs(new Date() - new Date(entry.timestamp)) < 30000 
        )
        
        if (exactDuplicate) {
          shouldCreateEntry = false
          duplicateReason = 'exact duplicate within 30 seconds'
        }
        
        if (shouldCreateEntry && (newStage === 'Rejected' || newStage === 'Hired')) {
          const recentFinalDecisions = existingTimeline.filter(entry => 
            (entry.toStage === 'Hired' || entry.toStage === 'Rejected') &&
            new Date(entry.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000) 
          ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          
          if (recentFinalDecisions.length > 0) {
            const latestDecision = recentFinalDecisions[0]
            if (latestDecision.toStage !== newStage) {
              console.log(`🔄 Final decision change detected: ${latestDecision.toStage} → ${newStage}`)
              duplicateReason = `overriding previous decision: ${latestDecision.toStage}`
            } else if (latestDecision.toStage === newStage) {
              shouldCreateEntry = false
              duplicateReason = `duplicate final decision: ${newStage}`
            }
          }
        }
        
        if (shouldCreateEntry) {
          const now = new Date()
          const stageHistoryEntry = {
            id: `${id}-${now.getTime()}-${Math.floor(Math.random() * 10000)}`,
            candidateId: parseInt(id),
            fromStage: oldStage,
            toStage: newStage,
            author: changedBy, 
            timestamp: now.toISOString(),
            description: `Stage changed: ${oldStage} → ${newStage}${duplicateReason ? ` (${duplicateReason})` : ''}`
          }
          
          await db.candidateStageHistory.put(stageHistoryEntry)
          
          const stored = getFromStorage('stageHistory') || {}
          if (!stored[id]) {
            stored[id] = []
          }
          stored[id].unshift(stageHistoryEntry)
          saveToStorage('stageHistory', stored)
          
          console.log('✅ Stage history entry created:', stageHistoryEntry.description, `by ${changedBy}`)
        } else {
          console.log(`⚠️ Stage transition skipped (${duplicateReason}): ${oldStage} → ${newStage}`)
        }
      } catch (historyError) {
        console.warn('Failed to save stage history:', historyError)
      }

      console.log('✅ Candidate stage updated and timeline logged:', id, newStage)
      return true
    } catch (error) {
      console.error('Error updating candidate stage:', error)
      return false
    }
  }

  const addCandidateNote = async (noteData) => {
    try {
      let newNote
      try {
        const { notesApi } = await import('../services/api')
        const response = await notesApi.addNote(noteData.candidateId, {
          content: noteData.content,
          author: noteData.author
        })
        newNote = response.note
        console.log('✅ Note added via API:', newNote.id)
      } catch (apiError) {
        console.warn('⚠️ API failed, using direct database:', apiError)
        newNote = {
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          candidateId: noteData.candidateId,
          content: noteData.content,
          author: noteData.author,
          createdAt: new Date().toISOString()
        }
        
        await db.notes.put(newNote)
        console.log('✅ Note saved directly to IndexedDB:', newNote.id)
      }

      const existingNotes = getFromStorage('notes') || []
      const updatedNotes = [newNote, ...existingNotes]
      saveToStorage('notes', updatedNotes)

      return newNote
    } catch (error) {
      console.error('Error adding candidate note:', error)
      throw error
    }
  }

  const getCandidateNotes = async (candidateId) => {
    try {
      let notes = []
      try {
        const { notesApi } = await import('../services/api')
        const response = await notesApi.getCandidateNotes(candidateId)
        notes = response.notes
        console.log(`✅ Retrieved ${notes.length} notes via API for candidate ${candidateId}`)
      } catch (apiError) {
        console.warn('⚠️ API failed, using direct database:', apiError)
        notes = await db.notes.where('candidateId').equals(candidateId).reverse().toArray()
        console.log(`✅ Retrieved ${notes.length} notes from IndexedDB for candidate ${candidateId}`)
      }

      return notes
    } catch (error) {
      console.error('Error getting candidate notes:', error)
      return []
    }
  }

  const createInitialTimeline = async (candidateId, currentStage, appliedDate) => {
    try {
      const stageIndex = STAGE_ORDER.indexOf(currentStage)
      if (stageIndex === -1) {
        console.warn(`Unknown stage "${currentStage}" for candidate ${candidateId}`)
        return []
      }

      const timeline = []
      const baseTime = new Date(appliedDate)
      
      const existingApplicationEntry = await db.candidateStageHistory
        .where('candidateId').equals(parseInt(candidateId))
        .and(entry => 
          entry.fromStage === null && 
          entry.toStage === 'Applied' && 
          (entry.description === 'Application Submitted' || entry.description.includes('Application Submitted'))
        )
        .first()
      
      if (!existingApplicationEntry) {
        timeline.push({
          id: `${candidateId}-initial-${Date.now()}`,
          candidateId: parseInt(candidateId),
          fromStage: null,
          toStage: 'Applied',
          author: 'System',
          timestamp: baseTime.toISOString(),
          description: 'Application Submitted'
        })
        console.log('✅ Created initial "Application Submitted" entry for candidate:', candidateId)
      } else {
        console.log('ℹ️ "Application Submitted" entry already exists for candidate:', candidateId)
      }

      if (stageIndex > 0) {
        let sequentialStages = []
        
        if (currentStage === 'Rejected') {
          const rejectionPoints = ['Applied', 'Online Assessment', 'Technical Interview', 'Final Interview']
          const rejectionStageIndex = Math.floor(Math.random() * rejectionPoints.length)
          const rejectionStage = rejectionPoints[rejectionStageIndex]
          const rejectionIndex = STAGE_ORDER.indexOf(rejectionStage)
          
          for (let i = 1; i <= rejectionIndex; i++) {
            sequentialStages.push({
              fromStage: STAGE_ORDER[i - 1],
              toStage: STAGE_ORDER[i],
              isProgression: true
            })
          }
          
          sequentialStages.push({
            fromStage: rejectionStage,
            toStage: 'Rejected',
            isProgression: false
          })
        } else {
          for (let i = 1; i <= stageIndex; i++) {
            sequentialStages.push({
              fromStage: STAGE_ORDER[i - 1],
              toStage: STAGE_ORDER[i],
              isProgression: true
            })
          }
        }
        
        for (let i = 0; i < sequentialStages.length; i++) {
          const stage = sequentialStages[i]
          
          let timeOffset = (i + 1) * (1 + Math.random() * 3) * 24 * 60 * 60 * 1000
          
          if (!stage.isProgression) {
            timeOffset += Math.random() * 12 * 60 * 60 * 1000 
          }
          
          const stageTime = new Date(baseTime.getTime() + timeOffset)
          
          const existingTransition = await db.candidateStageHistory
            .where('candidateId').equals(parseInt(candidateId))
            .and(entry => entry.fromStage === stage.fromStage && entry.toStage === stage.toStage)
            .first()
            
          if (!existingTransition) {
            timeline.push({
              id: `${candidateId}-backfill-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              candidateId: parseInt(candidateId),
              fromStage: stage.fromStage,
              toStage: stage.toStage,
              author: 'System',
              timestamp: stageTime.toISOString(),
              description: `Stage changed: ${stage.fromStage} → ${stage.toStage}`
            })
            console.log(`✅ Created backfill transition: ${stage.fromStage} → ${stage.toStage}`)
          }
        }
      }

      for (const entry of timeline) {
        try {
          await db.candidateStageHistory.put(entry)
        } catch (dbError) {
          console.warn('Database save failed for timeline entry:', dbError)
        }
      }
      
      const stored = getFromStorage('stageHistory') || {}
      if (!stored[candidateId]) {
        stored[candidateId] = []
      }
      stored[candidateId] = [...timeline, ...stored[candidateId]]
      saveToStorage('stageHistory', stored)
      
      console.log(`✅ Created initial timeline with ${timeline.length} entries for candidate ${candidateId} (${currentStage})`)
      return timeline
    } catch (error) {
      console.error('Error creating initial timeline:', error)
      return []
    }
  }

  const getCandidateStageHistory = async (candidateId) => {
    try {
      let history = []
      
      try {
        const dbHistory = await db.candidateStageHistory.where('candidateId').equals(parseInt(candidateId)).toArray()
        if (dbHistory && dbHistory.length > 0) {
          history = dbHistory
        }
      } catch (dbError) {
        console.warn('Database fetch failed for stage history:', dbError)
        
        const stored = getFromStorage('stageHistory') || {}
        history = stored[candidateId] || []
      }
      
      if (history.length === 0) {
        const candidate = candidates.find(c => c.id === parseInt(candidateId))
        if (candidate) {
          console.log('No timeline found for candidate, creating initial timeline:', candidateId)
          history = await createInitialTimeline(candidateId, candidate.stage, candidate.appliedAt || candidate.createdAt)
        }
      }
      
      const chronologicalHistory = history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      
      const validTimeline = []
      const stageIndexMap = {
        'Applied': 0,
        'Online Assessment': 1, 
        'Technical Interview': 2,
        'Final Interview': 3,
        'Hired': 4,
        'Rejected': 5
      }
      
      const applicationEntries = chronologicalHistory.filter(entry => 
        entry.fromStage === null && entry.toStage === 'Applied' && 
        (entry.description === 'Application Submitted' || entry.description.includes('Application Submitted'))
      )
      
      const oldestApplicationEntry = applicationEntries.length > 0 
        ? applicationEntries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0]
        : null
      
      if (oldestApplicationEntry) {
        validTimeline.push(oldestApplicationEntry)
      }
      
      const stageTransitions = chronologicalHistory.filter(entry => 
        !(entry.fromStage === null && entry.toStage === 'Applied' && 
        (entry.description === 'Application Submitted' || entry.description.includes('Application Submitted')))
      )
      
      let currentStage = 'Applied'
      let currentStageIndex = 0
      const seenTransitions = new Set()
      
      for (const entry of stageTransitions) {
        const transitionKey = `${entry.fromStage}->${entry.toStage}`
        const toStageIndex = stageIndexMap[entry.toStage]
        const fromStageIndex = stageIndexMap[entry.fromStage]
        
        if (seenTransitions.has(transitionKey)) {
          console.log(`🔄 Skipping duplicate transition: ${transitionKey}`)
          continue
        }
        
        let isValidTransition = false
        
        if (fromStageIndex !== undefined && toStageIndex !== undefined) {
          if (toStageIndex > fromStageIndex) {
            isValidTransition = true
          }
          else if (entry.toStage === 'Rejected' && entry.fromStage !== 'Hired') {
            isValidTransition = true
          }
          else if (entry.fromStage === 'Rejected' && toStageIndex < stageIndexMap['Rejected']) {
            isValidTransition = true
          }
          else if ((entry.fromStage === 'Hired' && entry.toStage === 'Rejected') || 
                   (entry.fromStage === 'Rejected' && entry.toStage === 'Hired')) {
            isValidTransition = true
          }
        }
        
        if (isValidTransition) {
          if (entry.fromStage === currentStage || 
              Math.abs(fromStageIndex - currentStageIndex) <= 1 ||
              entry.toStage === 'Rejected' || 
              entry.fromStage === 'Rejected') { 
            
            validTimeline.push(entry)
            seenTransitions.add(transitionKey)
            currentStage = entry.toStage
            currentStageIndex = toStageIndex
            
            console.log(`✅ Added valid transition: ${transitionKey} (current stage: ${currentStage})`)
          } else {
            console.log(`⚠️ Skipping illogical transition: ${transitionKey} (current stage: ${currentStage})`)
          }
        } else {
          console.log(`❌ Skipping invalid transition: ${transitionKey}`)
        }
      }
      
      const finalTimeline = []
      const timelineByStage = new Map()
      
      for (const entry of validTimeline) {
        const key = entry.toStage
        
        if (!timelineByStage.has(key) || 
            entry.toStage === 'Rejected' || 
            entry.fromStage === 'Rejected') { 
          
          timelineByStage.set(key, entry)
          finalTimeline.push(entry)
        } else {
          const existing = timelineByStage.get(key)
          if (new Date(entry.timestamp) > new Date(existing.timestamp)) {
            const existingIndex = finalTimeline.findIndex(e => e.id === existing.id)
            if (existingIndex !== -1) {
              finalTimeline[existingIndex] = entry
              timelineByStage.set(key, entry)
            }
          }
        }
      }
      
      const uiTimeline = []
      const applicationSubmittedEntry = finalTimeline.find(entry => 
        entry.fromStage === null && entry.toStage === 'Applied' && 
        (entry.description === 'Application Submitted' || entry.description.includes('Application Submitted'))
      )
      
      const otherEntries = finalTimeline.filter(entry => 
        !(entry.fromStage === null && entry.toStage === 'Applied' && 
        (entry.description === 'Application Submitted' || entry.description.includes('Application Submitted')))
      )
      
      const sortedOtherEntries = otherEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      
      if (applicationSubmittedEntry) {
        uiTimeline.push(...sortedOtherEntries, applicationSubmittedEntry)
      } else {
        uiTimeline.push(...sortedOtherEntries)
      }
      
      const candidate = candidates.find(c => c.id === parseInt(candidateId))
      if (candidate && (candidate.stage === 'Final Interview' || candidate.stage === 'Rejected' || 
          uiTimeline.some(entry => entry.toStage === 'Final Interview' || entry.toStage === 'Rejected'))) {
        console.log(`🗃 Final Timeline for candidate ${candidateId} (${candidate?.name || 'Unknown'}) - Current stage: ${candidate?.stage}:`)
        uiTimeline.forEach((entry, index) => {
          console.log(`  ${index + 1}. ${entry.fromStage || 'null'} → ${entry.toStage} (${entry.author}) - ${entry.timestamp.split('T')[0]}`)
        })
      }
      
      return uiTimeline
    } catch (error) {
      console.error('Error fetching candidate stage history:', error)
      return []
    }
  }

  const getApplicationCount = (jobId) => {
    if (!jobId || !candidates) return 0
    return candidates.filter(candidate => candidate.jobId === parseInt(jobId)).length
  }

  const createJob = async (jobData) => {
    try {
      const newJob = {
        id: Date.now(),
        ...jobData,
        status: 'active',
        order: jobs.length,
        applicationsClosedDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const updatedJobs = [...jobs, newJob]
      setJobs(updatedJobs)
      
      try {
        await db.jobs.put(newJob)
      } catch (dbError) {
      }
      
      saveToStorage('jobs', updatedJobs)
      
      return { success: true, job: newJob }
    } catch (error) {
      console.error('Error creating job:', error)
      return { success: false, message: 'Failed to create job' }
    }
  }

  const updateJob = async (id, updates) => {
    try {
      const updatedJob = {
        ...updates,
        id: parseInt(id),
        updatedAt: new Date().toISOString()
      }

      const updatedJobs = jobs.map(job =>
        job.id === parseInt(id) ? { ...job, ...updatedJob } : job
      )
      setJobs(updatedJobs)
      
      try {
        const jobToUpdate = updatedJobs.find(job => job.id === parseInt(id))
        if (jobToUpdate) {
          await db.jobs.put(jobToUpdate)
        }
      } catch (dbError) {
      }
      
      saveToStorage('jobs', updatedJobs)
      
      return { success: true, job: updatedJob }
    } catch (error) {
      console.error('Error updating job:', error)
      return { success: false, message: 'Failed to update job' }
    }
  }

  const archiveJob = async (id) => {
    try {
      const today = new Date()
      const updates = {
        status: 'archived',
        applicationsClosedDate: today.toISOString(),
        applyByDate: today.toISOString(),
        updatedAt: today.toISOString()
      }
      
      const updatedJobs = jobs.map(job =>
        job.id === parseInt(id) ? { ...job, ...updates } : job
      )
      setJobs(updatedJobs)
      
      try {
        const jobToArchive = updatedJobs.find(job => job.id === parseInt(id))
        if (jobToArchive) {
          await db.jobs.put(jobToArchive)
        }
      } catch (dbError) {
      }
      
      saveToStorage('jobs', updatedJobs)
      
      return { success: true }
    } catch (error) {
      console.error('Error archiving job:', error)
      return { success: false, message: 'Failed to archive job' }
    }
  }

  const unarchiveJob = async (id) => {
    try {
      const today = new Date()
      const tenDaysLater = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000)
      
      const updates = {
        status: 'active',
        applyByDate: tenDaysLater.toISOString(),
        applicationsClosedDate: null,
        updatedAt: today.toISOString()
      }
      
      const updatedJobs = jobs.map(job =>
        job.id === parseInt(id) ? { ...job, ...updates } : job
      )
      setJobs(updatedJobs)
      
      try {
        const jobToUnarchive = updatedJobs.find(job => job.id === parseInt(id))
        if (jobToUnarchive) {
          await db.jobs.put(jobToUnarchive)
        }
      } catch (dbError) {
      }
      
      saveToStorage('jobs', updatedJobs)
      
      return { success: true }
    } catch (error) {
      console.error('Error unarchiving job:', error)
      return { success: false, message: 'Failed to unarchive job' }
    }
  }

  const reorderJobs = async (reorderedJobs) => {
    try {
      const updates = reorderedJobs.map((job, index) => ({
        id: job.id,
        order: index,
        updatedAt: new Date().toISOString()
      }))

      await Promise.all(
        updates.map(update => db.jobs.update(update.id, update))
      )
      
      setJobs(reorderedJobs.map((job, index) => ({
        ...job,
        order: index,
        updatedAt: new Date().toISOString()
      })))
      
      return { success: true }
    } catch (error) {
      console.error('Error reordering jobs:', error)
      return { success: false, message: 'Failed to reorder jobs' }
    }
  }

  const deleteJob = async (id) => {
    try {
      const jobId = parseInt(id)
      
      try {
        await db.jobs.delete(jobId)
      } catch (dbError) {
      }
      
      const updatedJobs = jobs.filter(job => job.id !== jobId)
      setJobs(updatedJobs)
      
      saveToStorage('jobs', updatedJobs)
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting job:', error)
      return { success: false, message: 'Failed to delete job' }
    }
  }

  const fetchAssessments = async () => {
    try {
      const assessmentsData = await db.assessments.toArray()
      setAssessments(assessmentsData)
      return assessmentsData
    } catch (error) {
      console.error('Error fetching assessments:', error)
      return []
    }
  }

  const deleteAssessment = async (id) => {
    try {
      const assessmentId = parseInt(id)
      
      try {
        await db.assessments.delete(assessmentId)
      } catch (dbError) {
      }
      
      const updatedAssessments = assessments.filter(assessment => assessment.id !== assessmentId)
      setAssessments(updatedAssessments)
      
      saveToStorage('assessments', updatedAssessments)
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting assessment:', error)
      return { success: false, message: 'Failed to delete assessment' }
    }
  }

  const generateDeterministicCandidates = (jobs) => {
    if (!jobs || jobs.length === 0) {
      console.error('❌ No jobs provided to generateDeterministicCandidates')
      return []
    }
    const candidates = []
    const firstNames = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Ruby', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier', 'Yara', 'Zoe', 'Alex', 'Blake', 'Casey', 'Drew', 'Emery', 'Finley', 'Gray', 'Harper', 'Indigo', 'Jordan', 'Kelly', 'Logan', 'Morgan', 'River', 'Sage', 'Taylor', 'Avery', 'Cameron', 'Eden', 'Phoenix', 'Rowan', 'Skyler']
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts']
    const stages = ['Applied', 'Online Assessment', 'Technical Interview', 'Final Interview', 'Hired', 'Rejected']
    
    const stageDistribution = {
      'Applied': 350,
      'Online Assessment': 250,
      'Technical Interview': 200,
      'Final Interview': 100,
      'Hired': 50,
      'Rejected': 50
    }
    
    let candidateId = 1
    
    for (const [stage, count] of Object.entries(stageDistribution)) {
      for (let i = 0; i < count; i++) {
        const firstName = firstNames[candidateId % firstNames.length]
        const lastName = lastNames[(candidateId * 7) % lastNames.length]
        const job = jobs[(candidateId * 3) % jobs.length]
        
        candidates.push({
          id: candidateId,
          name: `${firstName} ${lastName}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${candidateId}@email.com`,
          jobId: job.id,
          jobTitle: job.title,
          stage: stage,
          createdAt: new Date(Date.now() - (candidateId % 30) * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        })
        
        candidateId++
      }
    }
    
    return candidates
  }

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const storedRecruiter = getRecruiterFromStorage()
        if (storedRecruiter) {
          setRecruiter(storedRecruiter)
          setIsAuthenticated(true)
        }

        console.log('� Loading fresh demo data...')
        
        await db.jobs.clear()
        await db.candidates.clear() 
        await db.assessments.clear()
        
        const staticJobs = [
          { id: 1, title: 'Senior Frontend Developer', company: 'Google', location: 'Mountain View, CA', status: 'active', salaryRange: '$180,000 - $250,000', tags: ['React', 'TypeScript', 'Frontend'], description: 'Join Google\'s Chrome team to build the next generation of web experiences. You\'ll work on cutting-edge frontend technologies, collaborate with world-class engineers, and impact billions of users worldwide. We\'re looking for someone passionate about web performance, accessibility, and user experience.', requirements: 'React 5+ years\nTypeScript\nNext.js\nWeb Performance\nAccessibility\nTesting (Jest, Cypress)\nGraphQL\nWebpack', role: 'Senior Frontend Developer', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 2, title: 'Full Stack Engineer', company: 'Meta', location: 'Menlo Park, CA', status: 'active', salaryRange: '$170,000 - $230,000', tags: ['React', 'Node.js', 'GraphQL'], description: 'Build the future of social connection at Meta. Work on Facebook, Instagram, and WhatsApp platforms used by 3+ billion people globally. You\'ll develop full-stack solutions that connect people and build communities worldwide.', requirements: 'JavaScript/TypeScript 4+ years\nReact\nNode.js\nGraphQL\nPostgreSQL\nRedis\nDocker\nKubernetes\nAWS', role: 'Full Stack Engineer', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 3, title: 'DevOps Engineer', company: 'Amazon AWS', location: 'Seattle, WA', status: 'active', salaryRange: '$160,000 - $220,000', tags: ['AWS', 'Docker', 'Kubernetes'], description: 'Join Amazon Web Services to build and maintain the world\'s most comprehensive cloud platform. Work on infrastructure that powers millions of businesses globally, from startups to enterprises.', requirements: 'AWS 3+ years\nKubernetes\nDocker\nTerraform\nPython\nLinux\nCI/CD\nMonitoring (CloudWatch, Prometheus)\nInfrastructure as Code', role: 'DevOps Engineer', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 4, title: 'Product Designer', company: 'Apple', location: 'Cupertino, CA', status: 'active', salaryRange: '$150,000 - $200,000', tags: ['UI/UX', 'Figma', 'Design'], description: 'Design the future of Apple products that delight millions of users worldwide. Work on iPhone, iPad, Mac, and emerging technologies. Create intuitive, beautiful experiences that define industry standards.', requirements: 'UI/UX Design 4+ years\nFigma\nSketch\nPrototyping\nDesign Systems\nUser Research\nAccessibility\nHuman Interface Guidelines\nAnimation/Motion Design', role: 'Product Designer', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 5, title: 'Principal Data Scientist', company: 'Microsoft', location: 'Redmond, WA', status: 'active', salaryRange: '$190,000 - $280,000', tags: ['Python', 'Machine Learning', 'AI'], description: 'Lead data science initiatives at Microsoft, working on Azure AI, Office 365, and Xbox. Drive strategic decisions through advanced analytics and machine learning across Microsoft\'s ecosystem of products serving billions of users.', requirements: 'Python 5+ years\nMachine Learning\nTensorFlow/PyTorch\nSQL\nAzure\nStatistics\nDeep Learning\nNLP\nComputer Vision\nMLOps', role: 'Principal Data Scientist', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 6, title: 'Backend Software Engineer', company: 'Netflix', location: 'Los Gatos, CA', status: 'active', salaryRange: '$165,000 - $240,000', tags: ['Java', 'Microservices', 'Streaming'], description: 'Build scalable backend systems that power Netflix\'s streaming platform for 200+ million subscribers worldwide. Work on microservices, distributed systems, and high-performance video streaming infrastructure.', requirements: 'Java 4+ years\nSpring Boot\nMicroservices\nKafka\nCassandra\nAWS\nDistributed Systems\nREST APIs\nDatabases (MySQL, NoSQL)', role: 'Backend Software Engineer', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 7, title: 'Senior iOS Developer', company: 'Uber', location: 'San Francisco, CA', status: 'active', salaryRange: '$155,000 - $210,000', tags: ['iOS', 'Swift', 'Mobile'], description: 'Join Uber\'s mobile team to build and enhance the rider and driver apps used by millions daily. Focus on creating smooth, intuitive experiences for iOS users worldwide across rides, delivery, and freight.', requirements: 'iOS Development 4+ years\nSwift\niOS SDK\nUIKit\nSwiftUI\nCore Data\nREST APIs\nMVVM\nXcode\nGit', role: 'Senior iOS Developer', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 8, title: 'Cloud Solutions Architect', company: 'Salesforce', location: 'San Francisco, CA', status: 'active', salaryRange: '$180,000 - $250,000', tags: ['Cloud', 'Salesforce', 'Architecture'], description: 'Design and implement cloud solutions at Salesforce, the world\'s leading CRM platform. Help enterprise customers migrate to the cloud and optimize their Salesforce implementations for maximum business value.', requirements: 'Salesforce Platform 3+ years\nApex\nLightning\nIntegration\nCloud Architecture\nSaaS\nEnterprise Solutions\nSalesforce Admin\nCustom Development', role: 'Cloud Solutions Architect', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 9, title: 'Machine Learning Engineer', company: 'OpenAI', location: 'San Francisco, CA', status: 'active', salaryRange: '$200,000 - $350,000', tags: ['AI', 'ML', 'LLM'], description: 'Join OpenAI to advance artificial intelligence research and development. Work on large language models, GPT improvements, and cutting-edge AI systems that push the boundaries of what\'s possible in artificial intelligence.', requirements: 'Python 4+ years\nTensorFlow/PyTorch\nTransformers\nLLMs\nDeep Learning\nNLP\nMLOps\nDistributed Training\nResearch Experience\nMathematics/Statistics', role: 'Machine Learning Engineer', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 10, title: 'Cybersecurity Engineer', company: 'Tesla', location: 'Austin, TX', status: 'active', salaryRange: '$140,000 - $190,000', tags: ['Security', 'Tesla', 'Automotive'], description: 'Protect Tesla\'s automotive systems, charging infrastructure, and manufacturing processes from cyber threats. Work on securing autonomous vehicle systems, Supercharger networks, and energy products.', requirements: 'Network Security 3+ years\nPenetration Testing\nAutomotive Security\nLinux\nPython\nThreat Analysis\nIncident Response\nSIEM\nVulnerability Assessment', role: 'Cybersecurity Engineer', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 11, title: 'Site Reliability Engineer', company: 'Airbnb', location: 'San Francisco, CA', status: 'active', salaryRange: '$170,000 - $230,000', tags: ['SRE', 'Infrastructure', 'DevOps'], description: 'Ensure the reliability and scalability of Airbnb\'s platform that connects millions of hosts and guests worldwide. Work on infrastructure automation, monitoring, and incident response for global travel experiences.', requirements: 'SRE/DevOps 4+ years\nKubernetes\nDocker\nTerraform\nMonitoring\nIncident Response\nPython\nLinux\nCloud Platforms\nService Mesh', role: 'Site Reliability Engineer', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 12, title: 'Senior Blockchain Developer', company: 'Coinbase', location: 'New York, NY', status: 'active', salaryRange: '$160,000 - $220,000', tags: ['Blockchain', 'Crypto', 'DeFi'], description: 'Build the future of finance at Coinbase, the leading cryptocurrency exchange. Develop smart contracts, DeFi protocols, and blockchain infrastructure for millions of users entering the crypto economy.', requirements: 'Blockchain 3+ years\nSolidity\nEthereum\nWeb3.js\nSmart Contracts\nDeFi\nCryptography\nNode.js\nReact\nSecurity Best Practices', role: 'Senior Blockchain Developer', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 13, title: 'Senior Product Manager', company: 'Slack', location: 'San Francisco, CA', status: 'active', salaryRange: '$160,000 - $210,000', tags: ['Product', 'Enterprise', 'SaaS'], description: 'Lead product strategy for Slack\'s enterprise communication platform. Drive product roadmap, work with engineering teams, and shape the future of workplace collaboration for millions of users worldwide.', requirements: 'Product Management 4+ years\nProduct Strategy\nAgile\nUser Research\nData Analysis\nRoadmap Planning\nStakeholder Management\nB2B SaaS\nEnterprise Software', role: 'Senior Product Manager', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 14, title: 'Senior Game Developer', company: 'Unity Technologies', location: 'Austin, TX', status: 'active', salaryRange: '$130,000 - $180,000', tags: ['Game Dev', 'Unity', 'C#'], description: 'Create immersive gaming experiences at Unity Technologies. Work on game engines, tools, and platforms that power thousands of games worldwide, from indie hits to AAA blockbusters.', requirements: 'Game Development 4+ years\nC#\nUnity Engine\nGame Physics\n3D Graphics\nShaders\nPerformance Optimization\nMultiplayer Systems\nVR/AR\nMobile Gaming', role: 'Senior Game Developer', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 15, title: 'Senior BI Analyst', company: 'LinkedIn', location: 'Sunnyvale, CA', status: 'active', salaryRange: '$140,000 - $185,000', tags: ['Analytics', 'SQL', 'BI'], description: 'Drive data-driven decisions at LinkedIn, the world\'s largest professional network. Analyze user behavior, business metrics, and market trends to inform strategic initiatives across the platform.', requirements: 'Business Intelligence 3+ years\nSQL\nTableau\nPython\nData Modeling\nStatistics\nBusiness Analytics\nA/B Testing\nData Visualization\nHadoop/Spark', role: 'Senior BI Analyst', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 16, title: 'Senior QA Engineer', company: 'Spotify', location: 'New York, NY', status: 'active', salaryRange: '$130,000 - $175,000', tags: ['QA', 'Testing', 'Automation'], description: 'Ensure the quality of Spotify\'s music streaming platform used by 500+ million users worldwide. Work on automated testing, performance testing, and quality processes for music discovery and streaming.', requirements: 'QA Engineering 4+ years\nTest Automation\nSelenium\nJest\nCypress\nPerformance Testing\nAgile Testing\nCI/CD\nQuality Processes\nAPI Testing', role: 'Senior QA Engineer', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 17, title: 'Senior Systems Administrator', company: 'Dropbox', location: 'San Francisco, CA', status: 'active', salaryRange: '$135,000 - $180,000', tags: ['Systems', 'Linux', 'Cloud'], description: 'Manage and optimize Dropbox\'s infrastructure that stores and syncs billions of files worldwide. Work on system automation, monitoring, and infrastructure scaling for cloud storage solutions.', requirements: 'Systems Administration 4+ years\nLinux Administration\nAWS\nAutomation Scripts\nMonitoring\nNetworking\nDatabase Administration\nSecurity\nPython/Bash\nVirtualization', role: 'Senior Systems Administrator', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 18, title: 'Senior UI/UX Designer', company: 'Figma', location: 'San Francisco, CA', status: 'active', salaryRange: '$140,000 - $190,000', tags: ['UI/UX', 'Design', 'Figma'], description: 'Shape the design of Figma, the collaborative design tool used by millions of designers worldwide. Create intuitive interfaces and improve user experience for the design community.', requirements: 'UI/UX Design 4+ years\nFigma\nSketch\nAdobe Creative Suite\nPrototyping\nUser Research\nDesign Systems\nInteraction Design\nUsability Testing\nCollaborative Design', role: 'Senior UI/UX Designer', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 19, title: 'Senior Network Engineer', company: 'Cisco', location: 'San Jose, CA', status: 'active', salaryRange: '$145,000 - $195,000', tags: ['Networking', 'Infrastructure', 'Enterprise'], description: 'Design and maintain network infrastructure at Cisco, the global leader in networking technology. Work on enterprise networking solutions, routers, switches, and emerging network technologies.', requirements: 'Network Engineering 4+ years\nCCNP\nBGP\nOSPF\nSDN\nNetwork Security\nRouting Protocols\nFirewall Configuration\nNetwork Monitoring\nCisco Technologies', role: 'Senior Network Engineer', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 20, title: 'Senior Database Administrator', company: 'Oracle', location: 'Austin, TX', status: 'active', salaryRange: '$140,000 - $185,000', tags: ['Database', 'Oracle', 'SQL'], description: 'Manage mission-critical database systems at Oracle, the world\'s leading database company. Ensure high availability, performance, and security of enterprise databases serving global organizations.', requirements: 'Database Administration 4+ years\nOracle Database\nSQL\nPL/SQL\nDatabase Tuning\nBackup & Recovery\nRAC\nData Guard\nPerformance Monitoring\nHigh Availability', role: 'Senior Database Administrator', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 21, title: 'Senior AR/VR Developer', company: 'Meta', location: 'Menlo Park, CA', status: 'active', salaryRange: '$165,000 - $225,000', tags: ['AR/VR', 'Unity', 'Metaverse'], description: 'Build the future of the metaverse at Meta. Develop immersive AR/VR experiences for Quest devices and create next-generation social interactions in virtual spaces that connect people globally.', requirements: 'AR/VR Development 3+ years\nUnity\nUnreal Engine\nOculus SDK\nARKit\nARCore\nComputer Vision\nC#\n3D Graphics\nVR Optimization\nSpatial Computing', role: 'Senior AR/VR Developer', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 22, title: 'Senior Security Engineer', company: 'CrowdStrike', location: 'Austin, TX', status: 'active', salaryRange: '$150,000 - $200,000', tags: ['Security', 'Threat Detection', 'Cybersecurity'], description: 'Protect organizations from cyber threats at CrowdStrike, a leader in cloud-delivered endpoint and workload protection. Work on advanced threat detection, incident response, and security intelligence.', requirements: 'Cybersecurity 4+ years\nEndpoint Security\nThreat Hunting\nIncident Response\nMalware Analysis\nSIEM\nCloud Security\nPython\nPowerShell\nForensics', role: 'Senior Security Engineer', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 23, title: 'Senior Performance Engineer', company: 'Cloudflare', location: 'San Francisco, CA', status: 'active', salaryRange: '$155,000 - $210,000', tags: ['Performance', 'CDN', 'Optimization'], description: 'Optimize performance at Cloudflare, powering 20% of the internet. Work on edge computing, CDN optimization, global network performance improvements, and make the web faster for everyone.', requirements: 'Performance Engineering 3+ years\nPerformance Testing\nCDN Optimization\nNetwork Protocols\nLoad Testing\nProfiling Tools\nGo\nRust\nLinux Performance\nEdge Computing', role: 'Senior Performance Engineer', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 24, title: 'Marketing Technology Engineer', company: 'HubSpot', location: 'Cambridge, MA', status: 'active', salaryRange: '$135,000 - $180,000', tags: ['MarTech', 'CRM', 'Marketing'], description: 'Build marketing technology solutions at HubSpot, the leading CRM and marketing automation platform. Create tools that help millions of businesses grow better through inbound marketing and sales.', requirements: 'Software Engineering 3+ years\nJavaScript\nReact\nNode.js\nMarketing Automation\nAPI Integration\nGoogle Analytics\nCRM Systems\nA/B Testing\nData Analysis', role: 'Marketing Technology Engineer', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 36 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          { id: 25, title: 'Senior Platform Engineer', company: 'Stripe', location: 'San Francisco, CA', status: 'active', salaryRange: '$175,000 - $240,000', tags: ['Platform', 'Payments', 'Infrastructure'], description: 'Build the infrastructure that powers global payments at Stripe. Work on scalable systems that process billions of dollars in transactions for millions of businesses worldwide, enabling internet commerce.', requirements: 'Platform Engineering 4+ years\nKubernetes\nDocker\nGo\nTerraform\nAWS\nPostgreSQL\nRedis\nDistributed Systems\nPayments Infrastructure\nFintech', role: 'Senior Platform Engineer', employmentType: 'Full-time', applyByDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(), applicationsClosedDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ]
        
        const savedCandidates = getFromStorage('candidates')
        let staticCandidates = []
        

        
        if (savedCandidates && savedCandidates !== 'undefined' && savedCandidates !== 'null' && savedCandidates !== '[object Object]' && typeof savedCandidates === 'string') {
          try {
            const parsedCandidates = JSON.parse(savedCandidates)
            if (Array.isArray(parsedCandidates) && parsedCandidates.length > 0) {
              staticCandidates = parsedCandidates
            } else {
              throw new Error('Invalid candidates data structure')
            }
          } catch (error) {
            console.error('Error parsing saved candidates:', error)
            staticCandidates = generateDeterministicCandidates(staticJobs)
          }
        } else {
          staticCandidates = generateDeterministicCandidates(staticJobs)
        }
        
        const staticAssessments = [
          { 
            id: 1, 
            jobId: 1, 
            title: 'Frontend Development Assessment', 
            description: 'Evaluate React, TypeScript, and modern frontend development skills',
            sections: [{
              id: 'section-1',
              title: 'Frontend Development Questions',
              description: 'Comprehensive evaluation of frontend development skills',
              questions: [
                {
                  id: 'q1',
                  type: 'single-choice',
                  title: 'What is the purpose of the Virtual DOM in React?',
                  description: '',
                  options: [
                    'To directly manipulate the real DOM',
                    'To optimize rendering by creating a lightweight copy of the real DOM',
                    'To store component state',
                    'To handle HTTP requests'
                  ],
                  correctAnswer: 'To optimize rendering by creating a lightweight copy of the real DOM',
                  required: true,
                  points: 2
                },
                {
                  id: 'q2',
                  type: 'multi-choice',
                  title: 'Which of the following are valid CSS display properties?',
                  description: '',
                  options: ['block', 'inline', 'flex', 'absolute', 'grid', 'relative'],
                  correctAnswers: ['block', 'inline', 'flex', 'grid'],
                  required: true,
                  points: 3
                },
                {
                  id: 'q3',
                  type: 'short-text',
                  title: 'What is the difference between "let" and "var" in JavaScript?',
                  description: '',
                  maxLength: 500,
                  required: true,
                  points: 3
                },
                {
                  id: 'q4',
                  type: 'code',
                  title: 'Write a JavaScript function to reverse a string',
                  description: 'Create a function called reverseString that takes a string as input and returns the reversed string.',
                  language: 'javascript',
                  required: true,
                  points: 5
                },
                {
                  id: 'q5',
                  type: 'single-choice',
                  title: 'Which CSS property is used to create responsive designs?',
                  description: '',
                  options: ['position', 'display', 'media-query', 'transform'],
                  correctAnswer: 'media-query',
                  required: true,
                  points: 2
                },
                {
                  id: 'q6',
                  type: 'long-text',
                  title: 'Explain the concept of "mobile-first" design and its benefits',
                  description: '',
                  maxLength: 1000,
                  required: true,
                  points: 4
                },
                {
                  id: 'q7',
                  type: 'single-choice',
                  title: 'What does CORS stand for?',
                  description: '',
                  options: [
                    'Cross-Origin Resource Sharing',
                    'Cross-Object Resource Security',
                    'Component Object Resource Sharing',
                    'Cross-Origin Request Security'
                  ],
                  correctAnswer: 'Cross-Origin Resource Sharing',
                  required: true,
                  points: 2
                },
                {
                  id: 'q8',
                  type: 'multi-choice',
                  title: 'Which are JavaScript frameworks/libraries?',
                  description: '',
                  options: ['React', 'Vue.js', 'Django', 'Angular', 'Laravel', 'Svelte'],
                  correctAnswers: ['React', 'Vue.js', 'Angular', 'Svelte'],
                  required: true,
                  points: 3
                },
                {
                  id: 'q9',
                  type: 'short-text',
                  title: 'What is the purpose of webpack in frontend development?',
                  description: '',
                  maxLength: 400,
                  required: true,
                  points: 3
                },
                {
                  id: 'q10',
                  type: 'single-choice',
                  title: 'Which HTML tag is used for the largest heading?',
                  description: '',
                  options: ['<h6>', '<h1>', '<header>', '<big>'],
                  correctAnswer: '<h1>',
                  required: true,
                  points: 1
                },
                {
                  id: 'q11',
                  type: 'code',
                  title: 'Create a CSS class to center a div horizontally and vertically',
                  description: 'Write CSS code to create a class that centers any element both horizontally and vertically on the page.',
                  language: 'css',
                  required: true,
                  points: 4
                },
                {
                  id: 'q12',
                  type: 'long-text',
                  title: 'Describe your approach to optimizing web application performance',
                  description: '',
                  maxLength: 800,
                  required: true,
                  points: 5
                }
              ]
            }],
            settings: { timeLimit: 60, passingScore: 70, showResults: true, allowRetake: false, autoSave: true },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          { 
            id: 2, 
            jobId: 6, 
            title: 'Backend Engineering Assessment', 
            description: 'Test Java, microservices, and distributed systems knowledge',
            sections: [{
              id: 'section-1',
              title: 'Backend Engineering Questions',
              description: 'Comprehensive evaluation of backend development skills',
              questions: [
                {
                  id: 'q1',
                  type: 'single-choice',
                  title: 'What is the main purpose of an API?',
                  description: '',
                  options: [
                    'To store data in databases',
                    'To enable communication between different software applications',
                    'To create user interfaces',
                    'To manage server hardware'
                  ],
                  correctAnswer: 'To enable communication between different software applications',
                  required: true,
                  points: 2
                },
                {
                  id: 'q2',
                  type: 'multi-choice',
                  title: 'Which are valid HTTP status codes?',
                  description: '',
                  options: ['200', '404', '301', '199', '500', '999'],
                  correctAnswers: ['200', '404', '301', '500'],
                  required: true,
                  points: 3
                },
                {
                  id: 'q3',
                  type: 'short-text',
                  title: 'Explain the difference between SQL and NoSQL databases',
                  description: '',
                  maxLength: 500,
                  required: true,
                  points: 4
                },
                {
                  id: 'q4',
                  type: 'code',
                  title: 'Write a function to validate an email address using regex',
                  description: 'Create a function that returns true if the email is valid, false otherwise.',
                  language: 'javascript',
                  required: true,
                  points: 5
                },
                {
                  id: 'q5',
                  type: 'single-choice',
                  title: 'Which HTTP method is used to update existing data?',
                  description: '',
                  options: ['GET', 'POST', 'PUT', 'DELETE'],
                  correctAnswer: 'PUT',
                  required: true,
                  points: 2
                },
                {
                  id: 'q6',
                  type: 'long-text',
                  title: 'Describe how you would design a scalable REST API',
                  description: '',
                  maxLength: 1000,
                  required: true,
                  points: 5
                },
                {
                  id: 'q7',
                  type: 'single-choice',
                  title: 'What is the purpose of indexing in databases?',
                  description: '',
                  options: [
                    'To encrypt data',
                    'To improve query performance',
                    'To backup data',
                    'To validate data types'
                  ],
                  correctAnswer: 'To improve query performance',
                  required: true,
                  points: 3
                },
                {
                  id: 'q8',
                  type: 'multi-choice',
                  title: 'Which are backend programming languages?',
                  description: '',
                  options: ['Python', 'JavaScript', 'Java', 'HTML', 'C#', 'CSS'],
                  correctAnswers: ['Python', 'JavaScript', 'Java', 'C#'],
                  required: true,
                  points: 3
                },
                {
                  id: 'q9',
                  type: 'short-text',
                  title: 'What is the difference between authentication and authorization?',
                  description: '',
                  maxLength: 400,
                  required: true,
                  points: 4
                },
                {
                  id: 'q10',
                  type: 'code',
                  title: 'Write a SQL query to find the second highest salary',
                  description: 'Write a SQL query to find the second highest salary from an employees table.',
                  language: 'sql',
                  required: true,
                  points: 5
                },
                {
                  id: 'q11',
                  type: 'single-choice',
                  title: 'Which is a popular caching solution?',
                  description: '',
                  options: ['MySQL', 'Redis', 'MongoDB', 'PostgreSQL'],
                  correctAnswer: 'Redis',
                  required: true,
                  points: 2
                },
                {
                  id: 'q12',
                  type: 'long-text',
                  title: 'Explain your approach to handling database migrations in production',
                  description: '',
                  maxLength: 800,
                  required: true,
                  points: 5
                }
              ]
            }],
            settings: { timeLimit: 90, passingScore: 75, showResults: true, allowRetake: false, autoSave: true },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          { 
            id: 3, 
            jobId: 9, 
            title: 'Machine Learning Assessment', 
            description: 'Evaluate ML algorithms, Python, and AI model development skills',
            sections: [{
              id: 'section-1',
              title: 'Machine Learning Questions',
              description: 'Comprehensive evaluation of machine learning engineering skills',
              questions: [
                {
                  id: 'q1',
                  type: 'single-choice',
                  title: 'What is the vanishing gradient problem?',
                  description: '',
                  options: [
                    'When gradients become too large during training',
                    'When gradients become too small and impede learning in deep networks',
                    'When the model overfits to training data',
                    'When the dataset is too small'
                  ],
                  correctAnswer: 'When gradients become too small and impede learning in deep networks',
                  required: true,
                  points: 4
                },
                {
                  id: 'q2',
                  type: 'multi-choice',
                  title: 'Which are deep learning frameworks?',
                  description: '',
                  options: ['TensorFlow', 'PyTorch', 'pandas', 'Keras', 'scikit-learn', 'JAX'],
                  correctAnswers: ['TensorFlow', 'PyTorch', 'Keras', 'JAX'],
                  required: true,
                  points: 3
                },
                {
                  id: 'q3',
                  type: 'short-text',
                  title: 'Explain the concept of transfer learning',
                  description: '',
                  maxLength: 500,
                  required: true,
                  points: 4
                },
                {
                  id: 'q4',
                  type: 'code',
                  title: 'Write Python code to implement a simple neural network layer',
                  description: 'Implement a basic dense layer with forward pass using NumPy.',
                  language: 'python',
                  required: true,
                  points: 6
                },
                {
                  id: 'q5',
                  type: 'single-choice',
                  title: 'Which optimization algorithm is commonly used in deep learning?',
                  description: '',
                  options: ['Bubble Sort', 'Adam', 'Binary Search', 'Dijkstra'],
                  correctAnswer: 'Adam',
                  required: true,
                  points: 3
                },
                {
                  id: 'q6',
                  type: 'long-text',
                  title: 'Describe your approach to hyperparameter tuning',
                  description: '',
                  maxLength: 1000,
                  required: true,
                  points: 5
                },
                {
                  id: 'q7',
                  type: 'single-choice',
                  title: 'What is the purpose of batch normalization?',
                  description: '',
                  options: [
                    'To reduce the size of batches',
                    'To normalize input to each layer and stabilize training',
                    'To increase model capacity',
                    'To reduce overfitting'
                  ],
                  correctAnswer: 'To normalize input to each layer and stabilize training',
                  required: true,
                  points: 4
                },
                {
                  id: 'q8',
                  type: 'multi-choice',
                  title: 'Which are types of neural network architectures?',
                  description: '',
                  options: ['CNN', 'RNN', 'LSTM', 'HTTP', 'GAN', 'API'],
                  correctAnswers: ['CNN', 'RNN', 'LSTM', 'GAN'],
                  required: true,
                  points: 4
                },
                {
                  id: 'q9',
                  type: 'short-text',
                  title: 'What is the difference between precision and recall?',
                  description: '',
                  maxLength: 400,
                  required: true,
                  points: 4
                },
                {
                  id: 'q10',
                  type: 'code',
                  title: 'Implement a function to calculate accuracy metric',
                  description: 'Write a Python function that calculates accuracy given true labels and predicted labels.',
                  language: 'python',
                  required: true,
                  points: 4
                },
                {
                  id: 'q11',
                  type: 'single-choice',
                  title: 'Which technique helps prevent overfitting?',
                  description: '',
                  options: ['Increasing model size', 'Dropout', 'Adding more layers', 'Using more data only'],
                  correctAnswer: 'Dropout',
                  required: true,
                  points: 3
                },
                {
                  id: 'q12',
                  type: 'long-text',
                  title: 'Explain MLOps and its importance in machine learning workflows',
                  description: '',
                  maxLength: 800,
                  required: true,
                  points: 6
                }
              ]
            }],
            settings: { timeLimit: 120, passingScore: 80, showResults: true, allowRetake: false, autoSave: true },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
        
        const savedJobs = getFromStorage('jobs')
        let finalJobs = staticJobs
        
        if (savedJobs && savedJobs !== 'undefined' && savedJobs !== 'null' && savedJobs !== '[object Object]' && typeof savedJobs === 'string') {
          try {
            const parsedJobs = JSON.parse(savedJobs)
            const staticJobIds = staticJobs.map(job => job.id)
            const additionalJobs = parsedJobs.filter(job => !staticJobIds.includes(job.id))
            finalJobs = [...staticJobs, ...additionalJobs]
            console.log('✅ Merged static jobs with saved jobs:', finalJobs.length)
          } catch (error) {
            console.error('Error parsing saved jobs:', error)
            finalJobs = staticJobs
          }
        }
        
        setJobs(finalJobs)
        setCandidates(staticCandidates)
        setAssessments(staticAssessments)
        
        localStorage.setItem('jobs', JSON.stringify(finalJobs))
        localStorage.setItem('candidates', JSON.stringify(staticCandidates))
        localStorage.setItem('assessments', JSON.stringify(staticAssessments))
        
        console.log('Data loaded successfully:', {
          jobs: finalJobs.length,
          candidates: staticCandidates.length,
          assessments: staticAssessments.length
        })
        
      } catch (error) {
        console.error('❌ Error initializing app:', error)
        setJobs([])
        setCandidates([])
        setAssessments([])
      }
    }

    initializeApp()
  }, [])


  const value = {
    isAuthenticated,
    recruiter,
    login,
    logout,
    register,
    loading,

    searchFilter,
    setSearchFilter,
    isSeached,
    setIsSearched,
    jobs,
    setJobs,
    candidates,
    setCandidates,
    assessments,
    setAssessments,

    fetchJobs,
    fetchCandidates,
    createCandidate,
    fetchCandidateById,
    updateCandidateStage,
    fetchAssessments,
    
    addCandidateNote,
    getCandidateNotes,
    getCandidateStageHistory,
    getApplicationCount,
    
    createJob,
    updateJob,
    archiveJob,
    unarchiveJob,
    reorderJobs,
    deleteJob,
    
    deleteAssessment,
    
    forceReseed: async () => {
      try {
        console.log('🔄 Starting database reseed...')
        
        removeFromStorage('jobs')
        removeFromStorage('candidates') 
        removeFromStorage('assessments')
        
        await db.jobs.clear()
        await db.candidates.clear()
        await db.assessments.clear()
        
        console.log('✅ Data cleared! Please refresh the page to generate fresh data.')
        window.location.reload()
      } catch (error) {
        console.error('❌ Error reseeding database:', error)
      }
    },

    saveAllData: async () => {
      try {
        console.log('💾 Starting manual save of all data...')
        
        if (jobs.length > 0) saveToStorage('jobs', jobs)
        if (candidates.length > 0) saveToStorage('candidates', candidates)
        if (assessments.length > 0) saveToStorage('assessments', assessments)
        
        setTimeout(async () => {
          try {
            if (jobs.length > 0) {
              await db.jobs.clear()
              await db.jobs.bulkPut(jobs)
              console.log(`✅ Saved ${jobs.length} jobs`)
            }
            
            if (candidates.length > 0) {
              await db.candidates.clear()
              await db.candidates.bulkPut(candidates)
              console.log(`✅ Saved ${candidates.length} candidates`)
            }
            
            if (assessments.length > 0) {
              await db.assessments.clear()
              await db.assessments.bulkPut(assessments)
              console.log(`✅ Saved ${assessments.length} assessments`)
            }
          } catch (error) {
            console.error('❌ Error during IndexedDB save:', error)
          }
        }, 0)
        
        console.log('💾 Manual save completed successfully!')
        return { success: true }
      } catch (error) {
        console.error('❌ Error during manual save:', error)
        return { success: false, error: error.message }
      }
    },

    debugData: async () => {
      try {
        console.log('🔍 === DATA DEBUG INFO ===')
        
        const dbJobs = await db.jobs.toArray()
        const dbCandidates = await db.candidates.toArray()
        const dbAssessments = await db.assessments.toArray()
        
        console.log('📊 IndexedDB Status:')
        console.log(`   - Jobs: ${dbJobs.length}`)
        console.log(`   - Candidates: ${dbCandidates.length}`)
        console.log(`   - Assessments: ${dbAssessments.length}`)
        
        const localJobs = getFromStorage('jobs')
        const localCandidates = getFromStorage('candidates')
        const localAssessments = getFromStorage('assessments')
        
        console.log('💾 localStorage Status:')
        console.log(`   - Jobs: ${localJobs.length}`)
        console.log(`   - Candidates: ${localCandidates.length}`)
        console.log(`   - Assessments: ${localAssessments.length}`)
        
        console.log('⚡ Current State:')
        console.log(`   - Jobs: ${jobs.length}`)
        console.log(`   - Candidates: ${candidates.length}`)
        console.log(`   - Assessments: ${assessments.length}`)
        
        if (jobs.length > 0) {
          const activeJobs = jobs.filter(j => j.status === 'active').length
          const archivedJobs = jobs.filter(j => j.status === 'archived').length
          console.log('📋 Job Statuses:')
          console.log(`   - Active: ${activeJobs}`)
          console.log(`   - Archived: ${archivedJobs}`)
        }
        
        console.log('🔍 === END DEBUG INFO ===')
      } catch (error) {
        console.error('❌ Error getting debug info:', error)
      }
    }
  }

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )
}

export default AppContexProvider
