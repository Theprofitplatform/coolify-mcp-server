import 'dotenv/config';

const COOLIFY_BASE_URL = process.env.COOLIFY_BASE_URL;
const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN;
const SERVICE_UUID = 'vs4o4ogkcgwgwo8kgksg4koo';

async function getServiceDetails() {
  try {
    const response = await fetch(`${COOLIFY_BASE_URL}/api/v1/services/${SERVICE_UUID}`, {
      headers: {
        'Authorization': `Bearer ${COOLIFY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const service = await response.json();

    console.log('\n📦 Service Details:\n');
    console.log(JSON.stringify(service, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getServiceDetails();
