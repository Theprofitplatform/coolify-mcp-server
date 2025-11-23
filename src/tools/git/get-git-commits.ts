/**
 * Get Git Commits Tool
 * Retrieves recent commits from a repository
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetGitCommitsSchema = z.object({
  uuid: z.string().describe('UUID of the application'),
  branch: z.string().optional().describe('Branch name (defaults to current branch)'),
  limit: z.number().optional().describe('Number of commits to retrieve (default: 20)'),
});

export class GetGitCommitsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_git_commits';
  }

  get description(): string {
    return 'Get recent commits from the Git repository connected to an application.';
  }

  get inputSchema(): z.ZodSchema {
    return GetGitCommitsSchema;
  }

  async execute(args: z.infer<typeof GetGitCommitsSchema>): Promise<string> {
    this.logger.info(`Fetching Git commits for: ${args.uuid}`);

    try {
      const params: string[] = [];
      if (args.branch) params.push(`branch=${args.branch}`);
      if (args.limit) params.push(`limit=${args.limit}`);
      
      const queryString = params.length > 0 ? '?' + params.join('&') : '';
      const commits = await this.apiGet(`/applications/${args.uuid}/git/commits${queryString}`);

      this.logger.info(`Successfully fetched Git commits for: ${args.uuid}`);

      return this.formatResponse(commits);
    } catch (error: any) {
      this.logger.error(`Failed to fetch Git commits for ${args.uuid}`, error);
      throw new Error(`Failed to get Git commits: ${error.message}`);
    }
  }
}
