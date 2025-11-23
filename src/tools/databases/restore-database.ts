/**
 * Restore Database Tool
 * Restores a database from backup
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { RestoreDatabaseSchema } from '../../schemas/database.schemas.js';

export class RestoreDatabaseTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'restore_database';
  }

  get description(): string {
    return 'Restore a database from backup. Can restore from a specific backup ID or use the latest backup available.';
  }

  get inputSchema(): z.ZodSchema {
    return RestoreDatabaseSchema;
  }

  async execute(args: z.infer<typeof RestoreDatabaseSchema>): Promise<string> {
    this.logger.info(`Restoring database: ${args.uuid}`);

    try {
      const params: Record<string, string> = {};
      if (args.backup_id) params.backup_id = args.backup_id;

      const queryString = Object.keys(params).length > 0 
        ? '?' + new URLSearchParams(params).toString() 
        : '';

      const result = await this.apiPost(`/databases/${args.uuid}/restore${queryString}`, {});

      this.logger.info(`Successfully initiated restore for database: ${args.uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to restore database ${args.uuid}`, error);
      throw new Error(`Failed to restore database: ${error.message}`);
    }
  }
}
