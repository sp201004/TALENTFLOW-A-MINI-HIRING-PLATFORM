import React, { useContext } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { AppContext } from './context/AppContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Navbar from './components/Navbar'
import RecruiterLogin from './components/RecruiterLogin'
import ScrollToTop from './components/ScrollToTop'

import Dashboard from './pages/Dashboard'
import JobsBoard from './pages/JobsBoard'
import CandidatesBoard from './pages/CandidatesBoard'
import AssessmentsBoard from './pages/AssessmentsBoard'

import JobDetail from './pages/JobDetail'
import CreateJob from './pages/CreateJob'
import EditJob from './pages/EditJob'

import CandidateDetail from './pages/CandidateDetail'

import AssessmentBuilder from './pages/AssessmentBuilder'
import TakeAssessment from './pages/TakeAssessment'

const App = () => {
  const { isAuthenticated } = useContext(AppContext)

  console.log('App rendered, isAuthenticated:', isAuthenticated)

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      {!isAuthenticated ? (
        <RecruiterLogin />
      ) : (
        <div>
          <ScrollToTop />
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/jobs" element={<JobsBoard />} />
              <Route path="/jobs/create" element={<CreateJob />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/jobs/:id/edit" element={<EditJob />} />
              <Route path="/candidates" element={<CandidatesBoard />} />
              <Route path="/candidates/:id" element={<CandidateDetail />} />
              <Route path="/assessments" element={<AssessmentsBoard />} />
              <Route path="/assessment-builder/:jobId" element={<AssessmentBuilder />} />
              <Route path="/edit-assessment/:assessmentId" element={<AssessmentBuilder />} />
              <Route path="/take-assessment/:assessmentId" element={<TakeAssessment />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      )}
    </div>
  )
}

export default App
