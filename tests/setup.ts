/**
 * Global Test Setup
 *
 * This file runs before all tests and sets up the test environment
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Global test utilities
global.testUtils = {
  // Helper to wait for async operations
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to generate random strings for testing
  randomString: (length: number = 10) => {
    return Math.random().toString(36).substring(2, 2 + length);
  },

  // Helper to check if we should run integration tests
  shouldRunIntegrationTests: () => {
    return process.env.COOLIFY_BASE_URL &&
           process.env.COOLIFY_TOKEN &&
           process.env.COOLIFY_BASE_URL !== 'http://localhost:8000';
  }
};

// Extend global namespace for TypeScript
declare global {
  var testUtils: {
    wait: (ms: number) => Promise<void>;
    randomString: (length?: number) => string;
    shouldRunIntegrationTests: () => boolean;
  };
}

export {};
