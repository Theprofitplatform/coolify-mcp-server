/**
 * Delete Service Tool
 * Deletes a specific service
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const DeleteServiceSchema = z.object({
  uuid: z.string().describe('UUID of the service to delete'),
  delete_volumes: z.boolean().optional().describe('Also delete associated volumes'),
});

export class DeleteServiceTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'delete_service';
  }

  get description(): string {
    return 'Delete a specific service. CAUTION: This action is irreversible. Optionally delete associated volumes.';
  }

  get inputSchema(): z.ZodSchema {
    return DeleteServiceSchema;
  }

  async execute(args: z.infer<typeof DeleteServiceSchema>): Promise<string> {
    this.logger.info(`Deleting service: ${args.uuid}`);
    this.logger.warn(`DELETE operation requested for service: ${args.uuid}`);

    try {
      const params: Record<string, string> = {};
      if (args.delete_volumes) params.delete_volumes = 'true';

      const queryString = Object.keys(params).length > 0 
        ? '?' + new URLSearchParams(params).toString() 
        : '';

      const result = await this.apiDelete(`/services/${args.uuid}${queryString}`);

      this.logger.info(`Successfully deleted service: ${args.uuid}`);

      return this.formatResponse({
        message: 'Service deleted successfully',
        uuid: args.uuid,
        deleted_volumes: args.delete_volumes || false,
        ...result
      });
    } catch (error: any) {
      this.logger.error(`Failed to delete service ${args.uuid}`, error);
      throw new Error(`Failed to delete service: ${error.message}`);
    }
  }
}
