/**
 * Create Server Tool
 * Creates a new server in Coolify
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { CreateServerSchema } from '../../schemas/server.schemas.js';

export class CreateServerTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'create_server';
  }

  get description(): string {
    return 'Create a new server in Coolify. Requires SSH access details and a private key for authentication.';
  }

  get inputSchema(): z.ZodSchema {
    return CreateServerSchema;
  }

  async execute(args: z.infer<typeof CreateServerSchema>): Promise<string> {
    this.logger.info('Creating server', { name: args.name, ip: args.ip });

    const server = await this.apiPost('/servers', args);

    this.logger.info('Server created successfully', { server });

    return this.formatResponse(server);
  }
}
