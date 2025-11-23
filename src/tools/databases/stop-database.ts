/**
 * Stop Database Tool
 * Stops a running database
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { StopDatabaseSchema } from '../../schemas/database.schemas.js';

export class StopDatabaseTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'stop_database';
  }

  get description(): string {
    return 'Stop a running database. This will gracefully shut down the database container.';
  }

  get inputSchema(): z.ZodSchema {
    return StopDatabaseSchema;
  }

  async execute(args: z.infer<typeof StopDatabaseSchema>): Promise<string> {
    this.logger.info(`Stopping database: ${args.uuid}`);

    try {
      const result = await this.apiGet(`/databases/${args.uuid}/stop`);

      this.logger.info(`Successfully stopped database: ${args.uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to stop database ${args.uuid}`, error);
      throw new Error(`Failed to stop database: ${error.message}`);
    }
  }
}
