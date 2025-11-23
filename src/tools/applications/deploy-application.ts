/**
 * Deploy Application Tool
 * Triggers a deployment for a specific application
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { DeployApplicationSchema } from '../../schemas/application.schemas.js';

export class DeployApplicationTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'deploy_application';
  }

  get description(): string {
    return 'Trigger a deployment for a specific application. Can deploy by UUID or tag, with options for force rebuild and instant deploy.';
  }

  get inputSchema(): z.ZodSchema {
    return DeployApplicationSchema;
  }

  async execute(args: z.infer<typeof DeployApplicationSchema>): Promise<string> {
    // Validate that either uuid or tag is provided
    if (!args.uuid && !args.tag) {
      throw new Error('Either uuid or tag must be provided');
    }

    const identifier = args.uuid || args.tag;
    this.logger.info(`Triggering deployment for application: ${identifier}`);

    try {
      // Build query parameters
      const params: Record<string, string> = {};
      if (args.force) params.force = 'true';
      if (args.instant_deploy) params.instant_deploy = 'true';
      if (args.commit) params.commit = args.commit;

      const queryString = Object.keys(params).length > 0 
        ? '?' + new URLSearchParams(params).toString() 
        : '';

      // Trigger deployment
      const endpoint = args.uuid 
        ? `/applications/${args.uuid}/deploy${queryString}`
        : `/deploy?tag=${args.tag}${queryString ? '&' + queryString.substring(1) : ''}`;

      const result = await this.apiGet(endpoint);

      this.logger.info(`Deployment triggered successfully for: ${identifier}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to deploy application ${identifier}`, error);
      throw new Error(`Failed to deploy application: ${error.message}`);
    }
  }
}
