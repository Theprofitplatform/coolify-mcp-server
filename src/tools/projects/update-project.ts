/**
 * Update Project Tool
 * Updates configuration for a specific project
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const UpdateProjectSchema = z.object({
  uuid: z.string().describe('UUID of the project to update'),
  name: z.string().optional().describe('Project name'),
  description: z.string().optional().describe('Project description'),
});

export class UpdateProjectTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'update_project';
  }

  get description(): string {
    return 'Update configuration for a specific project including name and description.';
  }

  get inputSchema(): z.ZodSchema {
    return UpdateProjectSchema;
  }

  async execute(args: z.infer<typeof UpdateProjectSchema>): Promise<string> {
    const { uuid, ...updateData } = args;
    
    this.logger.info(`Updating project: ${uuid}`);

    try {
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      if (Object.keys(cleanData).length === 0) {
        return 'No update data provided. Please specify at least one field to update.';
      }

      const result = await this.apiPatch(`/projects/${uuid}`, cleanData);

      this.logger.info(`Successfully updated project: ${uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to update project ${uuid}`, error);
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }
}
