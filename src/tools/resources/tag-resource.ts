/**
 * Tag Resource Tool
 * Adds tags to a resource
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const TagResourceSchema = z.object({
  resource_type: z.enum(['application', 'database', 'service', 'server']).describe('Type of resource'),
  resource_uuid: z.string().describe('UUID of the resource'),
  tags: z.array(z.string()).describe('Array of tags to add'),
});

export class TagResourceTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'tag_resource';
  }

  get description(): string {
    return 'Add tags to a resource for better organization and filtering. Tags can be used for environment, team, criticality, etc.';
  }

  get inputSchema(): z.ZodSchema {
    return TagResourceSchema;
  }

  async execute(args: z.infer<typeof TagResourceSchema>): Promise<string> {
    this.logger.info(`Tagging resource: ${args.resource_uuid}`);

    try {
      const result = await this.apiPost(
        `/resources/${args.resource_type}/${args.resource_uuid}/tags`,
        { tags: args.tags }
      );

      this.logger.info(`Successfully tagged resource: ${args.resource_uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to tag resource ${args.resource_uuid}`, error);
      throw new Error(`Failed to tag resource: ${error.message}`);
    }
  }
}
