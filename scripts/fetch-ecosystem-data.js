const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../src/data/ecosystem-cache.json');

const https = require('https');

async function fetchEcosystemData() {
	console.log('Fetching ecosystem data...');
	try {
		const agent = new https.Agent({});

		const response = await fetch('https://app-api.seinetwork.io/sanity/ecosystem');
		if (!response.ok) {
			throw new Error(`Failed to fetch ecosystem data: ${response.statusText}`);
		}
		const data = await response.json();

		// Ensure the directory exists
		const dir = path.dirname(OUTPUT_FILE);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
		console.log(`Ecosystem data saved to ${OUTPUT_FILE}`);
	} catch (error) {
		console.error('Error fetching ecosystem data:', error);
		process.exit(1);
	}
}

fetchEcosystemData();
