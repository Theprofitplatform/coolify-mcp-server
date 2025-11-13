/**
 * Integration Tests for Coolify API
 *
 * These tests verify actual API connectivity.
 * Requires COOLIFY_BASE_URL and COOLIFY_TOKEN environment variables.
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const baseURL = process.env.COOLIFY_BASE_URL;
const token = process.env.COOLIFY_TOKEN;

// Skip tests if credentials not provided
const runIntegrationTests = baseURL && token;

describe('Coolify API Integration Tests', () => {
  let api: any;

  beforeAll(() => {
    if (runIntegrationTests) {
      api = axios.create({
        baseURL,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
    }
  });

  describe('API Connectivity', () => {
    (runIntegrationTests ? test : test.skip)('should connect to Coolify API', async () => {
      const response = await api.get('/api/v1/version');
      expect(response.status).toBe(200);
    });

    (runIntegrationTests ? test : test.skip)('should list teams', async () => {
      const response = await api.get('/api/v1/teams');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    (runIntegrationTests ? test : test.skip)('should list servers', async () => {
      const response = await api.get('/api/v1/servers');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    (runIntegrationTests ? test : test.skip)('should list projects', async () => {
      const response = await api.get('/api/v1/projects');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    (runIntegrationTests ? test : test.skip)('should handle 404 errors gracefully', async () => {
      await expect(
        api.get('/api/v1/nonexistent-endpoint')
      ).rejects.toThrow();
    });

    (runIntegrationTests ? test : test.skip)('should handle invalid authentication', async () => {
      const invalidApi = axios.create({
        baseURL,
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json'
        }
      });

      await expect(
        invalidApi.get('/api/v1/teams')
      ).rejects.toThrow();
    });
  });
});

// Info message if tests are skipped
if (!runIntegrationTests) {
  console.log('\n⚠️  Integration tests skipped: Set COOLIFY_BASE_URL and COOLIFY_TOKEN to run\n');
}
