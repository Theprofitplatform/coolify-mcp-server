/**
 * Get Deployment Tool
 * Retrieves details of a specific deployment
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { GetDeploymentSchema } from '../../schemas/deployment.schemas.js';

export class GetDeploymentTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_deployment';
  }

  get description(): string {
    return 'Get details of a specific deployment including status, logs, and metadata.';
  }

  get inputSchema(): z.ZodSchema {
    return GetDeploymentSchema;
  }

  async execute(args: z.infer<typeof GetDeploymentSchema>): Promise<string> {
    this.logger.info('Fetching deployment', { uuid: args.deployment_uuid });

    const deployment = await this.apiGet(`/deployments/${args.deployment_uuid}`);

    this.logger.info('Deployment retrieved successfully');

    return this.formatResponse(deployment);
  }
}
