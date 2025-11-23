import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  network_id: z.string().describe('Network ID or name'),
  server_uuid: z.string().optional().describe('Server UUID where network exists'),
});

const outputSchema = z.object({
  id: z.string(),
  name: z.string(),
  driver: z.string(),
  scope: z.string(),
  internal: z.boolean().optional(),
  attachable: z.boolean().optional(),
  ipam: z.object({
    driver: z.string(),
    config: z.array(z.any()).optional(),
  }).optional(),
  containers: z.array(
    z.object({
      name: z.string(),
      endpoint_id: z.string(),
      mac_address: z.string().optional(),
      ipv4_address: z.string().optional(),
      ipv6_address: z.string().optional(),
    })
  ).optional(),
  options: z.record(z.string(), z.string()).optional(),
  labels: z.record(z.string(), z.string()).optional(),
  created: z.string().optional(),
});

export class GetNetworkTool extends BaseTool {
  name = 'get_network';
  description = 'Get detailed information about a specific Docker network including connected containers and configuration.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    let endpoint = `/networks/${input.network_id}`;
    
    if (input.server_uuid) {
      endpoint += `?server_uuid=${input.server_uuid}`;
    }

    const response = await this.apiGet(endpoint);
    
    return this.formatResponse(response.data);
  }
}
