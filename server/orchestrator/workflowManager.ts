import { dataHarvesterAgent } from "../agents/dataHarvester";
import { nlpProcessorAgent } from "../agents/nlpProcessor";
import { marketCorrelatorAgent } from "../agents/marketCorrelator";
import { nanoid } from "nanoid";

interface WorkflowState {
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStep: string;
  steps: WorkflowStep[];
  data: any;
  startTime: Date;
  endTime?: Date;
  error?: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  agent: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input?: any;
  output?: any;
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

interface WorkflowResult {
  workflowId: string;
  success: boolean;
  data?: any;
  error?: string;
  duration: number;
}

export class WorkflowManager {
  private activeWorkflows: Map<string, WorkflowState> = new Map();
  private completedWorkflows: WorkflowState[] = [];

  async startSentimentAnalysisWorkflow(cryptoSymbol?: string): Promise<string> {
    const workflowId = nanoid();
    
    const workflow: WorkflowState = {
      workflowId,
      status: 'pending',
      currentStep: 'data_harvesting',
      steps: [
        {
          id: 'step_1',
          name: 'Data Harvesting',
          agent: 'data_harvester',
          status: 'pending'
        },
        {
          id: 'step_2', 
          name: 'NLP Processing',
          agent: 'nlp_processor',
          status: 'pending'
        },
        {
          id: 'step_3',
          name: 'Market Correlation',
          agent: 'market_correlator',
          status: 'pending'
        }
      ],
      data: { cryptoSymbol },
      startTime: new Date()
    };

    this.activeWorkflows.set(workflowId, workflow);
    
    // Start the workflow execution asynchronously
    this.executeWorkflow(workflowId).catch(error => {
      console.error(`Workflow ${workflowId} failed:`, error);
      this.markWorkflowFailed(workflowId, error.message);
    });

    return workflowId;
  }

  async executeWorkflow(workflowId: string): Promise<WorkflowResult> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    try {
      workflow.status = 'running';
      
      // Step 1: Data Harvesting
      const harvestingResult = await this.executeStep(
        workflow,
        'step_1',
        async () => {
          return await dataHarvesterAgent.harvestData(workflow.data.cryptoSymbol);
        }
      );

      // Step 2: NLP Processing
      const processingResult = await this.executeStep(
        workflow,
        'step_2',
        async () => {
          const harvestedData = harvestingResult.map((item: any) => ({
            id: item.id,
            content: item.content,
            source: item.source
          }));
          return await nlpProcessorAgent.batchProcess(harvestedData);
        }
      );

      // Step 3: Market Correlation
      const correlationResult = await this.executeStep(
        workflow,
        'step_3',
        async () => {
          const sentimentData = processingResult.map((item: any) => ({
            symbol: item.entities[0]?.symbol || workflow.data.cryptoSymbol || 'BTC',
            sentiment: item.sentiment,
            confidence: item.confidence,
            score: item.score,
            mentionCount: item.entities.reduce((sum: number, e: any) => sum + e.mentions, 0)
          }));
          return await marketCorrelatorAgent.correlateWithSentiment(sentimentData);
        }
      );

      // Mark workflow as completed
      workflow.status = 'completed';
      workflow.endTime = new Date();
      workflow.data.result = {
        harvestedData: harvestingResult,
        processedData: processingResult,
        correlationData: correlationResult
      };

      // Move to completed workflows
      this.activeWorkflows.delete(workflowId);
      this.completedWorkflows.push(workflow);

      return {
        workflowId,
        success: true,
        data: workflow.data.result,
        duration: workflow.endTime.getTime() - workflow.startTime.getTime()
      };

    } catch (error) {
      this.markWorkflowFailed(workflowId, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private async executeStep(
    workflow: WorkflowState,
    stepId: string,
    executor: () => Promise<any>
  ): Promise<any> {
    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} not found in workflow ${workflow.workflowId}`);
    }

    try {
      step.status = 'running';
      step.startTime = new Date();
      workflow.currentStep = stepId;

      const result = await executor();

      step.status = 'completed';
      step.endTime = new Date();
      step.output = result;

      return result;

    } catch (error) {
      step.status = 'failed';
      step.endTime = new Date();
      step.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  private markWorkflowFailed(workflowId: string, error: string): void {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow) {
      workflow.status = 'failed';
      workflow.error = error;
      workflow.endTime = new Date();
      
      this.activeWorkflows.delete(workflowId);
      this.completedWorkflows.push(workflow);
    }
  }

  getWorkflowStatus(workflowId: string): WorkflowState | null {
    // Check active workflows first
    const activeWorkflow = this.activeWorkflows.get(workflowId);
    if (activeWorkflow) {
      return activeWorkflow;
    }

    // Check completed workflows
    const completedWorkflow = this.completedWorkflows.find(w => w.workflowId === workflowId);
    return completedWorkflow || null;
  }

  getAllActiveWorkflows(): WorkflowState[] {
    return Array.from(this.activeWorkflows.values());
  }

  getCompletedWorkflows(limit: number = 10): WorkflowState[] {
    return this.completedWorkflows
      .sort((a, b) => (b.endTime?.getTime() || 0) - (a.endTime?.getTime() || 0))
      .slice(0, limit);
  }

  // Clean up old completed workflows (keep last 100)
  cleanupOldWorkflows(): void {
    if (this.completedWorkflows.length > 100) {
      this.completedWorkflows = this.completedWorkflows
        .sort((a, b) => (b.endTime?.getTime() || 0) - (a.endTime?.getTime() || 0))
        .slice(0, 100);
    }
  }

  // Get workflow metrics
  getWorkflowMetrics(): {
    activeCount: number;
    completedCount: number;
    failedCount: number;
    averageDuration: number;
    successRate: number;
  } {
    const completed = this.completedWorkflows;
    const failed = completed.filter(w => w.status === 'failed');
    const successful = completed.filter(w => w.status === 'completed');
    
    const totalDuration = successful.reduce((sum, w) => {
      return sum + ((w.endTime?.getTime() || 0) - w.startTime.getTime());
    }, 0);
    
    const averageDuration = successful.length > 0 ? totalDuration / successful.length : 0;
    const successRate = completed.length > 0 ? successful.length / completed.length : 0;

    return {
      activeCount: this.activeWorkflows.size,
      completedCount: successful.length,
      failedCount: failed.length,
      averageDuration: Math.round(averageDuration),
      successRate: Math.round(successRate * 100) / 100
    };
  }

  // Cancel a running workflow
  cancelWorkflow(workflowId: string): boolean {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow && workflow.status === 'running') {
      this.markWorkflowFailed(workflowId, 'Cancelled by user');
      return true;
    }
    return false;
  }
}

export const workflowManager = new WorkflowManager();