/**
 * Update Service Tool
 * Updates configuration for a specific service
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const UpdateServiceSchema = z.object({
  uuid: z.string().describe('UUID of the service to update'),
  name: z.string().optional().describe('Service name'),
  description: z.string().optional().describe('Service description'),
});

export class UpdateServiceTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'update_service';
  }

  get description(): string {
    return 'Update configuration for a specific service including name and description.';
  }

  get inputSchema(): z.ZodSchema {
    return UpdateServiceSchema;
  }

  async execute(args: z.infer<typeof UpdateServiceSchema>): Promise<string> {
    const { uuid, ...updateData } = args;
    
    this.logger.info(`Updating service: ${uuid}`);

    try {
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      if (Object.keys(cleanData).length === 0) {
        return 'No update data provided. Please specify at least one field to update.';
      }

      const result = await this.apiPatch(`/services/${uuid}`, cleanData);

      this.logger.info(`Successfully updated service: ${uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to update service ${uuid}`, error);
      throw new Error(`Failed to update service: ${error.message}`);
    }
  }
}
