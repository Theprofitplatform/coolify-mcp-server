/**
 * Restart Database Tool
 * Restarts a database
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { RestartDatabaseSchema } from '../../schemas/database.schemas.js';

export class RestartDatabaseTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'restart_database';
  }

  get description(): string {
    return 'Restart a database by stopping and starting it. Useful for applying configuration changes or recovering from issues.';
  }

  get inputSchema(): z.ZodSchema {
    return RestartDatabaseSchema;
  }

  async execute(args: z.infer<typeof RestartDatabaseSchema>): Promise<string> {
    this.logger.info(`Restarting database: ${args.uuid}`);

    try {
      const result = await this.apiGet(`/databases/${args.uuid}/restart`);

      this.logger.info(`Successfully restarted database: ${args.uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to restart database ${args.uuid}`, error);
      throw new Error(`Failed to restart database: ${error.message}`);
    }
  }
}
