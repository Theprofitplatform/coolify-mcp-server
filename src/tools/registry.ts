/**
 * Tool Registry
 * Manages all available MCP tools
 */

import { AxiosInstance } from 'axios';
import type { CoolifyVersion, ToolDefinition } from '../types/tool.js';
import { BaseTool } from './base.js';
import { createLogger } from '../utils/logger.js';

// Server tools
import { ListServersTool } from './servers/list-servers.js';
import { GetServerResourcesTool } from './servers/get-server-resources.js';
import { CreateServerTool } from './servers/create-server.js';
import { ValidateServerTool } from './servers/validate-server.js';
import { GetServerDomainsTool } from './servers/get-server-domains.js';

// Project tools
import { ListProjectsTool } from './projects/list-projects.js';
import { GetProjectTool } from './projects/get-project.js';
import { CreateProjectTool } from './projects/create-project.js';

// Team tools
import { ListTeamsTool } from './teams/list-teams.js';
import { GetTeamTool } from './teams/get-team.js';
import { GetCurrentTeamTool } from './teams/get-current-team.js';
import { GetCurrentTeamMembersTool } from './teams/get-current-team-members.js';

// Environment tools
import { ListEnvironmentsTool } from './environments/list-environments.js';
import { CreateEnvironmentTool } from './environments/create-environment.js';

// Deployment tools
import { ListDeploymentsTool } from './deployments/list-deployments.js';
import { GetDeploymentTool } from './deployments/get-deployment.js';

// Private Key tools
import { ListPrivateKeysTool } from './keys/list-private-keys.js';
import { CreatePrivateKeyTool } from './keys/create-private-key.js';

// Health/Version tools
import { GetVersionTool } from './health/get-version.js';
import { HealthCheckTool } from './health/health-check.js';

// Application tools
import { ListApplicationsTool } from './applications/list-applications.js';
import { CreateApplicationTool } from './applications/create-application.js';
import { StopApplicationTool } from './applications/stop-application.js';
import { RestartApplicationTool } from './applications/restart-application.js';
import { GetApplicationLogsTool } from './applications/get-application-logs.js';

// Service tools
import { ListServicesTool } from './services/list-services.js';
import { CreateServiceTool } from './services/create-service.js';
import { StartServiceTool } from './services/start-service.js';
import { StopServiceTool } from './services/stop-service.js';
import { RestartServiceTool } from './services/restart-service.js';

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
      // Health & Version (2)
      GetVersionTool,
      HealthCheckTool,

      // Server tools (5)
      ListServersTool,
      GetServerResourcesTool,
      CreateServerTool,
      ValidateServerTool,
      GetServerDomainsTool,

      // Project tools (3)
      ListProjectsTool,
      GetProjectTool,
      CreateProjectTool,

      // Team tools (4)
      ListTeamsTool,
      GetTeamTool,
      GetCurrentTeamTool,
      GetCurrentTeamMembersTool,

      // Environment tools (2)
      ListEnvironmentsTool,
      CreateEnvironmentTool,

      // Deployment tools (2)
      ListDeploymentsTool,
      GetDeploymentTool,

      // Private Key tools (2)
      ListPrivateKeysTool,
      CreatePrivateKeyTool,

      // Application tools (5)
      ListApplicationsTool,
      CreateApplicationTool,
      StopApplicationTool,
      RestartApplicationTool,
      GetApplicationLogsTool,

      // Service tools (5)
      ListServicesTool,
      CreateServiceTool,
      StartServiceTool,
      StopServiceTool,
      RestartServiceTool,
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
