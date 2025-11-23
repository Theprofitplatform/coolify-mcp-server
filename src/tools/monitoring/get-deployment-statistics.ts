import { z } from 'zod';
import { BaseTool } from '../base.js';

const inputSchema = z.object({
  application_uuid: z.string().optional().describe('Get statistics for a specific application (optional)'),
  days: z.number().min(1).max(90).optional().default(30).describe('Number of days to analyze (default: 30)'),
});

const outputSchema = z.object({
  period: z.object({
    start_date: z.string(),
    end_date: z.string(),
    days: z.number(),
  }),
  deployments: z.object({
    total: z.number(),
    successful: z.number(),
    failed: z.number(),
    cancelled: z.number(),
    success_rate: z.number().describe('Percentage of successful deployments'),
  }),
  performance: z.object({
    average_duration_seconds: z.number().optional(),
    fastest_duration_seconds: z.number().optional(),
    slowest_duration_seconds: z.number().optional(),
  }),
  frequency: z.object({
    deployments_per_day: z.number(),
    busiest_day: z.string().optional(),
    busiest_day_count: z.number().optional(),
  }),
  top_applications: z.array(
    z.object({
      uuid: z.string(),
      name: z.string(),
      deployment_count: z.number(),
      success_rate: z.number(),
    })
  ).optional(),
  recent_failures: z.array(
    z.object({
      deployment_uuid: z.string(),
      application_uuid: z.string(),
      application_name: z.string(),
      created_at: z.string(),
      error: z.string().optional(),
    })
  ),
});

export class GetDeploymentStatisticsTool extends BaseTool {
  name = 'get_deployment_statistics';
  description = 'Get deployment statistics and success rates. Provides insights into deployment frequency, success rates, performance metrics, and identifies problematic applications. Useful for monitoring CI/CD health and identifying trends.';
  inputSchema = inputSchema;
  outputSchema = outputSchema;

  async execute(input: z.infer<typeof inputSchema>): Promise<string> {
    const days = input.days || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch deployments
    let deploymentsResponse;
    if (input.application_uuid) {
      deploymentsResponse = await this.apiGet(`/applications/${input.application_uuid}/deployments`);
    } else {
      // Fetch all applications and their deployments
      const appsResponse = await this.apiGet('/applications');
      const applications = Array.isArray(appsResponse.data) ? appsResponse.data : [];
      
      const deploymentPromises = applications.map((app: any) =>
        this.apiGet(`/applications/${app.uuid}/deployments`).catch(() => ({ data: [] }))
      );
      
      const deploymentResponses = await Promise.all(deploymentPromises);
      const allDeployments = deploymentResponses.flatMap((r) => (Array.isArray(r.data) ? r.data : []));
      
      deploymentsResponse = { data: allDeployments };
    }

    const allDeployments = Array.isArray(deploymentsResponse.data) ? deploymentsResponse.data : [];

    // Filter deployments within date range
    const deployments = allDeployments.filter((d: any) => {
      const createdAt = new Date(d.created_at);
      return createdAt >= startDate && createdAt <= endDate;
    });

    // Calculate statistics
    const total = deployments.length;
    const successful = deployments.filter((d: any) => d.status === 'finished' || d.status === 'success').length;
    const failed = deployments.filter((d: any) => d.status === 'failed' || d.status === 'error').length;
    const cancelled = deployments.filter((d: any) => d.status === 'cancelled').length;
    const successRate = total > 0 ? Math.round((successful / total) * 100 * 100) / 100 : 0;

    // Calculate performance metrics
    const completedDeployments = deployments.filter((d: any) => 
      (d.status === 'finished' || d.status === 'success' || d.status === 'failed') && d.duration
    );
    
    const durations = completedDeployments.map((d: any) => d.duration || 0);
    const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a: number, b: number) => a + b, 0) / durations.length) : 0;
    const fastestDuration = durations.length > 0 ? Math.min(...durations) : 0;
    const slowestDuration = durations.length > 0 ? Math.max(...durations) : 0;

    // Calculate frequency
    const deploymentsPerDay = Math.round((total / days) * 100) / 100;
    
    // Group by day to find busiest day
    const dayGroups: Record<string, number> = {};
    deployments.forEach((d: any) => {
      const day = new Date(d.created_at).toISOString().split('T')[0];
      dayGroups[day] = (dayGroups[day] || 0) + 1;
    });
    
    const busiestDay = Object.keys(dayGroups).reduce((a: string, b: string) => dayGroups[a] > dayGroups[b] ? a : b, '');
    const busiestDayCount = dayGroups[busiestDay] || 0;

    // Get recent failures
    const recentFailures = deployments
      .filter((d: any) => d.status === 'failed' || d.status === 'error')
      .slice(0, 10)
      .map((d: any) => ({
        deployment_uuid: d.uuid,
        application_uuid: d.application_uuid,
        application_name: d.application_name || 'Unknown',
        created_at: d.created_at,
        error: d.error || d.message,
      }));

    // Calculate top applications (if not filtering by specific app)
    let topApplications;
    if (!input.application_uuid) {
      const appStats: Record<string, { name: string; total: number; successful: number }> = {};
      
      deployments.forEach((d: any) => {
        const uuid = d.application_uuid;
        if (!appStats[uuid]) {
          appStats[uuid] = {
            name: d.application_name || 'Unknown',
            total: 0,
            successful: 0,
          };
        }
        appStats[uuid].total++;
        if (d.status === 'finished' || d.status === 'success') {
          appStats[uuid].successful++;
        }
      });

      topApplications = Object.entries(appStats)
        .map(([uuid, stats]) => ({
          uuid,
          name: stats.name,
          deployment_count: stats.total,
          success_rate: Math.round((stats.successful / stats.total) * 100 * 100) / 100,
        }))
        .sort((a, b) => b.deployment_count - a.deployment_count)
        .slice(0, 10);
    }

    const response = {
      period: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        days,
      },
      deployments: {
        total,
        successful,
        failed,
        cancelled,
        success_rate: successRate,
      },
      performance: {
        average_duration_seconds: avgDuration || undefined,
        fastest_duration_seconds: fastestDuration || undefined,
        slowest_duration_seconds: slowestDuration || undefined,
      },
      frequency: {
        deployments_per_day: deploymentsPerDay,
        busiest_day: busiestDay || undefined,
        busiest_day_count: busiestDayCount || undefined,
      },
      top_applications: topApplications,
      recent_failures: recentFailures,
    };

    return this.formatResponse(response);
  }
}
