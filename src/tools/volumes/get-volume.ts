/**
 * Get Volume Tool
 * Retrieves details of a specific volume
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetVolumeSchema = z.object({
  name: z.string().describe('Name of the volume'),
  server_uuid: z.string().optional().describe('Server UUID where the volume is located'),
});

export class GetVolumeTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_volume';
  }

  get description(): string {
    return 'Get details of a specific Docker volume including size, mount point, and associated resources.';
  }

  get inputSchema(): z.ZodSchema {
    return GetVolumeSchema;
  }

  async execute(args: z.infer<typeof GetVolumeSchema>): Promise<string> {
    this.logger.info(`Fetching volume: ${args.name}`);

    try {
      const queryParams = args.server_uuid ? `?server_uuid=${args.server_uuid}` : '';
      const volume = await this.apiGet(`/volumes/${args.name}${queryParams}`);

      this.logger.info(`Successfully fetched volume: ${args.name}`);

      return this.formatResponse(volume);
    } catch (error: any) {
      this.logger.error(`Failed to fetch volume ${args.name}`, error);
      throw new Error(`Failed to get volume: ${error.message}`);
    }
  }
}
