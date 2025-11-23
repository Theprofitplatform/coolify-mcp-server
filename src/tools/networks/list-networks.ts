import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  server_uuid: z.string().optional().describe('Filter networks by server UUID'),
});

const outputSchema = z.object({
  networks: z.array(
    z.object({
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
      containers: z.array(z.any()).optional(),
      created: z.string().optional(),
    })
  ),
});

export class ListNetworksTool extends BaseTool {
  name = 'list_networks';
  description = 'List all Docker networks. Networks are used for container communication and isolation. Can filter by server.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    let endpoint = '/networks';
    
    if (input.server_uuid) {
      endpoint += `?server_uuid=${input.server_uuid}`;
    }

    const response = await this.apiGet(endpoint);
    
    return this.formatResponse({
      networks: Array.isArray(response.data) ? response.data : [],
    });
  }
}
