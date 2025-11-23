import 'dotenv/config';

const COOLIFY_BASE_URL = process.env.COOLIFY_BASE_URL;
const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN;
const SERVICE_UUID = process.argv[2];

if (!SERVICE_UUID) {
  console.error('❌ Error: Please provide service UUID as argument');
  process.exit(1);
}

async function restartService() {
  try {
    console.log(`🔄 Restarting service ${SERVICE_UUID}...\n`);

    const response = await fetch(`${COOLIFY_BASE_URL}/api/v1/services/${SERVICE_UUID}/restart`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${COOLIFY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
    }

    console.log('✅ Service restart initiated successfully!\n');
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('\n⏳ Waiting 30 seconds for service to start...\n');

    await new Promise(resolve => setTimeout(resolve, 30000));

    console.log('✅ Wait complete. Check service status.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

restartService();
