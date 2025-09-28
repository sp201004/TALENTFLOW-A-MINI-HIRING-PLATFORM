import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Eye,
  Edit,
  Settings,
  Play,
  ArrowRight,
  Trash2,
  Upload,
  FileText,
  Hash,
  Type,
  CheckSquare,
  Circle,
  Code,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { db } from "../database/db";
import LivePreviewModal from "../components/LivePreviewModal";

const QUESTION_TYPES = [
  {
    id: "single-choice",
    label: "Single Choice",
    icon: Circle,
    description: "Single correct answer from multiple options",
  },
  {
    id: "multi-choice",
    label: "Multiple Choice",
    icon: CheckSquare,
    description: "Multiple correct answers from options",
  },
  {
    id: "short-text",
    label: "Short Text",
    icon: Type,
    description: "Short text response (1-2 lines)",
  },
  {
    id: "long-text",
    label: "Long Text",
    icon: FileText,
    description: "Long text response (paragraph)",
  },
  {
    id: "numeric",
    label: "Numeric",
    icon: Hash,
    description: "Numeric answer with range validation",
  },
  {
    id: "file-upload",
    label: "File Upload",
    icon: Upload,
    description: "File upload (documents, images)",
  },
];

const roleBasedQuestions = {
  "Frontend Developer": [
    {
      type: "single-choice",
      title: "What is the purpose of the Virtual DOM in React?",
      options: [
        "To directly manipulate the real DOM",
        "To optimize rendering by creating a lightweight copy of the real DOM",
        "To store component state",
        "To handle HTTP requests",
      ],
      correctAnswer:
        "To optimize rendering by creating a lightweight copy of the real DOM",
      points: 2,
    },
    {
      type: "multi-choice",
      title: "Which of the following are valid CSS display properties?",
      options: ["block", "inline", "flex", "absolute", "grid", "relative"],
      correctAnswers: ["block", "inline", "flex", "grid"],
      points: 3,
    },
    {
      type: "short-text",
      title: 'What is the difference between "let" and "var" in JavaScript?',
      maxLength: 500,
      points: 3,
    },
    {
      type: "long-text",
      title: "Write a JavaScript function to reverse a string",
      description:
        "Create a function called reverseString that takes a string as input and returns the reversed string.",
      points: 5,
    },
    {
      type: "single-choice",
      title: "Which CSS property is used to create responsive designs?",
      options: ["position", "display", "media-query", "transform"],
      correctAnswer: "media-query",
      points: 2,
    },
    {
      type: "long-text",
      title: 'Explain the concept of "mobile-first" design and its benefits',
      maxLength: 1000,
      points: 4,
    },
    {
      type: "single-choice",
      title: "What does CORS stand for?",
      options: [
        "Cross-Origin Resource Sharing",
        "Cross-Object Resource Security",
        "Component Object Resource Sharing",
        "Cross-Origin Request Security",
      ],
      correctAnswer: "Cross-Origin Resource Sharing",
      points: 2,
    },
    {
      type: "multi-choice",
      title: "Which are JavaScript frameworks/libraries?",
      options: ["React", "Vue.js", "Django", "Angular", "Laravel", "Svelte"],
      correctAnswers: ["React", "Vue.js", "Angular", "Svelte"],
      points: 3,
    },
    {
      type: "short-text",
      title: "What is the purpose of webpack in frontend development?",
      maxLength: 400,
      points: 3,
    },
    {
      type: "single-choice",
      title: "Which HTML tag is used for the largest heading?",
      options: ["<h6>", "<h1>", "<header>", "<big>"],
      correctAnswer: "<h1>",
      points: 1,
    },
    {
      type: "long-text",
      title: "Create a CSS class to center a div horizontally and vertically",
      description:
        "Write CSS code to create a class that centers any element both horizontally and vertically on the page.",
      points: 4,
    },
    {
      type: "long-text",
      title: "Describe your approach to optimizing web application performance",
      maxLength: 800,
      points: 5,
    },
  ],

  "Backend Developer": [
    {
      type: "single-choice",
      title: "What is the main purpose of an API?",
      options: [
        "To store data in databases",
        "To enable communication between different software applications",
        "To create user interfaces",
        "To manage server hardware",
      ],
      correctAnswer:
        "To enable communication between different software applications",
      points: 2,
    },
    {
      type: "multi-choice",
      title: "Which are valid HTTP status codes?",
      options: ["200", "404", "301", "199", "500", "999"],
      correctAnswers: ["200", "404", "301", "500"],
      points: 3,
    },
    {
      type: "short-text",
      title: "Explain the difference between SQL and NoSQL databases",
      maxLength: 500,
      points: 4,
    },
    {
      type: "long-text",
      title: "Write a function to validate an email address using regex",
      description:
        "Create a function that returns true if the email is valid, false otherwise.",
      points: 5,
    },
    {
      type: "single-choice",
      title: "Which HTTP method is used to update existing data?",
      options: ["GET", "POST", "PUT", "DELETE"],
      correctAnswer: "PUT",
      points: 2,
    },
    {
      type: "long-text",
      title: "Describe how you would design a scalable REST API",
      maxLength: 1000,
      points: 5,
    },
    {
      type: "single-choice",
      title: "What is the purpose of indexing in databases?",
      options: [
        "To encrypt data",
        "To improve query performance",
        "To backup data",
        "To validate data types",
      ],
      correctAnswer: "To improve query performance",
      points: 3,
    },
    {
      type: "multi-choice",
      title: "Which are backend programming languages?",
      options: ["Python", "JavaScript", "Java", "HTML", "C#", "CSS"],
      correctAnswers: ["Python", "JavaScript", "Java", "C#"],
      points: 3,
    },
    {
      type: "short-text",
      title: "What is the difference between authentication and authorization?",
      maxLength: 400,
      points: 4,
    },
    {
      type: "long-text",
      title: "Write a SQL query to find the second highest salary",
      description:
        "Write a SQL query to find the second highest salary from an employees table.",
      points: 5,
    },
    {
      type: "single-choice",
      title: "Which is a popular caching solution?",
      options: ["MySQL", "Redis", "MongoDB", "PostgreSQL"],
      correctAnswer: "Redis",
      points: 2,
    },
    {
      type: "long-text",
      title:
        "Explain your approach to handling database migrations in production",
      maxLength: 800,
      points: 5,
    },
  ],

  "Full Stack Developer": [
    {
      type: "single-choice",
      title: "What does MVC stand for in web development?",
      options: [
        "Model View Controller",
        "Multiple View Components",
        "Main Variable Control",
        "Model Validation Control",
      ],
      correctAnswer: "Model View Controller",
      points: 2,
    },
    {
      type: "multi-choice",
      title: "Which technologies are commonly used in the MEAN stack?",
      options: [
        "MongoDB",
        "Express.js",
        "Angular",
        "Node.js",
        "MySQL",
        "React",
      ],
      correctAnswers: ["MongoDB", "Express.js", "Angular", "Node.js"],
      points: 3,
    },
    {
      type: "short-text",
      title: "Explain what RESTful services are",
      maxLength: 500,
      points: 3,
    },
    {
      type: "long-text",
      title: "Create a simple Node.js Express route",
      description:
        "Write an Express.js route that handles GET requests to /users and returns a JSON response.",
      points: 4,
    },
    {
      type: "single-choice",
      title: "Which is NOT a JavaScript runtime environment?",
      options: ["Node.js", "Deno", "Bun", "Django"],
      correctAnswer: "Django",
      points: 2,
    },
    {
      type: "long-text",
      title: "Describe the process of deploying a full-stack application",
      maxLength: 1000,
      points: 5,
    },
    {
      type: "single-choice",
      title: "What is JWT used for?",
      options: [
        "Database queries",
        "User authentication and authorization",
        "CSS styling",
        "File compression",
      ],
      correctAnswer: "User authentication and authorization",
      points: 3,
    },
    {
      type: "multi-choice",
      title: "Which are version control concepts?",
      options: [
        "Branch",
        "Commit",
        "Loop",
        "Merge",
        "Variable",
        "Pull Request",
      ],
      correctAnswers: ["Branch", "Commit", "Merge", "Pull Request"],
      points: 3,
    },
    {
      type: "short-text",
      title: "What is the purpose of Docker in development?",
      maxLength: 400,
      points: 4,
    },
    {
      type: "long-text",
      title: "Write a React component with state management",
      description:
        "Create a React functional component that manages a counter state with increment and decrement buttons.",
      points: 5,
    },
    {
      type: "single-choice",
      title: "Which database is document-oriented?",
      options: ["PostgreSQL", "MongoDB", "MySQL", "SQLite"],
      correctAnswer: "MongoDB",
      points: 2,
    },
    {
      type: "long-text",
      title:
        "Explain your strategy for handling errors in a full-stack application",
      maxLength: 800,
      points: 5,
    },
  ],

  "Data Scientist": [
    {
      type: "single-choice",
      title: "What is the primary purpose of data preprocessing?",
      options: [
        "To visualize data",
        "To clean and prepare data for analysis",
        "To store data in databases",
        "To create machine learning models",
      ],
      correctAnswer: "To clean and prepare data for analysis",
      points: 2,
    },
    {
      type: "multi-choice",
      title: "Which are popular Python libraries for data science?",
      options: [
        "pandas",
        "numpy",
        "jQuery",
        "scikit-learn",
        "Bootstrap",
        "matplotlib",
      ],
      correctAnswers: ["pandas", "numpy", "scikit-learn", "matplotlib"],
      points: 3,
    },
    {
      type: "short-text",
      title:
        "Explain the difference between supervised and unsupervised learning",
      maxLength: 500,
      points: 4,
    },
    {
      type: "long-text",
      title: "Write Python code to calculate the mean of a list",
      description:
        "Create a function that takes a list of numbers and returns the mean (average) value.",
      points: 3,
    },
    {
      type: "single-choice",
      title: "Which algorithm is commonly used for classification?",
      options: ["K-means", "Linear Regression", "Random Forest", "PCA"],
      correctAnswer: "Random Forest",
      points: 3,
    },
    {
      type: "long-text",
      title: "Describe your approach to feature selection in machine learning",
      maxLength: 1000,
      points: 5,
    },
    {
      type: "single-choice",
      title: "What does SQL stand for?",
      options: [
        "Structured Query Language",
        "Simple Query Language",
        "Standard Query Language",
        "Sequential Query Language",
      ],
      correctAnswer: "Structured Query Language",
      points: 1,
    },
    {
      type: "multi-choice",
      title: "Which are measures of central tendency?",
      options: [
        "Mean",
        "Median",
        "Mode",
        "Range",
        "Standard Deviation",
        "Variance",
      ],
      correctAnswers: ["Mean", "Median", "Mode"],
      points: 3,
    },
    {
      type: "short-text",
      title:
        "What is overfitting in machine learning and how can it be prevented?",
      maxLength: 400,
      points: 4,
    },
    {
      type: "long-text",
      title: "Write a SQL query to group data by category and count records",
      description:
        "Write a SQL query to count the number of records in each category from a products table.",
      points: 4,
    },
    {
      type: "single-choice",
      title:
        "Which visualization is best for showing correlation between two variables?",
      options: ["Bar chart", "Pie chart", "Scatter plot", "Histogram"],
      correctAnswer: "Scatter plot",
      points: 2,
    },
    {
      type: "long-text",
      title:
        "Explain how you would validate the performance of a machine learning model",
      maxLength: 800,
      points: 5,
    },
  ],

  "Machine Learning Engineer": [
    {
      type: "single-choice",
      title: "What is the vanishing gradient problem?",
      options: [
        "When gradients become too large during training",
        "When gradients become too small and impede learning in deep networks",
        "When the model overfits to training data",
        "When the dataset is too small",
      ],
      correctAnswer:
        "When gradients become too small and impede learning in deep networks",
      points: 4,
    },
    {
      type: "multi-choice",
      title: "Which are deep learning frameworks?",
      options: [
        "TensorFlow",
        "PyTorch",
        "pandas",
        "Keras",
        "scikit-learn",
        "JAX",
      ],
      correctAnswers: ["TensorFlow", "PyTorch", "Keras", "JAX"],
      points: 3,
    },
    {
      type: "short-text",
      title: "Explain the concept of transfer learning",
      maxLength: 500,
      points: 4,
    },
    {
      type: "long-text",
      title: "Write Python code to implement a simple neural network layer",
      description:
        "Implement a basic dense layer with forward pass using NumPy.",
      points: 6,
    },
    {
      type: "single-choice",
      title: "Which optimization algorithm is commonly used in deep learning?",
      options: ["Bubble Sort", "Adam", "Binary Search", "Dijkstra"],
      correctAnswer: "Adam",
      points: 3,
    },
    {
      type: "long-text",
      title: "Describe your approach to hyperparameter tuning",
      maxLength: 1000,
      points: 5,
    },
    {
      type: "single-choice",
      title: "What is the purpose of batch normalization?",
      options: [
        "To reduce the size of batches",
        "To normalize input to each layer and stabilize training",
        "To increase model capacity",
        "To reduce overfitting",
      ],
      correctAnswer: "To normalize input to each layer and stabilize training",
      points: 4,
    },
    {
      type: "multi-choice",
      title: "Which are types of neural network architectures?",
      options: ["CNN", "RNN", "LSTM", "HTTP", "GAN", "API"],
      correctAnswers: ["CNN", "RNN", "LSTM", "GAN"],
      points: 4,
    },
    {
      type: "short-text",
      title: "What is the difference between precision and recall?",
      maxLength: 400,
      points: 4,
    },
    {
      type: "long-text",
      title: "Implement a function to calculate accuracy metric",
      description:
        "Write a Python function that calculates accuracy given true labels and predicted labels.",
      points: 4,
    },
    {
      type: "single-choice",
      title: "Which technique helps prevent overfitting?",
      options: [
        "Increasing model size",
        "Dropout",
        "Adding more layers",
        "Using more data only",
      ],
      correctAnswer: "Dropout",
      points: 3,
    },
    {
      type: "long-text",
      title: "Explain MLOps and its importance in machine learning workflows",
      maxLength: 800,
      points: 6,
    },
  ],
};

const generateRoleBasedQuestions = (jobRole, jobTitle) => {
  const searchTerms = [jobRole, jobTitle]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const roleKey = Object.keys(roleBasedQuestions).find((key) => {
    const keyLower = key.toLowerCase();
    return (
      searchTerms.includes(keyLower) ||
      searchTerms.includes(keyLower.replace(" developer", "")) ||
      searchTerms.includes(keyLower.replace(" engineer", "")) ||
      keyLower.includes(searchTerms.split(" ")[0])
    );
  });

  if (roleKey && roleBasedQuestions[roleKey]) {
    return roleBasedQuestions[roleKey].map((q, index) => ({
      id: `generated-${Date.now()}-${index}`,
      type: q.type,
      title: q.title,
      description: q.description || "",
      options: q.options || ["", ""],
      correctAnswer: q.correctAnswer || "",
      correctAnswers: q.correctAnswers || [],
      required: true,
      points: q.points || 1,
      maxLength: q.maxLength || 500,
      minValue: q.minValue || 0,
      maxValue: q.maxValue || 100,
      step: 1,
      acceptedFileTypes: "",
      maxFileSize: 10,
      allowMultiple: false,
    }));
  }

  return [];
};

const validateQuestion = (question) => {
  const errors = [];

  if (!question.title?.trim()) {
    errors.push("Question title is required");
  }

  if (question.type === "single-choice" || question.type === "multi-choice") {
    if (!question.options || question.options.length < 2) {
      errors.push("At least 2 options are required");
    }
    if (question.options && question.options.some((opt) => !opt?.trim())) {
      errors.push("All options must have text");
    }
  }

  if (question.type === "numeric") {
    if (
      question.minValue !== undefined &&
      question.maxValue !== undefined &&
      question.minValue >= question.maxValue
    ) {
      errors.push("Maximum value must be greater than minimum value");
    }
  }

  if (
    (question.type === "short-text" || question.type === "long-text") &&
    question.maxLength < 1
  ) {
    errors.push("Maximum length must be at least 1");
  }

  return errors;
};

const PreviewPane = ({
  assessment,
  currentSection,
  previewQuestion,
  setPreviewQuestion,
  previewResponses,
  setPreviewResponses,
  onSectionChange,
}) => {
  const currentSectionData = assessment.sections?.[currentSection];
  const currentSectionQuestions = currentSectionData?.questions || [];
  
  console.log('PreviewPane - assessment:', assessment);
  console.log('PreviewPane - currentSection:', currentSection);
  console.log('PreviewPane - currentSectionQuestions:', currentSectionQuestions);
  console.log('PreviewPane - sections:', assessment.sections);

  if (!currentSectionQuestions.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <Eye className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">No Questions in This Section</p>
          <p className="text-sm">
            Add questions to this section to see live preview
          </p>
        </div>
      </div>
    );
  }

  const visibleQuestions = currentSectionQuestions.filter((question) => {
    if (!question.conditionalLogic?.enabled) return true;

    const triggerResponse =
      previewResponses[question.conditionalLogic.triggerQuestion];
    if (!triggerResponse) return false;

    return triggerResponse === question.conditionalLogic.triggerValue;
  });

  React.useEffect(() => {
    if (
      visibleQuestions.length > 0 &&
      previewQuestion >= visibleQuestions.length
    ) {
      setPreviewQuestion(0);
    }
  }, [visibleQuestions.length, previewQuestion, setPreviewQuestion]);

  React.useEffect(() => {
    setPreviewQuestion(0);
  }, [currentSection, setPreviewQuestion]);

  const safePreviewQuestion = Math.min(
    previewQuestion,
    visibleQuestions.length - 1
  );
  const currentQ = visibleQuestions[safePreviewQuestion] || visibleQuestions[0];

  if (!currentQ) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <Eye className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">No Visible Questions</p>
          <p className="text-sm">
            Questions may be hidden due to conditional logic
          </p>
        </div>
      </div>
    );
  }

  const allQuestions = React.useMemo(() => {
    return assessment.sections?.flatMap(section => section.questions || []) || [];
  }, [assessment.sections]);

  const handleResponseChange = (questionId, value) => {
    setPreviewResponses((prev) => {
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
  };

  const validateResponse = (question, response) => {
    const errors = [];

    if (
      question.required &&
      (!response || (Array.isArray(response) && response.length === 0))
    ) {
      errors.push("This field is required");
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

  const responseErrors = validateResponse(
    currentQ,
    previewResponses[currentQ.id]
  );

  const handlePreviousSection = () => {
    if (currentSection > 0 && onSectionChange) {
      onSectionChange(currentSection - 1);
      setPreviewQuestion(0);
    }
  };

  const handleNextSection = () => {
    if (currentSection < (assessment.sections?.length || 1) - 1 && onSectionChange) {
      onSectionChange(currentSection + 1);
      setPreviewQuestion(0);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Live Preview - Section {currentSection + 1}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {currentSectionData?.title || "Untitled Section"} • {assessment.title || "Untitled Assessment"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {}
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  setPreviewQuestion(Math.max(0, safePreviewQuestion - 1))
                }
                disabled={safePreviewQuestion === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous question"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-500 min-w-[60px] text-center">
                {safePreviewQuestion + 1} / {visibleQuestions.length}
              </span>
              <button
                onClick={() =>
                  setPreviewQuestion(
                    Math.min(
                      visibleQuestions.length - 1,
                      safePreviewQuestion + 1
                    )
                  )
                }
                disabled={safePreviewQuestion === visibleQuestions.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next question"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {}
            {assessment.settings?.timeLimit && (
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{assessment.settings.timeLimit}min</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      {assessment.sections && assessment.sections.length > 1 && (
        <div className="bg-white px-6 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Section {currentSection + 1} of {assessment.sections.length}: {currentSectionData?.title || 'Untitled Section'}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousSection}
                disabled={currentSection === 0}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous Section</span>
              </button>
              <button
                onClick={handleNextSection}
                disabled={currentSection >= assessment.sections.length - 1}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next Section</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="p-8 max-h-[600px] overflow-y-auto">
        {}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {currentQ.title}
              {currentQ.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {QUESTION_TYPES.find((t) => t.id === currentQ.type)?.label}
            </span>
          </div>

          {currentQ.description && (
            <p className="text-gray-600 mb-4">{currentQ.description}</p>
          )}

          {}
          {currentQ.conditionalLogic?.enabled && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Conditional:</strong> This question appears when
                question "{currentQ.conditionalLogic.triggerQuestionTitle}"
                equals "{currentQ.conditionalLogic.triggerValue}"
              </p>
            </div>
          )}
        </div>

        {}
        <div className="mb-6">
          {}
          {currentQ.type === "single-choice" && (
            <div className="space-y-3">
              {currentQ.options?.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    id={`preview-single-${currentQ.id}-${index}`}
                    name={`preview-single-${currentQ.id}`}
                    value={option}
                    checked={previewResponses[currentQ.id] === option}
                    onChange={(e) =>
                      handleResponseChange(currentQ.id, e.target.value)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label
                    htmlFor={`preview-single-${currentQ.id}-${index}`}
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
            <div className="space-y-3">
              {currentQ.options?.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`preview-multi-${currentQ.id}-${index}`}
                    value={option}
                    checked={
                      previewResponses[currentQ.id]?.includes(option) || false
                    }
                    onChange={(e) => {
                      const currentResponses =
                        previewResponses[currentQ.id] || [];
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
                    htmlFor={`preview-multi-${currentQ.id}-${index}`}
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
                value={previewResponses[currentQ.id] || ""}
                onChange={(e) =>
                  handleResponseChange(currentQ.id, e.target.value)
                }
                maxLength={currentQ.maxLength || 500}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your answer..."
              />
              {currentQ.maxLength && (
                <p className="text-xs text-gray-500 mt-1">
                  {(previewResponses[currentQ.id] || "").length} /{" "}
                  {currentQ.maxLength} characters
                </p>
              )}
            </div>
          )}

          {}
          {currentQ.type === "long-text" && (
            <div>
              <textarea
                value={previewResponses[currentQ.id] || ""}
                onChange={(e) =>
                  handleResponseChange(currentQ.id, e.target.value)
                }
                rows={6}
                maxLength={currentQ.maxLength || 2000}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your detailed answer..."
              />
              {currentQ.maxLength && (
                <p className="text-xs text-gray-500 mt-1">
                  {(previewResponses[currentQ.id] || "").length} /{" "}
                  {currentQ.maxLength} characters
                </p>
              )}
            </div>
          )}

          {}
          {currentQ.type === "numeric" && (
            <div>
              <input
                type="number"
                value={previewResponses[currentQ.id] || ""}
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
                <p className="text-xs text-gray-500 mt-1">
                  Range: {currentQ.minValue ?? "−∞"} to{" "}
                  {currentQ.maxValue ?? "+∞"}
                </p>
              )}
            </div>
          )}

          {}
          {currentQ.type === "file-upload" && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  handleResponseChange(
                    currentQ.id,
                    files.map((f) => f.name)
                  );
                }}
              />
            </div>
          )}
        </div>

        {}
        {responseErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <ul className="text-sm text-red-800 space-y-1">
              {responseErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Response saved: {previewResponses[currentQ.id] ? "✓" : "○"}
          </div>
          <div className="flex items-center space-x-2">
            {}
            {(safePreviewQuestion > 0 || currentSection > 0) && (
              <button
                onClick={() => {
                  if (safePreviewQuestion > 0) {
                    setPreviewQuestion(safePreviewQuestion - 1);
                  } else if (currentSection > 0 && onSectionChange) {
                    onSectionChange(currentSection - 1);
                  }
                }}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 hover:shadow-md transition-shadow"
              >
                {safePreviewQuestion > 0 ? 'Previous' : 'Previous Section'}
              </button>
            )}
            
            {}
            {(safePreviewQuestion < visibleQuestions.length - 1 || currentSection < (assessment.sections?.length || 1) - 1) && (
              <button
                onClick={() => {
                  if (safePreviewQuestion < visibleQuestions.length - 1) {
                    setPreviewQuestion(safePreviewQuestion + 1);
                  } else if (currentSection < (assessment.sections?.length || 1) - 1 && onSectionChange) {
                    onSectionChange(currentSection + 1);
                  }
                }}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 hover:shadow-md transition-shadow"
              >
                {safePreviewQuestion < visibleQuestions.length - 1 ? 'Next' : 'Next Section'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
const AssessmentBuilder = () => {
  const { jobId, assessmentId } = useParams();
  const navigate = useNavigate();
  const { jobs, assessments, setAssessments } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [assessment, setAssessment] = useState({
    id: Date.now(),
    jobId: jobId === "new" ? null : parseInt(jobId),
    title: "",
    description: "",
    sections: [
      {
        id: "section-1",
        title: "General Questions",
        description: "",
        questions: [],
      },
    ],
    settings: {
      timeLimit: 60,
      passingScore: 70,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [questionEditor, setQuestionEditor] = useState({
    id: "",
    type: "single-choice",
    title: "",
    description: "",
    options: ["", ""],
    correctAnswer: "",
    correctAnswers: [],
    required: true,
    points: 1,
    maxLength: 500,
    minValue: 0,
    maxValue: 100,
    step: 1,
    acceptedFileTypes: "",
    maxFileSize: 10,
    allowMultiple: false,
    language: "javascript",
    conditionalLogic: {
      enabled: false,
      triggerQuestion: "",
      triggerValue: "",
      triggerQuestionTitle: "",
    },
  });

  const [previewQuestion, setPreviewQuestion] = useState(0);
  const [previewResponses, setPreviewResponses] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedRoleType, setSelectedRoleType] = useState("");
  const [showLivePreview, setShowLivePreview] = useState(false);

  const [tempSettings, setTempSettings] = useState({
    timeLimit: 60,
    passingScore: 70,
  });

  const handleOpenSettings = () => {
    setTempSettings({
      timeLimit: assessment.settings.timeLimit,
      passingScore: assessment.settings.passingScore,
    });
    setShowSettings(true);
  };

  const handleSaveSettings = () => {
    setAssessment((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        timeLimit: tempSettings.timeLimit,
        passingScore: tempSettings.passingScore,
      },
    }));
    setShowSettings(false);
  };

  const handleCancelSettings = () => {
    setShowSettings(false);
  };

  const currentJob = (() => {
    if (jobId === "new") return null;
    if (assessmentId) {
      return jobs.find((job) => job.id === assessment.jobId);
    }
    return jobs.find((job) => job.id === parseInt(jobId));
  })();


  useEffect(() => {
    if (activeTab === "preview") {
      setPreviewQuestion(0);
    }
  }, [activeTab]);

  useEffect(() => {
    if (currentJob) {
      const availableRoles = Object.keys(roleBasedQuestions);
      const jobText =
        `${currentJob.role || ""} ${currentJob.title || ""}`.toLowerCase();
      const matched = availableRoles.find((r) => {
        const rl = r.toLowerCase();
        return (
          jobText.includes(rl) ||
          jobText.includes(rl.replace(" developer", "")) ||
          jobText.includes(rl.replace(" engineer", ""))
        );
      });
      setSelectedRoleType(matched || "");
    }
  }, [currentJob]);

  useEffect(() => {
    if (jobId === "new" && assessment?.jobId) {
      const selectedJob = jobs.find((j) => j.id === assessment.jobId);
      if (selectedJob) {
        const availableRoles = Object.keys(roleBasedQuestions);
        const jobText =
          `${selectedJob.role || ""} ${selectedJob.title || ""}`.toLowerCase();
        const matched = availableRoles.find((r) => {
          const rl = r.toLowerCase();
          return (
            jobText.includes(rl) ||
            jobText.includes(rl.replace(" developer", "")) ||
            jobText.includes(rl.replace(" engineer", ""))
          );
        });
        setSelectedRoleType(matched || "");
      }
    }
  }, [jobId, assessment?.jobId, jobs]);

  useEffect(() => {
    loadAssessment();
  }, [jobId, assessmentId]);

  const loadAssessment = async () => {
    try {
      if (assessmentId) {
        console.log("Loading specific assessment for editing:", assessmentId);

        const existingAssessment = await db.assessments.get(
          parseInt(assessmentId)
        );

        if (existingAssessment) {
          const normalizedAssessment = {
            ...existingAssessment,
            sections: existingAssessment.sections || [
              {
                id: "section-1",
                title: "General Questions",
                description: "",
                questions: existingAssessment.questions || [],
              },
            ],
          };
          setAssessment(normalizedAssessment);
          return;
        }

        const contextAssessment = assessments.find(
          (a) => a.id === parseInt(assessmentId)
        );
        if (contextAssessment) {
          const normalizedAssessment = {
            ...contextAssessment,
            sections: contextAssessment.sections || [
              {
                id: "section-1",
                title: "General Questions",
                description: "",
                questions: contextAssessment.questions || [],
              },
            ],
          };
          setAssessment(normalizedAssessment);
          return;
        }

        console.error("Assessment not found:", assessmentId);
        return;
      }

      if (jobId === "new") {
        console.log("Creating new assessment");
        return;
      }

      const existingAssessment = await db.assessments
        .where("jobId")
        .equals(parseInt(jobId))
        .first();

      if (existingAssessment) {
        const normalizedAssessment = {
          ...existingAssessment,
          sections: existingAssessment.sections || [
            {
              id: "section-1",
              title: "General Questions",
              description: "",
              questions: existingAssessment.questions || [],
            },
          ],
        };
        setAssessment(normalizedAssessment);
      } else {
        const contextAssessment = assessments.find(
          (a) => a.jobId === parseInt(jobId)
        );

        if (contextAssessment) {
          const convertedAssessment = {
            ...contextAssessment,
            sections: contextAssessment.sections || [
              {
                id: "section-1",
                title: "General Questions",
                description: "",
                questions: contextAssessment.questions
                  ? contextAssessment.questions.map((q) => ({
                      ...q,
                      title: q.title || q.question,
                      type:
                        q.type === "multiple-choice" ? "single-choice" : q.type,
                    }))
                  : [],
              },
            ],
          };
          setAssessment(convertedAssessment);
          toast.info("Existing assessment loaded for editing");
        } else {
          const localKey = `assessment_draft_${jobId}`;
          const savedDraft = localStorage.getItem(localKey);

          if (savedDraft) {
            const parsed = JSON.parse(savedDraft);
            setAssessment(parsed);
            toast.info("Draft loaded from auto-save");
          } else {
            if (currentJob) {
              setAssessment((prev) => ({
                ...prev,
                title: `${currentJob.title} Assessment`,
              }));
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading assessment:", error);
      toast.error("Failed to load assessment");
    }
  };

  const saveAssessmentLocally = () => {
    try {
      const localKey = `assessment_draft_${jobId}`;
      localStorage.setItem(
        localKey,
        JSON.stringify({
          ...assessment,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error("Error saving locally:", error);
    }
  };

  const saveAssessment = async () => {
    if (!assessment.title.trim()) {
      toast.error("Assessment title is required");
      return;
    }

    if (
      !assessment.sections ||
      !assessment.sections.some((section) => section.questions.length > 0)
    ) {
      toast.error("Assessment must have at least one question");
      return;
    }

    setLoading(true);
    try {
      const assessmentData = {
        ...assessment,
        settings: {
          ...assessment.settings,
          timeLimit: assessment.settings.timeLimit || 60,
          passingScore: assessment.settings.passingScore || 70,
        },
        updatedAt: new Date().toISOString(),
      };

      await db.assessments.put(assessmentData);

      const existingIndex = assessments.findIndex(
        (a) => a.id === assessment.id
      );
      if (existingIndex >= 0) {
        const updatedAssessments = [...assessments];
        updatedAssessments[existingIndex] = assessmentData;
        setAssessments(updatedAssessments);
        localStorage.setItem("assessments", JSON.stringify(updatedAssessments));
      } else {
        const newAssessments = [...assessments, assessmentData];
        setAssessments(newAssessments);
        localStorage.setItem("assessments", JSON.stringify(newAssessments));
      }

      localStorage.removeItem(`assessment_draft_${jobId}`);

      toast.success("Assessment saved successfully!");
      navigate("/assessments");
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error("Failed to save assessment");
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    const sectionsArray = assessment.sections || [];
    const newSection = {
      id: `section-${Date.now()}`,
      title: `Section ${sectionsArray.length + 1}`,
      description: "",
      questions: [],
    };

    setAssessment((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), newSection],
    }));

    setCurrentSection(sectionsArray.length);
  };

  const updateSection = (sectionIndex, updates) => {
    setAssessment((prev) => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex ? { ...section, ...updates } : section
      ),
    }));
  };

  const deleteSection = (sectionIndex) => {
    if (!assessment.sections || assessment.sections.length <= 1) {
      toast.error("Assessment must have at least one section");
      return;
    }

    setAssessment((prev) => ({
      ...prev,
      sections: (prev.sections || []).filter(
        (_, index) => index !== sectionIndex
      ),
    }));

    if (currentSection >= sectionIndex && currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      ...questionEditor,
      id: `question-${Date.now()}`,
      sectionId: assessment.sections[currentSection]?.id,
    };
    console.log('Adding new question:', newQuestion);
    console.log('Current assessment before update:', assessment);
    const errors = validateQuestion(newQuestion);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }
    
    setAssessment((prev) => {
      const updated = {
        ...prev,
        sections: prev.sections.map((section, index) =>
          index === currentSection
            ? { ...section, questions: [...section.questions, newQuestion] }
            : section
        ),
      };
      console.log('Updated assessment after addQuestion:', updated);
      return updated;
    });

    setQuestionEditor({
      id: "",
      type: "single-choice",
      title: "",
      description: "",
      options: ["", ""],
      correctAnswer: "",
      correctAnswers: [],
      required: true,
      points: 1,
      maxLength: 500,
      minValue: 0,
      maxValue: 100,
      step: 1,
      acceptedFileTypes: "",
      maxFileSize: 10,
      allowMultiple: false,
      language: "javascript",
      conditionalLogic: {
        enabled: false,
        triggerQuestion: "",
        triggerValue: "",
        triggerQuestionTitle: "",
      },
    });

    toast.success("Question added successfully!");
  };

  const editQuestion = (sectionIndex, questionIndex) => {
    const question =
      assessment.sections[sectionIndex]?.questions[questionIndex];
    if (question) {
      setQuestionEditor({
        ...question,
        conditionalLogic: question.conditionalLogic || {
          enabled: false,
          triggerQuestion: "",
          triggerValue: "",
          triggerQuestionTitle: "",
        },
      });
      setEditingQuestion({ sectionIndex, questionIndex });
    }
  };

  const updateQuestion = () => {
    if (!editingQuestion) return;

    const errors = validateQuestion(questionEditor);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    setAssessment((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sectionIndex) =>
        sectionIndex === editingQuestion.sectionIndex
          ? {
              ...section,
              questions: section.questions.map((question, questionIndex) =>
                questionIndex === editingQuestion.questionIndex
                  ? { ...questionEditor }
                  : question
              ),
            }
          : section
      ),
    }));

    setEditingQuestion(null);
    setQuestionEditor({
      id: "",
      type: "single-choice",
      title: "",
      description: "",
      options: ["", ""],
      correctAnswer: "",
      correctAnswers: [],
      required: true,
      points: 1,
      maxLength: 500,
      minValue: 0,
      maxValue: 100,
      step: 1,
      acceptedFileTypes: "",
      maxFileSize: 10,
      allowMultiple: false,
      language: "javascript",
      conditionalLogic: {
        enabled: false,
        triggerQuestion: "",
        triggerValue: "",
        triggerQuestionTitle: "",
      },
    });

    toast.success("Question updated successfully!");
  };

  const deleteQuestion = (sectionIndex, questionIndex) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      setAssessment((prev) => ({
        ...prev,
        sections: prev.sections.map((section, index) =>
          index === sectionIndex
            ? {
                ...section,
                questions: section.questions.filter(
                  (_, qIndex) => qIndex !== questionIndex
                ),
              }
            : section
        ),
      }));
      toast.success("Question deleted");
    }
  };

  const addOption = () => {
    setQuestionEditor((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const updateOption = (index, value) => {
    setQuestionEditor((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  const removeOption = (index) => {
    if (questionEditor.options.length <= 2) {
      toast.error("At least 2 options are required");
      return;
    }

    setQuestionEditor((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const getAllQuestions = () => {
    return (assessment.sections || []).flatMap((section) =>
      (section.questions || []).map((q) => ({
        id: q.id,
        title: q.title,
        type: q.type,
        options: q.options,
      }))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {assessmentId ? (
                <Link
                  to="/assessments"
                  className="inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Assessments
                </Link>
              ) : jobId !== "new" ? (
                <Link
                  to={`/jobs/${jobId}`}
                  className="inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Job
                </Link>
              ) : (
                <Link
                  to="/assessments"
                  className="inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Assessments
                </Link>
              )}.
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleOpenSettings}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-shadow"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>

              <button
                onClick={() => setShowLivePreview(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-shadow"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>

              <button
                onClick={saveAssessment}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Assessment"}
              </button>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Assessment Builder
            </h1>
            <p className="mt-1 text-gray-600">
              {assessmentId ? (
                <span>
                  Edit Assessment:{" "}
                  <span className="font-light">{assessment.title}</span>
                </span>
              ) : jobId === "new" ? (
                "Create New Assessment"
              ) : (
                currentJob?.title || "Unknown Job"
              )}
            </p>
          </div>

          {}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {}
              {jobId === "new" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Select Job Position
                  </h2>
                  <div>
                    <label
                      htmlFor="jobSelect"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Choose the job position for this assessment *
                    </label>
                    <select
                      id="jobSelect"
                      value={assessment.jobId || ""}
                      onChange={(e) => {
                        const selectedJobId = parseInt(e.target.value);
                        const selectedJob = jobs.find(
                          (j) => j.id === selectedJobId
                        );

                        if (selectedJob) {

                          setAssessment((prev) => ({
                            ...prev,
                            jobId: selectedJobId,
                            title:
                              prev.title || `${selectedJob.title} Assessment`,
                          }));
                        } else {
                          setAssessment((prev) => ({
                            ...prev,
                            jobId: selectedJobId,
                            title: prev.title || "Assessment",
                          }));
                        }
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a job position...</option>
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title} - {job.company}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {}
              {jobId === "new" && assessment.jobId && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Role Templates
                    </h2>
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedRoleType}
                      onChange={(e) => setSelectedRoleType(e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Select role question type"
                    >
                      <option value="">Select role question type...</option>
                      {Object.keys(roleBasedQuestions).map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        const selectedJob = jobs.find(
                          (j) => j.id === assessment.jobId
                        );
                        const baseRole =
                          selectedRoleType ||
                          `${selectedJob?.role || ""}` ||
                          `${selectedJob?.title || ""}`;
                        const generatedQuestions = baseRole
                          ? generateRoleBasedQuestions(baseRole, baseRole)
                          : [];
                        if (generatedQuestions.length > 0) {
                          setAssessment((prev) => ({
                            ...prev,
                            sections: prev.sections.map((section, index) =>
                              index === currentSection
                                ? {
                                    ...section,
                                    questions: [
                                      ...section.questions,
                                      ...generatedQuestions,
                                    ],
                                  }
                                : section
                            ),
                          }));
                          toast.success(
                            `Added ${generatedQuestions.length} role-specific questions for ${baseRole}!`
                          );
                        } else {
                          toast.info(
                            "No role-specific questions available for the selected role"
                          );
                        }
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md shadow-sm text-blue-700 bg-blue-50 hover:bg-blue-100 hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Role Questions
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Assessment Details
                  </h2>
                  {currentJob && (
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedRoleType}
                        onChange={(e) => setSelectedRoleType(e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500"
                        aria-label="Select role question type"
                      >
                        <option value="">Select role question type...</option>
                        {Object.keys(roleBasedQuestions).map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => {
                          const roleKey =
                            selectedRoleType ||
                            `${currentJob.role || ""}` ||
                            `${currentJob.title || ""}`;
                          const generatedQuestions = roleKey
                            ? generateRoleBasedQuestions(roleKey, roleKey)
                            : [];
                          if (generatedQuestions.length > 0) {
                            setAssessment((prev) => ({
                              ...prev,
                              sections: prev.sections.map((section, index) =>
                                index === currentSection
                                  ? {
                                      ...section,
                                      questions: [
                                        ...section.questions,
                                        ...generatedQuestions,
                                      ],
                                    }
                                  : section
                              ),
                            }));
                            toast.success(
                              `Added ${generatedQuestions.length} role-specific questions for ${roleKey}!`
                            );
                          } else {
                            toast.info(
                              "No role-specific questions available for the selected role"
                            );
                          }
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md shadow-sm text-blue-700 bg-blue-50 hover:bg-blue-100 hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Role Questions
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="assessmentTitle"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Assessment Title *
                    </label>
                    <input
                      id="assessmentTitle"
                      type="text"
                      value={assessment.title || ""}
                      onChange={(e) =>
                        setAssessment((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Frontend Developer Technical Assessment"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="assessmentDescription"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Description
                    </label>
                    <textarea
                      id="assessmentDescription"
                      value={assessment.description || ""}
                      onChange={(e) =>
                        setAssessment((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe what this assessment evaluates..."
                    />
                  </div>
                </div>
              </div>

              {}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    <button
                      onClick={() => setActiveTab("builder")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "builder"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Builder
                    </button>
                    <button
                      onClick={() => setActiveTab("preview")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "preview"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Eye className="h-4 w-4 mr-2 inline" />
                      Preview
                    </button>
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === "builder" && (
                    <div className="space-y-6">
                      {}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          Sections & Questions
                        </h3>
                        <button
                          onClick={addSection}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Section
                        </button>
                      </div>

                      {}
                      {assessment.sections &&
                        assessment.sections.length > 1 && (
                          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                            {assessment.sections.map((section, index) => (
                              <button
                                key={section.id}
                                onClick={() => setCurrentSection(index)}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                  currentSection === index
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                }`}
                              >
                                {section.title}
                              </button>
                            ))}
                          </div>
                        )}

                      {}
                      {assessment.sections[currentSection] && (
                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 space-y-4">
                              <div>
                                <label
                                  htmlFor="sectionTitle"
                                  className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                  Section Title
                                </label>
                                <input
                                  id="sectionTitle"
                                  type="text"
                                  value={
                                    assessment.sections?.[currentSection]
                                      ?.title || ""
                                  }
                                  onChange={(e) =>
                                    updateSection(currentSection, {
                                      title: e.target.value,
                                    })
                                  }
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor="sectionDescription"
                                  className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                  Section Description
                                </label>
                                <input
                                  id="sectionDescription"
                                  type="text"
                                  value={
                                    assessment.sections?.[currentSection]
                                      ?.description || ""
                                  }
                                  onChange={(e) =>
                                    updateSection(currentSection, {
                                      description: e.target.value,
                                    })
                                  }
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Brief description of this section..."
                                />
                              </div>
                            </div>

                            {assessment.sections.length > 1 && (
                              <button
                                onClick={() => deleteSection(currentSection)}
                                className="ml-4 p-2 text-red-600 hover:text-red-800"
                                title="Delete section"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {}
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">
                              Questions (
                              {
                                assessment.sections[currentSection].questions
                                  .length
                              }
                              )
                            </h4>

                            {assessment.sections[currentSection].questions.map(
                              (question, questionIndex) => (
                                <div
                                  key={question.id}
                                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-3 mb-2">
                                        <span className="text-sm font-medium text-gray-500">
                                          Q{questionIndex + 1}
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          {
                                            QUESTION_TYPES.find(
                                              (t) => t.id === question.type
                                            )?.label
                                          }
                                        </span>
                                        {question.required && (
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Required
                                          </span>
                                        )}
                                        {question.conditionalLogic?.enabled && (
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Conditional
                                          </span>
                                        )}
                                      </div>

                                      <h5 className="text-base font-medium text-gray-900 mb-1">
                                        {question.title || "Untitled Question"}
                                      </h5>

                                      {question.description && (
                                        <p className="text-sm text-gray-600 mb-2">
                                          {question.description}
                                        </p>
                                      )}

                                      {(question.type === "single-choice" ||
                                        question.type === "multi-choice") && (
                                        <div className="text-sm text-gray-500">
                                          {question.options?.length || 0}{" "}
                                          options
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() =>
                                          editQuestion(
                                            currentSection,
                                            questionIndex
                                          )
                                        }
                                        className="p-2 text-blue-600 hover:text-blue-800"
                                        title="Edit question"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          deleteQuestion(
                                            currentSection,
                                            questionIndex
                                          )
                                        }
                                        className="p-2 text-red-600 hover:text-red-800"
                                        title="Delete question"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-lg font-medium text-gray-900">
                            {editingQuestion
                              ? "Edit Question"
                              : "Add New Question"}
                          </h4>
                          {editingQuestion && (
                            <button
                              onClick={() => {
                                setEditingQuestion(null);
                                setQuestionEditor({
                                  id: "",
                                  type: "single-choice",
                                  title: "",
                                  description: "",
                                  options: ["", ""],
                                  correctAnswer: "",
                                  correctAnswers: [],
                                  required: true,
                                  points: 1,
                                  maxLength: 500,
                                  minValue: 0,
                                  maxValue: 100,
                                  step: 1,
                                  acceptedFileTypes: "",
                                  maxFileSize: 10,
                                  allowMultiple: false,
                                  language: "javascript",
                                });
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-6">
                          {}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Question Type
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {QUESTION_TYPES.map((type) => {
                                const Icon = type.icon;
                                return (
                                  <button
                                    key={type.id}
                                    onClick={() =>
                                      setQuestionEditor((prev) => ({
                                        ...prev,
                                        type: type.id,
                                        options: type.id.includes("choice")
                                          ? ["", ""]
                                          : [],
                                        correctAnswer: "",
                                        correctAnswers: [],
                                      }))
                                    }
                                    className={`p-3 border border-gray-200 rounded-lg text-left hover:shadow-sm transition-all ${
                                      questionEditor.type === type.id
                                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                        : "hover:border-gray-300"
                                    }`}
                                  >
                                    <Icon className="h-5 w-5 text-gray-600 mb-2" />
                                    <div className="text-sm font-medium text-gray-900">
                                      {type.label}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {type.description}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                              <label
                                htmlFor="questionTitle"
                                className="block text-sm font-medium text-gray-700 mb-2"
                              >
                                Question Title *
                              </label>
                              <input
                                id="questionTitle"
                                type="text"
                                value={questionEditor.title || ""}
                                onChange={(e) =>
                                  setQuestionEditor((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                  }))
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter your question here..."
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label
                                htmlFor="questionDescription"
                                className="block text-sm font-medium text-gray-700 mb-2"
                              >
                                Description / Instructions
                              </label>
                              <textarea
                                id="questionDescription"
                                value={questionEditor.description || ""}
                                onChange={(e) =>
                                  setQuestionEditor((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                  }))
                                }
                                rows={2}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Optional: Provide additional context or instructions..."
                              />
                            </div>

                            <div>
                              <div className="flex items-center">
                                <input
                                  id="questionRequired"
                                  type="checkbox"
                                  checked={questionEditor.required}
                                  onChange={(e) =>
                                    setQuestionEditor((prev) => ({
                                      ...prev,
                                      required: e.target.checked,
                                    }))
                                  }
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                  htmlFor="questionRequired"
                                  className="ml-2 block text-sm text-gray-700"
                                >
                                  Required question
                                </label>
                              </div>
                            </div>

                            <div>
                              <label
                                htmlFor="questionPoints"
                                className="block text-sm font-medium text-gray-700 mb-2"
                              >
                                Points
                              </label>
                              <input
                                id="questionPoints"
                                type="number"
                                min="1"
                                max="100"
                                value={questionEditor.points || ""}
                                onChange={(e) =>
                                  setQuestionEditor((prev) => ({
                                    ...prev,
                                    points:
                                      e.target.value === ""
                                        ? ""
                                        : parseInt(e.target.value) || 1,
                                  }))
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>

                          {}
                          {}
                          {(questionEditor.type === "single-choice" ||
                            questionEditor.type === "multi-choice") && (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-medium text-gray-700">
                                  Options
                                </label>
                                <button
                                  onClick={addOption}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      addOption();
                                    }
                                  }}
                                  className="inline-flex items-center px-2 py-1 border border-gray-300 rounded shadow-sm text-sm text-gray-700 hover:bg-gray-50 hover:shadow-md transition-shadow focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Option
                                </button>
                              </div>

                              <div className="space-y-3">
                                {questionEditor.options.map((option, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start space-x-3"
                                  >
                                    <span className="text-sm text-gray-500 w-8 pt-2">
                                      {String.fromCharCode(65 + index)}.
                                    </span>
                                    <textarea
                                      value={option || ""}
                                      onChange={(e) =>
                                        updateOption(index, e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          if (
                                            index ===
                                            questionEditor.options.length - 1
                                          ) {
                                            addOption();
                                            setTimeout(() => {
                                              const nextInput =
                                                document.querySelector(
                                                  `[data-option-index="${index + 1}"]`
                                                );
                                              if (nextInput) nextInput.focus();
                                            }, 10);
                                          } else {
                                            const nextInput =
                                              document.querySelector(
                                                `[data-option-index="${index + 1}"]`
                                              );
                                            if (nextInput) nextInput.focus();
                                          }
                                        }
                                      }}
                                      data-option-index={index}
                                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 min-h-[40px] resize-vertical"
                                      placeholder={`Option ${index + 1}`}
                                      rows="1"
                                      style={{
                                        minHeight: "40px",
                                        resize: "vertical",
                                      }}
                                      onInput={(e) => {
                                        e.target.style.height = "auto";
                                        e.target.style.height =
                                          Math.max(40, e.target.scrollHeight) +
                                          "px";
                                      }}
                                    />
                                    {questionEditor.options.length > 2 && (
                                      <button
                                        onClick={() => removeOption(index)}
                                        className="p-1 text-red-600 hover:text-red-800 mt-1"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {}
                          {(questionEditor.type === "short-text" ||
                            questionEditor.type === "long-text") && (
                            <div>
                              <label
                                htmlFor="maxLength"
                                className="block text-sm font-medium text-gray-700 mb-2"
                              >
                                Maximum Length (characters)
                              </label>
                              <input
                                id="maxLength"
                                type="number"
                                min="1"
                                max="10000"
                                value={questionEditor.maxLength || ""}
                                onChange={(e) =>
                                  setQuestionEditor((prev) => ({
                                    ...prev,
                                    maxLength: parseInt(e.target.value) || 500,
                                  }))
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          )}

                          {}
                          {questionEditor.type === "numeric" && (
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label
                                  htmlFor="minValue"
                                  className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                  Minimum Value
                                </label>
                                <input
                                  id="minValue"
                                  type="number"
                                  value={questionEditor.minValue || ""}
                                  onChange={(e) =>
                                    setQuestionEditor((prev) => ({
                                      ...prev,
                                      minValue: parseFloat(e.target.value),
                                    }))
                                  }
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor="maxValue"
                                  className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                  Maximum Value
                                </label>
                                <input
                                  id="maxValue"
                                  type="number"
                                  value={questionEditor.maxValue || ""}
                                  onChange={(e) =>
                                    setQuestionEditor((prev) => ({
                                      ...prev,
                                      maxValue: parseFloat(e.target.value),
                                    }))
                                  }
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor="step"
                                  className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                  Step
                                </label>
                                <input
                                  id="step"
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={questionEditor.step || ""}
                                  onChange={(e) =>
                                    setQuestionEditor((prev) => ({
                                      ...prev,
                                      step: parseFloat(e.target.value) || 1,
                                    }))
                                  }
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                          )}

                          {}
                          {questionEditor.type === "file-upload" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label
                                  htmlFor="acceptedFileTypes"
                                  className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                  Accepted File Types
                                </label>
                                <input
                                  id="acceptedFileTypes"
                                  type="text"
                                  value={questionEditor.acceptedFileTypes || ""}
                                  onChange={(e) =>
                                    setQuestionEditor((prev) => ({
                                      ...prev,
                                      acceptedFileTypes: e.target.value,
                                    }))
                                  }
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="e.g., .pdf,.doc,.docx,.jpg,.png"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor="maxFileSize"
                                  className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                  Maximum File Size (MB)
                                </label>
                                <input
                                  id="maxFileSize"
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={questionEditor.maxFileSize || ""}
                                  onChange={(e) =>
                                    setQuestionEditor((prev) => ({
                                      ...prev,
                                      maxFileSize:
                                        e.target.value === ""
                                          ? 10
                                          : parseInt(e.target.value) || 10,
                                    }))
                                  }
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <div className="flex items-center">
                                  <input
                                    id="allowMultiple"
                                    type="checkbox"
                                    checked={questionEditor.allowMultiple}
                                    onChange={(e) =>
                                      setQuestionEditor((prev) => ({
                                        ...prev,
                                        allowMultiple: e.target.checked,
                                      }))
                                    }
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <label
                                    htmlFor="allowMultiple"
                                    className="ml-2 block text-sm text-gray-700"
                                  >
                                    Allow multiple files
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}

                          {}
                          <div className="border-t pt-6">
                            <h5 className="text-sm font-medium text-gray-900 mb-4">Correct Answer</h5>
                            
                            {}
                            {questionEditor.type === "single-choice" && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Select the correct answer
                                </label>
                                <div className="space-y-2">
                                  {questionEditor.options.map((option, index) => (
                                    <div key={index} className="flex items-center">
                                      <input
                                        type="radio"
                                        id={`correct-${index}`}
                                        name="correctAnswer"
                                        value={option}
                                        checked={questionEditor.correctAnswer === option}
                                        onChange={(e) =>
                                          setQuestionEditor((prev) => ({
                                            ...prev,
                                            correctAnswer: e.target.value,
                                          }))
                                        }
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        disabled={!option.trim()}
                                      />
                                      <label
                                        htmlFor={`correct-${index}`}
                                        className={`ml-3 block text-sm ${
                                          option.trim() ? 'text-gray-700' : 'text-gray-400'
                                        }`}
                                      >
                                        {option.trim() || `Option ${index + 1} (empty)`}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {}
                            {questionEditor.type === "multi-choice" && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Select all correct answers
                                </label>
                                <div className="space-y-2">
                                  {questionEditor.options.map((option, index) => (
                                    <div key={index} className="flex items-center">
                                      <input
                                        type="checkbox"
                                        id={`correct-multi-${index}`}
                                        value={option}
                                        checked={questionEditor.correctAnswers.includes(option)}
                                        onChange={(e) => {
                                          const newCorrectAnswers = e.target.checked
                                            ? [...questionEditor.correctAnswers, option]
                                            : questionEditor.correctAnswers.filter(a => a !== option);
                                          setQuestionEditor((prev) => ({
                                            ...prev,
                                            correctAnswers: newCorrectAnswers,
                                          }));
                                        }}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        disabled={!option.trim()}
                                      />
                                      <label
                                        htmlFor={`correct-multi-${index}`}
                                        className={`ml-3 block text-sm ${
                                          option.trim() ? 'text-gray-700' : 'text-gray-400'
                                        }`}
                                      >
                                        {option.trim() || `Option ${index + 1} (empty)`}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {}
                            {questionEditor.type === "short-text" && (
                              <div>
                                <label
                                  htmlFor="shortTextCorrect"
                                  className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                  Sample/Expected Answer (optional)
                                </label>
                                <input
                                  id="shortTextCorrect"
                                  type="text"
                                  value={questionEditor.correctAnswer || ""}
                                  onChange={(e) =>
                                    setQuestionEditor((prev) => ({
                                      ...prev,
                                      correctAnswer: e.target.value,
                                    }))
                                  }
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter a sample correct answer for reference..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  This will be used for grading reference and won't be shown to candidates
                                </p>
                              </div>
                            )}

                            {}
                            {questionEditor.type === "long-text" && (
                              <div>
                                <label
                                  htmlFor="longTextCorrect"
                                  className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                  Sample/Expected Answer (optional)
                                </label>
                                <textarea
                                  id="longTextCorrect"
                                  value={questionEditor.correctAnswer || ""}
                                  onChange={(e) =>
                                    setQuestionEditor((prev) => ({
                                      ...prev,
                                      correctAnswer: e.target.value,
                                    }))
                                  }
                                  rows={4}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter a sample correct answer for reference..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  This will be used for grading reference and won't be shown to candidates
                                </p>
                              </div>
                            )}

                            {}
                            {questionEditor.type === "numeric" && (
                              <div>
                                <label
                                  htmlFor="numericCorrect"
                                  className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                  Correct Answer
                                </label>
                                <input
                                  id="numericCorrect"
                                  type="number"
                                  value={questionEditor.correctAnswer || ""}
                                  onChange={(e) =>
                                    setQuestionEditor((prev) => ({
                                      ...prev,
                                      correctAnswer: e.target.value,
                                    }))
                                  }
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter the correct numeric answer..."
                                />
                              </div>
                            )}

                            {}
                            {questionEditor.type === "file-upload" && (
                              <div className="text-center py-4">
                                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">
                                  File upload questions don't require correct answers.
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Files will be reviewed manually by recruiters.
                                </p>
                              </div>
                            )}
                          </div>

                          {}
                          {/* <div className="border-t pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h5 className="text-sm font-medium text-gray-900">Conditional Logic</h5>
                                <p className="text-xs text-gray-500">Show this question only when certain conditions are met</p>
                              </div>
                              <div className="flex items-center">
                                <input
                                  id="enableConditional"
                                  type="checkbox"
                                  checked={questionEditor.conditionalLogic?.enabled || false}
                                  onChange={(e) => setQuestionEditor(prev => ({
                                    ...prev,
                                    conditionalLogic: {
                                      ...(prev.conditionalLogic || {
                                        enabled: false,
                                        triggerQuestion: '',
                                        triggerValue: '',
                                        triggerQuestionTitle: ''
                                      }),
                                      enabled: e.target.checked
                                    }
                                  }))}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="enableConditional" className="ml-2 block text-sm text-gray-700">
                                  Enable
                                </label>
                              </div>
                            </div>

                            {questionEditor.conditionalLogic?.enabled && (
                              <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                                <div>
                                  <label htmlFor="triggerQuestion" className="block text-sm font-medium text-gray-700 mb-2">
                                    Trigger Question
                                  </label>
                                  <select
                                    id="triggerQuestion"
                                    value={questionEditor.conditionalLogic?.triggerQuestion || ''}
                                    onChange={(e) => {
                                      const selectedQuestion = getAllQuestions().find(q => q.id === e.target.value)
                                      setQuestionEditor(prev => ({
                                        ...prev,
                                        conditionalLogic: {
                                          ...(prev.conditionalLogic || {
                                            enabled: false,
                                            triggerQuestion: '',
                                            triggerValue: '',
                                            triggerQuestionTitle: ''
                                          }),
                                          triggerQuestion: e.target.value,
                                          triggerQuestionTitle: selectedQuestion?.title || '',
                                          triggerValue: ''
                                        }
                                      }))
                                    }}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="">Select a question...</option>
                                    {getAllQuestions()
                                      .filter(q => q.id !== questionEditor.id)
                                      .map(question => (
                                        <option key={question.id} value={question.id}>
                                          {question.title || 'Untitled Question'}
                                        </option>
                                      ))}
                                  </select>
                                </div>

                                {questionEditor.conditionalLogic?.triggerQuestion && (
                                  <div>
                                    <label htmlFor="triggerValue" className="block text-sm font-medium text-gray-700 mb-2">
                                      When answer equals
                                    </label>
                                    {(() => {
                                      const triggerQuestion = getAllQuestions().find(q => q.id === questionEditor.conditionalLogic?.triggerQuestion)
                                      
                                      if (triggerQuestion?.type === 'single-choice') {
                                        return (
                                          <select
                                            id="triggerValue"
                                            value={questionEditor.conditionalLogic?.triggerValue || ''}
                                            onChange={(e) => setQuestionEditor(prev => ({
                                              ...prev,
                                              conditionalLogic: {
                                                ...(prev.conditionalLogic || {
                                                  enabled: false,
                                                  triggerQuestion: '',
                                                  triggerValue: '',
                                                  triggerQuestionTitle: ''
                                                }),
                                                triggerValue: e.target.value
                                              }
                                            }))}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                          >
                                            <option value="">Select an option...</option>
                                            {triggerQuestion.options?.map(option => (
                                              <option key={option} value={option}>
                                                {option}
                                              </option>
                                            ))}
                                          </select>
                                        )
                                      } else {
                                        return (
                                          <input
                                            id="triggerValue"
                                            type="text"
                                            value={questionEditor.conditionalLogic?.triggerValue || ''}
                                            onChange={(e) => setQuestionEditor(prev => ({
                                              ...prev,
                                              conditionalLogic: {
                                                ...(prev.conditionalLogic || {
                                                  enabled: false,
                                                  triggerQuestion: '',
                                                  triggerValue: '',
                                                  triggerQuestionTitle: ''
                                                }),
                                                triggerValue: e.target.value
                                              }
                                            }))}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter the trigger value..."
                                          />
                                        )
                                      }
                                    })()}
                                  </div>
                                )}
                              </div>
                            )}
                          </div> */}

                          {}
                          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                            {editingQuestion && (
                              <button
                                onClick={() => {
                                  setEditingQuestion(null);
                                  setQuestionEditor({
                                    id: "",
                                    type: "single-choice",
                                    title: "",
                                    description: "",
                                    options: ["", ""],
                                    correctAnswer: "",
                                    correctAnswers: [],
                                    required: true,
                                    points: 1,
                                    maxLength: 500,
                                    minValue: 0,
                                    maxValue: 100,
                                    step: 1,
                                    acceptedFileTypes: "",
                                    maxFileSize: 10,
                                    allowMultiple: false,
                                    language: "javascript",
                                    conditionalLogic: {
                                      enabled: false,
                                      triggerQuestion: "",
                                      triggerValue: "",
                                      triggerQuestionTitle: "",
                                    },
                                  });
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-shadow"
                              >
                                Cancel
                              </button>
                            )}

                            <button
                              onClick={
                                editingQuestion ? updateQuestion : addQuestion
                              }
                              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 hover:shadow-md transition-shadow"
                            >
                              {editingQuestion
                                ? "Update Question"
                                : "Add Question"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "preview" && (
                    <PreviewPane
                      assessment={assessment}
                      currentSection={currentSection}
                      previewQuestion={previewQuestion}
                      setPreviewQuestion={setPreviewQuestion}
                      previewResponses={previewResponses}
                      setPreviewResponses={setPreviewResponses}
                      onSectionChange={setCurrentSection}
                    />
                  )}
                </div>
              </div>
            </div>

            {}
            <div className="space-y-6">
              {}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Assessment Overview
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sections</span>
                    <span className="font-medium">
                      {assessment.sections.length}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Total Questions
                    </span>
                    <span className="font-medium">
                      {assessment.sections.reduce(
                        (total, section) => total + section.questions.length,
                        0
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Estimated Time
                    </span>
                    <span className="font-medium">
                      {assessment.settings.timeLimit} min
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Points</span>
                    <span className="font-medium">
                      {assessment.sections.reduce(
                        (total, section) =>
                          total +
                          section.questions.reduce(
                            (sectionTotal, question) =>
                              sectionTotal + (question.points || 1),
                            0
                          ),
                        0
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Passing Score</span>
                    <span className="font-medium">
                      {assessment.settings.passingScore}%
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200"></div>
              </div>
            </div>
          </div>
        </div>

        {}
        {showSettings && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Assessment Settings
                </h3>
                <button
                  onClick={handleCancelSettings}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {}
                <div>
                  <label
                    htmlFor="timeLimit"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Time Limit (minutes)
                  </label>
                  <input
                    id="timeLimit"
                    type="number"
                    min="1"
                    max="300"
                    value={tempSettings.timeLimit || ""}
                    placeholder="60"
                    onChange={(e) =>
                      setTempSettings((prev) => ({
                        ...prev,
                        timeLimit:
                          e.target.value === ""
                            ? ""
                            : parseInt(e.target.value),
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {}
                <div>
                  <label
                    htmlFor="passingScore"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Passing Score (%)
                  </label>
                  <input
                    id="passingScore"
                    type="number"
                    min="1"
                    max="100"
                    value={tempSettings.passingScore || ""}
                    placeholder="70"
                    onChange={(e) =>
                      setTempSettings((prev) => ({
                        ...prev,
                        passingScore:
                          e.target.value === ""
                            ? ""
                            : parseInt(e.target.value),
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>


              </div>

              <div className="mt-8 flex items-center justify-end space-x-3">
                <button
                  onClick={handleCancelSettings}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-shadow"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 hover:shadow-md transition-shadow"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {}
        <LivePreviewModal
          isOpen={showLivePreview}
          onClose={() => setShowLivePreview(false)}
          assessment={assessment}
        />
      </div>
    </div>
  );
};

export default AssessmentBuilder;
