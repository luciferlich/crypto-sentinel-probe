import { useState } from "react";
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

  // Fetch workflow status
  const { data: workflowData, isLoading: workflowLoading } = useQuery({
    queryKey: ["/api/workflows"],
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  // Fetch agent health
  const { data: agentHealth } = useQuery({
    queryKey: ["/api/agents/health"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Start workflow mutation
  const startWorkflowMutation = useMutation({
    mutationFn: async (cryptoSymbol: string) => {
      return apiRequest("/api/workflows/sentiment-analysis", {
        method: "POST",
        body: JSON.stringify({ cryptoSymbol: cryptoSymbol.toUpperCase() }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
    },
  });

  // Cancel workflow mutation
  const cancelWorkflowMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      return apiRequest(`/api/workflows/${workflowId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
    },
  });

  const handleStartWorkflow = () => {
    if (cryptoSymbol.trim()) {
      startWorkflowMutation.mutate(cryptoSymbol.trim());
    }
  };

  const handleCancelWorkflow = (workflowId: string) => {
    cancelWorkflowMutation.mutate(workflowId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" data-testid={`status-pending`}><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "running":
        return <Badge variant="default" data-testid={`status-running`}><Activity className="w-3 h-3 mr-1" />Running</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-green-600" data-testid={`status-completed`}><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      case "failed":
        return <Badge variant="destructive" data-testid={`status-failed`}><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary" data-testid={`status-unknown`}>Unknown</Badge>;
    }
  };

  const getStepProgress = (steps: WorkflowStep[]) => {
    const completed = steps.filter(step => step.status === "completed").length;
    return (completed / steps.length) * 100;
  };

  if (workflowLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Agent Orchestrator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeWorkflows: WorkflowState[] = (workflowData as any)?.active || [];
  const completedWorkflows: WorkflowState[] = (workflowData as any)?.completed || [];
  const metrics: WorkflowMetrics = (workflowData as any)?.metrics || {
    activeCount: 0,
    completedCount: 0,
    failedCount: 0,
    averageDuration: 0,
    successRate: 0,
  };

  return (
    <div className="space-y-6" data-testid="agent-orchestrator">
      {/* Start New Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Agent AI Orchestration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="crypto-symbol">Cryptocurrency Symbol</Label>
              <Input
                id="crypto-symbol"
                value={cryptoSymbol}
                onChange={(e) => setCryptoSymbol(e.target.value)}
                placeholder="BTC, ETH, ADA..."
                data-testid="input-crypto-symbol"
              />
            </div>
            <Button
              onClick={handleStartWorkflow}
              disabled={startWorkflowMutation.isPending || !cryptoSymbol.trim()}
              data-testid="button-start-workflow"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Analysis
            </Button>
          </div>

          {startWorkflowMutation.error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription data-testid="error-start-workflow">
                Failed to start workflow: {(startWorkflowMutation.error as any)?.message || "Unknown error"}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Workflow Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>System Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600" data-testid="metric-active">{metrics.activeCount}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600" data-testid="metric-completed">{metrics.completedCount}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600" data-testid="metric-failed">{metrics.failedCount}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" data-testid="metric-duration">{Math.round(metrics.averageDuration / 1000)}s</div>
              <div className="text-sm text-muted-foreground">Avg Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" data-testid="metric-success-rate">{(metrics.successRate * 100).toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Health Status */}
      {agentHealth && (
        <Card>
          <CardHeader>
            <CardTitle>Agent Health Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Data Harvester</span>
                <Badge variant={(agentHealth as any)?.dataHarvester?.status === "online" ? "outline" : "destructive"} data-testid="status-data-harvester">
                  {(agentHealth as any)?.dataHarvester?.status || "offline"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">NLP Processor</span>
                <Badge variant={(agentHealth as any)?.nlpProcessor?.status === "online" ? "outline" : "destructive"} data-testid="status-nlp-processor">
                  {(agentHealth as any)?.nlpProcessor?.status || "offline"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Market Correlator</span>
                <Badge variant={(agentHealth as any)?.marketCorrelator?.status === "online" ? "outline" : "destructive"} data-testid="status-market-correlator">
                  {(agentHealth as any)?.marketCorrelator?.status || "offline"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Workflows */}
      {activeWorkflows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Workflows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeWorkflows.map((workflow) => (
              <div key={workflow.workflowId} className="border rounded-lg p-4 space-y-3" data-testid={`workflow-active-${workflow.workflowId}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Workflow {workflow.workflowId.slice(-8)}</div>
                    <div className="text-sm text-muted-foreground">
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
                      data-testid={`button-cancel-${workflow.workflowId}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(getStepProgress(workflow.steps))}%</span>
                  </div>
                  <Progress value={getStepProgress(workflow.steps)} className="w-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {workflow.steps.map((step) => (
                    <div key={step.id} className={`p-2 rounded text-sm ${
                      step.status === 'completed' ? 'bg-green-50 text-green-800' :
                      step.status === 'running' ? 'bg-blue-50 text-blue-800' :
                      step.status === 'failed' ? 'bg-red-50 text-red-800' :
                      'bg-gray-50 text-gray-600'
                    }`} data-testid={`step-${step.id}`}>
                      <div className="font-medium">{step.name}</div>
                      <div className="text-xs">{step.agent}</div>
                      {step.error && (
                        <div className="text-xs text-red-600 mt-1">{step.error}</div>
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
        <Card>
          <CardHeader>
            <CardTitle>Recent Completed Workflows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedWorkflows.slice(0, 5).map((workflow) => (
              <div key={workflow.workflowId} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`workflow-completed-${workflow.workflowId}`}>
                <div>
                  <div className="font-medium">Workflow {workflow.workflowId.slice(-8)}</div>
                  <div className="text-sm text-muted-foreground">
                    {workflow.endTime && (
                      <>Duration: {Math.round((new Date(workflow.endTime).getTime() - new Date(workflow.startTime).getTime()) / 1000)}s</>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(workflow.status)}
                  {workflow.endTime && (
                    <span className="text-xs text-muted-foreground">
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