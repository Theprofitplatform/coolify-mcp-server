/**
 * Create Volume Tool
 * Creates a new Docker volume
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const CreateVolumeSchema = z.object({
  name: z.string().describe('Name of the volume'),
  server_uuid: z.string().describe('Server UUID where the volume will be created'),
  driver: z.string().optional().describe('Volume driver (default: local)'),
  driver_opts: z.record(z.string(), z.string()).optional().describe('Driver-specific options'),
});

export class CreateVolumeTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'create_volume';
  }

  get description(): string {
    return 'Create a new Docker volume for persistent data storage. Volumes can be attached to applications, databases, or services.';
  }

  get inputSchema(): z.ZodSchema {
    return CreateVolumeSchema;
  }

  async execute(args: z.infer<typeof CreateVolumeSchema>): Promise<string> {
    this.logger.info(`Creating volume: ${args.name}`);

    try {
      const result = await this.apiPost('/volumes', args);

      this.logger.info(`Successfully created volume: ${args.name}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to create volume ${args.name}`, error);
      throw new Error(`Failed to create volume: ${error.message}`);
    }
  }
}
