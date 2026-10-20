import { ApiEndpointDef, SchemaTableDef } from '../types';

/**
 * Generates an OpenAPI 3.0.3 Specification from current API endpoints
 */
export function generateOpenApiSpec(
  endpoints: ApiEndpointDef[],
  tables: SchemaTableDef[] = [],
  baseUrl: string = 'https://ais-dev-utzmqbj3wfeq5fsrpyto7i-394228256883.europe-west1.run.app'
) {
  const paths: Record<string, any> = {};

  endpoints.forEach((ep) => {
    const cleanPath = ep.path.split('?')[0];
    if (!paths[cleanPath]) {
      paths[cleanPath] = {};
    }

    const methodKey = ep.method.toLowerCase();
    const queryParamsFromUrl = ep.path.includes('?')
      ? ep.path.split('?')[1].split('&').map((p) => p.split('=')[0])
      : [];

    const defaultParams = ep.defaultParams ? Object.keys(ep.defaultParams) : [];
    const allQueryNames = Array.from(new Set([...queryParamsFromUrl, ...defaultParams]));

    const parameters = allQueryNames.map((param) => ({
      name: param,
      in: 'query',
      required: false,
      schema: { type: 'string' },
      description: `Filter by ${param}`,
    }));

    const pathParams = (cleanPath.match(/\{([^}]+)\}/g) || []).map((m) => m.replace(/[{}]/g, ''));
    pathParams.forEach((param) => {
      parameters.push({
        name: param,
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: `Identifier for ${param}`,
      });
    });

    const operation: any = {
      tags: [ep.category.replace(/^[0-9.]+\s*/, '')],
      summary: ep.description,
      description: `${ep.description}${ep.connectedTable ? `\nConnected to PostgreSQL Table: \`${ep.connectedTable}\`` : ''}`,
      operationId: ep.id,
      parameters,
      responses: {
        [ep.expectedStatus]: {
          description: 'Successful operation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  statusCode: { type: 'integer', example: ep.expectedStatus },
                  data: { type: 'object' },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized - Missing or invalid credentials',
        },
        '403': {
          description: 'Forbidden - Insufficient permissions for role',
        },
      },
    };

    if (['post', 'put', 'patch'].includes(methodKey) && ep.defaultBody) {
      operation.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              example: ep.defaultBody,
            },
          },
        },
      };
    }

    if (ep.authType === 'api_key' || ep.roleRequired === 'Public') {
      operation.security = ep.roleRequired === 'Public' ? [] : [{ ApiKeyAuth: [] }];
    } else {
      operation.security = [{ BearerAuth: [] }];
    }

    paths[cleanPath][methodKey] = operation;
  });

  return {
    openapi: '3.0.3',
    info: {
      title: 'DZ-Bridge Sovereign REST API Gateway',
      version: '1.0.0',
      description:
        'Official production REST API gateway connecting external frontend applications, universities, and sovereign research institutes to the DZ-Bridge PostgreSQL database.',
      contact: {
        name: 'Ministry of Higher Education and Scientific Research (MESRS)',
        url: 'https://dz-bridge.mesrs.dz',
        email: 'api-support@dz-bridge.mesrs.dz',
      },
    },
    servers: [
      {
        url: baseUrl,
        description: 'Active AI Studio Cloud Dev Gateway',
      },
      {
        url: 'http://localhost:4000',
        description: 'Local NestJS Core Gateway',
      },
      {
        url: 'http://localhost:8000',
        description: 'Local Django REST Framework Engine',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter standard JWT token issued by /api/v1/auth/login',
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'Public or partner client API key for external frontend access',
        },
      },
      schemas: {
        ErrorEnvelope: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer' },
            error: { type: 'string' },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    paths,
  };
}

/**
 * Triggers a direct browser download of openapi.json
 */
export function downloadOpenApiSpec(
  endpoints: ApiEndpointDef[],
  tables: SchemaTableDef[] = [],
  baseUrl?: string
) {
  const spec = generateOpenApiSpec(endpoints, tables, baseUrl);
  const jsonStr = JSON.stringify(spec, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dz_bridge_openapi_spec_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates a Postman v2.1 Collection from endpoints
 */
export function generatePostmanCollection(
  endpoints: ApiEndpointDef[],
  baseUrl: string = '{{baseUrl}}'
) {
  const items = endpoints.map((ep) => {
    const cleanPath = ep.path.split('?')[0];
    const pathSegments = cleanPath.replace(/^\//, '').split('/');

    const queryParamsFromUrl = ep.path.includes('?')
      ? ep.path.split('?')[1].split('&').map((p) => {
          const [k, v] = p.split('=');
          return { key: k, value: v || '', description: `Query parameter ${k}` };
        })
      : [];

    const defaultQueryParams = ep.defaultParams
      ? Object.entries(ep.defaultParams).map(([k, v]) => ({
          key: k,
          value: v,
          description: `Query parameter ${k}`,
        }))
      : [];

    const allQueries = [...queryParamsFromUrl, ...defaultQueryParams];

    const headers = [
      { key: 'Content-Type', value: 'application/json', type: 'text' },
      { key: 'Accept', value: 'application/json', type: 'text' },
    ];

    if (ep.authType === 'api_key') {
      headers.push({ key: 'X-API-Key', value: '{{apiKey}}', type: 'text' });
    }

    const requestObj: any = {
      method: ep.method,
      header: headers,
      url: {
        raw: `${baseUrl}${ep.path}`,
        host: [baseUrl],
        path: pathSegments,
        query: allQueries.length > 0 ? allQueries : undefined,
      },
      description: ep.description,
    };

    if (ep.authType === 'jwt' || (ep.roleRequired !== 'Public' && ep.authType !== 'api_key')) {
      requestObj.auth = {
        type: 'bearer',
        bearer: [{ key: 'token', value: '{{jwtToken}}', type: 'string' }],
      };
    }

    if (['POST', 'PUT', 'PATCH'].includes(ep.method) && ep.defaultBody) {
      requestObj.body = {
        mode: 'raw',
        raw: JSON.stringify(ep.defaultBody, null, 2),
        options: {
          raw: {
            language: 'json',
          },
        },
      };
    }

    return {
      name: `[${ep.method}] ${ep.path}`,
      request: requestObj,
      response: [],
    };
  });

  return {
    info: {
      name: 'DZ-Bridge Sovereign REST API Gateway',
      _postman_id: 'dz-bridge-api-v1',
      description: 'Collection of REST APIs for external front-ends to connect to the DZ-Bridge database.',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    variable: [
      {
        key: 'baseUrl',
        value: 'https://ais-dev-utzmqbj3wfeq5fsrpyto7i-394228256883.europe-west1.run.app',
        type: 'string',
      },
      {
        key: 'apiKey',
        value: 'dz_live_pub_9a8f2e7b4c1d6e3f',
        type: 'string',
      },
      {
        key: 'jwtToken',
        value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        type: 'string',
      },
    ],
    item: items,
  };
}

/**
 * Triggers a direct browser download of postman_collection.json
 */
export function downloadPostmanCollection(
  endpoints: ApiEndpointDef[],
  baseUrl?: string
) {
  const collection = generatePostmanCollection(endpoints, baseUrl);
  const jsonStr = JSON.stringify(collection, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dz_bridge_postman_collection_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
