import React from 'react'
import { FileText, Phone, Code, Briefcase, Star, ArrowLeft, Clock } from 'lucide-react'

const HIRING_STAGES = [
  { key: 'Applied', label: 'Applied', color: 'bg-blue-100 text-blue-800', bgColor: 'bg-blue-50' },
  { key: 'Online Assessment', label: 'Online Assessment', color: 'bg-yellow-100 text-yellow-800', bgColor: 'bg-yellow-50' },
  { key: 'Technical Interview', label: 'Technical Interview', color: 'bg-purple-100 text-purple-800', bgColor: 'bg-purple-50' },
  { key: 'Final Interview', label: 'Final Interview', color: 'bg-orange-100 text-orange-800', bgColor: 'bg-orange-50' },
  { key: 'Hired', label: 'Hired', color: 'bg-green-100 text-green-800', bgColor: 'bg-green-50' },
  { key: 'Rejected', label: 'Rejected', color: 'bg-red-100 text-red-800', bgColor: 'bg-red-50' }
]

const TimelineItem = ({ item, isLast }) => {
  const getStageIcon = (stage) => {
    switch (stage) {
      case 'Applied': return <FileText className="h-4 w-4" />
      case 'Online Assessment': return <Phone className="h-4 w-4" />
      case 'Technical Interview': return <Code className="h-4 w-4" />
      case 'Final Interview': return <Briefcase className="h-4 w-4" />
      case 'Hired': return <Star className="h-4 w-4" />
      case 'Rejected': return <ArrowLeft className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStageColors = (stage) => {
    const stageConfig = HIRING_STAGES.find(s => s.key === stage)
    return stageConfig ? { color: stageConfig.color, bgColor: stageConfig.bgColor } : { color: 'bg-gray-100 text-gray-800', bgColor: 'bg-gray-50' }
  }

  const colors = getStageColors(item.stage || item.type)

  return (
    <div className="flex">
      <div className="flex flex-col items-center mr-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${colors.color}`}>
          {getStageIcon(item.stage || item.type)}
        </div>
        {!isLast && <div className="w-px h-8 bg-gray-300 mt-2" />}
      </div>
      <div className="flex-1 pb-8">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold text-gray-900">
            {item.title || `Moved to ${item.stage}`}
          </h4>
          <span className="text-xs text-gray-500">
            {new Date(item.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        {item.description && (
          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
        )}
        {item.notes && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
            {item.notes}
          </div>
        )}
        {item.author && (
          <p className="text-xs text-gray-500 mt-2">by {item.author}</p>
        )}
      </div>
    </div>
  )
}

export default TimelineItem
export { HIRING_STAGES }