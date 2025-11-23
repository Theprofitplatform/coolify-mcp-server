/**
 * List Git Repositories Tool
 * Lists all connected Git repositories
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const ListGitRepositoriesSchema = z.object({});

export class ListGitRepositoriesTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'list_git_repositories';
  }

  get description(): string {
    return 'List all Git repositories connected to Coolify applications.';
  }

  get inputSchema(): z.ZodSchema {
    return ListGitRepositoriesSchema;
  }

  async execute(args: z.infer<typeof ListGitRepositoriesSchema>): Promise<string> {
    this.logger.info('Fetching Git repositories');

    try {
      const repositories = await this.apiGet('/git/repositories');

      this.logger.info('Successfully fetched Git repositories');

      return this.formatResponse(repositories);
    } catch (error: any) {
      this.logger.error('Failed to fetch Git repositories', error);
      throw new Error(`Failed to list Git repositories: ${error.message}`);
    }
  }
}
