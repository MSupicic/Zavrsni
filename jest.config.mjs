import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import nextJest from "next/jest";

const createJestConfig = nextJest({
  // This should point to the root of your Next.js project
  dir: ".",
});

// Combine all configs into one
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  preset: "ts-jest",
  verbose: true,
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/components/$1",
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/pages/_app.tsx",
    "!src/pages/_document.tsx",
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest", // Use "babel-jest" directly
  },
};

// Export as ES module

// Export as ES module
export default createJestConfig(customJestConfig);
