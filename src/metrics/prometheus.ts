/**
 * Prometheus Metrics Collector for Coolify MCP Server
 *
 * Provides observability metrics for:
 * - Tool executions (count, duration, status)
 * - API errors and latency
 * - Active connections
 *
 * Usage:
 *   import { metrics } from './metrics/prometheus.js';
 *   metrics.toolExecutions.inc({ tool_name: 'deploy_application', status: 'success' });
 */

import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

export class MetricsCollector {
  private registry: Registry;

  public toolExecutions: Counter;
  public toolDuration: Histogram;
  public activeConnections: Gauge;
  public apiErrors: Counter;
  public apiLatency: Histogram;

  constructor() {
    this.registry = new Registry();

    // Collect default Node.js metrics (memory, CPU, etc.)
    collectDefaultMetrics({ register: this.registry });

    // Tool execution counter
    this.toolExecutions = new Counter({
      name: 'coolify_mcp_tool_executions_total',
      help: 'Total number of tool executions',
      labelNames: ['tool_name', 'status'],
      registers: [this.registry]
    });

    // Tool execution duration histogram
    this.toolDuration = new Histogram({
      name: 'coolify_mcp_tool_duration_seconds',
      help: 'Tool execution duration in seconds',
      labelNames: ['tool_name'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30],
      registers: [this.registry]
    });

    // Active MCP connections gauge
    this.activeConnections = new Gauge({
      name: 'coolify_mcp_active_connections',
      help: 'Number of active MCP connections',
      registers: [this.registry]
    });

    // API error counter
    this.apiErrors = new Counter({
      name: 'coolify_api_errors_total',
      help: 'Total API errors by type and endpoint',
      labelNames: ['error_type', 'endpoint', 'status_code'],
      registers: [this.registry]
    });

    // API latency histogram
    this.apiLatency = new Histogram({
      name: 'coolify_api_latency_seconds',
      help: 'Coolify API response latency in seconds',
      labelNames: ['method', 'endpoint'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry]
    });
  }

  /**
   * Record a tool execution with timing
   */
  recordToolExecution(toolName: string, status: 'success' | 'error', durationSeconds: number): void {
    this.toolExecutions.inc({ tool_name: toolName, status });
    this.toolDuration.observe({ tool_name: toolName }, durationSeconds);
  }

  /**
   * Record an API error
   */
  recordApiError(errorType: string, endpoint: string, statusCode: number): void {
    this.apiErrors.inc({ error_type: errorType, endpoint, status_code: statusCode.toString() });
  }

  /**
   * Record API latency
   */
  recordApiLatency(method: string, endpoint: string, durationSeconds: number): void {
    this.apiLatency.observe({ method, endpoint }, durationSeconds);
  }

  /**
   * Increment active connections
   */
  connectionOpened(): void {
    this.activeConnections.inc();
  }

  /**
   * Decrement active connections
   */
  connectionClosed(): void {
    this.activeConnections.dec();
  }

  /**
   * Get all metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return await this.registry.metrics();
  }

  /**
   * Get content type for Prometheus
   */
  getContentType(): string {
    return this.registry.contentType;
  }

  /**
   * Reset all metrics (useful for testing)
   */
  reset(): void {
    this.registry.resetMetrics();
  }
}

// Singleton instance
export const metrics = new MetricsCollector();
