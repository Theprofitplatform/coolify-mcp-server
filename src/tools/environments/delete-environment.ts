/**
 * Delete Environment Tool
 * Deletes a specific environment
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const DeleteEnvironmentSchema = z.object({
  project_uuid: z.string().describe('UUID of the project'),
  environment_name: z.string().describe('Name of the environment to delete'),
  delete_resources: z.boolean().optional().describe('Also delete all resources in the environment'),
});

export class DeleteEnvironmentTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'delete_environment';
  }

  get description(): string {
    return 'Delete a specific environment. CAUTION: This action is irreversible. Optionally delete all resources within the environment.';
  }

  get inputSchema(): z.ZodSchema {
    return DeleteEnvironmentSchema;
  }

  async execute(args: z.infer<typeof DeleteEnvironmentSchema>): Promise<string> {
    this.logger.info(`Deleting environment ${args.environment_name} in project: ${args.project_uuid}`);
    this.logger.warn(`DELETE operation requested for environment: ${args.environment_name}`);

    try {
      const params: Record<string, string> = {};
      if (args.delete_resources) params.delete_resources = 'true';

      const queryString = Object.keys(params).length > 0 
        ? '?' + new URLSearchParams(params).toString() 
        : '';

      const result = await this.apiDelete(
        `/projects/${args.project_uuid}/environments/${args.environment_name}${queryString}`
      );

      this.logger.info(`Successfully deleted environment: ${args.environment_name}`);

      return this.formatResponse({
        message: 'Environment deleted successfully',
        project_uuid: args.project_uuid,
        environment_name: args.environment_name,
        deleted_resources: args.delete_resources || false,
        ...result
      });
    } catch (error: any) {
      this.logger.error(`Failed to delete environment ${args.environment_name}`, error);
      throw new Error(`Failed to delete environment: ${error.message}`);
    }
  }
}
