/**
 * Validate Server Tool
 * Validates a server's configuration and connectivity
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { ValidateServerSchema } from '../../schemas/server.schemas.js';

export class ValidateServerTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'validate_server';
  }

  get description(): string {
    return 'Validate a server\'s configuration and connectivity. Use this to verify server setup and troubleshoot connection issues.';
  }

  get inputSchema(): z.ZodSchema {
    return ValidateServerSchema;
  }

  async execute(args: z.infer<typeof ValidateServerSchema>): Promise<string> {
    this.logger.info('Validating server', { uuid: args.server_uuid });

    const result = await this.apiGet(`/servers/${args.server_uuid}/validate`);

    this.logger.info('Server validation completed');

    return this.formatResponse(result);
  }
}
