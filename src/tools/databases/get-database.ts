/**
 * Get Database Tool
 * Retrieves detailed information about a specific database
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { GetDatabaseSchema } from '../../schemas/database.schemas.js';

export class GetDatabaseTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_database';
  }

  get description(): string {
    return 'Get detailed information about a specific database including type, status, configuration, and connection details.';
  }

  get inputSchema(): z.ZodSchema {
    return GetDatabaseSchema;
  }

  async execute(args: z.infer<typeof GetDatabaseSchema>): Promise<string> {
    this.logger.info(`Fetching database details for: ${args.uuid}`);

    try {
      const database = await this.apiGet(`/databases/${args.uuid}`);

      if (!database) {
        return `Database not found: ${args.uuid}`;
      }

      this.logger.info(`Successfully fetched database: ${database.name || args.uuid}`);

      return this.formatResponse(database);
    } catch (error: any) {
      this.logger.error(`Failed to fetch database ${args.uuid}`, error);
      throw new Error(`Failed to get database: ${error.message}`);
    }
  }
}
