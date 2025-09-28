import React, { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { Plus, Search, Filter, Eye, Edit, Calendar, Trash2 } from 'lucide-react'

const AssessmentsBoard = () => {
  const { assessments, jobs, deleteAssessment } = useContext(AppContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredAssessments, setFilteredAssessments] = useState([])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let filtered = assessments

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(assessment =>
        assessment.title.toLowerCase().includes(searchLower)
      )
    }

    setFilteredAssessments(filtered)
  }, [assessments, searchTerm])

  const getJobTitle = (jobId) => {
    const job = jobs.find(j => j.id === jobId)
    return job?.title || 'Unknown Job'
  }

  const handleDeleteAssessment = async (assessmentId, assessmentTitle) => {
    if (window.confirm(`Are you sure you want to delete "${assessmentTitle}"? This action cannot be undone.`)) {
      try {
        const result = await deleteAssessment(assessmentId)
        if (result.success) {
          console.log('Assessment deleted successfully')
        } else {
          console.error('Failed to delete assessment:', result.message)
          alert('Failed to delete assessment: ' + (result.message || 'Unknown error'))
        }
      } catch (error) {
        console.error('Error deleting assessment:', error)
        alert('Error deleting assessment')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
            <p className="mt-2 text-gray-600">
              Create and manage technical assessments for your job positions
            </p>
          </div>
          <Link
            to="/assessment-builder/new"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Assessment
          </Link>
        </div>

        {}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <label htmlFor="assessmentSearch" className="sr-only">
                  Search assessments
                </label>
                <input
                  id="assessmentSearch"
                  type="text"
                  name="search"
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {assessment.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {assessment.description}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span className="font-medium">{getJobTitle(assessment.jobId)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="text-gray-500">
                      <span className="font-medium">
                        {assessment.sections 
                          ? assessment.sections.reduce((total, section) => total + section.questions.length, 0)
                          : assessment.questions?.length || 0
                        }
                      </span> questions
                    </div>
                    <div className="text-gray-500">
                      <span className="font-medium">{assessment.settings?.timeLimit || 60}</span> min
                    </div>
                    <div className="text-gray-500">
                      <span className="font-medium">
                        {assessment.sections?.length || 1}
                      </span> section{(assessment.sections?.length || 1) !== 1 ? 's' : ''}
                    </div>
                    <div className="text-gray-500">
                      <span className="font-medium">{assessment.settings?.passingScore || 70}%</span> pass
                    </div>
                  </div>

                  {}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {assessment.settings?.allowRetake && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Retake allowed
                      </span>
                    )}
                    {assessment.settings?.showResults && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Show results
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/edit-assessment/${assessment.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-shadow"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteAssessment(assessment.id, assessment.title)
                    }}
                    className="inline-flex items-center p-2 border border-red-300 rounded-md shadow-sm text-red-700 bg-red-50 hover:bg-red-100 hover:shadow-md transition-shadow"
                    title="Delete Assessment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <Link
                    to={`/take-assessment/${assessment.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 hover:shadow-md transition-shadow"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Link>
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(assessment.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAssessments.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <Plus className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'Get started by creating assessments for your job positions'
              }
            </p>
            <Link
              to="/assessment-builder/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Assessment
            </Link>
          </div>
        )}

        {}
        {assessments.length === 0 && (
          <div className="mt-12 bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">Getting Started with Assessments</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-semibold text-lg">1</span>
                </div>
                <h3 className="font-medium text-blue-900 mb-2">Create a Job</h3>
                <p className="text-sm text-blue-700">
                  First, create a job posting to associate the assessment with
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-semibold text-lg">2</span>
                </div>
                <h3 className="font-medium text-blue-900 mb-2">Build Assessment</h3>
                <p className="text-sm text-blue-700">
                  Add questions, set time limits, and configure settings
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-semibold text-lg">3</span>
                </div>
                <h3 className="font-medium text-blue-900 mb-2">Share & Track</h3>
                <p className="text-sm text-blue-700">
                  Share with candidates and track their progress
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AssessmentsBoard
