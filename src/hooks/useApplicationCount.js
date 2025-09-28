import { useState, useEffect, useContext } from 'react'
import { AppContext } from '../context/AppContext'

/**
 * Custom hook to get live application count for a specific job
 * @param {number|string} jobId - The job ID to get application count for
 * @param {object} options - Configuration options
 * @param {boolean} options.enablePolling - Enable periodic updates (default: false)
 * @param {number} options.pollingInterval - Polling interval in milliseconds (default: 30000)
 * @returns {object} - Object containing count and loading state
 */
export const useApplicationCount = (jobId, options = {}) => {
  const { 
    enablePolling = false, 
    pollingInterval = 30000 
  } = options

  const { candidates, getApplicationCount } = useContext(AppContext)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!jobId) {
      setCount(0)
      setLoading(false)
      return
    }

    const updateCount = () => {
      const newCount = getApplicationCount(jobId)
      setCount(newCount)
      setLoading(false)
    }

    updateCount()
  }, [jobId, candidates, getApplicationCount])

  useEffect(() => {
    if (!enablePolling || !jobId) return

    const interval = setInterval(() => {
      const newCount = getApplicationCount(jobId)
      setCount(newCount)
    }, pollingInterval)

    return () => clearInterval(interval)
  }, [jobId, enablePolling, pollingInterval, getApplicationCount])

  return {
    count,
    loading
  }
}

export default useApplicationCount