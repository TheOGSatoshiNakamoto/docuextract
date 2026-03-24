/**
 * Utility script: generate a DocuExtract API key locally for testing.
 * Usage: npx ts-node scripts/generate-api-key.ts
 */
import { randomBytes } from 'crypto';

const key = 'dex_live_' + randomBytes(24).toString('hex');
console.log('Generated API key:', key);
console.log('Store this securely — it will not be shown again.');
