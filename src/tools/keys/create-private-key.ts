/**
 * Create Private Key Tool
 * Creates a new private key for server authentication
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { CreatePrivateKeySchema } from '../../schemas/key.schemas.js';

export class CreatePrivateKeyTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'create_private_key';
  }

  get description(): string {
    return 'Create a new private key for server authentication in Coolify. Requires a name and the private key content (SSH private key).';
  }

  get inputSchema(): z.ZodSchema {
    return CreatePrivateKeySchema;
  }

  async execute(args: z.infer<typeof CreatePrivateKeySchema>): Promise<string> {
    this.logger.info('Creating private key', { name: args.name });

    const key = await this.apiPost('/security/keys', args);

    this.logger.info('Private key created successfully', { key });

    return this.formatResponse(key);
  }
}
