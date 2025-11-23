import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  application_uuids: z.array(z.string()).describe('Array of application UUIDs to deploy'),
  force_rebuild: z.boolean().optional().describe('Force rebuild even if no changes detected'),
  instant_deploy: z.boolean().optional().describe('Skip build and deploy instantly'),
});

const outputSchema = z.object({
  results: z.array(
    z.object({
      application_uuid: z.string(),
      deployment_uuid: z.string().optional(),
      status: z.enum(['success', 'failed']),
      message: z.string().optional(),
      error: z.string().optional(),
    })
  ),
  summary: z.object({
    total: z.number(),
    succeeded: z.number(),
    failed: z.number(),
  }),
});

export class BatchDeployApplicationsTool extends BaseTool {
  name = 'batch_deploy_applications';
  description = 'Deploy multiple applications at once. This is much faster than deploying applications individually. Returns status for each deployment.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const results = [];
    let succeeded = 0;
    let failed = 0;

    // Deploy all applications in parallel
    const deployPromises = input.application_uuids.map(async (uuid) => {
      try {
        const params: Record<string, string | boolean> = {};
        
        if (input.force_rebuild !== undefined) {
          params.force_rebuild = input.force_rebuild;
        }
        
        if (input.instant_deploy !== undefined) {
          params.instant_deploy = input.instant_deploy;
        }

        const response = await this.apiPost(`/applications/${uuid}/deploy`, params);
        
        succeeded++;
        return {
          application_uuid: uuid,
          deployment_uuid: response.data?.uuid || response.data?.deployment_uuid,
          status: 'success' as const,
          message: response.data?.message || 'Deployment started successfully',
        };
      } catch (error: any) {
        failed++;
        return {
          application_uuid: uuid,
          status: 'failed' as const,
          error: error.response?.data?.message || error.message || 'Unknown error',
        };
      }
    });

    const deployResults = await Promise.all(deployPromises);
    results.push(...deployResults);

    const response = {
      results,
      summary: {
        total: input.application_uuids.length,
        succeeded,
        failed,
      },
    };

    return this.formatResponse(response);
  }
}
