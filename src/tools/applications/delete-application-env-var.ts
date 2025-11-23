/**
 * Delete Application Environment Variable Tool
 * Deletes a specific environment variable from an application
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { DeleteApplicationEnvVarSchema } from '../../schemas/application.schemas.js';

export class DeleteApplicationEnvVarTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'delete_application_environment_variable';
  }

  get description(): string {
    return 'Delete a specific environment variable from an application. This removes the variable permanently.';
  }

  get inputSchema(): z.ZodSchema {
    return DeleteApplicationEnvVarSchema;
  }

  async execute(args: z.infer<typeof DeleteApplicationEnvVarSchema>): Promise<string> {
    this.logger.info(`Deleting environment variable ${args.key} from application: ${args.uuid}`);

    try {
      const result = await this.apiDelete(`/applications/${args.uuid}/envs/${args.key}`);

      this.logger.info(`Successfully deleted environment variable ${args.key} from application: ${args.uuid}`);

      return this.formatResponse({
        message: 'Environment variable deleted successfully',
        key: args.key,
        uuid: args.uuid,
        ...result
      });
    } catch (error: any) {
      this.logger.error(`Failed to delete environment variable ${args.key} from ${args.uuid}`, error);
      throw new Error(`Failed to delete environment variable: ${error.message}`);
    }
  }
}
