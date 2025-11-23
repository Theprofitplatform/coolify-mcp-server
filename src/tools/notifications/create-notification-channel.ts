/**
 * Create Notification Channel Tool
 * Creates a new notification channel (Discord, Telegram, Email, Slack)
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const CreateNotificationChannelSchema = z.object({
  name: z.string().describe('Name of the notification channel'),
  type: z.enum(['discord', 'telegram', 'email', 'slack']).describe('Type of notification channel'),
  webhook_url: z.string().optional().describe('Webhook URL (for Discord/Slack)'),
  bot_token: z.string().optional().describe('Bot token (for Telegram)'),
  chat_id: z.string().optional().describe('Chat ID (for Telegram)'),
  email_address: z.string().optional().describe('Email address (for Email)'),
  smtp_settings: z.object({
    host: z.string(),
    port: z.number(),
    username: z.string().optional(),
    password: z.string().optional(),
    from: z.string(),
  }).optional().describe('SMTP settings (for Email)'),
});

export class CreateNotificationChannelTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'create_notification_channel';
  }

  get description(): string {
    return 'Create a new notification channel for alerts and monitoring. Supports Discord, Telegram, Email, and Slack integrations.';
  }

  get inputSchema(): z.ZodSchema {
    return CreateNotificationChannelSchema;
  }

  async execute(args: z.infer<typeof CreateNotificationChannelSchema>): Promise<string> {
    this.logger.info(`Creating notification channel: ${args.name} (${args.type})`);

    try {
      const result = await this.apiPost('/notifications', args);

      this.logger.info(`Successfully created notification channel: ${args.name}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to create notification channel ${args.name}`, error);
      throw new Error(`Failed to create notification channel: ${error.message}`);
    }
  }
}
