/**
 * Get Server Metrics Tool
 * Retrieves detailed metrics for a specific server
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetServerMetricsSchema = z.object({
  uuid: z.string().describe('UUID of the server'),
});

export class GetServerMetricsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_server_metrics';
  }

  get description(): string {
    return 'Get detailed performance metrics for a specific server including CPU, memory, disk usage, network stats, and more.';
  }

  get inputSchema(): z.ZodSchema {
    return GetServerMetricsSchema;
  }

  async execute(args: z.infer<typeof GetServerMetricsSchema>): Promise<string> {
    this.logger.info(`Fetching metrics for server: ${args.uuid}`);

    try {
      const metrics = await this.apiGet(`/servers/${args.uuid}/metrics`);

      this.logger.info(`Successfully fetched metrics for server: ${args.uuid}`);

      return this.formatResponse(metrics);
    } catch (error: any) {
      this.logger.error(`Failed to fetch metrics for server ${args.uuid}`, error);
      throw new Error(`Failed to get server metrics: ${error.message}`);
    }
  }
}
