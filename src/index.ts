#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';
import { ToolRegistry } from './tools/registry.js';
import type { CoolifyVersion } from './types/tool.js';
import { createLogger } from './utils/logger.js';

interface CoolifyConfig {
  baseUrl: string;
  token: string;
}

class CoolifyServer {
  private server: Server;
  private axiosInstance: AxiosInstance | null = null;
  private coolifyVersion: CoolifyVersion | null = null;
  private toolRegistry: ToolRegistry | null = null;
  private logger = createLogger('CoolifyServer');

  constructor() {
    this.server = new Server(
      {
        name: 'coolify-mcp-server',
        version: '0.2.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Error handling
    this.server.onerror = (error) => {
      this.logger.error('MCP Server Error', error);
    };

    process.on('SIGINT', async () => {
      this.logger.info('Shutting down server...');
      await this.server.close();
      process.exit(0);
    });
  }

  private initializeAxios(config: CoolifyConfig) {
    const timeout = parseInt(process.env.COOLIFY_API_TIMEOUT || '60000', 10);
    const maxRetries = parseInt(process.env.COOLIFY_API_MAX_RETRIES || '5', 10);
    const retryDelay = parseInt(process.env.COOLIFY_API_RETRY_DELAY || '2000', 10);

    this.axiosInstance = axios.create({
      baseURL: `${config.baseUrl}/api/v1`,
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      timeout
    });

    // Add response interceptor for rate limiting with retry logic
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        
        // Initialize retry count
        if (!config.__retryCount) {
          config.__retryCount = 0;
        }

        // Handle rate limiting with automatic retry
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          if (config.__retryCount < maxRetries) {
            config.__retryCount++;
            
            const retryAfter = error.response.headers['retry-after'];
            const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : retryDelay * config.__retryCount;
            
            this.logger.info(`Rate limit hit, retrying after ${waitTime}ms (attempt ${config.__retryCount}/${maxRetries})`);
            
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return this.axiosInstance!.request(config);
          } else {
            const message = `Rate limit exceeded after ${maxRetries} retries. Please wait before making more requests.`;
            throw new McpError(ErrorCode.InternalError, `Coolify API rate limit: ${message}`);
          }
        }
        
        return Promise.reject(error);
      }
    );

    this.logger.info('Axios client initialized', {
      baseURL: config.baseUrl,
      timeout,
      maxRetries,
      retryDelay
    });
  }

  private async detectCoolifyVersion(): Promise<void> {
    if (!this.axiosInstance) return;

    try {
      const response = await this.axiosInstance.get('/version');
      const versionString = response.data?.version || response.data?.coolify || response.data || 'unknown';
      this.coolifyVersion = this.parseVersion(versionString);
      this.logger.info('Coolify version detected', this.coolifyVersion);
    } catch (error) {
      this.logger.warn('Could not detect Coolify version, using default', error);
      this.coolifyVersion = { version: '4.0.0-beta.420', major: 4, minor: 0, patch: 0, beta: 420 };
    }
  }

  private parseVersion(versionString: string): CoolifyVersion {
    const match = versionString.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-beta\.(\d+))?/);
    if (match) {
      return {
        version: versionString,
        major: parseInt(match[1]),
        minor: parseInt(match[2]),
        patch: parseInt(match[3]),
        beta: match[4] ? parseInt(match[4]) : undefined
      };
    }
    return { version: versionString, major: 4, minor: 0, patch: 0, beta: 420 };
  }

  private initializeToolRegistry() {
    if (!this.axiosInstance) {
      throw new Error('Axios instance must be initialized before creating ToolRegistry');
    }

    this.toolRegistry = new ToolRegistry(this.axiosInstance, this.coolifyVersion || undefined);
    this.logger.info(`ToolRegistry initialized with ${this.toolRegistry.getToolCount()} tools`);
  }

  private setupToolHandlers() {
    if (!this.toolRegistry) {
      throw new Error('ToolRegistry must be initialized before setting up handlers');
    }

    // List tools handler - uses ToolRegistry
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      this.logger.debug('Listing tools');
      return {
        tools: this.toolRegistry!.getToolDefinitions(),
      };
    });

    // Call tool handler - uses ToolRegistry
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const toolName = request.params.name;
      const args = request.params.arguments || {};

      this.logger.info('Tool execution requested', { tool: toolName, args });

      try {
        if (!this.toolRegistry!.hasTool(toolName)) {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${toolName}`
          );
        }

        const result = await this.toolRegistry!.executeTool(toolName, args);

        this.logger.info('Tool execution completed', { tool: toolName });

        return result;
      } catch (error) {
        this.logger.error('Tool execution failed', { tool: toolName, error });

        if (error instanceof McpError) {
          throw error;
        }

        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const message = error.response?.data?.message || error.message;

          throw new McpError(
            ErrorCode.InternalError,
            `Coolify API error (${status}): ${message}`
          );
        }

        throw new McpError(
          ErrorCode.InternalError,
          error instanceof Error ? error.message : 'Unknown error occurred'
        );
      }
    });
  }

  async run() {
    const config = this.getConfig();

    this.logger.info('Starting Coolify MCP Server', {
      baseUrl: config.baseUrl,
    });

    // Initialize Axios client
    this.initializeAxios(config);

    // Detect Coolify version
    await this.detectCoolifyVersion();

    // Initialize ToolRegistry with all tools
    this.initializeToolRegistry();

    // Setup MCP request handlers
    this.setupToolHandlers();

    // Start server
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    this.logger.info('Coolify MCP Server started successfully', {
      tools: this.toolRegistry!.getToolCount(),
      version: this.coolifyVersion?.version,
    });
  }

  private getConfig(): CoolifyConfig {
    const baseUrl = process.env.COOLIFY_BASE_URL;
    const token = process.env.COOLIFY_TOKEN;

    if (!baseUrl || !token) {
      this.logger.error('Missing required environment variables');
      throw new Error(
        'Missing required environment variables. Please set COOLIFY_BASE_URL and COOLIFY_TOKEN.'
      );
    }

    return { baseUrl, token };
  }
}

const server = new CoolifyServer();
server.run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
