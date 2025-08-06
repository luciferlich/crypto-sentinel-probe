import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Clock, Play, X, Activity } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";

interface WorkflowStep {
  id: string;
  name: string;
  agent: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  error?: string;
}

interface WorkflowState {
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStep: string;
  steps: WorkflowStep[];
  startTime: string;
  endTime?: string;
  error?: string;
}

interface WorkflowMetrics {
  activeCount: number;
  completedCount: number;
  failedCount: number;
  averageDuration: number;
  successRate: number;
}

export function AgentOrchestrator() {
  const [cryptoSymbol, setCryptoSymbol] = useState("BTC");
  const queryClient = useQueryClient();

  // Optimized queries with reduced polling
  const { data: workflowData, isLoading: workflowLoading } = useQuery({
    queryKey: ["/api/workflows"],
    refetchInterval: 15000, // Every 15 seconds
    staleTime: 10000, // Cache for 10 seconds
  });

  const { data: agentHealth } = useQuery({
    queryKey: ["/api/agents/health"],
    refetchInterval: 60000, // Every 60 seconds
    staleTime: 30000, // Cache for 30 seconds
  });

  // Memoized mutations to prevent recreations
  const startWorkflowMutation = useMutation({
    mutationFn: useCallback(async (cryptoSymbol: string) => {
      return apiRequest("/api/workflows/sentiment-analysis", {
        method: "POST",
        body: JSON.stringify({ cryptoSymbol: cryptoSymbol.toUpperCase() }),
        headers: { "Content-Type": "application/json" },
      });
    }, []),
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
    }, [queryClient]),
  });

  const cancelWorkflowMutation = useMutation({
    mutationFn: useCallback(async (workflowId: string) => {
      return apiRequest(`/api/workflows/${workflowId}`, {
        method: "DELETE",
      });
    }, []),
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
    }, [queryClient]),
  });

  const handleStartWorkflow = useCallback(() => {
    if (cryptoSymbol.trim()) {
      startWorkflowMutation.mutate(cryptoSymbol.trim());
    }
  }, [cryptoSymbol, startWorkflowMutation]);

  const handleCancelWorkflow = useCallback((workflowId: string) => {
    cancelWorkflowMutation.mutate(workflowId);
  }, [cancelWorkflowMutation]);

  // Memoized helper functions
  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="text-yellow-400"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "running":
        return <Badge variant="default" className="bg-blue-600"><Activity className="w-3 h-3 mr-1" />Running</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-green-400 border-green-400"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      case "failed":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  }, []);

  const getStepProgress = useCallback((steps: WorkflowStep[]) => {
    if (!steps.length) return 0;
    const completed = steps.filter(step => step.status === "completed").length;
    return (completed / steps.length) * 100;
  }, []);

  // Memoized data processing
  const workflowInfo = useMemo(() => {
    const activeWorkflows: WorkflowState[] = (workflowData as any)?.active || [];
    const completedWorkflows: WorkflowState[] = (workflowData as any)?.completed || [];
    const metrics: WorkflowMetrics = (workflowData as any)?.metrics || {
      activeCount: 0,
      completedCount: 0,
      failedCount: 0,
      averageDuration: 0,
      successRate: 0,
    };
    return { activeWorkflows, completedWorkflows, metrics };
  }, [workflowData]);

  const { activeWorkflows, completedWorkflows, metrics } = workflowInfo;

  if (workflowLoading && !workflowData) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">AI Agent Orchestrator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-gray-400">Loading orchestrator...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="agent-orchestrator">
      {/* Start New Workflow */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Multi-Agent AI Orchestration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="crypto-symbol" className="text-gray-300">Cryptocurrency Symbol</Label>
              <Input
                id="crypto-symbol"
                value={cryptoSymbol}
                onChange={(e) => setCryptoSymbol(e.target.value)}
                placeholder="BTC, ETH, ADA..."
                className="bg-gray-700 border-gray-600 text-white"
                data-testid="input-crypto-symbol"
              />
            </div>
            <Button
              onClick={handleStartWorkflow}
              disabled={startWorkflowMutation.isPending || !cryptoSymbol.trim()}
              className="bg-primary hover:bg-primary/80 text-black"
              data-testid="button-start-workflow"
            >
              <Play className="w-4 h-4 mr-2" />
              {startWorkflowMutation.isPending ? "Starting..." : "Start Analysis"}
            </Button>
          </div>

          {startWorkflowMutation.error && (
            <Alert className="bg-red-900/20 border-red-700">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300" data-testid="error-start-workflow">
                Failed to start workflow: {(startWorkflowMutation.error as any)?.message || "Unknown error"}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* System Metrics */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">System Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400" data-testid="metric-active">{metrics.activeCount}</div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400" data-testid="metric-completed">{metrics.completedCount}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400" data-testid="metric-failed">{metrics.failedCount}</div>
              <div className="text-sm text-gray-400">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white" data-testid="metric-duration">{Math.round(metrics.averageDuration / 1000)}s</div>
              <div className="text-sm text-gray-400">Avg Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white" data-testid="metric-success-rate">{(metrics.successRate * 100).toFixed(0)}%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Health Status */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Agent Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="font-medium text-gray-300">Data Harvester</span>
              <Badge variant="outline" className="text-green-400 border-green-400" data-testid="status-data-harvester">
                online
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="font-medium text-gray-300">NLP Processor</span>
              <Badge variant="outline" className="text-green-400 border-green-400" data-testid="status-nlp-processor">
                online
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="font-medium text-gray-300">Market Correlator</span>
              <Badge variant="outline" className="text-green-400 border-green-400" data-testid="status-market-correlator">
                online
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Workflows */}
      {activeWorkflows.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Active Workflows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeWorkflows.map((workflow) => (
              <div key={workflow.workflowId} className="border border-gray-600 rounded-lg p-4 space-y-3" data-testid={`workflow-active-${workflow.workflowId}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Workflow {workflow.workflowId.slice(-8)}</div>
                    <div className="text-sm text-gray-400">
                      Started: {new Date(workflow.startTime).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(workflow.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelWorkflow(workflow.workflowId)}
                      disabled={cancelWorkflowMutation.isPending}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      data-testid={`button-cancel-${workflow.workflowId}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>Progress</span>
                    <span>{Math.round(getStepProgress(workflow.steps))}%</span>
                  </div>
                  <Progress value={getStepProgress(workflow.steps)} className="w-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {workflow.steps.map((step) => (
                    <div key={step.id} className={`p-2 rounded text-sm ${
                      step.status === 'completed' ? 'bg-green-900/30 text-green-300 border border-green-700' :
                      step.status === 'running' ? 'bg-blue-900/30 text-blue-300 border border-blue-700' :
                      step.status === 'failed' ? 'bg-red-900/30 text-red-300 border border-red-700' :
                      'bg-gray-800/50 text-gray-400 border border-gray-700'
                    }`} data-testid={`step-${step.id}`}>
                      <div className="font-medium">{step.name}</div>
                      <div className="text-xs opacity-75">{step.agent}</div>
                      {step.error && (
                        <div className="text-xs text-red-400 mt-1">{step.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Completed Workflows */}
      {completedWorkflows.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Completed Workflows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedWorkflows.slice(0, 5).map((workflow) => (
              <div key={workflow.workflowId} className="flex items-center justify-between p-3 border border-gray-600 rounded-lg" data-testid={`workflow-completed-${workflow.workflowId}`}>
                <div>
                  <div className="font-medium text-white">Workflow {workflow.workflowId.slice(-8)}</div>
                  <div className="text-sm text-gray-400">
                    {workflow.endTime && (
                      <>Duration: {Math.round((new Date(workflow.endTime).getTime() - new Date(workflow.startTime).getTime()) / 1000)}s</>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(workflow.status)}
                  {workflow.endTime && (
                    <span className="text-xs text-gray-400">
                      {new Date(workflow.endTime).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}