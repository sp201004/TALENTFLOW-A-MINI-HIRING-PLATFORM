import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { Plus, X, DollarSign, Calendar } from 'lucide-react'
import { toast } from 'react-toastify'

const EditJobModal = ({ isOpen, onClose, job, onJobUpdated }) => {
  const { updateJob, jobs } = useContext(AppContext)
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
    if (job && isOpen) {
      const formatDateForInput = (dateValue) => {
        if (!dateValue) return '';
        try {
          const date = new Date(dateValue);
          return date.toISOString().split('T')[0];
        } catch {
          return '';
        }
      };
      setFormData({
        title: job.title || '',
        slug: job.slug || '',
        description: job.description || '',
        role: job.role || '',
        location: job.location || '',
        employmentType: job.employmentType || 'Full-time',
        salaryRange: job.salaryRange || '',
        applyByDate: formatDateForInput(job.applyByDate),
        requirements: Array.isArray(job.requirements) && job.requirements.length > 0 ? job.requirements : [''],
        tags:  job.tags.length > 0 ? job.tags : ['']
      })
      setManualSlug(false)
    }
  }, [job, isOpen])

  useEffect(() => {
    if (isOpen) {
       
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    if (formData.title && !manualSlug) {
      const generatedSlug = generateSlug(formData.title)
      setFormData(prev => ({
        ...prev,
        slug: generatedSlug
      }))
    }
  }, [formData.title, manualSlug])

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const validateSlug = (slug) => {
    const existingJob = jobs.find(j => j.slug === slug && j.id !== job.id)
    return !existingJob
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'slug') {
      setManualSlug(true)
    }
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
      requirements: Array.isArray(prev.requirements) ? [...prev.requirements, ''] : ['', '']
    }))
  }

  const removeRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: Array.isArray(prev.requirements) ? prev.requirements.filter((_, i) => i !== index) : ['']
    }))
  }

  const handleRequirementChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      requirements: Array.isArray(prev.requirements) ? prev.requirements.map((req, i) => i === index ? value : req) : [value]
    }))
  }

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: Array.isArray(prev.tags) ? [...prev.tags, ''] : ['', '']
    }))
  }

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: Array.isArray(prev.tags) ? prev.tags.filter((_, i) => i !== index) : ['']
    }))
  }

  const handleTagChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      tags: Array.isArray(prev.tags) ? prev.tags.map((tag, i) => i === index ? value : tag) : [value]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Please enter a job title')
      return
    }

    const finalSlug = formData.slug || generateSlug(formData.title)
    
    if (!validateSlug(finalSlug)) {
      toast.error('This URL slug already exists. Please choose a different one.')
      return
    }

    setLoading(true)

    try {
      const updatedJobData = {
        ...formData,
        slug: finalSlug,
        requirements: Array.isArray(formData.requirements) ? formData.requirements.filter(req => req.trim()) : [],
        tags: Array.isArray(formData.tags) ? formData.tags.filter(tag => tag.trim()) : []
      }

      const result = await updateJob(job.id, updatedJobData)
      
      if (result.success) {
        toast.success('Job updated successfully!')
        onJobUpdated()
        onClose()
      } else {
        toast.error(result.message || 'Failed to update job')
      }
    } catch (error) {
      toast.error('Failed to update job')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen || !job) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Edit Job</h3>
            <p className="text-sm text-gray-600">Update job posting details</p>
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
                  placeholder="e.g., Senior Frontend Developer"
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
                  placeholder="senior-frontend-developer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-generated from title if left empty
                </p>
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
                <label htmlFor="editJobLocation" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  id="editJobLocation"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., San Francisco, CA"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="editEmploymentType" className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type *
                </label>
                <select
                  id="editEmploymentType"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label htmlFor="editSalaryRange" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Salary Range *
                </label>
                <input
                  id="editSalaryRange"
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
                <label htmlFor="editApplyByDate" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  Apply By Date *
                </label>
                <input
                  id="editApplyByDate"
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
              <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                id="editDescription"
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
                  <label htmlFor={`editRequirement-${index}`} className="sr-only">
                    Requirement {index + 1}
                  </label>
                  <input
                    id={`editRequirement-${index}`}
                    name={`editRequirement-${index}`}
                    type="text"
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
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </button>
            </div>

            <div className="space-y-4">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-3">
                  <label htmlFor={`editTag-${index}`} className="sr-only">
                    Tag {index + 1}
                  </label>
                  <input
                    id={`editTag-${index}`}
                    name={`editTag-${index}`}
                    type="text"
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
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditJobModal