/**
 * Tool Registry
 * Manages all available MCP tools
 */

import { AxiosInstance } from 'axios';
import type { CoolifyVersion, ToolDefinition } from '../types/tool.js';
import { BaseTool } from './base.js';
import { createLogger } from '../utils/logger.js';

// Import server tools
import { ListServersTool } from './servers/list-servers.js';
import { GetServerResourcesTool } from './servers/get-server-resources.js';

// Import key tools
import { ListPrivateKeysTool } from './keys/list-private-keys.js';
import { CreatePrivateKeyTool } from './keys/create-private-key.js';

// Import deployment tools
import { ListDeploymentsTool } from './deployments/list-deployments.js';
import { GetDeploymentTool } from './deployments/get-deployment.js';

// Import environment tools
import { ListEnvironmentsTool } from './environments/list-environments.js';
import { CreateEnvironmentTool } from './environments/create-environment.js';

type ToolConstructor = new (apiClient: AxiosInstance, version?: CoolifyVersion) => BaseTool;

export class ToolRegistry {
  private tools: Map<string, BaseTool> = new Map();
  private logger = createLogger('ToolRegistry');

  constructor(
    private apiClient: AxiosInstance,
    private version?: CoolifyVersion
  ) {
    this.registerTools();
  }

  /**
   * Register all available tools
   */
  private registerTools(): void {
    const toolClasses: ToolConstructor[] = [
      // Server tools
      ListServersTool,
      GetServerResourcesTool,

      // Private Key tools
      ListPrivateKeysTool,
      CreatePrivateKeyTool,

      // Deployment tools
      ListDeploymentsTool,
      GetDeploymentTool,

      // Environment tools
      ListEnvironmentsTool,
      CreateEnvironmentTool,

      // TODO: Add more tools as they are migrated:
      // - Projects
      // - Applications
      // - Services
      // - Teams
    ];

    toolClasses.forEach((ToolClass) => {
      try {
        const tool = new ToolClass(this.apiClient, this.version);
        this.registerTool(tool);
      } catch (error) {
        this.logger.error(`Failed to register tool: ${ToolClass.name}`, error);
      }
    });

    this.logger.info(`Registered ${this.tools.size} tools`);
  }

  /**
   * Register a single tool
   */
  private registerTool(tool: BaseTool): void {
    if (this.tools.has(tool.name)) {
      this.logger.warn(`Tool already registered: ${tool.name}`);
      return;
    }

    this.tools.set(tool.name, tool);
    this.logger.debug(`Registered tool: ${tool.name}`);
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools
   */
  getAllTools(): BaseTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get all tool definitions for MCP protocol
   */
  getToolDefinitions(): ToolDefinition[] {
    return this.getAllTools().map((tool) => tool.getDefinition());
  }

  /**
   * Check if a tool exists
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get tool count
   */
  getToolCount(): number {
    return this.tools.size;
  }

  /**
   * Execute a tool by name
   */
  async executeTool(name: string, args: unknown): Promise<any> {
    const tool = this.getTool(name);

    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    return tool.run(args);
  }
}
