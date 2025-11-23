/**
 * Delete Project Tool
 * Deletes a specific project
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const DeleteProjectSchema = z.object({
  uuid: z.string().describe('UUID of the project to delete'),
  delete_resources: z.boolean().optional().describe('Also delete all resources in the project'),
});

export class DeleteProjectTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'delete_project';
  }

  get description(): string {
    return 'Delete a specific project. CAUTION: This action is irreversible. Optionally delete all resources within the project.';
  }

  get inputSchema(): z.ZodSchema {
    return DeleteProjectSchema;
  }

  async execute(args: z.infer<typeof DeleteProjectSchema>): Promise<string> {
    this.logger.info(`Deleting project: ${args.uuid}`);
    this.logger.warn(`DELETE operation requested for project: ${args.uuid}`);

    try {
      const params: Record<string, string> = {};
      if (args.delete_resources) params.delete_resources = 'true';

      const queryString = Object.keys(params).length > 0 
        ? '?' + new URLSearchParams(params).toString() 
        : '';

      const result = await this.apiDelete(`/projects/${args.uuid}${queryString}`);

      this.logger.info(`Successfully deleted project: ${args.uuid}`);

      return this.formatResponse({
        message: 'Project deleted successfully',
        uuid: args.uuid,
        deleted_resources: args.delete_resources || false,
        ...result
      });
    } catch (error: any) {
      this.logger.error(`Failed to delete project ${args.uuid}`, error);
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }
}
