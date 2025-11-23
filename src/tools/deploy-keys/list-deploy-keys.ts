import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  application_uuid: z.string().optional().describe('Filter by application UUID'),
});

const outputSchema = z.object({
  deploy_keys: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      public_key: z.string(),
      fingerprint: z.string().optional(),
      application_uuid: z.string().optional(),
      created_at: z.string(),
      last_used_at: z.string().optional(),
    })
  ),
});

export class ListDeployKeysTool extends BaseTool {
  name = 'list_deploy_keys';
  description = 'List all SSH deploy keys. Deploy keys provide read-only access to private Git repositories for deployment purposes.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    let endpoint = '/deploy-keys';
    
    if (input.application_uuid) {
      endpoint += `?application_uuid=${input.application_uuid}`;
    }

    const response = await this.apiGet(endpoint);
    
    return this.formatResponse({
      deploy_keys: Array.isArray(response.data) ? response.data : [],
    });
  }
}
