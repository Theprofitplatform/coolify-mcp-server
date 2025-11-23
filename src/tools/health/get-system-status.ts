/**
 * Get System Status Tool
 * Retrieves overall system health and status
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetSystemStatusSchema = z.object({});

export class GetSystemStatusTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_system_status';
  }

  get description(): string {
    return 'Get overall system status including health of all servers, resource usage, active deployments, and system-wide metrics.';
  }

  get inputSchema(): z.ZodSchema {
    return GetSystemStatusSchema;
  }

  async execute(args: z.infer<typeof GetSystemStatusSchema>): Promise<string> {
    this.logger.info('Fetching system status');

    try {
      // Note: Coolify API doesn't have a /system/status endpoint
      // Aggregate status from multiple endpoints
      const [servers, applications, databases, services] = await Promise.all([
        this.apiGet('/servers').catch(() => []),
        this.apiGet('/applications').catch(() => []),
        this.apiGet('/databases').catch(() => []),
        this.apiGet('/services').catch(() => []),
      ]);

      const status = {
        servers: {
          total: servers.length || 0,
          online: servers.filter((s: any) => s.status === 'online' || s.settings?.is_reachable).length || 0,
          offline: servers.filter((s: any) => s.status === 'offline' || !s.settings?.is_reachable).length || 0,
        },
        applications: {
          total: applications.length || 0,
          running: applications.filter((a: any) => a.status === 'running').length || 0,
          stopped: applications.filter((a: any) => a.status === 'stopped' || a.status === 'exited').length || 0,
          error: applications.filter((a: any) => a.status?.includes('error') || a.status?.includes('failed')).length || 0,
        },
        databases: {
          total: databases.length || 0,
          running: databases.filter((d: any) => d.status === 'running').length || 0,
          stopped: databases.filter((d: any) => d.status === 'stopped' || d.status === 'exited').length || 0,
        },
        services: {
          total: services.length || 0,
          running: services.filter((s: any) => s.status === 'running').length || 0,
          stopped: services.filter((s: any) => s.status === 'stopped' || s.status === 'exited').length || 0,
        },
        overall_health: 'healthy',
      };

      // Determine overall health
      if (status.servers.offline > 0 || status.applications.error > 0) {
        status.overall_health = 'degraded';
      }
      if (status.servers.online === 0 || (status.applications.running === 0 && status.applications.total > 0)) {
        status.overall_health = 'critical';
      }

      this.logger.info('Successfully aggregated system status');

      return this.formatResponse(status);
    } catch (error: any) {
      this.logger.error('Failed to fetch system status', error);
      throw new Error(`Failed to get system status: ${error.message}`);
    }
  }
}
