import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  application_uuid: z.string().describe('Application UUID'),
  status: z.enum(['active', 'stopped', 'failed', 'all']).optional().default('all').describe('Filter by status'),
});

const outputSchema = z.object({
  previews: z.array(
    z.object({
      preview_id: z.string(),
      pull_request_id: z.number(),
      branch: z.string(),
      preview_url: z.string(),
      status: z.string(),
      created_at: z.string(),
      last_deployed_at: z.string().optional(),
    })
  ),
});

export class ListPreviewDeploymentsTool extends BaseTool {
  name = 'list_preview_deployments';
  description = 'List all preview deployments for an application. Shows active PR previews with their URLs and status.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    let endpoint = `/applications/${input.application_uuid}/previews`;
    
    if (input.status && input.status !== 'all') {
      endpoint += `?status=${input.status}`;
    }

    const response = await this.apiGet(endpoint);
    
    return this.formatResponse({
      previews: Array.isArray(response.data) ? response.data : [],
    });
  }
}
