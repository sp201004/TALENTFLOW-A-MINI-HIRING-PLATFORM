import React, { useContext, useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { Plus, Search, Filter, Edit, Archive, Eye, MoreHorizontal, GripVertical, ChevronLeft, ChevronRight, MapPin, Calendar, Briefcase, Clock, X, DollarSign, FileText, CheckCircle, Tag, Users, Building, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { JobCategories, JobLocations } from '../assets/assets'
import EditJobModal from '../components/EditJobModal'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import {
  CSS,
} from '@dnd-kit/utilities'

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

const SortableJobItem = ({ job, candidates, onArchive, onUnarchive, onEdit, onViewDetail, onDelete, navigate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: job.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const applicationsCount = React.useMemo(() => {
    if (!job || !candidates) {
      return 0
    }
    return candidates.filter(candidate => candidate.jobId === job.id).length
  }, [job, candidates])

  const formatSalary = (salaryRange) => {
    if (!salaryRange) return 'Salary not specified'
    if (typeof salaryRange === 'string') {
      return salaryRange.trim()
    }
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

  const formatApplyByDate = (applyByDate) => {
    if (!applyByDate) return 'No deadline specified'
    const deadline = new Date(applyByDate)
    const now = new Date()
    const isExpired = deadline < now
    
    if (isExpired) {
      return 'Application Closed'
    }
    return `Apply by ${deadline.toLocaleDateString()}`
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:shadow-gray-300/50 hover:-translate-y-1 transition-all duration-300 select-none"
    >
      {}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing select-none"
            aria-label="Drag to reorder"
            data-dnd-drag-handle
            onMouseDown={(e) => e.preventDefault()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <h3 className="text-xl font-bold text-gray-900">
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onViewDetail(job)
              }}
              className="hover:text-blue-600 hover:underline transition-all duration-200 text-left"
            >
              {job.title || 'Untitled Job'}
            </button>
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            job.status === 'active'
              ? 'bg-green-100 text-green-800'
              : job.status === 'archived'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {job.status}
          </span>
        </div>
      </div>

      {}
      <div className="mb-3">
        <div className="flex items-center text-gray-600 text-sm">
          <Briefcase className="h-3 w-3 mr-2" />
          <span className="font-medium">{job.role || 'Role not specified'}</span>
        </div>
      </div>

      {}
      <div className="mb-3">
        <div className="text-gray-600 font-medium text-sm">
          {formatSalary(job.salaryRange)}
        </div>
      </div>

      {}
      <div className="flex items-center text-gray-600 mb-2 text-sm">
        <MapPin className="h-3 w-3 mr-2" />
        <span>{job.location || 'Location not specified'}</span>
      </div>

      {}
      <div className="flex items-center text-gray-600 mb-2 text-sm">
        <Calendar className="h-3 w-3 mr-2" />
        <span className={`${
          formatApplyByDate(job.applyByDate).includes('Closed') 
            ? 'text-red-600 font-medium' 
            : 'text-gray-600'
        }`}>
          {formatApplyByDate(job.applyByDate)}
        </span>
      </div>

      {}
      <div className="flex items-center text-gray-600 mb-3 text-sm">
        <Clock className="h-3 w-3 mr-2" />
        <span>{job.employmentType || 'Full-time'}</span>
      </div>

      {}
      <div className="flex items-center text-blue-600 mb-3 text-sm font-medium">
        <Users className="h-3 w-3 mr-2" />
        <span>{applicationsCount} applications</span>
      </div>

      {}
      <div className="flex flex-wrap gap-1 mb-3">
        {job.tags && job.tags.slice(0, 4).map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {tag}
          </span>
        ))}
        {job.tags && job.tags.length > 4 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            +{job.tags.length - 4} more
          </span>
        )}
      </div>

      {}
      <p className="text-gray-600 text-xs line-clamp-2 mb-4">
        {job.description || 'No description provided'}
      </p>

      {}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(job)
            }}
            className="edit-button inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md hover:border-gray-400 transition-all duration-200"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (window.confirm(`Are you sure you want to delete "${job.title}"? This action cannot be undone.`)) {
                onDelete(job.id)
              }
            }}
            className="inline-flex items-center p-2 border border-red-300 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 hover:shadow-md hover:border-red-400 transition-all duration-200"
            title="Delete Job"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
        
        {job.status === 'active' ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onArchive(job.id)
            }}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md hover:border-gray-400 transition-all duration-200"
          >
            <Archive className="h-3 w-3 mr-1" />
            Archive
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onUnarchive(job.id)
            }}
            className="inline-flex items-center px-3 py-1.5 border border-green-300 rounded-lg text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 hover:shadow-md hover:border-green-400 transition-all duration-200"
          >
            <Archive className="h-3 w-3 mr-1" />
            Active
          </button>
        )}
      </div>
    </div>
  )
}

const JobDetailModal = ({ isOpen, onClose, job, onEdit, onArchive, onUnarchive }) => {
  const { candidates } = useContext(AppContext)
  const navigate = useNavigate()

  const applicationsCount = React.useMemo(() => {
    if (!job || !candidates) {
      return 0
    }
    return candidates.filter(candidate => candidate.jobId === job.id).length
  }, [job, candidates])

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !job) return null

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch (error) {
      return dateString
    }
  }

  const getRequirementsArray = (requirements) => {
    if (Array.isArray(requirements)) {
      return requirements.filter(req => req && req.trim() !== '')
    }
    if (typeof requirements === 'string') {
      return requirements.split('\n').filter(req => req && req.trim() !== '')
    }
    return []
  }

  const getTagsArray = (tags) => {
    if (Array.isArray(tags)) {
      return tags.filter(tag => tag && tag.trim() !== '')
    }
    if (typeof tags === 'string') {
      return tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    }
    return []
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {}
        <div className="flex justify-between items-start p-6 pb-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 mb-2">{job.title || 'Senior Frontend Developer'}</h1>
            <div className="flex items-center gap-3 mb-0">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {job.status || 'active'}
              </span>
              <span className="flex items-center text-gray-600 text-xs">
                <Users className="h-3 w-3 mr-1" />
                {applicationsCount} candidates
              </span>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <button 
              onClick={() => {
                onEdit(job)
                onClose()
              }}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-700"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </button>
            {job.status === 'active' ? (
              <button 
                onClick={() => {
                  onArchive(job.id)
                  onClose()
                }}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-700"
              >
                <Archive className="h-3 w-3 mr-1" />
                Archive
              </button>
            ) : (
              <button 
                onClick={() => {
                  onUnarchive(job.id)
                  onClose()
                }}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 hover:text-green-700"
              >
                <Archive className="h-3 w-3 mr-1" />
                Active
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-3 gap-4">
            {}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-medium text-gray-900">Role</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {job.role || 'Senior Frontend Developer'}
              </div>
            </div>

            {}
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-gray-900">Salary</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {job.salaryRange || '$180,000 - $250,000'}
              </div>
            </div>

            {}
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-3 w-3 text-purple-600" />
                <span className="text-xs font-medium text-gray-900">Location</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {job.location || 'Mountain View, CA'}
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="flex overflow-hidden max-h-[calc(90vh-280px)]">
          {}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">Job Description</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-xs">
                {job.description || "Join Google's Chrome team to build the next generation of web experiences. You'll work on cutting-edge technologies, collaborate with world-class engineers, and impact billions of users worldwide. We're looking for someone passionate about web performance, accessibility, and user experience."}
              </p>
            </div>

            {}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <h3 className="text-sm font-semibold text-gray-900">Requirements</h3>
              </div>
              <ul className="space-y-2">
                {getRequirementsArray(job.requirements).length > 0 ? (
                  getRequirementsArray(job.requirements).map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-xs">{req}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-xs">React 5+ years</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-xs">TypeScript</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-xs">Next.js</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-xs">Web Performance</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-xs">Accessibility</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-xs">Testing (Jest, Cypress)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-xs">GraphQL</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-xs">Webpack</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {}
          <div className="w-64 border-l border-gray-200 overflow-y-auto bg-gray-50">
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Job Information</h3>
                
                <div className="space-y-4">
                  {}
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                      <Clock className="h-3 w-3" />
                      Employment Type
                    </div>
                    <div className="text-xs font-medium text-gray-900">
                      {job.employmentType || 'Full-time'}
                    </div>
                  </div>

                  {}
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                      <Calendar className="h-3 w-3" />
                      Apply By
                    </div>
                    <div className="text-xs font-medium text-gray-900">
                      {job.applyByDate ? formatDate(job.applyByDate) : 'October 25, 2025'}
                    </div>
                  </div>

                  {}
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <Tag className="h-3 w-3" />
                      Skills
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {getTagsArray(job.tags).length > 0 ? (
                        getTagsArray(job.tags).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            React
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            TypeScript
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            Frontend
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Candidates</h4>
                  <button 
                    onClick={() => navigate(`/candidates?jobId=${job.id}`)}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    View All
                  </button>
                </div>
                <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {applicationsCount}
                  </div>
                  <div className="text-xs text-gray-600">Applications Received</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const JobsBoard = () => {
  const { jobs, candidates, fetchJobs, archiveJob, unarchiveJob, reorderJobs, deleteJob } = useContext(AppContext)
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(999)
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false)
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
     window.scrollTo(0, 0)
  }, [currentPage])

  const { filteredJobs, totalPages, totalJobs } = useMemo(() => {
    let filtered = [...jobs]

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter)
    }

    filtered.sort((a, b) => a.order - b.order)

    const total = filtered.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const paginatedJobs = filtered.slice(startIndex, startIndex + pageSize)

    return {
      filteredJobs: paginatedJobs,
      totalPages,
      totalJobs: total
    }
  }, [jobs, searchTerm, statusFilter, currentPage, pageSize])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const handleArchiveJob = async (jobId) => {
    try {
      const result = await archiveJob(jobId)
      if (result.success) {
        toast.success('Job archived! Applications are now closed.')
      } else {
        toast.error(result.message || 'Failed to archive job')
      }
    } catch (error) {
      toast.error('Error archiving job')
    }
  }

  const handleUnarchiveJob = async (jobId) => {
    try {
      const result = await unarchiveJob(jobId)
      if (result.success) {
        toast.success('Job reactivated! Apply by date set to 10 days from today.')
      } else {
        toast.error(result.message || 'Failed to unarchive job')
      }
    } catch (error) {
      toast.error('Error unarchiving job')
    }
  }

  const handleDeleteJob = async (jobId) => {
    try {
      const result = await deleteJob(jobId)
      if (result.success) {
        toast.success('Job deleted successfully')
      } else {
        toast.error(result.message || 'Failed to delete job')
      }
    } catch (error) {
      toast.error('Error deleting job')
    }
  }

  const handleOpenCreateJobModal = () => {
    setIsCreateJobModalOpen(true)
  }

  const handleCloseCreateJobModal = () => {
    setIsCreateJobModalOpen(false)
  }

  const handleOpenEditJobModal = (job) => {
    setSelectedJob(job)
    setIsEditJobModalOpen(true)
  }

  const handleCloseEditJobModal = () => {
    setIsEditJobModalOpen(false)
    setSelectedJob(null)
  }

  const handleJobCreated = () => {
  }

  const handleJobUpdated = () => {
  }

  const handleOpenJobDetailModal = (job) => {
    navigate(`/jobs/${job.id}`)
  }



  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = filteredJobs.findIndex(job => job.id === active.id)
      const newIndex = filteredJobs.findIndex(job => job.id === over.id)

      const reorderedJobs = arrayMove(filteredJobs, oldIndex, newIndex)

      try {
        const result = await reorderJobs(reorderedJobs)
        if (result.success) {
          toast.success('Jobs reordered successfully')
        } else {
          await fetchJobs()
          toast.error(result.message || 'Failed to reorder jobs')
        }
      } catch (error) {
        await fetchJobs()
        toast.error('Error reordering jobs')
      }
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
            <p className="mt-2 text-gray-600">
              Manage your job postings and track applications
            </p>
          </div>
          <button
            onClick={handleOpenCreateJobModal}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Job
          </button>
        </div>

        {}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-lg">
              <label htmlFor="jobSearch" className="sr-only">Search jobs</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="jobSearch"
                  type="text"
                  name="jobSearch"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <div>
                <label htmlFor="statusFilter" className="sr-only">Filter by status</label>
                <select
                  id="statusFilter"
                  name="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label htmlFor="pageSize" className="sr-only">Items per page</label>
                <select
                  id="pageSize"
                  name="pageSize"
                  value={pageSize}
                  onChange={(e) => setPageSize(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={9}>9 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={999}>Show All</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredJobs.length} of {totalJobs} jobs
            {searchTerm && ` for "${searchTerm}"`}
            {statusFilter !== 'all' && ` with status "${statusFilter}"`}
          </p>
        </div>

        {}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredJobs.map(job => job.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <SortableJobItem
                  key={job.id}
                  job={job}
                  candidates={candidates}
                  onArchive={handleArchiveJob}
                  onUnarchive={handleUnarchiveJob}
                  onEdit={handleOpenEditJobModal}
                  onViewDetail={handleOpenJobDetailModal}
                  onDelete={handleDeleteJob}
                  navigate={navigate}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-200 ${
                    page === currentPage
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <Plus className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first job posting'
              }
            </p>
            <button
              onClick={handleOpenCreateJobModal}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Job
            </button>
          </div>
        )}
      </div>

      {}
      <CreateJobModal
        isOpen={isCreateJobModalOpen}
        onClose={handleCloseCreateJobModal}
        onJobCreated={handleJobCreated}
      />

      {}
      <EditJobModal
        isOpen={isEditJobModalOpen}
        onClose={handleCloseEditJobModal}
        job={selectedJob}
        onJobUpdated={handleJobUpdated}
      />


    </div>
  )
}

export default JobsBoard