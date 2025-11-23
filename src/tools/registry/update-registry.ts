import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  registry_id: z.string().describe('Registry ID'),
  name: z.string().optional().describe('Registry name'),
  username: z.string().optional().describe('Registry username'),
  password: z.string().optional().describe('Registry password/token'),
  is_default: z.boolean().optional().describe('Set as default registry'),
});

const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  registry_id: z.string(),
});

export class UpdateRegistryTool extends BaseTool {
  name = 'update_registry';
  description = 'Update container registry credentials or settings. Useful for rotating tokens or updating authentication.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload: any = {};

    if (input.name) {
      payload.name = input.name;
    }

    if (input.username) {
      payload.username = input.username;
    }

    if (input.password) {
      payload.password = input.password;
    }

    if (input.is_default !== undefined) {
      payload.is_default = input.is_default;
    }

    const response = await this.apiPatch(`/registries/${input.registry_id}`, payload);
    
    return this.formatResponse({
      success: true,
      message: response.data?.message || 'Registry updated successfully',
      registry_id: input.registry_id,
    });
  }
}
