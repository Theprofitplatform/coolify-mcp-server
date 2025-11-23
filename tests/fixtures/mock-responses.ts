/**
 * Mock API Responses for Testing
 *
 * These fixtures simulate Coolify API responses
 */

export const mockVersion = {
  version: '4.0.0-beta.123',
  latest_version: '4.0.0-beta.123',
  is_latest: true
};

export const mockTeams = [
  {
    id: 1,
    name: 'Default Team',
    description: 'Default team',
    personal_team: true
  }
];

export const mockServers = [
  {
    uuid: 'server-uuid-1',
    name: 'production-server',
    description: 'Production VPS',
    ip: '31.97.222.218',
    port: 22,
    user: 'root',
    validation_logs: null,
    is_build_server: false,
    is_metrics_enabled: true
  }
];

export const mockProjects = [
  {
    uuid: 'project-uuid-1',
    name: 'test-project',
    description: 'Test project for development'
  }
];

export const mockApplications = [
  {
    uuid: 'app-uuid-1',
    name: 'test-app',
    description: 'Test application',
    fqdn: 'test.theprofitplatform.com.au',
    status: 'running',
    git_repository: 'https://github.com/user/repo',
    git_branch: 'main',
    build_pack: 'nixpacks',
    ports_exposes: '3000'
  },
  {
    uuid: 'app-uuid-2',
    name: 'staging-app',
    description: 'Staging application',
    fqdn: 'staging.theprofitplatform.com.au',
    status: 'stopped',
    git_repository: 'https://github.com/user/repo',
    git_branch: 'develop',
    build_pack: 'dockerfile',
    ports_exposes: '3000'
  }
];

export const mockServices = [
  {
    uuid: 'service-uuid-1',
    name: 'postgres-db',
    type: 'postgresql',
    status: 'running'
  },
  {
    uuid: 'service-uuid-2',
    name: 'redis-cache',
    type: 'redis',
    status: 'running'
  }
];

export const mockEnvironmentVariables = [
  {
    key: 'API_KEY',
    value: 'test-api-key-value',
    is_build_time: false,
    is_preview: false
  },
  {
    key: 'DATABASE_URL',
    value: 'postgresql://user:pass@localhost:5432/db',
    is_build_time: true,
    is_preview: false
  }
];

export const mockLogs = {
  logs: [
    '[2025-11-16 10:00:00] Application started',
    '[2025-11-16 10:00:01] Listening on port 3000',
    '[2025-11-16 10:00:02] Database connected'
  ].join('\n')
};

export const mockDeployment = {
  uuid: 'deployment-uuid-1',
  status: 'success',
  started_at: '2025-11-16T10:00:00Z',
  finished_at: '2025-11-16T10:05:00Z'
};

export const mockResourceUsage = {
  cpu_usage: 45.2,
  memory_usage: 1024,
  memory_total: 2048,
  disk_usage: 15360,
  disk_total: 51200
};

// Error responses
export const mockErrors = {
  unauthorized: {
    message: 'Unauthorized',
    status: 401
  },
  notFound: {
    message: 'Resource not found',
    status: 404
  },
  serverError: {
    message: 'Internal server error',
    status: 500
  },
  validationError: {
    message: 'Validation failed',
    errors: {
      name: ['Name is required']
    },
    status: 422
  }
};
