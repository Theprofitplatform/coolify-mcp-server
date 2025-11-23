import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  user_id: z.string().describe('User ID'),
  team_id: z.string().optional().describe('Get permissions for specific team'),
});

const outputSchema = z.object({
  user_id: z.string(),
  global_role: z.string().optional(),
  permissions: z.array(z.string()),
  team_permissions: z.array(
    z.object({
      team_id: z.string(),
      team_name: z.string(),
      role: z.string(),
      permissions: z.array(z.string()),
    })
  ).optional(),
});

export class GetUserPermissionsTool extends BaseTool {
  name = 'get_user_permissions';
  description = 'Get user permissions including global and team-specific permissions. Shows what actions user can perform.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    let endpoint = `/users/${input.user_id}/permissions`;
    
    if (input.team_id) {
      endpoint += `?team_id=${input.team_id}`;
    }

    const response = await this.apiGet(endpoint);
    
    return this.formatResponse(response.data);
  }
}
