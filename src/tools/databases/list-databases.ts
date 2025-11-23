/**
 * List Databases Tool
 * Retrieves all databases across the Coolify instance
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { ListDatabasesSchema } from '../../schemas/database.schemas.js';

export class ListDatabasesTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'list_databases';
  }

  get description(): string {
    return 'List all databases across your Coolify instance. Includes PostgreSQL, MySQL, MongoDB, Redis, MariaDB, and other database types.';
  }

  get inputSchema(): z.ZodSchema {
    return ListDatabasesSchema;
  }

  async execute(_args: z.infer<typeof ListDatabasesSchema>): Promise<string> {
    this.logger.info('Fetching all databases');

    try {
      const databases = await this.apiGet('/databases');

      if (!Array.isArray(databases) || databases.length === 0) {
        return 'No databases found.';
      }

      this.logger.info(`Found ${databases.length} database(s)`);

      return this.formatResponse(databases);
    } catch (error: any) {
      this.logger.error('Failed to list databases', error);
      throw new Error(`Failed to list databases: ${error.message}`);
    }
  }
}
