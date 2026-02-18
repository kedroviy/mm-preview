#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SWAGGER_PATH = path.join(__dirname, '../swagger.json');
const OUTPUT_PATH = path.join(__dirname, '../src/generated/types.ts');

async function generateTypes() {
  try {
    if (!fs.existsSync(SWAGGER_PATH)) {
      console.error('✗ Swagger file not found. Run "npm run generate:swagger" first.');
      process.exit(1);
    }

    console.log('Generating TypeScript types from Swagger...');
    
    // Use openapi-typescript to generate types
    const command = `npx openapi-typescript ${SWAGGER_PATH} -o ${OUTPUT_PATH}`;
    
    try {
      execSync(command, { stdio: 'inherit' });
      console.log(`✓ Types generated to ${OUTPUT_PATH}`);
    } catch (error) {
      console.error('✗ Error generating types:', error.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

generateTypes();

