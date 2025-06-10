"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Database,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Users,
  Gamepad2,
} from "lucide-react";

interface HealthCheck {
  check_name: string;
  status: "PASS" | "WARN" | "FAIL";
  message: string;
  details?: any;
}

interface SystemStatus {
  component: string;
  status: "healthy" | "warning" | "error";
  last_check: string;
  details?: string;
}

interface DatabaseStats {
  metric: string;
  value: number;
  description: string;
}

export function DatabaseHealth() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [dbStats, setDbStats] = useState<DatabaseStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const supabase = createClient();

  const fetchHealthData = async () => {
    setIsLoading(true);
    try {
      // Fetch health checks
      const { data: health, error: healthError } = await supabase.rpc(
        "database_health_check"
      );

      if (!healthError && health) {
        setHealthChecks(health);
      }

      // Fetch system status
      const { data: status, error: statusError } = await supabase
        .from("system_status")
        .select("*");

      if (!statusError && status) {
        setSystemStatus(status);
      }

      // Fetch database statistics
      const { data: stats, error: statsError } = await supabase
        .from("database_statistics")
        .select("*");

      if (!statsError && stats) {
        setDbStats(stats);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching health data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const runMaintenanceCheck = async () => {
    try {
      const { data: _data, error } = await supabase.rpc("quick_health_check");
      if (!error) {
        await fetchHealthData();
      }
    } catch (error) {
      console.error("Error running maintenance check:", error);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pass":
      case "healthy":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "warn":
      case "warning":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "fail":
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pass":
      case "healthy":
        return <CheckCircle className="h-4 w-4" />;
      case "warn":
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "fail":
      case "error":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Database Health</h1>
          <p className="text-gray-400 mt-1">
            Monitor your GameVault database performance and health
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-sm text-gray-400">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={fetchHealthData}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={runMaintenanceCheck}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Activity className="h-4 w-4" />
            Quick Check
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemStatus.map((status) => (
          <Card
            key={status.component}
            className="bg-gray-900/50 border-gray-800"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">
                    {status.component}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(status.last_check).toLocaleString()}
                  </p>
                </div>
                <Badge className={getStatusColor(status.status)}>
                  {getStatusIcon(status.status)}
                  <span className="ml-1 capitalize">{status.status}</span>
                </Badge>
              </div>
              {status.details && (
                <p className="text-xs text-gray-400 mt-2">{status.details}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Checks */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Database className="h-5 w-5 text-blue-400" />
              Health Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthChecks.map((check, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 rounded-lg bg-gray-800/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        {check.check_name}
                      </span>
                      <Badge className={getStatusColor(check.status)} size="sm">
                        {getStatusIcon(check.status)}
                        <span className="ml-1">{check.status}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">
                      {check.message}
                    </p>
                    {check.details && (
                      <pre className="text-xs text-gray-400 mt-2 bg-gray-900/50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(check.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
              {healthChecks.length === 0 && !isLoading && (
                <p className="text-gray-400 text-center py-4">
                  No health check data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Database Statistics */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Database Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dbStats.map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30"
                >
                  <div>
                    <p className="font-medium text-white">{stat.metric}</p>
                    <p className="text-sm text-gray-400">{stat.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">
                      {typeof stat.value === "number"
                        ? stat.value.toLocaleString()
                        : stat.value}
                    </p>
                  </div>
                </div>
              ))}
              {dbStats.length === 0 && !isLoading && (
                <p className="text-gray-400 text-center py-4">
                  No statistics available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="h-5 w-5 text-purple-400" />
            Maintenance Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="gap-2 h-auto py-4 flex-col"
              onClick={() => supabase.rpc("cleanup_expired_data")}
            >
              <Database className="h-6 w-6" />
              <span>Cleanup Expired Data</span>
            </Button>
            <Button
              variant="outline"
              className="gap-2 h-auto py-4 flex-col"
              onClick={() => supabase.rpc("refresh_user_journal_stats")}
            >
              <Users className="h-6 w-6" />
              <span>Refresh User Stats</span>
            </Button>
            <Button
              variant="outline"
              className="gap-2 h-auto py-4 flex-col"
              onClick={() => supabase.rpc("check_data_consistency")}
            >
              <Gamepad2 className="h-6 w-6" />
              <span>Check Consistency</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
