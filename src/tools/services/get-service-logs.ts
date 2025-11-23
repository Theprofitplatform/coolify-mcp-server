/**
 * Get Service Logs Tool
 * Retrieves logs for a specific service
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetServiceLogsSchema = z.object({
  uuid: z.string().describe('UUID of the service'),
  lines: z.number().optional().describe('Number of lines to retrieve (default: 100)'),
});

export class GetServiceLogsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_service_logs';
  }

  get description(): string {
    return 'Get logs for a specific service. Useful for debugging and monitoring service behavior.';
  }

  get inputSchema(): z.ZodSchema {
    return GetServiceLogsSchema;
  }

  async execute(args: z.infer<typeof GetServiceLogsSchema>): Promise<string> {
    this.logger.info(`Fetching logs for service: ${args.uuid}`);

    try {
      const queryParams = args.lines ? `?lines=${args.lines}` : '';
      const logs = await this.apiGet(`/services/${args.uuid}/logs${queryParams}`);

      this.logger.info(`Successfully fetched logs for service: ${args.uuid}`);

      return this.formatResponse(logs);
    } catch (error: any) {
      this.logger.error(`Failed to fetch logs for service ${args.uuid}`, error);
      throw new Error(`Failed to get service logs: ${error.message}`);
    }
  }
}
