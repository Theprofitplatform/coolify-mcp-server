import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  include_details: z.boolean().optional().describe('Include detailed health information for each resource'),
});

const outputSchema = z.object({
  overall_status: z.enum(['healthy', 'degraded', 'critical']),
  timestamp: z.string(),
  servers: z.object({
    total: z.number(),
    healthy: z.number(),
    unhealthy: z.number(),
    details: z.array(
      z.object({
        uuid: z.string(),
        name: z.string(),
        status: z.string(),
        cpu_usage: z.number().optional(),
        memory_usage: z.number().optional(),
        disk_usage: z.number().optional(),
      })
    ).optional(),
  }),
  applications: z.object({
    total: z.number(),
    running: z.number(),
    stopped: z.number(),
    failed: z.number(),
    details: z.array(
      z.object({
        uuid: z.string(),
        name: z.string(),
        status: z.string(),
      })
    ).optional(),
  }),
  databases: z.object({
    total: z.number(),
    running: z.number(),
    stopped: z.number(),
    failed: z.number(),
    details: z.array(
      z.object({
        uuid: z.string(),
        name: z.string(),
        status: z.string(),
        type: z.string(),
      })
    ).optional(),
  }),
  services: z.object({
    total: z.number(),
    running: z.number(),
    stopped: z.number(),
    failed: z.number(),
    details: z.array(
      z.object({
        uuid: z.string(),
        name: z.string(),
        status: z.string(),
        type: z.string(),
      })
    ).optional(),
  }),
  issues: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export class GetInfrastructureHealthTool extends BaseTool {
  name = 'get_infrastructure_health';
  description = 'Get a comprehensive health overview of your entire Coolify infrastructure including servers, applications, databases, and services. Returns overall status, resource counts, and health issues.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Fetch all resources in parallel
    const [serversResponse, applicationsResponse, databasesResponse, servicesResponse] = await Promise.all([
      this.apiGet('/servers').catch(() => ({ data: [] })),
      this.apiGet('/applications').catch(() => ({ data: [] })),
      this.apiGet('/databases').catch(() => ({ data: [] })),
      this.apiGet('/services').catch(() => ({ data: [] })),
    ]);

    const servers = Array.isArray(serversResponse.data) ? serversResponse.data : [];
    const applications = Array.isArray(applicationsResponse.data) ? applicationsResponse.data : [];
    const databases = Array.isArray(databasesResponse.data) ? databasesResponse.data : [];
    const services = Array.isArray(servicesResponse.data) ? servicesResponse.data : [];

    // Analyze servers
    const healthyServers = servers.filter((s: any) => s.status === 'running' || s.status === 'connected');
    const unhealthyServers = servers.length - healthyServers.length;

    if (unhealthyServers > 0) {
      issues.push(`${unhealthyServers} server(s) are not healthy`);
    }

    // Check server resources
    for (const server of servers) {
      if (server.cpu_usage > 90) {
        issues.push(`Server ${server.name} has high CPU usage: ${server.cpu_usage}%`);
        recommendations.push(`Consider scaling server ${server.name} or optimizing workloads`);
      }
      if (server.memory_usage > 85) {
        issues.push(`Server ${server.name} has high memory usage: ${server.memory_usage}%`);
        recommendations.push(`Check for memory leaks on server ${server.name}`);
      }
      if (server.disk_usage > 80) {
        issues.push(`Server ${server.name} has high disk usage: ${server.disk_usage}%`);
        recommendations.push(`Clean up old deployments on server ${server.name}`);
      }
    }

    // Analyze applications
    const runningApps = applications.filter((a: any) => a.status === 'running');
    const stoppedApps = applications.filter((a: any) => a.status === 'stopped');
    const failedApps = applications.filter((a: any) => a.status === 'failed' || a.status === 'error');

    if (failedApps.length > 0) {
      issues.push(`${failedApps.length} application(s) have failed`);
      recommendations.push('Check application logs and restart failed applications');
    }

    // Analyze databases
    const runningDbs = databases.filter((d: any) => d.status === 'running');
    const stoppedDbs = databases.filter((d: any) => d.status === 'stopped');
    const failedDbs = databases.filter((d: any) => d.status === 'failed' || d.status === 'error');

    if (failedDbs.length > 0) {
      issues.push(`${failedDbs.length} database(s) have failed`);
      recommendations.push('Check database logs and restart failed databases');
    }

    // Analyze services
    const runningServices = services.filter((s: any) => s.status === 'running');
    const stoppedServices = services.filter((s: any) => s.status === 'stopped');
    const failedServices = services.filter((s: any) => s.status === 'failed' || s.status === 'error');

    if (failedServices.length > 0) {
      issues.push(`${failedServices.length} service(s) have failed`);
      recommendations.push('Check service logs and restart failed services');
    }

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
    
    if (failedApps.length > 0 || failedDbs.length > 0 || failedServices.length > 0 || unhealthyServers > 0) {
      overallStatus = 'critical';
    } else if (issues.length > 0) {
      overallStatus = 'degraded';
    }

    // Build response
    const response: any = {
      overall_status: overallStatus,
      timestamp: new Date().toISOString(),
      servers: {
        total: servers.length,
        healthy: healthyServers.length,
        unhealthy: unhealthyServers,
      },
      applications: {
        total: applications.length,
        running: runningApps.length,
        stopped: stoppedApps.length,
        failed: failedApps.length,
      },
      databases: {
        total: databases.length,
        running: runningDbs.length,
        stopped: stoppedDbs.length,
        failed: failedDbs.length,
      },
      services: {
        total: services.length,
        running: runningServices.length,
        stopped: stoppedServices.length,
        failed: failedServices.length,
      },
      issues,
      recommendations,
    };

    // Add details if requested
    if (input.include_details) {
      response.servers.details = servers.map((s: any) => ({
        uuid: s.uuid,
        name: s.name,
        status: s.status,
        cpu_usage: s.cpu_usage,
        memory_usage: s.memory_usage,
        disk_usage: s.disk_usage,
      }));

      response.applications.details = applications.map((a: any) => ({
        uuid: a.uuid,
        name: a.name,
        status: a.status,
      }));

      response.databases.details = databases.map((d: any) => ({
        uuid: d.uuid,
        name: d.name,
        status: d.status,
        type: d.type,
      }));

      response.services.details = services.map((s: any) => ({
        uuid: s.uuid,
        name: s.name,
        status: s.status,
        type: s.type,
      }));
    }

    return this.formatResponse(response);
  }
}
