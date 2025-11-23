/**
 * Delete Notification Channel Tool
 * Deletes a notification channel
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const DeleteNotificationChannelSchema = z.object({
  uuid: z.string().describe('UUID of the notification channel to delete'),
});

export class DeleteNotificationChannelTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'delete_notification_channel';
  }

  get description(): string {
    return 'Delete a notification channel. This action is irreversible.';
  }

  get inputSchema(): z.ZodSchema {
    return DeleteNotificationChannelSchema;
  }

  async execute(args: z.infer<typeof DeleteNotificationChannelSchema>): Promise<string> {
    this.logger.info(`Deleting notification channel: ${args.uuid}`);
    this.logger.warn(`DELETE operation requested for notification channel: ${args.uuid}`);

    try {
      const result = await this.apiDelete(`/notifications/${args.uuid}`);

      this.logger.info(`Successfully deleted notification channel: ${args.uuid}`);

      return this.formatResponse({
        message: 'Notification channel deleted successfully',
        uuid: args.uuid,
        ...result
      });
    } catch (error: any) {
      this.logger.error(`Failed to delete notification channel ${args.uuid}`, error);
      throw new Error(`Failed to delete notification channel: ${error.message}`);
    }
  }
}
