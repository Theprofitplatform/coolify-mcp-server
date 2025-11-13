/**
 * Get Current Team Tool
 * Retrieves details of the currently authenticated team
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { GetCurrentTeamSchema } from '../../schemas/team.schemas.js';

export class GetCurrentTeamTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_current_team';
  }

  get description(): string {
    return 'Get details of the currently authenticated team. This is the team associated with your API token.';
  }

  get inputSchema(): z.ZodSchema {
    return GetCurrentTeamSchema;
  }

  async execute(_args: z.infer<typeof GetCurrentTeamSchema>): Promise<string> {
    this.logger.info('Fetching current team');

    const team = await this.apiGet('/teams/current');

    this.logger.info('Current team retrieved successfully');

    return this.formatResponse(team);
  }
}
