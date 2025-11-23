/**
 * Clone Environment Tool
 * Clones an environment configuration to a new environment
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const CloneEnvironmentSchema = z.object({
  project_uuid: z.string().describe('UUID of the project'),
  source_environment: z.string().describe('Name of the environment to clone'),
  target_environment: z.string().describe('Name for the new environment'),
  clone_resources: z.boolean().optional().describe('Also clone resources (default: false)'),
});

export class CloneEnvironmentTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'clone_environment';
  }

  get description(): string {
    return 'Clone an environment configuration to a new environment. Optionally clone all resources (applications, databases, services).';
  }

  get inputSchema(): z.ZodSchema {
    return CloneEnvironmentSchema;
  }

  async execute(args: z.infer<typeof CloneEnvironmentSchema>): Promise<string> {
    this.logger.info(`Cloning environment ${args.source_environment} to ${args.target_environment} in project: ${args.project_uuid}`);

    try {
      const result = await this.apiPost(
        `/projects/${args.project_uuid}/environments/clone`,
        {
          source: args.source_environment,
          target: args.target_environment,
          clone_resources: args.clone_resources || false,
        }
      );

      this.logger.info(`Successfully cloned environment: ${args.source_environment} → ${args.target_environment}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to clone environment ${args.source_environment}`, error);
      throw new Error(`Failed to clone environment: ${error.message}`);
    }
  }
}
