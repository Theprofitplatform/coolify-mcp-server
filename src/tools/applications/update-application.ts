/**
 * Update Application Tool
 * Updates configuration for a specific application
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { UpdateApplicationSchema } from '../../schemas/application.schemas.js';

export class UpdateApplicationTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'update_application';
  }

  get description(): string {
    return 'Update configuration for a specific application. Can update name, description, Git settings, build commands, and more.';
  }

  get inputSchema(): z.ZodSchema {
    return UpdateApplicationSchema;
  }

  async execute(args: z.infer<typeof UpdateApplicationSchema>): Promise<string> {
    const { uuid, ...updateData } = args;
    
    this.logger.info(`Updating application: ${uuid}`);

    try {
      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      if (Object.keys(cleanData).length === 0) {
        return 'No update data provided. Please specify at least one field to update.';
      }

      const result = await this.apiPatch(`/applications/${uuid}`, cleanData);

      this.logger.info(`Successfully updated application: ${uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to update application ${uuid}`, error);
      throw new Error(`Failed to update application: ${error.message}`);
    }
  }
}
