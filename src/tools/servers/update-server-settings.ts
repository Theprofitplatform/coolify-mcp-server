/**
 * Update Server Settings Tool
 * Updates advanced server settings
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const UpdateServerSettingsSchema = z.object({
  uuid: z.string().describe('UUID of the server'),
  cleanup_after_days: z.number().optional().describe('Days after which to cleanup unused resources'),
  concurrent_builds: z.number().optional().describe('Maximum concurrent builds allowed'),
  dynamic_timeout: z.number().optional().describe('Dynamic timeout in seconds'),
  unreachable_notification_delay: z.number().optional().describe('Delay before sending unreachable notifications (minutes)'),
});

export class UpdateServerSettingsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'update_server_settings';
  }

  get description(): string {
    return 'Update advanced server settings including cleanup policies, build limits, and notification delays.';
  }

  get inputSchema(): z.ZodSchema {
    return UpdateServerSettingsSchema;
  }

  async execute(args: z.infer<typeof UpdateServerSettingsSchema>): Promise<string> {
    const { uuid, ...updateData } = args;
    
    this.logger.info(`Updating settings for server: ${uuid}`);

    try {
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      if (Object.keys(cleanData).length === 0) {
        return 'No update data provided. Please specify at least one setting to update.';
      }

      const result = await this.apiPatch(`/servers/${uuid}/settings`, cleanData);

      this.logger.info(`Successfully updated settings for server: ${uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to update settings for server ${uuid}`, error);
      throw new Error(`Failed to update server settings: ${error.message}`);
    }
  }
}
