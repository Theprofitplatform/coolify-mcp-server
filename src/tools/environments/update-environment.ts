/**
 * Update Environment Tool
 * Updates configuration for a specific environment
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const UpdateEnvironmentSchema = z.object({
  project_uuid: z.string().describe('UUID of the project'),
  environment_name: z.string().describe('Name of the environment to update'),
  name: z.string().optional().describe('New environment name'),
  description: z.string().optional().describe('Environment description'),
});

export class UpdateEnvironmentTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'update_environment';
  }

  get description(): string {
    return 'Update configuration for a specific environment within a project.';
  }

  get inputSchema(): z.ZodSchema {
    return UpdateEnvironmentSchema;
  }

  async execute(args: z.infer<typeof UpdateEnvironmentSchema>): Promise<string> {
    const { project_uuid, environment_name, ...updateData } = args;
    
    this.logger.info(`Updating environment ${environment_name} in project: ${project_uuid}`);

    try {
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      if (Object.keys(cleanData).length === 0) {
        return 'No update data provided. Please specify at least one field to update.';
      }

      const result = await this.apiPatch(
        `/projects/${project_uuid}/environments/${environment_name}`,
        cleanData
      );

      this.logger.info(`Successfully updated environment: ${environment_name}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to update environment ${environment_name}`, error);
      throw new Error(`Failed to update environment: ${error.message}`);
    }
  }
}
