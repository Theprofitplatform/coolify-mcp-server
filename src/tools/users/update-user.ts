import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  user_id: z.string().describe('User ID'),
  name: z.string().optional().describe('User name'),
  email: z.string().email().optional().describe('Email address'),
  is_active: z.boolean().optional().describe('Account active status'),
  two_factor_required: z.boolean().optional().describe('Require 2FA for this user'),
});

const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user_id: z.string(),
});

export class UpdateUserTool extends BaseTool {
  name = 'update_user';
  description = 'Update user information. Can update name, email, active status, and 2FA requirements.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const payload: any = {};

    if (input.name) {
      payload.name = input.name;
    }

    if (input.email) {
      payload.email = input.email;
    }

    if (input.is_active !== undefined) {
      payload.is_active = input.is_active;
    }

    if (input.two_factor_required !== undefined) {
      payload.two_factor_required = input.two_factor_required;
    }

    const response = await this.apiPatch(`/users/${input.user_id}`, payload);
    
    return this.formatResponse({
      success: true,
      message: response.data?.message || 'User updated successfully',
      user_id: input.user_id,
    });
  }
}
