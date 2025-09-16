import { config } from 'dotenv';

// Load environment variables for testing
config();

// Ensure test environment variables are set
process.env.NODE_ENV = 'test';
process.env.AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || 'UseDevelopmentStorage=true';
process.env.AZURE_STORAGE_CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || 'photopoint-media-test';

console.log('Test environment initialized');
console.log('Storage connection:', process.env.AZURE_STORAGE_CONNECTION_STRING?.substring(0, 50) + '...');
console.log('Container name:', process.env.AZURE_STORAGE_CONTAINER_NAME);
