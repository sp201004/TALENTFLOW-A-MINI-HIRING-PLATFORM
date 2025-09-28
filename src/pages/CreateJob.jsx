import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Plus, X, Calendar, MapPin, DollarSign, Briefcase } from 'lucide-react'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const CreateJob = () => {
  const navigate = useNavigate()
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
    if (!formData.applyByDate) {
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      setFormData(prev => ({
        ...prev,
        applyByDate: thirtyDaysFromNow.toISOString().split('T')[0]
      }))
    }
  }, [])

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
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

  const handleRequirementKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addRequirement()
      setTimeout(() => {
        const inputs = document.querySelectorAll('input[placeholder*="years of"]')
        if (inputs[index + 1]) {
          inputs[index + 1].focus()
        }
      }, 100)
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

  const handleTagKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
      setTimeout(() => {
        const inputs = document.querySelectorAll('input[placeholder*="React, TypeScript"]')
        if (inputs[index + 1]) {
          inputs[index + 1].focus()
        }
      }, 100)
    }
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
        requirements: formData.requirements.filter(req => req.trim()).join('\n'),
        tags: formData.tags.filter(tag => tag.trim())
      }

      const result = await createJob(jobData)

      if (result.success) {
        toast.success('Job created successfully!')
        navigate('/jobs')
      } else {
        toast.error(result.message || 'Failed to create job')
      }
    } catch (error) {
      toast.error('Error creating job')
      console.error('Create job error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.tagName !== 'BUTTON') {
      if (e.target.tagName === 'TEXTAREA') {
        return
      }
      e.preventDefault()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {}
        <div className="mb-8">
          <button
            onClick={() => navigate('/jobs')}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:shadow-sm hover:-translate-y-0.5 mb-4 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
          <p className="mt-2 text-gray-600">
            Fill in the details below to create a new job posting
          </p>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-8">
          {}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug
                </label>
                <input
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <input
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
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  Location *
                </label>
                <input
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
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Employment Type *
                </label>
                <select
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
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Salary Range *
                </label>
                <input
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
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  Apply By Date *
                </label>
                <input
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
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
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    onKeyDown={(e) => handleRequirementKeyDown(e, index)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 3+ years of React experience"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="p-2 text-red-600 hover:text-red-800 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
              <button
                type="button"
                onClick={addTag}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </button>
            </div>

            <div className="space-y-4">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => handleTagChange(index, e.target.value)}
                    onKeyDown={(e) => handleTagKeyDown(e, index)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., React, TypeScript, Frontend"
                  />
                  {formData.tags.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="p-2 text-red-600 hover:text-red-800 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
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
              onClick={() => navigate('/jobs')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateJob
