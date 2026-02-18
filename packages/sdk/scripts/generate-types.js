#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SWAGGER_PATH = path.join(__dirname, '../swagger.json');
const OUTPUT_PATH = path.join(__dirname, '../src/generated/types.ts');

async function generateTypes() {
  try {
    if (!fs.existsSync(SWAGGER_PATH)) {
      console.warn('⚠ Swagger file not found. Creating empty stub file.');
      // Create empty stub file to prevent TypeScript errors
      const stubContent = `// This file is a stub. Run "npm run generate:swagger" and "npm run generate:types" to generate actual types.
export {};
`;
      const outputDir = path.dirname(OUTPUT_PATH);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(OUTPUT_PATH, stubContent);
      console.log(`✓ Stub file created at ${OUTPUT_PATH}`);
      return;
    }

    console.log('Generating TypeScript types from Swagger...');
    
    // Use openapi-typescript to generate types
    const command = `npx openapi-typescript ${SWAGGER_PATH} -o ${OUTPUT_PATH}`;
    
    try {
      execSync(command, { stdio: 'inherit' });
      console.log(`✓ Types generated to ${OUTPUT_PATH}`);
    } catch (error) {
      console.error('✗ Error generating types:', error.message);
      // Create stub file on error
      const stubContent = `// This file is a stub. Generation failed: ${error.message}
export {};
`;
      fs.writeFileSync(OUTPUT_PATH, stubContent);
      console.log(`✓ Stub file created at ${OUTPUT_PATH}`);
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
    // Create stub file on error
    const stubContent = `// This file is a stub. Generation failed: ${error.message}
export {};
`;
    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(OUTPUT_PATH, stubContent);
    console.log(`✓ Stub file created at ${OUTPUT_PATH}`);
  }
}

generateTypes();

