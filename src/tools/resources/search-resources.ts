/**
 * Search Resources Tool
 * Searches across all resources
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const SearchResourcesSchema = z.object({
  query: z.string().describe('Search query'),
  type: z.enum(['all', 'application', 'database', 'service', 'server']).optional().describe('Resource type filter'),
});

export class SearchResourcesTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'search_resources';
  }

  get description(): string {
    return 'Search across all resources (applications, databases, services, servers) by name, description, or tags.';
  }

  get inputSchema(): z.ZodSchema {
    return SearchResourcesSchema;
  }

  async execute(args: z.infer<typeof SearchResourcesSchema>): Promise<string> {
    this.logger.info(`Searching resources: ${args.query}`);

    try {
      const params: string[] = [`q=${encodeURIComponent(args.query)}`];
      if (args.type) params.push(`type=${args.type}`);
      
      const queryString = '?' + params.join('&');
      const results = await this.apiGet(`/resources/search${queryString}`);

      this.logger.info(`Successfully searched resources: ${args.query}`);

      return this.formatResponse(results);
    } catch (error: any) {
      this.logger.error(`Failed to search resources for ${args.query}`, error);
      throw new Error(`Failed to search resources: ${error.message}`);
    }
  }
}
