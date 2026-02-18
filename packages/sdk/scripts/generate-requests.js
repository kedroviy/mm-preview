#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SWAGGER_PATH = path.join(__dirname, '../swagger.json');
const OUTPUT_DIR = path.join(__dirname, '../src/generated/requests');

function toPascalCase(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/\s+/g, '');
}

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function generateRequestFunction(operation, path, method, tag) {
  const operationId = operation.operationId || `${method}${toPascalCase(path)}`;
  const functionName = toCamelCase(operationId);
  
  const params = operation.parameters || [];
  const pathParams = params.filter(p => p.in === 'path').map(p => p.name);
  const queryParams = params.filter(p => p.in === 'query');
  const hasBody = ['post', 'put', 'patch'].includes(method.toLowerCase()) && operation.requestBody;
  
  const pathParamsString = pathParams.length > 0 
    ? `{ ${pathParams.map(p => `${p}: string`).join(', ')} }`
    : '';
  
  const queryParamsString = queryParams.length > 0
    ? `params?: { ${queryParams.map(p => `${p.name}?: ${getTypeFromSchema(p.schema)}`).join(', ')} }`
    : '';
  
  const bodyType = hasBody 
    ? getBodyType(operation.requestBody)
    : '';
  
  const returnType = getReturnType(operation.responses);
  
  const pathWithParams = pathParams.reduce((acc, param) => {
    return acc.replace(`{${param}}`, `\${${param}}`);
  }, path);
  
  let functionCode = `
/**
 * ${operation.summary || operation.description || `${method.toUpperCase()} ${path}`}
${operation.description ? ` * ${operation.description}\n` : ''}${params.length > 0 ? ` * @param params - Request parameters\n` : ''}${hasBody ? ` * @param body - Request body\n` : ''} * @returns ${returnType}
 */
export async function ${functionName}(${[
    pathParamsString && `path: ${pathParamsString}`,
    queryParamsString,
    hasBody && `body: ${bodyType}`
  ].filter(Boolean).join(', ')}) {
  const url = \`${pathWithParams}\`;${queryParamsString ? `
  const searchParams = new URLSearchParams();
  ${queryParams.map(p => `if (params?.${p.name} !== undefined) searchParams.append('${p.name}', String(params.${p.name}));`).join('\n  ')}
  const queryString = searchParams.toString();
  const fullUrl = queryString ? \`\${url}?\${queryString}\` : url;` : `
  const fullUrl = url;`}
  
  const response = await api.${method.toLowerCase()}<${returnType}>(${queryParamsString ? 'fullUrl' : 'url'}${hasBody ? ', body' : ''});
  return response;
}
`;

  return {
    functionName,
    functionCode,
    tag,
    operationId
  };
}

function getTypeFromSchema(schema) {
  if (!schema) return 'any';
  if (schema.type === 'string') return 'string';
  if (schema.type === 'number' || schema.type === 'integer') return 'number';
  if (schema.type === 'boolean') return 'boolean';
  if (schema.type === 'array') {
    const itemsType = getTypeFromSchema(schema.items);
    return `${itemsType}[]`;
  }
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop();
    return refName;
  }
  return 'any';
}

function getBodyType(requestBody) {
  if (!requestBody || !requestBody.content) return 'any';
  const jsonContent = requestBody.content['application/json'];
  if (!jsonContent || !jsonContent.schema) return 'any';
  return getTypeFromSchema(jsonContent.schema);
}

function getReturnType(responses) {
  const successResponse = responses['200'] || responses['201'] || responses['204'];
  if (!successResponse || !successResponse.content) return 'any';
  const jsonContent = successResponse.content['application/json'];
  if (!jsonContent || !jsonContent.schema) return 'any';
  return getTypeFromSchema(jsonContent.schema);
}

function generateRequests() {
  try {
    if (!fs.existsSync(SWAGGER_PATH)) {
      console.error('✗ Swagger file not found. Run "npm run generate:swagger" first.');
      process.exit(1);
    }

    const swagger = JSON.parse(fs.readFileSync(SWAGGER_PATH, 'utf-8'));
    
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const requestsByTag = {};
    
    // Group requests by tag
    Object.entries(swagger.paths || {}).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        if (!operation.operationId) return;
        
        const tag = (operation.tags && operation.tags[0]) || 'default';
        if (!requestsByTag[tag]) {
          requestsByTag[tag] = [];
        }
        
        const request = generateRequestFunction(operation, path, method, tag);
        requestsByTag[tag].push(request);
      });
    });

    // Generate files by tag
    Object.entries(requestsByTag).forEach(([tag, requests]) => {
      const fileName = `${toCamelCase(tag)}.ts`;
      const filePath = path.join(OUTPUT_DIR, fileName);
      
      const imports = `import { api } from '../../client';\nimport type { ApiResponse } from '../../types';\n`;
      const functions = requests.map(r => r.functionCode).join('\n');
      
      const content = `${imports}${functions}`;
      
      fs.writeFileSync(filePath, content);
      console.log(`✓ Generated ${fileName} with ${requests.length} requests`);
    });

    // Generate index file
    const indexContent = Object.keys(requestsByTag)
      .map(tag => `export * from './${toCamelCase(tag)}';`)
      .join('\n');
    
    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.ts'), indexContent);
    console.log(`✓ Generated index.ts`);
    console.log(`✓ Total: ${Object.values(requestsByTag).flat().length} requests generated`);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

generateRequests();

