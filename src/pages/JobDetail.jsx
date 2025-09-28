import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { ArrowLeft, Edit, Archive, Users, Calendar, Tag, FileText, MapPin, Briefcase, DollarSign, Clock, Building, CheckCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import useApplicationCount from '../hooks/useApplicationCount'

const JobDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { jobs, candidates, archiveJob, unarchiveJob } = useContext(AppContext)
  const [loading, setLoading] = useState(true)
  
  const { count: applicationCount, loading: countLoading } = useApplicationCount(id, {
    enablePolling: true,
    pollingInterval: 10000 
  })

  useEffect(() => {
    setLoading(false)
    window.scrollTo(0, 0)
  }, [id, jobs])

  const job = jobs.find(j => j.id === parseInt(id))
  const jobCandidates = candidates ? candidates.filter(candidate => candidate.jobId === parseInt(id)) : []

  const formatSalary = (salaryRange) => {
    if (!salaryRange) return 'Salary not specified'
    if (typeof salaryRange === 'string') return salaryRange
    const { min, max, currency = '$' } = salaryRange
    if (min && max) {
      return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`
    } else if (min) {
      return `${currency}${min.toLocaleString()}+`
    } else if (max) {
      return `Up to ${currency}${max.toLocaleString()}`
    }
    return 'Salary not specified'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const isExpired = (applyByDate) => {
    if (!applyByDate) return false
    return new Date(applyByDate) < new Date()
  }

  const handleArchiveToggle = async () => {
    try {
      if (job.status === 'active') {
        const result = await archiveJob(job.id)
        if (result.success) {
          toast.success('Job archived! Applications are now closed.')
        } else {
          toast.error(result.message || 'Failed to archive job')
        }
      } else {
        const result = await unarchiveJob(job.id)
        if (result.success) {
          toast.success('Job reactivated! Apply by date set to 10 days from today.')
        } else {
          toast.error(result.message || 'Failed to reactivate job')
        }
      }
    } catch (error) {
      toast.error('Failed to update job status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist.</p>
          <Link
            to="/jobs"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
          >
            Back to Jobs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {}
        {/* <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:bg-gray-50 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 hover:text-gray-800" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Job Details</h1>
        </div> */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:bg-gray-50 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 hover:text-gray-800" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex-1">Job Details</h1>
          <div className="flex flex-wrap gap-3 ml-auto">
            <Link
              to={`/jobs/${job.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 hover:shadow-lg hover:border-gray-400 hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
              style={{ height: '36px' }}
            >
              <Edit className="w-4 h-4" />
              Edit Job
            </Link>
            
            <button
              onClick={handleArchiveToggle}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 hover:shadow-lg hover:border-gray-400 hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
              style={{ height: '36px' }}
            >
              <Archive className="w-4 h-4" />
              {job.status === 'active' ? 'Archive Job' : 'Active Job'}
            </button>

            <Link
              to={`/candidates?jobId=${job.id}`}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 hover:shadow-lg hover:border-gray-400 hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
              style={{ height: '36px' }}
            >
              <Users className="w-4 h-4" />
              View Applications ({countLoading ? '...' : applicationCount})
            </Link>
          </div>
        </div>

        {}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h2>
                <div className="flex items-center gap-4 text-gray-600">
                  {job.role && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{job.role}</span>
                    </div>
                  )}
                  {job.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {}
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                job.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {job.status === 'active' ? 'Active' : 'Archived'}
                </div>
              </div>
            </div>
            
            {}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
              {job.salaryRange && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatSalary(job.salaryRange)}</span>
                </div>
              )}
              {job.employmentType && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{job.employmentType}</span>
                </div>
              )}
              {job.applyByDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className={isExpired(job.applyByDate) ? 'text-red-200' : ''}>
                    Apply by {formatDate(job.applyByDate)}
                    {isExpired(job.applyByDate) && ' (Expired)'}
                  </span>
                </div>
              )}
              
              {}
              {job.status === 'archived' && job.applicationsClosedDate && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span className="text-red-600">
                    Applications Closed on {formatDate(job.applicationsClosedDate)}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>
                  {countLoading ? '...' : applicationCount} Applicant{applicationCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {}
          <div className="p-6">
            {}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Job Description
              </h3>
              <div className="prose max-w-none text-gray-600 leading-relaxed">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3">{paragraph}</p>
                ))}
              </div>
            </div>

            {}
            {job.requirements && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                  Requirements
                </h3>
                <div className="prose max-w-none text-gray-600 leading-relaxed">
                  {typeof job.requirements === 'string' ? (
                    job.requirements.split('\n').map((requirement, index) => (
                      <p key={index} className="mb-2 flex items-start gap-2">
                        <span className="text-gray-400 mt-2">•</span>
                        <span>{requirement}</span>
                      </p>
                    ))
                  ) : Array.isArray(job.requirements) ? (
                    job.requirements.map((requirement, index) => (
                      <p key={index} className="mb-2 flex items-start gap-2">
                        <span className="text-gray-400 mt-2">•</span>
                        <span>{requirement}</span>
                      </p>
                    ))
                  ) : (
                    <p className="mb-2 flex items-start gap-2">
                      <span className="text-gray-400 mt-2">•</span>
                      <span>{job.requirements}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {}
            {job.tags && job.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-gray-600" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {}
            {job.assessmentRequired && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Assessment Required
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    This position requires candidates to complete an assessment as part of the application process.
                  </p>
                  {job.assessmentInstructions && (
                    <p className="text-blue-700 mt-2">{job.assessmentInstructions}</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDetail
