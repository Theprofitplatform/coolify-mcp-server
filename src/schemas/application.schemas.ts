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

export const GetApplicationSchema = z.object({
  uuid: commonSchemas.uuid,
});

export const DeployApplicationSchema = z.object({
  uuid: commonSchemas.uuid.optional(),
  tag: z.string().optional(),
  force: z.boolean().optional(),
  instant_deploy: z.boolean().optional(),
  commit: z.string().optional(),
});

export const GetApplicationEnvVarsSchema = z.object({
  uuid: commonSchemas.uuid,
});

export const UpdateApplicationSchema = z.object({
  uuid: commonSchemas.uuid,
  name: z.string().optional(),
  description: z.string().optional(),
  git_repository: z.string().url('Invalid Git repository URL').optional(),
  git_branch: z.string().optional(),
  git_commit_sha: z.string().optional(),
  build_pack: z.enum(['nixpacks', 'static', 'dockerfile', 'dockercompose']).optional(),
  install_command: z.string().optional(),
  build_command: z.string().optional(),
  start_command: z.string().optional(),
  ports_exposes: z.string().optional(),
  base_directory: z.string().optional(),
  publish_directory: z.string().optional(),
});

export const DeleteApplicationSchema = z.object({
  uuid: commonSchemas.uuid,
  delete_volumes: z.boolean().optional().describe('Also delete associated volumes'),
  delete_configurations: z.boolean().optional().describe('Also delete configurations'),
});

export const StartApplicationSchema = z.object({
  uuid: commonSchemas.uuid,
});

export const CancelDeploymentSchema = z.object({
  deployment_uuid: z.string().describe('UUID of the deployment to cancel'),
});

export const SetApplicationEnvVarSchema = z.object({
  uuid: commonSchemas.uuid,
  key: z.string().describe('Environment variable key/name'),
  value: z.string().describe('Environment variable value'),
  is_preview: z.boolean().optional().describe('Set for preview deployments only'),
});

export const UpdateApplicationEnvVarsSchema = z.object({
  uuid: commonSchemas.uuid,
  env_vars: z.record(z.string(), z.string()).describe('Object with key-value pairs of environment variables'),
  restart_after_update: z.boolean().optional().describe('Automatically restart application after update'),
});

export const DeleteApplicationEnvVarSchema = z.object({
  uuid: commonSchemas.uuid,
  key: z.string().describe('Environment variable key/name to delete'),
});
