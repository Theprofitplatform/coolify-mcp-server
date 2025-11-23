import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  name: z.string().describe('Network name'),
  server_uuid: z.string().describe('Server UUID where network will be created'),
  driver: z.enum(['bridge', 'overlay', 'host', 'none', 'macvlan']).optional().default('bridge').describe('Network driver'),
  internal: z.boolean().optional().describe('Restrict external access to the network'),
  attachable: z.boolean().optional().describe('Enable manual container attachment'),
  ipam_driver: z.string().optional().default('default').describe('IP Address Management driver'),
  subnet: z.string().optional().describe('Subnet in CIDR format (e.g., 172.20.0.0/16)'),
  gateway: z.string().optional().describe('Gateway IP address'),
  ip_range: z.string().optional().describe('Allocate container IPs from a sub-range'),
  labels: z.record(z.string(), z.string()).optional().describe('Network labels'),
});

const outputSchema = z.object({
  id: z.string(),
  name: z.string(),
  driver: z.string(),
  scope: z.string(),
  message: z.string().optional(),
});

export class CreateNetworkTool extends BaseTool {
  name = 'create_network';
  description = 'Create a new Docker network for container communication and isolation. Supports various drivers and custom IP configuration.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload: any = {
      name: input.name,
      driver: input.driver || 'bridge',
      server_uuid: input.server_uuid,
    };

    if (input.internal !== undefined) {
      payload.internal = input.internal;
    }

    if (input.attachable !== undefined) {
      payload.attachable = input.attachable;
    }

    if (input.subnet || input.gateway || input.ip_range) {
      payload.ipam = {
        driver: input.ipam_driver || 'default',
        config: [{
          ...(input.subnet && { subnet: input.subnet }),
          ...(input.gateway && { gateway: input.gateway }),
          ...(input.ip_range && { ip_range: input.ip_range }),
        }],
      };
    }

    if (input.labels) {
      payload.labels = input.labels;
    }

    const response = await this.apiPost('/networks', payload);
    
    return this.formatResponse(response.data);
  }
}
