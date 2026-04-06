export const companyData = {
  amazon: {
    name: "amazon",
    overview: {
      name: "Amazon",
      tagline: "Work Hard. Have Fun. Make History.",
      description: "Amazon is guided by four principles: customer obsession rather than competitor focus, passion for invention, commitment to operational excellence, and long-term thinking.",
      industry: "E-commerce, Cloud Computing, AI/ML",
      headquarters: "Seattle, Washington, USA"
    },
    hiring: {
      pattern: [
        { round: "Online Assessment", details: "2 Coding questions (Medium-Hard), 2 Work Simulation, Work Style Assessment" },
        { round: "Technical Interview 1", details: "DSA + OOP + System Design" },
        { round: "Technical Interview 2", details: "Advanced DSA + Behavioral" },
        { round: "Bar Raiser", details: "Leadership Principles deep dive" }
      ],
      difficulty: "Hard",
      importantPoints: ["Leadership Principles (16 total)", "No negative marking", "Coding: Optimal solutions only"]
    },
    salary: {
      average: "₹45-60 LPA",
      intern: "₹1.2-1.8 LPA monthly",
      bonus: "15-25% + RSUs"
    },
    examTimeline: {
      expected: "July-August 2025",
      lastYear: "August 15, 2024",
      note: "Amazon OA can come anytime"
    },
    preparation: {
      roadmap: "DSA → System Design → Leadership Principles → Mock Interviews",
      topics: {
        mustDo: ["Graphs", "DP", "Greedy", "Two Pointers"],
        aptitude: {
          quantitative: ["Profit Loss", "Time Work", "Pipes Cisterns"],
          logical: ["Pattern Recognition", "Seating Arrangement"],
          verbal: ["Reading Comprehension", "Sentence Completion"]
        },
        coreSubjects: {
          os: ["Processes", "Deadlock", "Memory Management"],
          dbms: ["Normalization", "Indexing", "Transactions"],
          oops: ["Polymorphism", "Inheritance", "SOLID"]
        },
        advanced: {
          systemDesign: ["Design Amazon", "Load Balancer", "LRU Cache"],
          csConcepts: ["CAP Theorem", "Microservices", "Distributed Systems"]
        }
      },
      dailyPlanGuide: "4hr DSA + 2hr System Design + 1hr LP"
    },
    resources: {
      youtube: [
        { title: "NeetCode Amazon Playlist", link: "https://youtube.com/playlist?list=PLotXMRnH91bAkKEDdwZwKeK4CAcS-8jTw" },
        { title: "Anti Akshay Amazon", link: "https://youtube.com/watch?v=example" }
      ],
      coding: [
        { platform: "LeetCode", link: "https://leetcode.com/company/amazon/" },
        { platform: "GFG Amazon", link: "https://geeksforgeeks.org/amazon-sde-sheet/" }
      ],
      aptitude: [
        { platform: "IndiaBIX", link: "https://indiabix.com" }
      ]
    },
    cutoff: {
      coding: "1/2 correct with optimal",
      aptitude: "85%",
      note: "No sectional cutoff"
    },
    strategy: {
      finalTips: [
        "Follow LP in every answer",
        "Think aloud during coding",
        "Ask clarifying questions"
      ],
      mistakesToAvoid: [
        "Don't argue with interviewer",
        "No brute force accepted",
        "Don't forget edge cases"
      ]
    },
    aiFeatures: {
      resumeTips: "Use action verbs, quantify achievements, include AWS/ML projects",
      interviewQuestions: [
        "Design TinyURL", "LRU Cache", "Why Amazon?"
      ],
      aiPromptSuggestion: "Generate Amazon LP behavioral examples"
    }
  },
  
  tcs: {
    name: "tcs",
    overview: {
      name: "Tata Consultancy Services",
      tagline: "Experience the Power of One TCS.",
      description: "TCS is an IT services, consulting and business solutions organization.",
      industry: "IT Services, Consulting",
      headquarters: "Mumbai, Maharashtra, India"
    },
    hiring: {
      pattern: [
        { round: "TCS NQT", details: "Foundation + Advanced (Coding + Aptitude)" },
        { round: "Technical Interview", details: "DSA + Core Subjects" },
        { round: "Managerial Round", details: "Communication + HR" }
      ],
      difficulty: "Easy",
      importantPoints: ["NQT valid 2 years", "Digital profile higher package"]
    },
    salary: {
      average: "₹7-9 LPA",
      intern: "₹60k monthly",
      bonus: "Variable"
    },
    examTimeline: {
      expected: "March-April 2025",
      lastYear: "March 2024",
      note: "Multiple slots throughout year"
    },
    preparation: {
      roadmap: "NQT Practice → Basic DSA → Communication",
      topics: {
        mustDo: ["Arrays", "Strings", "Sorting"],
        aptitude: {
          quantitative: ["Number Series", "Time Speed", "Percentage"],
          logical: ["Blood Relations", "Coding Decoding"],
          verbal: ["Synonyms", "Error Spotting"]
        },
        coreSubjects: {
          os: ["CPU Scheduling", "Page Replacement"],
          dbms: ["SQL Queries", "Keys"],
          oops: ["Classes", "Inheritance"]
        },
        advanced: {
          systemDesign: ["Basic", "Database Design"],
          csConcepts: ["Networking Basics"]
        }
      },
      dailyPlanGuide: "3hr Aptitude + 2hr Coding + 1hr English"
    },
    resources: {
      youtube: [
        { title: "TCS NQT by Apna College", link: "https://youtube.com/playlist?list=example" },
        { title: "Face Prep TCS", link: "https://youtube.com/watch?v=example" }
      ],
      coding: [
        { platform: "PrepInsta TCS", link: "https://prepinsta.com/tcs/" },
        { platform: "GFG TCS", link: "https://geeksforgeeks.org/tcs/" }
      ],
      aptitude: [
        { platform: "Testbook", link: "https://testbook.com" },
        { platform: "FacePrep", link: "https://faceprep.in" }
      ]
    },
    cutoff: {
      coding: "1/2 easy",
      aptitude: "60%",
      note: "Sectional cutoffs apply"
    },
    strategy: {
      finalTips: [
        "Practice sectional mocks",
        "Time management critical",
        "Speak clearly in interviews"
      ],
      mistakesToAvoid: [
        "Don't skip foundation section",
        "Practice 100+ aptitude questions",
        "Know TCS values"
      ]
    },
    aiFeatures: {
      resumeTips: "Highlight client projects, TCS Ninja/Digital keywords",
      interviewQuestions: [
        "Reverse String", "Palindrome", "TCS projects?"
      ],
      aiPromptSuggestion: "TCS NQT sectional mocks"
    }
  },

  microsoft: {
    name: "microsoft",
    overview: {
      name: "Microsoft",
      tagline: "Be What's Next.",
      description: "Microsoft Corporation is an American multinational technology company producing computer software, consumer electronics, personal computers, and related services.",
      industry: "Software, Cloud, Gaming",
      headquarters: "Redmond, Washington, USA"
    },
    hiring: {
      pattern: [
        { round: "Online Assessment", details: "3 DSA questions" },
        { round: "Technical Round 1", details: "Coding + Projects" },
        { round: "Technical Round 2", details: "System Design" },
        { round: "HR Round", details: "Behavioral" }
      ],
      difficulty: "Medium",
      importantPoints: ["Love clean code", "Optimal solutions"]
    },
    salary: {
      average: "₹35-50 LPA",
      intern: "₹1.5 LPA monthly",
      bonus: "20% + stocks"
    },
    examTimeline: {
      expected: "May-June 2025",
      lastYear: "June 2024",
      note: "Campus + off-campus both"
    },
    preparation: {
      roadmap: "DSA → Projects → System Design",
      topics: {
        mustDo: ["DP", "Graphs", "Trees"],
        aptitude: {
          quantitative: ["Permutations", "Probability"],
          logical: ["Puzzles"],
          verbal: ["Comprehensions"]
        },
        coreSubjects: {
          os: ["Threads", "Synchronization"],
          dbms: ["Sharding", "Replication"],
          oops: ["Design Patterns"]
        },
        advanced: {
          systemDesign: ["Design Twitter", "URL Shortener"],
          csConcepts: ["Compilers", "OS Internals"]
        }
      },
      dailyPlanGuide: "4hr LeetCode + 2hr Projects"
    },
    resources: {
      youtube: [
        { title: "NeetCode Microsoft", link: "https://youtube.com/playlist?list=PLot-XmrnH91bAkKEDdwZwKeK4CAcS-8jTw" }
      ],
      coding: [
        { platform: "LeetCode Microsoft", link: "https://leetcode.com/company/microsoft/" }
      ],
      aptitude: [
        { platform: "IndiaBIX Puzzles", link: "https://indiabix.com/logical-reasoning/puzzles/" }
      ]
    },
    cutoff: {
      coding: "2/3 correct",
      aptitude: "80%",
      note: "No sectional"
    },
    strategy: {
      finalTips: [
        "Explain your approach clearly",
        "Handle all test cases",
        "Know your projects deeply"
      ],
      mistakesToAvoid: [
        "Don't jump to code",
        "Practice medium-hard problems",
        "Optimize time/space"
      ]
    },
    aiFeatures: {
      resumeTips: "GitHub links, open source contributions",
      interviewQuestions: [
        "K Closest Points", "LFU Cache", "Why Microsoft?"
      ],
      aiPromptSuggestion: "Microsoft SDE behavioral questions"
    }
  },

  wipro: {
    name: "wipro",
    overview: {
      name: "Wipro",
      tagline: "Innovate with Wipro.",
      description: "Wipro Limited is a leading global information technology, consulting and business process services company.",
      industry: "IT Services, Consulting, BPO",
      headquarters: "Bengaluru, Karnataka, India"
    },
    hiring: {
      pattern: [
        { round: "Wipro NLTH", details: "Online Assessment (Aptitude + Coding + Essay)" },
        { round: "Technical Interview", details: "DSA + Projects + Core Subjects" },
        { round: "HR Interview", details: "Communication + Background" }
      ],
      difficulty: "Easy",
      importantPoints: ["Essay writing important", "Basic DSA sufficient", "Wipro Elite NLTH higher package"]
    },
    salary: {
      average: "₹6.5-8 LPA",
      intern: "₹50k monthly",
      bonus: "10-15%"
    },
    examTimeline: {
      expected: "Feb-March 2025",
      lastYear: "March 2024",
      note: "Multiple drives yearly"
    },
    preparation: {
      roadmap: "Aptitude → Basic Coding → Communication",
      topics: {
        mustDo: ["Arrays", "Strings", "Basic DP"],
        aptitude: {
          quantitative: ["Time Work", "Probability", "Simple Interest"],
          logical: ["Syllogism", "Data Sufficiency"],
          verbal: ["Para Jumbles", "Fill in Blanks"]
        },
        coreSubjects: {
          os: ["Semaphores", "Scheduling"],
          dbms: ["Joins", "Constraints"],
          oops: ["Abstraction", "Encapsulation"]
        },
        advanced: {
          systemDesign: ["Basic Web App"],
          csConcepts: ["OSI Model"]
        }
      },
      dailyPlanGuide: "2hr Aptitude + 2hr Coding + 1hr Essay Practice"
    },
    resources: {
      youtube: [
        { title: "Wipro NLTH by Adda247", link: "https://youtube.com/watch?v=wipro_nlth" },
        { title: "PrepInsta Wipro", link: "https://youtube.com/playlist?list=wipro" }
      ],
      coding: [
        { platform: "PrepInsta Wipro", link: "https://prepinsta.com/wipro/" },
        { platform: "GFG Wipro", link: "https://geeksforgeeks.org/wipro/" }
      ],
      aptitude: [
        { platform: "IndiaBIX", link: "https://indiabix.com/aptitude/wipro/" }
      ]
    },
    cutoff: {
      coding: "1/3 correct",
      aptitude: "60%",
      note: "Sectional cutoffs"
    },
    strategy: {
      finalTips: [
        "Practice essay writing (150-200 words)",
        "Know company values",
        "Clear communication"
      ],
      mistakesToAvoid: [
        "Don't neglect aptitude",
        "Prepare essay topics",
        "Basic coding only needed"
      ]
    },
    aiFeatures: {
      resumeTips: "Include BPO/Testing experience, Wipro keywords",
      interviewQuestions: [
        "Anagram Check", "FizzBuzz", "Why Wipro?"
      ],
      aiPromptSuggestion: "Wipro essay topics + aptitude questions"
    }
  },

  hcltech: {
    name: "hcltech",
    overview: {
      name: "HCL Technologies",
      tagline: "Building Tomorrow's Enterprise Today",
      description: "HCLTech is a global technology company focused on creating industry-leading solutions grounded in Engineering and powered by AI.",
      industry: "IT Services, Engineering, R&D",
      headquarters: "Noida, Uttar Pradesh, India"
    },
    hiring: {
      pattern: [
        { round: "Cognitive Assessment", details: "Aptitude + Reasoning + English" },
        { round: "Technical + Coding", details: "MCQ + 2 Coding questions" },
        { round: "Technical Interview", details: "DSA + Projects" },
        { round: "HR Round", details: "Final discussion" }
      ],
      difficulty: "Medium",
      importantPoints: ["HCL Tech Bee program", "Good for freshers"]
    },
    salary: {
      average: "₹6-7.5 LPA",
      intern: "₹45k monthly",
      bonus: "Variable"
    },
    examTimeline: {
      expected: "April-May 2025",
      lastYear: "April 2024",
      note: "Regular campus hiring"
    },
    preparation: {
      roadmap: "Cognitive → Coding → Technical Prep",
      topics: {
        mustDo: ["LinkedList", "Stacks", "Queues"],
        aptitude: {
          quantitative: ["Ratios", "Geometry", "Data Interpretation"],
          logical: ["Statement Assumption", "Course Action"],
          verbal: ["Sentence Improvement", "Comprehension"]
        },
        coreSubjects: {
          os: ["Virtual Memory", "File Systems"],
          dbms: ["ER Diagrams", "Stored Procedures"],
          oops: ["Interfaces", "Exception Handling"]
        },
        advanced: {
          systemDesign: ["REST API Design"],
          csConcepts: ["TCP/IP"]
        }
      },
      dailyPlanGuide: "3hr Test Pattern + 2hr DSA"
    },
    resources: {
      youtube: [
        { title: "HCL Full Stack by SDE Tiger", link: "https://youtube.com/playlist?list=hcl" }
      ],
      coding: [
        { platform: "FacePrep HCL", link: "https://faceprep.in/hcl/" },
        { platform: "Testbook HCL", link: "https://testbook.com/hcl/" }
      ],
      aptitude: [
        { platform: "Freshersworld", link: "https://www.freshersworld.com/" }
      ]
    },
    cutoff: {
      coding: "1/2 correct",
      aptitude: "65%",
      note: "Section-wise elimination"
    },
    strategy: {
      finalTips: [
        "Know HCL products (MEOT, etc)",
        "Practice sectional timing",
        "Project discussion ready"
      ],
      mistakesToAvoid: [
        "Don't skip reasoning",
        "Medium DSA enough",
        "Prepare company research"
      ]
    },
    aiFeatures: {
      resumeTips: "HCL Tech Bee mention, engineering projects",
      interviewQuestions: [
        "Reverse LinkedList", "Valid Parenthesis", "HCL projects?"
      ],
      aiPromptSuggestion: "HCL cognitive test pattern"
    }
  },

  mahindra: {
    name: "mahindra",
    overview: {
      name: "Mahindra & Mahindra",
      tagline: "Rise for Good",
      description: "Mahindra & Mahindra Limited is an Indian multinational automotive manufacturing corporation headquartered in Mumbai, Maharashtra, India.",
      industry: "Automotive, IT, Farm Equipment",
      headquarters: "Mumbai, Maharashtra, India"
    },
    hiring: {
      pattern: [
        { round: "Online Test", details: "Aptitude + Technical MCQ" },
        { round: "Technical Interview", details: "Core + Coding" },
        { round: "HR Round", details: "Final selection" }
      ],
      difficulty: "Medium",
      importantPoints: ["Multiple domains", "Good package"]
    },
    salary: {
      average: "₹8-12 LPA",
      intern: "₹60k monthly",
      bonus: "15%"
    },
    examTimeline: {
      expected: "June-July 2025",
      lastYear: "July 2024",
      note: "Domain-specific hiring"
    },
    preparation: {
      roadmap: "Aptitude → Domain Knowledge → Coding",
      topics: {
        mustDo: ["Sorting", "Searching", "Recursion"],
        aptitude: {
          quantitative: ["Mensuration", "Profit Loss"],
          logical: ["Puzzles", "Series"],
          verbal: ["RC", "Grammar"]
        },
        coreSubjects: {
          os: ["Process Management"],
          dbms: ["Triggers", "Views"],
          oops: ["Constructors", "Overloading"]
        },
        advanced: {
          systemDesign: ["Automotive Systems"],
          csConcepts: ["Embedded Systems"]
        }
      },
      dailyPlanGuide: "Domain + Aptitude + Coding"
    },
    resources: {
      youtube: [
        { title: "Mahindra Tech by Gate Smashers", link: "https://youtube.com/watch?v=mahindra" }
      ],
      coding: [
        { platform: "GFG Mahindra", link: "https://geeksforgeeks.org/mahindra/" }
      ],
      aptitude: [
        { platform: "CareerRide", link: "https://www.careerride.com/" }
      ]
    },
    cutoff: {
      coding: "No coding round usually",
      aptitude: "70%",
      note: "Technical MCQ heavy"
    },
    strategy: {
      finalTips: [
        "Know automotive domain",
        "Strong fundamentals",
        "Company values"
      ],
      mistakesToAvoid: [
        "Don't ignore technical MCQ",
        "Branch-specific prep",
        "Resume domain projects"
      ]
    },
    aiFeatures: {
      resumeTips: "Automotive projects, Mahindra Rise keywords",
      interviewQuestions: [
        "Bubble Sort", "SQL Queries", "Why Mahindra?"
      ],
      aiPromptSuggestion: "Mahindra technical MCQ practice"
    }
  },

  cognizant: {
    name: "cognizant",
    overview: {
      name: "Cognizant",
      tagline: "Be Cognizant of Greatness",
      description: "Cognizant is one of the world's leading professional services companies, helping clients to modernize technology and maximize operating efficiency.",
      industry: "IT Services, Consulting, Digital Engineering",
      headquarters: "Teaneck, New Jersey, USA (India HQ: Chennai)"
    },
    hiring: {
      pattern: [
        { round: "GenC Assessment", details: "Aptitude + Automation Testing + Coding" },
        { round: "Communication Assessment", details: "Speaking + Listening" },
        { round: "Technical + HR Interview", details: "Technical + Behavioral" }
      ],
      difficulty: "Easy-Medium",
      importantPoints: ["GenC/GenC Elevate/GenC Pro profiles", "Communication round crucial"]
    },
    salary: {
      average: "₹4.5-6.5 LPA (GenC)",
      intern: "₹40k monthly",
      bonus: "10%"
    },
    examTimeline: {
      expected: "Jan-Feb 2025",
      lastYear: "Feb 2024",
      note: "Mass hiring, multiple slots"
    },
    preparation: {
      roadmap: "GenC Test → Communication → Basic Tech",
      topics: {
        mustDo: ["Basic Coding", "Automation Concepts"],
        aptitude: {
          quantitative: ["Number System", "Averages"],
          logical: ["Data Interpretation", "Logical Puzzles"],
          verbal: ["Sentence Correction", "Vocab"]
        },
        coreSubjects: {
          os: ["Basic Concepts"],
          dbms: ["Basic SQL"],
          oops: ["Basic Java/Python"]
        },
        advanced: {
          systemDesign: "N/A",
          csConcepts: ["Selenium Basics"]
        }
      },
      dailyPlanGuide: "2hr GenC Practice + 1hr Communication"
    },
    resources: {
      youtube: [
        { title: "Cognizant GenC by Naresh iTech", link: "https://youtube.com/playlist?list=cognizant_genc" }
      ],
      coding: [
        { platform: "PrepInsta Cognizant", link: "https://prepinsta.com/cognizant/" }
      ],
      aptitude: [
        { platform: "IndiaBIX Cognizant", link: "https://indiabix.com/aptitude/cognizant/" }
      ]
    },
    cutoff: {
      coding: "1/1 basic",
      aptitude: "55-60%",
      note: "No negative marking"
    },
    strategy: {
      finalTips: [
        "Practice communication round",
        "Know Cognizant profiles",
        "Basic coding sufficient"
      ],
      mistakesToAvoid: [
        "Don't skip communication prep",
        "Profile selection important",
        "Know GenC differences"
      ]
    },
    aiFeatures: {
      resumeTips: "Cognizant GenC keywords, fresher-friendly",
      interviewQuestions: [
        "Prime Numbers", "String Reverse", "Why Cognizant?"
      ],
      aiPromptSuggestion: "GenC communication assessment"
    }
  }
  };



