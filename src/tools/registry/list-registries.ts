import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({});

const outputSchema = z.object({
  registries: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      url: z.string(),
      type: z.enum(['docker-hub', 'github', 'gitlab', 'aws-ecr', 'google-gcr', 'azure-acr', 'custom']),
      is_default: z.boolean().optional(),
      created_at: z.string(),
    })
  ),
});

export class ListRegistriesTool extends BaseTool {
  name = 'list_registries';
  description = 'List all configured container registries. Shows Docker Hub, private registries, and cloud provider registries.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const response = await this.apiGet('/registries');
    
    return this.formatResponse({
      registries: Array.isArray(response.data) ? response.data : [],
    });
  }
}
