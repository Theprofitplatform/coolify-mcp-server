/**
 * Unit Tests for API Client
 *
 * Tests the core API client functionality with mocked responses
 */

import { createMockAPI, MockCoolifyAPI } from '../helpers/mock-api.js';
import { mockApplications, mockServers, mockProjects } from '../fixtures/mock-responses.js';

describe('Coolify API Client', () => {
  let mockAPI: MockCoolifyAPI;

  beforeEach(() => {
    mockAPI = createMockAPI();
  });

  describe('Authentication', () => {
    test('should authenticate with valid token', async () => {
      const result = await mockAPI.getVersion();
      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('version');
    });

    test('should reject invalid token', async () => {
      const invalidAPI = createMockAPI({ token: 'invalid-token' });

      await expect(invalidAPI.getVersion()).rejects.toThrow('Unauthorized');
    });

    test('should reject missing token', async () => {
      const noTokenAPI = createMockAPI({ token: '' });

      await expect(noTokenAPI.getVersion()).rejects.toThrow('Unauthorized');
    });
  });

  describe('Server Operations', () => {
    test('should list servers', async () => {
      const result = await mockAPI.listServers();

      expect(result.status).toBe(200);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toEqual(mockServers);
    });

    test('should return server with correct structure', async () => {
      const result = await mockAPI.listServers();
      const server = result.data[0];

      expect(server).toHaveProperty('uuid');
      expect(server).toHaveProperty('name');
      expect(server).toHaveProperty('ip');
      expect(server).toHaveProperty('port');
    });
  });

  describe('Project Operations', () => {
    test('should list projects', async () => {
      const result = await mockAPI.listProjects();

      expect(result.status).toBe(200);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toEqual(mockProjects);
    });

    test('should return project with correct structure', async () => {
      const result = await mockAPI.listProjects();
      const project = result.data[0];

      expect(project).toHaveProperty('uuid');
      expect(project).toHaveProperty('name');
      expect(project).toHaveProperty('description');
    });
  });

  describe('Application Operations', () => {
    test('should list applications', async () => {
      const result = await mockAPI.listApplications();

      expect(result.status).toBe(200);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    test('should get single application by UUID', async () => {
      const uuid = mockApplications[0].uuid;
      const result = await mockAPI.getApplication(uuid);

      expect(result.status).toBe(200);
      expect(result.data.uuid).toBe(uuid);
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('status');
    });

    test('should throw error for non-existent application', async () => {
      await expect(
        mockAPI.getApplication('non-existent-uuid')
      ).rejects.toThrow('Application not found');
    });

    test('should restart application', async () => {
      const uuid = mockApplications[0].uuid;
      const result = await mockAPI.restartApplication(uuid);

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('message');
      expect(result.data.message).toContain('restarted');
    });

    test('should stop application', async () => {
      const uuid = mockApplications[0].uuid;
      const result = await mockAPI.stopApplication(uuid);

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('message');
      expect(result.data.message).toContain('stopped');
    });
  });

  describe('Service Operations', () => {
    test('should list services', async () => {
      const result = await mockAPI.listServices();

      expect(result.status).toBe(200);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    test('should return service with correct structure', async () => {
      const result = await mockAPI.listServices();
      const service = result.data[0];

      expect(service).toHaveProperty('uuid');
      expect(service).toHaveProperty('name');
      expect(service).toHaveProperty('type');
      expect(service).toHaveProperty('status');
    });
  });

  describe('Response Timing', () => {
    test('should complete requests within reasonable time', async () => {
      const startTime = Date.now();
      await mockAPI.getVersion();
      const endTime = Date.now();

      // Mock API should respond within 200ms
      expect(endTime - startTime).toBeLessThan(200);
    });

    test('should handle concurrent requests', async () => {
      const promises = [
        mockAPI.getVersion(),
        mockAPI.listServers(),
        mockAPI.listProjects(),
        mockAPI.listApplications()
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(result.status).toBe(200);
      });
    });
  });
});
