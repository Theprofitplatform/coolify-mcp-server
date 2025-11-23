/**
 * Clean Server Storage Tool
 * Cleans up unused Docker images, containers, and volumes on a server
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const CleanServerStorageSchema = z.object({
  uuid: z.string().describe('UUID of the server'),
  prune_images: z.boolean().optional().describe('Remove unused Docker images'),
  prune_containers: z.boolean().optional().describe('Remove stopped containers'),
  prune_volumes: z.boolean().optional().describe('Remove unused volumes'),
  prune_networks: z.boolean().optional().describe('Remove unused networks'),
});

export class CleanServerStorageTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'clean_server_storage';
  }

  get description(): string {
    return 'Clean up unused Docker resources on a server to free disk space. Can remove unused images, containers, volumes, and networks.';
  }

  get inputSchema(): z.ZodSchema {
    return CleanServerStorageSchema;
  }

  async execute(args: z.infer<typeof CleanServerStorageSchema>): Promise<string> {
    this.logger.info(`Cleaning storage for server: ${args.uuid}`);
    this.logger.warn(`CLEANUP operation requested for server: ${args.uuid}`);

    try {
      const { uuid, ...options } = args;
      const result = await this.apiPost(`/servers/${uuid}/cleanup`, options);

      this.logger.info(`Successfully cleaned storage for server: ${uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to clean storage for server ${args.uuid}`, error);
      throw new Error(`Failed to clean server storage: ${error.message}`);
    }
  }
}
