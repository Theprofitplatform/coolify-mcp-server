import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  network_id: z.string().describe('Network ID or name'),
  resource_uuid: z.string().describe('Resource UUID (application, service, or database)'),
  resource_type: z.enum(['application', 'service', 'database']).describe('Type of resource to connect'),
  server_uuid: z.string().optional().describe('Server UUID'),
  ipv4_address: z.string().optional().describe('Static IPv4 address for the container'),
  ipv6_address: z.string().optional().describe('Static IPv6 address for the container'),
  aliases: z.array(z.string()).optional().describe('Network aliases for the container'),
});

const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  network_id: z.string(),
  resource_uuid: z.string(),
  endpoint_id: z.string().optional(),
});

export class ConnectResourceToNetworkTool extends BaseTool {
  name = 'connect_resource_to_network';
  description = 'Connect a resource (application, service, or database) to a Docker network. Enables communication between containers on the same network.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload: any = {
      resource_uuid: input.resource_uuid,
      resource_type: input.resource_type,
    };

    if (input.server_uuid) {
      payload.server_uuid = input.server_uuid;
    }

    if (input.ipv4_address) {
      payload.ipv4_address = input.ipv4_address;
    }

    if (input.ipv6_address) {
      payload.ipv6_address = input.ipv6_address;
    }

    if (input.aliases && input.aliases.length > 0) {
      payload.aliases = input.aliases;
    }

    const response = await this.apiPost(`/networks/${input.network_id}/connect`, payload);
    
    return this.formatResponse({
      success: true,
      message: response.data?.message || 'Resource connected to network successfully',
      network_id: input.network_id,
      resource_uuid: input.resource_uuid,
      endpoint_id: response.data?.endpoint_id,
    });
  }
}
