import { http, HttpResponse } from 'msw'
import { db } from '../database/db'

let jobsStore = []
let candidatesStore = []
let assessmentsStore = []

const simulateRequest = async (data, shouldError = false) => {
  const delay = Math.random() * 1000 + 200
  await new Promise(resolve => setTimeout(resolve, delay))

  if (shouldError && Math.random() < 0.08) {
    throw new Error('Server error')
  }

  return data
}

const syncWithDB = async (storeType) => {
  try {
    switch (storeType) {
      case 'jobs':
        jobsStore = await db.jobs.toArray()
        break
      case 'candidates':
        candidatesStore = await db.candidates.toArray()
        break
      case 'assessments':
        assessmentsStore = await db.assessments.toArray()
        break
      default:
        await Promise.all([
          syncWithDB('jobs'),
          syncWithDB('candidates'),
          syncWithDB('assessments')
        ])
    }
  } catch (error) {
    console.error('Error syncing with DB:', error)
  }
}

await syncWithDB()

export const handlers = [
  http.get('/api/jobs', async ({ request }) => {
    try {
      const url = new URL(request.url)
      const search = url.searchParams.get('search')
      const status = url.searchParams.get('status')
      const page = parseInt(url.searchParams.get('page')) || 1
      const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
      const sort = url.searchParams.get('sort') || 'order'

      await syncWithDB('jobs')
      let filteredJobs = [...jobsStore]

      if (search) {
        filteredJobs = filteredJobs.filter(job =>
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          (job.tags && job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
        )
      }

      if (status) {
        filteredJobs = filteredJobs.filter(job => job.status === status)
      }

      filteredJobs.sort((a, b) => {
        if (sort === 'title') return a.title.localeCompare(b.title)
        if (sort === 'created') return new Date(b.createdAt) - new Date(a.createdAt)
        return a.order - b.order
      })

      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedJobs = filteredJobs.slice(startIndex, endIndex)

      await simulateRequest()

      return HttpResponse.json({
        success: true,
        jobs: paginatedJobs,
        total: filteredJobs.length,
        page: page,
        pageSize: pageSize
      })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch jobs' },
        { status: 500 }
      )
    }
  }),

  http.post('/api/jobs', async ({ request }) => {
    try {
      const { title, slug, tags, description, requirements } = await request.json()

      if (!title || !slug) {
        return HttpResponse.json(
          { success: false, message: 'Title and slug are required' },
          { status: 400 }
        )
      }

      await syncWithDB('jobs')
      
      if (jobsStore.some(job => job.slug === slug)) {
        return HttpResponse.json(
          { success: false, message: 'Slug must be unique' },
          { status: 400 }
        )
      }

      const newJob = {
        id: Date.now(),
        title,
        slug,
        description: description || '',
        requirements: requirements || [],
        tags: tags || [],
        status: 'active',
        order: jobsStore.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await db.jobs.add(newJob)
      jobsStore.push(newJob)
      await simulateRequest(newJob, true)

      return HttpResponse.json({ success: true, job: newJob })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to create job' },
        { status: 500 }
      )
    }
  }),

  http.get('/api/jobs/:id', async ({ params }) => {
    try {
      const { id } = params
      
      await syncWithDB('jobs')
      const job = jobsStore.find(job => job.id === parseInt(id))
      
      if (!job) {
        return HttpResponse.json(
          { success: false, message: 'Job not found' },
          { status: 404 }
        )
      }

      await simulateRequest()

      return HttpResponse.json({ success: true, job })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch job' },
        { status: 500 }
      )
    }
  }),

  http.patch('/api/jobs/:id', async ({ request, params }) => {
    try {
      const { id } = params
      const updates = await request.json()

      await syncWithDB('jobs')
      const jobIndex = jobsStore.findIndex(job => job.id === parseInt(id))
      if (jobIndex === -1) {
        return HttpResponse.json(
          { success: false, message: 'Job not found' },
          { status: 404 }
        )
      }

      if (updates.slug && updates.slug !== jobsStore[jobIndex].slug) {
        if (jobsStore.some(job => job.slug === updates.slug)) {
          return HttpResponse.json(
            { success: false, message: 'Slug must be unique' },
            { status: 400 }
          )
        }
      }

      const updatedJob = { ...jobsStore[jobIndex], ...updates, updatedAt: new Date().toISOString() }

      await db.jobs.update(parseInt(id), updatedJob)
      jobsStore[jobIndex] = updatedJob

      await simulateRequest(updatedJob, true)

      return HttpResponse.json({ success: true, job: updatedJob })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to update job' },
        { status: 500 }
      )
    }
  }),

  http.patch('/api/jobs/:id/reorder', async ({ request, params }) => {
    try {
      const { id } = params
      const { fromOrder, toOrder } = await request.json()

      await syncWithDB('jobs')
      const jobIndex = jobsStore.findIndex(job => job.id === parseInt(id))
      if (jobIndex === -1) {
        return HttpResponse.json(
          { success: false, message: 'Job not found' },
          { status: 404 }
        )
      }

      const job = jobsStore.splice(jobIndex, 1)[0]
      const newIndex = toOrder > fromOrder ? toOrder : toOrder
      jobsStore.splice(newIndex, 0, job)

      jobsStore.forEach((job, index) => {
        job.order = index
      })

      await Promise.all(jobsStore.map((job, index) =>
        db.jobs.update(job.id, { ...job, order: index })
      ))

      await simulateRequest({}, Math.random() < 0.05)

      return HttpResponse.json({ success: true, jobs: jobsStore })
    } catch (error) {
      await syncWithDB('jobs')
      return HttpResponse.json(
        { success: false, message: 'Failed to reorder jobs' },
        { status: 500 }
      )
    }
  }),

  http.get('/api/candidates', async ({ request }) => {
    try {
      const url = new URL(request.url)
      const search = url.searchParams.get('search')
      const stage = url.searchParams.get('stage')
      const page = parseInt(url.searchParams.get('page')) || 1
      const pageSize = parseInt(url.searchParams.get('pageSize')) || 20

      await syncWithDB('candidates')
      let filteredCandidates = [...candidatesStore]

      if (search) {
        const searchTerm = search.toLowerCase()
        filteredCandidates = filteredCandidates.filter(candidate =>
          candidate.name.toLowerCase().includes(searchTerm) ||
          candidate.email.toLowerCase().includes(searchTerm)
        )
      }

      if (stage) {
        filteredCandidates = filteredCandidates.filter(candidate => candidate.stage === stage)
      }

      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex)

      await simulateRequest()

      return HttpResponse.json({
        success: true,
        candidates: paginatedCandidates,
        total: filteredCandidates.length,
        page: page,
        pageSize: pageSize
      })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch candidates' },
        { status: 500 }
      )
    }
  }),

  http.post('/api/candidates', async ({ request }) => {
    try {
      const { name, email, jobId } = await request.json()

      const newCandidate = {
        id: Date.now(),
        name,
        email,
        jobId,
        stage: 'applied',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await db.candidates.add(newCandidate)
      candidatesStore.push(newCandidate)

      await simulateRequest(newCandidate, true)

      return HttpResponse.json({ success: true, candidate: newCandidate })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to create candidate' },
        { status: 500 }
      )
    }
  }),

  http.patch('/api/candidates/:id', async ({ request, params }) => {
    try {
      const { id } = params
      const updates = await request.json()

      await syncWithDB('candidates')
      const candidateIndex = candidatesStore.findIndex(candidate => candidate.id === parseInt(id))
      if (candidateIndex === -1) {
        return HttpResponse.json(
          { success: false, message: 'Candidate not found' },
          { status: 404 }
        )
      }

      const updatedCandidate = {
        ...candidatesStore[candidateIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      await db.candidates.update(parseInt(id), updatedCandidate)
      candidatesStore[candidateIndex] = updatedCandidate

      await simulateRequest(updatedCandidate, false)

      return HttpResponse.json({ success: true, candidate: updatedCandidate })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to update candidate' },
        { status: 500 }
      )
    }
  }),

  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    try {
      const { id } = params
      await syncWithDB('candidates')
      const candidate = candidatesStore.find(c => c.id === parseInt(id))

      if (!candidate) {
        return HttpResponse.json(
          { success: false, message: 'Candidate not found' },
          { status: 404 }
        )
      }

      const timeline = [
        {
          id: 1,
          type: 'stage_change',
          fromStage: null,
          toStage: 'applied',
          timestamp: candidate.createdAt,
          note: 'Application submitted'
        },
        {
          id: 2,
          type: 'stage_change',
          fromStage: 'applied',
          toStage: candidate.stage,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          note: `Moved to ${candidate.stage} stage`
        }
      ]

      await simulateRequest()

      return HttpResponse.json({ success: true, timeline })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch timeline' },
        { status: 500 }
      )
    }
  }),

  http.get('/api/assessments/:jobId', async ({ params }) => {
    try {
      const { jobId } = params
      await syncWithDB('assessments')
      const assessment = assessmentsStore.find(a => a.jobId === parseInt(jobId))

      await simulateRequest()

      return HttpResponse.json({ success: true, assessment: assessment || null })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch assessment' },
        { status: 500 }
      )
    }
  }),

  http.put('/api/assessments/:jobId', async ({ request, params }) => {
    try {
      const { jobId } = params
      const assessmentData = await request.json()

      await syncWithDB('assessments')
      const existingIndex = assessmentsStore.findIndex(a => a.jobId === parseInt(jobId))

      const assessment = {
        id: existingIndex >= 0 ? assessmentsStore[existingIndex].id : Date.now(),
        jobId: parseInt(jobId),
        ...assessmentData,
        updatedAt: new Date().toISOString()
      }

      if (existingIndex >= 0) {
        await db.assessments.update(assessment.id, assessment)
        assessmentsStore[existingIndex] = assessment
      } else {
        await db.assessments.add(assessment)
        assessmentsStore.push(assessment)
      }

      await simulateRequest(assessment, true) 

      return HttpResponse.json({ success: true, assessment })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to save assessment' },
        { status: 500 }
      )
    }
  }),

  http.post('/api/assessments/:jobId/submit', async ({ request, params }) => {
    try {
      const { jobId } = params
      const responses = await request.json()

      const responseId = Date.now()
      await db.assessmentResponses.add({
        id: responseId,
        candidateId: responses.candidateId || 'unknown',
        jobId: parseInt(jobId),
        responses,
        submittedAt: new Date().toISOString()
      })

      await simulateRequest({}, true)

      return HttpResponse.json({ success: true, message: 'Assessment submitted successfully' })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to submit assessment' },
        { status: 500 }
      )
    }
  }),

  http.get('/api/candidates/:candidateId/notes', async ({ params }) => {
    try {
      const candidateId = parseInt(params.candidateId)
      
      await syncWithDB()
      const notes = await db.notes.where('candidateId').equals(candidateId).reverse().toArray()
      
      await simulateRequest()

      return HttpResponse.json({
        success: true,
        notes: notes
      })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to fetch notes' },
        { status: 500 }
      )
    }
  }),

  http.post('/api/candidates/:candidateId/notes', async ({ request, params }) => {
    try {
      const candidateId = parseInt(params.candidateId)
      const noteData = await request.json()
      
      const newNote = {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        candidateId: candidateId,
        content: noteData.content,
        author: noteData.author,
        createdAt: new Date().toISOString()
      }

      await db.notes.put(newNote)
      await simulateRequest(newNote)

      return HttpResponse.json({
        success: true,
        note: newNote
      })
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: 'Failed to add note' },
        { status: 500 }
      )
    }
  })
]
