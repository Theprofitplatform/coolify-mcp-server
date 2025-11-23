import 'dotenv/config';

const COOLIFY_BASE_URL = process.env.COOLIFY_BASE_URL;
const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN;
const SERVICE_UUID = 'vs4o4ogkcgwgwo8kgksg4koo';

async function restartService() {
  try {
    console.log('\n🔄 Restarting GitHub Runners Service...\n');

    const response = await fetch(`${COOLIFY_BASE_URL}/api/v1/services/${SERVICE_UUID}/restart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COOLIFY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${error}`);
    }

    const result = await response.json();

    console.log('✅ Service restart initiated successfully!\n');
    console.log('Response:', JSON.stringify(result, null, 2));
    console.log('\n⏳ Waiting 30 seconds for runners to start...\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

restartService();
