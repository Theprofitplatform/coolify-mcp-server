/**
 * Database Schemas
 * Validation schemas for database operations
 */

import { z } from 'zod';

// List Databases Schema
export const ListDatabasesSchema = z.object({});

// Get Database Schema
export const GetDatabaseSchema = z.object({
  uuid: z.string().describe('UUID of the database to retrieve'),
});

// Create Database Schema
export const CreateDatabaseSchema = z.object({
  project_uuid: z.string().describe('UUID of the project'),
  environment_name: z.string().describe('Name of the environment'),
  server_uuid: z.string().describe('UUID of the server to deploy on'),
  type: z.enum(['postgresql', 'mysql', 'mongodb', 'redis', 'mariadb', 'keydb', 'dragonfly', 'clickhouse'])
    .describe('Type of database to create'),
  name: z.string().describe('Database name'),
  description: z.string().optional().describe('Database description'),
  image: z.string().optional().describe('Docker image to use (default uses official image)'),
  instant_deploy: z.boolean().optional().describe('Start database immediately after creation'),
});

// Start Database Schema
export const StartDatabaseSchema = z.object({
  uuid: z.string().describe('UUID of the database to start'),
});

// Stop Database Schema
export const StopDatabaseSchema = z.object({
  uuid: z.string().describe('UUID of the database to stop'),
});

// Restart Database Schema
export const RestartDatabaseSchema = z.object({
  uuid: z.string().describe('UUID of the database to restart'),
});

// Backup Database Schema
export const BackupDatabaseSchema = z.object({
  uuid: z.string().describe('UUID of the database to backup'),
});

// Update Database Schema
export const UpdateDatabaseSchema = z.object({
  uuid: z.string().describe('UUID of the database to update'),
  name: z.string().optional().describe('New database name'),
  description: z.string().optional().describe('New description'),
  image: z.string().optional().describe('New Docker image'),
});

// Delete Database Schema
export const DeleteDatabaseSchema = z.object({
  uuid: z.string().describe('UUID of the database to delete'),
  delete_volumes: z.boolean().optional().describe('Also delete associated volumes'),
});

// Restore Database Schema
export const RestoreDatabaseSchema = z.object({
  uuid: z.string().describe('UUID of the database to restore'),
  backup_id: z.string().optional().describe('Specific backup ID to restore from (uses latest if not provided)'),
});
