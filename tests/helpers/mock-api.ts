/**
 * Mock API Client for Testing
 *
 * Simulates Coolify API without making real HTTP requests
 */

import { mockVersion, mockTeams, mockServers, mockProjects, mockApplications, mockServices, mockErrors } from '../fixtures/mock-responses.js';

export class MockCoolifyAPI {
  private baseURL: string;
  private token: string;

  constructor(baseURL: string, token: string) {
    this.baseURL = baseURL;
    this.token = token;
  }

  // Simulate API delay
  private async delay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Simulate authentication check
  private checkAuth(): void {
    if (this.token === null ||
        this.token === undefined ||
        this.token === '' ||
        this.token === 'invalid-token') {
      throw new Error('Unauthorized');
    }
  }

  async getVersion() {
    this.checkAuth();
    await this.delay();
    return { data: mockVersion, status: 200 };
  }

  async listTeams() {
    this.checkAuth();
    await this.delay();
    return { data: mockTeams, status: 200 };
  }

  async listServers() {
    this.checkAuth();
    await this.delay();
    return { data: mockServers, status: 200 };
  }

  async listProjects() {
    this.checkAuth();
    await this.delay();
    return { data: mockProjects, status: 200 };
  }

  async listApplications() {
    this.checkAuth();
    await this.delay();
    return { data: mockApplications, status: 200 };
  }

  async getApplication(uuid: string) {
    this.checkAuth();
    await this.delay();

    const app = mockApplications.find(a => a.uuid === uuid);
    if (!app) {
      throw new Error('Application not found');
    }

    return { data: app, status: 200 };
  }

  async restartApplication(uuid: string) {
    this.checkAuth();
    await this.delay(500); // Longer delay for restart

    const app = mockApplications.find(a => a.uuid === uuid);
    if (!app) {
      throw new Error('Application not found');
    }

    return {
      data: { message: 'Application restarted successfully' },
      status: 200
    };
  }

  async stopApplication(uuid: string) {
    this.checkAuth();
    await this.delay(300);

    const app = mockApplications.find(a => a.uuid === uuid);
    if (!app) {
      throw new Error('Application not found');
    }

    return {
      data: { message: 'Application stopped successfully' },
      status: 200
    };
  }

  async listServices() {
    this.checkAuth();
    await this.delay();
    return { data: mockServices, status: 200 };
  }

  // Helper to create mock errors
  static mockError(type: keyof typeof mockErrors) {
    const error = mockErrors[type];
    const err = new Error(error.message) as any;
    err.response = {
      status: error.status,
      data: error
    };
    return err;
  }
}

// Factory function for easy test setup
export function createMockAPI(options?: { token?: string; baseURL?: string }) {
  return new MockCoolifyAPI(
    options?.baseURL ?? 'http://localhost:8000',
    options?.token ?? 'test-token-12345'
  );
}
