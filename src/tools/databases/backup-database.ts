/**
 * Backup Database Tool
 * Creates a backup of a specific database
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { BackupDatabaseSchema } from '../../schemas/database.schemas.js';

export class BackupDatabaseTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'backup_database';
  }

  get description(): string {
    return 'Create a backup of a specific database. The backup will be stored according to your configured backup settings (S3 or local storage).';
  }

  get inputSchema(): z.ZodSchema {
    return BackupDatabaseSchema;
  }

  async execute(args: z.infer<typeof BackupDatabaseSchema>): Promise<string> {
    this.logger.info(`Creating backup for database: ${args.uuid}`);

    try {
      const result = await this.apiGet(`/databases/${args.uuid}/backup`);

      this.logger.info(`Backup initiated successfully for database: ${args.uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to backup database ${args.uuid}`, error);
      throw new Error(`Failed to backup database: ${error.message}`);
    }
  }
}
