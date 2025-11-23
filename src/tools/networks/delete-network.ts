import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  network_id: z.string().describe('Network ID or name to delete'),
  server_uuid: z.string().optional().describe('Server UUID where network exists'),
  force: z.boolean().optional().describe('Force deletion even if containers are connected'),
});

const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  network_id: z.string(),
});

export class DeleteNetworkTool extends BaseTool {
  name = 'delete_network';
  description = 'Delete a Docker network. Cannot delete if containers are still connected unless force is used. CAUTION: This action is irreversible.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    let endpoint = `/networks/${input.network_id}`;
    const params = [];
    
    if (input.server_uuid) {
      params.push(`server_uuid=${input.server_uuid}`);
    }
    
    if (input.force) {
      params.push('force=true');
    }
    
    if (params.length > 0) {
      endpoint += '?' + params.join('&');
    }

    const response = await this.apiDelete(endpoint);
    
    return this.formatResponse({
      success: true,
      message: response.data?.message || 'Network deleted successfully',
      network_id: input.network_id,
    });
  }
}
