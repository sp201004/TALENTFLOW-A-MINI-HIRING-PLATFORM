import React, { useEffect, useState } from 'react'
import { useRef } from 'react'
import Quill from 'quill'
import { JobCategories, JobLocations } from '../assets/assets'
import axios from 'axios'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'



const AddJob = () => {


  const { backendUrl, companyToken } = useContext(AppContext)
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('Banglore')
  const [category, setCategory] = useState('Programming')
  const [level, setLevel] = useState('Beginner')
  const [salary, setSalary] = useState(0)

  const quillRef = useRef(null)
  const editorRef = useRef(null)

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    try {

      const description = quillRef.current.root.innerHTML

      const { data } = await axios.post(backendUrl + '/api/company/post-job',
        { title, description, location, category, level, salary },
        { headers: { token: companyToken } }
      )

      if (data.success) {
        toast.success(data.message)
        setTitle('')
        setSalary(0)
        quillRef.current.root.innerHTML = ""
      }
      else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }

  }


  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow'
      })
    }
  }, [])


  return (
    <form name="addJobForm" onSubmit={onSubmitHandler} className='container p-4 flex flex-col w-full items-start gap-3'>

      <div className='w-full'>
        <label htmlFor="jobTitle" className='mb-2 block'>Job Title</label>
        <input 
          id="jobTitle"
          name="jobTitle"
          type="text" 
          placeholder='Type here' 
          onChange={e => setTitle(e.target.value)} 
          value={title} 
          required 
          className='w-full max-w-lg px-3 py-2 border-2 border-gray-300 rounded' 
        />
      </div>

      <div className='w-full max-w-lg'>
        <label className='my-2 block'>Job Description</label>
        <div ref={editorRef}>

        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div>
          <label htmlFor="jobCategory" className='mb-2 block'>Job Category</label>
          <select 
            id="jobCategory"
            name="jobCategory"
            className='w-full  px-3 py-2 border-2 border-gray-300 rounded' 
            onChange={e => setCategory(e.target.value)}
          >
            {
              JobCategories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))
            }
          </select>
        </div>
        <div>
          <label htmlFor="jobLocation" className='mb-2 block'>Job Location</label>
          <select 
            id="jobLocation"
            name="jobLocation"
            className='w-full  px-3 py-2 border-2 border-gray-300 rounded' 
            onChange={e => setLocation(e.target.value)}
          >
            {
              JobLocations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))
            }
          </select>
        </div>
        <div>
          <label htmlFor="jobLevel" className='mb-2 block'>Job Level</label>
          <select 
            id="jobLevel"
            name="jobLevel"
            className='w-full  px-3 py-2 border-2 border-gray-300 rounded' 
            onChange={e => setLevel(e.target.value)}
          >
            <option value="Beginner Level">Beginner Level</option>
            <option value="Intermidiate Level">Intermidiate Level</option>
            <option value="Senior Level">senior Level</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="jobSalary" className='mb-2 block'>Job Salary</label>
        <input 
          id="jobSalary"
          name="jobSalary"
          min={0} 
          className='w-full px-3 py-2 border-2 border-gray-300 rounded sm:w-[120px]' 
          onChange={e => setSalary(e.target.value)} 
          type="Number" 
          placeholder='25000' 
        />
      </div>

      <button className='w-28 py-3 mt-4 bg-black text-white rounded hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200'>ADD</button>

    </form>
  )
}

export default AddJob
