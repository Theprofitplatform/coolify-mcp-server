import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  name: z.string().describe('Registry name'),
  url: z.string().describe('Registry URL (e.g., "registry.example.com")'),
  type: z.enum(['docker-hub', 'github', 'gitlab', 'aws-ecr', 'google-gcr', 'azure-acr', 'custom']).describe('Registry type'),
  username: z.string().optional().describe('Registry username'),
  password: z.string().optional().describe('Registry password/token'),
  is_default: z.boolean().optional().default(false).describe('Set as default registry'),
});

const outputSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  type: z.string(),
  message: z.string(),
});

export class AddRegistryTool extends BaseTool {
  name = 'add_registry';
  description = 'Add a new container registry for pulling private images. Supports Docker Hub, GitHub, GitLab, AWS ECR, Google GCR, Azure ACR, and custom registries.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload = {
      name: input.name,
      url: input.url,
      type: input.type,
      is_default: input.is_default,
      ...(input.username && { username: input.username }),
      ...(input.password && { password: input.password }),
    };

    const response = await this.apiPost('/registries', payload);
    
    return this.formatResponse(response.data);
  }
}
