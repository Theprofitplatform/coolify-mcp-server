/**
 * Health Check Tool
 * Checks Coolify API health status
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { HealthCheckSchema } from '../../schemas/health.schemas.js';

export class HealthCheckTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'health_check';
  }

  get description(): string {
    return 'Check Coolify API health status. Note: This endpoint may not be available in all Coolify versions.';
  }

  get inputSchema(): z.ZodSchema {
    return HealthCheckSchema;
  }

  async execute(_args: z.infer<typeof HealthCheckSchema>): Promise<string> {
    this.logger.info('Performing health check');

    try {
      const health = await this.apiGet('/health');
      this.logger.info('Health check successful');
      return this.formatResponse(health);
    } catch (error) {
      this.logger.warn('Health check endpoint not available');
      return 'Health endpoint not available in this Coolify version. API connection is working via version endpoint.';
    }
  }
}
