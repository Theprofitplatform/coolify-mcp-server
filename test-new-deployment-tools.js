#!/usr/bin/env node

/**
 * Test script for new deployment logging tools
 */

import { GetDeploymentLogsTool } from './build/tools/deployments/get-deployment-logs.js';
import { GetApplicationDeploymentHistoryTool } from './build/tools/deployments/get-application-deployment-history.js';

// Mock API client (not needed for database-backed tools)
const mockApiClient = {
  get: async () => ({}),
};

async function testDeploymentHistory() {
  console.log('🧪 Testing Get Application Deployment History Tool\n');
  
  const tool = new GetApplicationDeploymentHistoryTool(mockApiClient);
  
  try {
    const result = await tool.execute({
      application_uuid: 'zccwogo8g4884gwcgwk4wwoc',
      limit: 5,
    });
    
    console.log('✅ Tool executed successfully\n');
    console.log('Result:');
    console.log(result);
    console.log('\n' + '='.repeat(80) + '\n');
  } catch (error) {
    console.error('❌ Tool execution failed:', error.message);
  }
}

async function testDeploymentLogs() {
  console.log('🧪 Testing Get Deployment Logs Tool\n');
  
  const tool = new GetDeploymentLogsTool(mockApiClient);
  
  try {
    // Test with latest failed deployment
    const result = await tool.execute({
      deployment_uuid: 'n8sggk0444ks4w44wgsgccco',
      filter_errors: true,
    });
    
    console.log('✅ Tool executed successfully\n');
    console.log('Result (filtered errors only):');
    const parsed = JSON.parse(result);
    console.log(`- Total entries: ${parsed.total_entries}`);
    console.log(`- Filtered entries: ${parsed.filtered_entries}`);
    console.log(`- Filter applied: ${parsed.filter_applied}`);
    
    if (parsed.logs && parsed.logs.length > 0) {
      console.log('\nFirst error entry:');
      console.log(JSON.stringify(parsed.logs[0], null, 2));
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
  } catch (error) {
    console.error('❌ Tool execution failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Testing New Deployment Tools\n');
  console.log('='.repeat(80) + '\n');
  
  await testDeploymentHistory();
  await testDeploymentLogs();
  
  console.log('✅ All tests completed!');
}

main().catch(console.error);
