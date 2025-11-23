/**
 * Delete Database Tool
 * Deletes a specific database and optionally its volumes
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { DeleteDatabaseSchema } from '../../schemas/database.schemas.js';

export class DeleteDatabaseTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'delete_database';
  }

  get description(): string {
    return 'Delete a specific database. CAUTION: This action is irreversible and will destroy all data. Optionally delete associated volumes.';
  }

  get inputSchema(): z.ZodSchema {
    return DeleteDatabaseSchema;
  }

  async execute(args: z.infer<typeof DeleteDatabaseSchema>): Promise<string> {
    this.logger.info(`Deleting database: ${args.uuid}`);
    this.logger.warn(`DELETE operation requested for database: ${args.uuid}`);

    try {
      const params: Record<string, string> = {};
      if (args.delete_volumes) params.delete_volumes = 'true';

      const queryString = Object.keys(params).length > 0 
        ? '?' + new URLSearchParams(params).toString() 
        : '';

      const result = await this.apiDelete(`/databases/${args.uuid}${queryString}`);

      this.logger.info(`Successfully deleted database: ${args.uuid}`);

      return this.formatResponse({
        message: 'Database deleted successfully',
        uuid: args.uuid,
        deleted_volumes: args.delete_volumes || false,
        ...result
      });
    } catch (error: any) {
      this.logger.error(`Failed to delete database ${args.uuid}`, error);
      throw new Error(`Failed to delete database: ${error.message}`);
    }
  }
}
