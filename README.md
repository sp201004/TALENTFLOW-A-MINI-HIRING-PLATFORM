# TALENTFLOW - Mini Hiring Platform

A comprehensive React-based hiring platform that enables HR teams to manage jobs, candidates, and assessments efficiently. Built with modern technologies and best practices for optimal user experience.

![Overview](https://github.com/user-attachments/assets/1b1e6b6b-602a-456b-8b51-eecfff38fa72)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/your-username/talentflow-mini-hiring-platform/releases)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-brightgreen.svg)](https://talentflow-demo.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-View%20Source-black.svg)](https://github.com/your-username/talentflow-mini-hiring-platform)

## Table of Contents

- [🚀 Quick Start](#-quick-start)
- [✨ Features & Screenshots](#-features--screenshots)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 Installation Guide](#-installation-guide)
- [📖 Usage](#-usage)
- [🏗️ Project Structure](#️-project-structure)
- [💾 Database/Storage Info](#-databasestorage-info)
- [🤝 Contributing Guidelines](#-contributing-guidelines)
- [📄 License](#-license)
- [📞 Contact / Authors](#-contact--authors)

## 🚀 Quick Start

Get up and running with TALENTFLOW in minutes:

```bash
# Clone the repository
git clone https://github.com/your-username/talentflow-mini-hiring-platform.git
cd talentflow-mini-hiring-platform

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

**Demo Login Credentials:**
- **Email**: `hr@talentflow.com`
- **Password**: `demo123`

## ✨ Features & Screenshots

### 🎯 Core Features

- **📋 Job Management**: Create, edit, archive, and reorder job postings with drag-and-drop functionality
- **👥 Candidate Tracking**: Manage 1000+ candidates with virtualized lists and kanban boards
- **📝 Assessment Builder**: Create custom assessments with multiple question types and conditional logic
- **🔍 Real-time Search**: Instant search and filtering across all data
- **📱 Responsive Design**: Mobile-first approach with seamless desktop experience
- **💾 Offline Support**: Local data persistence with IndexedDB
- **🎨 Modern UI/UX**: Clean, intuitive interface with smooth animations
- **⚡ Performance Optimized**: Virtualized lists and efficient rendering

### 📸 Screenshots

![Dashboard](https://github.com/user-attachments/assets/963e6eaf-97c9-4626-a61d-d738595e2ec4)
*Main dashboard with overview of jobs, candidates, and assessments*

![Jobs Board](https://github.com/user-attachments/assets/93601add-15e4-46d2-93db-b45a0da1dac4)
*Jobs management board with drag-and-drop reordering*

![Candidates Kanban](https://github.com/user-attachments/assets/1b440f5b-0d63-4247-8e68-d272bdcdee8e)
*Candidate management with kanban board view*

![Assessment](https://github.com/user-attachments/assets/0757a30b-6594-4b89-869b-400c4e6f9737)
*Assessment with live preview*

## 🛠️ Tech Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | Core UI framework |
| Vite | 7.1.0 | Build tool and dev server |
| TailwindCSS | 3.4.17 | Styling and responsive design |
| React Router DOM | 7.8.0 | Client-side routing |

### State Management & Data
| Technology | Version | Purpose |
|------------|---------|---------|
| React Context API | Built-in | Global state management |
| Dexie | 4.2.0 | IndexedDB wrapper for data persistence |
| MSW | 2.11.3 | API mocking and simulation |

### UI/UX Libraries
| Technology | Version | Purpose |
|------------|---------|---------|
| @dnd-kit | 6.3.1 | Drag and drop functionality |
| Lucide React | 0.544.0 | Icon library |
| React Toastify | 11.0.5 | Notification system |
| React Window | 2.1.1 | List virtualization |

### Development Tools
| Technology | Version | Purpose |
|------------|---------|---------|
| ESLint | 9.32.0 | Code linting and quality |
| PostCSS | 8.5.6 | CSS processing |
| Autoprefixer | 10.4.21 | CSS vendor prefixing |

## 📦 Installation Guide

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)

### Step-by-Step Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/talentflow-mini-hiring-platform.git
   cd talentflow-mini-hiring-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   ```
   Open your browser and navigate to: http://localhost:5173
   ```

### Additional Commands

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 📖 Usage

### Getting Started

1. **Login to the system**
   - **Email**: `hr@talentflow.com` (or any valid email format)
   - **Password**: `demo123` (or any password)
   
   *Note: Authentication is mock-based for demo purposes*

2. **Navigate through the platform**
   - **Dashboard**: Overview of all activities
   - **Jobs**: Manage job postings
   - **Candidates**: Track candidate progress
   - **Assessments**: Create and manage assessments

### Example Usage Scenarios

#### Creating a New Job
```javascript
// Navigate to Jobs → Create Job
// Fill in the required fields:
{
  title: "Senior React Developer",
  description: "Join our team to build amazing user experiences",
  location: "San Francisco, CA",
  salaryRange: "$120,000 - $150,000",
  tags: ["React", "JavaScript", "Frontend"]
}
```

#### Managing Candidates
```javascript
// Search candidates by name or email
searchTerm = "john.doe@email.com"

// Filter by hiring stage
stageFilter = "Technical Interview"

// Drag candidates between stages in kanban view
// Add notes with @mentions for team collaboration
```

#### Building Assessments
```javascript
// Create assessment sections with different question types:
const questionTypes = [
  "single-choice",    // Multiple choice (single answer)
  "multi-choice",     // Multiple choice (multiple answers)
  "short-text",       // Short text input
  "long-text",        // Textarea for longer responses
  "numeric",          // Number input with range validation
  "file-upload"       // File upload (stub implementation)
];
```

### 🎯 Demo Data

The application comes pre-loaded with:
- **📋 25 sample jobs** (mix of active and archived)
- **👥 1000+ sample candidates** distributed across different hiring stages
- **📝 3 sample assessments** with various question types
- **🏢 Realistic company data** with proper job descriptions and requirements
- **📊 Comprehensive test data** for all features and edge cases

## 🏗️ Project Structure

```
talentflow-mini-hiring-platform/
├── public/                     # Static assets
│   ├── favicon.ico
│   ├── mockServiceWorker.js    # MSW service worker
│   └── TalentFlow.svg
├── src/
│   ├── assets/                 # Images and static assets
│   │   ├── company_logos/
│   │   └── icons/
│   ├── components/             # Reusable UI components
│   │   ├── candidates/         # Candidate-specific components
│   │   │   ├── NotesSection.jsx
│   │   │   ├── QuickNotesPopup.jsx
│   │   │   └── TimelineItem.jsx
│   │   ├── common/             # Common UI components
│   │   ├── EditJobModal.jsx
│   │   ├── Navbar.jsx
│   │   └── RecruiterLogin.jsx
│   ├── context/                # React Context providers
│   │   └── AppContext.jsx      # Main application state
│   ├── database/               # Database configuration
│   │   ├── db.js              # Dexie IndexedDB setup
│   │   └── seed.js            # Database seeding
│   ├── mocks/                  # MSW API mocking
│   │   ├── handlers.js        # API route handlers
│   │   └── worker.js          # MSW worker setup
│   ├── pages/                  # Page components
│   │   ├── AssessmentBuilder.jsx
│   │   ├── CandidatesBoard.jsx
│   │   ├── Dashboard.jsx
│   │   ├── JobDetail.jsx
│   │   ├── JobsBoard.jsx
│   │   └── TakeAssessment.jsx
│   ├── services/               # API service layer
│   │   └── api.js
│   ├── utils/                  # Utility functions
│   │   └── persistence.js
│   ├── App.jsx                 # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── docs/                       # Documentation and images
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # TailwindCSS configuration
├── vite.config.js            # Vite configuration
└── README.md                 # This file
```

### Key Directory Explanations

- **`/src/components`**: Contains all reusable UI components organized by feature
- **`/src/pages`**: Main page components that represent different routes
- **`/src/context`**: React Context API for global state management
- **`/src/database`**: IndexedDB configuration and data seeding logic
- **`/src/mocks`**: Mock Service Worker setup for API simulation
- **`/src/services`**: Service layer for API interactions

## 💾 Database/Storage Info

### IndexedDB with Dexie

The application uses **IndexedDB** for local data persistence, managed through the **Dexie** library for better developer experience and TypeScript support.

#### Database Schema

```javascript
// Database structure
db.version(3).stores({
  jobs: 'id, title, slug, status, order, createdAt, updatedAt',
  candidates: 'id, name, email, jobId, stage, createdAt, updatedAt',
  assessments: 'id, jobId, title, description, questions, settings, createdAt, updatedAt',
  assessmentResponses: 'id, candidateId, jobId, assessmentId, [candidateId+assessmentId], responses, submittedAt',
  notes: 'id, candidateId, content, author, createdAt'
});
```

#### Data Persistence Strategy

1. **Primary Storage**: IndexedDB via Dexie
2. **Backup Storage**: localStorage for fallback
3. **Sync Strategy**: Write-through caching with MSW
4. **Offline Support**: Full functionality without network

#### Storage Management

```javascript
// Example of data operations
const saveJob = async (jobData) => {
  // Save to IndexedDB
  await db.jobs.add(jobData);
  
  // Backup to localStorage
  const jobs = await db.jobs.toArray();
  localStorage.setItem('jobs', JSON.stringify(jobs));
};
```

### Data Seeding

The application automatically seeds demo data on first load:

```javascript
// Seeding process
const seedData = async () => {
  // Check if data exists
  const existingJobs = await db.jobs.count();
  
  if (existingJobs === 0) {
    // Seed fresh demo data
    await db.jobs.bulkPut(sampleJobs);      // 25 jobs
    await db.candidates.bulkPut(sampleCandidates); // 1000+ candidates
    await db.assessments.bulkPut(sampleAssessments); // 3+ assessments
  }
};
```

## 🤝 Contributing Guidelines

We welcome contributions to improve TALENTFLOW! Please follow these guidelines:

### Development Setup

1. **Fork the repository** and clone your fork
2. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Install dependencies** and start development server
4. **Make your changes** following the code style guidelines

### Code Style Guidelines

- **React Components**: Use functional components with hooks
- **Naming Convention**: PascalCase for components, camelCase for functions
- **File Organization**: Group related files in feature folders
- **CSS**: Use TailwindCSS utility classes, avoid custom CSS when possible

### Commit Message Format

```
type(scope): brief description

Detailed explanation of what changed and why

Closes #issue-number
```

**Types**: feat, fix, docs, style, refactor, test, chore

### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass** and linting is clean
4. **Submit pull request** with clear description
5. **Address review feedback** promptly

### Code Review Criteria

- ✅ Code follows established patterns
- ✅ No console errors or warnings
- ✅ Responsive design maintained
- ✅ Accessibility standards met
- ✅ Performance considerations addressed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 TALENTFLOW

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

## 📞 Contact / Authors

### Project Team

**Lead Developer**
- Name: [Your Name]
- Email: [your.email@example.com]
- LinkedIn: [Your LinkedIn Profile]
- GitHub: [@your-username](https://github.com/your-username)

### Project Information

- **Repository**: [GitHub Repository](https://github.com/your-username/talentflow-mini-hiring-platform)
- **Live Demo**: [Demo URL](https://talentflow-demo.vercel.app)
- **Documentation**: [Project Wiki](https://github.com/your-username/talentflow-mini-hiring-platform/wiki)
- **Issues**: [Bug Reports & Feature Requests](https://github.com/your-username/talentflow-mini-hiring-platform/issues)

### Support

For questions, bug reports, or feature requests:

1. **Check existing issues** in the GitHub repository
2. **Create a new issue** with detailed description
3. **Join discussions** in the repository discussions tab
4. **Contact directly** via email for urgent matters

---

---

## 🎉 Acknowledgments

- Built with ❤️ using React and modern web technologies
- Inspired by modern HR platforms and best practices
- Special thanks to the open-source community for the amazing tools and libraries

## 📈 Project Status

- ✅ **Core Features**: Complete
- ✅ **UI/UX**: Polished and responsive
- ✅ **Performance**: Optimized with virtualization
- ✅ **Documentation**: Comprehensive
- 🚀 **Deployment**: Ready for production

---

**⭐ If you found this project helpful, please give it a star on GitHub!**
