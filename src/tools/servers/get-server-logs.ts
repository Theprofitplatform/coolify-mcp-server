/**
 * Get Server Logs Tool
 * Retrieves logs for a specific server
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetServerLogsSchema = z.object({
  uuid: z.string().describe('UUID of the server'),
  lines: z.number().optional().describe('Number of lines to retrieve (default: 100)'),
  type: z.enum(['system', 'docker', 'all']).optional().describe('Type of logs to retrieve'),
});

export class GetServerLogsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_server_logs';
  }

  get description(): string {
    return 'Get logs for a specific server. Useful for debugging server issues, monitoring system health, and troubleshooting Docker containers.';
  }

  get inputSchema(): z.ZodSchema {
    return GetServerLogsSchema;
  }

  async execute(args: z.infer<typeof GetServerLogsSchema>): Promise<string> {
    this.logger.info(`Fetching logs for server: ${args.uuid}`);

    try {
      const params: string[] = [];
      if (args.lines) params.push(`lines=${args.lines}`);
      if (args.type) params.push(`type=${args.type}`);
      
      const queryString = params.length > 0 ? '?' + params.join('&') : '';
      const logs = await this.apiGet(`/servers/${args.uuid}/logs${queryString}`);

      this.logger.info(`Successfully fetched logs for server: ${args.uuid}`);

      return this.formatResponse(logs);
    } catch (error: any) {
      this.logger.error(`Failed to fetch logs for server ${args.uuid}`, error);
      throw new Error(`Failed to get server logs: ${error.message}`);
    }
  }
}
