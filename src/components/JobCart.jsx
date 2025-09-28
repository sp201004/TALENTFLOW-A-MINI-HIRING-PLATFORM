import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Clock, Briefcase, DollarSign } from 'lucide-react'

const JobCart = ({ job }) => {
  const navigate = useNavigate()

  const formatSalary = (salaryRange) => {
    if (!salaryRange) return 'Salary not specified'
    return salaryRange
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    })
  }

  const isExpired = (applyByDate) => {
    if (!applyByDate) return false
    return new Date(applyByDate) < new Date()
  }

  const handleViewDetails = () => {
    navigate(`/jobs/${job.id}`)
    window.scrollTo(0, 0)
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    navigate(`/jobs/edit/${job.id}`)
  }

  const handleArchive = (e) => {
    e.stopPropagation()
  }

  return (
    <div 
      className='border border-gray-200 p-6 shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer bg-white'
      onClick={handleViewDetails}
    >
      {}
      <div className='flex justify-between items-start mb-4'>
        <div className='flex-1'>
          <h4 className='font-semibold text-xl text-gray-900 mb-2 leading-tight'>
            {job.title}
          </h4>
          <div className='flex items-center gap-2 text-gray-600 mb-2'>
            <Briefcase className='w-4 h-4' />
            <span className='text-sm'>{job.role || job.title}</span>
          </div>
        </div>
        
        {}
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          job.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {job.status === 'active' ? 'active' : 'archived'}
        </div>
      </div>

      {}
      <div className='mb-3'>
        <div className='flex items-center gap-2 text-gray-900'>
          <DollarSign className='w-4 h-4' />
          <span className='font-medium text-lg'>{formatSalary(job.salaryRange)}</span>
        </div>
      </div>

      {}
      <div className='flex items-center gap-2 text-gray-600 mb-3'>
        <MapPin className='w-4 h-4' />
        <span className='text-sm'>{job.location}</span>
      </div>

      {}
      {job.applyByDate && (
        <div className='flex items-center gap-2 text-gray-600 mb-3'>
          <Calendar className='w-4 h-4' />
          <span className={`text-sm ${isExpired(job.applyByDate) ? 'text-red-600' : ''}`}>
            Apply by {formatDate(job.applyByDate)}
            {isExpired(job.applyByDate) && ' (Expired)'}
          </span>
        </div>
      )}

      {}
      {job.employmentType && (
        <div className='flex items-center gap-2 text-gray-600 mb-4'>
          <Clock className='w-4 h-4' />
          <span className='text-sm'>{job.employmentType}</span>
        </div>
      )}

      {}
      {job.tags && job.tags.length > 0 && (
        <div className='flex flex-wrap gap-2 mb-4'>
          {job.tags.slice(0, 4).map((tag, index) => (
            <span 
              key={index} 
              className='bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-medium'
            >
              {tag}
            </span>
          ))}
          {job.tags.length > 4 && (
            <span className='text-gray-500 text-xs px-2 py-1'>
              +{job.tags.length - 4} more
            </span>
          )}
        </div>
      )}

      {}
      {job.description && (
        <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
          {job.description.length > 100 
            ? `${job.description.substring(0, 100)}...` 
            : job.description
          }
        </p>
      )}

      {}
      <div className='flex gap-3 pt-4 border-t border-gray-100'>
        <button 
          onClick={handleEdit}
          className='flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
          </svg>
          Edit
        </button>
        
        <button 
          onClick={handleArchive}
          className='flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 8l4 4 4-4' />
          </svg>
          Archive
        </button>
      </div>
    </div>
  )
}

export default JobCart
