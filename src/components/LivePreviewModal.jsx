import React, { useState, useMemo } from 'react';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  CheckSquare,
  Type,
  FileText,
  Hash,
  Upload,
} from 'lucide-react';

const LivePreviewModal = ({ isOpen, onClose, assessment }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestionInSection, setCurrentQuestionInSection] = useState(0);
  const [previewResponses, setPreviewResponses] = useState({});

  const allQuestionsWithSection = useMemo(() => {
    if (!assessment?.sections) return [];
    
    return assessment.sections.flatMap((section, sectionIndex) =>
      (section.questions || []).map((question) => ({
        ...question,
        sectionIndex,
        sectionTitle: section.title,
      }))
    );
  }, [assessment]);

  const currentSectionData = assessment?.sections?.[currentSection];
  const currentSectionQuestions = currentSectionData?.questions || [];
  
  const visibleQuestions = useMemo(() => {
    return currentSectionQuestions.filter((question) => {
      if (!question.conditionalLogic?.enabled) return true;
      
      const triggerResponse = previewResponses[question.conditionalLogic.triggerQuestion];
      if (!triggerResponse) return false;
      
      return triggerResponse === question.conditionalLogic.triggerValue;
    });
  }, [currentSectionQuestions, previewResponses]);

  const currentQuestion = visibleQuestions[currentQuestionInSection];

  const handleResponseChange = (questionId, value) => {
    setPreviewResponses((prev) => {
      const updated = { ...prev, [questionId]: value };
      
      allQuestionsWithSection.forEach((q) => {
        if (
          q.conditionalLogic?.enabled &&
          q.conditionalLogic.triggerQuestion === questionId
        ) {
          delete updated[q.id];
        }
      });
      
      return updated;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionInSection < visibleQuestions.length - 1) {
      setCurrentQuestionInSection(currentQuestionInSection + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionInSection > 0) {
      setCurrentQuestionInSection(currentQuestionInSection - 1);
    }
  };

  const handleNextSection = () => {
    if (currentSection < (assessment?.sections?.length || 0) - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestionInSection(0);
    }
  };

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setCurrentQuestionInSection(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestionInput = (question) => {
    const response = previewResponses[question.id];

    switch (question.type) {
      case 'single-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={response === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multi-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(response) && response.includes(option)}
                  onChange={(e) => {
                    const currentResponses = Array.isArray(response) ? response : [];
                    if (e.target.checked) {
                      handleResponseChange(question.id, [...currentResponses, option]);
                    } else {
                      handleResponseChange(
                        question.id,
                        currentResponses.filter((r) => r !== option)
                      );
                    }
                  }}
                  className="text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'short-text':
        return (
          <input
            type="text"
            value={response || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your answer..."
            maxLength={question.maxLength}
          />
        );

      case 'long-text':
        return (
          <textarea
            value={response || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            rows={6}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your detailed answer..."
            maxLength={question.maxLength}
          />
        );

      case 'numeric':
        return (
          <input
            type="number"
            value={response || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter a number..."
            min={question.minValue}
            max={question.maxValue}
            step={question.step || 1}
          />
        );

      case 'file-upload':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              File upload preview (not functional in preview mode)
            </p>
          </div>
        );

      default:
        return (
          <div className="text-gray-500 italic">
            Unsupported question type: {question.type}
          </div>
        );
    }
  };

  if (!isOpen) return null;

  if (!assessment) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-gray-600">No assessment data available for preview.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden">
        {}
        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Live Preview
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {assessment.title || 'Untitled Assessment'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{formatTime(assessment.settings?.timeLimit * 60 || 3600)}</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white px-4 sm:px-6 py-2 sm:py-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 min-w-0">
              <span className="text-xs sm:text-sm font-medium text-gray-900">
                Section {currentSection + 1} of {assessment.sections?.length || 1}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 truncate">
                {currentSectionData?.title || 'Untitled Section'}
              </span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <button
                onClick={handlePreviousSection}
                disabled={currentSection === 0}
                className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Previous Section</span>
                <span className="sm:hidden">Prev</span>
              </button>
              <button
                onClick={handleNextSection}
                disabled={currentSection >= (assessment.sections?.length || 1) - 1}
                className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next Section</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(95vh - 200px)' }}>
          {visibleQuestions.length === 0 ? (
            <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
              <div className="text-center text-gray-500 px-4">
                <Eye className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
                <p className="text-base sm:text-lg font-medium mb-2">No Questions in This Section</p>
                <p className="text-sm">
                  Add questions to this section to see the preview
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              {}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    Question {currentQuestionInSection + 1} of {visibleQuestions.length}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {currentQuestion?.points || 1} point{(currentQuestion?.points || 1) !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentQuestionInSection + 1) / visibleQuestions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {}
              {currentQuestion && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                      {currentQuestion.title}
                    </h3>
                    {currentQuestion.description && (
                      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                        {currentQuestion.description}
                      </p>
                    )}
                    {currentQuestion.required && (
                      <p className="text-xs sm:text-sm text-red-600 mb-3 sm:mb-4">
                        * This question is required
                      </p>
                    )}
                  </div>

                  <div className="mb-4 sm:mb-6">
                    {renderQuestionInput(currentQuestion)}
                  </div>

                  {}
                  {(currentQuestion.type === 'short-text' || currentQuestion.type === 'long-text') &&
                    currentQuestion.maxLength && (
                      <p className="text-xs text-gray-500 mt-2">
                        {(previewResponses[currentQuestion.id] || '').length} / {currentQuestion.maxLength} characters
                      </p>
                    )}
                </div>
              )}

              {}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 sm:pt-6 mt-4 sm:mt-6 -mx-4 sm:-mx-6 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionInSection === 0}
                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">Previous</span>
                  </button>

                  <div className="flex space-x-1 sm:space-x-2 max-w-[50%] overflow-x-auto scrollbar-hide">
                    {visibleQuestions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionInSection(index)}
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
                          index === currentQuestionInSection
                            ? 'bg-blue-600 text-white'
                            : previewResponses[visibleQuestions[index]?.id]
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionInSection >= visibleQuestions.length - 1}
                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="text-xs sm:text-sm">Next</span>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {}
        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-600">
              <span className="hidden sm:inline">Preview mode - Changes are not saved</span>
              <span className="sm:hidden">Preview mode</span>
            </p>
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-xs sm:text-sm"
            >
              <span className="sm:hidden">Close</span>
              <span className="hidden sm:inline">Close Preview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreviewModal;