/**
 * Environment Tool Validation Schemas
 * Zod schemas for environment-related operations
 */

import { z } from 'zod';
import { commonSchemas } from '../utils/validators.js';

export const ListEnvironmentsSchema = z.object({
  project_uuid: commonSchemas.uuid,
});

export const CreateEnvironmentSchema = z.object({
  name: commonSchemas.nonEmptyString,
  project_uuid: commonSchemas.uuid,
  description: z.string().optional(),
});
