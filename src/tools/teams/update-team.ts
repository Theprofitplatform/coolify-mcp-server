/**
 * Update Team Tool
 * Updates team configuration
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const UpdateTeamSchema = z.object({
  id: z.string().describe('Team ID'),
  name: z.string().optional().describe('Team name'),
  description: z.string().optional().describe('Team description'),
});

export class UpdateTeamTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'update_team';
  }

  get description(): string {
    return 'Update team configuration including name and description.';
  }

  get inputSchema(): z.ZodSchema {
    return UpdateTeamSchema;
  }

  async execute(args: z.infer<typeof UpdateTeamSchema>): Promise<string> {
    const { id, ...updateData } = args;
    
    this.logger.info(`Updating team: ${id}`);

    try {
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      if (Object.keys(cleanData).length === 0) {
        return 'No update data provided. Please specify at least one field to update.';
      }

      const result = await this.apiPatch(`/teams/${id}`, cleanData);

      this.logger.info(`Successfully updated team: ${id}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to update team ${id}`, error);
      throw new Error(`Failed to update team: ${error.message}`);
    }
  }
}
