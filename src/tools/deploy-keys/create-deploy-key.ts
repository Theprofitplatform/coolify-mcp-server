import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  name: z.string().describe('Deploy key name'),
  application_uuid: z.string().optional().describe('Associate with specific application'),
  generate: z.boolean().optional().default(true).describe('Generate new SSH key pair'),
  public_key: z.string().optional().describe('Provide existing public key (if not generating)'),
});

const outputSchema = z.object({
  id: z.string(),
  name: z.string(),
  public_key: z.string(),
  fingerprint: z.string(),
  private_key: z.string().optional().describe('Only returned on creation'),
  instructions: z.string().optional(),
});

export class CreateDeployKeyTool extends BaseTool {
  name = 'create_deploy_key';
  description = 'Create a new SSH deploy key for accessing private Git repositories. Can generate new key pair or use existing public key. Add the public key to your Git repository settings.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload: any = {
      name: input.name,
      generate: input.generate,
    };

    if (input.application_uuid) {
      payload.application_uuid = input.application_uuid;
    }

    if (!input.generate && input.public_key) {
      payload.public_key = input.public_key;
    }

    const response = await this.apiPost('/deploy-keys', payload);
    
    return this.formatResponse(response.data);
  }
}
