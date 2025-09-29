// extension.ts - Simple VS Code extension integrating LangGraph as a proof of concept
// This demonstrates basic LangGraph workflow integration with VS Code

// Imports
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Try to import LangGraph, fallback to simple implementation if not available
let StateGraph: any;
let END: any;
let MemorySaver: any;

try {
  const langGraph = require("@langchain/langgraph");
  StateGraph = langGraph.StateGraph;
  END = langGraph.END;
  MemorySaver = langGraph.MemorySaver;
} catch (error) {
  console.log('LangGraph not available, using mock implementation');
  // Simple mock implementation for demo purposes
  class MockStateGraph {
    constructor(public config: any) {}
    addNode(name: string, fn: any) { return this; }
    addEdge(from: string, to: string) { return this; }
    setEntryPoint(node: string) { return this; }
    compile() {
      return {
        async invoke(state: any) {
          // Simple mock execution
          return {
            messages: ['Mock workflow executed'],
            result: 'Mock completion'
          };
        }
      };
    }
  }
  StateGraph = MockStateGraph;
  END = 'END';
  MemorySaver = class { };
}

// Simple workflow state
interface SimpleWorkflowState {
  messages: string[];
  step: string;
  result: string;
}

// Simple workflow nodes
async function stepOne(state: SimpleWorkflowState): Promise<SimpleWorkflowState> {
  return {
    ...state,
    messages: [...state.messages, 'Executing step 1: Initialize'],
    step: 'step1',
    result: 'Step 1 completed'
  };
}

async function stepTwo(state: SimpleWorkflowState): Promise<SimpleWorkflowState> {
  return {
    ...state,
    messages: [...state.messages, 'Executing step 2: Process'],
    step: 'step2', 
    result: 'Step 2 completed'
  };
}

async function stepThree(state: SimpleWorkflowState): Promise<SimpleWorkflowState> {
  return {
    ...state,
    messages: [...state.messages, 'Executing step 3: Finalize'],
    step: 'step3',
    result: 'Workflow completed successfully!'
  };
}

// VS Code Language Model interaction
async function askVSCodeModel(question: string): Promise<string> {
  try {
    const models = await vscode.lm.selectChatModels({ vendor: 'copilot' });
    if (!models.length) {
      return 'No language models available';
    }

    const model = models[0];
    const messages = [vscode.LanguageModelChatMessage.User(question)];
    const response = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);
    
    let result = '';
    for await (const fragment of response.text) {
      result += fragment;
    }
    
    return result;
  } catch (error) {
    return `Error: ${error}`;
  }
}

// Extension activation
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "codeartemis" is now active!');

  // Original hello world command
  const helloWorldDisposable = vscode.commands.registerCommand('codeartemis.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from codeartemis!');
  });

  // Simple LangGraph workflow demo
  const workflowDisposable = vscode.commands.registerCommand('codeartemis.langgraphDemo', async () => {
    try {
      // Create a simple workflow with LangGraph
      const workflow = new StateGraph({
        channels: {
          messages: { reducer: (x: any, y: any) => x.concat(y) },
          step: { reducer: (x: any, y: any) => y || x },
          result: { reducer: (x: any, y: any) => y || x }
        }
      })
        .addNode('step1', stepOne)
        .addNode('step2', stepTwo)  
        .addNode('step3', stepThree)
        .addEdge('step1', 'step2')
        .addEdge('step2', 'step3')
        .addEdge('step3', END);

      // Set entry point
      workflow.setEntryPoint('step1');

      // Compile and run
      const app = workflow.compile();
      const initialState: SimpleWorkflowState = {
        messages: [],
        step: '',
        result: ''
      };

      const result = await app.invoke(initialState) as any;
      
      // Show results in VS Code
      const output = vscode.window.createOutputChannel('LangGraph Demo');
      output.clear();
      output.appendLine('=== LangGraph Workflow Demo ===');
      if (result.messages) {
        result.messages.forEach((msg: string) => output.appendLine(msg));
      }
      output.appendLine(`Final Result: ${result.result || 'Completed'}`);
      output.show();

      vscode.window.showInformationMessage('LangGraph workflow completed! Check the Output panel.');
    } catch (error) {
      vscode.window.showErrorMessage(`Workflow error: ${error}`);
      console.error('LangGraph demo error:', error);
    }
  });

  // AI-powered workflow with VS Code Language Model
  const aiWorkflowDisposable = vscode.commands.registerCommand('codeartemis.aiWorkflow', async () => {
    try {
      // Get user input
      const userQuestion = await vscode.window.showInputBox({
        prompt: 'Ask a question for the AI workflow',
        placeHolder: 'e.g., "Explain TypeScript generics"'
      });

      if (!userQuestion) {
        return;
      }

      // Simple AI workflow using LangGraph and VS Code Language Model
      const aiWorkflow = new StateGraph({
        channels: {
          messages: { reducer: (x: any, y: any) => x.concat(y) },
          aiResponse: { reducer: (x: any, y: any) => y || x }
        }
      })
        .addNode('askAI', async (state: any) => {
          const response = await askVSCodeModel(userQuestion);
          return {
            ...state,
            messages: [...state.messages, `Question: ${userQuestion}`, `AI Response: ${response}`],
            aiResponse: response
          };
        })
        .addNode('summarize', async (state: any) => {
          const summary = await askVSCodeModel(`Summarize this response in 2 sentences: ${state.aiResponse}`);
          return {
            ...state,
            messages: [...state.messages, `Summary: ${summary}`],
            aiResponse: summary
          };
        })
        .addEdge('askAI', 'summarize')
        .addEdge('summarize', END);

      aiWorkflow.setEntryPoint('askAI');

      const aiApp = aiWorkflow.compile();
      const aiResult = await aiApp.invoke({ messages: [], aiResponse: '' }) as any;

      // Show results
      const output = vscode.window.createOutputChannel('AI Workflow');
      output.clear();
      output.appendLine('=== AI-Powered LangGraph Workflow ===');
      if (aiResult.messages && Array.isArray(aiResult.messages)) {
        aiResult.messages.forEach((msg: string) => output.appendLine(msg));
      }
      output.show();

      vscode.window.showInformationMessage('AI workflow completed! Check the Output panel.');
    } catch (error) {
      vscode.window.showErrorMessage(`AI workflow error: ${error}`);
      console.error('AI workflow error:', error);
    }
  });

  context.subscriptions.push(helloWorldDisposable, workflowDisposable, aiWorkflowDisposable);
}

export function deactivate() {}
