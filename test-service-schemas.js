#!/usr/bin/env node
/**
 * Service Schema Validation Test Script
 * Tests the Zod schemas for service operations
 */

import {
  ListServicesSchema,
  CreateServiceSchema,
  StartServiceSchema,
  StopServiceSchema,
  RestartServiceSchema
} from './build/schemas/service.schemas.js';

console.log('🧪 Testing Service Schemas...\n');

// Test 1: ListServicesSchema (should accept empty object)
console.log('✓ Test 1: ListServicesSchema');
try {
  const result = ListServicesSchema.parse({});
  console.log('  ✅ Empty object accepted');
} catch (error) {
  console.log('  ❌ Failed:', error.message);
}

// Test 2: CreateServiceSchema with type
console.log('\n✓ Test 2: CreateServiceSchema with type');
try {
  const result = CreateServiceSchema.parse({
    name: 'mysql-prod',
    description: 'Production MySQL',
    server_uuid: 'sg4gsws44wksg040o4ok80ww',
    project_uuid: 'p4w8gk4s0c8c4o0ksw80ok4w',
    environment_name: 'production',
    type: 'mysql'
  });
  console.log('  ✅ Valid service with type accepted');
} catch (error) {
  console.log('  ❌ Failed:', error.message);
}

// Test 3: CreateServiceSchema with docker_compose_raw
console.log('\n✓ Test 3: CreateServiceSchema with docker_compose_raw');
try {
  const result = CreateServiceSchema.parse({
    name: 'custom-nginx',
    server_uuid: 'sg4gsws44wksg040o4ok80ww',
    project_uuid: 'p4w8gk4s0c8c4o0ksw80ok4w',
    environment_name: 'production',
    docker_compose_raw: 'version: "3.8"\nservices:\n  web:\n    image: nginx:alpine'
  });
  console.log('  ✅ Valid service with docker_compose_raw accepted');
} catch (error) {
  console.log('  ❌ Failed:', error.message);
}

// Test 4: CreateServiceSchema with BOTH type and docker_compose_raw (should fail)
console.log('\n✓ Test 4: CreateServiceSchema mutual exclusivity (should fail)');
try {
  const result = CreateServiceSchema.parse({
    name: 'test-service',
    server_uuid: 'sg4gsws44wksg040o4ok80ww',
    project_uuid: 'p4w8gk4s0c8c4o0ksw80ok4w',
    environment_name: 'production',
    type: 'mysql',
    docker_compose_raw: 'version: "3.8"'
  });
  console.log('  ❌ Should have failed but accepted both type and docker_compose_raw');
} catch (error) {
  console.log('  ✅ Correctly rejected: Either type or docker_compose_raw must be provided, but not both');
}

// Test 5: CreateServiceSchema with NEITHER type nor docker_compose_raw (should fail)
console.log('\n✓ Test 5: CreateServiceSchema missing both type and docker_compose_raw (should fail)');
try {
  const result = CreateServiceSchema.parse({
    name: 'test-service',
    server_uuid: 'sg4gsws44wksg040o4ok80ww',
    project_uuid: 'p4w8gk4s0c8c4o0ksw80ok4w',
    environment_name: 'production'
  });
  console.log('  ❌ Should have failed but accepted without type or docker_compose_raw');
} catch (error) {
  console.log('  ✅ Correctly rejected: Either type or docker_compose_raw must be provided');
}

// Test 6: CreateServiceSchema missing required field
console.log('\n✓ Test 6: CreateServiceSchema missing required field (should fail)');
try {
  const result = CreateServiceSchema.parse({
    name: 'test-service',
    type: 'mysql'
  });
  console.log('  ❌ Should have failed but accepted without required fields');
} catch (error) {
  console.log('  ✅ Correctly rejected missing required fields');
}

// Test 7: StartServiceSchema
console.log('\n✓ Test 7: StartServiceSchema');
try {
  const result = StartServiceSchema.parse({
    uuid: 's4w8gk4s0c8c4o0ksw80ok4w'
  });
  console.log('  ✅ Valid UUID accepted');
} catch (error) {
  console.log('  ❌ Failed:', error.message);
}

// Test 8: StopServiceSchema
console.log('\n✓ Test 8: StopServiceSchema');
try {
  const result = StopServiceSchema.parse({
    uuid: 's4w8gk4s0c8c4o0ksw80ok4w'
  });
  console.log('  ✅ Valid UUID accepted');
} catch (error) {
  console.log('  ❌ Failed:', error.message);
}

// Test 9: RestartServiceSchema
console.log('\n✓ Test 9: RestartServiceSchema');
try {
  const result = RestartServiceSchema.parse({
    uuid: 's4w8gk4s0c8c4o0ksw80ok4w'
  });
  console.log('  ✅ Valid UUID accepted');
} catch (error) {
  console.log('  ❌ Failed:', error.message);
}

// Test 10: Invalid UUID format (should fail)
console.log('\n✓ Test 10: Invalid UUID format (should fail)');
try {
  const result = StartServiceSchema.parse({
    uuid: 'invalid-uuid-with-dashes'
  });
  console.log('  ❌ Should have failed but accepted invalid UUID');
} catch (error) {
  console.log('  ✅ Correctly rejected invalid UUID format');
}

console.log('\n✨ Schema validation tests complete!\n');
