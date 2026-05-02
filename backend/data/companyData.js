export const companyData = {
  amazon: {
    name: "amazon",
    overview: {
      name: "Amazon",
      tagline: "Work Hard. Have Fun. Make History.",
      description:
        "Amazon is guided by four principles: customer obsession rather than competitor focus, passion for invention, commitment to operational excellence, and long-term thinking.",
      industry: "E-commerce, Cloud Computing, AI/ML",
      headquarters: "Seattle, Washington, USA",
    },
    hiring: {
      pattern: [
        {
          round: "Online Assessment",
          details: "2 Coding questions (Medium-Hard), 2 Work Simulation, Work Style Assessment",
        },
        { round: "Technical Interview 1", details: "DSA + OOP + System Design" },
        { round: "Technical Interview 2", details: "Advanced DSA + Behavioral" },
        { round: "Bar Raiser", details: "Leadership Principles deep dive" },
      ],
      difficulty: "Hard",
      importantPoints: [
        "Leadership Principles (16 total)",
        "No negative marking",
        "Coding: Optimal solutions only",
      ],
    },
    salary: {
      average: "₹45-60 LPA",
      intern: "₹1.2-1.8 LPA monthly",
      bonus: "15-25% + RSUs",
    },
    examTimeline: {
      expected: "July-August 2025",
      lastYear: "August 15, 2024",
      note: "Amazon OA can come anytime",
    },
    preparation: {
      roadmap: "DSA → System Design → Leadership Principles → Mock Interviews",
      topics: {
        mustDo: ["Graphs", "DP", "Greedy", "Two Pointers"],
        aptitude: {
          quantitative: ["Profit Loss", "Time Work", "Pipes Cisterns"],
          logical: ["Pattern Recognition", "Seating Arrangement"],
          verbal: ["Reading Comprehension", "Sentence Completion"],
        },
        coreSubjects: {
          os: ["Processes", "Deadlock", "Memory Management"],
          dbms: ["Normalization", "Indexing", "Transactions"],
          oops: ["Polymorphism", "Inheritance", "SOLID"],
        },
        advanced: {
          systemDesign: ["Design Amazon", "Load Balancer", "LRU Cache"],
          csConcepts: ["CAP Theorem", "Microservices", "Distributed Systems"],
        },
      },
      dailyPlanGuide: "4hr DSA + 2hr System Design + 1hr LP",
    },
    resources: {
      youtube: [
        {
          title: "NeetCode Amazon Playlist",
          link: "https://youtube.com/playlist?list=PLotXMRnH91bAkKEDdwZwKeK4CAcS-8jTw",
        },
        { title: "Anti Akshay Amazon", link: "https://youtube.com/watch?v=example" },
      ],
      coding: [
        { platform: "LeetCode", link: "https://leetcode.com/company/amazon/" },
        { platform: "GFG Amazon", link: "https://geeksforgeeks.org/amazon-sde-sheet/" },
      ],
      aptitude: [{ platform: "IndiaBIX", link: "https://indiabix.com" }],
    },
    cutoff: {
      coding: "1/2 correct with optimal",
      aptitude: "85%",
      note: "No sectional cutoff",
    },
    strategy: {
      finalTips: [
        "Follow LP in every answer",
        "Think aloud during coding",
        "Ask clarifying questions",
      ],
      mistakesToAvoid: [
        "Don't argue with interviewer",
        "No brute force accepted",
        "Don't forget edge cases",
      ],
    },
    aiFeatures: {
      resumeTips: "Use action verbs, quantify achievements, include AWS/ML projects",
      interviewQuestions: ["Design TinyURL", "LRU Cache", "Why Amazon?"],
      aiPromptSuggestion: "Generate Amazon LP behavioral examples",
    },
  },

  tcs: {
    name: "tcs",
    overview: {
      name: "Tata Consultancy Services",
      tagline: "Experience the Power of One TCS.",
      description: "TCS is an IT services, consulting and business solutions organization.",
      industry: "IT Services, Consulting",
      headquarters: "Mumbai, Maharashtra, India",
    },
    hiring: {
      pattern: [
        { round: "TCS NQT", details: "Foundation + Advanced (Coding + Aptitude)" },
        { round: "Technical Interview", details: "DSA + Core Subjects" },
        { round: "Managerial Round", details: "Communication + HR" },
      ],
      difficulty: "Easy",
      importantPoints: ["NQT valid 2 years", "Digital profile higher package"],
    },
    salary: {
      average: "₹7-9 LPA",
      intern: "₹60k monthly",
      bonus: "Variable",
    },
    examTimeline: {
      expected: "March-April 2025",
      lastYear: "March 2024",
      note: "Multiple slots throughout year",
    },
    preparation: {
      roadmap: "NQT Practice → Basic DSA → Communication",
      topics: {
        mustDo: ["Arrays", "Strings", "Sorting"],
        aptitude: {
          quantitative: ["Number Series", "Time Speed", "Percentage"],
          logical: ["Blood Relations", "Coding Decoding"],
          verbal: ["Synonyms", "Error Spotting"],
        },
        coreSubjects: {
          os: ["CPU Scheduling", "Page Replacement"],
          dbms: ["SQL Queries", "Keys"],
          oops: ["Classes", "Inheritance"],
        },
        advanced: {
          systemDesign: ["Basic", "Database Design"],
          csConcepts: ["Networking Basics"],
        },
      },
      dailyPlanGuide: "3hr Aptitude + 2hr Coding + 1hr English",
    },
    resources: {
      youtube: [
        { title: "TCS NQT by Apna College", link: "https://youtube.com/playlist?list=example" },
        { title: "Face Prep TCS", link: "https://youtube.com/watch?v=example" },
      ],
      coding: [
        { platform: "PrepInsta TCS", link: "https://prepinsta.com/tcs/" },
        { platform: "GFG TCS", link: "https://geeksforgeeks.org/tcs/" },
      ],
      aptitude: [
        { platform: "Testbook", link: "https://testbook.com" },
        { platform: "FacePrep", link: "https://faceprep.in" },
      ],
    },
    cutoff: {
      coding: "1/2 easy",
      aptitude: "60%",
      note: "Sectional cutoffs apply",
    },
    strategy: {
      finalTips: [
        "Practice sectional mocks",
        "Time management critical",
        "Speak clearly in interviews",
      ],
      mistakesToAvoid: [
        "Don't skip foundation section",
        "Practice 100+ aptitude questions",
        "Know TCS values",
      ],
    },
    aiFeatures: {
      resumeTips: "Highlight client projects, TCS Ninja/Digital keywords",
      interviewQuestions: ["Reverse String", "Palindrome", "TCS projects?"],
      aiPromptSuggestion: "TCS NQT sectional mocks",
    },
  },

  microsoft: {
    name: "microsoft",
    overview: {
      name: "Microsoft",
      tagline: "Be What's Next.",
      description:
        "Microsoft Corporation is an American multinational technology company producing computer software, consumer electronics, personal computers, and related services.",
      industry: "Software, Cloud, Gaming",
      headquarters: "Redmond, Washington, USA",
    },
    hiring: {
      pattern: [
        { round: "Online Assessment", details: "3 DSA questions" },
        { round: "Technical Round 1", details: "Coding + Projects" },
        { round: "Technical Round 2", details: "System Design" },
        { round: "HR Round", details: "Behavioral" },
      ],
      difficulty: "Medium",
      importantPoints: ["Love clean code", "Optimal solutions"],
    },
    salary: {
      average: "₹35-50 LPA",
      intern: "₹1.5 LPA monthly",
      bonus: "20% + stocks",
    },
    examTimeline: {
      expected: "May-June 2025",
      lastYear: "June 2024",
      note: "Campus + off-campus both",
    },
    preparation: {
      roadmap: "DSA → Projects → System Design",
      topics: {
        mustDo: ["DP", "Graphs", "Trees"],
        aptitude: {
          quantitative: ["Permutations", "Probability"],
          logical: ["Puzzles"],
          verbal: ["Comprehensions"],
        },
        coreSubjects: {
          os: ["Threads", "Synchronization"],
          dbms: ["Sharding", "Replication"],
          oops: ["Design Patterns"],
        },
        advanced: {
          systemDesign: ["Design Twitter", "URL Shortener"],
          csConcepts: ["Compilers", "OS Internals"],
        },
      },
      dailyPlanGuide: "4hr LeetCode + 2hr Projects",
    },
    resources: {
      youtube: [
        {
          title: "NeetCode Microsoft",
          link: "https://youtube.com/playlist?list=PLot-XmrnH91bAkKEDdwZwKeK4CAcS-8jTw",
        },
      ],
      coding: [{ platform: "LeetCode Microsoft", link: "https://leetcode.com/company/microsoft/" }],
      aptitude: [
        { platform: "IndiaBIX Puzzles", link: "https://indiabix.com/logical-reasoning/puzzles/" },
      ],
    },
    cutoff: {
      coding: "2/3 correct",
      aptitude: "80%",
      note: "No sectional",
    },
    strategy: {
      finalTips: [
        "Explain your approach clearly",
        "Handle all test cases",
        "Know your projects deeply",
      ],
      mistakesToAvoid: [
        "Don't jump to code",
        "Practice medium-hard problems",
        "Optimize time/space",
      ],
    },
    aiFeatures: {
      resumeTips: "GitHub links, open source contributions",
      interviewQuestions: ["K Closest Points", "LFU Cache", "Why Microsoft?"],
      aiPromptSuggestion: "Microsoft SDE behavioral questions",
    },
  },

  wipro: {
    name: "wipro",
    overview: {
      name: "Wipro",
      tagline: "Innovate with Wipro.",
      description:
        "Wipro Limited is a leading global information technology, consulting and business process services company.",
      industry: "IT Services, Consulting, BPO",
      headquarters: "Bengaluru, Karnataka, India",
    },
    hiring: {
      pattern: [
        { round: "Wipro NLTH", details: "Online Assessment (Aptitude + Coding + Essay)" },
        { round: "Technical Interview", details: "DSA + Projects + Core Subjects" },
        { round: "HR Interview", details: "Communication + Background" },
      ],
      difficulty: "Easy",
      importantPoints: [
        "Essay writing important",
        "Basic DSA sufficient",
        "Wipro Elite NLTH higher package",
      ],
    },
    salary: {
      average: "₹6.5-8 LPA",
      intern: "₹50k monthly",
      bonus: "10-15%",
    },
    examTimeline: {
      expected: "Feb-March 2025",
      lastYear: "March 2024",
      note: "Multiple drives yearly",
    },
    preparation: {
      roadmap: "Aptitude → Basic Coding → Communication",
      topics: {
        mustDo: ["Arrays", "Strings", "Basic DP"],
        aptitude: {
          quantitative: ["Time Work", "Probability", "Simple Interest"],
          logical: ["Syllogism", "Data Sufficiency"],
          verbal: ["Para Jumbles", "Fill in Blanks"],
        },
        coreSubjects: {
          os: ["Semaphores", "Scheduling"],
          dbms: ["Joins", "Constraints"],
          oops: ["Abstraction", "Encapsulation"],
        },
        advanced: {
          systemDesign: ["Basic Web App"],
          csConcepts: ["OSI Model"],
        },
      },
      dailyPlanGuide: "2hr Aptitude + 2hr Coding + 1hr Essay Practice",
    },
    resources: {
      youtube: [
        { title: "Wipro NLTH by Adda247", link: "https://youtube.com/watch?v=wipro_nlth" },
        { title: "PrepInsta Wipro", link: "https://youtube.com/playlist?list=wipro" },
      ],
      coding: [
        { platform: "PrepInsta Wipro", link: "https://prepinsta.com/wipro/" },
        { platform: "GFG Wipro", link: "https://geeksforgeeks.org/wipro/" },
      ],
      aptitude: [{ platform: "IndiaBIX", link: "https://indiabix.com/aptitude/wipro/" }],
    },
    cutoff: {
      coding: "1/3 correct",
      aptitude: "60%",
      note: "Sectional cutoffs",
    },
    strategy: {
      finalTips: [
        "Practice essay writing (150-200 words)",
        "Know company values",
        "Clear communication",
      ],
      mistakesToAvoid: [
        "Don't neglect aptitude",
        "Prepare essay topics",
        "Basic coding only needed",
      ],
    },
    aiFeatures: {
      resumeTips: "Include BPO/Testing experience, Wipro keywords",
      interviewQuestions: ["Anagram Check", "FizzBuzz", "Why Wipro?"],
      aiPromptSuggestion: "Wipro essay topics + aptitude questions",
    },
  },

  hcltech: {
    name: "hcltech",
    overview: {
      name: "HCL Technologies",
      tagline: "Building Tomorrow's Enterprise Today",
      description:
        "HCLTech is a global technology company focused on creating industry-leading solutions grounded in Engineering and powered by AI.",
      industry: "IT Services, Engineering, R&D",
      headquarters: "Noida, Uttar Pradesh, India",
    },
    hiring: {
      pattern: [
        { round: "Cognitive Assessment", details: "Aptitude + Reasoning + English" },
        { round: "Technical + Coding", details: "MCQ + 2 Coding questions" },
        { round: "Technical Interview", details: "DSA + Projects" },
        { round: "HR Round", details: "Final discussion" },
      ],
      difficulty: "Medium",
      importantPoints: ["HCL Tech Bee program", "Good for freshers"],
    },
    salary: {
      average: "₹6-7.5 LPA",
      intern: "₹45k monthly",
      bonus: "Variable",
    },
    examTimeline: {
      expected: "April-May 2025",
      lastYear: "April 2024",
      note: "Regular campus hiring",
    },
    preparation: {
      roadmap: "Cognitive → Coding → Technical Prep",
      topics: {
        mustDo: ["LinkedList", "Stacks", "Queues"],
        aptitude: {
          quantitative: ["Ratios", "Geometry", "Data Interpretation"],
          logical: ["Statement Assumption", "Course Action"],
          verbal: ["Sentence Improvement", "Comprehension"],
        },
        coreSubjects: {
          os: ["Virtual Memory", "File Systems"],
          dbms: ["ER Diagrams", "Stored Procedures"],
          oops: ["Interfaces", "Exception Handling"],
        },
        advanced: {
          systemDesign: ["REST API Design"],
          csConcepts: ["TCP/IP"],
        },
      },
      dailyPlanGuide: "3hr Test Pattern + 2hr DSA",
    },
    resources: {
      youtube: [
        { title: "HCL Full Stack by SDE Tiger", link: "https://youtube.com/playlist?list=hcl" },
      ],
      coding: [
        { platform: "FacePrep HCL", link: "https://faceprep.in/hcl/" },
        { platform: "Testbook HCL", link: "https://testbook.com/hcl/" },
      ],
      aptitude: [{ platform: "Freshersworld", link: "https://www.freshersworld.com/" }],
    },
    cutoff: {
      coding: "1/2 correct",
      aptitude: "65%",
      note: "Section-wise elimination",
    },
    strategy: {
      finalTips: [
        "Know HCL products (MEOT, etc)",
        "Practice sectional timing",
        "Project discussion ready",
      ],
      mistakesToAvoid: ["Don't skip reasoning", "Medium DSA enough", "Prepare company research"],
    },
    aiFeatures: {
      resumeTips: "HCL Tech Bee mention, engineering projects",
      interviewQuestions: ["Reverse LinkedList", "Valid Parenthesis", "HCL projects?"],
      aiPromptSuggestion: "HCL cognitive test pattern",
    },
  },

  mahindra: {
    name: "mahindra",
    overview: {
      name: "Mahindra & Mahindra",
      tagline: "Rise for Good",
      description:
        "Mahindra & Mahindra Limited is an Indian multinational automotive manufacturing corporation headquartered in Mumbai, Maharashtra, India.",
      industry: "Automotive, IT, Farm Equipment",
      headquarters: "Mumbai, Maharashtra, India",
    },
    hiring: {
      pattern: [
        { round: "Online Test", details: "Aptitude + Technical MCQ" },
        { round: "Technical Interview", details: "Core + Coding" },
        { round: "HR Round", details: "Final selection" },
      ],
      difficulty: "Medium",
      importantPoints: ["Multiple domains", "Good package"],
    },
    salary: {
      average: "₹8-12 LPA",
      intern: "₹60k monthly",
      bonus: "15%",
    },
    examTimeline: {
      expected: "June-July 2025",
      lastYear: "July 2024",
      note: "Domain-specific hiring",
    },
    preparation: {
      roadmap: "Aptitude → Domain Knowledge → Coding",
      topics: {
        mustDo: ["Sorting", "Searching", "Recursion"],
        aptitude: {
          quantitative: ["Mensuration", "Profit Loss"],
          logical: ["Puzzles", "Series"],
          verbal: ["RC", "Grammar"],
        },
        coreSubjects: {
          os: ["Process Management"],
          dbms: ["Triggers", "Views"],
          oops: ["Constructors", "Overloading"],
        },
        advanced: {
          systemDesign: ["Automotive Systems"],
          csConcepts: ["Embedded Systems"],
        },
      },
      dailyPlanGuide: "Domain + Aptitude + Coding",
    },
    resources: {
      youtube: [
        { title: "Mahindra Tech by Gate Smashers", link: "https://youtube.com/watch?v=mahindra" },
      ],
      coding: [{ platform: "GFG Mahindra", link: "https://geeksforgeeks.org/mahindra/" }],
      aptitude: [{ platform: "CareerRide", link: "https://www.careerride.com/" }],
    },
    cutoff: {
      coding: "No coding round usually",
      aptitude: "70%",
      note: "Technical MCQ heavy",
    },
    strategy: {
      finalTips: ["Know automotive domain", "Strong fundamentals", "Company values"],
      mistakesToAvoid: [
        "Don't ignore technical MCQ",
        "Branch-specific prep",
        "Resume domain projects",
      ],
    },
    aiFeatures: {
      resumeTips: "Automotive projects, Mahindra Rise keywords",
      interviewQuestions: ["Bubble Sort", "SQL Queries", "Why Mahindra?"],
      aiPromptSuggestion: "Mahindra technical MCQ practice",
    },
  },

  cognizant: {
    name: "cognizant",
    overview: {
      name: "Cognizant",
      tagline: "Be Cognizant of Greatness",
      description:
        "Cognizant is one of the world's leading professional services companies, helping clients to modernize technology and maximize operating efficiency.",
      industry: "IT Services, Consulting, Digital Engineering",
      headquarters: "Teaneck, New Jersey, USA (India HQ: Chennai)",
    },
    hiring: {
      pattern: [
        { round: "GenC Assessment", details: "Aptitude + Automation Testing + Coding" },
        { round: "Communication Assessment", details: "Speaking + Listening" },
        { round: "Technical + HR Interview", details: "Technical + Behavioral" },
      ],
      difficulty: "Easy-Medium",
      importantPoints: ["GenC/GenC Elevate/GenC Pro profiles", "Communication round crucial"],
    },
    salary: {
      average: "₹4.5-6.5 LPA (GenC)",
      intern: "₹40k monthly",
      bonus: "10%",
    },
    examTimeline: {
      expected: "Jan-Feb 2025",
      lastYear: "Feb 2024",
      note: "Mass hiring, multiple slots",
    },
    preparation: {
      roadmap: "GenC Test → Communication → Basic Tech",
      topics: {
        mustDo: ["Basic Coding", "Automation Concepts"],
        aptitude: {
          quantitative: ["Number System", "Averages"],
          logical: ["Data Interpretation", "Logical Puzzles"],
          verbal: ["Sentence Correction", "Vocab"],
        },
        coreSubjects: {
          os: ["Basic Concepts"],
          dbms: ["Basic SQL"],
          oops: ["Basic Java/Python"],
        },
        advanced: {
          systemDesign: "N/A",
          csConcepts: ["Selenium Basics"],
        },
      },
      dailyPlanGuide: "2hr GenC Practice + 1hr Communication",
    },
    resources: {
      youtube: [
        {
          title: "Cognizant GenC by Naresh iTech",
          link: "https://youtube.com/playlist?list=cognizant_genc",
        },
      ],
      coding: [{ platform: "PrepInsta Cognizant", link: "https://prepinsta.com/cognizant/" }],
      aptitude: [
        { platform: "IndiaBIX Cognizant", link: "https://indiabix.com/aptitude/cognizant/" },
      ],
    },
    cutoff: {
      coding: "1/1 basic",
      aptitude: "55-60%",
      note: "No negative marking",
    },
    strategy: {
      finalTips: [
        "Practice communication round",
        "Know Cognizant profiles",
        "Basic coding sufficient",
      ],
      mistakesToAvoid: [
        "Don't skip communication prep",
        "Profile selection important",
        "Know GenC differences",
      ],
    },
    aiFeatures: {
      resumeTips: "Cognizant GenC keywords, fresher-friendly",
      interviewQuestions: ["Prime Numbers", "String Reverse", "Why Cognizant?"],
      aiPromptSuggestion: "GenC communication assessment",
    },
  },

  apple: {
    name: "apple",
    overview: {
      name: "Apple",
      tagline: "Think Different.",
      description:
        "Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.",
      industry: "Consumer Electronics, Software",
      headquarters: "Cupertino, California, USA",
    },
    hiring: {
      pattern: [
        { round: "Initial Screening", details: "Technical MCQ + Coding" },
        {
          round: "Technical Interviews (3-5)",
          details: "Deep Dive into OS, Memory, and Swift/C++",
        },
        { round: "Design Round", details: "Low Level Design + System Design" },
      ],
      difficulty: "Very Hard",
      importantPoints: ["Privacy focused mindset", "Focus on hardware-software integration"],
    },
    salary: {
      average: "₹55-90 LPA",
      intern: "₹2.0-2.5 LPA monthly",
      bonus: "RSUs + Annual Bonus",
    },
    examTimeline: {
      expected: "September-October 2025",
      lastYear: "October 2024",
      note: "Highly referral based",
    },
    preparation: {
      roadmap: "OS Internals → C++/Swift → Advanced DSA → Design",
      topics: {
        mustDo: ["Memory Management", "Concurrency", "Pointers"],
        aptitude: {
          quantitative: ["Statistics", "Geometry"],
          logical: ["Spatial Reasoning"],
          verbal: ["Technical Writing"],
        },
        coreSubjects: {
          os: ["Kernel", "File Systems", "Interrupts"],
          dbms: ["SQLite", "Data Persistence"],
          oops: ["Memory Leaks", "Protocol Oriented Programming"],
        },
        advanced: {
          systemDesign: ["On-device AI", "Sync Protocols"],
          csConcepts: ["Compiler Optimization"],
        },
      },
      dailyPlanGuide: "3hr Low-Level Coding + 2hr OS + 2hr DSA",
    },
    resources: {
      youtube: [{ title: "Apple Interview Experience", link: "https://youtube.com/apple_prep" }],
      coding: [{ platform: "LeetCode Apple", link: "https://leetcode.com/company/apple/" }],
      aptitude: [{ platform: "Brilliant.org", link: "https://brilliant.org" }],
    },
    cutoff: {
      coding: "Strictly Optimal",
      aptitude: "90%",
      note: "Hardware knowledge preferred for some roles",
    },
    strategy: {
      finalTips: ["Know Apple's Ecosystem", "Focus on Efficiency"],
      mistakesToAvoid: ["Ignoring Memory Constraints", "Vague answers"],
    },
    aiFeatures: {
      resumeTips: "Showcase iOS/macOS apps, CoreML projects",
      interviewQuestions: ["Design a Battery Optimizer", "Reverse a String in-place"],
      aiPromptSuggestion: "Apple hardware-software interview questions",
    },
  },

  goldmanSachs: {
    name: "goldmanSachs",
    overview: {
      name: "Goldman Sachs",
      tagline: "Progress is Everyone’s Business.",
      description:
        "A leading global investment banking, securities, and investment management firm.",
      industry: "Investment Banking, FinTech",
      headquarters: "New York, USA",
    },
    hiring: {
      pattern: [
        { round: "Aptitude Test", details: "Numerical, Verbal, Abstract Reasoning" },
        { round: "Technical Test", details: "Maths + Coding (2-3 questions)" },
        { round: "Interviews (3-4)", details: "DSA + Math + Finance Basics" },
      ],
      difficulty: "Hard",
      importantPoints: ["Math/Statistics heavy", "Focus on mental math"],
    },
    salary: {
      average: "₹30-50 LPA",
      intern: "₹1.0 LPA monthly",
      bonus: "High performance-based bonus",
    },
    examTimeline: {
      expected: "July-August 2025",
      lastYear: "August 2024",
      note: "Summer Analyst programs are popular",
    },
    preparation: {
      roadmap: "Probability → DSA → Puzzles → Finance Basics",
      topics: {
        mustDo: ["DP", "Recursion", "Probability"],
        aptitude: {
          quantitative: ["Number Theory", "Permutations"],
          logical: ["Matrix Puzzles"],
          verbal: ["Business English"],
        },
        coreSubjects: {
          os: ["Multi-threading"],
          dbms: ["SQL Optimization"],
          oops: ["Java Internals"],
        },
        advanced: {
          systemDesign: ["High-frequency Trading Systems"],
          csConcepts: ["Distributed Caching"],
        },
      },
      dailyPlanGuide: "2hr Maths + 3hr DSA + 1hr Finance",
    },
    resources: {
      youtube: [{ title: "Goldman Sachs Prep by GFG", link: "https://youtube.com/gs_prep" }],
      coding: [{ platform: "HackerRank GS", link: "https://hackerrank.com/goldman-sachs" }],
      aptitude: [{ platform: "IndiaBIX Math", link: "https://indiabix.com" }],
    },
    cutoff: {
      coding: "1.5/2 correct",
      aptitude: "80%",
      note: "Maths score is crucial",
    },
    strategy: {
      finalTips: ["Brush up on Probability", "Be quick with numbers"],
      mistakesToAvoid: ["Slow calculations", "Ignoring HR questions"],
    },
    aiFeatures: {
      resumeTips: "Fintech projects, Math Olympiad achievements",
      interviewQuestions: ["Probability of picking 2 red balls", "Trapping Rainwater"],
      aiPromptSuggestion: "Goldman Sachs math puzzles",
    },
  },

  meta: {
    name: "meta",
    overview: {
      name: "Meta",
      tagline: "Move Fast.",
      description:
        "Meta builds technologies that help people connect, find communities, and grow businesses.",
      industry: "Social Media, VR/AR, AI",
      headquarters: "Menlo Park, California, USA",
    },
    hiring: {
      pattern: [
        { round: "Recruiter Screen", details: "Basic background check" },
        { round: "Technical Screening", details: "2 DSA questions (45 mins)" },
        { round: "Onsite (4-5 rounds)", details: "Coding, System Design, Behavioral" },
      ],
      difficulty: "Hard",
      importantPoints: ["Speed is everything", "Focus on LeetCode Meta-tagged"],
    },
    salary: {
      average: "₹60-90 LPA",
      intern: "₹1.8-2.2 LPA monthly",
      bonus: "15% + high RSUs",
    },
    examTimeline: {
      expected: "August-September 2025",
      lastYear: "September 2024",
      note: "Regular off-campus hiring",
    },
    preparation: {
      roadmap: "LeetCode (Meta Tagged) → System Design → Behavioral",
      topics: {
        mustDo: ["Arrays", "Strings", "Trees", "BFS/DFS"],
        aptitude: {
          quantitative: ["N/A"],
          logical: ["Product Logic"],
          verbal: ["N/A"],
        },
        coreSubjects: {
          os: ["Threads"],
          dbms: ["Sharding", "NoSQL"],
          oops: ["Design Patterns"],
        },
        advanced: {
          systemDesign: ["Design Instagram", "Messenger", "NewsFeed"],
          csConcepts: ["GraphQL", "React Internals"],
        },
      },
      dailyPlanGuide: "4hr Meta-tagged LC + 2hr System Design",
    },
    resources: {
      youtube: [{ title: "Meta Interview Prep", link: "https://youtube.com/meta_prep" }],
      coding: [{ platform: "LeetCode Meta", link: "https://leetcode.com/company/facebook/" }],
      aptitude: [{ platform: "N/A", link: "" }],
    },
    cutoff: {
      coding: "2/2 correct with full explanation",
      aptitude: "N/A",
      note: "High bar for behavioral (Leadership)",
    },
    strategy: {
      finalTips: ["Solve 2 mediums in 35 mins", "Know Meta values"],
      mistakesToAvoid: ["Over-complicating design", "Moving too slow"],
    },
    aiFeatures: {
      resumeTips: "Open source (React/PyTorch), High scale apps",
      interviewQuestions: ["LCA of Binary Tree", "Product of Array Except Self"],
      aiPromptSuggestion: "Meta behavioral interview questions",
    },
  },

  adobe: {
    name: "adobe",
    overview: {
      name: "Adobe",
      tagline: "Changing the world through digital experiences.",
      description: "Global leader in digital media and digital marketing solutions.",
      industry: "Software, Design Tools",
      headquarters: "San Jose, California, USA",
    },
    hiring: {
      pattern: [
        { round: "Online Test", details: "Aptitude + Technical + Coding" },
        { round: "Technical Interviews (2-3)", details: "DSA + OOPS + OS" },
        { round: "HR Round", details: "Culture fit" },
      ],
      difficulty: "Hard",
      importantPoints: ["Strong focus on C++/Java", "Deep core subject knowledge"],
    },
    salary: {
      average: "₹35-50 LPA",
      intern: "₹1.0 LPA monthly",
      bonus: "10-15% + Stock options",
    },
    examTimeline: {
      expected: "August-October 2025",
      lastYear: "September 2024",
      note: "Adobe SheCodes is a major entry point",
    },
    preparation: {
      roadmap: "C++ Fundamentals → DSA → OS → Core Subjects",
      topics: {
        mustDo: ["LinkedList", "DP", "Strings"],
        aptitude: {
          quantitative: ["Time & Distance", "Work"],
          logical: ["Syllogisms"],
          verbal: ["Grammar"],
        },
        coreSubjects: {
          os: ["Paging", "Deadlock"],
          dbms: ["SQL Joins", "Indexing"],
          oops: ["Virtual Functions", "Abstract Classes"],
        },
        advanced: {
          systemDesign: ["Image Processing Basics", "Cloud PDF"],
          csConcepts: ["Computer Graphics Basics"],
        },
      },
      dailyPlanGuide: "3hr DSA + 2hr Core Subjects",
    },
    resources: {
      youtube: [{ title: "Adobe Prep by Codehelp", link: "https://youtube.com/adobe_prep" }],
      coding: [{ platform: "LeetCode Adobe", link: "https://leetcode.com/company/adobe/" }],
      aptitude: [{ platform: "Indiabix", link: "https://indiabix.com" }],
    },
    cutoff: {
      coding: "1/2 Hard or 2/2 Medium",
      aptitude: "75%",
      note: "Good performance in MCQ is mandatory",
    },
    strategy: {
      finalTips: ["Focus on Memory Management", "Practice bitwise"],
      mistakesToAvoid: ["Ignoring MCQs", "Weak OS fundamentals"],
    },
    aiFeatures: {
      resumeTips: "Creative tech projects, C++ expertise",
      interviewQuestions: ["Reverse words in a string", "Check if tree is BST"],
      aiPromptSuggestion: "Adobe SheCodes interview patterns",
    },
  },
  // Isko apne existing companyData object ke andar add karein
  google: {
    name: "google",
    overview: {
      name: "Google",
      tagline: "Do the right thing.",
      description:
        "Google is a global leader in search, advertising, cloud computing, and hardware, driven by a mission to organize the world's information.",
      industry: "Internet, Cloud, AI",
      headquarters: "Mountain View, California, USA",
    },
    hiring: {
      pattern: [
        { round: "Online Challenge", details: "2 Coding questions (LeetCode Hard level)" },
        { round: "Technical Phone Screen", details: "1-2 Coding questions + Time Complexity" },
        {
          round: "Onsite Rounds (4-5)",
          details: "Coding, Googleyness (Behavioral), System Design",
        },
      ],
      difficulty: "Very Hard",
      importantPoints: ["Strong focus on DS/Algo", "Code quality matters", "Googleyness is key"],
    },
    salary: {
      average: "₹50-80 LPA",
      intern: "₹1.5-2 LPA monthly",
      bonus: "15% + high equity RSUs",
    },
    examTimeline: {
      expected: "August-September 2025",
      lastYear: "September 2024",
      note: "Off-campus via Google Girl Hackathon or Referral",
    },
    preparation: {
      roadmap: "Advanced DSA → Graphs/DP → System Design → Googleyness",
      topics: {
        mustDo: ["Tries", "Segment Trees", "Dynamic Programming", "Bitmasking"],
        aptitude: {
          quantitative: ["Probability", "Combinatorics"],
          logical: ["Advanced Puzzles"],
          verbal: ["Comprehension"],
        },
        coreSubjects: {
          os: ["Concurrency", "Virtualization"],
          dbms: ["NoSQL", "Consistency Models"],
          oops: ["Design Patterns", "Clean Code"],
        },
        advanced: {
          systemDesign: ["Scalability", "Distributed Hash Tables"],
          csConcepts: ["Networking Layers"],
        },
      },
      dailyPlanGuide: "5hr DSA + 1hr System Design + 30min Puzzles",
    },
    resources: {
      youtube: [
        {
          title: "Google Interview Prep by Striver",
          link: "https://youtube.com/playlist?list=google_prep",
        },
      ],
      coding: [{ platform: "LeetCode Google", link: "https://leetcode.com/company/google/" }],
      aptitude: [
        { platform: "Google Kickstart", link: "https://codingcompetitions.withgoogle.com/" },
      ],
    },
    cutoff: {
      coding: "2/2 correct (All test cases)",
      aptitude: "N/A",
      note: "Heavy weightage on optimization",
    },
    strategy: {
      finalTips: ["Think out loud", "Focus on space/time complexity", "Be humble"],
      mistakesToAvoid: ["Not testing edge cases", "Silent coding", "Brute force only"],
    },
    aiFeatures: {
      resumeTips: "Open source, GSOC, Competitive Programming ranks",
      interviewQuestions: ["Median of two sorted arrays", "Design Search Autocomplete"],
      aiPromptSuggestion: "Googleyness interview scenarios",
    },
  },

  accenture: {
    name: "accenture",
    overview: {
      name: "Accenture",
      tagline: "High performance. Delivered.",
      description:
        "A professional services company providing strategy, consulting, digital, technology and operations services.",
      industry: "Consulting, IT Services",
      headquarters: "Dublin, Ireland",
    },
    hiring: {
      pattern: [
        {
          round: "Cognitive & Technical",
          details: "English, Critical Reasoning, MS Office, Pseudocode",
        },
        { round: "Coding", details: "2 questions (Easy-Medium)" },
        { round: "Communication", details: "Sentence Mastery, Listening" },
        { round: "Interview", details: "Technical + HR" },
      ],
      difficulty: "Medium",
      importantPoints: ["Pseudocode section is unique", "Communication round is eliminatory"],
    },
    salary: {
      average: "₹4.5 - 6.5 LPA",
      intern: "₹30-45k monthly",
      bonus: "Variable Pay",
    },
    examTimeline: {
      expected: "August-October 2025",
      lastYear: "August 2024",
      note: "Continuous hiring drives",
    },
    preparation: {
      roadmap: "Aptitude → Pseudocode → Basic DSA → Communication",
      topics: {
        mustDo: ["Arrays", "Bit Manipulation", "Recursion"],
        aptitude: {
          quantitative: ["Percentage", "Averages", "Speed Time"],
          logical: ["Venn Diagrams", "Visual Reasoning"],
          verbal: ["Grammar", "Tenses"],
        },
        coreSubjects: {
          os: ["Basics"],
          dbms: ["SQL Queries"],
          oops: ["C++/Java Basics"],
        },
        advanced: {
          systemDesign: "Basic SDLC",
          csConcepts: ["Cloud Computing Basics", "MS Office"],
        },
      },
      dailyPlanGuide: "2hr Aptitude + 1hr Pseudocode + 1hr Coding",
    },
    resources: {
      youtube: [
        { title: "Accenture Preparation by PrepInsta", link: "https://youtube.com/accenture" },
      ],
      coding: [{ platform: "GFG Accenture", link: "https://geeksforgeeks.org/accenture/" }],
      aptitude: [{ platform: "Indiabix", link: "https://indiabix.com" }],
    },
    cutoff: {
      coding: "1/2 correct",
      aptitude: "70%",
      note: "Sectional cutoffs exist",
    },
    strategy: {
      finalTips: ["Practice MS Office MCQs", "Speak clearly in comms round"],
      mistakesToAvoid: ["Ignoring Pseudocode", "Weak grammar in communication"],
    },
    aiFeatures: {
      resumeTips: "Certification in Cloud/AI, Teamwork projects",
      interviewQuestions: ["Fibonacci Series", "SQL Joins", "Project Role"],
      aiPromptSuggestion: "Accenture Pseudocode practice questions",
    },
  },

  infosys: {
    name: "infosys",
    overview: {
      name: "Infosys",
      tagline: "Navigate Your Next",
      description: "A global leader in next-generation digital services and consulting.",
      industry: "IT Services",
      headquarters: "Bengaluru, India",
    },
    hiring: {
      pattern: [
        { round: "InfyTQ / HackWithInfy", details: "Coding focused assessment" },
        { round: "Certification Round", details: "Java/Python + DBMS MCQ" },
        { round: "Interview", details: "Technical + Behavioral" },
      ],
      difficulty: "Medium",
      importantPoints: ["SP and DSE roles offer higher packages", "Coding accuracy is vital"],
    },
    salary: {
      average: "₹3.6 - 9.5 LPA",
      intern: "₹25-50k monthly",
      bonus: "Performance linked",
    },
    examTimeline: {
      expected: "January-March 2025",
      lastYear: "February 2024",
      note: "InfyTQ usually starts early in the year",
    },
    preparation: {
      roadmap: "Java/Python Mastery → DBMS → DSA → Mocks",
      topics: {
        mustDo: ["Searching", "Sorting", "Trees"],
        aptitude: {
          quantitative: ["Probability", "Permutations"],
          logical: ["Data Sufficiency"],
          verbal: ["Critical Reasoning"],
        },
        coreSubjects: {
          os: ["Memory Management"],
          dbms: ["Normalization", "NoSQL"],
          oops: ["Advanced OOPS in Java/Python"],
        },
        advanced: {
          systemDesign: "Architecture Basics",
          csConcepts: ["SDLC Models"],
        },
      },
      dailyPlanGuide: "3hr Programming + 2hr Core Subjects",
    },
    resources: {
      youtube: [{ title: "Infosys DSE Prep", link: "https://youtube.com/infosys_prep" }],
      coding: [{ platform: "InfyTQ Portal", link: "https://infytq.onwingspan.com/" }],
      aptitude: [{ platform: "PrepInsta", link: "https://prepinsta.com/infosys/" }],
    },
    cutoff: {
      coding: "2/3 for DSE role",
      aptitude: "65%",
      note: "Sectional cutoff for Aptitude",
    },
    strategy: {
      finalTips: ["Master one language (Java/Python)", "Focus on DBMS"],
      mistakesToAvoid: ["Lack of SQL knowledge", "Ignoring internal InfyTQ syllabus"],
    },
    aiFeatures: {
      resumeTips: "Python/Java certifications, Full stack projects",
      interviewQuestions: ["Deadlock vs Starvation", "Inheritance in Python"],
      aiPromptSuggestion: "Infosys DSE coding patterns",
    },
  },
  uber: {
    name: "uber",
    overview: {
      name: "Uber",
      tagline: "Go anywhere, get anything.",
      description:
        "Uber is a technology provider that matches riders with drivers, and customers with restaurants and delivery service providers.",
      industry: "Mobility, Logistics",
      headquarters: "San Francisco, California, USA",
    },
    hiring: {
      pattern: [
        { round: "Coding Test", details: "3 Questions (Hard)" },
        { round: "Technical Interviews (3)", details: "DSA + Deep System Design" },
        { round: "Bar Raiser", details: "Cultural Fitment" },
      ],
      difficulty: "Very Hard",
      importantPoints: ["Concurrency is key", "Architecture focused"],
    },
    salary: { average: "₹40-65 LPA", intern: "₹1.6 LPA monthly", bonus: "Variable + Stocks" },
    examTimeline: {
      expected: "August-October 2025",
      lastYear: "August 2024",
      note: "Referrals work best",
    },
    preparation: {
      roadmap: "Advanced DSA → High Level Design → LLD",
      topics: {
        mustDo: ["Graphs", "DP", "Concurrency"],
        aptitude: {
          quantitative: ["Logistics Math"],
          logical: ["Puzzles"],
          verbal: ["Business English"],
        },
        coreSubjects: {
          os: ["Multithreading"],
          dbms: ["PostgreSQL", "Scaling"],
          oops: ["SOLID Principles"],
        },
        advanced: {
          systemDesign: ["Design Uber", "Location Tracking"],
          csConcepts: ["Distributed Systems"],
        },
      },
      dailyPlanGuide: "4hr DSA + 2hr System Design",
    },
    resources: {
      youtube: [{ title: "Uber Engineering Blog", link: "https://eng.uber.com/" }],
      coding: [{ platform: "LeetCode Uber", link: "https://leetcode.com/company/uber/" }],
      aptitude: [{ platform: "GeeksforGeeks", link: "https://geeksforgeeks.org" }],
    },
    cutoff: { coding: "2/3 Correct", aptitude: "85%", note: "Optimization matters most" },
    strategy: {
      finalTips: ["Focus on Scalability", "Clear communication"],
      mistakesToAvoid: ["Ignoring Edge Cases", "Poor Variable Naming"],
    },
    aiFeatures: {
      resumeTips: "System Design projects, Scalable Apps",
      interviewQuestions: ["Sudoku Solver", "Design Ride Sharing"],
      aiPromptSuggestion: "Uber LLD interview questions",
    },
  },

  netflix: {
    name: "netflix",
    overview: {
      name: "Netflix",
      tagline: "Entertainment Like Nowhere Else.",
      description: "The world's leading streaming entertainment service.",
      industry: "Streaming, Media",
      headquarters: "Los Gatos, California, USA",
    },
    hiring: {
      pattern: [
        { round: "Technical Screen", details: "Coding + Project discussion" },
        { round: "Onsite Rounds", details: "DSA + Advanced System Design" },
        { round: "Culture Round", details: "CEO/Director level alignment" },
      ],
      difficulty: "Very Hard",
      importantPoints: ["High talent density", "Strong focus on Freedom & Responsibility"],
    },
    salary: { average: "₹70-1.2 Cr PA", intern: "₹2.5 LPA monthly", bonus: "Base heavy" },
    examTimeline: { expected: "Rolling", lastYear: "October 2024", note: "Rarely hires freshers" },
    preparation: {
      roadmap: "Experience → Distributed Systems → Culture Memo",
      topics: {
        mustDo: ["Scalability", "Microservices", "Security"],
        aptitude: {
          quantitative: ["N/A"],
          logical: ["Complex scenarios"],
          verbal: ["Cultural Alignment"],
        },
        coreSubjects: {
          os: ["Linux Internals"],
          dbms: ["Cassandra", "NoSQL"],
          oops: ["Architecture Patterns"],
        },
        advanced: { systemDesign: ["Design Netflix", "CDN"], csConcepts: ["Cloud Native"] },
      },
      dailyPlanGuide: "3hr Architecture + 2hr Open Source",
    },
    resources: {
      youtube: [{ title: "Netflix Tech Blog", link: "https://netflixtechblog.com/" }],
      coding: [{ platform: "LeetCode Hard", link: "https://leetcode.com" }],
      aptitude: [{ platform: "N/A", link: "" }],
    },
    cutoff: { coding: "Perfect Score", aptitude: "N/A", note: "Culture fit is everything" },
    strategy: {
      finalTips: ["Read the Culture Memo", "Know Cloud Scalability"],
      mistakesToAvoid: ["Not being candid", "Weak System Design"],
    },
    aiFeatures: {
      resumeTips: "Contributions to Open Source, Cloud Architecture",
      interviewQuestions: ["Design Video Upload", "Why Netflix?"],
      aiPromptSuggestion: "Netflix culture memo analysis",
    },
  },

  zomato: {
    name: "zomato",
    overview: {
      name: "Zomato",
      tagline: "Every meal is a story.",
      description: "Indian multinational restaurant aggregator and food delivery company.",
      industry: "FoodTech, E-commerce",
      headquarters: "Gurgaon, Haryana, India",
    },
    hiring: {
      pattern: [
        { round: "Coding Round", details: "3 Questions (Medium-Hard)" },
        { round: "Technical Round 1", details: "DSA + Development basics" },
        { round: "Technical Round 2", details: "LLD + Project Deep Dive" },
      ],
      difficulty: "Hard",
      importantPoints: ["Tech stack matters (Node/Golang/Swift)", "Fast paced environment"],
    },
    salary: { average: "₹25-45 LPA", intern: "₹60-80k monthly", bonus: "ESOPs" },
    examTimeline: {
      expected: "June-August 2025",
      lastYear: "July 2024",
      note: "Active on LinkedIn",
    },
    preparation: {
      roadmap: "DSA → LLD → Projects (MERN/Native)",
      topics: {
        mustDo: ["Heaps", "DP", "Strings"],
        aptitude: { quantitative: ["Ratios"], logical: ["Puzzles"], verbal: ["English"] },
        coreSubjects: { os: ["Processes"], dbms: ["Redis", "SQL"], oops: ["Object Modelling"] },
        advanced: { systemDesign: ["Delivery Tracking"], csConcepts: ["Caching"] },
      },
      dailyPlanGuide: "3hr DSA + 2hr Project + 1hr LLD",
    },
    resources: {
      youtube: [{ title: "Zomato Tech Talks", link: "https://youtube.com/zomato" }],
      coding: [{ platform: "LeetCode", link: "https://leetcode.com" }],
      aptitude: [{ platform: "IndiaBIX", link: "https://indiabix.com" }],
    },
    cutoff: { coding: "2/3 Correct", aptitude: "75%", note: "No negative marking" },
    strategy: {
      finalTips: ["Be ready with real-world projects", "Strong OOPS"],
      mistakesToAvoid: ["Vague project explanation", "Weak logic in coding"],
    },
    aiFeatures: {
      resumeTips: "Full-stack projects, Hackathon wins",
      interviewQuestions: ["Design Zomato Search", "Rate Limiter"],
      aiPromptSuggestion: "Zomato interview coding questions",
    },
  },

  swiggy: {
    name: "swiggy",
    overview: {
      name: "Swiggy",
      tagline: "Always Delivering.",
      description: "India's leading on-demand convenience platform.",
      industry: "Logistics, FoodTech",
      headquarters: "Bengaluru, Karnataka, India",
    },
    hiring: {
      pattern: [
        { round: "OA", details: "Coding + MCQ" },
        { round: "DS Round", details: "Advanced Algo" },
        { round: "Machine Coding", details: "LLD implementation in 2 hours" },
      ],
      difficulty: "Hard",
      importantPoints: ["Machine coding is eliminatory", "Clean code focus"],
    },
    salary: { average: "₹25-50 LPA", intern: "₹70-90k monthly", bonus: "Variable" },
    examTimeline: {
      expected: "July-September 2025",
      lastYear: "August 2024",
      note: "Campus hiring is active",
    },
    preparation: {
      roadmap: "DSA → Machine Coding (LLD) → System Design",
      topics: {
        mustDo: ["Graphs", "Recursion", "Tries"],
        aptitude: { quantitative: ["Speed"], logical: ["Pattern"], verbal: ["RC"] },
        coreSubjects: { os: ["Sync"], dbms: ["Transactions"], oops: ["Design Patterns"] },
        advanced: { systemDesign: ["Instamart Architecture"], csConcepts: ["Pub/Sub"] },
      },
      dailyPlanGuide: "2hr Machine Coding + 3hr DSA",
    },
    resources: {
      youtube: [{ title: "Swiggy Bytes", link: "https://swiggy.engineering/" }],
      coding: [{ platform: "LeetCode", link: "https://leetcode.com" }],
      aptitude: [{ platform: "PrepInsta", link: "https://prepinsta.com" }],
    },
    cutoff: { coding: "2/2 Correct", aptitude: "80%", note: "Machine coding must run" },
    strategy: {
      finalTips: ["Practice design patterns", "Write modular code"],
      mistakesToAvoid: ["Hardcoding values", "Spaghetti code"],
    },
    aiFeatures: {
      resumeTips: "Scalability, LLD projects",
      interviewQuestions: ["Design Snake & Ladder", "Splitwise"],
      aiPromptSuggestion: "Swiggy machine coding rounds",
    },
  },

  oracle: {
    name: "oracle",
    overview: {
      name: "Oracle",
      tagline: "Integrated Cloud Applications and Platform Services.",
      description:
        "Oracle is a cloud technology company that provides organizations around the world with computing infrastructure and software.",
      industry: "Cloud, Database, ERP",
      headquarters: "Austin, Texas, USA",
    },
    hiring: {
      pattern: [
        { round: "OA", details: "Aptitude + Core + Coding" },
        { round: "Tech Interview 1", details: "DSA + SQL" },
        { round: "Tech Interview 2", details: "System Design + Core" },
      ],
      difficulty: "Medium-Hard",
      importantPoints: ["Focus on Java & SQL", "Good CGPA preferred"],
    },
    salary: { average: "₹18-35 LPA", intern: "₹50-80k monthly", bonus: "Stock options" },
    examTimeline: {
      expected: "August-October 2025",
      lastYear: "September 2024",
      note: "Regular on-campus",
    },
    preparation: {
      roadmap: "DBMS → SQL → Java → DSA",
      topics: {
        mustDo: ["SQL Queries", "Trees", "OS"],
        aptitude: { quantitative: ["Probability"], logical: ["Puzzles"], verbal: ["Grammar"] },
        coreSubjects: { os: ["Unix"], dbms: ["ACID", "Joins"], oops: ["Java Collections"] },
        advanced: { systemDesign: ["Cloud Infrastructure"], csConcepts: ["PL/SQL"] },
      },
      dailyPlanGuide: "2hr DBMS + 2hr DSA + 1hr Java",
    },
    resources: {
      youtube: [{ title: "Oracle Prep by Gate Smashers", link: "https://youtube.com" }],
      coding: [{ platform: "LeetCode Oracle", link: "https://leetcode.com/company/oracle/" }],
      aptitude: [{ platform: "IndiaBIX", link: "https://indiabix.com" }],
    },
    cutoff: { coding: "1/2 Correct", aptitude: "75%", note: "Sectional for DBMS" },
    strategy: {
      finalTips: ["Master SQL Joins", "Prepare Java Internals"],
      mistakesToAvoid: ["Weak SQL knowledge", "Ignoring Java memory model"],
    },
    aiFeatures: {
      resumeTips: "Database projects, Java certifications",
      interviewQuestions: ["Second highest salary SQL", "Design LRU Cache"],
      aiPromptSuggestion: "Oracle SQL and Java interview MCQs",
    },
  },

  morganStanley: {
    name: "morganStanley",
    overview: {
      name: "Morgan Stanley",
      tagline: "Invested in your success.",
      description:
        "A leading global financial services firm providing investment banking and wealth management services.",
      industry: "Investment Banking, FinTech",
      headquarters: "New York, USA",
    },
    hiring: {
      pattern: [
        { round: "OA", details: "Aptitude + Coding (3 Qs)" },
        { round: "Group Discussion", details: "Technical/Current Affairs" },
        { round: "Tech Interviews", details: "DSA + Java + Core" },
      ],
      difficulty: "Hard",
      importantPoints: ["Puzzles are common", "High focus on OOPS"],
    },
    salary: { average: "₹25-40 LPA", intern: "₹80k-1.0 LPA monthly", bonus: "Good yearly bonus" },
    examTimeline: {
      expected: "July-September 2025",
      lastYear: "August 2024",
      note: "Off-campus hiring exists",
    },
    preparation: {
      roadmap: "Java → DSA → Puzzles → DBMS",
      topics: {
        mustDo: ["Java 8", "DP", "Math"],
        aptitude: { quantitative: ["Probability"], logical: ["Puzzles"], verbal: ["Critical"] },
        coreSubjects: { os: ["Memory Management"], dbms: ["Normalization"], oops: ["Inheritance"] },
        advanced: {
          systemDesign: ["Banking App Basics"],
          csConcepts: ["C++ STL/Java Collections"],
        },
      },
      dailyPlanGuide: "2hr Puzzles + 3hr DSA + 1hr Java",
    },
    resources: {
      youtube: [{ title: "Morgan Stanley Prep", link: "https://youtube.com" }],
      coding: [{ platform: "LeetCode MS", link: "https://leetcode.com/company/morgan-stanley/" }],
      aptitude: [{ platform: "IndiaBIX Puzzles", link: "https://indiabix.com" }],
    },
    cutoff: { coding: "2/3 Correct", aptitude: "80%", note: "Puzzles are mandatory" },
    strategy: {
      finalTips: ["Strong fundamentals in C++/Java", "Solve 50+ puzzles"],
      mistakesToAvoid: ["Giving up on puzzles", "Weak core concepts"],
    },
    aiFeatures: {
      resumeTips: "Financial projects, Competitive coding",
      interviewQuestions: ["Egg Dropping Puzzle", "Design Elevator"],
      aiPromptSuggestion: "Morgan Stanley Java and Puzzle practice",
    },
  },

  samsung: {
    name: "samsung",
    overview: {
      name: "Samsung",
      tagline: "Inspire the World, Create the Future.",
      description: "Global leader in technology, opening new possibilities for people everywhere.",
      industry: "Electronics, Software, R&D",
      headquarters: "Suwon, South Korea",
    },
    hiring: {
      pattern: [
        { round: "SWC Test", details: "1 Coding question (3 hours) - Hard" },
        { round: "Tech Interview 1", details: "DSA + OS + C/C++" },
        { round: "Tech Interview 2", details: "Project + HR" },
      ],
      difficulty: "Hard",
      importantPoints: ["Samsung SWC test is very tough", "Focus on C/C++"],
    },
    salary: { average: "₹15-28 LPA", intern: "₹50k monthly", bonus: "Variable" },
    examTimeline: {
      expected: "August-October 2025",
      lastYear: "September 2024",
      note: "Regular on-campus for SDE",
    },
    preparation: {
      roadmap: "Advanced DSA (Graphs/DP) → C/C++ → OS Internals",
      topics: {
        mustDo: ["Graphs (BFS/DFS)", "Backtracking", "Bitmasking"],
        aptitude: { quantitative: ["Logical Math"], logical: ["Puzzles"], verbal: ["Grammar"] },
        coreSubjects: {
          os: ["Processes", "Scheduling"],
          dbms: ["SQL Basics"],
          oops: ["Pointers in C++"],
        },
        advanced: { systemDesign: ["Embedded Basics"], csConcepts: ["Computer Architecture"] },
      },
      dailyPlanGuide: "4hr SWC Coding + 1hr OS",
    },
    resources: {
      youtube: [{ title: "Samsung SWC Prep", link: "https://youtube.com/samsung_swc" }],
      coding: [{ platform: "Samsung SWC Portal", link: "https://research.samsung.com/" }],
      aptitude: [{ platform: "PrepInsta", link: "https://prepinsta.com" }],
    },
    cutoff: {
      coding: "1/1 Correct (Pass all test cases)",
      aptitude: "N/A",
      note: "SWC is the only gatekeeper",
    },
    strategy: {
      finalTips: ["Master Graph algorithms", "Optimize time complexity"],
      mistakesToAvoid: ["Ignoring test case limits", "Brute force won't pass"],
    },
    aiFeatures: {
      resumeTips: "C/C++ Projects, R&D internships",
      interviewQuestions: ["Detect cycle in Graph", "Burst Balloons DP"],
      aiPromptSuggestion: "Samsung SWC coding patterns",
    },
  },

  visa: {
    name: "visa",
    overview: {
      name: "Visa",
      tagline: "Everywhere you want to be.",
      description: "A world leader in digital payments.",
      industry: "FinTech, Payments",
      headquarters: "San Francisco, USA",
    },
    hiring: {
      pattern: [
        { round: "OA", details: "3 Coding questions + MCQs" },
        { round: "Technical Round 1", details: "DSA + Core" },
        { round: "Technical Round 2", details: "Design + Behavioral" },
      ],
      difficulty: "Medium-Hard",
      importantPoints: ["Payment gateway knowledge is a plus", "Good OOPS focus"],
    },
    salary: { average: "₹20-35 LPA", intern: "₹60-80k monthly", bonus: "RSUs" },
    examTimeline: {
      expected: "August-October 2025",
      lastYear: "September 2024",
      note: "Visa CodeUrWay competition",
    },
    preparation: {
      roadmap: "DSA → OOPS → Payment Domain → SQL",
      topics: {
        mustDo: ["Strings", "Heaps", "Hashmaps"],
        aptitude: {
          quantitative: ["Probability"],
          logical: ["Puzzles"],
          verbal: ["Comprehension"],
        },
        coreSubjects: { os: ["Threading"], dbms: ["Consistency"], oops: ["Interfaces"] },
        advanced: { systemDesign: ["Payment System"], csConcepts: ["Cryptography"] },
      },
      dailyPlanGuide: "3hr DSA + 1hr SQL + 1hr Domain",
    },
    resources: {
      youtube: [{ title: "Visa Interview Prep", link: "https://youtube.com" }],
      coding: [{ platform: "LeetCode Visa", link: "https://leetcode.com/company/visa/" }],
      aptitude: [{ platform: "IndiaBIX", link: "https://indiabix.com" }],
    },
    cutoff: { coding: "2/3 Correct", aptitude: "70%", note: "No negative marking" },
    strategy: {
      finalTips: ["Understand Transaction processing", "Solid OOPS"],
      mistakesToAvoid: ["Poor variable naming", "Not clarifying requirements"],
    },
    aiFeatures: {
      resumeTips: "FinTech projects, SQL expertise",
      interviewQuestions: ["Validate Credit Card", "Reverse Nodes in K group"],
      aiPromptSuggestion: "Visa coding round questions",
    },
  },

  deloitte: {
    name: "deloitte",
    overview: {
      name: "Deloitte",
      tagline: "Always One Step Ahead.",
      description:
        "Leading global provider of audit and assurance, consulting, financial advisory, risk advisory, tax, and related services.",
      industry: "Consulting",
      headquarters: "London, UK",
    },
    hiring: {
      pattern: [
        { round: "OA", details: "Aptitude + Verbal + Coding (1 Easy)" },
        { round: "JAM Round", details: "Just A Minute (Communication)" },
        { round: "Interview", details: "Case Study + Tech + HR" },
      ],
      difficulty: "Easy-Medium",
      importantPoints: ["Communication is crucial", "Versant test often included"],
    },
    salary: { average: "₹6-12 LPA", intern: "₹35k monthly", bonus: "Performance based" },
    examTimeline: {
      expected: "August-December 2025",
      lastYear: "September 2024",
      note: "Mass hiring",
    },
    preparation: {
      roadmap: "Aptitude → Communication → Case Studies",
      topics: {
        mustDo: ["Arrays", "Puzzles", "English"],
        aptitude: {
          quantitative: ["Profit/Loss"],
          logical: ["Syllogism"],
          verbal: ["Sentence Mastery"],
        },
        coreSubjects: { os: ["Basics"], dbms: ["SQL Queries"], oops: ["Basics"] },
        advanced: { systemDesign: ["N/A"], csConcepts: ["Excel Mastery"] },
      },
      dailyPlanGuide: "2hr Aptitude + 2hr English + 1hr Tech",
    },
    resources: {
      youtube: [{ title: "Deloitte Prep by FacePrep", link: "https://youtube.com" }],
      coding: [{ platform: "PrepInsta", link: "https://prepinsta.com" }],
      aptitude: [{ platform: "Indiabix", link: "https://indiabix.com" }],
    },
    cutoff: { coding: "1/1 Correct", aptitude: "60%", note: "Communication score is key" },
    strategy: {
      finalTips: ["Be confident in GD/JAM", "Good dress code"],
      mistakesToAvoid: ["Low volume in JAM", "Fumbling in case study"],
    },
    aiFeatures: {
      resumeTips: "Leadership, Teamwork, Excel, Consulting keywords",
      interviewQuestions: ["Why Deloitte?", "Aptitude Puzzles"],
      aiPromptSuggestion: "Deloitte JAM round topics",
    },
  },

  cisco: {
    name: "cisco",
    overview: {
      name: "Cisco",
      tagline: "Bridge to Possible.",
      description:
        "World leader in networking that transforms how people connect, communicate, and collaborate.",
      industry: "Networking, Software",
      headquarters: "San Jose, California, USA",
    },
    hiring: {
      pattern: [
        { round: "OA", details: "Aptitude + Technical + 2 Coding" },
        { round: "Tech Interview 1", details: "Networking + DSA" },
        { round: "Tech Interview 2", details: "Projects + Core" },
      ],
      difficulty: "Medium-Hard",
      importantPoints: ["Networking knowledge is mandatory", "Focus on OSI Model"],
    },
    salary: { average: "₹15-30 LPA", intern: "₹60k-80k monthly", bonus: "Performance" },
    examTimeline: {
      expected: "August-October 2025",
      lastYear: "September 2024",
      note: "Cisco Ideathon competition",
    },
    preparation: {
      roadmap: "Networking → DSA → OS → Python/C++",
      topics: {
        mustDo: ["OSI Layers", "TCP/IP", "Graphs"],
        aptitude: { quantitative: ["Probability"], logical: ["Puzzles"], verbal: ["Grammar"] },
        coreSubjects: { os: ["IP Addressing"], dbms: ["Basics"], oops: ["C++ Basics"] },
        advanced: { systemDesign: ["Network Topology"], csConcepts: ["SDN Basics"] },
      },
      dailyPlanGuide: "2hr Networking + 2hr DSA + 1hr OS",
    },
    resources: {
      youtube: [{ title: "Cisco Prep by Apna College", link: "https://youtube.com" }],
      coding: [{ platform: "LeetCode Cisco", link: "https://leetcode.com/company/cisco/" }],
      aptitude: [{ platform: "PrepInsta", link: "https://prepinsta.com" }],
    },
    cutoff: { coding: "1.5/2 Correct", aptitude: "75%", note: "Sectional for Networking" },
    strategy: {
      finalTips: ["Master OSI Model", "Be ready for CCNA basics"],
      mistakesToAvoid: ["Weak networking concepts", "Poor logic in coding"],
    },
    aiFeatures: {
      resumeTips: "Networking certifications (CCNA), Python scripts",
      interviewQuestions: ["Explain DNS", "Reverse a String"],
      aiPromptSuggestion: "Cisco networking interview MCQs",
    },
  },

  pwc: {
    name: "pwc",
    overview: {
      name: "PricewaterhouseCoopers (PwC)",
      tagline: "Building relationships, creating value.",
      description: "A leading professional services network.",
      industry: "Audit, Consulting",
      headquarters: "London, UK",
    },
    hiring: {
      pattern: [
        { round: "Aptitude", details: "Numerical + Logical + Verbal" },
        { round: "Group Discussion", details: "Case Studies" },
        { round: "Interview", details: "Tech + Behavioral" },
      ],
      difficulty: "Easy-Medium",
      importantPoints: ["Logical thinking matters", "Corporate grooming"],
    },
    salary: { average: "₹6-10 LPA", intern: "₹30k monthly", bonus: "Variable" },
    examTimeline: {
      expected: "September-November 2025",
      lastYear: "October 2024",
      note: "On-campus focus",
    },
    preparation: {
      roadmap: "Aptitude → Case Study → HR Prep",
      topics: {
        mustDo: ["English", "Math", "Case Studies"],
        aptitude: {
          quantitative: ["Data Interpretation"],
          logical: ["Blood Relations"],
          verbal: ["RC"],
        },
        coreSubjects: { os: ["N/A"], dbms: ["Basics"], oops: ["N/A"] },
        advanced: { systemDesign: ["N/A"], csConcepts: ["Business Logic"] },
      },
      dailyPlanGuide: "2hr Aptitude + 1hr GD Practice",
    },
    resources: {
      youtube: [{ title: "PwC Interview Prep", link: "https://youtube.com" }],
      coding: [{ platform: "N/A", link: "" }],
      aptitude: [{ platform: "Indiabix", link: "https://indiabix.com" }],
    },
    cutoff: { coding: "N/A", aptitude: "65%", note: "Case study round is eliminatory" },
    strategy: {
      finalTips: ["Improve your vocabulary", "Be a team player in GD"],
      mistakesToAvoid: ["Being too aggressive in GD", "Weak data analysis"],
    },
    aiFeatures: {
      resumeTips: "Analytical skills, Team player, Projects",
      interviewQuestions: ["Why PwC?", "Case study analysis"],
      aiPromptSuggestion: "PwC case study interview examples",
    },
  },

  intel: {
    name: "intel",
    overview: {
      name: "Intel",
      tagline: "Intel Inside.",
      description: "World's largest semiconductor chip manufacturer.",
      industry: "Hardware, Software, AI",
      headquarters: "Santa Clara, California, USA",
    },
    hiring: {
      pattern: [
        { round: "Online Test", details: "Technical MCQ + Coding" },
        { round: "Tech Interview 1", details: "Digital Logic + OS + C++" },
        { round: "Tech Interview 2", details: "Architecture + HR" },
      ],
      difficulty: "Hard",
      importantPoints: ["Knowledge of Microprocessors", "Low-level coding"],
    },
    salary: { average: "₹15-25 LPA", intern: "₹45k monthly", bonus: "Stocks" },
    examTimeline: {
      expected: "August-October 2025",
      lastYear: "September 2024",
      note: "Hires for both HW and SW",
    },
    preparation: {
      roadmap: "Digital Electronics → OS → C++ → DSA",
      topics: {
        mustDo: ["C/C++", "OS Internals", "Computer Architecture"],
        aptitude: {
          quantitative: ["Numbers"],
          logical: ["Logic Gates"],
          verbal: ["Technical English"],
        },
        coreSubjects: { os: ["Interrupts", "Cache"], dbms: ["Basics"], oops: ["Pointers"] },
        advanced: { systemDesign: ["Hardware-Software Co-design"], csConcepts: ["Verilog Basics"] },
      },
      dailyPlanGuide: "2hr Core Tech + 2hr DSA + 1hr HW Basics",
    },
    resources: {
      youtube: [{ title: "Intel Prep by Gate Smashers", link: "https://youtube.com" }],
      coding: [{ platform: "LeetCode Intel", link: "https://leetcode.com/company/intel/" }],
      aptitude: [{ platform: "IndiaBIX", link: "https://indiabix.com" }],
    },
    cutoff: { coding: "1/2 Correct", aptitude: "70%", note: "Technical MCQ focus" },
    strategy: {
      finalTips: ["Revise 8085/8086", "Deep C/C++ knowledge"],
      mistakesToAvoid: ["Weak HW fundamentals", "Ignoring OS concepts"],
    },
    aiFeatures: {
      resumeTips: "Embedded projects, C/C++ skills",
      interviewQuestions: ["What is Cache Memory?", "Design an Adder"],
      aiPromptSuggestion: "Intel technical interview MCQs",
    },
  },

  ibm: {
    name: "ibm",
    overview: {
      name: "IBM",
      tagline: "Think.",
      description: "A global technology and innovation company.",
      industry: "IT Services, AI, Cloud",
      headquarters: "Armonk, New York, USA",
    },
    hiring: {
      pattern: [
        { round: "Cognitive Ability Test", details: "Games + Aptitude" },
        { round: "Tech Round", details: "DSA + Projects" },
        { round: "HR Round", details: "Communication" },
      ],
      difficulty: "Medium",
      importantPoints: ["IPAT test is unique", "Focus on AI/Cloud"],
    },
    salary: { average: "₹7-15 LPA", intern: "₹40k monthly", bonus: "Variable" },
    examTimeline: {
      expected: "July-September 2025",
      lastYear: "August 2024",
      note: "Continuous hiring",
    },
    preparation: {
      roadmap: "Cognitive Practice → DSA → Cloud Basics",
      topics: {
        mustDo: ["Arrays", "Java/Python", "Cloud"],
        aptitude: { quantitative: ["Series"], logical: ["Pattern"], verbal: ["Grammar"] },
        coreSubjects: { os: ["Scheduling"], dbms: ["SQL Joins"], oops: ["Abstraction"] },
        advanced: { systemDesign: ["Cloud Architecture Basics"], csConcepts: ["Kubernetes"] },
      },
      dailyPlanGuide: "2hr Cognitive + 2hr Tech",
    },
    resources: {
      youtube: [{ title: "IBM Prep by PrepInsta", link: "https://youtube.com" }],
      coding: [{ platform: "LeetCode IBM", link: "https://leetcode.com/company/ibm/" }],
      aptitude: [{ platform: "IndiaBIX", link: "https://indiabix.com" }],
    },
    cutoff: { coding: "1/2 Correct", aptitude: "70%", note: "Cognitive test is important" },
    strategy: {
      finalTips: ["Practice IBM IPAT games", "Showcase AI interest"],
      mistakesToAvoid: ["Ignoring games round", "Fumbling in HR"],
    },
    aiFeatures: {
      resumeTips: "IBM certifications, AI/Cloud projects",
      interviewQuestions: ["Explain Cloud Computing", "Fibonacci"],
      aiPromptSuggestion: "IBM cognitive game patterns",
    },
  },

  walmart: {
    name: "walmart",
    overview: {
      name: "Walmart Global Tech",
      tagline: "Save Money. Live Better.",
      description: "The technology arm of Walmart, focusing on retail tech.",
      industry: "Retail, E-commerce",
      headquarters: "Bentonville, Arkansas, USA",
    },
    hiring: {
      pattern: [
        { round: "OA", details: "Coding (2 Qs) + MCQs" },
        { round: "Tech Interview 1", details: "DSA + OOPS" },
        { round: "Tech Interview 2", details: "System Design + HR" },
      ],
      difficulty: "Hard",
      importantPoints: ["Walmart CodeHers competition", "Focus on Java/Spring"],
    },
    salary: { average: "₹25-45 LPA", intern: "₹1.0 LPA monthly", bonus: "Annual Bonus + RSUs" },
    examTimeline: {
      expected: "August-October 2025",
      lastYear: "September 2024",
      note: "Regular on-campus",
    },
    preparation: {
      roadmap: "DSA → Java → LLD → Spring Boot",
      topics: {
        mustDo: ["DP", "Trees", "Java"],
        aptitude: { quantitative: ["Math"], logical: ["Puzzles"], verbal: ["RC"] },
        coreSubjects: { os: ["Basics"], dbms: ["SQL"], oops: ["SOLID"] },
        advanced: { systemDesign: ["Design Walmart Cart"], csConcepts: ["Microservices"] },
      },
      dailyPlanGuide: "3hr DSA + 2hr Java/Spring",
    },
    resources: {
      youtube: [{ title: "Walmart Prep by CodeHelp", link: "https://youtube.com" }],
      coding: [
        { platform: "LeetCode Walmart", link: "https://leetcode.com/company/walmart-global-tech/" },
      ],
      aptitude: [{ platform: "IndiaBIX", link: "https://indiabix.com" }],
    },
    cutoff: { coding: "2/2 Correct", aptitude: "75%", note: "No negative marking" },
    strategy: {
      finalTips: ["Master Java internals", "Practice System Design"],
      mistakesToAvoid: ["Weak DP concepts", "Slow coding speed"],
    },
    aiFeatures: {
      resumeTips: "E-commerce projects, Java/Spring Boot",
      interviewQuestions: ["Design a Warehouse", "Merge Intervals"],
      aiPromptSuggestion: "Walmart CodeHers interview patterns",
    },
  },

  jpmorgan: {
    name: "jpmorgan",
    overview: {
      name: "JPMorgan Chase & Co.",
      tagline: "Be part of something bigger.",
      description:
        "A leader in investment banking, financial services for consumers and small businesses.",
      industry: "Investment Banking, FinTech",
      headquarters: "New York, USA",
    },
    hiring: {
      pattern: [
        { round: "Code for Good Hackathon", details: "24-hour hackathon to hire" },
        { round: "HireVue Round", details: "Video based behavioral" },
        { round: "Interview", details: "DSA + Projects" },
      ],
      difficulty: "Medium-Hard",
      importantPoints: ["Code for Good is a major entry point", "Teamwork focus"],
    },
    salary: { average: "₹14-22 LPA", intern: "₹50k-70k monthly", bonus: "Yearly bonus" },
    examTimeline: {
      expected: "June-August 2025",
      lastYear: "July 2024",
      note: "Code for Good happens early",
    },
    preparation: {
      roadmap: "Web Dev → DSA → HireVue Prep",
      topics: {
        mustDo: ["Arrays", "Java/React", "Behavioral"],
        aptitude: { quantitative: ["Probability"], logical: ["Logic"], verbal: ["Communication"] },
        coreSubjects: { os: ["Basics"], dbms: ["SQL"], oops: ["Design Patterns"] },
        advanced: { systemDesign: ["Basic API Design"], csConcepts: ["FinTech Basics"] },
      },
      dailyPlanGuide: "2hr Dev + 2hr DSA + 1hr HR",
    },
    resources: {
      youtube: [{ title: "JPMC Code for Good", link: "https://youtube.com" }],
      coding: [{ platform: "LeetCode JPMC", link: "https://leetcode.com/company/jpmorgan-chase/" }],
      aptitude: [{ platform: "IndiaBIX", link: "https://indiabix.com" }],
    },
    cutoff: {
      coding: "1.5/2 Correct",
      aptitude: "N/A",
      note: "Hackathon performance matters most",
    },
    strategy: {
      finalTips: ["Participate in CFG", "Improve your communication"],
      mistakesToAvoid: ["Poor teamwork in hackathon", "Ignoring HireVue"],
    },
    aiFeatures: {
      resumeTips: "Hackathon wins, FinTech projects",
      interviewQuestions: ["Reverse LinkedList", "Why JPMC?"],
      aiPromptSuggestion: "JPMC HireVue behavioral questions",
    },
  },

  byjus: {
    name: "byjus",
    overview: {
      name: "BYJU'S",
      tagline: "Fall in love with learning.",
      description: "India's largest edtech company and creator of the popular learning app.",
      industry: "EdTech",
      headquarters: "Bengaluru, India",
    },
    hiring: {
      pattern: [
        { round: "Coding Test", details: "2-3 Qs (Medium)" },
        { round: "Technical Round 1", details: "DSA + OOPS" },
        { round: "Technical Round 2", details: "Project + Culture fit" },
      ],
      difficulty: "Medium",
      importantPoints: ["Fast-paced", "Focus on problem solving"],
    },
    salary: { average: "₹10-25 LPA", intern: "₹40k monthly", bonus: "Variable" },
    examTimeline: {
      expected: "September-October 2025",
      lastYear: "October 2024",
      note: "Direct interviews",
    },
    preparation: {
      roadmap: "DSA → Projects → HR Prep",
      topics: {
        mustDo: ["Strings", "Trees", "Arrays"],
        aptitude: { quantitative: ["Math"], logical: ["Pattern"], verbal: ["RC"] },
        coreSubjects: { os: ["Basics"], dbms: ["SQL Joins"], oops: ["Basics"] },
        advanced: { systemDesign: ["Video Streaming Basics"], csConcepts: ["N/A"] },
      },
      dailyPlanGuide: "2hr DSA + 2hr Dev",
    },
    resources: {
      youtube: [{ title: "BYJU'S Tech Prep", link: "https://youtube.com" }],
      coding: [{ platform: "LeetCode", link: "https://leetcode.com" }],
      aptitude: [{ platform: "IndiaBIX", link: "https://indiabix.com" }],
    },
    cutoff: { coding: "1.5/2 Correct", aptitude: "70%", note: "Simple DSA focus" },
    strategy: {
      finalTips: ["Show passion for EdTech", "Clear DSA basics"],
      mistakesToAvoid: ["Vague project details", "Low energy"],
    },
    aiFeatures: {
      resumeTips: "EdTech projects, Android/iOS skills",
      interviewQuestions: ["Middle of LinkedList", "Polymorphism"],
      aiPromptSuggestion: "BYJU'S interview coding patterns",
    },
  },

  capgemini: {
    name: "capgemini",
    overview: {
      name: "Capgemini",
      tagline: "Get the Future You Want.",
      description:
        "A global leader in partnering with companies to transform and manage their business by harnessing the power of technology.",
      industry: "IT Services",
      headquarters: "Paris, France",
    },
    hiring: {
      pattern: [
        { round: "Pseudo Code", details: "20-25 Questions" },
        { round: "English Communication", details: "Reading/Listening" },
        { round: "Game Based Aptitude", details: "Grid/Motion Challenges" },
        { round: "Technical Interview", details: "Basics + Projects" },
      ],
      difficulty: "Easy-Medium",
      importantPoints: ["Pseudo code section is tricky", "Games are unique"],
    },
    salary: { average: "₹4-8 LPA", intern: "₹25k monthly", bonus: "Variable" },
    examTimeline: {
      expected: "August-October 2025",
      lastYear: "September 2024",
      note: "Mass hiring",
    },
    preparation: {
      roadmap: "Pseudo Code → Games → Basic Tech",
      topics: {
        mustDo: ["Loops", "Recursion", "Grammar"],
        aptitude: { quantitative: ["Ratios"], logical: ["Puzzles"], verbal: ["Vocabulary"] },
        coreSubjects: { os: ["Basics"], dbms: ["SQL Joins"], oops: ["Classes"] },
        advanced: { systemDesign: ["N/A"], csConcepts: ["SDLC Basics"] },
      },
      dailyPlanGuide: "2hr Pseudo code + 2hr Games/Aptitude",
    },
    resources: {
      youtube: [{ title: "Capgemini Prep by FacePrep", link: "https://youtube.com" }],
      coding: [{ platform: "PrepInsta", link: "https://prepinsta.com" }],
      aptitude: [{ platform: "IndiaBIX", link: "https://indiabix.com" }],
    },
    cutoff: { coding: "N/A", aptitude: "60%", note: "Pseudo code is the main filter" },
    strategy: {
      finalTips: ["Practice Pseudo code daily", "Be quick in game round"],
      mistakesToAvoid: ["Ignoring Pseudo code", "Slow gaming speed"],
    },
    aiFeatures: {
      resumeTips: "Training certificates, Fresh projects",
      interviewQuestions: ["What is OOPS?", "Explain your Project"],
      aiPromptSuggestion: "Capgemini pseudo code practice",
    },
  },

  goldmanSachs_India: {
    name: "goldmanSachs_India",
    overview: {
      name: "Goldman Sachs India",
      tagline: "Progress is Everyone’s Business.",
      description: "Goldman Sachs Bangalore/Hyderabad hubs focus on high-end engineering.",
      industry: "FinTech",
      headquarters: "Bengaluru, India",
    },
    hiring: {
      pattern: [
        { round: "Aptitude (Numerical)", details: "Advanced Math" },
        { round: "Coding", details: "2 Qs (Medium-Hard)" },
        { round: "Interviews (3)", details: "DSA + Math + Puzzles" },
      ],
      difficulty: "Hard",
      importantPoints: ["Highly math focused", "Referrals are key"],
    },
    salary: { average: "₹25-45 LPA", intern: "₹1.0 LPA monthly", bonus: "Performance" },
    examTimeline: {
      expected: "July-August 2025",
      lastYear: "August 2024",
      note: "Engineering Campus Hiring Program",
    },
    preparation: {
      roadmap: "Math (Probability) → DSA → Puzzles",
      topics: {
        mustDo: ["Math", "DP", "Graphs"],
        aptitude: {
          quantitative: ["Probability", "Statistics"],
          logical: ["Puzzles"],
          verbal: ["RC"],
        },
        coreSubjects: { os: ["Multi-threading"], dbms: ["SQL Joins"], oops: ["Java Internals"] },
        advanced: { systemDesign: ["Basic HLD"], csConcepts: ["Finance Basics"] },
      },
      dailyPlanGuide: "3hr DSA + 2hr Math/Puzzles",
    },
    resources: {
      youtube: [{ title: "Goldman Sachs Prep", link: "https://youtube.com" }],
      coding: [{ platform: "HackerRank GS", link: "https://hackerrank.com" }],
      aptitude: [{ platform: "IndiaBIX", link: "https://indiabix.com" }],
    },
    cutoff: { coding: "2/2 Correct", aptitude: "80%", note: "Numerical section is tough" },
    strategy: {
      finalTips: ["Strong Math background", "Speed is vital"],
      mistakesToAvoid: ["Ignoring puzzles", "Calculation errors"],
    },
    aiFeatures: {
      resumeTips: "Math achievements, CP ranks",
      interviewQuestions: ["Egg Drop Problem", "Design a Bank"],
      aiPromptSuggestion: "GS India math and coding questions",
    },
  },

  infosys_Lex: {
    name: "infosys_Lex",
    overview: {
      name: "Infosys Lex (Wingspan)",
      tagline: "Navigate Your Next.",
      description: "Focuses on the internal training and learning platform development.",
      industry: "IT Services",
      headquarters: "Bengaluru, India",
    },
    hiring: {
      pattern: [
        { round: "InfyTQ OA", details: "Coding focused" },
        { round: "Final Certification", details: "Core Tech + DSA" },
        { round: "Interview", details: "Project + Core" },
      ],
      difficulty: "Medium",
      importantPoints: ["Requires Java/Python mastery", "Certification based"],
    },
    salary: { average: "₹5-9 LPA", intern: "₹30k monthly", bonus: "Variable" },
    examTimeline: {
      expected: "January-March 2025",
      lastYear: "February 2024",
      note: "InfyTQ portal",
    },
    preparation: {
      roadmap: "Java Mastery → SQL → DSA",
      topics: {
        mustDo: ["Java collections", "SQL Queries", "Arrays"],
        aptitude: { quantitative: ["Math"], logical: ["Puzzles"], verbal: ["English"] },
        coreSubjects: { os: ["Basics"], dbms: ["Joins"], oops: ["Classes"] },
        advanced: { systemDesign: ["N/A"], csConcepts: ["SDLC"] },
      },
      dailyPlanGuide: "3hr Programming + 2hr SQL",
    },
    resources: {
      youtube: [{ title: "InfyTQ Prep", link: "https://youtube.com" }],
      coding: [{ platform: "Lex Portal", link: "https://infosys.com" }],
      aptitude: [{ platform: "PrepInsta", link: "https://prepinsta.com" }],
    },
    cutoff: { coding: "2/2 Correct", aptitude: "65%", note: "65% score needed for certificate" },
    strategy: {
      finalTips: ["Master SQL thoroughly", "Java/Python proficiency"],
      mistakesToAvoid: ["Weak SQL queries", "Ignoring InfyTQ samples"],
    },
    aiFeatures: {
      resumeTips: "Infosys certifications, Python/Java projects",
      interviewQuestions: ["Polymorphism examples", "SQL Joins"],
      aiPromptSuggestion: "InfyTQ certification pattern",
    },
  },

  salesforce: {
    name: "salesforce",
    overview: {
      name: "Salesforce",
      tagline: "The Customer Success Platform.",
      description:
        "The world's #1 CRM, helping companies connect with their customers in a whole new way.",
      industry: "Cloud Computing, CRM",
      headquarters: "San Francisco, California, USA",
    },
    hiring: {
      pattern: [
        { round: "OA", details: "3 Coding questions (Medium-Hard)" },
        { round: "Tech Interview 1", details: "DSA + OOPS" },
        { round: "Tech Interview 2", details: "System Design + HR" },
      ],
      difficulty: "Hard",
      importantPoints: ["Focus on Java & Cloud", "Trailhead badges are a plus"],
    },
    salary: { average: "₹25-45 LPA", intern: "₹1.0 LPA monthly", bonus: "Good RSUs" },
    examTimeline: {
      expected: "August-October 2025",
      lastYear: "September 2024",
      note: "Regular on-campus",
    },
    preparation: {
      roadmap: "Java → DSA → LLD → Cloud Basics",
      topics: {
        mustDo: ["Graphs", "DP", "Java"],
        aptitude: { quantitative: ["Math"], logical: ["Puzzles"], verbal: ["RC"] },
        coreSubjects: { os: ["Basics"], dbms: ["NoSQL", "SQL"], oops: ["SOLID"] },
        advanced: { systemDesign: ["Design a CRM"], csConcepts: ["Apex basics"] },
      },
      dailyPlanGuide: "3hr DSA + 2hr Java/Cloud",
    },
    resources: {
      youtube: [{ title: "Salesforce Prep", link: "https://youtube.com" }],
      coding: [
        { platform: "LeetCode Salesforce", link: "https://leetcode.com/company/salesforce/" },
      ],
      aptitude: [{ platform: "IndiaBIX", link: "https://indiabix.com" }],
    },
    cutoff: { coding: "2/3 Correct", aptitude: "80%", note: "No negative marking" },
    strategy: {
      finalTips: ["Master OOPS principles", "Practice Trailhead basics"],
      mistakesToAvoid: ["Weak Java knowledge", "Ignoring Cloud concepts"],
    },
    aiFeatures: {
      resumeTips: "Salesforce Trailhead, Cloud projects",
      interviewQuestions: ["Design a URL Shortener", "LRU Cache"],
      aiPromptSuggestion: "Salesforce interview coding patterns",
    },
  },
};
