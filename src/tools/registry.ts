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
import { GetServerTool } from './servers/get-server.js';
import { GetServerResourcesTool } from './servers/get-server-resources.js';
import { CreateServerTool } from './servers/create-server.js';
import { UpdateServerTool } from './servers/update-server.js';
import { DeleteServerTool } from './servers/delete-server.js';
import { ValidateServerTool } from './servers/validate-server.js';
import { GetServerDomainsTool } from './servers/get-server-domains.js';
import { GetServerLogsTool } from './servers/get-server-logs.js';
import { GetServerMetricsTool } from './servers/get-server-metrics.js';
import { CleanServerStorageTool } from './servers/clean-server-storage.js';
import { RestartServerProxyTool } from './servers/restart-server-proxy.js';
import { ExecuteServerCommandTool } from './servers/execute-server-command.js';
import { GetServerNetworksTool } from './servers/get-server-networks.js';
import { UpdateServerSettingsTool } from './servers/update-server-settings.js';

// Project tools
import { ListProjectsTool } from './projects/list-projects.js';
import { GetProjectTool } from './projects/get-project.js';
import { CreateProjectTool } from './projects/create-project.js';
import { UpdateProjectTool } from './projects/update-project.js';
import { DeleteProjectTool } from './projects/delete-project.js';
import { GetProjectResourcesTool } from './projects/get-project-resources.js';

// Team tools
import { ListTeamsTool } from './teams/list-teams.js';
import { GetTeamTool } from './teams/get-team.js';
import { GetCurrentTeamTool } from './teams/get-current-team.js';
import { GetCurrentTeamMembersTool } from './teams/get-current-team-members.js';
import { GetTeamMembersTool } from './teams/get-team-members.js';
import { UpdateTeamTool } from './teams/update-team.js';
import { InviteTeamMemberTool } from './teams/invite-team-member.js';
import { RemoveTeamMemberTool } from './teams/remove-team-member.js';
import { UpdateTeamMemberRoleTool } from './teams/update-team-member-role.js';

// Environment tools
import { ListEnvironmentsTool } from './environments/list-environments.js';
import { CreateEnvironmentTool } from './environments/create-environment.js';
import { UpdateEnvironmentTool } from './environments/update-environment.js';
import { DeleteEnvironmentTool } from './environments/delete-environment.js';
import { GetEnvironmentVariablesTool } from './environments/get-environment-variables.js';
import { CloneEnvironmentTool } from './environments/clone-environment.js';

// Deployment tools
import { ListDeploymentsTool } from './deployments/list-deployments.js';
import { GetDeploymentTool } from './deployments/get-deployment.js';
import { CancelDeploymentTool } from './deployments/cancel-deployment.js';
import { GetDeploymentLogsTool } from './deployments/get-deployment-logs.js';
import { GetApplicationDeploymentHistoryTool } from './deployments/get-application-deployment-history.js';
import { GetDeploymentSettingsTool } from './deployments/get-deployment-settings.js';
import { UpdateDeploymentSettingsTool } from './deployments/update-deployment-settings.js';
import { RollbackDeploymentTool } from './deployments/rollback-deployment.js';

// Private Key tools
import { ListPrivateKeysTool } from './keys/list-private-keys.js';
import { CreatePrivateKeyTool } from './keys/create-private-key.js';

// Health/Version tools
import { GetVersionTool } from './health/get-version.js';
import { HealthCheckTool } from './health/health-check.js';
import { GetSystemStatusTool } from './health/get-system-status.js';

// Application tools
import { ListApplicationsTool } from './applications/list-applications.js';
import { GetApplicationTool } from './applications/get-application.js';
import { CreateApplicationTool } from './applications/create-application.js';
import { UpdateApplicationTool } from './applications/update-application.js';
import { DeleteApplicationTool } from './applications/delete-application.js';
import { StartApplicationTool } from './applications/start-application.js';
import { StopApplicationTool } from './applications/stop-application.js';
import { RestartApplicationTool } from './applications/restart-application.js';
import { GetApplicationLogsTool } from './applications/get-application-logs.js';
import { DeployApplicationTool } from './applications/deploy-application.js';
import { GetApplicationEnvVarsTool } from './applications/get-application-env-vars.js';
import { SetApplicationEnvVarTool } from './applications/set-application-env-var.js';
import { UpdateApplicationEnvVarsTool } from './applications/update-application-env-vars.js';
import { BulkUpdateEnvVarsTool } from './applications/update-env-var-bulk.js';
import { DeleteApplicationEnvVarTool } from './applications/delete-application-env-var.js';
import { GetApplicationDomainsTool } from './applications/get-application-domains.js';
import { UpdateApplicationDomainsTool } from './applications/update-application-domains.js';

// Service tools
import { ListServicesTool } from './services/list-services.js';
import { GetServiceTool } from './services/get-service.js';
import { CreateServiceTool } from './services/create-service.js';
import { UpdateServiceTool } from './services/update-service.js';
import { DeleteServiceTool } from './services/delete-service.js';
import { StartServiceTool } from './services/start-service.js';
import { StopServiceTool } from './services/stop-service.js';
import { RestartServiceTool } from './services/restart-service.js';
import { GetServiceLogsTool } from './services/get-service-logs.js';
import { GetServiceEnvVarsTool } from './services/get-service-env-vars.js';
import { SetServiceEnvVarTool } from './services/set-service-env-var.js';
import { UpdateServiceEnvVarsTool } from './services/update-service-env-vars.js';
import { GetServiceDomainsTool } from './services/get-service-domains.js';
import { UpdateServiceDomainsTool } from './services/update-service-domains.js';

// Notification tools
import { ListNotificationChannelsTool } from './notifications/list-notification-channels.js';
import { CreateNotificationChannelTool } from './notifications/create-notification-channel.js';
import { UpdateNotificationChannelTool } from './notifications/update-notification-channel.js';
import { DeleteNotificationChannelTool } from './notifications/delete-notification-channel.js';
import { TestNotificationChannelTool } from './notifications/test-notification-channel.js';
import { GetNotificationSettingsTool } from './notifications/get-notification-settings.js';
import { UpdateNotificationSettingsTool } from './notifications/update-notification-settings.js';

// Webhook tools
import { ListWebhooksTool } from './webhooks/list-webhooks.js';
import { CreateWebhookTool } from './webhooks/create-webhook.js';
import { UpdateWebhookTool } from './webhooks/update-webhook.js';
import { DeleteWebhookTool } from './webhooks/delete-webhook.js';

// Security tools
import { GetApiTokensTool } from './security/get-api-tokens.js';
import { CreateApiTokenTool } from './security/create-api-token.js';
import { DeleteApiTokenTool } from './security/delete-api-token.js';
import { GetSecuritySettingsTool } from './security/get-security-settings.js';
import { UpdateSecuritySettingsTool } from './security/update-security-settings.js';

// Batch operation tools
import { BatchRestartApplicationsTool } from './batch/batch-restart-applications.js';
import { BatchStopApplicationsTool } from './batch/batch-stop-applications.js';
import { BatchStartServicesTool } from './batch/batch-start-services.js';
import { BatchStopServicesTool } from './batch/batch-stop-services.js';
import { BatchUpdateEnvVarsTool } from './batch/batch-update-env-vars.js';
import { BatchDeployApplicationsTool } from './batch/batch-deploy-applications.js';
import { BatchBackupDatabasesTool } from './batch/batch-backup-databases.js';
import { BatchCreateSslCertificatesTool } from './batch/batch-create-ssl-certificates.js';

// Database tools
import { ListDatabasesTool } from './databases/list-databases.js';
import { GetDatabaseTool } from './databases/get-database.js';
import { CreateDatabaseTool } from './databases/create-database.js';
import { UpdateDatabaseTool } from './databases/update-database.js';
import { DeleteDatabaseTool } from './databases/delete-database.js';
import { StartDatabaseTool } from './databases/start-database.js';
import { StopDatabaseTool } from './databases/stop-database.js';
import { RestartDatabaseTool } from './databases/restart-database.js';
import { BackupDatabaseTool } from './databases/backup-database.js';
import { RestoreDatabaseTool } from './databases/restore-database.js';
import { GetDatabaseLogsTool } from './databases/get-database-logs.js';

// SSL/TLS tools
import { ListSslCertificatesTool } from './ssl/list-ssl-certificates.js';
import { GetSslCertificateTool } from './ssl/get-ssl-certificate.js';
import { GenerateSslCertificateTool } from './ssl/generate-ssl-certificate.js';
import { DeleteSslCertificateTool } from './ssl/delete-ssl-certificate.js';

// Volume tools
import { ListVolumesTool } from './volumes/list-volumes.js';
import { GetVolumeTool } from './volumes/get-volume.js';
import { CreateVolumeTool } from './volumes/create-volume.js';
import { DeleteVolumeTool } from './volumes/delete-volume.js';

// Resource management tools
import { SearchResourcesTool } from './resources/search-resources.js';
import { TagResourceTool } from './resources/tag-resource.js';
import { ListResourcesByTagTool } from './resources/list-resources-by-tag.js';

// Git integration tools
import { ListGitRepositoriesTool } from './git/list-git-repositories.js';
import { GetGitBranchesTool } from './git/get-git-branches.js';
import { GetGitCommitsTool } from './git/get-git-commits.js';
import { TriggerGitDeploymentTool } from './git/trigger-git-deployment.js';

// Monitoring tools
import { GetInfrastructureHealthTool } from './monitoring/get-infrastructure-health.js';
import { GetDeploymentStatisticsTool } from './monitoring/get-deployment-statistics.js';

// Network tools
import { ListNetworksTool } from './networks/list-networks.js';
import { GetNetworkTool } from './networks/get-network.js';
import { CreateNetworkTool } from './networks/create-network.js';
import { UpdateNetworkTool } from './networks/update-network.js';
import { DeleteNetworkTool } from './networks/delete-network.js';
import { ConnectResourceToNetworkTool } from './networks/connect-resource-to-network.js';

// Proxy tools
import { GetProxyConfigurationTool } from './proxy/get-proxy-configuration.js';
import { UpdateProxyConfigurationTool } from './proxy/update-proxy-configuration.js';
import { GetProxyLogsTool } from './proxy/get-proxy-logs.js';

// Domain tools
import { VerifyDomainTool } from './domains/verify-domain.js';
import { AddWildcardDomainTool } from './domains/add-wildcard-domain.js';
import { GetDomainDnsRecordsTool } from './domains/get-domain-dns-records.js';
import { TestDomainConnectivityTool } from './domains/test-domain-connectivity.js';

// Resource limits tools
import { GetResourceLimitsTool } from './limits/get-resource-limits.js';
import { UpdateResourceLimitsTool } from './limits/update-resource-limits.js';
import { GetResourceUsageHistoryTool } from './limits/get-resource-usage-history.js';
import { SetResourceQuotasTool } from './limits/set-resource-quotas.js';

// Deploy keys tools
import { ListDeployKeysTool } from './deploy-keys/list-deploy-keys.js';
import { CreateDeployKeyTool } from './deploy-keys/create-deploy-key.js';
import { DeleteDeployKeyTool } from './deploy-keys/delete-deploy-key.js';

// Preview deployments tools
import { CreatePreviewDeploymentTool } from './previews/create-preview-deployment.js';
import { ListPreviewDeploymentsTool } from './previews/list-preview-deployments.js';
import { DeletePreviewDeploymentTool } from './previews/delete-preview-deployment.js';

// Build tools
import { GetBuildArgsTool } from './build/get-build-args.js';
import { SetBuildArgsTool } from './build/set-build-args.js';
import { GetBuildCacheTool } from './build/get-build-cache.js';
import { ClearBuildCacheTool } from './build/clear-build-cache.js';

// User management tools
import { ListUsersTool } from './users/list-users.js';
import { GetUserTool } from './users/get-user.js';
import { UpdateUserTool } from './users/update-user.js';
import { GetUserPermissionsTool } from './users/get-user-permissions.js';
import { UpdateUserPermissionsTool } from './users/update-user-permissions.js';
import { GetAuditLogsTool } from './users/get-audit-logs.js';

// Alert tools
import { CreateAlertRuleTool } from './alerts/create-alert-rule.js';
import { ListAlertRulesTool } from './alerts/list-alert-rules.js';
import { GetIncidentHistoryTool } from './alerts/get-incident-history.js';

// Metrics tools
import { CreateCustomMetricTool } from './metrics/create-custom-metric.js';
import { ListCustomMetricsTool } from './metrics/list-custom-metrics.js';
import { GetUptimeStatusTool } from './metrics/get-uptime-status.js';

// Registry tools
import { ListRegistriesTool } from './registry/list-registries.js';
import { AddRegistryTool } from './registry/add-registry.js';
import { UpdateRegistryTool } from './registry/update-registry.js';
import { DeleteRegistryTool } from './registry/delete-registry.js';
import { TestRegistryConnectionTool } from './registry/test-registry-connection.js';

// Storage tools
import { ConfigureS3StorageTool } from './storage/configure-s3-storage.js';
import { CreateBackupScheduleTool } from './storage/create-backup-schedule.js';
import { ListBackupSchedulesTool } from './storage/list-backup-schedules.js';
import { UpdateBackupRetentionTool } from './storage/update-backup-retention.js';
import { VerifyBackupTool } from './storage/verify-backup.js';

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
      // Health & Version (3)
      GetVersionTool,
      HealthCheckTool,
      GetSystemStatusTool,

      // Server tools (15)
      ListServersTool,
      GetServerTool,
      GetServerResourcesTool,
      CreateServerTool,
      UpdateServerTool,
      DeleteServerTool,
      ValidateServerTool,
      GetServerDomainsTool,
      GetServerLogsTool,
      GetServerMetricsTool,
      CleanServerStorageTool,
      RestartServerProxyTool,
      ExecuteServerCommandTool,
      GetServerNetworksTool,
      UpdateServerSettingsTool,

      // Project tools (6)
      ListProjectsTool,
      GetProjectTool,
      CreateProjectTool,
      UpdateProjectTool,
      DeleteProjectTool,
      GetProjectResourcesTool,

      // Team tools (9)
      ListTeamsTool,
      GetTeamTool,
      GetCurrentTeamTool,
      GetCurrentTeamMembersTool,
      GetTeamMembersTool,
      UpdateTeamTool,
      InviteTeamMemberTool,
      RemoveTeamMemberTool,
      UpdateTeamMemberRoleTool,

      // Environment tools (6)
      ListEnvironmentsTool,
      CreateEnvironmentTool,
      UpdateEnvironmentTool,
      DeleteEnvironmentTool,
      GetEnvironmentVariablesTool,
      CloneEnvironmentTool,

      // Deployment tools (7)
      ListDeploymentsTool,
      GetDeploymentTool,
      CancelDeploymentTool,
      GetDeploymentLogsTool,
      GetApplicationDeploymentHistoryTool,
      GetDeploymentSettingsTool,
      UpdateDeploymentSettingsTool,
      RollbackDeploymentTool,

      // Private Key tools (2)
      ListPrivateKeysTool,
      CreatePrivateKeyTool,

      // Application tools (16)
      ListApplicationsTool,
      GetApplicationTool,
      CreateApplicationTool,
      UpdateApplicationTool,
      DeleteApplicationTool,
      StartApplicationTool,
      StopApplicationTool,
      RestartApplicationTool,
      GetApplicationLogsTool,
      DeployApplicationTool,
      GetApplicationEnvVarsTool,
      SetApplicationEnvVarTool,
      UpdateApplicationEnvVarsTool,
      BulkUpdateEnvVarsTool,
      DeleteApplicationEnvVarTool,
      GetApplicationDomainsTool,
      UpdateApplicationDomainsTool,

      // Service tools (14)
      ListServicesTool,
      GetServiceTool,
      CreateServiceTool,
      UpdateServiceTool,
      DeleteServiceTool,
      StartServiceTool,
      StopServiceTool,
      RestartServiceTool,
      GetServiceLogsTool,
      GetServiceEnvVarsTool,
      SetServiceEnvVarTool,
      UpdateServiceEnvVarsTool,
      GetServiceDomainsTool,
      UpdateServiceDomainsTool,

      // Batch operation tools (8)
      BatchRestartApplicationsTool,
      BatchStopApplicationsTool,
      BatchStartServicesTool,
      BatchStopServicesTool,
      BatchUpdateEnvVarsTool,
      BatchDeployApplicationsTool,
      BatchBackupDatabasesTool,
      BatchCreateSslCertificatesTool,

      // Notification tools (7)
      ListNotificationChannelsTool,
      CreateNotificationChannelTool,
      UpdateNotificationChannelTool,
      DeleteNotificationChannelTool,
      TestNotificationChannelTool,
      GetNotificationSettingsTool,
      UpdateNotificationSettingsTool,

      // Webhook tools (4)
      ListWebhooksTool,
      CreateWebhookTool,
      UpdateWebhookTool,
      DeleteWebhookTool,

      // Security tools (5)
      GetApiTokensTool,
      CreateApiTokenTool,
      DeleteApiTokenTool,
      GetSecuritySettingsTool,
      UpdateSecuritySettingsTool,

      // Database tools (11)
      ListDatabasesTool,
      GetDatabaseTool,
      CreateDatabaseTool,
      UpdateDatabaseTool,
      DeleteDatabaseTool,
      StartDatabaseTool,
      StopDatabaseTool,
      RestartDatabaseTool,
      BackupDatabaseTool,
      RestoreDatabaseTool,
      GetDatabaseLogsTool,

      // SSL/TLS tools (4)
      ListSslCertificatesTool,
      GetSslCertificateTool,
      GenerateSslCertificateTool,
      DeleteSslCertificateTool,

      // Volume tools (4)
      ListVolumesTool,
      GetVolumeTool,
      CreateVolumeTool,
      DeleteVolumeTool,

      // Resource management tools (3)
      SearchResourcesTool,
      TagResourceTool,
      ListResourcesByTagTool,

      // Git integration tools (4)
      ListGitRepositoriesTool,
      GetGitBranchesTool,
      GetGitCommitsTool,
      TriggerGitDeploymentTool,

      // Monitoring tools (2)
      GetInfrastructureHealthTool,
      GetDeploymentStatisticsTool,

      // Network tools (6)
      ListNetworksTool,
      GetNetworkTool,
      CreateNetworkTool,
      UpdateNetworkTool,
      DeleteNetworkTool,
      ConnectResourceToNetworkTool,

      // Proxy tools (3)
      GetProxyConfigurationTool,
      UpdateProxyConfigurationTool,
      GetProxyLogsTool,

      // Domain tools (4)
      VerifyDomainTool,
      AddWildcardDomainTool,
      GetDomainDnsRecordsTool,
      TestDomainConnectivityTool,

      // Resource limits tools (4)
      GetResourceLimitsTool,
      UpdateResourceLimitsTool,
      GetResourceUsageHistoryTool,
      SetResourceQuotasTool,

      // Deploy keys tools (3)
      ListDeployKeysTool,
      CreateDeployKeyTool,
      DeleteDeployKeyTool,

      // Preview deployments tools (3)
      CreatePreviewDeploymentTool,
      ListPreviewDeploymentsTool,
      DeletePreviewDeploymentTool,

      // Build tools (4)
      GetBuildArgsTool,
      SetBuildArgsTool,
      GetBuildCacheTool,
      ClearBuildCacheTool,

      // User management tools (6)
      ListUsersTool,
      GetUserTool,
      UpdateUserTool,
      GetUserPermissionsTool,
      UpdateUserPermissionsTool,
      GetAuditLogsTool,

      // Alert tools (3)
      CreateAlertRuleTool,
      ListAlertRulesTool,
      GetIncidentHistoryTool,

      // Metrics tools (3)
      CreateCustomMetricTool,
      ListCustomMetricsTool,
      GetUptimeStatusTool,

      // Registry tools (5)
      ListRegistriesTool,
      AddRegistryTool,
      UpdateRegistryTool,
      DeleteRegistryTool,
      TestRegistryConnectionTool,

      // Storage tools (5)
      ConfigureS3StorageTool,
      CreateBackupScheduleTool,
      ListBackupSchedulesTool,
      UpdateBackupRetentionTool,
      VerifyBackupTool,
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
