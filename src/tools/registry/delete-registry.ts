import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  registry_id: z.string().describe('Registry ID'),
});

const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export class DeleteRegistryTool extends BaseTool {
  name = 'delete_registry';
  description = 'Delete a container registry. Applications using this registry will no longer be able to pull images from it. CAUTION: This action is irreversible.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const response = await this.apiDelete(`/registries/${input.registry_id}`);
    
    return this.formatResponse({
      success: true,
      message: response.data?.message || 'Registry deleted successfully',
    });
  }
}
