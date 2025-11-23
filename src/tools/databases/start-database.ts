/**
 * Start Database Tool
 * Starts a stopped database
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { StartDatabaseSchema } from '../../schemas/database.schemas.js';

export class StartDatabaseTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'start_database';
  }

  get description(): string {
    return 'Start a stopped database. This will start the database container and make it available for connections.';
  }

  get inputSchema(): z.ZodSchema {
    return StartDatabaseSchema;
  }

  async execute(args: z.infer<typeof StartDatabaseSchema>): Promise<string> {
    this.logger.info(`Starting database: ${args.uuid}`);

    try {
      const result = await this.apiGet(`/databases/${args.uuid}/start`);

      this.logger.info(`Successfully started database: ${args.uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to start database ${args.uuid}`, error);
      throw new Error(`Failed to start database: ${error.message}`);
    }
  }
}
