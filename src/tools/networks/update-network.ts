import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  network_id: z.string().describe('Network ID or name'),
  server_uuid: z.string().optional().describe('Server UUID where network exists'),
  labels: z.record(z.string(), z.string()).optional().describe('Update network labels'),
});

const outputSchema = z.object({
  id: z.string(),
  name: z.string(),
  message: z.string().optional(),
});

export class UpdateNetworkTool extends BaseTool {
  name = 'update_network';
  description = 'Update Docker network configuration. Currently supports updating labels.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload: any = {};

    if (input.labels) {
      payload.labels = input.labels;
    }

    if (input.server_uuid) {
      payload.server_uuid = input.server_uuid;
    }

    const response = await this.apiPatch(`/networks/${input.network_id}`, payload);
    
    return this.formatResponse(response.data);
  }
}
