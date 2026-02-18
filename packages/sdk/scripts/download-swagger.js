#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const SWAGGER_URL = process.env.SWAGGER_URL || 'http://localhost:4000/api-json';
const OUTPUT_PATH = path.join(__dirname, '../swagger.json');

function downloadSwagger(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download Swagger: ${res.statusCode} ${res.statusMessage}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (error) {
          reject(new Error(`Failed to parse Swagger JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`Failed to download Swagger: ${error.message}`));
    });
  });
}

async function main() {
  try {
    console.log(`Downloading Swagger from ${SWAGGER_URL}...`);
    const swagger = await downloadSwagger(SWAGGER_URL);
    
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(swagger, null, 2));
    console.log(`✓ Swagger saved to ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

main();

