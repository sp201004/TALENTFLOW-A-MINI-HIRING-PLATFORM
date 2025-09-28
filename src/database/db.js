import Dexie from 'dexie'

export const db = new Dexie('TalentFlowDB')

db.version(1).stores({
  jobs: 'id, title, slug, status, order, createdAt, updatedAt',
  candidates: 'id, name, email, jobId, stage, createdAt, updatedAt',
  assessments: 'id, jobId, title, description, questions, settings, createdAt, updatedAt',
  assessmentResponses: 'id, candidateId, jobId, responses, submittedAt'
})

db.version(2).stores({
  jobs: 'id, title, slug, status, order, createdAt, updatedAt',
  candidates: 'id, name, email, jobId, stage, createdAt, updatedAt',
  assessments: 'id, jobId, title, description, questions, settings, createdAt, updatedAt',
  assessmentResponses: 'id, candidateId, jobId, assessmentId, responses, submittedAt',
  notes: 'id, candidateId, content, author, createdAt'
}).upgrade(tx => {
  return tx.assessmentResponses.toCollection().modify(response => {
    if (!response.assessmentId && response.id) {
      const parts = response.id.toString().split('_')
      if (parts.length === 2) {
        response.assessmentId = parseInt(parts[1])
      }
    }
  })
})

db.version(3).stores({
  jobs: 'id, title, slug, status, order, createdAt, updatedAt',
  candidates: 'id, name, email, jobId, stage, createdAt, updatedAt',
  assessments: 'id, jobId, title, description, questions, settings, createdAt, updatedAt',
  assessmentResponses: 'id, candidateId, jobId, assessmentId, [candidateId+assessmentId], responses, submittedAt',
  notes: 'id, candidateId, content, author, createdAt'
})

db.version(4).stores({
  jobs: 'id, title, slug, status, order, createdAt, updatedAt',
  candidates: 'id, name, email, jobId, stage, createdAt, updatedAt',
  assessments: 'id, jobId, title, description, questions, settings, createdAt, updatedAt',
  assessmentResponses: 'id, candidateId, jobId, assessmentId, [candidateId+assessmentId], responses, submittedAt',
  notes: 'id, candidateId, content, author, createdAt',
  candidateStageHistory: 'id, candidateId, fromStage, toStage, author, timestamp, description'
})

db.open().then(() => {
  console.log('✅ Database opened successfully with compound index for assessmentResponses')
}).catch(function (err) {
  console.error('Database failed to open:', err)
  if (err.name === 'UpgradeError' || err.name === 'BlockedError') {
    console.log('Database schema upgrade required. Attempting to delete and recreate database...')
    db.delete().then(() => {
      console.log('Database deleted successfully. Reloading page to initialize fresh database...')
      window.location.reload()
    }).catch(deleteErr => {
      console.error('Failed to delete database:', deleteErr)
    })
  } else if (err.name === 'InvalidStateError') {
    console.log('Database is in invalid state. Attempting to reopen...')
    setTimeout(() => {
      db.open().catch(() => window.location.reload())
    }, 1000)
  }
})

export default db
