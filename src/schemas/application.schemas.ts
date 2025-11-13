/**
 * Application Tool Validation Schemas
 * Zod schemas for application-related operations
 */

import { z } from 'zod';
import { commonSchemas } from '../utils/validators.js';

export const ListApplicationsSchema = z.object({});

export const CreateApplicationSchema = z.object({
  project_uuid: commonSchemas.uuid,
  environment_name: commonSchemas.nonEmptyString,
  environment_uuid: commonSchemas.uuid.optional(),
  git_repository: z.string().url('Invalid Git repository URL').optional(),
  ports_exposes: z.string().optional(),
  destination_uuid: commonSchemas.uuid,
});

export const StopApplicationSchema = z.object({
  uuid: commonSchemas.uuid,
});

export const RestartApplicationSchema = z.object({
  uuid: commonSchemas.uuid,
});

export const GetApplicationLogsSchema = z.object({
  uuid: commonSchemas.uuid,
  lines: commonSchemas.positiveInteger.default(100).optional(),
});
