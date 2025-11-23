/**
 * Update Database Tool
 * Updates configuration for a specific database
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { UpdateDatabaseSchema } from '../../schemas/database.schemas.js';

export class UpdateDatabaseTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'update_database';
  }

  get description(): string {
    return 'Update configuration for a specific database including name, description, and Docker image.';
  }

  get inputSchema(): z.ZodSchema {
    return UpdateDatabaseSchema;
  }

  async execute(args: z.infer<typeof UpdateDatabaseSchema>): Promise<string> {
    const { uuid, ...updateData } = args;
    
    this.logger.info(`Updating database: ${uuid}`);

    try {
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      if (Object.keys(cleanData).length === 0) {
        return 'No update data provided. Please specify at least one field to update.';
      }

      const result = await this.apiPatch(`/databases/${uuid}`, cleanData);

      this.logger.info(`Successfully updated database: ${uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to update database ${uuid}`, error);
      throw new Error(`Failed to update database: ${error.message}`);
    }
  }
}
