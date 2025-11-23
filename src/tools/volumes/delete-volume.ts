/**
 * Delete Volume Tool
 * Deletes a Docker volume
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const DeleteVolumeSchema = z.object({
  name: z.string().describe('Name of the volume to delete'),
  server_uuid: z.string().describe('Server UUID where the volume is located'),
  force: z.boolean().optional().describe('Force delete even if in use'),
});

export class DeleteVolumeTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'delete_volume';
  }

  get description(): string {
    return 'Delete a Docker volume. CAUTION: This will permanently delete the volume and all its data. This action is irreversible.';
  }

  get inputSchema(): z.ZodSchema {
    return DeleteVolumeSchema;
  }

  async execute(args: z.infer<typeof DeleteVolumeSchema>): Promise<string> {
    this.logger.info(`Deleting volume: ${args.name}`);
    this.logger.warn(`DELETE operation requested for volume: ${args.name}`);

    try {
      const params: Record<string, string> = { server_uuid: args.server_uuid };
      if (args.force) params.force = 'true';

      const queryString = '?' + new URLSearchParams(params).toString();
      const result = await this.apiDelete(`/volumes/${args.name}${queryString}`);

      this.logger.info(`Successfully deleted volume: ${args.name}`);

      return this.formatResponse({
        message: 'Volume deleted successfully',
        name: args.name,
        ...result
      });
    } catch (error: any) {
      this.logger.error(`Failed to delete volume ${args.name}`, error);
      throw new Error(`Failed to delete volume: ${error.message}`);
    }
  }
}
