import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  user_id: z.string().describe('User ID'),
  team_id: z.string().describe('Team ID'),
  role: z.enum(['owner', 'admin', 'member', 'viewer']).optional().describe('Team role'),
  permissions: z.array(z.string()).optional().describe('Specific permissions to grant'),
});

const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user_id: z.string(),
  team_id: z.string(),
  updated_role: z.string().optional(),
});

export class UpdateUserPermissionsTool extends BaseTool {
  name = 'update_user_permissions';
  description = 'Update user permissions within a team. Can change role or grant specific permissions. Roles: owner (full access), admin (manage resources), member (use resources), viewer (read-only).';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload: any = {
      team_id: input.team_id,
    };

    if (input.role) {
      payload.role = input.role;
    }

    if (input.permissions) {
      payload.permissions = input.permissions;
    }

    const response = await this.apiPatch(`/users/${input.user_id}/permissions`, payload);
    
    return this.formatResponse({
      success: true,
      message: response.data?.message || 'User permissions updated successfully',
      user_id: input.user_id,
      team_id: input.team_id,
      updated_role: input.role,
    });
  }
}
