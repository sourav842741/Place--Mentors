/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",

  transform: {},

  moduleFileExtensions: ["js", "mjs", "json"],

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  testMatch: ["**/tests/**/*.test.js"],

  collectCoverageFrom: [
    "utils/**/*.js",
    "middlewares/**/*.js",
    "controllers/**/*.js",

    "!utils/cronJobs.js",
    "!utils/codeExecutor.js",
    "!utils/promptBuilder.js",
    "!utils/youtubeHelper.js",
  ],

  coverageDirectory: "coverage",

  coverageReporters: ["text", "lcov", "html"],

  clearMocks: true,
  verbose: true,

  //  IMPORTANT FIXES
  testTimeout: 30000,
  maxWorkers: 1,
  detectOpenHandles: true,
  forceExit: true,
};