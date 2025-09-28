import { db } from "./db";

export const seedData = async () => {
  try {
    console.log("🔄 Starting database seeding...");

    const existingJobs = await db.jobs.count();
    const existingCandidates = await db.candidates.count();
    const existingAssessments = await db.assessments.count();

    if (existingJobs > 0 || existingCandidates > 0 || existingAssessments > 0) {
      console.log("✅ Data already exists in database, skipping seed");
      return;
    }

    console.log("🌱 Seeding fresh demo data...");

    const jobs = [
      {
        id: 1,
        title: "Senior Frontend Developer",
        slug: "senior-frontend-developer-google",
        description:
          "Join Google's Chrome team to build the next generation of web experiences. You'll work on cutting-edge frontend technologies, collaborate with world-class engineers, and impact billions of users worldwide. We're looking for someone passionate about web performance, accessibility, and user experience.",
        role: "Senior Frontend Developer",
        company: "Google",
        location: "Mountain View, CA",
        employmentType: "Full-time",
        salaryRange: "$180,000 - $250,000",
        requirements:
          "React 5+ years\nTypeScript\nNext.js\nWeb Performance\nAccessibility\nTesting (Jest, Cypress)",
        tags: ["React", "TypeScript", "Frontend", "Google", "Senior"],
        status: "archived",
        applyByDate: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        order: 0,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
      {
        id: 2,
        title: "Full Stack Software Engineer",
        slug: "full-stack-engineer-meta",
        description:
          "Build innovative social experiences at Meta (Facebook). Work on products used by 3+ billion people globally. You'll develop scalable backend systems and engaging frontend interfaces for Facebook, Instagram, and WhatsApp platforms.",
        role: "Full Stack Software Engineer",
        company: "Meta (Facebook)",
        location: "Menlo Park, CA",
        employmentType: "Full-time",
        salaryRange: "$170,000 - $230,000",
        requirements:
          "React\nNode.js\nGraphQL\nPython\nPostgreSQL\nRedis\nKubernetes",
        tags: ["Full Stack", "React", "Node.js", "Meta", "Social Media"],
        status: "archived",
        applyByDate: new Date(
          Date.now() - 8 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: new Date(
          Date.now() - 6 * 24 * 60 * 60 * 1000
        ).toISOString(),
        order: 1,
        createdAt: "2024-01-16T10:00:00Z",
        updatedAt: "2024-01-16T10:00:00Z",
      },
      {
        id: 3,
        title: "Senior DevOps Engineer",
        slug: "devops-engineer-amazon",
        description:
          "Join Amazon Web Services (AWS) to build and maintain cloud infrastructure that powers millions of applications worldwide. You'll work with cutting-edge technologies and help customers scale their businesses on the cloud.",
        role: "Senior DevOps Engineer",
        company: "Amazon (AWS)",
        location: "Seattle, WA",
        employmentType: "Full-time",
        salaryRange: "$160,000 - $220,000",
        requirements:
          "AWS Services\nKubernetes\nDocker\nTerraform\nPython\nCI/CD\nMonitoring",
        tags: ["DevOps", "AWS", "Kubernetes", "Amazon", "Cloud"],
        status: "archived",
        applyByDate: new Date(
          Date.now() - 12 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
        order: 2,
        createdAt: "2024-01-17T10:00:00Z",
        updatedAt: "2024-01-17T10:00:00Z",
      },
      {
        id: 4,
        title: "Senior Product Designer",
        slug: "product-designer-apple",
        description:
          "Design the future of Apple products used by millions worldwide. Join our Human Interface team to create intuitive, beautiful, and accessible experiences across iOS, macOS, and emerging platforms.",
        role: "Senior Product Designer",
        company: "Apple",
        location: "Cupertino, CA",
        employmentType: "Full-time",
        salaryRange: "$150,000 - $200,000",
        requirements:
          "Sketch\nFigma\nPrototyping\nUser Research\nDesign Systems\niOS Design Guidelines",
        tags: ["Design", "UI/UX", "Apple", "iOS", "Product Design"],
        status: "archived",
        applyByDate: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: new Date(
          Date.now() - 12 * 24 * 60 * 60 * 1000
        ).toISOString(),
        order: 3,
        createdAt: "2024-01-18T10:00:00Z",
        updatedAt: "2024-01-18T10:00:00Z",
      },
      {
        id: 5,
        title: "Principal Data Scientist",
        slug: "data-scientist-microsoft",
        description:
          "Lead data science initiatives at Microsoft to drive AI and machine learning innovations. Work on Azure AI services, Office 365 analytics, and next-generation intelligent experiences.",
        role: "Principal Data Scientist",
        company: "Microsoft",
        location: "Redmond, WA",
        employmentType: "Full-time",
        salaryRange: "$190,000 - $280,000",
        requirements:
          "Python\nR\nMachine Learning\nAzure ML\nTensorFlow\nPyTorch\nSQL\nBig Data",
        tags: ["Data Science", "AI", "Machine Learning", "Microsoft", "Azure"],
        status: "archived",
        applyByDate: new Date(
          Date.now() - 20 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: new Date(
          Date.now() - 18 * 24 * 60 * 60 * 1000
        ).toISOString(),
        order: 4,
        createdAt: "2024-01-19T10:00:00Z",
        updatedAt: "2024-01-19T10:00:00Z",
      },
      {
        id: 6,
        title: "Mobile App Developer",
        slug: "mobile-app-developer",
        description:
          "Develop innovative mobile applications for iOS and Android.",
        role: "Mobile App Developer",
        location: "Los Angeles, CA",
        employmentType: "Full-time",
        salaryRange: "$105,000 - $145,000",
        requirements: "React Native\niOS\nAndroid\nMobile UI/UX",
        tags: ["Mobile", "React Native", "iOS", "Android"],
        status: "archived",
        applyByDate: new Date(
          Date.now() - 22 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: new Date(
          Date.now() - 20 * 24 * 60 * 60 * 1000
        ).toISOString(),
        order: 5,
        createdAt: "2024-01-20T10:00:00Z",
        updatedAt: "2024-01-20T10:00:00Z",
      },
      {
        id: 7,
        title: "Backend Software Engineer",
        slug: "backend-engineer-netflix",
        description:
          "Build scalable backend systems that power Netflix's streaming platform for 200+ million subscribers worldwide. Work on microservices, distributed systems, and high-performance video streaming infrastructure.",
        role: "Backend Software Engineer",
        company: "Netflix",
        location: "Los Gatos, CA",
        employmentType: "Full-time",
        salaryRange: "$165,000 - $240,000",
        requirements:
          "Java\nSpring Boot\nMicroservices\nKafka\nCassandra\nAWS\nDistributed Systems",
        tags: ["Backend", "Java", "Microservices", "Netflix", "Streaming"],
        status: "active",
        applyByDate: new Date(
          Date.now() + 22 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: null,
        order: 6,
        createdAt: "2024-01-20T10:00:00Z",
        updatedAt: "2024-01-20T10:00:00Z",
      },
      {
        id: 8,
        title: "Mobile App Developer (iOS)",
        slug: "ios-developer-uber",
        description:
          "Join Uber's mobile team to build and enhance the rider and driver apps used by millions daily. Focus on creating smooth, intuitive experiences for iOS users worldwide.",
        role: "Senior iOS Developer",
        company: "Uber",
        location: "San Francisco, CA",
        employmentType: "Full-time",
        salaryRange: "$155,000 - $210,000",
        requirements:
          "Swift\niOS SDK\nUIKit\nSwiftUI\nCore Data\nREST APIs\nMVVM\nXcode",
        tags: ["iOS", "Swift", "Mobile", "Uber", "Transportation"],
        status: "active",
        applyByDate: new Date(
          Date.now() + 18 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: null,
        order: 7,
        createdAt: "2024-01-21T10:00:00Z",
        updatedAt: "2024-01-21T10:00:00Z",
      },
      {
        id: 9,
        title: "Cloud Solutions Architect",
        slug: "cloud-architect-salesforce",
        description:
          "Design and implement cloud solutions at Salesforce, the world's leading CRM platform. Help enterprise customers migrate to the cloud and optimize their Salesforce implementations.",
        role: "Cloud Solutions Architect",
        company: "Salesforce",
        location: "San Francisco, CA",
        employmentType: "Full-time",
        salaryRange: "$180,000 - $250,000",
        requirements:
          "Salesforce Platform\nApex\nLightning\nIntegration\nCloud Architecture\nSaaS\nEnterprise Solutions",
        tags: ["Cloud", "Salesforce", "Architecture", "CRM", "Enterprise"],
        status: "active",
        applyByDate: new Date(
          Date.now() + 26 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: null,
        order: 8,
        createdAt: "2024-01-22T10:00:00Z",
        updatedAt: "2024-01-22T10:00:00Z",
      },
      {
        id: 10,
        title: "Machine Learning Engineer",
        slug: "ml-engineer-openai",
        description:
          "Join OpenAI to advance artificial intelligence research and development. Work on large language models, GPT improvements, and cutting-edge AI systems that push the boundaries of what's possible.",
        role: "Machine Learning Engineer",
        company: "OpenAI",
        location: "San Francisco, CA",
        employmentType: "Full-time",
        salaryRange: "$200,000 - $350,000",
        requirements:
          "Python\nTensorFlow\nPyTorch\nTransformers\nLLMs\nDeep Learning\nNLP\nMLOps",
        tags: ["AI", "Machine Learning", "OpenAI", "LLM", "Research"],
        status: "active",
        applyByDate: new Date(
          Date.now() + 40 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: null,
        order: 9,
        createdAt: "2024-01-23T10:00:00Z",
        updatedAt: "2024-01-23T10:00:00Z",
      },
      {
        id: 11,
        title: "Cybersecurity Engineer",
        slug: "cybersecurity-engineer-tesla",
        description:
          "Protect Tesla's automotive systems, charging infrastructure, and manufacturing processes from cyber threats. Work on securing autonomous vehicle systems and energy products.",
        role: "Cybersecurity Engineer",
        company: "Tesla",
        location: "Austin, TX",
        employmentType: "Full-time",
        salaryRange: "$140,000 - $190,000",
        requirements:
          "Network Security\nPenetration Testing\nAutomotive Security\nLinux\nPython\nThreat Analysis\nIncident Response",
        tags: [
          "Cybersecurity",
          "Tesla",
          "Automotive",
          "Security",
          "Infrastructure",
        ],
        status: "active",
        applyByDate: new Date(
          Date.now() + 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: null,
        order: 10,
        createdAt: "2024-01-24T10:00:00Z",
        updatedAt: "2024-01-24T10:00:00Z",
      },
      {
        id: 12,
        title: "QA Engineer",
        slug: "qa-engineer",
        description: "Ensure quality and reliability of our software products.",
        role: "QA Engineer",
        location: "Boston, MA",
        employmentType: "Full-time",
        salaryRange: "$95,000 - $125,000",
        requirements: "Testing\nAutomation\nSelenium\nJest",
        tags: ["QA", "Testing", "Automation"],
        status: "active",
        applyByDate: new Date(
          Date.now() + 18 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: null,
        order: 11,
        createdAt: "2024-01-22T10:00:00Z",
        updatedAt: "2024-01-22T10:00:00Z",
      },
      {
        id: 13,
        title: "Technical Writer",
        slug: "technical-writer",
        description: "Create clear and comprehensive technical documentation.",
        role: "Technical Writer",
        location: "Remote",
        employmentType: "Full-time",
        salaryRange: "$75,000 - $105,000",
        requirements: "Technical Writing\nDocumentation\nAPI Docs\nMarkdown",
        tags: ["Documentation", "Technical Writing"],
        status: "active",
        applyByDate: new Date(
          Date.now() + 40 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: null,
        order: 12,
        createdAt: "2024-01-23T10:00:00Z",
        updatedAt: "2024-01-23T10:00:00Z",
      },
      {
        id: 14,
        title: "Cybersecurity Analyst",
        slug: "cybersecurity-analyst",
        description:
          "Protect our systems from security threats and vulnerabilities.",
        role: "Cybersecurity Analyst",
        location: "Washington, DC",
        employmentType: "Full-time",
        salaryRange: "$120,000 - $160,000",
        requirements:
          "Security Analysis\nPenetration Testing\nRisk Assessment\nCISSP",
        tags: ["Security", "Analysis", "Risk Management"],
        status: "archived",
        applyByDate: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        order: 13,
        createdAt: "2024-01-24T10:00:00Z",
        updatedAt: "2024-01-24T10:00:00Z",
      },
      {
        id: 15,
        title: "Cloud Solutions Architect",
        slug: "cloud-solutions-architect",
        description:
          "Design and implement scalable cloud infrastructure solutions.",
        role: "Cloud Solutions Architect",
        location: "Denver, CO",
        employmentType: "Full-time",
        salaryRange: "$140,000 - $180,000",
        requirements: "AWS\nAzure\nCloud Architecture\nInfrastructure as Code",
        tags: ["Cloud", "Architecture", "AWS", "Azure"],
        status: "active",
        applyByDate: new Date(
          Date.now() + 32 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: null,
        order: 14,
        createdAt: "2024-01-25T10:00:00Z",
        updatedAt: "2024-01-25T10:00:00Z",
      },
      {
        id: 16,
        title: "Machine Learning Engineer",
        slug: "machine-learning-engineer",
        description: "Build and deploy machine learning models at scale.",
        role: "ML Engineer",
        location: "San Jose, CA",
        employmentType: "Full-time",
        salaryRange: "$135,000 - $175,000",
        requirements: "TensorFlow\nPyTorch\nMLOps\nKubernetes\nPython",
        tags: ["Machine Learning", "AI", "Python", "MLOps"],
        status: "active",
        applyByDate: new Date(
          Date.now() + 26 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: null,
        order: 15,
        createdAt: "2024-01-26T10:00:00Z",
        updatedAt: "2024-01-26T10:00:00Z",
      },
      {
        id: 17,
        title: "Blockchain Developer",
        slug: "blockchain-developer",
        description: "Develop decentralized applications and smart contracts.",
        role: "Blockchain Developer",
        location: "Miami, FL",
        employmentType: "Full-time",
        salaryRange: "$100,000 - $140,000",
        requirements: "Solidity\nWeb3\nEthereum\nSmart Contracts\nDApps",
        tags: ["Blockchain", "Web3", "Solidity", "Ethereum"],
        status: "archived",
        applyByDate: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: new Date(
          Date.now() - 8 * 24 * 60 * 60 * 1000
        ).toISOString(),
        order: 16,
        createdAt: "2024-01-27T10:00:00Z",
        updatedAt: "2024-01-27T10:00:00Z",
      },
      {
        id: 18,
        title: "Site Reliability Engineer",
        slug: "sre-airbnb",
        description:
          "Ensure the reliability and scalability of Airbnb's platform that connects millions of hosts and guests worldwide. Work on infrastructure automation, monitoring, and incident response.",
        role: "Site Reliability Engineer",
        company: "Airbnb",
        location: "San Francisco, CA",
        employmentType: "Full-time",
        salaryRange: "$170,000 - $230,000",
        requirements:
          "Kubernetes\nDocker\nTerraform\nMonitoring\nIncident Response\nPython\nLinux\nCloud Platforms",
        tags: ["SRE", "Airbnb", "Infrastructure", "Reliability", "DevOps"],
        status: "archived",
        applyByDate: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: new Date(
          Date.now() - 13 * 24 * 60 * 60 * 1000
        ).toISOString(),
        order: 17,
        createdAt: "2024-01-25T10:00:00Z",
        updatedAt: "2024-01-25T10:00:00Z",
      },
      {
        id: 19,
        title: "Blockchain Developer",
        slug: "blockchain-developer-coinbase",
        description:
          "Build the future of finance at Coinbase, the leading cryptocurrency exchange. Develop smart contracts, DeFi protocols, and blockchain infrastructure for millions of users.",
        role: "Senior Blockchain Developer",
        company: "Coinbase",
        location: "New York, NY",
        employmentType: "Full-time",
        salaryRange: "$160,000 - $220,000",
        requirements:
          "Solidity\nEthereum\nWeb3.js\nSmart Contracts\nDeFi\nCryptography\nNode.js\nReact",
        tags: [
          "Blockchain",
          "Coinbase",
          "Cryptocurrency",
          "DeFi",
          "Smart Contracts",
        ],
        status: "active",
        applyByDate: new Date(
          Date.now() + 35 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: null,
        order: 18,
        createdAt: "2024-01-26T10:00:00Z",
        updatedAt: "2024-01-26T10:00:00Z",
      },
      {
        id: 20,
        title: "Product Manager",
        slug: "product-manager-slack",
        description:
          "Lead product strategy for Slack's enterprise communication platform. Drive product roadmap, work with engineering teams, and shape the future of workplace collaboration.",
        role: "Senior Product Manager",
        company: "Slack",
        location: "San Francisco, CA",
        employmentType: "Full-time",
        salaryRange: "$160,000 - $210,000",
        requirements:
          "Product Strategy\nAgile\nUser Research\nData Analysis\nRoadmap Planning\nStakeholder Management\nB2B SaaS",
        tags: [
          "Product Management",
          "Slack",
          "Enterprise",
          "Collaboration",
          "SaaS",
        ],
        status: "active",
        applyByDate: new Date(
          Date.now() + 28 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: null,
        order: 19,
        createdAt: "2024-01-27T10:00:00Z",
        updatedAt: "2024-01-27T10:00:00Z",
      },
      {
        id: 21,
        title: "Game Developer",
        slug: "game-developer-unity",
        description:
          "Create immersive gaming experiences at Unity Technologies. Work on game engines, tools, and platforms that power thousands of games worldwide.",
        role: "Senior Game Developer",
        company: "Unity Technologies",
        location: "Austin, TX",
        employmentType: "Full-time",
        salaryRange: "$130,000 - $180,000",
        requirements:
          "C#\nUnity Engine\nGame Physics\n3D Graphics\nShaders\nPerformance Optimization\nMultiplayer Systems",
        tags: ["Game Development", "Unity", "C#", "Graphics", "Gaming"],
        status: "active",
        applyByDate: new Date(
          Date.now() + 25 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: null,
        order: 20,
        createdAt: "2024-01-28T10:00:00Z",
        updatedAt: "2024-01-28T10:00:00Z",
      },
      {
        id: 22,
        title: "Business Intelligence Analyst",
        slug: "bi-analyst-linkedin",
        description:
          "Drive data-driven decisions at LinkedIn, the world's largest professional network. Analyze user behavior, business metrics, and market trends to inform strategic initiatives.",
        role: "Senior BI Analyst",
        company: "LinkedIn",
        location: "Sunnyvale, CA",
        employmentType: "Full-time",
        salaryRange: "$140,000 - $185,000",
        requirements:
          "SQL\nTableau\nPython\nData Modeling\nStatistics\nBusiness Analytics\nA/B Testing\nData Visualization",
        tags: [
          "Business Intelligence",
          "LinkedIn",
          "Analytics",
          "Data Science",
          "SQL",
        ],
        status: "active",
        applyByDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: null,
        order: 21,
        createdAt: "2024-01-29T10:00:00Z",
        updatedAt: "2024-01-29T10:00:00Z",
      },
      {
        id: 23,
        title: "Quality Assurance Engineer",
        slug: "qa-engineer-spotify",
        description:
          "Ensure the quality of Spotify's music streaming platform used by 500+ million users worldwide. Work on automated testing, performance testing, and quality processes.",
        role: "Senior QA Engineer",
        company: "Spotify",
        location: "New York, NY",
        employmentType: "Full-time",
        salaryRange: "$130,000 - $175,000",
        requirements:
          "Test Automation\nSelenium\nJest\nCypress\nPerformance Testing\nAgile Testing\nCI/CD\nQuality Processes",
        tags: ["QA", "Spotify", "Testing", "Automation", "Quality Assurance"],
        status: "active",
        applyByDate: new Date(
          Date.now() + 12 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: null,
        order: 22,
        createdAt: "2024-01-30T10:00:00Z",
        updatedAt: "2024-01-30T10:00:00Z",
      },
      {
        id: 24,
        title: "Systems Administrator",
        slug: "sysadmin-dropbox",
        description:
          "Manage and optimize Dropbox's infrastructure that stores and syncs billions of files worldwide. Work on system automation, monitoring, and infrastructure scaling.",
        role: "Senior Systems Administrator",
        company: "Dropbox",
        location: "San Francisco, CA",
        employmentType: "Full-time",
        salaryRange: "$135,000 - $180,000",
        requirements:
          "Linux Administration\nAWS\nAutomation Scripts\nMonitoring\nNetworking\nDatabase Administration\nSecurity",
        tags: [
          "Systems Administration",
          "Dropbox",
          "Linux",
          "Infrastructure",
          "Cloud",
        ],
        status: "active",
        applyByDate: new Date(
          Date.now() + 16 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: null,
        order: 23,
        createdAt: "2024-01-31T10:00:00Z",
        updatedAt: "2024-01-31T10:00:00Z",
      },
      {
        id: 25,
        title: "UI/UX Designer",
        slug: "uiux-designer-figma",
        description:
          "Shape the design of Figma, the collaborative design tool used by millions of designers worldwide. Create intuitive interfaces and improve user experience.",
        role: "Senior UI/UX Designer",
        company: "Figma",
        location: "San Francisco, CA",
        employmentType: "Full-time",
        salaryRange: "$140,000 - $190,000",
        requirements:
          "Figma\nSketch\nAdobe Creative Suite\nPrototyping\nUser Research\nDesign Systems\nInteraction Design",
        tags: [
          "UI/UX Design",
          "Figma",
          "Design",
          "Prototyping",
          "User Experience",
        ],
        status: "active",
        applyByDate: new Date(
          Date.now() + 27 * 24 * 60 * 60 * 1000
        ).toISOString(),
        applicationsClosedDate: null,
        order: 24,
        createdAt: "2024-02-01T10:00:00Z",
        updatedAt: "2024-02-01T10:00:00Z",
      },
    ];

    console.log("📝 Seeding jobs...");
    await db.jobs.bulkPut(jobs);

    const candidates = [];
    const stages = [
      "Applied",
      "Online Assessment",
      "Technical Interview",
      "Final Interview",
      "Hired",
      "Rejected",
    ];
    const firstNames = [
      "John",
      "Jane",
      "Alice",
      "Bob",
      "Charlie",
      "Diana",
      "Eve",
      "Frank",
      "Grace",
      "Henry",
      "Ivy",
      "Jack",
      "Kate",
      "Liam",
      "Mia",
      "Noah",
      "Olivia",
      "Paul",
      "Quinn",
      "Ruby",
      "Sam",
      "Tina",
      "Uma",
      "Victor",
      "Wendy",
      "Xavier",
      "Yara",
      "Zoe",
    ];
    const lastNames = [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Garcia",
      "Miller",
      "Davis",
      "Rodriguez",
      "Martinez",
      "Hernandez",
      "Lopez",
      "Gonzalez",
      "Wilson",
      "Anderson",
      "Thomas",
      "Taylor",
      "Moore",
      "Jackson",
      "Martin",
      "Lee",
      "Perez",
      "Thompson",
      "White",
      "Harris",
      "Sanchez",
      "Clark",
      "Ramirez",
      "Lewis",
      "Robinson",
    ];

    for (let i = 1; i <= 1000; i++) {
      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
      const randomStage = stages[Math.floor(Math.random() * stages.length)];

      candidates.push({
        id: i,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        jobId: randomJob.id,
        jobTitle: randomJob.title,
        stage: randomStage,
        experience: `${Math.floor(Math.random() * 10) + 1} years`,
        location: randomJob.location,
        resumeUrl: `/resumes/resume_${i}.pdf`,
        appliedAt: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    console.log("👥 Seeding candidates...");
    await db.candidates.bulkPut(candidates);

    const assessments = [
      {
        id: 1,
        jobId: 1,
        title: "Frontend Development Assessment",
        description:
          "Evaluate React, TypeScript, and modern frontend development skills with comprehensive questions",
        sections: [
          {
            id: "section-1",
            title: "React & JavaScript Fundamentals",
            description: "Core concepts and modern practices",
            questions: [
              {
                id: "q1",
                type: "single-choice",
                title: "What is your level of React experience?",
                options: [
                  "Beginner (0-1 years)",
                  "Intermediate (2-4 years)",
                  "Advanced (5+ years)",
                  "Expert (10+ years)",
                ],
                required: true,
                points: 1,
              },
              {
                id: "q2",
                type: "single-choice",
                title: "What is the purpose of React hooks?",
                options: [
                  "State management in functional components",
                  "Class component inheritance",
                  "DOM manipulation",
                  "CSS styling",
                ],
                correctAnswer: "State management in functional components",
                required: true,
                points: 2,
              },
              {
                id: "q3",
                type: "multi-choice",
                title: "Which are valid React lifecycle methods?",
                options: [
                  "componentDidMount",
                  "componentWillReceiveProps",
                  "componentDidUpdate",
                  "render",
                ],
                correctAnswers: [
                  "componentDidMount",
                  "componentDidUpdate",
                  "render",
                ],
                required: true,
                points: 3,
              },
              {
                id: "q4",
                type: 'long-text',
                title:
                  "Write a React component that fetches and displays user data",
                description: "Use modern hooks and handle loading/error states",
                language: "javascript",
                required: true,
                points: 5,
              },
              {
                id: "q5",
                type: "single-choice",
                title: "Which TypeScript feature helps with type safety?",
                options: ["Interfaces", "Callbacks", "Loops", "Comments"],
                correctAnswer: "Interfaces",
                required: true,
                points: 2,
              },
              {
                id: "q6",
                type: "short-text",
                title: "Explain the difference between let, const, and var",
                maxLength: 200,
                required: true,
                points: 3,
              },
              {
                id: "q7",
                type: "single-choice",
                title: "What is the Virtual DOM?",
                options: [
                  "A JavaScript representation of the real DOM",
                  "A CSS framework",
                  "A database",
                  "A server technology",
                ],
                correctAnswer: "A JavaScript representation of the real DOM",
                required: true,
                points: 2,
              },
              {
                id: "q8",
                type: "multi-choice",
                title: "Which are ES6+ features?",
                options: [
                  "Arrow functions",
                  "Template literals",
                  "Destructuring",
                  "Classes",
                  "jQuery",
                ],
                correctAnswers: [
                  "Arrow functions",
                  "Template literals",
                  "Destructuring",
                  "Classes",
                ],
                required: true,
                points: 4,
              },
              {
                id: "q9",
                type: 'long-text',
                title: "Create a custom hook for API calls",
                description: "Handle loading, data, and error states",
                language: "javascript",
                required: true,
                points: 5,
              },
              {
                id: "q10",
                type: "single-choice",
                title: "What is Redux used for?",
                options: [
                  "State management",
                  "Routing",
                  "API calls",
                  "Styling",
                ],
                correctAnswer: "State management",
                required: true,
                points: 2,
              },
              {
                id: "q11",
                type: "single-choice",
                title: "What is JSX?",
                options: [
                  "A JavaScript extension",
                  "A CSS framework",
                  "A database query language",
                  "A server technology",
                ],
                correctAnswer: "A JavaScript extension",
                required: true,
                points: 2,
              },
              {
                id: "q12",
                type: "long-text",
                title: "Describe the React component lifecycle",
                description:
                  "Explain mounting, updating, and unmounting phases",
                maxLength: 500,
                required: true,
                points: 4,
              },
              {
                id: "q13",
                type: "single-choice",
                title:
                  "What is the primary purpose of the dependency array in the `useEffect` hook?",
                options: [
                  "To prevent the effect from ever running",
                  "To specify which props and state values should trigger a re-run of the effect",
                  "To declare variables used inside the effect",
                  "To replace the `componentDidMount` lifecycle method",
                ],
                correctAnswer:
                  "To specify which props and state values should trigger a re-run of the effect",
                required: true,
                points: 2,
              },
              {
                id: "q14",
                type: "multi-choice",
                title:
                  "Which of the following mechanisms can be used to optimize rendering performance in React?",
                options: [
                  "Using `React.memo` for functional components",
                  "Using the `key` prop correctly in lists",
                  "Implementing `shouldComponentUpdate` in class components",
                  "Wrapping expensive calculations with `useMemo`",
                  "Adding more state variables",
                ],
                correctAnswers: [
                  "Using `React.memo` for functional components",
                  "Implementing `shouldComponentUpdate` in class components",
                  "Wrapping expensive calculations with `useMemo`",
                ],
                required: true,
                points: 4,
              },
              {
                id: "q15",
                type: "short-text",
                title:
                  "Explain the concept of **closure** in JavaScript and provide a simple use case.",
                maxLength: 300,
                required: true,
                points: 3,
              },
              {
                id: "q16",
                type: "single-choice",
                title:
                  "What problem does the `useContext` hook primarily solve?",
                options: [
                  "Component-to-component navigation",
                  "Prop drilling",
                  "Asynchronous data fetching",
                  "Creating local component state",
                ],
                correctAnswer: "Prop drilling",
                required: true,
                points: 2,
              },
              {
                id: "q17",
                type: "single-choice",
                title: "In React forms, what is a **controlled component**?",
                options: [
                  "A component whose form data is handled by the DOM itself",
                  "A component whose input value is managed by React state",
                  "A component that only accepts pre-defined data types",
                  "A component whose rendering is controlled by conditional logic",
                ],
                correctAnswer:
                  "A component whose input value is managed by React state",
                required: true,
                points: 2,
              },
              {
                id: "q18",
                type: "single-choice",
                title:
                  "The `useReducer` hook is generally preferred over `useState` for which scenario?",
                options: [
                  "Managing a single boolean state flag",
                  "Handling independent state variables",
                  "Managing complex state logic involving multiple sub-values",
                  "Simple text input forms",
                ],
                correctAnswer:
                  "Managing complex state logic involving multiple sub-values",
                required: true,
                points: 3,
              },
              {
                id: "q19",
                type: "short-text",
                title:
                  "Briefly describe the JavaScript concept of **hoisting**.",
                maxLength: 150,
                required: true,
                points: 2,
              },
              {
                id: "q20",
                type: "single-choice",
                title:
                  "When rendering a list of elements in React, what is the significance of the `key` prop?",
                options: [
                  "It defines the order of the elements in the list",
                  "It is used by React to uniquely identify elements for efficient updates",
                  "It provides a unique ID for CSS styling",
                  "It makes the list items clickable",
                ],
                correctAnswer:
                  "It is used by React to uniquely identify elements for efficient updates",
                required: true,
                points: 2,
              },
            ],
          },
        ],
        settings: {
          timeLimit: 60,
          passingScore: 70,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        jobId: 7,
        title: "Backend Engineering Assessment",
        description:
          "Comprehensive test of Java, Spring Boot, and distributed systems knowledge with practical scenarios",
        sections: [
          {
            id: "section-1",
            title: "Backend Development Fundamentals",
            description: "Core backend concepts and best practices",
            questions: [
              {
                id: "q1",
                type: "single-choice",
                title:
                  "What is the main benefit of microservices architecture?",
                options: [
                  "Scalability and maintainability",
                  "Faster compilation",
                  "Less memory usage",
                  "Simpler deployment",
                ],
                correctAnswer: "Scalability and maintainability",
                required: true,
                points: 2,
              },
              {
                id: "q2",
                type: 'long-text',
                title: "Design a REST API endpoint for user management",
                description:
                  "Include proper HTTP methods, status codes, and error handling",
                language: "java",
                required: true,
                points: 5,
              },
              {
                id: "q3",
                type: "single-choice",
                title:
                  "Which database is best for high-throughput applications?",
                options: ["Cassandra", "SQLite", "Access", "Excel"],
                correctAnswer: "Cassandra",
                required: true,
                points: 2,
              },
              {
                id: "q4",
                type: "multi-choice",
                title: "Which are Spring Boot features?",
                options: [
                  "Auto-configuration",
                  "Embedded server",
                  "Production-ready features",
                  "Dependency injection",
                  "GUI components",
                ],
                correctAnswers: [
                  "Auto-configuration",
                  "Embedded server",
                  "Production-ready features",
                  "Dependency injection",
                ],
                required: true,
                points: 4,
              },
              {
                id: "q5",
                type: "single-choice",
                title: "What is the purpose of Docker?",
                options: [
                  "Containerization and deployment",
                  "Database management",
                  "Frontend frameworks",
                  "Image editing",
                ],
                correctAnswer: "Containerization and deployment",
                required: true,
                points: 2,
              },
              {
                id: "q6",
                type: "short-text",
                title: "Explain the difference between SQL and NoSQL databases",
                maxLength: 300,
                required: true,
                points: 3,
              },
              {
                id: "q7",
                type: 'long-text',
                title:
                  "Implement a caching strategy for frequently accessed data",
                description: "Use Redis or in-memory caching",
                language: "java",
                required: true,
                points: 5,
              },
              {
                id: "q8",
                type: "single-choice",
                title: "What is API rate limiting?",
                options: [
                  "Controlling request frequency",
                  "Database optimization",
                  "Code compression",
                  "UI design",
                ],
                correctAnswer: "Controlling request frequency",
                required: true,
                points: 2,
              },
              {
                id: "q9",
                type: "multi-choice",
                title: "Which are important for API security?",
                options: [
                  "Authentication",
                  "Authorization",
                  "HTTPS",
                  "Input validation",
                  "Pretty URLs",
                ],
                correctAnswers: [
                  "Authentication",
                  "Authorization",
                  "HTTPS",
                  "Input validation",
                ],
                required: true,
                points: 4,
              },
              {
                id: "q10",
                type: "long-text",
                title:
                  "Design a scalable architecture for a high-traffic e-commerce platform",
                description:
                  "Include databases, caching, load balancing, and monitoring",
                maxLength: 600,
                required: true,
                points: 6,
              },
            ],
          },
        ],
        settings: {
          timeLimit: 90,
          passingScore: 75,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        jobId: 10,
        title: "Machine Learning Assessment",
        description:
          "Comprehensive evaluation of ML algorithms, Python, and AI model development skills with practical applications",
        sections: [
          {
            id: "section-1",
            title: "Machine Learning Fundamentals",
            description: "Core ML concepts and practical applications",
            questions: [
              {
                id: "q1",
                type: "single-choice",
                title:
                  "What is the purpose of backpropagation in neural networks?",
                options: [
                  "Update weights to minimize loss",
                  "Forward data flow",
                  "Data preprocessing",
                  "Model deployment",
                ],
                correctAnswer: "Update weights to minimize loss",
                required: true,
                points: 3,
              },
              {
                id: "q2",
                type: 'long-text',
                title: "Implement a simple linear regression model in Python",
                description:
                  "Use numpy or scikit-learn with proper data preprocessing",
                language: "python",
                required: true,
                points: 5,
              },
              {
                id: "q3",
                type: "single-choice",
                title:
                  "Which metric is best for imbalanced classification problems?",
                options: ["F1-score", "Accuracy", "MAE", "R-squared"],
                correctAnswer: "F1-score",
                required: true,
                points: 2,
              },
              {
                id: "q4",
                type: "multi-choice",
                title: "Which are supervised learning algorithms?",
                options: [
                  "Linear Regression",
                  "K-Means",
                  "Random Forest",
                  "SVM",
                  "PCA",
                ],
                correctAnswers: ["Linear Regression", "Random Forest", "SVM"],
                required: true,
                points: 4,
              },
              {
                id: "q5",
                type: "single-choice",
                title: "What is overfitting?",
                options: [
                  "Model performs well on training but poorly on test data",
                  "Model is too simple",
                  "Data is too clean",
                  "Training time is too long",
                ],
                correctAnswer:
                  "Model performs well on training but poorly on test data",
                required: true,
                points: 2,
              },
              {
                id: "q6",
                type: "short-text",
                title: "Explain the bias-variance tradeoff",
                maxLength: 250,
                required: true,
                points: 4,
              },
              {
                id: "q7",
                type: 'long-text',
                title: "Implement k-fold cross-validation",
                description:
                  "Write code to split data and evaluate model performance",
                language: "python",
                required: true,
                points: 5,
              },
              {
                id: "q8",
                type: "single-choice",
                title: "What is the purpose of regularization?",
                options: [
                  "Prevent overfitting",
                  "Speed up training",
                  "Increase accuracy",
                  "Reduce data size",
                ],
                correctAnswer: "Prevent overfitting",
                required: true,
                points: 2,
              },
              {
                id: "q9",
                type: "multi-choice",
                title: "Which are deep learning frameworks?",
                options: [
                  "TensorFlow",
                  "PyTorch",
                  "Keras",
                  "Scikit-learn",
                  "Pandas",
                ],
                correctAnswers: ["TensorFlow", "PyTorch", "Keras"],
                required: true,
                points: 3,
              },
              {
                id: "q10",
                type: "long-text",
                title: "Design an ML pipeline for a recommendation system",
                description:
                  "Include data processing, model selection, training, and deployment strategies",
                maxLength: 500,
                required: true,
                points: 6,
              },
              {
                id: "q11",
                type: "numeric",
                title:
                  "If a dataset has 1000 samples and you use 80% for training, how many samples are for testing?",
                minValue: 1,
                maxValue: 1000,
                step: 1,
                required: true,
                points: 1,
              },
            ],
          },
        ],
        settings: {
          timeLimit: 120,
          passingScore: 80,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    console.log("📋 Seeding assessments...");
    await db.assessments.bulkPut(assessments);

    console.log("✅ Seed data completed successfully!");
    console.log(`   - ${jobs.length} jobs`);
    console.log(`   - ${candidates.length} candidates`);
    console.log(`   - ${assessments.length} assessments`);
  } catch (error) {
    console.error("❌ Error seeding data:", error);

    if (error.name === "BulkError") {
      console.log("🔍 BulkError details:");
      console.log(
        `   - Total operations: ${error.failures?.length || "unknown"}`
      );
      console.log(
        "   - This usually means data already exists in the database"
      );
      console.log("   - The application should still work normally");
      return;
    }

    throw error;
  }
};
