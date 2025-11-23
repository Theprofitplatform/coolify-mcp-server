/**
 * List Notification Channels Tool
 * Retrieves all notification channels (Discord, Telegram, Email, etc.)
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const ListNotificationChannelsSchema = z.object({
  team_id: z.string().optional().describe('Team ID to filter channels (optional)'),
});

export class ListNotificationChannelsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'list_notification_channels';
  }

  get description(): string {
    return 'List all notification channels configured in Coolify (Discord, Telegram, Email, Slack). Essential for monitoring and alerting setup.';
  }

  get inputSchema(): z.ZodSchema {
    return ListNotificationChannelsSchema;
  }

  async execute(args: z.infer<typeof ListNotificationChannelsSchema>): Promise<string> {
    this.logger.info('Fetching notification channels');

    try {
      const queryParams = args.team_id ? `?team_id=${args.team_id}` : '';
      const channels = await this.apiGet(`/notifications${queryParams}`);

      this.logger.info(`Successfully fetched notification channels`);

      return this.formatResponse(channels);
    } catch (error: any) {
      this.logger.error('Failed to fetch notification channels', error);
      throw new Error(`Failed to list notification channels: ${error.message}`);
    }
  }
}
