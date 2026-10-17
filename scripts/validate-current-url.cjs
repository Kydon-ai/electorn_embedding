const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('[package] .env is required; set CURRENT_URL before packaging.');
  process.exit(1);
}

const { CURRENT_URL: value } = dotenv.parse(fs.readFileSync(envPath));
try {
  if (!value) throw new Error('CURRENT_URL is empty.');
  const url = new URL(value);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('CURRENT_URL must use HTTP or HTTPS.');
  }
} catch (error) {
  console.error(`[package] invalid CURRENT_URL: ${error.message}`);
  process.exit(1);
}

console.log(`[package] CURRENT_URL=${value}`);
