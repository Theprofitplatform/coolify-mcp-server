/**
 * Delete Application Tool
 * Deletes a specific application and optionally its volumes and configurations
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { DeleteApplicationSchema } from '../../schemas/application.schemas.js';

export class DeleteApplicationTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'delete_application';
  }

  get description(): string {
    return 'Delete a specific application. CAUTION: This action is irreversible. Optionally delete associated volumes and configurations.';
  }

  get inputSchema(): z.ZodSchema {
    return DeleteApplicationSchema;
  }

  async execute(args: z.infer<typeof DeleteApplicationSchema>): Promise<string> {
    this.logger.info(`Deleting application: ${args.uuid}`);
    this.logger.warn(`DELETE operation requested for application: ${args.uuid}`);

    try {
      // Build query parameters
      const params: Record<string, string> = {};
      if (args.delete_volumes) params.delete_volumes = 'true';
      if (args.delete_configurations) params.delete_configurations = 'true';

      const queryString = Object.keys(params).length > 0 
        ? '?' + new URLSearchParams(params).toString() 
        : '';

      const result = await this.apiDelete(`/applications/${args.uuid}${queryString}`);

      this.logger.info(`Successfully deleted application: ${args.uuid}`);

      return this.formatResponse({
        message: 'Application deleted successfully',
        uuid: args.uuid,
        deleted_volumes: args.delete_volumes || false,
        deleted_configurations: args.delete_configurations || false,
        ...result
      });
    } catch (error: any) {
      this.logger.error(`Failed to delete application ${args.uuid}`, error);
      throw new Error(`Failed to delete application: ${error.message}`);
    }
  }
}
