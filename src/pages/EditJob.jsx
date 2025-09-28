import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Plus, X, Calendar, MapPin, DollarSign, Briefcase } from 'lucide-react'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const EditJob = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { jobs, updateJob } = useContext(AppContext)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
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
    const loadJob = () => {
      setInitialLoading(true)
      try {
        const job = jobs.find(j => j.id === parseInt(id))
        if (job) {
          let requirementsArray = job.requirements || ['']
          if (typeof job.requirements === 'string') {
            requirementsArray = job.requirements.split('\n').filter(req => req.trim() !== '')
            if (requirementsArray.length === 0) requirementsArray = ['']
          }
          
          let tagsArray = job.tags || ['']
          if (typeof job.tags === 'string') {
            tagsArray = job.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
            if (tagsArray.length === 0) tagsArray = ['']
          }
          
          setFormData({
            title: job.title || '',
            slug: job.slug || '',
            description: job.description || '',
            role: job.role || '',
            location: job.location || '',
            employmentType: job.employmentType || 'Full-time',
            salaryRange: job.salaryRange || '',
            applyByDate: job.applyByDate ? new Date(job.applyByDate).toISOString().split('T')[0] : '',
            requirements: requirementsArray,
            tags: tagsArray
          })
        } else {
          toast.error('Job not found')
          navigate('/jobs')
        }
      } catch (error) {
        toast.error('Error loading job')
        navigate('/jobs')
      } finally {
        setInitialLoading(false)
      }
    }

    if (id && jobs.length > 0) {
      loadJob()
    }
  }, [id, jobs, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
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

  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.tagName !== 'BUTTON') {
      if (e.target.tagName === 'TEXTAREA') {
        return
      }
      e.preventDefault()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Job title is required')
      return
    }

    if (!formData.role.trim()) {
      toast.error('Role is required')
      return
    }

    if (!formData.location.trim()) {
      toast.error('Location is required')
      return
    }

    if (!formData.employmentType.trim()) {
      toast.error('Employment type is required')
      return
    }

    if (!formData.salaryRange.trim()) {
      toast.error('Salary range is required')
      return
    }

    if (!formData.applyByDate) {
      toast.error('Apply by date is required')
      return
    }

    if (formData.applyByDate) {
      const applyByDate = new Date(formData.applyByDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (applyByDate < today) {
        toast.error('Apply by date cannot be in the past')
        return
      }
    }

    setLoading(true)

    try {
      const updates = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        role: formData.role.trim(),
        location: formData.location.trim(),
        employmentType: formData.employmentType,
        salaryRange: formData.salaryRange.trim(),
        applyByDate: formData.applyByDate ? new Date(formData.applyByDate).toISOString() : null,
        requirements: formData.requirements.filter(req => req.trim()).join('\n'),
        tags: formData.tags.filter(tag => tag.trim())
      }

      const result = await updateJob(id, updates)

      if (result.success) {
        toast.success('Job updated successfully!')
        navigate(`/jobs/${id}`)
      } else {
        toast.error(result.message || 'Failed to update job')
      }
    } catch (error) {
      toast.error('Error updating job')
      console.error('Update job error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/jobs/${id}`)}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:shadow-sm hover:-translate-y-0.5 mb-4 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
          <p className="mt-2 text-gray-600">
            Update the job details below
          </p>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-8">
          {}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="editJobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  id="editJobTitle"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="editJobSlug" className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug
                </label>
                <input
                  id="editJobSlug"
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="editJobRole" className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <input
                  id="editJobRole"
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
                <label htmlFor="editJobLocation" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  Location *
                </label>
                <input
                  id="editJobLocation"
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
                <label htmlFor="editJobEmploymentType" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Employment Type *
                </label>
                <select
                  id="editJobEmploymentType"
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
                <label htmlFor="editJobSalaryRange" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Salary Range *
                </label>
                <input
                  id="editJobSalaryRange"
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
                <label htmlFor="editJobApplyByDate" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  Apply By Date *
                </label>
                <input
                  id="editJobApplyByDate"
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
              <label htmlFor="editJobDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="editJobDescription"
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
                  <label htmlFor={`editJobRequirement-${index}`} className="sr-only">
                    Requirement {index + 1}
                  </label>
                  <input
                    id={`editJobRequirement-${index}`}
                    type="text"
                    name={`requirement-${index}`}
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
                  <label htmlFor={`editJobTag-${index}`} className="sr-only">
                    Tag {index + 1}
                  </label>
                  <input
                    id={`editJobTag-${index}`}
                    type="text"
                    name={`tag-${index}`}
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
              onClick={() => navigate(`/jobs/${id}`)}
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
              {loading ? 'Updating...' : 'Update Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditJob
