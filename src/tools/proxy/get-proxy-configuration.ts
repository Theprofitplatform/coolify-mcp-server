import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  server_uuid: z.string().describe('Server UUID'),
});

const outputSchema = z.object({
  type: z.enum(['traefik', 'nginx', 'caddy']),
  status: z.string(),
  version: z.string().optional(),
  configuration: z.object({
    http_port: z.number().optional(),
    https_port: z.number().optional(),
    dashboard_enabled: z.boolean().optional(),
    dashboard_url: z.string().optional(),
    log_level: z.string().optional(),
    access_log_enabled: z.boolean().optional(),
  }).optional(),
  custom_config: z.string().optional(),
});

export class GetProxyConfigurationTool extends BaseTool {
  name = 'get_proxy_configuration';
  description = 'Get proxy (Traefik/Nginx/Caddy) configuration for a server. Returns proxy type, status, and settings.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const response = await this.apiGet(`/servers/${input.server_uuid}/proxy/configuration`);
    
    return this.formatResponse(response.data);
  }
}
