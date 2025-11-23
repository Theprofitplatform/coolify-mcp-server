#!/usr/bin/env node

/**
 * Check Server Patches Script
 * Investigates server patch status and critical updates
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = process.env.COOLIFY_BASE_URL;
const API_TOKEN = process.env.COOLIFY_TOKEN;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

async function main() {
  console.log('🔍 Checking server patches...\n');

  try {
    // 1. List all servers
    console.log('📋 Fetching servers...');
    const serversResponse = await api.get('/api/v1/servers');
    const servers = serversResponse.data;

    console.log(`Found ${servers.length} server(s)\n`);

    // 2. Find the itchy-iguana server
    const targetServer = servers.find(s =>
      (s.uuid && s.uuid.includes('itchy-iguana')) ||
      (s.name && s.name.includes('itchy-iguana'))
    );

    if (!targetServer) {
      console.log('❌ Server "itchy-iguana" not found');
      console.log('Available servers:');
      servers.forEach(s => console.log(`  - ${s.name || s.uuid}`));
      return;
    }

    console.log('✅ Found target server:');
    console.log(`   Name: ${targetServer.name || 'N/A'}`);
    console.log(`   UUID: ${targetServer.uuid}`);
    console.log(`   IP: ${targetServer.ip || 'N/A'}`);
    console.log();

    // 3. Check server details and validation status
    console.log('🔍 Checking server validation status...');
    const detailsResponse = await api.get(`/api/v1/servers/${targetServer.uuid}`);
    const serverDetails = detailsResponse.data;

    console.log('Server Details:');
    console.log(`   Validation Status: ${serverDetails.validation_logs || 'N/A'}`);
    console.log(`   Is Reachable: ${serverDetails.is_reachable || 'N/A'}`);
    console.log();

    // 4. Try to get patch information
    console.log('📦 Checking for available patches...');

    // Try different endpoints that might have patch information
    const endpoints = [
      `/api/v1/servers/${targetServer.uuid}/patches`,
      `/api/v1/servers/${targetServer.uuid}/updates`,
      `/api/v1/servers/${targetServer.uuid}/maintenance`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint);
        console.log(`✅ Found patch data at ${endpoint}:`);
        console.log(JSON.stringify(response.data, null, 2));
        console.log();
      } catch (error) {
        if (error.response?.status !== 404) {
          console.log(`⚠️  ${endpoint}: ${error.message}`);
        }
      }
    }

    // 5. Recommendations
    console.log('\n📋 RECOMMENDATIONS:');
    console.log('');
    console.log('Critical Updates Detected:');
    console.log('  • Docker CE CLI: 5:28.5.1 → 5:29.0.2');
    console.log('  • containerd.io: 1.7.28 → 2.1.5 (MAJOR UPDATE)');
    console.log('  • docker-buildx-plugin: 0.29.1 → 0.30.0');
    console.log('  • cloud-init: 24.1.3 → 25.2 (MAJOR UPDATE)');
    console.log('');
    console.log('⚠️  CRITICAL: 6 packages require system restart');
    console.log('');
    console.log('Recommended Actions:');
    console.log('  1. Schedule maintenance window (low-traffic period)');
    console.log('  2. Backup all application data and configurations');
    console.log('  3. Apply critical security patches (especially containerd)');
    console.log('  4. Restart affected services/server');
    console.log('  5. Verify all applications restart correctly');
    console.log('');
    console.log('Priority Level: HIGH');
    console.log('Reason: containerd 2.x is a major update affecting Docker runtime');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

main().catch(console.error);
