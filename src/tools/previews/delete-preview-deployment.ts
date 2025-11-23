import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  application_uuid: z.string().describe('Application UUID'),
  preview_id: z.string().describe('Preview deployment ID'),
  delete_volumes: z.boolean().optional().default(true).describe('Delete associated volumes'),
});

const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  preview_id: z.string(),
});

export class DeletePreviewDeploymentTool extends BaseTool {
  name = 'delete_preview_deployment';
  description = 'Delete a preview deployment. Stops the preview environment and frees resources. Typically done when PR is merged or closed.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    let endpoint = `/applications/${input.application_uuid}/previews/${input.preview_id}`;
    
    if (input.delete_volumes) {
      endpoint += '?delete_volumes=true';
    }

    const response = await this.apiDelete(endpoint);
    
    return this.formatResponse({
      success: true,
      message: response.data?.message || 'Preview deployment deleted successfully',
      preview_id: input.preview_id,
    });
  }
}
