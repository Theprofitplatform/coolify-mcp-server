#!/usr/bin/env node

/**
 * Test Coolify API Connection
 * Verifies that we can connect to the Coolify API and list basic resources
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const baseURL = process.env.COOLIFY_BASE_URL;
const token = process.env.COOLIFY_TOKEN;

console.log('🧪 Testing Coolify API Connection\n');
console.log('📋 Configuration:');
console.log(`   Base URL: ${baseURL}`);
console.log(`   Token: ${token ? token.substring(0, 10) + '...' : '[NOT SET]'}\n`);

if (!baseURL || !token) {
  console.error('❌ Missing required environment variables');
  console.error('   Please check your .env file');
  process.exit(1);
}

// Create axios instance
const api = axios.create({
  baseURL,
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

async function testAPI() {
  const tests = [
    {
      name: 'Get Version',
      endpoint: '/api/v1/version',
      method: 'get'
    },
    {
      name: 'List Teams',
      endpoint: '/api/v1/teams',
      method: 'get'
    },
    {
      name: 'List Servers',
      endpoint: '/api/v1/servers',
      method: 'get'
    },
    {
      name: 'List Projects',
      endpoint: '/api/v1/projects',
      method: 'get'
    },
    {
      name: 'List Applications',
      endpoint: '/api/v1/applications',
      method: 'get'
    },
    {
      name: 'List Services',
      endpoint: '/api/v1/services',
      method: 'get'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}...`);
      const response = await api[test.method](test.endpoint);
      console.log(`   ✅ Success (${response.status})`);

      // Show some data if available
      if (response.data) {
        if (Array.isArray(response.data)) {
          console.log(`   📊 Found ${response.data.length} item(s)`);
        } else if (response.data.version) {
          console.log(`   📦 Version: ${response.data.version}`);
        } else if (typeof response.data === 'object') {
          console.log(`   📄 Data: ${JSON.stringify(response.data).substring(0, 100)}...`);
        }
      }

      passed++;
    } catch (error) {
      console.log(`   ❌ Failed`);
      if (error.response) {
        console.log(`   Status: ${error.response.status} - ${error.response.statusText}`);
        if (error.response.data) {
          console.log(`   Message: ${JSON.stringify(error.response.data).substring(0, 100)}`);
        }
      } else {
        console.log(`   Error: ${error.message}`);
      }
      failed++;
    }
    console.log('');
  }

  console.log('📊 Test Summary:');
  console.log(`   ✅ Passed: ${passed}/${tests.length}`);
  console.log(`   ❌ Failed: ${failed}/${tests.length}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Coolify API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
  }
}

testAPI().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
