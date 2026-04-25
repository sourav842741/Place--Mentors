/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",

  // ESM project support
  transform: {},

  moduleFileExtensions: ["js", "mjs", "json"],

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },

  testMatch: ["**/tests/**/*.test.js"],

  collectCoverageFrom: [
    "utils/**/*.js",
    "middlewares/**/*.js",
    "controllers/**/*.js",

    "!utils/cronJobs.js",
    "!utils/codeExecutor.js",
    "!utils/promptBuilder.js",
    "!utils/youtubeHelper.js"
  ],

  coverageDirectory: "coverage",

  coverageReporters: ["text", "lcov", "html"],

  clearMocks: true,
  verbose: true
};