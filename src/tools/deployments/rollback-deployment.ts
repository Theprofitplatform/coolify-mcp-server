/**
 * Rollback Deployment Tool
 * Rolls back an application to a previous deployment
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const RollbackDeploymentSchema = z.object({
  uuid: z.string().describe('UUID of the application'),
  deployment_uuid: z.string().optional().describe('UUID of the deployment to rollback to'),
  version: z.string().optional().describe('Version tag to rollback to'),
});

export class RollbackDeploymentTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'rollback_deployment';
  }

  get description(): string {
    return 'Rollback an application to a previous deployment. Specify either deployment UUID or version tag.';
  }

  get inputSchema(): z.ZodSchema {
    return RollbackDeploymentSchema;
  }

  async execute(args: z.infer<typeof RollbackDeploymentSchema>): Promise<string> {
    this.logger.info(`Rolling back deployment for: ${args.uuid}`);
    this.logger.warn(`ROLLBACK operation requested for application: ${args.uuid}`);

    try {
      if (!args.deployment_uuid && !args.version) {
        throw new Error('Either deployment_uuid or version must be provided');
      }

      const payload: any = {};
      if (args.deployment_uuid) payload.deployment_uuid = args.deployment_uuid;
      if (args.version) payload.version = args.version;

      const result = await this.apiPost(`/applications/${args.uuid}/rollback`, payload);

      this.logger.info(`Successfully initiated rollback for: ${args.uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to rollback deployment for ${args.uuid}`, error);
      throw new Error(`Failed to rollback deployment: ${error.message}`);
    }
  }
}
