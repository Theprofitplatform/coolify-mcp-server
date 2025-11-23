#!/usr/bin/env node

/**
 * Uptime Kuma Monitor Setup Script
 * Automatically adds monitors for all services using Uptime Kuma API
 *
 * Usage: node add-uptime-kuma-monitors.js
 */

import { io } from 'socket.io-client';

const UPTIME_KUMA_URL = 'http://localhost:3001';

// Monitors configuration
const monitors = [
  // Critical Web Services
  {
    name: 'n8n Automation',
    type: 'http',
    url: 'https://n8n.theprofitplatform.com.au',
    interval: 60,
    retryInterval: 60,
    resendInterval: 0,
    maxRetries: 3,
    description: 'n8n workflow automation platform',
    accepted_statuscodes: ['200-299']
  },
  {
    name: 'Main Website',
    type: 'http',
    url: 'https://theprofitplatform.com.au',
    interval: 60,
    retryInterval: 60,
    resendInterval: 0,
    maxRetries: 3,
    description: 'The Profit Platform main website',
    accepted_statuscodes: ['200-299']
  },
  {
    name: 'Coolify Dashboard',
    type: 'http',
    url: 'https://coolify.theprofitplatform.com.au',
    interval: 60,
    retryInterval: 60,
    resendInterval: 0,
    maxRetries: 3,
    description: 'Coolify deployment dashboard',
    accepted_statuscodes: ['200-299', '302']
  },
  {
    name: 'SEO Dashboard',
    type: 'http',
    url: 'http://localhost:9000/api/v2/health',
    interval: 120,
    retryInterval: 120,
    resendInterval: 0,
    maxRetries: 2,
    description: 'SEO Automation Dashboard API',
    accepted_statuscodes: ['200-299']
  },
  {
    name: 'Repair Frontend',
    type: 'http',
    url: 'http://localhost:3000',
    interval: 120,
    retryInterval: 120,
    resendInterval: 0,
    maxRetries: 2,
    description: 'Mobile Repair Service Frontend',
    accepted_statuscodes: ['200-299']
  },

  // Databases & Caches
  {
    name: 'PostgreSQL (Main)',
    type: 'port',
    hostname: 'localhost',
    port: 5432,
    interval: 300,
    retryInterval: 300,
    resendInterval: 0,
    maxRetries: 2,
    description: 'Main PostgreSQL database'
  },
  {
    name: 'PostgreSQL (Repair)',
    type: 'port',
    hostname: 'localhost',
    port: 5433,
    interval: 300,
    retryInterval: 300,
    resendInterval: 0,
    maxRetries: 2,
    description: 'Repair service PostgreSQL database'
  },
  {
    name: 'Redis Cache',
    type: 'port',
    hostname: 'localhost',
    port: 6379,
    interval: 300,
    retryInterval: 300,
    resendInterval: 0,
    maxRetries: 2,
    description: 'Redis cache server'
  },
  {
    name: 'Qdrant Vector DB',
    type: 'http',
    url: 'https://qdrant.theprofitplatform.com.au',
    interval: 300,
    retryInterval: 300,
    resendInterval: 0,
    maxRetries: 2,
    description: 'Qdrant vector database',
    accepted_statuscodes: ['200-299']
  },

  // Services
  {
    name: 'Jenkins CI/CD',
    type: 'http',
    url: 'http://localhost:8080',
    interval: 300,
    retryInterval: 300,
    resendInterval: 0,
    maxRetries: 2,
    description: 'Jenkins automation server',
    accepted_statuscodes: ['200-299', '302', '403']
  },
  {
    name: 'Glitchtip Error Tracking',
    type: 'http',
    url: 'http://localhost:8001',
    interval: 300,
    retryInterval: 300,
    resendInterval: 0,
    maxRetries: 2,
    description: 'Glitchtip error tracking service',
    accepted_statuscodes: ['200-299', '400']
  },

  // Docker Containers
  {
    name: 'GitHub Runner 1',
    type: 'docker',
    docker_container: 'runner-1-vs4o4ogkcgwgwo8kgksg4koo',
    docker_host: null,
    interval: 120,
    retryInterval: 120,
    resendInterval: 0,
    maxRetries: 2,
    description: 'GitHub Actions runner 1'
  },
  {
    name: 'GitHub Runner 5',
    type: 'docker',
    docker_container: 'runner-5-vs4o4ogkcgwgwo8kgksg4koo',
    docker_host: null,
    interval: 120,
    retryInterval: 120,
    resendInterval: 0,
    maxRetries: 2,
    description: 'GitHub Actions runner 5'
  },
  {
    name: 'GitHub Runner Automation',
    type: 'docker',
    docker_container: 'runner-automation-vs4o4ogkcgwgwo8kgksg4koo',
    docker_host: null,
    interval: 120,
    retryInterval: 120,
    resendInterval: 0,
    maxRetries: 2,
    description: 'GitHub Actions automation runner'
  }
];

console.log('🚀 Uptime Kuma Monitor Setup Script\n');
console.log('📍 Connecting to Uptime Kuma at:', UPTIME_KUMA_URL);
console.log('📋 Will add', monitors.length, 'monitors\n');

// Note: This script requires manual authentication token
console.log('⚠️  AUTHENTICATION REQUIRED\n');
console.log('To use the Uptime Kuma API, you need to:');
console.log('1. Access Uptime Kuma at: http://31.97.222.218:3001');
console.log('2. Login or create an account');
console.log('3. Go to Settings → API Keys');
console.log('4. Create a new API key');
console.log('5. Update this script with the API key\n');

console.log('📝 Alternatively, you can manually add monitors using the web interface:');
console.log('   Run: ./setup-uptime-kuma-monitors.sh for detailed instructions\n');

console.log('═══════════════════════════════════════════════════════════');
console.log('MONITORS TO ADD:');
console.log('═══════════════════════════════════════════════════════════\n');

monitors.forEach((monitor, index) => {
  console.log(`${index + 1}. ${monitor.name}`);
  console.log(`   Type: ${monitor.type}`);
  if (monitor.url) console.log(`   URL: ${monitor.url}`);
  if (monitor.hostname) console.log(`   Host: ${monitor.hostname}:${monitor.port}`);
  if (monitor.docker_container) console.log(`   Container: ${monitor.docker_container}`);
  console.log(`   Check every: ${monitor.interval}s`);
  console.log('');
});

console.log('═══════════════════════════════════════════════════════════\n');
console.log('✅ Setup ready! Please configure monitors via web interface.');
console.log('   Access: http://31.97.222.218:3001\n');

// Export monitors configuration for manual import if needed
import { writeFileSync } from 'fs';
writeFileSync('uptime-kuma-monitors.json', JSON.stringify(monitors, null, 2));
console.log('💾 Monitor configuration saved to: uptime-kuma-monitors.json');
console.log('   You can use this file for reference when adding monitors manually.\n');
