/**
 * Get Notification Settings Tool
 * Retrieves notification preferences and alert configuration
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetNotificationSettingsSchema = z.object({
  team_id: z.string().optional().describe('Team ID (optional, defaults to current team)'),
});

export class GetNotificationSettingsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_notification_settings';
  }

  get description(): string {
    return 'Get notification settings and preferences including alert thresholds, notification types, and channel configurations.';
  }

  get inputSchema(): z.ZodSchema {
    return GetNotificationSettingsSchema;
  }

  async execute(args: z.infer<typeof GetNotificationSettingsSchema>): Promise<string> {
    this.logger.info('Fetching notification settings');

    try {
      const endpoint = args.team_id 
        ? `/teams/${args.team_id}/notification-settings`
        : '/notification-settings';
      
      const settings = await this.apiGet(endpoint);

      this.logger.info('Successfully fetched notification settings');

      return this.formatResponse(settings);
    } catch (error: any) {
      this.logger.error('Failed to fetch notification settings', error);
      throw new Error(`Failed to get notification settings: ${error.message}`);
    }
  }
}
