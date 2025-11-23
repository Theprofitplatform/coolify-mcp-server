/**
 * Trigger Git Deployment Tool
 * Triggers a deployment from a specific Git commit
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const TriggerGitDeploymentSchema = z.object({
  uuid: z.string().describe('UUID of the application'),
  commit_sha: z.string().optional().describe('Commit SHA to deploy'),
  branch: z.string().optional().describe('Branch to deploy from'),
  force: z.boolean().optional().describe('Force deployment even if already deployed'),
});

export class TriggerGitDeploymentTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'trigger_git_deployment';
  }

  get description(): string {
    return 'Trigger a deployment from a specific Git commit or branch. Useful for deploying specific versions or branches.';
  }

  get inputSchema(): z.ZodSchema {
    return TriggerGitDeploymentSchema;
  }

  async execute(args: z.infer<typeof TriggerGitDeploymentSchema>): Promise<string> {
    this.logger.info(`Triggering Git deployment for: ${args.uuid}`);

    try {
      const payload: any = {};
      if (args.commit_sha) payload.commit_sha = args.commit_sha;
      if (args.branch) payload.branch = args.branch;
      if (args.force) payload.force = args.force;

      const result = await this.apiPost(`/applications/${args.uuid}/git/deploy`, payload);

      this.logger.info(`Successfully triggered Git deployment for: ${args.uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to trigger Git deployment for ${args.uuid}`, error);
      throw new Error(`Failed to trigger Git deployment: ${error.message}`);
    }
  }
}
