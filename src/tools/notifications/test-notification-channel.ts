/**
 * Test Notification Channel Tool
 * Sends a test notification through a channel
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const TestNotificationChannelSchema = z.object({
  uuid: z.string().describe('UUID of the notification channel to test'),
  message: z.string().optional().describe('Custom test message (optional)'),
});

export class TestNotificationChannelTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'test_notification_channel';
  }

  get description(): string {
    return 'Send a test notification through a channel to verify it is working correctly.';
  }

  get inputSchema(): z.ZodSchema {
    return TestNotificationChannelSchema;
  }

  async execute(args: z.infer<typeof TestNotificationChannelSchema>): Promise<string> {
    this.logger.info(`Testing notification channel: ${args.uuid}`);

    try {
      const payload = args.message ? { message: args.message } : {};
      const result = await this.apiPost(`/notifications/${args.uuid}/test`, payload);

      this.logger.info(`Successfully sent test notification via: ${args.uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to test notification channel ${args.uuid}`, error);
      throw new Error(`Failed to test notification channel: ${error.message}`);
    }
  }
}
