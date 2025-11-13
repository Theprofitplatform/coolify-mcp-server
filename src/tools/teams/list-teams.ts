/**
 * List Teams Tool
 * Retrieves all teams accessible by the current user
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { ListTeamsSchema } from '../../schemas/team.schemas.js';

export class ListTeamsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'list_teams';
  }

  get description(): string {
    return 'List all teams the authenticated user has access to. Use this to get team UUIDs needed for other operations.';
  }

  get inputSchema(): z.ZodSchema {
    return ListTeamsSchema;
  }

  async execute(_args: z.infer<typeof ListTeamsSchema>): Promise<string> {
    this.logger.info('Fetching all teams');

    const teams = await this.apiGet('/teams');

    if (!Array.isArray(teams) || teams.length === 0) {
      return 'No teams found.';
    }

    this.logger.info(`Found ${teams.length} team(s)`);

    return this.formatResponse(teams);
  }
}
