import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  application_uuid: z.string().describe('Application UUID'),
  pull_request_id: z.number().describe('Pull request ID/number'),
  branch: z.string().optional().describe('Branch name (auto-detected if not provided)'),
  commit_sha: z.string().optional().describe('Specific commit SHA to deploy'),
  subdomain: z.string().optional().describe('Custom subdomain for preview'),
});

const outputSchema = z.object({
  preview_id: z.string(),
  application_uuid: z.string(),
  pull_request_id: z.number(),
  preview_url: z.string(),
  deployment_uuid: z.string().optional(),
  status: z.string(),
  message: z.string(),
});

export class CreatePreviewDeploymentTool extends BaseTool {
  name = 'create_preview_deployment';
  description = 'Create a preview deployment for a pull request. Automatically deploys PR changes to a temporary environment with unique URL. Perfect for testing changes before merging.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload: any = {
      pull_request_id: input.pull_request_id,
    };

    if (input.branch) {
      payload.branch = input.branch;
    }

    if (input.commit_sha) {
      payload.commit_sha = input.commit_sha;
    }

    if (input.subdomain) {
      payload.subdomain = input.subdomain;
    }

    const response = await this.apiPost(`/applications/${input.application_uuid}/previews`, payload);
    
    return this.formatResponse(response.data);
  }
}
