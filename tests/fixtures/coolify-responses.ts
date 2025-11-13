/**
 * Test Fixtures - Mock Coolify API Responses
 *
 * Use these fixtures for unit tests without hitting the real API
 */

export const mockVersion = {
  version: '4.0.0-beta.420.1',
  build: 'production'
};

export const mockTeam = {
  id: 'team-uuid-123',
  name: 'My Team',
  description: 'Test team',
  created_at: '2024-01-01T00:00:00Z'
};

export const mockTeams = [mockTeam];

export const mockServer = {
  id: 'server-uuid-123',
  name: 'Server-1',
  ip: '192.168.1.10',
  user: 'root',
  port: 22,
  description: 'Production server',
  created_at: '2024-01-01T00:00:00Z'
};

export const mockServers = [
  mockServer,
  {
    id: 'server-uuid-456',
    name: 'Server-2',
    ip: '192.168.1.11',
    user: 'root',
    port: 22,
    description: 'Staging server',
    created_at: '2024-01-01T00:00:00Z'
  }
];

export const mockServerResources = {
  cpu: 45.2,
  memory: 62.8,
  disk: 34.5,
  network_rx: 1024000,
  network_tx: 2048000,
  timestamp: '2024-01-01T12:00:00Z'
};

export const mockProject = {
  id: 'project-uuid-123',
  name: 'My Project',
  description: 'Test project',
  team_id: 'team-uuid-123',
  created_at: '2024-01-01T00:00:00Z'
};

export const mockProjects = Array.from({ length: 12 }, (_, i) => ({
  id: `project-uuid-${i}`,
  name: `Project ${i + 1}`,
  description: `Test project ${i + 1}`,
  team_id: 'team-uuid-123',
  created_at: '2024-01-01T00:00:00Z'
}));

export const mockService = {
  id: 'service-uuid-123',
  name: 'postgres-db',
  type: 'postgresql',
  status: 'running',
  project_id: 'project-uuid-123',
  created_at: '2024-01-01T00:00:00Z'
};

export const mockServices = Array.from({ length: 11 }, (_, i) => ({
  id: `service-uuid-${i}`,
  name: `service-${i + 1}`,
  type: i % 3 === 0 ? 'postgresql' : i % 3 === 1 ? 'mysql' : 'redis',
  status: 'running',
  project_id: 'project-uuid-123',
  created_at: '2024-01-01T00:00:00Z'
}));

export const mockApplication = {
  id: 'app-uuid-123',
  name: 'my-app',
  git_repository: 'https://github.com/user/repo',
  git_branch: 'main',
  status: 'running',
  domain: 'app.theprofitplatform.com.au',
  project_id: 'project-uuid-123',
  created_at: '2024-01-01T00:00:00Z'
};

export const mockDeployment = {
  id: 'deployment-uuid-123',
  application_id: 'app-uuid-123',
  status: 'success',
  commit_sha: 'abc123def456',
  started_at: '2024-01-01T12:00:00Z',
  completed_at: '2024-01-01T12:05:00Z',
  duration: 300
};

export const mockEnvironment = {
  id: 'env-uuid-123',
  name: 'production',
  project_id: 'project-uuid-123',
  created_at: '2024-01-01T00:00:00Z'
};

export const mockPrivateKey = {
  id: 'key-uuid-123',
  name: 'deploy-key',
  description: 'SSH key for deployments',
  fingerprint: 'SHA256:abc123...',
  created_at: '2024-01-01T00:00:00Z'
};

export const mockErrorResponse = {
  error: {
    message: 'Resource not found',
    code: 404,
    details: 'The requested resource does not exist'
  }
};

export const mockRateLimitError = {
  error: {
    message: 'Rate limit exceeded',
    code: 429,
    details: 'Too many requests. Retry after 60 seconds',
    retry_after: 60
  }
};
