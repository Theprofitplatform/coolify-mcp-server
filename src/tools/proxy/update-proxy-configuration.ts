import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  server_uuid: z.string().describe('Server UUID'),
  http_port: z.number().optional().describe('HTTP port (default: 80)'),
  https_port: z.number().optional().describe('HTTPS port (default: 443)'),
  dashboard_enabled: z.boolean().optional().describe('Enable proxy dashboard'),
  log_level: z.enum(['error', 'warn', 'info', 'debug']).optional().describe('Proxy log level'),
  access_log_enabled: z.boolean().optional().describe('Enable access logging'),
  custom_config: z.string().optional().describe('Custom proxy configuration'),
});

const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  restart_required: z.boolean().optional(),
});

export class UpdateProxyConfigurationTool extends BaseTool {
  name = 'update_proxy_configuration';
  description = 'Update proxy (Traefik/Nginx/Caddy) configuration. May require proxy restart to apply changes.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload: any = {};

    if (input.http_port !== undefined) {
      payload.http_port = input.http_port;
    }

    if (input.https_port !== undefined) {
      payload.https_port = input.https_port;
    }

    if (input.dashboard_enabled !== undefined) {
      payload.dashboard_enabled = input.dashboard_enabled;
    }

    if (input.log_level) {
      payload.log_level = input.log_level;
    }

    if (input.access_log_enabled !== undefined) {
      payload.access_log_enabled = input.access_log_enabled;
    }

    if (input.custom_config) {
      payload.custom_config = input.custom_config;
    }

    const response = await this.apiPatch(`/servers/${input.server_uuid}/proxy/configuration`, payload);
    
    return this.formatResponse({
      success: true,
      message: response.data?.message || 'Proxy configuration updated successfully',
      restart_required: response.data?.restart_required,
    });
  }
}
