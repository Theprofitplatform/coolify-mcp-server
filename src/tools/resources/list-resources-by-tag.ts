/**
 * List Resources By Tag Tool
 * Lists all resources with a specific tag
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const ListResourcesByTagSchema = z.object({
  tag: z.string().describe('Tag to filter by'),
  type: z.enum(['all', 'application', 'database', 'service', 'server']).optional().describe('Resource type filter'),
});

export class ListResourcesByTagTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'list_resources_by_tag';
  }

  get description(): string {
    return 'List all resources that have a specific tag. Useful for filtering by environment, team, or other classifications.';
  }

  get inputSchema(): z.ZodSchema {
    return ListResourcesByTagSchema;
  }

  async execute(args: z.infer<typeof ListResourcesByTagSchema>): Promise<string> {
    this.logger.info(`Listing resources by tag: ${args.tag}`);

    try {
      const params: string[] = [`tag=${encodeURIComponent(args.tag)}`];
      if (args.type) params.push(`type=${args.type}`);
      
      const queryString = '?' + params.join('&');
      const resources = await this.apiGet(`/resources/by-tag${queryString}`);

      this.logger.info(`Successfully listed resources by tag: ${args.tag}`);

      return this.formatResponse(resources);
    } catch (error: any) {
      this.logger.error(`Failed to list resources by tag ${args.tag}`, error);
      throw new Error(`Failed to list resources by tag: ${error.message}`);
    }
  }
}
