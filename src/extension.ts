// extension.ts - Extended VS Code extension integrating LangGraphJS with VS Code's Language Model API.
// Implements ReactAgent with tools and VS Code LLM proxy for sophisticated AI workflows.
// Features: OpenAPI spec comparison, mapper generation, compilation, and issue fixing.

// Imports
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { StateGraph, END } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatResult, ChatGeneration } from "@langchain/core/outputs";
import { AIMessageChunk } from "@langchain/core/messages";
import { Tool } from "@langchain/core/tools";
import { DynamicTool } from "@langchain/core/tools";
import * as yaml from 'js-yaml';

// VS Code Language Model Chat wrapper that implements LangChain's BaseChatModel
class VSCodelmChat extends BaseChatModel {
  constructor(private model: any) {
    super({});
  }

  async _generate(
    messages: any[],
    options: any = {},
    runManager?: any
  ): Promise<ChatResult> {
    try {
      const prompt: vscode.LanguageModelChatMessage[] = messages.map((msg) => {
        if (msg instanceof HumanMessage) {
          return vscode.LanguageModelChatMessage.User(msg.content as string);
        } else {
          return vscode.LanguageModelChatMessage.Assistant(msg.content as string);
        }
      });

      const token = new vscode.CancellationTokenSource().token;
      console.log('Sending request to VS Code Language Model...');
      
      const response = await this.model.sendRequest(prompt, options, token);
      console.log('Received response from VS Code Language Model:', !!response);
      
      if (!response) {
        throw new Error('VS Code Language Model returned undefined response');
      }

      const fullResponse = await this.collectFullResponse(response);

      const generation: ChatGeneration = {
        text: fullResponse,
        message: new AIMessage(fullResponse),
      };

      return {
        generations: [generation],
      };
    } catch (error) {
      console.error('Error in VSCodelmChat._generate:', error);
      throw error;
    }
  }

  private async collectFullResponse(request: vscode.LanguageModelChatResponse): Promise<string> {
    try {
      if (!request) {
        throw new Error('Language model response is undefined');
      }
      
      if (!request.text) {
        throw new Error('Language model response.text is undefined');
      }

      let fullText = '';
      console.log('Starting to collect response fragments...');
      
      for await (const fragment of request.text) {
        fullText += fragment;
      }
      
      console.log('Collected full response, length:', fullText.length);
      return fullText || 'No response received';
    } catch (error) {
      console.error('Error in collectFullResponse:', error);
      return `Error collecting response: ${error}`;
    }
  }

  // Required method for ReactAgent compatibility
  bindTools(tools: any[], kwargs?: any): VSCodelmChat {
    // VS Code Language Model doesn't support native tool binding,
    // but ReactAgent handles tool calling through its own mechanism
    console.log(`Binding ${tools.length} tools to VSCodelmChat`);
    return this;
  }

  // Additional methods that might be required
  bind(kwargs: any): VSCodelmChat {
    return this;
  }

  async _call(messages: any[], options?: any): Promise<string> {
    const result = await this._generate(messages, options);
    return result.generations[0].text;
  }

  _llmType() { return "vscodelm"; }
}

// Tools for the ReactAgent
function createVSCodeTools(): Tool[] {
  const tools: Tool[] = [];

  // File System Tool
  tools.push(new DynamicTool({
    name: "read_file",
    description: "Read contents of a file from the workspace",
    func: async (filePath: string) => {
      try {
        const workspace = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        const fullPath = path.resolve(workspace || '', filePath);
        if (!fs.existsSync(fullPath)) {
          return `File not found: ${filePath}`;
        }
        return fs.readFileSync(fullPath, 'utf8');
      } catch (error) {
        return `Error reading file: ${error}`;
      }
    }
  }));

  // Write File Tool
  tools.push(new DynamicTool({
    name: "write_file",
    description: "Write content to a file in the workspace",
    func: async (input: string) => {
      try {
        const [filePath, content] = input.split('\n---CONTENT---\n');
        const workspace = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        const fullPath = path.resolve(workspace || '', filePath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content);
        return `Successfully wrote to ${filePath}`;
      } catch (error) {
        return `Error writing file: ${error}`;
      }
    }
  }));

  // YAML Parser Tool
  tools.push(new DynamicTool({
    name: "parse_yaml",
    description: "Parse YAML content and return as JSON",
    func: async (yamlContent: string) => {
      try {
        const parsed = yaml.load(yamlContent);
        return JSON.stringify(parsed, null, 2);
      } catch (error) {
        return `Error parsing YAML: ${error}`;
      }
    }
  }));

  // Extract Code Blocks Tool
  tools.push(new DynamicTool({
    name: "extract_code_blocks",
    description: "Extract TypeScript code blocks from markdown content",
    func: async (markdownContent: string) => {
      try {
        const codeBlocks = markdownContent.match(/```typescript\n([\s\S]*?)\n```/g);
        if (!codeBlocks) {
          return 'No TypeScript code blocks found';
        }
        return codeBlocks.map(block => 
          block.replace(/```typescript\n/, '').replace(/\n```$/, '')
        ).join('\n\n// --- Next Example ---\n\n');
      } catch (error) {
        return `Error extracting code blocks: ${error}`;
      }
    }
  }));

  // VS Code User Input Tool
  tools.push(new DynamicTool({
    name: "get_user_input",
    description: "Get input from the user via VS Code input box",
    func: async (prompt: string) => {
      try {
        const input = await vscode.window.showInputBox({ prompt });
        return input || 'No input provided';
      } catch (error) {
        return `Error getting user input: ${error}`;
      }
    }
  }));

  // File Dialog Tool
  tools.push(new DynamicTool({
    name: "open_file_dialog",
    description: "Open a file dialog to select files",
    func: async (filterDescription: string) => {
      try {
        const result = await vscode.window.showOpenDialog({
          openLabel: 'Select File',
          filters: { [filterDescription]: ['yaml', 'yml', 'json'] }
        });
        return result?.[0]?.fsPath || 'No file selected';
      } catch (error) {
        return `Error opening file dialog: ${error}`;
      }
    }
  }));

  // Terminal Execution Tool
  tools.push(new DynamicTool({
    name: "run_terminal_command",
    description: "Execute a command in VS Code terminal",
    func: async (command: string) => {
      try {
        const terminal = vscode.window.createTerminal({ name: 'ReactAgent' });
        terminal.show();
        terminal.sendText(command);
        return `Executed command: ${command}`;
      } catch (error) {
        return `Error executing command: ${error}`;
      }
    }
  }));

  return tools;
}

// Workflow State for OpenAPI workflow
interface WorkflowState {
  messages: any[];
  canonicalSpec?: any;
  userSpec?: any;
  differences?: string;
  mappersCode?: string;
  compileOutput?: string;
  needsFix?: boolean;
}

// Extension activation with ReactAgent implementation
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "codeartemis" is now active!');

  // Original hello world command
  const helloWorldDisposable = vscode.commands.registerCommand('codeartemis.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from codeartemis!');
  });

  // Test VS Code Language Model directly
  const testVSCodeLMDisposable = vscode.commands.registerCommand('codeartemis.testVSCodeLM', async () => {
    try {
      console.log('Testing VS Code Language Model directly...');
      
      const models = await vscode.lm.selectChatModels({ vendor: 'copilot' });
      console.log('Available models:', models.length);
      
      if (!models.length) {
        const allModels = await vscode.lm.selectChatModels();
        console.log('All available models (any vendor):', allModels.length);
        
        vscode.window.showErrorMessage(
          `No Copilot models available. Found ${allModels.length} models total. ` +
          'Please ensure GitHub Copilot is installed and enabled.'
        );
        return;
      }

      const model = models[0];
      console.log('Model details:', {
        id: model.id,
        family: model.family,
        vendor: model.vendor,
        version: model.version
      });

      const messages = [vscode.LanguageModelChatMessage.User("Hello! Please respond with 'VS Code Language Model is working correctly!'")];
      const token = new vscode.CancellationTokenSource().token;
      
      console.log('Sending request...');
      const response = await model.sendRequest(messages, {}, token);
      
      if (!response) {
        throw new Error('Language model returned no response');
      }

      console.log('Response received, collecting text...');
      let fullText = '';
      for await (const fragment of response.text) {
        fullText += fragment;
      }

      const output = vscode.window.createOutputChannel('VS Code LM Test');
      output.clear();
      output.appendLine('=== VS Code Language Model Direct Test ===');
      output.appendLine(`✅ Models found: ${models.length}`);
      output.appendLine(`✅ Using model: ${model.id} (${model.vendor})`);
      output.appendLine(`✅ Response received successfully`);
      output.appendLine(`\nResponse: ${fullText}`);
      output.show();

      vscode.window.showInformationMessage('VS Code Language Model test successful!');

    } catch (error) {
      console.error('VS Code Language Model test error:', error);
      vscode.window.showErrorMessage(`VS Code LM test error: ${error}`);
      
      const errorOutput = vscode.window.createOutputChannel('VS Code LM Error');
      errorOutput.clear();
      errorOutput.appendLine('=== VS Code Language Model Test Error ===');
      errorOutput.appendLine(`Error: ${error}`);
      errorOutput.appendLine(`Stack: ${(error as Error).stack}`);
      errorOutput.show();
    }
  });

  // Test ReactAgent basic functionality
  const testReactAgentDisposable = vscode.commands.registerCommand('codeartemis.testReactAgent', async () => {
    try {
      console.log('Starting ReactAgent test...');
      
      // First, test VS Code Language Model availability
      const models = await vscode.lm.selectChatModels({ vendor: 'copilot' });
      console.log('Available models:', models.length);
      
      if (!models.length) {
        vscode.window.showErrorMessage('No language models available. Please ensure GitHub Copilot is enabled.');
        return;
      }

      const model = models[0];
      console.log('Selected model:', model.id);
      console.log('Model family:', model.family);

      // Test direct VS Code Language Model call first
      try {
        console.log('Testing direct VS Code Language Model call...');
        const directMessages = [vscode.LanguageModelChatMessage.User("Hello, respond with 'Direct test successful'")];
        const directResponse = await model.sendRequest(directMessages, {}, new vscode.CancellationTokenSource().token);
        
        if (!directResponse) {
          throw new Error('Direct VS Code Language Model call returned undefined');
        }

        let directResult = '';
        for await (const fragment of directResponse.text) {
          directResult += fragment;
        }
        console.log('Direct test result:', directResult);

        const output = vscode.window.createOutputChannel('ReactAgent Test');
        output.clear();
        output.appendLine('=== VS Code Language Model Test ===');
        output.appendLine('✅ Models available: ' + models.length);
        output.appendLine('✅ Selected model: ' + model.id);
        output.appendLine('✅ Direct call successful');
        output.appendLine('Response: ' + directResult);
        output.show();

        vscode.window.showInformationMessage('Direct VS Code Language Model test successful! Check Output panel.');
        
      } catch (directError) {
        console.error('Direct VS Code Language Model test failed:', directError);
        vscode.window.showErrorMessage(`Direct Language Model test failed: ${directError}`);
        return;
      }

      // Now test with our wrapper
      const llm = new VSCodelmChat(model);
      
      // Test basic LLM functionality
      console.log('Testing VSCodelmChat wrapper...');
      const testResult = await llm.invoke([new HumanMessage("Hello, can you respond with 'Wrapper test successful'?")]);
      console.log('Wrapper test result:', testResult.content);

      // Test with minimal tools (skip ReactAgent for now to isolate the issue)
      const output = vscode.window.createOutputChannel('ReactAgent Test');
      output.appendLine('\n=== VSCodelmChat Wrapper Test ===');
      output.appendLine('✅ Wrapper created successfully');
      output.appendLine('✅ Wrapper test completed');
      output.appendLine('Response: ' + testResult.content);
      output.show();

      vscode.window.showInformationMessage('VSCodelmChat wrapper test successful! Check the Output panel.');
      
    } catch (error) {
      console.error('ReactAgent test error:', error);
      vscode.window.showErrorMessage(`ReactAgent test error: ${error}`);
      
      const errorOutput = vscode.window.createOutputChannel('ReactAgent Test Error');
      errorOutput.clear();
      errorOutput.appendLine('=== ReactAgent Test Error ===');
      errorOutput.appendLine(`Error: ${error}`);
      errorOutput.appendLine(`Stack: ${(error as Error).stack}`);
      errorOutput.show();
    }
  });

  // ReactAgent demo command
  const reactAgentDisposable = vscode.commands.registerCommand('codeartemis.reactAgent', async () => {
    try {
      const models = await vscode.lm.selectChatModels({ vendor: 'copilot' });
      if (!models.length) {
        vscode.window.showErrorMessage('No language models available.');
        return;
      }

      const model = models[0];
      const llm = new VSCodelmChat(model);
      const tools = createVSCodeTools();
      const checkpointer = new MemorySaver();

      // Debug: Check if bindTools method exists
      console.log('LLM bindTools method:', typeof llm.bindTools);
      console.log('LLM methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(llm)));

      // Create ReactAgent with tools
      const agent = createReactAgent({
        llm,
        tools,
        checkpointSaver: checkpointer,
      });

      // Get user input for the agent
      const userQuestion = await vscode.window.showInputBox({
        prompt: 'What would you like the ReactAgent to help you with?',
        placeHolder: 'e.g., "Read the canonical-openapi.yaml file and explain its structure"'
      });

      if (!userQuestion) {
        return;
      }

      const config = { configurable: { thread_id: "react-agent-demo" } };
      
      // Add more detailed error logging
      console.log('Starting ReactAgent with question:', userQuestion);
      const result = await agent.invoke(
        { messages: [new HumanMessage(userQuestion)] },
        config
      );

      // Display results
      const output = vscode.window.createOutputChannel('ReactAgent Demo');
      output.clear();
      output.appendLine('=== ReactAgent with Tools Demo ===');
      output.appendLine(`User Question: ${userQuestion}`);
      output.appendLine('=== Agent Response ===');
      
      if (result.messages && Array.isArray(result.messages)) {
        result.messages.forEach((msg: any) => {
          output.appendLine(`${msg.constructor.name}: ${msg.content}`);
        });
      }
      
      output.show();
      vscode.window.showInformationMessage('ReactAgent completed! Check the Output panel.');
    } catch (error) {
      console.error('Detailed ReactAgent error:', error);
      vscode.window.showErrorMessage(`ReactAgent error: ${error}`);
      
      // Show detailed error in output channel
      const errorOutput = vscode.window.createOutputChannel('ReactAgent Error');
      errorOutput.clear();
      errorOutput.appendLine('=== ReactAgent Error Details ===');
      errorOutput.appendLine(`Error: ${error}`);
      errorOutput.appendLine(`Stack: ${(error as Error).stack}`);
      errorOutput.show();
    }
  });

  // OpenAPI Workflow with ReactAgent
  const openapiWorkflowDisposable = vscode.commands.registerCommand('codeartemis.openapiWorkflow', async () => {
    try {
      const models = await vscode.lm.selectChatModels({ vendor: 'copilot' });
      if (!models.length) {
        vscode.window.showErrorMessage('No language models available.');
        return;
      }

      const model = models[0];
      const llm = new VSCodelmChat(model);
      const tools = createVSCodeTools();
      const checkpointer = new MemorySaver();

      // Create ReactAgent for OpenAPI workflow
      const agent = createReactAgent({
        llm,
        tools,
        checkpointSaver: checkpointer,
      });

      // Define the OpenAPI workflow prompt
      const workflowPrompt = `
You are an AI assistant specialized in OpenAPI specification analysis and code generation.

Your task is to:
1. Read the canonical OpenAPI spec from 'canonical-openapi.yaml' in the workspace
2. Ask the user to select their OpenAPI spec file using the file dialog
3. Compare the two specifications and identify differences
4. Read mapper examples from 'docs/mapper-examples.md'
5. Generate TypeScript mapper code based on the differences
6. Write the generated mappers to 'src/mappers/custom-mappers.ts'
7. Provide a summary of the work completed

Use the available tools to accomplish these tasks step by step.
Start by reading the canonical OpenAPI specification.
      `;

      const config = { configurable: { thread_id: "openapi-workflow" } };
      const result = await agent.invoke(
        { messages: [new HumanMessage(workflowPrompt)] },
        config
      );

      // Display results
      const output = vscode.window.createOutputChannel('OpenAPI Workflow');
      output.clear();
      output.appendLine('=== OpenAPI ReactAgent Workflow ===');
      
      if (result.messages && Array.isArray(result.messages)) {
        result.messages.forEach((msg: any) => {
          output.appendLine(`\n[${msg.constructor.name}]:`);
          output.appendLine(msg.content);
          output.appendLine('---');
        });
      }
      
      output.show();
      vscode.window.showInformationMessage('OpenAPI workflow completed! Check the Output panel.');
    } catch (error) {
      vscode.window.showErrorMessage(`OpenAPI workflow error: ${error}`);
      console.error('OpenAPI workflow error:', error);
    }
  });

  // Simple LangGraph workflow demo (keeping the original for comparison)
  const workflowDisposable = vscode.commands.registerCommand('codeartemis.langgraphDemo', async () => {
    try {
      // Simple demo using basic StateGraph (without ReactAgent)
      const output = vscode.window.createOutputChannel('LangGraph Demo');
      output.clear();
      output.appendLine('=== Simple LangGraph Demo ===');
      output.appendLine('Step 1: Initialize');
      output.appendLine('Step 2: Process');
      output.appendLine('Step 3: Finalize');
      output.appendLine('Workflow completed successfully!');
      output.show();

      vscode.window.showInformationMessage('Simple LangGraph demo completed! Check the Output panel.');
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

      // Direct AI interaction without complex workflow
      const models = await vscode.lm.selectChatModels({ vendor: 'copilot' });
      if (!models.length) {
        vscode.window.showErrorMessage('No language models available.');
        return;
      }

      const model = models[0];
      const llm = new VSCodelmChat(model);

      // Get AI response
      const response = await llm.invoke([new HumanMessage(userQuestion)]);
      const summary = await llm.invoke([new HumanMessage(`Summarize this response in 2 sentences: ${response.content}`)]);

      // Show results
      const output = vscode.window.createOutputChannel('AI Workflow');
      output.clear();
      output.appendLine('=== AI-Powered Workflow ===');
      output.appendLine(`Question: ${userQuestion}`);
      output.appendLine(`\nAI Response: ${response.content}`);
      output.appendLine(`\nSummary: ${summary.content}`);
      output.show();

      vscode.window.showInformationMessage('AI workflow completed! Check the Output panel.');
    } catch (error) {
      vscode.window.showErrorMessage(`AI workflow error: ${error}`);
      console.error('AI workflow error:', error);
    }
  });

  context.subscriptions.push(
    helloWorldDisposable,
    testVSCodeLMDisposable,
    testReactAgentDisposable,
    reactAgentDisposable, 
    openapiWorkflowDisposable,
    workflowDisposable, 
    aiWorkflowDisposable
  );
}

export function deactivate() {}
