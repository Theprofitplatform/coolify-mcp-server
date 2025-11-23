/**
 * List Volumes Tool
 * Retrieves all Docker volumes
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const ListVolumesSchema = z.object({
  server_uuid: z.string().optional().describe('Filter by server UUID'),
});

export class ListVolumesTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'list_volumes';
  }

  get description(): string {
    return 'List all Docker volumes across servers. Useful for managing persistent storage and data volumes.';
  }

  get inputSchema(): z.ZodSchema {
    return ListVolumesSchema;
  }

  async execute(args: z.infer<typeof ListVolumesSchema>): Promise<string> {
    this.logger.info('Fetching volumes');

    try {
      const queryParams = args.server_uuid ? `?server_uuid=${args.server_uuid}` : '';
      const volumes = await this.apiGet(`/volumes${queryParams}`);

      this.logger.info('Successfully fetched volumes');

      return this.formatResponse(volumes);
    } catch (error: any) {
      this.logger.error('Failed to fetch volumes', error);
      throw new Error(`Failed to list volumes: ${error.message}`);
    }
  }
}
