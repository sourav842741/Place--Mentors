import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

import connectDb from "../config/db.js";
import MaintenanceQuestion from "../models/MaintenanceQuestion.js";

dotenv.config();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

/*
  Clean + Valid Seed Data
  Every record has:
  - type
  - question
  - answer
  - explanation
*/

const seedData = [
  // ================= HR =================
  {
    type: "hr",
    question: "Tell me about yourself.",
    answer: "Give a short professional introduction using Present-Past-Future format.",
    explanation: "Focus on education, skills, experience, and career goals.",
  },
  {
    type: "hr",
    question: "Why should we hire you?",
    answer: "Because my skills, attitude, and learning ability match this role.",
    explanation: "Mention company fit and value you bring.",
  },
  {
    type: "hr",
    question: "What are your strengths?",
    answer: "Problem solving, teamwork, adaptability, communication.",
    explanation: "Give real examples.",
  },
  {
    type: "hr",
    question: "What are your weaknesses?",
    answer: "Mention one genuine weakness and how you are improving it.",
    explanation: "Show growth mindset.",
  },
  {
    type: "hr",
    question: "Where do you see yourself in 5 years?",
    answer: "Growing into a skilled professional and taking responsibility.",
    explanation: "Balance ambition with realism.",
  },

  // ================= APTITUDE =================
  {
    type: "aptitude",
    question: "What is 25% of 400?",
    answer: "100",
    explanation: "400 × 25 / 100 = 100",
  },
  {
    type: "aptitude",
    question: "Average of 10, 20, 30?",
    answer: "20",
    explanation: "(10 + 20 + 30) / 3 = 20",
  },
  {
    type: "aptitude",
    question: "Simple interest on 1000 at 10% for 2 years?",
    answer: "200",
    explanation: "P × R × T / 100",
  },
  {
    type: "aptitude",
    question: "LCM of 12 and 18?",
    answer: "36",
    explanation: "Smallest common multiple.",
  },
  {
    type: "aptitude",
    question: "If train speed is 60 km/h, distance in 2 hours?",
    answer: "120 km",
    explanation: "Speed × Time",
  },

  // ================= CODING =================
  {
    type: "coding",
    question: "What is output of: for(i=0;i<3;i++) print(i)",
    answer: "012",
    explanation: "Loop runs for i = 0,1,2",
  },
  {
    type: "coding",
    question: "What is output of 5 + '5' in JavaScript?",
    answer: "55",
    explanation: "String concatenation happens.",
  },
  {
    type: "coding",
    question: "What is array index start position in most languages?",
    answer: "0",
    explanation: "Arrays are zero indexed in JS, Java, C, C++.",
  },
  {
    type: "coding",
    question: "Difference between == and === in JavaScript?",
    answer: "== checks value, === checks value + type.",
    explanation: "Strict equality avoids coercion.",
  },
  {
    type: "coding",
    question: "What does break do in a loop?",
    answer: "Stops the loop immediately.",
    explanation: "Control exits the loop.",
  },

  // ================= VOCAB =================
  {
    type: "vocab",
    question: "Meaning of Resilient",
    answer: "Able to recover quickly from difficulties.",
    explanation: "A resilient person keeps moving forward.",
  },
  {
    type: "vocab",
    question: "Meaning of Diligent",
    answer: "Hardworking and careful.",
    explanation: "A diligent student practices daily.",
  },
  {
    type: "vocab",
    question: "Meaning of Pragmatic",
    answer: "Practical and realistic.",
    explanation: "Use practical solutions.",
  },

  // ================= MYTH =================
  {
    type: "myth",
    question: "Myth: Only toppers get jobs.",
    answer: "Fact: Skills, projects, and consistency matter more.",
    explanation: "Many average students crack top jobs.",
  },
  {
    type: "myth",
    question: "Myth: You need IIT tag for success.",
    answer: "Fact: Skills and effort matter everywhere.",
    explanation: "Many successful engineers are from non-IIT colleges.",
  },

  // ================= SHORTCUT =================
  {
    type: "shortcut",
    question: "VS Code Command Palette shortcut?",
    answer: "Ctrl + Shift + P",
    explanation: "Open all commands quickly.",
  },
  {
    type: "shortcut",
    question: "Open terminal in VS Code?",
    answer: "Ctrl + `",
    explanation: "Backtick key.",
  },
  {
    type: "shortcut",
    question: "Browser DevTools shortcut?",
    answer: "F12",
    explanation: "Inspect webpage.",
  },

  // ================= QUOTES =================
  {
    type: "quote",
    question: "Motivational Quote",
    answer: "Success is the sum of small efforts repeated daily.",
    explanation: "Consistency wins.",
  },
  {
    type: "quote",
    question: "Motivational Quote",
    answer: "Discipline beats motivation.",
    explanation: "Habits create results.",
  },
  {
    type: "quote",
    question: "Motivational Quote",
    answer: "Start where you are. Use what you have.",
    explanation: "Progress begins now.",
  },
  // ================= HR =================
  { type: "hr", question: "Tell me about a time you worked in a team.", answer: "Describe a group project, your role, and the final outcome.", explanation: "Focus on collaboration and conflict resolution." },
  { type: "hr", question: "What is your proudest moment?", answer: "Choose a moment that shows hard work or skill mastery.", explanation: "It doesn't have to be academic; it can be a personal milestone." },
  { type: "hr", question: "How do you handle a tight deadline?", answer: "I break the task into smaller parts and eliminate distractions.", explanation: "Prioritization is the key word here." },
  { type: "hr", question: "Would you work late hours or weekends?", answer: "I am committed to meeting goals, though I value efficiency during work hours.", explanation: "Shows dedication while maintaining a boundary." },
  { type: "hr", question: "What do you know about our company?", answer: "Mention their products, mission, and recent news.", explanation: "Shows you did your homework." },
  { type: "hr", question: "What is your expected salary?", answer: "As a fresher, I am focused on learning and open to industry standards.", explanation: "Avoid giving a hard number too early." },
  { type: "hr", question: "How do you define success?", answer: "Achieving goals and adding value to the team/client.", explanation: "Connect personal growth with company success." },
  { type: "hr", question: "Tell me about a difficult boss or teammate.", answer: "Focus on how you stayed professional to get the work done.", explanation: "Never talk bad about people; focus on the 'work' challenge." },
  { type: "hr", question: "What are your long-term career goals?", answer: "To become a subject matter expert and lead impactful projects.", explanation: "Shows ambition and stability." },
  { type: "hr", question: "Are you comfortable with repetitive tasks?", answer: "Yes, I find ways to automate them or maintain focus for quality.", explanation: "Shows patience and a developer mindset." },

  // ================= APTITUDE =================
  { type: "aptitude", question: "Ratio of 45 minutes to 3 hours?", answer: "1:4", explanation: "45 min / 180 min = 1/4." },
  { type: "aptitude", question: "A shopkeeper buys a pen for 10 and sells for 12. Profit %?", answer: "20%", explanation: "(2/10) * 100 = 20%." },
  { type: "aptitude", question: "Sum of first 10 natural numbers?", answer: "55", explanation: "n(n+1)/2 => 10(11)/2 = 55." },
  { type: "aptitude", question: "Average of first 5 prime numbers?", answer: "5.6", explanation: "(2+3+5+7+11) / 5 = 5.6." },
  { type: "aptitude", question: "A boat goes 10 km/h in still water. Stream speed is 2 km/h. Speed downstream?", answer: "12 km/h", explanation: "10 + 2 = 12 km/h." },
  { type: "aptitude", question: "If 1st Jan 2024 was Monday, what was 8th Jan?", answer: "Monday", explanation: "Same day repeats every 7 days." },
  { type: "aptitude", question: "Simplification: 50 + 50 * 0 + 1?", answer: "51", explanation: "BODMAS: 50 * 0 = 0. Then 50 + 0 + 1 = 51." },
  { type: "aptitude", question: "Next in series: 1, 8, 27, 64, ?", answer: "125", explanation: "Cubes of numbers: 1^3, 2^3, 3^3, 4^3, 5^3." },
  { type: "aptitude", question: "HCF of 15 and 25?", answer: "5", explanation: "Highest common factor is 5." },
  { type: "aptitude", question: "If 3x + 5 = 20, what is x?", answer: "5", explanation: "3x = 15 => x = 5." },
  

  // ================= CODING =================
  { type: "coding", question: "Output of: console.log(typeof []) in JS?", answer: "object", explanation: "Arrays are a special type of object in JS." },
  { type: "coding", question: "What is 'const' in ES6?", answer: "A variable that cannot be reassigned.", explanation: "It creates a block-scoped constant." },
  { type: "coding", question: "What is the 'this' keyword in JS?", answer: "Refers to the object it belongs to.", explanation: "Its value depends on how the function is called." },
  { type: "coding", question: "Java: Difference between 'final' and 'finally'?", answer: "final is a keyword, finally is a block.", explanation: "finally always executes after try-catch." },
  { type: "coding", question: "What is a 'Foreign Key' in SQL?", answer: "A link between two tables.", explanation: "It refers to the Primary Key of another table." },
  { type: "coding", question: "Python: What does 'len()' do?", answer: "Returns the number of items in an object.", explanation: "Works on strings, lists, tuples, etc." },
  { type: "coding", question: "What is the <a> tag in HTML used for?", answer: "Hyperlinks", explanation: "Stands for 'Anchor'." },
  { type: "coding", question: "What is the purpose of 'CSS Media Queries'?", answer: "To make websites responsive.", explanation: "Applies styles based on screen size." },
  { type: "coding", question: "What is a 'Stack' data structure?", answer: "LIFO (Last In, First Out).", explanation: "Like a stack of plates." },
  { type: "coding", question: "What is 'API' full form?", answer: "Application Programming Interface", explanation: "Allows two apps to talk to each other." },
 
  { type: "myth", question: "Myth: Only CSE students can get IT jobs.", answer: "Fact: Skills matter more than your branch.", explanation: "Many ECE, ME, and Civil students crack top tech roles." },
  { type: "myth", question: "Myth: You need a 90%+ CGPA for every company.", answer: "Fact: Most companies require 60% or 70%.", explanation: "High CGPA helps, but projects and skills are the real winners." },
  { type: "myth", question: "Myth: Gap years mean your career is over.", answer: "Fact: You can explain gaps with valid reasons/skills.", explanation: "Focus on what you learned during that gap." },
  { type: "myth", question: "Myth: Startup jobs are not stable.", answer: "Fact: Startups offer faster learning and high ownership.", explanation: "Many big MNCs started as small, 'unstable' startups." },
  { type: "myth", question: "Myth: You must know 5+ languages to be a coder.", answer: "Fact: Master one language and DSA deeply.", explanation: "Logic is the same; syntax is just a tool." },
  { type: "myth", question: "Myth: Introverts can't clear HR interviews.", answer: "Fact: Honest and clear communication beats being loud.", explanation: "Introverts often give more thoughtful, precise answers." },
  { type: "myth", question: "Myth: Certifications are enough to get a job.", answer: "Fact: Projects and practical proof are more important.", explanation: "Companies hire for what you can build, not just certificates." },
  { type: "myth", question: "Myth: You need to be a math genius to code.", answer: "Fact: Basic logic and problem-solving are enough.", explanation: "Unless you're in AI/Research, high-level math is rarely used." },
  { type: "myth", question: "Myth: Competitive Programming is the only way.", answer: "Fact: Development and Open Source are also great paths.", explanation: "Building real apps is as valuable as solving puzzles." },
  { type: "myth", question: "Myth: Resumes should be 3-4 pages long.", answer: "Fact: For freshers, a 1-page resume is best.", explanation: "Recruiters only spend 6 seconds looking at a resume." },

];

const runSeed = async () => {
  try {
    await connectDb();
    console.log("🗄️ MongoDB Connected");

    await MaintenanceQuestion.deleteMany({});
    console.log("🗑️ Old data deleted");

    await MaintenanceQuestion.insertMany(seedData);
    console.log(`${seedData.length} records inserted successfully`);

    const stats = await MaintenanceQuestion.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    console.log("📊 Type Stats:");
    console.table(stats);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Failed:", error.message);
    process.exit(1);
  }
};

runSeed();