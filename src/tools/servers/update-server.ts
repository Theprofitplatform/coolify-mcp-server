/**
 * Update Server Tool
 * Updates configuration for a specific server
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const UpdateServerSchema = z.object({
  uuid: z.string().describe('UUID of the server to update'),
  name: z.string().optional().describe('Server name'),
  description: z.string().optional().describe('Server description'),
  ip: z.string().optional().describe('Server IP address'),
  user: z.string().optional().describe('SSH user'),
  port: z.number().optional().describe('SSH port'),
});

export class UpdateServerTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'update_server';
  }

  get description(): string {
    return 'Update configuration for a specific server including name, description, IP, user, and port settings.';
  }

  get inputSchema(): z.ZodSchema {
    return UpdateServerSchema;
  }

  async execute(args: z.infer<typeof UpdateServerSchema>): Promise<string> {
    const { uuid, ...updateData } = args;
    
    this.logger.info(`Updating server: ${uuid}`);

    try {
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      if (Object.keys(cleanData).length === 0) {
        return 'No update data provided. Please specify at least one field to update.';
      }

      const result = await this.apiPatch(`/servers/${uuid}`, cleanData);

      this.logger.info(`Successfully updated server: ${uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to update server ${uuid}`, error);
      throw new Error(`Failed to update server: ${error.message}`);
    }
  }
}
