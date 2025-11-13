#!/usr/bin/env node

/**
 * Test MCP Tools Directly
 * Simulates MCP protocol calls to verify tools work correctly
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing Coolify MCP Tools\n');

// Test cases with actual MCP protocol messages
const testCases = [
  {
    name: 'List Available Tools',
    message: {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list'
    }
  },
  {
    name: 'Get Coolify Version',
    message: {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'get_version',
        arguments: {}
      }
    }
  },
  {
    name: 'List Servers',
    message: {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'list_servers',
        arguments: {}
      }
    }
  },
  {
    name: 'List Projects',
    message: {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'list_projects',
        arguments: {}
      }
    }
  },
  {
    name: 'List Services',
    message: {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'list_services',
        arguments: {}
      }
    }
  }
];

async function runTest(testCase) {
  return new Promise((resolve) => {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log(`   Message: ${JSON.stringify(testCase.message).substring(0, 80)}...`);

    const serverPath = join(__dirname, 'build', 'index.js');
    const server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env
    });

    let output = '';
    let errorOutput = '';
    let timeout;

    server.stdout.on('data', (data) => {
      output += data.toString();
    });

    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    server.on('close', (code) => {
      clearTimeout(timeout);

      if (output) {
        try {
          const lines = output.split('\n').filter(line => line.trim());
          const responses = lines.map(line => {
            try {
              return JSON.parse(line);
            } catch {
              return null;
            }
          }).filter(Boolean);

          if (responses.length > 0) {
            const response = responses.find(r => r.id === testCase.message.id) || responses[0];

            if (response.error) {
              console.log(`   ❌ Error: ${response.error.message}`);
            } else if (response.result) {
              console.log(`   ✅ Success`);

              // Show relevant data
              if (testCase.message.method === 'tools/list') {
                console.log(`   📊 Found ${response.result.tools?.length || 0} tools`);
              } else if (response.result.content) {
                const content = response.result.content[0]?.text || '';
                const preview = content.substring(0, 150);
                console.log(`   📄 Response: ${preview}${content.length > 150 ? '...' : ''}`);
              }
            }
          } else {
            console.log(`   ⚠️  No valid JSON response`);
          }
        } catch (error) {
          console.log(`   ❌ Parse error: ${error.message}`);
        }
      } else {
        console.log(`   ❌ No output received`);
      }

      if (errorOutput && !errorOutput.includes('ExperimentalWarning')) {
        console.log(`   ⚠️  Stderr: ${errorOutput.substring(0, 100)}`);
      }

      resolve();
    });

    // Send the message
    server.stdin.write(JSON.stringify(testCase.message) + '\n');

    // Give it time to respond
    timeout = setTimeout(() => {
      server.kill();
      console.log(`   ⏱️  Timeout - killed process`);
      resolve();
    }, 5000);
  });
}

async function runAllTests() {
  console.log('🚀 Starting MCP Protocol Tests\n');
  console.log('=' .repeat(60));

  for (const testCase of testCases) {
    await runTest(testCase);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Test suite complete!');
  console.log('\n💡 Note: The MCP server uses stdio for communication.');
  console.log('   These tests verify the tools respond correctly to MCP protocol.');
  console.log('\n📖 For full integration, configure in Claude Desktop:');
  console.log('   See: claude-desktop-config.json');
}

runAllTests().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
