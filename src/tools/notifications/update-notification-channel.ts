/**
 * Update Notification Channel Tool
 * Updates an existing notification channel
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const UpdateNotificationChannelSchema = z.object({
  uuid: z.string().describe('UUID of the notification channel'),
  name: z.string().optional().describe('Name of the notification channel'),
  webhook_url: z.string().optional().describe('Webhook URL (for Discord/Slack)'),
  bot_token: z.string().optional().describe('Bot token (for Telegram)'),
  chat_id: z.string().optional().describe('Chat ID (for Telegram)'),
  email_address: z.string().optional().describe('Email address (for Email)'),
  enabled: z.boolean().optional().describe('Enable or disable the channel'),
});

export class UpdateNotificationChannelTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'update_notification_channel';
  }

  get description(): string {
    return 'Update configuration for an existing notification channel. Can update webhook URLs, tokens, and enable/disable channels.';
  }

  get inputSchema(): z.ZodSchema {
    return UpdateNotificationChannelSchema;
  }

  async execute(args: z.infer<typeof UpdateNotificationChannelSchema>): Promise<string> {
    const { uuid, ...updateData } = args;
    
    this.logger.info(`Updating notification channel: ${uuid}`);

    try {
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      if (Object.keys(cleanData).length === 0) {
        return 'No update data provided. Please specify at least one field to update.';
      }

      const result = await this.apiPatch(`/notifications/${uuid}`, cleanData);

      this.logger.info(`Successfully updated notification channel: ${uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to update notification channel ${uuid}`, error);
      throw new Error(`Failed to update notification channel: ${error.message}`);
    }
  }
}
