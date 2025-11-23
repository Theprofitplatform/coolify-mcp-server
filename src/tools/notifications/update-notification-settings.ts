/**
 * Update Notification Settings Tool
 * Updates notification preferences and alert configuration
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const UpdateNotificationSettingsSchema = z.object({
  team_id: z.string().optional().describe('Team ID (optional, defaults to current team)'),
  deployment_success: z.boolean().optional().describe('Notify on deployment success'),
  deployment_failure: z.boolean().optional().describe('Notify on deployment failure'),
  server_unreachable: z.boolean().optional().describe('Notify when server is unreachable'),
  disk_usage_threshold: z.number().optional().describe('Disk usage alert threshold (percentage)'),
  memory_usage_threshold: z.number().optional().describe('Memory usage alert threshold (percentage)'),
  cpu_usage_threshold: z.number().optional().describe('CPU usage alert threshold (percentage)'),
});

export class UpdateNotificationSettingsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'update_notification_settings';
  }

  get description(): string {
    return 'Update notification settings and alert preferences including deployment notifications, server alerts, and resource usage thresholds.';
  }

  get inputSchema(): z.ZodSchema {
    return UpdateNotificationSettingsSchema;
  }

  async execute(args: z.infer<typeof UpdateNotificationSettingsSchema>): Promise<string> {
    const { team_id, ...settings } = args;
    
    this.logger.info('Updating notification settings');

    try {
      const cleanSettings = Object.fromEntries(
        Object.entries(settings).filter(([_, v]) => v !== undefined)
      );

      if (Object.keys(cleanSettings).length === 0) {
        return 'No settings provided. Please specify at least one setting to update.';
      }

      const endpoint = team_id 
        ? `/teams/${team_id}/notification-settings`
        : '/notification-settings';
      
      const result = await this.apiPatch(endpoint, cleanSettings);

      this.logger.info('Successfully updated notification settings');

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error('Failed to update notification settings', error);
      throw new Error(`Failed to update notification settings: ${error.message}`);
    }
  }
}
