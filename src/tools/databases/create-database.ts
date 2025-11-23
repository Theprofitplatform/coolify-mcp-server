/**
 * Create Database Tool
 * Creates a new database instance
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { CreateDatabaseSchema } from '../../schemas/database.schemas.js';

export class CreateDatabaseTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'create_database';
  }

  get description(): string {
    return 'Create a new database. Supports PostgreSQL, MySQL, MongoDB, Redis, MariaDB, KeyDB, DragonFly, and ClickHouse.';
  }

  get inputSchema(): z.ZodSchema {
    return CreateDatabaseSchema;
  }

  async execute(args: z.infer<typeof CreateDatabaseSchema>): Promise<string> {
    this.logger.info(`Creating ${args.type} database: ${args.name}`);

    try {
      const database = await this.apiPost('/databases', args);

      this.logger.info(`Successfully created database: ${args.name}`);

      return this.formatResponse(database);
    } catch (error: any) {
      this.logger.error(`Failed to create database ${args.name}`, error);
      throw new Error(`Failed to create database: ${error.message}`);
    }
  }
}
