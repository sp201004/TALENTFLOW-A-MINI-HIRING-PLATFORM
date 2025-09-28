import React, {
  useContext,
  useState,
  useEffect,
  useMemo,
  memo,
  useCallback,
} from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

import {
  Search,
  Calendar,
  Users,
  Grid,
  List,
  ChevronDown,
  Plus,
  MessageSquare,
  X,
  Phone,
  Code,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Mail,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { QuickNotesPopup, HIRING_STAGES } from "../components/candidates";

const sortTimelineEvents = (timeline) => {
  return timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

const canTransitionToStage = (currentStage, newStage) => {
  if (currentStage === newStage) return false
  
  const stageOrder = {
    'Applied': 0,
    'Online Assessment': 1,
    'Technical Interview': 2, 
    'Final Interview': 3,
    'Hired': 4,
    'Rejected': 5
  }
  
  const currentIndex = stageOrder[currentStage]
  const newIndex = stageOrder[newStage]
  
  if (currentIndex === undefined || newIndex === undefined) return false
  
  if (newIndex > currentIndex) return true
  
  if (newStage === 'Rejected' && currentStage !== 'Hired') return true
  
  if (currentStage === 'Rejected' && newIndex < stageOrder['Rejected']) return true
  
  if ((currentStage === 'Hired' && newStage === 'Rejected') || 
      (currentStage === 'Rejected' && newStage === 'Hired')) return true
  
  return false
}

const DraggedCandidate = memo(({ candidate }) => {
  if (!candidate) return null;

  const initials = candidate.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-white rounded-lg p-4 border border-blue-300 shadow-xl w-72 opacity-90">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {initials}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {candidate.name}
          </h4>
          <p className="text-xs text-gray-500 truncate">{candidate.email}</p>
        </div>
      </div>
    </div>
  );
});

const CandidateModal = ({
  candidate,
  isOpen,
  onClose,
  notesRefreshTrigger,
}) => {
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);
  const {recruiter, addCandidateNote, getCandidateNotes, getCandidateStageHistory, updateCandidateStage} = useContext(AppContext);

  const teamMembers = [
    { id: 1, name: "John Smith", role: "HR Manager" },
    { id: 2, name: "Sarah Wilson", role: "Tech Lead" },
    { id: 3, name: "Mike Johnson", role: "Recruiter" },
    { id: 4, name: "Lisa Brown", role: "VP Engineering" },
  ];

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (candidate && isOpen && notesRefreshTrigger > 0) {
      loadCandidateNotes(candidate.id);
    }
  }, [notesRefreshTrigger]);

  useEffect(() => {
    if (isOpen) {
      window.scrollTo(0, 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const loadTimelineData = async () => {
      if (candidate && isOpen) {
        try {
          const stageHistory = await getCandidateStageHistory(candidate.id)
          
          const processedTimeline = stageHistory.map(entry => ({
            id: `history-${entry.id}`,
            type: entry.toStage,
            stage: entry.toStage,
            title: entry.description || `Stage changed: ${entry.fromStage || 'Start'} → ${entry.toStage}`,
            description: entry.description || `Stage changed: ${entry.fromStage || 'Start'} → ${entry.toStage}`,
            timestamp: entry.timestamp,
            author: entry.author,
            fromStage: entry.fromStage,
            toStage: entry.toStage
          }))
          
          setTimeline(processedTimeline)
        } catch (error) {
          console.error('Error loading stage history:', error)
          const fallbackTimeline = [{
            id: `${candidate.id}-applied`,
            type: "Applied",
            stage: "Applied",
            title: "Application Submitted",
            description: "Candidate applied for the position",
            timestamp: candidate.createdAt,
            author: "System",
          }]
          setTimeline(fallbackTimeline)
        }

        loadCandidateNotes(candidate.id);
      }
    }
    
    loadTimelineData()
  }, [candidate, isOpen, recruiter, candidate?.stage, getCandidateStageHistory]);


  const loadCandidateNotes = async (candidateId) => {
    try {
      const candidateNotes = await getCandidateNotes(candidateId);
      console.log(
        `Loaded ${candidateNotes.length} notes for candidate ${candidateId}:`,
        candidateNotes
      );
      setNotes(candidateNotes);
    } catch (error) {
      console.error("Error loading candidate notes:", error);
      setNotes([
        {
          id: `${candidateId}-note-1-${Date.now()}`,
          content:
            "Great technical skills demonstrated during the online assessment.",
          author: "Mike Johnson",
          createdAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          candidateId: candidateId,
        },
      ]);
    }
  };

  if (!isOpen || !candidate) return null;

  const getStageIcon = (stage) => {
    switch (stage) {
      case "Applied":
        return <FileText className="h-4 w-4" />;
      case "Online Assessment":
        return <Phone className="h-4 w-4" />;
      case "Technical Interview":
        return <Code className="h-4 w-4" />;
      case "Final Interview":
        return <Users className="h-4 w-4" />;
      case "Hired":
        return <CheckCircle className="h-4 w-4" />;
      case "Rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleNoteChange = (e) => {
    const value = e.target.value;
    setNewNote(value);

    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const searchTerm = value.substring(lastAtIndex + 1).toLowerCase();
      const suggestions = teamMembers.filter((member) =>
        member.name.toLowerCase().includes(searchTerm)
      );
      setMentionSuggestions(suggestions);
      setShowMentions(suggestions.length > 0);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (member) => {
    const lastAtIndex = newNote.lastIndexOf("@");
    const beforeMention = newNote.substring(0, lastAtIndex);
    const afterMention = newNote.substring(newNote.length);
    setNewNote(`${beforeMention}@${member.name} `);
    setShowMentions(false);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsAddingNote(true);
    try {
      const savedNote = await addCandidateNote({
        candidateId: candidate.id,
        content: newNote,
        author: recruiter?.name || "HR Team"
      });

      setNotes((prev) => [savedNote, ...prev]);
      setNewNote("");
      toast.success("Note added successfully");
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleStageChangeInternal = async (newStage) => {
    if (updatingStage) return;
    
    if (!canTransitionToStage(candidate.stage, newStage)) {
      toast.error(`Cannot transition from ${candidate.stage} to ${newStage}`);
      return;
    }

    setUpdatingStage(true);
    try {
      const success = await updateCandidateStage(candidate.id, newStage);
      if (success) {
        const updatedCandidate = { ...candidate, stage: newStage };
        setCandidate(updatedCandidate);
        
        try {
          const stageHistory = await getCandidateStageHistory(candidate.id)
          const historyTimeline = stageHistory
            .filter(entry => entry.actionType === 'stage_change')
            .map(entry => ({
              id: `history-${entry.id}`,
              type: entry.toStage,
              stage: entry.toStage,
              title: `Stage changed: ${entry.fromStage} → ${entry.toStage}`,
              description: entry.description,
              timestamp: entry.timestamp,
              author: entry.author,
              fromStage: entry.fromStage,
              toStage: entry.toStage
            }))
          
          const baseTimeline = [{
            id: `${candidate.id}-applied`,
            type: "Applied",
            stage: "Applied",
            title: "Application Submitted",
            description: "Candidate applied for the position",
            timestamp: candidate.createdAt,
            author: "System"
          }]
          
          const combinedTimeline = [...baseTimeline, ...historyTimeline]
          const sortedTimeline = sortTimelineEvents(combinedTimeline)
          setTimeline(sortedTimeline)
        } catch (timelineError) {
          console.error('Error refreshing timeline:', timelineError)
        }
        
        toast.success(`Candidate moved to ${newStage}`);
      } else {
        toast.error("Failed to update candidate stage");
      }
    } catch (error) {
      console.error("Error updating candidate stage:", error);
      toast.error("Error updating candidate stage");
    } finally {
      setUpdatingStage(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-8 flex flex-col max-h-[calc(100vh-4rem)]">
        {}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
              {getInitials(candidate.name)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {candidate.name}
              </h2>
              <p className="text-gray-600 flex items-center mt-1">
                <Mail className="h-4 w-4 mr-2" />
                {candidate.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-y-auto flex-1">
          {}
          <div className="lg:col-span-1 space-y-6">
            {}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Candidate Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Job Title
                  </label>
                  <p className="text-gray-900 font-medium">
                    {candidate.jobTitle || `Job #${candidate.jobId}`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Applied Date
                  </label>
                  <p className="text-gray-900">
                    {formatDate(candidate.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Updated
                  </label>
                  <p className="text-gray-900">
                    {formatDate(candidate.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Current Stage
              </h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-100">
                  {getStageIcon(candidate.stage)}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    HIRING_STAGES.find((s) => s.key === candidate.stage)
                      ?.color || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {candidate.stage}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Stage
                </label>
                <select
                  value={candidate.stage}
                  onChange={(e) => handleStageChangeInternal(e.target.value)}
                  disabled={updatingStage}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${updatingStage ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {HIRING_STAGES.map((stage) => {
                    const isValidTransition = canTransitionToStage(candidate.stage, stage.key);
                    return (
                      <option 
                        key={stage.key} 
                        value={stage.key}
                        disabled={!isValidTransition && candidate.stage !== stage.key}
                      >
                        {stage.label}{!isValidTransition && candidate.stage !== stage.key ? ' (Invalid)' : ''}
                      </option>
                    )
                  })}
                </select>
                {updatingStage && (
                  <p className="text-sm text-gray-500 mt-1">Updating stage...</p>
                )}
              </div>
            </div>
          </div>

          {}
          <div className="lg:col-span-2 space-y-6">
            {}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Timeline
              </h3>
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {timeline.map((item, index) => (
                  <div key={item.id} className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          HIRING_STAGES.find((s) => s.key === item.stage)
                            ?.color || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getStageIcon(item.stage || item.type)}
                      </div>
                      {index !== timeline.length - 1 && (
                        <div className="w-px h-8 bg-gray-300 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {item.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {item.description}
                      </p>
                      <span className="text-xs text-gray-500">
                        by {item.author}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Notes & Comments
              </h3>

              {}
              <div className="mb-6 relative">
                <label htmlFor="modalNoteTextarea" className="sr-only">
                  Add a note
                </label>
                <div className="relative">
                  <textarea
                    id="modalNoteTextarea"
                    name="modalNote"
                    value={newNote}
                    onChange={handleNoteChange}
                    placeholder="Add a note... (Use @ to mention team members)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                  />

                  {}
                  {showMentions && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      {mentionSuggestions.map((member) => (
                        <div
                          key={member.id}
                          onClick={() => insertMention(member)}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                        >
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-sm font-medium">
                              {member.name}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {member.role}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || isAddingNote}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingNote ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Add Note</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {}
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="border-l-4 border-blue-200 pl-4 py-2 bg-blue-50 rounded-r-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {note.author}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-500">
            Candidate ID: #{candidate.id}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SortableCard = memo(
  ({ candidate, index, onCandidateClick, onQuickNoteClick }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: candidate.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const getInitials = useCallback((name) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }, []);

    const formatDate = useCallback((dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }, []);

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`mb-2 mx-1 bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 select-none ${
          isDragging ? "rotate-2 shadow-lg opacity-50" : ""
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div
              {...attributes}
              {...listeners}
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold cursor-grab hover:cursor-grabbing"
            >
              {getInitials(candidate.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onCandidateClick(candidate);
                }}
                className="block cursor-pointer select-text"
              >
                <h4 className="text-sm font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
                  {candidate.name}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {candidate.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(candidate.createdAt)}
          </div>
          <div className="text-blue-600 font-medium">
            {candidate.jobTitle
              ? candidate.jobTitle.substring(0, 20) + "..."
              : `Job #${candidate.jobId}`}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-xs text-gray-600">Active</span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickNoteClick(candidate, e);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors group cursor-pointer z-10 relative"
            title="Add quick note"
          >
            <MessageSquare className="h-3 w-3 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    );
  }
);

const VirtualizedStageColumn = memo(
  ({ stage, candidates, onCandidateClick, onQuickNoteClick }) => {
    const { setNodeRef, isOver } = useDroppable({ id: stage.key });

    const ITEM_HEIGHT = 122;
    const BUFFER = 36;

    const containerRef = React.useRef(null);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });

    const onScroll = useCallback(() => {
      const scrollTop = containerRef.current?.scrollTop || 0;
      const viewportHeight = containerRef.current?.clientHeight || 0;

      const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
      const itemsPerView = Math.ceil(viewportHeight / ITEM_HEIGHT);
      const start = Math.max(0, startIndex - BUFFER);
      const end = Math.min(
        candidates.length,
        startIndex + itemsPerView + BUFFER
      );
      setVisibleRange({ start, end });
    }, [candidates.length]);

    const visibleCandidates = useMemo(() => {
      return candidates.slice(visibleRange.start, visibleRange.end);
    }, [candidates, visibleRange]);

    const MemoSortableCards = useMemo(
      () =>
        visibleCandidates.map((candidate, idx) => (
          <div key={candidate.id} style={{ height: ITEM_HEIGHT }}>
            <SortableCard
              candidate={candidate}
              index={visibleRange.start + idx}
              onCandidateClick={onCandidateClick}
              onQuickNoteClick={onQuickNoteClick}
            />
          </div>
        )),
      [
        visibleCandidates,
        visibleRange.start,
        onCandidateClick,
        onQuickNoteClick,
      ]
    );

    useEffect(() => {
      onScroll();
    }, [onScroll]);

    return (
      <div
        ref={setNodeRef}
        className={`${stage.bgColor} rounded-lg p-3 h-full kanban-column flex-shrink-0 flex flex-col ${isOver ? "ring-2 ring-blue-400" : ""}`}
        data-stage-id={stage.key}
      >
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-gray-900">{stage.label}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${stage.color}`}
            >
              {candidates.length}
            </span>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto space-y-0"
          ref={containerRef}
          onScroll={onScroll}
        >
          {candidates.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm font-medium">No results</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            </div>
          ) : (
            <SortableContext
              items={candidates.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                style={{
                  height: candidates.length * ITEM_HEIGHT,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: visibleRange.start * ITEM_HEIGHT,
                    left: 0,
                    right: 0,
                  }}
                >
                  
                  {MemoSortableCards}
                </div>
              </div>
            </SortableContext>
          )}
        </div>
      </div>
    );
  }
);

const CandidatesBoard = () => {
  const { candidates, updateCandidateStage, recruiter, addCandidateNote } =
    useContext(AppContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [notesRefreshTrigger, setNotesRefreshTrigger] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [quickNotesState, setQuickNotesState] = useState({
    isOpen: false,
    candidate: null,
    position: { x: 0, y: 0 },
  });

  const [stageFilter, setStageFilter] = useState("all");
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('candidatesViewMode') || "kanban";
  });
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCandidateClick = useCallback((candidate) => {
    navigate(`/candidates/${candidate.id}`);
  }, [navigate]);



  const handleQuickNoteClick = useCallback((candidate, event) => {
    console.log("Quick note click triggered for:", candidate.name);
    setQuickNotesState({
      isOpen: true,
      candidate: candidate,
      position: { x: 0, y: 0 },
    });
  }, []);

  const handleCloseQuickNotes = useCallback(() => {
    setQuickNotesState({
      isOpen: false,
      candidate: null,
      position: { x: 0, y: 0 },
    });
  }, []);

  const handleAddQuickNote = async (candidateId, noteContent) => {
    try {
      console.log(`Adding note for candidate ${candidateId}:`, noteContent);

      const newNote = await addCandidateNote({
        candidateId: candidateId,
        content: noteContent,
        author: recruiter?.name || "HR Manager"
      });

      console.log("Note saved successfully:", newNote);

      setNotesRefreshTrigger((prev) => prev + 1);

      return Promise.resolve();
    } catch (error) {
      console.error("Error saving note:", error);
      throw error;
    }
  };

  const handleStageChange = async (candidateId, newStage, changedBy = 'HR Manager') => {
    try {
      const success = await updateCandidateStage(candidateId, newStage, changedBy);
      if (!success) {
        console.error("Failed to update candidate stage");
        toast.error("Failed to update candidate stage");
      } else {
        console.log(`✅ Stage updated for candidate ${candidateId}: ${newStage} by ${changedBy}`);
      }
    } catch (error) {
      console.error("Error updating candidate stage:", error);
      toast.error("Error updating candidate stage");
    }
  };
  const jobId = searchParams.get("jobId");
  let baseCandidates = candidates;
    if (jobId) {
      const jobIdNum = parseInt(jobId);
      const candidatesByJob = candidates.filter(
        (candidate) => candidate.jobId === jobIdNum
      );
      if (candidatesByJob.length > 0) {
        baseCandidates = candidatesByJob;
      }
    }
  const filteredCandidates = useMemo(() => {
    
    

    return baseCandidates.filter((candidate) => {
      const matchesSearch =
        !searchTerm ||
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.jobTitle && candidate.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStage =
        stageFilter === "all" || candidate.stage === stageFilter;

      return matchesSearch && matchesStage;
    });
  }, [candidates, searchTerm, stageFilter, searchParams]);

  const candidatesByStage = useMemo(() => {
    const grouped = {};
    HIRING_STAGES.forEach((stage) => {
      grouped[stage.key] = baseCandidates.filter((candidate) => {
        const matchesStage = candidate.stage === stage.key;
        const matchesSearch =
          !searchTerm ||
          candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (candidate.jobTitle && candidate.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesStage && matchesSearch;
      });
    });
    return grouped;
  }, [baseCandidates, searchTerm]);

  const stageCounts = HIRING_STAGES.reduce((acc, stage) => {
    acc[stage.key] = candidatesByStage[stage.key]?.length || 0;
    return acc;
  }, {});

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active?.id || null);
  }, []);

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;

      setActiveId(null);

      if (!over) return;

      const activeId = active.id;
      const overId = over.id;

      let newStage = null;
      for (const [stage, stageCandidates] of Object.entries(
        candidatesByStage
      )) {
        if (stageCandidates.some((c) => c.id === overId) || stage === overId) {
          newStage = stage;
          break;
        }
      }

      const targetStage = HIRING_STAGES.find((stage) => stage.key === overId);
      if (targetStage) {
        newStage = targetStage.key;
      }

      if (!newStage || activeId === overId) return;

      const candidate = candidates.find((c) => c.id === activeId);
      if (!candidate || candidate.stage === newStage) return;
      
      if (!canTransitionToStage(candidate.stage, newStage)) {
        toast.error(`Cannot move candidate from ${candidate.stage} to ${newStage}`);
        return;
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(async () => {
          try {
            await handleStageChange(activeId, newStage);
            toast.success(
              `Candidate moved to ${HIRING_STAGES.find((s) => s.key === newStage)?.label}`
            );
          } catch (error) {
            toast.error("Error updating candidate stage");
            console.error("Drag update error:", error);
          }
        });
      });
    },
    [candidatesByStage, candidates, handleStageChange]
  );

  const VirtualizedList = ({ candidates }) => {
    const ITEM_HEIGHT = 110;
    const BUFFER = 36;
    const containerRef = React.useRef(null);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 60 });

    const handleScroll = useCallback(() => {
      const scrollTop = containerRef.current?.scrollTop || 0;
      const viewportHeight = containerRef.current?.clientHeight || 0;

      const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
      const itemsPerView = Math.ceil(viewportHeight / ITEM_HEIGHT);
      const start = startIndex;
      const end = Math.min(
        candidates.length,
        startIndex + itemsPerView + BUFFER
      );
      setVisibleRange({ start, end });
    }, [candidates.length]);

    const visibleCandidates = candidates.slice(
      visibleRange.start,
      visibleRange.end
    );

    useEffect(() => {
      handleScroll();
    }, [handleScroll]);

    return (
      <div
        className="h-full overflow-auto"
        ref={containerRef}
        onScroll={handleScroll}
      >
        <div
          style={{
            height: candidates.length * ITEM_HEIGHT,
            position: "relative",
          }}
        >
          <div
            style={{
              transform: `translateY(${visibleRange.start * ITEM_HEIGHT}px)`,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {visibleCandidates.map((candidate, index) => (
                <div key={candidate.id} style={{ height: ITEM_HEIGHT }}>
            <SortableCard
              candidate={candidate}
              index={visibleRange.start + index}
              onCandidateClick={handleCandidateClick}
              onQuickNoteClick={handleQuickNoteClick}
            />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-white flex flex-col">
      {}
      <div className="flex-shrink-0 bg-white">
        <div className="px-3 py-2 sm:px-4">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
              <p className="mt-1 text-sm text-gray-700">
                Manage your candidate, <b>{candidates.length}</b> total
                candidates
              </p>
              {}
              <div className="mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Stage counts:{" "}
                {Object.entries(stageCounts)
                  .map(([stage, count]) => `${stage}: ${count}`)
                  .join(" | ")}
              </div>
            </div>
            <div className="mt-3 sm:mt-0 flex items-center space-x-3">
              <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => {
                    setViewMode("list");
                    localStorage.setItem('candidatesViewMode', 'list');
                  }}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setViewMode("kanban");
                    localStorage.setItem('candidatesViewMode', 'kanban');
                  }}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "kanban"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="candidateSearch" className="sr-only">
                Search candidates
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="candidateSearch"
                  name="candidateSearch"
                  type="text"
                  placeholder="Search candidates by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {viewMode === "list" && (
              <div className="sm:w-48">
                <label htmlFor="stageFilter" className="sr-only">
                  Filter by stage
                </label>
                <select
                  id="stageFilter"
                  name="stageFilter"
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Stages</option>
                  {HIRING_STAGES.map((stage) => (
                    <option key={stage.key} value={stage.key}>
                      {stage.label} ({stageCounts[stage.key] || 0})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : viewMode === "kanban" ? (
          <div className="h-full bg-gray-50">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="h-full overflow-x-auto overflow-y-hidden py-4 pr-4 pl-8">
                <div className="flex gap-8 h-full kanban-stages-wrapper">
                  {HIRING_STAGES.map((stage) => (
                    <VirtualizedStageColumn
                      key={stage.key}
                      stage={stage}
                      candidates={candidatesByStage[stage.key] || []}
                      onCandidateClick={handleCandidateClick}
                      onQuickNoteClick={handleQuickNoteClick}
                    />
                  ))}
                </div>
              </div>
              <DragOverlay>
                <DraggedCandidate
                  candidate={candidates.find((c) => c.id === activeId)}
                />
              </DragOverlay>
            </DndContext>
          </div>
        ) : (
          <div className="h-full bg-gray-50 p-3">
            <VirtualizedList candidates={filteredCandidates} />
          </div>
        )}

        {!loading && filteredCandidates.length === 0 && (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No candidates found
              </h3>
              <p className="text-gray-500">
                {searchTerm || stageFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Add candidates to start managing your pipeline"}
              </p>
            </div>
          </div>
        )}
      </div>

      {}
      <QuickNotesPopup
        candidate={quickNotesState.candidate}
        isOpen={quickNotesState.isOpen}
        onClose={handleCloseQuickNotes}
        onAddNote={handleAddQuickNote}
      />
    </div>
  );
};

export default CandidatesBoard;
