import 'dotenv/config';

const COOLIFY_BASE_URL = process.env.COOLIFY_BASE_URL;
const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN;

async function listServices() {
  try {
    const response = await fetch(`${COOLIFY_BASE_URL}/api/v1/services`, {
      headers: {
        'Authorization': `Bearer ${COOLIFY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const services = await response.json();

    console.log('\n📦 All Services:\n');
    services.forEach((service, index) => {
      console.log(`${index + 1}. ${service.name || 'Unnamed'}`);
      console.log(`   UUID: ${service.uuid}`);
      console.log(`   Type: ${service.type || 'N/A'}`);
      console.log(`   Status: ${service.status || 'N/A'}`);
      console.log('');
    });

    console.log(`\nTotal services: ${services.length}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listServices();
