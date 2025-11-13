/**
 * List Deployments Tool
 * Retrieves all deployments for a specific application
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { ListDeploymentsSchema } from '../../schemas/deployment.schemas.js';

export class ListDeploymentsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'list_deployments';
  }

  get description(): string {
    return 'List all deployments for a specific application. Use this to see deployment history and status.';
  }

  get inputSchema(): z.ZodSchema {
    return ListDeploymentsSchema;
  }

  async execute(args: z.infer<typeof ListDeploymentsSchema>): Promise<string> {
    this.logger.info('Fetching deployments for application', { uuid: args.application_uuid });

    const deployments = await this.apiGet(`/applications/${args.application_uuid}/deployments`);

    if (!Array.isArray(deployments) || deployments.length === 0) {
      return 'No deployments found for this application.';
    }

    this.logger.info(`Found ${deployments.length} deployment(s)`);

    return this.formatResponse(deployments);
  }
}
