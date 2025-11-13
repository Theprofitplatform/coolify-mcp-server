/**
 * Get Team Tool
 * Retrieves details of a specific team
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { GetTeamSchema } from '../../schemas/team.schemas.js';

export class GetTeamTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_team';
  }

  get description(): string {
    return 'Get details of a specific team. Requires a team ID obtained from list_teams.';
  }

  get inputSchema(): z.ZodSchema {
    return GetTeamSchema;
  }

  async execute(args: z.infer<typeof GetTeamSchema>): Promise<string> {
    this.logger.info('Fetching team', { teamId: args.team_id });

    const team = await this.apiGet(`/teams/${args.team_id}`);

    this.logger.info('Team retrieved successfully');

    return this.formatResponse(team);
  }
}
