import React, { useState, useEffect, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  Upload,
  FileText,
  Code,
  Hash,
  Type,
  Circle,
  CheckSquare,
} from "lucide-react";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { db } from "../database/db";

const TakeAssessment = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { assessments } = useContext(AppContext);

  const [assessment, setAssessment] = useState(null);
  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [candidateId] = useState(Date.now());

  const allQuestions =
    assessment?.sections?.flatMap((section) => section.questions) ||
    assessment?.questions ||
    [];
  const totalQuestionsCount = allQuestions.length;

  const normalizeQuestion = (question) => {
    return {
      ...question,
      title: question.title || question.question,
      type:
        question.type === "multiple-choice"
          ? "single-choice"
            : question.type,
    };
  };

  const visibleQuestions = allQuestions
    .filter((question) => {
      if (!question.conditionalLogic?.enabled) return true;
      console.log(question);
      const triggerResponse =
        responses[question.conditionalLogic.triggerQuestion];
      if (!triggerResponse) return false;

      const triggerValues = Array.isArray(
        question.conditionalLogic.triggerValue
      )
        ? question.conditionalLogic.triggerValue
        : [question.conditionalLogic.triggerValue];

      if (Array.isArray(triggerResponse)) {
        return triggerResponse.some((value) => triggerValues.includes(value));
      }

      return triggerValues.includes(triggerResponse);
    })
    .map(normalizeQuestion);
  const currentQ = visibleQuestions[currentQuestion];

  const questionSectionMap = useMemo(() => {
    const map = {};
    if (assessment?.sections) {
      assessment.sections.forEach((section, sIdx) => {
        (section.questions || []).forEach((q) => {
          map[q.id] = sIdx;
        });
      });
    }
    return map;
  }, [assessment]);

  const currentSectionIndex = currentQ
    ? (questionSectionMap[currentQ.id] ?? 0)
    : 0;

  const lastVisibleQuestionIndexInCurrentSection = visibleQuestions
    .map((q, idx) => ({ idx, sec: questionSectionMap[q.id] ?? 0 }))
    .filter((entry) => entry.sec === currentSectionIndex)
    .reduce((max, entry) => Math.max(max, entry.idx), -1);

  const isLastQuestionInSection =
    currentQuestion === lastVisibleQuestionIndexInCurrentSection;

  const isLastSection = assessment?.sections
    ? currentSectionIndex === assessment.sections.length - 1
    : true;

  const shouldShowSubmit = isLastSection && isLastQuestionInSection;

  const visibleQuestionsInSection = useMemo(
    () =>
      visibleQuestions.filter(
        (q) => (questionSectionMap[q.id] ?? 0) === currentSectionIndex
      ),
    [visibleQuestions, questionSectionMap, currentSectionIndex]
  );

  const answeredInSectionCount = visibleQuestionsInSection.filter(
    (q) => responses[q.id]
  ).length;

  const currentQuestionInSection = useMemo(() => {
    if (!currentQ) return 1;
    const sectionQuestions = visibleQuestionsInSection;
    const currentQuestionIndex = sectionQuestions.findIndex(q => q.id === currentQ.id);
    return currentQuestionIndex + 1;
  }, [currentQ, visibleQuestionsInSection]);

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        setLoading(true);
        console.log("Loading assessment with ID:", assessmentId);
        console.log("Assessments available:", assessments.length);
        console.log(
          "Available assessment IDs:",
          assessments.map((a) => a.id)
        );

        if (assessments.length === 0) {
          console.log("No assessments loaded yet, waiting...");
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const dbAssessment = await db.assessments.get(parseInt(assessmentId));
        console.log("Database assessment:", dbAssessment);

        if (dbAssessment) {
          setAssessment(dbAssessment);
          setTimeLeft(dbAssessment.settings.timeLimit * 60);

          const existingResponse = await db.assessmentResponses
            .where({
              candidateId: candidateId,
              assessmentId: parseInt(assessmentId),
            })
            .first();

          if (existingResponse) {
            setResponses(existingResponse.responses || {});
            toast.info("Previous responses loaded");
          }
        } else {
          console.log("Context assessments:", assessments);
          const contextAssessment = assessments.find(
            (a) => a.id === parseInt(assessmentId)
          );
          console.log("Found context assessment:", contextAssessment);

          if (contextAssessment) {
            setAssessment(contextAssessment);
            setTimeLeft(contextAssessment.settings.timeLimit * 60);
            toast.success("Assessment loaded successfully");
          }
        }
      } catch (error) {
        console.error("Error loading assessment:", error);
        toast.error("Failed to load assessment");
        navigate("/assessments");
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [assessmentId, candidateId, assessments, navigate]);

  useEffect(() => {
    if (timeLeft > 0 && !loading) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, loading]);

  useEffect(() => {
    if (autoSaveEnabled && Object.keys(responses).length > 0) {
      const autoSaveTimer = setTimeout(() => {
        saveResponses(false);
      }, 3000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [responses, autoSaveEnabled]);

  const validateResponse = (question, response) => {
    const errors = [];

    if (
      question.required &&
      (!response || (Array.isArray(response) && response.length === 0))
    ) {
      errors.push("This question is required");
    }

    if (question.type === "numeric" && response) {
      const num = parseFloat(response);
      if (isNaN(num)) {
        errors.push("Please enter a valid number");
      } else {
        if (question.minValue !== undefined && num < question.minValue) {
          errors.push(`Value must be at least ${question.minValue}`);
        }
        if (question.maxValue !== undefined && num > question.maxValue) {
          errors.push(`Value must not exceed ${question.maxValue}`);
        }
      }
    }

    if (
      (question.type === "short-text" || question.type === "long-text") &&
      response &&
      question.maxLength
    ) {
      if (response.length > question.maxLength) {
        errors.push(
          `Response must not exceed ${question.maxLength} characters`
        );
      }
    }

    return errors;
  };

  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => {
      const updated = { ...prev, [questionId]: value };

      allQuestions.forEach((q) => {
        if (
          q.conditionalLogic?.enabled &&
          q.conditionalLogic.triggerQuestion === questionId
        ) {
          delete updated[q.id];
        }
      });

      return updated;
    });

    setValidationErrors((prev) => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  const isQuestionAnswered = (questionId) => {
    const response = responses[questionId];
    if (!response) return false;

    if (Array.isArray(response)) {
      return response.length > 0;
    }
    if (typeof response === "string") {
      return response.trim().length > 0;
    }
    return response !== undefined && response !== null && response !== "";
  };

  const canNavigateToQuestion = (targetIndex) => {
    if (targetIndex < currentQuestion) return true;

    for (let i = 0; i < targetIndex; i++) {
      const question = visibleQuestions[i];
      if (question?.required && !isQuestionAnswered(question.id)) {
        return false;
      }
    }
    return true;
  };

  const goToQuestion = (direction) => {
    if (direction > 0 && isLastQuestionInSection && !isLastSection) {
      const nextSectionIndex = currentSectionIndex + 1;
      const firstQuestionOfNextSection = visibleQuestions.findIndex(
        (q) => (questionSectionMap[q.id] ?? 0) === nextSectionIndex
      );

      if (firstQuestionOfNextSection !== -1) {
        setCurrentQuestion(firstQuestionOfNextSection);
        toast.info(`Moving to section ${nextSectionIndex + 1}`);
      }
      return;
    }

    const newIndex = currentQuestion + direction;

    if (newIndex < 0 || newIndex >= visibleQuestions.length) return;

    if (
      direction > 0 &&
      currentQ?.required &&
      !isQuestionAnswered(currentQ.id)
    ) {
      const errors = validateResponse(currentQ, responses[currentQ.id]);
      setValidationErrors((prev) => ({
        ...prev,
        [currentQ.id]: errors,
      }));
      toast.error("Please answer the current question before proceeding");
      return;
    }

    if (!canNavigateToQuestion(newIndex)) {
      toast.error("Please answer all previous required questions first");
      return;
    }

    if (currentQ && isQuestionAnswered(currentQ.id)) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[currentQ.id];
        return updated;
      });
    }

    setCurrentQuestion(newIndex);
  };

  const navigateToQuestion = (targetIndex) => {
    if (!canNavigateToQuestion(targetIndex)) {
      toast.error("Please answer all previous required questions first");
      return;
    }

    setCurrentQuestion(targetIndex);
  };

  const saveResponses = async (isSubmission = false) => {
    try {
      const responseData = {
        id: `${candidateId}_${assessmentId}`,
        candidateId: candidateId,
        assessmentId: parseInt(assessmentId),
        responses: responses,
        submittedAt: isSubmission ? new Date().toISOString() : null,
        isCompleted: isSubmission,
        timeSpent: assessment
          ? assessment.settings.timeLimit * 60 - timeLeft
          : 0,
      };

      await db.assessmentResponses.put(responseData);

      if (!isSubmission) {
        toast.success("Progress saved", { autoClose: 2000 });
      }

      return true;
    } catch (error) {
      console.error("Error saving responses:", error);
      toast.error("Failed to save progress");
      return false;
    }
  };

  const handleSubmit = async (isTimeUp = false) => {
    if (submitting) return;

    setSubmitting(true);

    try {
      const allErrors = {};
      let hasErrors = false;

      visibleQuestions.forEach((question) => {
        const errors = validateResponse(question, responses[question.id]);
        if (errors.length > 0) {
          allErrors[question.id] = errors;
          hasErrors = true;
        }
      });

      if (hasErrors && !isTimeUp) {
        setValidationErrors(allErrors);
        toast.error("Please fix validation errors before submitting");
        setSubmitting(false);
        return;
      }

      const totalQuestions = visibleQuestionsInSection.length;
      const answeredQuestions = visibleQuestions.filter(
        (q) => responses[q.id]
      ).length;
      const completionPercentage =
        totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

      const success = await saveResponses(true);

      if (success) {
        toast.success(
          isTimeUp
            ? "Assessment auto-submitted!"
            : "Assessment submitted successfully!"
        );

        if (assessment.settings.showResults) {
          navigate(`/assessment-results/${assessmentId}`, {
            state: {
              score: completionPercentage,
              totalQuestions,
              answeredQuestions,
              responses,
              timeSpent: assessment.settings.timeLimit * 60 - timeLeft,
            },
          });
        } else {
          navigate("/assessments");
        }
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const renderQuestionContent = () => {
    return (
      <div>
        {}
        {currentQ.type === "single-choice" && (
          <div className="space-y-4">
            {currentQ.options?.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`option-${index}`}
                  name="single-choice"
                  value={option}
                  checked={responses[currentQ.id] === option}
                  onChange={(e) =>
                    handleResponseChange(currentQ.id, e.target.value)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label
                  htmlFor={`option-${index}`}
                  className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        )}

        {}
        {currentQ.type === "multi-choice" && (
          <div className="space-y-4">
            {currentQ.options?.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  id={`multi-option-${index}`}
                  value={option}
                  checked={responses[currentQ.id]?.includes(option) || false}
                  onChange={(e) => {
                    const currentResponses = responses[currentQ.id] || [];
                    let newResponses;
                    if (e.target.checked) {
                      newResponses = [...currentResponses, option];
                    } else {
                      newResponses = currentResponses.filter(
                        (r) => r !== option
                      );
                    }
                    handleResponseChange(currentQ.id, newResponses);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`multi-option-${index}`}
                  className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        )}

        {}
        {currentQ.type === "short-text" && (
          <div>
            <input
              type="text"
              value={responses[currentQ.id] || ""}
              onChange={(e) =>
                handleResponseChange(currentQ.id, e.target.value)
              }
              maxLength={currentQ.maxLength || 500}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your answer..."
            />
            {currentQ.maxLength && (
              <p className="text-xs text-gray-500 mt-2">
                {(responses[currentQ.id] || "").length} / {currentQ.maxLength}{" "}
                characters
              </p>
            )}
          </div>
        )}

        {}
        {currentQ.type === "long-text" && (
          <div>
            <textarea
              value={responses[currentQ.id] || ""}
              onChange={(e) =>
                handleResponseChange(currentQ.id, e.target.value)
              }
              rows={8}
              maxLength={currentQ.maxLength || 2000}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your detailed answer..."
            />
            {currentQ.maxLength && (
              <p className="text-xs text-gray-500 mt-2">
                {(responses[currentQ.id] || "").length} / {currentQ.maxLength}{" "}
                characters
              </p>
            )}
          </div>
        )}

        {}
        {currentQ.type === "numeric" && (
          <div>
            <input
              type="number"
              value={responses[currentQ.id] || ""}
              onChange={(e) =>
                handleResponseChange(currentQ.id, e.target.value)
              }
              min={currentQ.minValue}
              max={currentQ.maxValue}
              step={currentQ.step || 1}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a number"
            />
            {(currentQ.minValue !== undefined ||
              currentQ.maxValue !== undefined) && (
              <p className="text-xs text-gray-500 mt-2">
                Range: {currentQ.minValue ?? "−∞"} to{" "}
                {currentQ.maxValue ?? "+∞"}
              </p>
            )}
          </div>
        )}

        {}
        {currentQ.type === "file-upload" && (
          <div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                {currentQ.acceptedFileTypes || "All file types accepted"}
                {currentQ.maxFileSize &&
                  ` • Max size: ${currentQ.maxFileSize}MB`}
              </p>
              <input
                type="file"
                multiple={currentQ.allowMultiple}
                accept={currentQ.acceptedFileTypes}
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const fileNames = files.map((f) => f.name);
                  handleResponseChange(currentQ.id, fileNames);
                  toast.success(`${files.length} file(s) selected`);
                }}
                className="mt-4"
              />
              {responses[currentQ.id] && responses[currentQ.id].length > 0 && (
                <div className="mt-4 text-sm text-green-600">
                  Selected:{" "}
                  {Array.isArray(responses[currentQ.id])
                    ? responses[currentQ.id].join(", ")
                    : responses[currentQ.id]}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessment || visibleQuestionsInSection.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Assessment Not Available
          </h2>
          <p className="text-gray-600 mb-4">
            The assessment you're looking for could not be found.
          </p>
          <button
            onClick={() => navigate("/assessments")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col sm:flex-row overflow-hidden">
      {}
      <div className="w-full sm:w-32 md:w-40 lg:w-48 bg-white border-r sm:border-r border-b sm:border-b-0 border-gray-200 flex-shrink-0 flex flex-col max-h-32 sm:max-h-full">
        <div className="flex-shrink-0 p-2 sm:p-4 border-b sm:border-b border-gray-100">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            <span className="hidden sm:inline">Questions</span>
            <span className="sm:hidden">Q{currentQuestionInSection}/{visibleQuestionsInSection.length}</span>
          </h3>
          <div className={`text-xs font-medium py-1 rounded`}>
                Section {currentSectionIndex + 1}
              </div>
        </div>
        <div className="flex-1 overflow-y-auto sm:overflow-x-hidden overflow-x-auto p-2 sm:p-4">
          <div className="flex sm:flex-col sm:space-y-2 space-x-2 sm:space-x-0">
            {/* {assessment?.sections?.map((section, sectionIndex) => {
              const sectionQuestions = visibleQuestions.filter(
                (q) => (questionSectionMap[q.id] ?? 0) === sectionIndex
              );
              const isCurrentSection = currentSectionIndex === sectionIndex;
              const sectionNumber = sectionIndex + 1;
              const sectionColor = [
                "bg-blue-100 text-blue-800",
                "bg-green-100 text-green-800",
                "bg-purple-100 text-purple-800",
                "bg-yellow-100 text-yellow-800",
                "bg-pink-100 text-pink-800",
              ][sectionIndex % 5];

              return (
                <div key={`section-${sectionIndex}`} className="space-y-1">
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded ${sectionColor} ${isCurrentSection ? "ring-2 ring-offset-1" : ""}`}
                  >
                    Section {sectionNumber}
                  </div>
                  <div className="ml-2 space-y-1">
                    {sectionQuestions.map((question, qIndex) => {
                      const absoluteIndex = visibleQuestions.findIndex(
                        (q) => q.id === question.id
                      );
                      const isAnswered = isQuestionAnswered(question.id);
                      const isCurrent = currentQuestion === absoluteIndex;
                      const hasError =
                        validationErrors[question.id]?.length > 0;
                      const isAccessible = canNavigateToQuestion(absoluteIndex);

                      return (
                        <button
                          key={question.id}
                          onClick={() => navigateToQuestion(absoluteIndex)}
                          disabled={!isAccessible}
                          className={`w-full text-center px-3 py-1.5 rounded text-sm flex items-center justify-center gap-2 ${
                            isAccessible
                              ? "text-gray-700 hover:bg-gray-100"
                              : "text-gray-400 bg-gray-50 cursor-not-allowed"
                          } ${hasError ? "border-l-2 border-red-500 bg-red-50" : ""}`}
                        >
                          <span
                            className={`inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-white`}
                          >
                            {isAnswered ? (
                              <CheckCircle
                                className={`h-3 w-3 ${hasError ? "text-red-500" : "text-green-500"}`}
                              />
                            ) : hasError ? (
                              <AlertCircle className="h-3 w-3 text-red-500" />
                            ) : (
                              qIndex + 1
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })} */}
            
            <div key={`section-${currentSectionIndex}`} className="space-y-1">
              
              <div className="ml-2 space-y-1">
                {visibleQuestionsInSection.map((question, qIndex) => {
                  const absoluteIndex = visibleQuestions.findIndex(
                    (q) => q.id === question.id
                  );
                  const isAnswered = isQuestionAnswered(question.id);
                  const isCurrent = currentQuestion === absoluteIndex;
                  const hasError = validationErrors[question.id]?.length > 0;
                  const isAccessible = canNavigateToQuestion(absoluteIndex);

                  return (
                    <button
                      key={question.id}
                      onClick={() => navigateToQuestion(absoluteIndex)}
                      disabled={!isAccessible}
                      className={`w-full sm:w-auto min-w-8 sm:min-w-full text-center px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 flex-shrink-0 ${
                        isAccessible
                          ? "text-gray-700 hover:bg-gray-100"
                          : "text-gray-400 bg-gray-50 cursor-not-allowed"
                      } ${hasError ? "border-l-2 sm:border-l-2 border-red-500 bg-red-50" : ""}`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 text-ms rounded-full bg-white `}
                      >
                        {isAnswered ? (
                          <CheckCircle
                            className={`h-3 w-3 ${hasError ? "text-red-500" : "text-green-500"}`}
                          />
                        ) : hasError ? (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        ) : (
                          qIndex + 1
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          
        </div>
      </div>
      {}
      <div className="flex-1 flex flex-col h-screen max-h-screen relative">
        {}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4 flex-shrink-0 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {assessment.title} <span className="text-gray-500 px-4">(Section {currentSectionIndex + 1})</span>
              </h1>
              <div className="flex items-center mt-1 space-x-2 sm:space-x-4">
                <span className="text-xs sm:text-sm text-gray-600">
                  Q{currentQuestionInSection} of{" "}
                  {visibleQuestionsInSection.length}
                </span>
                <div className="flex-1 max-w-xs">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${(Object.keys(responses).length / totalQuestionsCount) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-3 ml-2">
              <button
                onClick={() => setShowInstructions(true)}
                className="hidden sm:flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden md:inline">Info</span>
              </button>

              <div
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
                  timeLeft < 300
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>

              {autoSaveEnabled && (
                <div className="hidden sm:flex items-center space-x-1 text-xs text-gray-500">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="hidden lg:inline">Auto-save</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {}
        <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 200px)', maxHeight: 'calc(100vh - 200px)' }}>
          <div className="h-full p-3 sm:p-4 md:p-6 overflow-y-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 md:p-8">
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 pr-2">
                    <span className="bg-gray-100 rounded-full flex-shrink-0">
                      {currentQuestionInSection}.
                    </span>
                    {currentQ.title}
                    {currentQ.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h2>

                  {currentQ.description && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">
                      {currentQ.description}
                    </p>
                  )}

                  {}
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-2 flex-wrap">
                    {currentQ.type === "single-choice" && (
                      <Circle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    )}
                    {currentQ.type === "multi-choice" && (
                      <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    )}
                    {currentQ.type === "short-text" && (
                      <Type className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    )}
                    {currentQ.type === "long-text" && (
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    )}
                    {currentQ.type === "numeric" && (
                      <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    )}
                    {currentQ.type === "file-upload" && (
                      <Upload className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    )}

                    <span className="text-xs text-gray-500 capitalize">
                      {currentQ.type.replace("-", " ")}
                    </span>

                    {currentQ.points && (
                      <span className="text-xs text-gray-500">
                        • {currentQ.points}pt{currentQ.points !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {}

              {}
              <div className="mb-4">
                {renderQuestionContent()}

                {}
                {validationErrors[currentQ.id] &&
                  validationErrors[currentQ.id].length > 0 && (
                    <div className="mt-3 flex items-start space-x-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Validation Error</p>
                        {validationErrors[currentQ.id].map((error, index) => (
                          <p key={index}>{error}</p>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 shadow-lg flex-shrink-0 z-10">
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => goToQuestion(-1)}
              disabled={currentQuestion === 0}
              className="inline-flex items-center px-4 sm:px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Prev
            </button>

            <div className="flex items-center space-x-3 sm:space-x-4">

              {!shouldShowSubmit ? (
                <div className="relative">
                  <button
                    onClick={() => goToQuestion(1)}
                    disabled={
                      currentQ?.required && !isQuestionAnswered(currentQ.id)
                    }
                    className="inline-flex items-center px-4 sm:px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    title={
                      currentQ?.required && !isQuestionAnswered(currentQ.id)
                        ? "Please answer this question to continue"
                        : ""
                    }
                  >
                    {isLastQuestionInSection ? "Next Section" : "Next"}
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </button>
                  {currentQ?.required && !isQuestionAnswered(currentQ.id) && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Answer required to proceed
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleSubmit()}
                  disabled={submitting}
                  className="inline-flex items-center px-4 sm:px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Submitting..." : "Submit"}
                  <CheckCircle className="h-4 w-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Test Instructions
              </h2>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    General Guidelines
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Read each question carefully before answering</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>
                        You can navigate between questions using the sidebar or
                        Next/Previous buttons
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>
                        Your answers are automatically saved as you type
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Questions marked with * are required</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>
                        Keep an eye on the timer - submit before time runs out
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Question Types
                  </h3>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-start space-x-2">
                      <Circle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <span className="font-medium">Single Choice:</span>
                        <span className="ml-1">
                          Select one option from the given choices
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <span className="font-medium">Multiple Choice:</span>
                        <span className="ml-1">
                          Select one or more options that apply
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Type className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <span className="font-medium">Text Answer:</span>
                        <span className="ml-1">Provide a written response</span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Code className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <span className="font-medium">Code:</span>
                        <span className="ml-1">
                          Write code to solve the given problem
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Hash className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <span className="font-medium">Numeric:</span>
                        <span className="ml-1">Enter a numerical value</span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Upload className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <span className="font-medium">File Upload:</span>
                        <span className="ml-1">
                          Upload required documents or files
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Important Notes
                  </h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="text-amber-800">
                        <p className="font-medium">Please ensure:</p>
                        <ul className="mt-2 space-y-1 text-sm">
                          <li>
                            • Stable internet connection throughout the test
                          </li>
                          <li>
                            • Answer all required questions before submitting
                          </li>
                          <li>• Review your answers before final submission</li>
                          <li>
                            • Once submitted, you cannot modify your responses
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowInstructions(false)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeAssessment;
