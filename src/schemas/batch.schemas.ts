/**
 * Batch Operation Schemas
 * Validation schemas for batch operation tools
 */

import { z } from 'zod';
import { commonSchemas } from '../utils/validators.js';

/**
 * Schema for batch restarting multiple applications
 */
export const BatchRestartApplicationsSchema = z.object({
  application_uuids: z.array(commonSchemas.uuid).min(1, 'At least one application UUID is required'),
  parallel: z.boolean().default(true).describe('Execute operations in parallel'),
  wait_for_completion: z.boolean().default(false).describe('Wait for all operations to complete'),
});

/**
 * Schema for batch stopping multiple applications
 */
export const BatchStopApplicationsSchema = z.object({
  application_uuids: z.array(commonSchemas.uuid).min(1, 'At least one application UUID is required'),
  force: z.boolean().default(false).describe('Force stop even if graceful shutdown fails'),
});

/**
 * Schema for batch starting multiple services
 */
export const BatchStartServicesSchema = z.object({
  service_uuids: z.array(commonSchemas.uuid).min(1, 'At least one service UUID is required'),
});

/**
 * Schema for batch stopping multiple services
 */
export const BatchStopServicesSchema = z.object({
  service_uuids: z.array(commonSchemas.uuid).min(1, 'At least one service UUID is required'),
  force: z.boolean().default(false).describe('Force stop even if graceful shutdown fails'),
});

/**
 * Schema for batch updating environment variables across applications
 */
export const BatchUpdateEnvVarsSchema = z.object({
  application_uuids: z.array(commonSchemas.uuid).min(1, 'At least one application UUID is required'),
  env_vars: z.record(z.string(), z.string()).refine(
    (vars) => Object.keys(vars).length > 0,
    'At least one environment variable is required'
  ),
  restart_after_update: z.boolean().default(false).describe('Restart applications after updating environment variables'),
});
