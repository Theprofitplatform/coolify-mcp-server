/**
 * Get Git Branches Tool
 * Retrieves all branches from a repository
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetGitBranchesSchema = z.object({
  uuid: z.string().describe('UUID of the application'),
});

export class GetGitBranchesTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_git_branches';
  }

  get description(): string {
    return 'Get all branches from the Git repository connected to an application.';
  }

  get inputSchema(): z.ZodSchema {
    return GetGitBranchesSchema;
  }

  async execute(args: z.infer<typeof GetGitBranchesSchema>): Promise<string> {
    this.logger.info(`Fetching Git branches for: ${args.uuid}`);

    try {
      const branches = await this.apiGet(`/applications/${args.uuid}/git/branches`);

      this.logger.info(`Successfully fetched Git branches for: ${args.uuid}`);

      return this.formatResponse(branches);
    } catch (error: any) {
      this.logger.error(`Failed to fetch Git branches for ${args.uuid}`, error);
      throw new Error(`Failed to get Git branches: ${error.message}`);
    }
  }
}
