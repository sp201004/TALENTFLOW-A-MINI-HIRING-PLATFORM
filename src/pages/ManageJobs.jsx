import React from 'react'
import { manageJobsData } from '../assets/assets'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useEffect } from 'react'
import Loading from '../components/Loading'
import { Plus, Edit, X } from 'lucide-react'
import { JobCategories, JobLocations } from '../assets/assets'

const AddJobModal = ({ isOpen, onClose, onJobAdded, backendUrl, companyToken }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('Banglore')
  const [category, setCategory] = useState('Programming')
  const [level, setLevel] = useState('Beginner Level')
  const [salary, setSalary] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setLocation('Banglore')
    setCategory('Programming')
    setLevel('Beginner Level')
    setSalary(0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data } = await axios.post(backendUrl + '/api/company/post-job',
        { title, description, location, category, level, salary },
        { headers: { token: companyToken } }
      )

      if (data.success) {
        toast.success(data.message)
        resetForm()
        onJobAdded()
        onClose()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Add New Job</h3>
              <p className="text-sm text-gray-600">Create a new job posting</p>
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
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
              <input 
                type="text" 
                placeholder="e.g. Senior Software Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
              <textarea
                rows={5}
                placeholder="Describe the job responsibilities and requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {JobCategories.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Location</label>
                <select 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {JobLocations.map((loc, index) => (
                    <option key={index} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Level</label>
                <select 
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Beginner Level">Beginner Level</option>
                  <option value="Intermidiate Level">Intermediate Level</option>
                  <option value="Senior Level">Senior Level</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Salary</label>
                <input 
                  type="number" 
                  min={0}
                  placeholder="25000"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add Job</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const EditJobModal = ({ isOpen, onClose, onJobUpdated, backendUrl, companyToken, job }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('Banglore')
  const [category, setCategory] = useState('Programming')
  const [level, setLevel] = useState('Beginner Level')
  const [salary, setSalary] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (job && isOpen) {
      setTitle(job.title || '')
      setDescription(job.description || '')
      setLocation(job.location || 'Banglore')
      setCategory(job.category || 'Programming')
      setLevel(job.level || 'Beginner Level')
      setSalary(job.salary || 0)
    }
  }, [job, isOpen])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setLocation('Banglore')
    setCategory('Programming')
    setLevel('Beginner Level')
    setSalary(0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data } = await axios.post(backendUrl + '/api/company/edit-job',
        { id: job._id, title, description, location, category, level, salary },
        { headers: { token: companyToken } }
      )

      if (data.success) {
        toast.success(data.message)
        onJobUpdated()
        onClose()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <Edit className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Edit Job</h3>
              <p className="text-sm text-gray-600">Update job posting details</p>
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
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
              <input 
                type="text" 
                placeholder="e.g. Senior Software Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
              <textarea
                rows={5}
                placeholder="Describe the job responsibilities and requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {JobCategories.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Location</label>
                <select 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {JobLocations.map((loc, index) => (
                    <option key={index} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Level</label>
                <select 
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Beginner Level">Beginner Level</option>
                  <option value="Intermidiate Level">Intermediate Level</option>
                  <option value="Senior Level">Senior Level</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Salary</label>
                <input 
                  type="number" 
                  min={0}
                  placeholder="25000"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  <span>Update Job</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ManageJobs = () => {

  const navigate = useNavigate()
  const [jobs, setJobs] = useState(false)
  const { backendUrl, companyToken } = useContext(AppContext)
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false)
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)

  const fetchCompanyJobs = async () => {

    try {

      const { data } = await axios.get(backendUrl + '/api/company/list-jobs', { headers: { token: companyToken } })

      if (data.success) {
        setJobs(data.jobsData.reverse())
        console.log(data.jobsData);

      }
      else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }

  }

  const changeJobVisiblity = async (id) => {

    try {

      const { data } = await axios.post(backendUrl + '/api/company/change-visiblity', { id },
        { headers: { token: companyToken } }
      )

      if (data.success) {
        toast.success(data.message)
        fetchCompanyJobs()
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }

  }

  const handleOpenAddModal = () => {
    setIsAddJobModalOpen(true)
  }

  const handleCloseAddModal = () => {
    setIsAddJobModalOpen(false)
  }

  const handleOpenEditModal = (job) => {
    setSelectedJob(job)
    setIsEditJobModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditJobModalOpen(false)
    setSelectedJob(null)
  }

  const handleJobAdded = () => {
    fetchCompanyJobs()
  }

  const handleJobUpdated = () => {
    fetchCompanyJobs()
  }


  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobs()
    }
  }, [companyToken])

  return (
    <>
      {jobs ? jobs.length === 0 ? (
        <div className='flex items-center justify-center h-[70vh]'>
          <p className='text-xl sm:text-2xl'>No Jobs Available Or Posted</p>
        </div>
      ) : (
        <div className='container p-4 max-w-5xl'>
          <div className='overflow-x-auto'>
            <table className='min-w-full bg-white border border-gray-200 max-sm:text-sms'>
              <thead>
                <tr>
                  <th className='py-2 px-4 border-b text-left max-sm:hidden'>#</th>
                  <th className='py-2 px-4 border-b text-left'>Job Title</th>
                  <th className='py-2 px-4 border-b text-left max-sm:hidden'>Date</th>
                  <th className='py-2 px-4 border-b text-left max-sm:hidden'>Location</th>
                  <th className='py-2 px-4 border-b text-center'>Applicants</th>
                  <th className='py-2 px-4 border-b text-left'>Visible</th>
                  <th className='py-2 px-4 border-b text-center'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, index) => (
                  <tr className='text-gray-700' key={index}>
                    <td className='py-2 px-4 border-b max-sm:hidden'>{index + 1}</td>
                    <td className='py-2 px-4 border-b'>{job.title}</td>
                    <td className='py-2 px-4 border-b max-sm:hidden'>{moment(job.date).format('ll')}</td>
                    <td className='py-2 px-4 border-b max-sm:hidden'>{job.location}</td>
                    <td className='py-2 px-4 border-b text-center'>{job.applicants}</td>
                    <td className='py-2 px-4 border-b'>
                      <input 
                        id={`job-visible-${job._id}`}
                        name={`job-visible-${job._id}`}
                        onChange={() => changeJobVisiblity(job._id)} 
                        className='scale-125 ml-4' 
                        type="checkbox" 
                        checked={job.visible} 
                      />
                      <label htmlFor={`job-visible-${job._id}`} className="sr-only">
                        {job.visible ? 'Hide job' : 'Show job'}
                      </label>
                    </td>
                    <td className='py-2 px-4 border-b text-center'>
                      <button
                        onClick={() => handleOpenEditModal(job)}
                        className='p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors'
                        title='Edit Job'
                      >
                        <Edit className='h-4 w-4' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='mt-4 flex justify-end'>
            <button 
              onClick={handleOpenAddModal} 
              className='py-2 px-4 bg-black text-white rounded hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2'
            >
              <Plus className='h-4 w-4' />
              <span>Add new job</span>
            </button>
          </div>
        </div>
      ) : <Loading />}

      {}
      <AddJobModal
        isOpen={isAddJobModalOpen}
        onClose={handleCloseAddModal}
        onJobAdded={handleJobAdded}
        backendUrl={backendUrl}
        companyToken={companyToken}
      />

      {}
      <EditJobModal
        isOpen={isEditJobModalOpen}
        onClose={handleCloseEditModal}
        onJobUpdated={handleJobUpdated}
        backendUrl={backendUrl}
        companyToken={companyToken}
        job={selectedJob}
      />
    </>
  )
}

export default ManageJobs
