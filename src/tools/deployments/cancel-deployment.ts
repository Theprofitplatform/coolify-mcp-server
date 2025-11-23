/**
 * Cancel Deployment Tool
 * Cancels a running deployment
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { CancelDeploymentSchema } from '../../schemas/application.schemas.js';

export class CancelDeploymentTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'cancel_deployment';
  }

  get description(): string {
    return 'Cancel a running deployment. Useful when a deployment is stuck or needs to be aborted.';
  }

  get inputSchema(): z.ZodSchema {
    return CancelDeploymentSchema;
  }

  async execute(args: z.infer<typeof CancelDeploymentSchema>): Promise<string> {
    this.logger.info(`Cancelling deployment: ${args.deployment_uuid}`);

    try {
      const result = await this.apiGet(`/deployments/${args.deployment_uuid}/cancel`);

      this.logger.info(`Successfully cancelled deployment: ${args.deployment_uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to cancel deployment ${args.deployment_uuid}`, error);
      throw new Error(`Failed to cancel deployment: ${error.message}`);
    }
  }
}
