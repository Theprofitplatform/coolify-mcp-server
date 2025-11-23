/**
 * Get Database Logs Tool
 * Retrieves logs for a specific database
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetDatabaseLogsSchema = z.object({
  uuid: z.string().describe('UUID of the database'),
  lines: z.number().optional().describe('Number of lines to retrieve (default: 100)'),
});

export class GetDatabaseLogsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_database_logs';
  }

  get description(): string {
    return 'Get logs for a specific database. Essential for debugging database issues, monitoring queries, and troubleshooting performance problems.';
  }

  get inputSchema(): z.ZodSchema {
    return GetDatabaseLogsSchema;
  }

  async execute(args: z.infer<typeof GetDatabaseLogsSchema>): Promise<string> {
    this.logger.info(`Fetching logs for database: ${args.uuid}`);

    try {
      const queryParams = args.lines ? `?lines=${args.lines}` : '';
      const logs = await this.apiGet(`/databases/${args.uuid}/logs${queryParams}`);

      this.logger.info(`Successfully fetched logs for database: ${args.uuid}`);

      return this.formatResponse(logs);
    } catch (error: any) {
      this.logger.error(`Failed to fetch logs for database ${args.uuid}`, error);
      throw new Error(`Failed to get database logs: ${error.message}`);
    }
  }
}
