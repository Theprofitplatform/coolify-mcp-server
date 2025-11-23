import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  registry_id: z.string().describe('Registry ID'),
});

const outputSchema = z.object({
  is_reachable: z.boolean(),
  authenticated: z.boolean(),
  response_time_ms: z.number().optional(),
  message: z.string(),
  error: z.string().optional(),
});

export class TestRegistryConnectionTool extends BaseTool {
  name = 'test_registry_connection';
  description = 'Test connection to a container registry. Verifies credentials and connectivity. Useful for troubleshooting registry issues.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const response = await this.apiPost(`/registries/${input.registry_id}/test`, {});
    
    return this.formatResponse(response.data);
  }
}
