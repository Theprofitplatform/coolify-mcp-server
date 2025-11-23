import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  deploy_key_id: z.string().describe('Deploy key ID'),
});

const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export class DeleteDeployKeyTool extends BaseTool {
  name = 'delete_deploy_key';
  description = 'Delete a deploy key. This will prevent deployments using this key until a new key is configured. CAUTION: This action is irreversible.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const response = await this.apiDelete(`/deploy-keys/${input.deploy_key_id}`);
    
    return this.formatResponse({
      success: true,
      message: response.data?.message || 'Deploy key deleted successfully',
    });
  }
}
