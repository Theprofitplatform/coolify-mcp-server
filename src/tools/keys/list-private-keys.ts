/**
 * List Private Keys Tool
 * Retrieves all private keys available for server authentication
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { ListPrivateKeysSchema } from '../../schemas/key.schemas.js';

export class ListPrivateKeysTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'list_private_keys';
  }

  get description(): string {
    return 'List all private keys available for server authentication in your Coolify instance. Use this to get key UUIDs needed for server configuration.';
  }

  get inputSchema(): z.ZodSchema {
    return ListPrivateKeysSchema;
  }

  async execute(_args: z.infer<typeof ListPrivateKeysSchema>): Promise<string> {
    this.logger.info('Fetching all private keys');

    const keys = await this.apiGet('/security/keys');

    if (!Array.isArray(keys) || keys.length === 0) {
      return 'No private keys found.';
    }

    this.logger.info(`Found ${keys.length} private key(s)`);

    return this.formatResponse(keys);
  }
}
