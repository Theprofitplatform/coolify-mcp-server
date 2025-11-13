/**
 * Deployment Tool Validation Schemas
 * Zod schemas for deployment-related operations
 */

import { z } from 'zod';
import { commonSchemas } from '../utils/validators.js';

export const ListDeploymentsSchema = z.object({
  application_uuid: commonSchemas.uuid,
});

export const GetDeploymentSchema = z.object({
  deployment_uuid: commonSchemas.uuid,
});
