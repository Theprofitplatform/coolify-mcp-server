/**
 * Restart Server Proxy Tool
 * Restarts the proxy (Traefik or Nginx) on a server
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const RestartServerProxySchema = z.object({
  uuid: z.string().describe('UUID of the server'),
});

export class RestartServerProxyTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'restart_server_proxy';
  }

  get description(): string {
    return 'Restart the proxy service (Traefik or Nginx) on a server. Useful when updating SSL certificates or proxy configurations.';
  }

  get inputSchema(): z.ZodSchema {
    return RestartServerProxySchema;
  }

  async execute(args: z.infer<typeof RestartServerProxySchema>): Promise<string> {
    this.logger.info(`Restarting proxy for server: ${args.uuid}`);
    this.logger.warn(`RESTART PROXY operation requested for server: ${args.uuid}`);

    try {
      const result = await this.apiPost(`/servers/${args.uuid}/proxy/restart`, {});

      this.logger.info(`Successfully restarted proxy for server: ${args.uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to restart proxy for server ${args.uuid}`, error);
      throw new Error(`Failed to restart server proxy: ${error.message}`);
    }
  }
}
