import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { Briefcase, Users, FileText, Plus, TrendingUp, Activity, Clock, X, Calendar, MapPin, DollarSign } from 'lucide-react'
import { db } from '../database/db'
import { JobCategories, JobLocations } from '../assets/assets'
import { toast } from 'react-toastify'

const CreateJobModal = ({ isOpen, onClose, onJobCreated }) => {
  const { createJob, jobs } = useContext(AppContext)
  const [loading, setLoading] = useState(false)
  const [manualSlug, setManualSlug] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    role: '',
    location: '',
    employmentType: 'Full-time',
    salaryRange: '',
    applyByDate: '',
    requirements: [''],
    tags: ['']
  })

  useEffect(() => {
    if (formData.title && !manualSlug) {
      const generatedSlug = generateSlug(formData.title)
      setFormData(prev => ({
        ...prev,
        slug: generatedSlug
      }))
    }
  }, [formData.title, manualSlug])

  useEffect(() => {
    if (isOpen && !formData.applyByDate) {
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      setFormData(prev => ({
        ...prev,
        applyByDate: thirtyDaysFromNow.toISOString().split('T')[0]
      }))
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      window.scrollTo(0, 0)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      role: '',
      location: '',
      employmentType: 'Full-time',
      salaryRange: '',
      applyByDate: '',
      requirements: [''],
      tags: ['']
    })
    setManualSlug(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'slug') {
      setManualSlug(true)
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...formData.requirements]
    newRequirements[index] = value
    setFormData(prev => ({
      ...prev,
      requirements: newRequirements
    }))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
      e.preventDefault()
    }
  }

  const handleRequirementKeyDown = (index, e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addRequirement()
    }
  }

  const handleTagKeyDown = (index, e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }))
  }

  const removeRequirement = (index) => {
    if (formData.requirements.length > 1) {
      const newRequirements = formData.requirements.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        requirements: newRequirements
      }))
    }
  }

  const handleTagChange = (index, value) => {
    const newTags = [...formData.tags]
    newTags[index] = value
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }))
  }

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }))
  }

  const removeTag = (index) => {
    if (formData.tags.length > 1) {
      const newTags = formData.tags.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        tags: newTags
      }))
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Job title is required')
      return false
    }
    if (!formData.role.trim()) {
      toast.error('Role is required')
      return false
    }
    if (!formData.location.trim()) {
      toast.error('Location is required')
      return false
    }
    if (!formData.employmentType.trim()) {
      toast.error('Employment type is required')
      return false
    }
    if (!formData.salaryRange.trim()) {
      toast.error('Salary range is required')
      return false
    }
    if (!formData.applyByDate) {
      toast.error('Apply by date is required')
      return false
    }

    const finalSlug = formData.slug.trim() || generateSlug(formData.title)
    if (jobs.some(job => job.slug === finalSlug)) {
      toast.error('Slug must be unique')
      return false
    }

    const applyByDate = new Date(formData.applyByDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (applyByDate < today) {
      toast.error('Apply by date cannot be in the past')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const finalSlug = formData.slug.trim() || generateSlug(formData.title)
      
      const jobData = {
        title: formData.title.trim(),
        slug: finalSlug,
        description: formData.description.trim(),
        role: formData.role.trim(),
        location: formData.location.trim(),
        employmentType: formData.employmentType,
        salaryRange: formData.salaryRange.trim(),
        applyByDate: new Date(formData.applyByDate).toISOString(),
        requirements: formData.requirements.filter(req => req.trim()),
        tags: formData.tags.filter(tag => tag.trim())
      }

      const result = await createJob(jobData)
      
      if (result.success) {
        toast.success('Job created successfully!')
        resetForm()
        onJobCreated()
        onClose()
      } else {
        toast.error(result.message || 'Failed to create job')
      }
    } catch (error) {
      console.error('Create job error:', error)
      toast.error('An error occurred while creating the job')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Create New Job</h3>
              <p className="text-sm text-gray-600">Fill in the details below to create a new job posting</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {}
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="p-6 space-y-8">
          {}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="jobsBoardTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  id="jobsBoardTitle"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Senior Frontend Developer"
                  required
                />
              </div>

              <div>
                <label htmlFor="jobsBoardSlug" className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug
                </label>
                <input
                  id="jobsBoardSlug"
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="senior-frontend-developer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-generated from title if left empty
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="jobsBoardRole" className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <input
                  id="jobsBoardRole"
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Frontend Developer"
                  required
                />
              </div>

              <div>
                <label htmlFor="jobsBoardLocation" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  Location *
                </label>
                <input
                  id="jobsBoardLocation"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., San Francisco, CA or Remote"
                  required
                />
              </div>

              <div>
                <label htmlFor="jobsBoardEmploymentType" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Employment Type *
                </label>
                <select
                  id="jobsBoardEmploymentType"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label htmlFor="jobsBoardSalaryRange" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Salary Range *
                </label>
                <input
                  id="jobsBoardSalaryRange"
                  type="text"
                  name="salaryRange"
                  value={formData.salaryRange}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., $120,000 - $160,000"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="jobsBoardApplyByDate" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  Apply By Date *
                </label>
                <input
                  id="jobsBoardApplyByDate"
                  type="date"
                  name="applyByDate"
                  value={formData.applyByDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="jobsBoardDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                id="jobsBoardDescription"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
              />
            </div>
          </div>

          {}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Add Requirement *</h2>
              <button
                type="button"
                onClick={addRequirement}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Requirement
              </button>
            </div>

            <div className="space-y-4">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex items-center gap-3">
                  <label htmlFor={`requirement-${index}`} className="sr-only">
                    Requirement {index + 1}
                  </label>
                  <input
                    id={`requirement-${index}`}
                    type="text"
                    name={`requirement-${index}`}
                    value={requirement}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    onKeyDown={(e) => handleRequirementKeyDown(index, e)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 3+ years of React experience"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="p-2 text-red-600 hover:text-red-800 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      aria-label={`Remove requirement ${index + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
              <button
                type="button"
                onClick={addTag}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                aria-label="Add new tag"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </button>
            </div>

            <div className="space-y-4">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-3">
                  <label htmlFor={`tag-${index}`} className="sr-only">
                    Tag {index + 1}
                  </label>
                  <input
                    id={`tag-${index}`}
                    type="text"
                    name={`tag-${index}`}
                    value={tag}
                    onChange={(e) => handleTagChange(index, e.target.value)}
                    onKeyDown={(e) => handleTagKeyDown(index, e)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., React, TypeScript, Frontend"
                  />
                  {formData.tags.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="p-2 text-red-600 hover:text-red-800 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      aria-label={`Remove tag ${index + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create Job</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const { jobs, candidates, assessments } = useContext(AppContext)
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false)
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    newCandidates: 0,
    totalAssessments: 0
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const calculateStats = async () => {
      const activeJobs = jobs.filter(job => job.status === 'active').length
      const newCandidates = candidates.filter(candidate =>
        new Date(candidate.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length

      setStats({
        totalJobs: jobs.length,
        activeJobs,
        totalCandidates: candidates.length,
        newCandidates,
        totalAssessments: assessments.length
      })
    }

    calculateStats()
  }, [jobs, candidates, assessments])

  const handleOpenCreateJobModal = () => {
    setIsCreateJobModalOpen(true)
  }

  const handleCloseCreateJobModal = () => {
    setIsCreateJobModalOpen(false)
  }

  const handleJobCreated = () => {
  }

  const dashboardCards = [
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      icon: Briefcase,
      color: 'bg-blue-500',
      link: '/jobs',
      description: `${stats.activeJobs} active`
    },
    {
      title: 'Total Candidates',
      value: stats.totalCandidates,
      icon: Users,
      color: 'bg-green-500',
      link: '/candidates',
      description: `${stats.newCandidates} new this week`
    },
    {
      title: 'Assessments',
      value: stats.totalAssessments,
      icon: FileText,
      color: 'bg-purple-500',
      link: '/assessments',
      description: 'Active assessments'
    }
  ]

  const recentJobs = jobs.slice(0, 5)
  const recentCandidates = candidates.slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Here's an overview of your hiring activities.
          </p>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {dashboardCards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.title}
                to={card.link}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center">
                  <div className={`${card.color} rounded-lg p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-sm text-gray-500">{card.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
            </div>
            <div className="space-y-3">
              {recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="block p-3 rounded-md bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{job.title}</p>
                        <p className="text-sm text-gray-500">{job.tags.join(', ')}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No jobs created yet.</p>
              )}
            </div>
          </div>

          {}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Candidates</h2>
              <span className="text-sm font-medium text-gray-500">
                View all
              </span>
            </div>
            <div className="space-y-3">
              {recentCandidates.length > 0 ? (
                recentCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="block p-3 rounded-md bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                        <p className="text-sm text-gray-500">{candidate.email}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        candidate.stage === 'hired'
                          ? 'bg-green-100 text-green-800'
                          : candidate.stage === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {candidate.stage}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No candidates yet.</p>
              )}
            </div>
          </div>
        </div>

        {}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleOpenCreateJobModal}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <Briefcase className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Create New Job</p>
                <p className="text-sm text-gray-500">Post a new job opening</p>
              </div>
            </button>

            <Link
              to="/assessments"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <FileText className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage Assessments</p>
                <p className="text-sm text-gray-500">Create and manage tests</p>
              </div>
            </Link>

            <Link
              to="/candidates"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <Users className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">View Candidates</p>
                <p className="text-sm text-gray-500">Review all applications</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {}
      <CreateJobModal
        isOpen={isCreateJobModalOpen}
        onClose={handleCloseCreateJobModal}
        onJobCreated={handleJobCreated}
      />
    </div>
  )
}

export default Dashboard
