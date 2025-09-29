# CodeArtemis - LangGraph Integration Proof of Concept

## Purpose

CodeArtemis is a Visual Studio Code extension that demonstrates the powerful integration of **LangGraph** (LangChain's graph-based workflow orchestration framework) with VS Code's built-in Language Model API. This extension serves as a proof of concept for creating sophisticated AI-powered development workflows that can automate complex, multi-step coding tasks.

### What Problem Does It Solve?

Modern software development often involves repetitive, multi-step processes that could benefit from AI automation:
- Comparing API specifications and generating data mappers
- Analyzing code differences and suggesting refactoring strategies  
- Orchestrating complex development workflows with multiple AI interactions
- Creating intelligent coding assistants that can handle sequential reasoning tasks

CodeArtemis demonstrates how LangGraph can orchestrate these complex workflows while leveraging VS Code's native AI capabilities.

## Tech Stack

### Core Technologies
- **[LangGraph](https://github.com/langchain-ai/langgraph)** - State graph framework for building multi-step AI workflows
- **[LangChain Core](https://github.com/langchain-ai/langchainjs)** - Foundational abstractions for AI applications
- **[VS Code Language Model API](https://code.visualstudio.com/api/extension-capabilities/language-model)** - Access to GitHub Copilot and other AI models
- **TypeScript** - Type-safe development environment
- **Node.js** - Runtime environment

### Supporting Libraries
- **js-yaml** - YAML parsing for OpenAPI specifications
- **VS Code Extension API** - Deep integration with the editor

### Architecture Pattern
- **State Graph Orchestration** - LangGraph manages workflow state and transitions
- **AI-Human Collaboration** - Combines automated AI processing with human oversight
- **Extensible Workflow Design** - Easy to add new nodes and workflow patterns

## Installation

### Prerequisites
- **Visual Studio Code** (version 1.104.0 or higher)
- **Node.js** (version 18 or higher)
- **GitHub Copilot** or other compatible VS Code Language Model (optional but recommended)

### Install from Source

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd codeartemis
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Extension**
   ```bash
   npm run compile
   ```

4. **Install in VS Code**
   ```bash
   # Package the extension
   npx vsce package
   
   # Install the .vsix file
   code --install-extension codeartemis-0.0.1.vsix
   ```

### Development Mode

For development and testing:

1. **Open in VS Code**
   ```bash
   code .
   ```

2. **Start Watch Mode**
   ```bash
   npm run watch
   ```

3. **Launch Extension Host**
   - Press `F5` or go to Run → Start Debugging
   - A new VS Code window will open with the extension loaded

## How to Use in Visual Studio Code

### Accessing Commands

The extension provides three main commands accessible through the **Command Palette**:

#### Method 1: Command Palette (Recommended)
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type the command name (see below)
3. Press Enter to execute

#### Method 2: Quick Access
- Use `Cmd+Shift+P` and type `CodeArtemis` to see all available commands

### Available Commands

#### 1. **Hello World** (`codeartemis.helloWorld`)
**Purpose**: Basic functionality test
**How to invoke**:
- Command Palette → Type "Hello World"
- Displays a simple greeting message

#### 2. **LangGraph Demo** (`codeartemis.langgraphDemo`)
**Purpose**: Demonstrates basic LangGraph workflow orchestration
**How to invoke**:
- Command Palette → Type "LangGraph Demo"
- Executes a 3-step workflow: Initialize → Process → Finalize
- Results appear in the "LangGraph Demo" output panel

**What it demonstrates**:
- State management across workflow steps
- Sequential node execution
- Output formatting and display

#### 3. **AI Workflow Demo** (`codeartemis.aiWorkflow`)
**Purpose**: Shows AI-powered workflow with VS Code Language Models
**How to invoke**:
- Command Palette → Type "AI Workflow Demo"
- Enter your question when prompted
- The workflow will:
  1. Send your question to the AI model
  2. Generate a response
  3. Create a summary of the response
- Results appear in the "AI Workflow" output panel

**Example questions to try**:
- "Explain TypeScript generics"
- "How do I implement error handling in Node.js?"
- "What are the benefits of using state machines?"

### Viewing Results

All command results are displayed in **VS Code Output Panels**:

1. **Open Output Panel**:
   - View → Output (or `Cmd+Shift+U`)
   - Select the appropriate channel from the dropdown:
     - "LangGraph Demo" for basic workflow results
     - "AI Workflow" for AI-powered workflow results

2. **Output Format**:
   - Step-by-step workflow execution logs
   - AI responses and summaries
   - Error messages and debugging information

### Workspace Integration

The extension works best with:
- **Open Workspace**: Some features require an active VS Code workspace
- **Language Model Access**: Enable GitHub Copilot or other compatible AI models
- **Sample Files**: The extension includes sample OpenAPI specs and mapper examples

## Features

This extension provides three main commands demonstrating LangGraph integration:

### 1. Hello World (`codeartemis.helloWorld`)
A simple command that displays a hello world message - the original VS Code extension template command.

### 2. LangGraph Demo (`codeartemis.langgraphDemo`) 
A basic workflow demonstration that shows how LangGraph can orchestrate a multi-step process:
- **Step 1**: Initialize the workflow
- **Step 2**: Process data  
- **Step 3**: Finalize and complete

The workflow uses LangGraph's StateGraph to manage state transitions between steps.

### 3. AI Workflow Demo (`codeartemis.aiWorkflow`)
An AI-powered workflow that integrates LangGraph with VS Code's Language Model API:
- Prompts the user for a question
- Uses VS Code's built-in AI model to generate a response
- Creates a summary of the response using a second AI call
- Orchestrates this multi-step AI interaction through LangGraph

## Architecture

### LangGraph Integration
The extension integrates LangGraph in several ways:

1. **StateGraph**: Uses LangGraph's StateGraph class to define workflow nodes and edges
2. **State Management**: Manages workflow state through defined channels with reducers
3. **Node Orchestration**: Defines individual workflow steps as nodes that can be chained together
4. **Conditional Logic**: Supports conditional edges for dynamic workflow paths

### VS Code Language Model Integration
- Leverages VS Code's `vscode.lm.selectChatModels()` API to access GitHub Copilot or other configured models
- Handles streaming responses from the language model
- Integrates AI responses into the LangGraph workflow state

## Sample Files

The extension includes sample files for testing more complex workflows:

### `canonical-openapi.yaml`
A sample OpenAPI specification that serves as a "canonical" reference for API structure comparison workflows.

### `docs/mapper-examples.md`  
Comprehensive examples of data mapping patterns including:
- Field name transformations
- Type conversions
- Nested object mapping
- Response structure transformations
- Validation and sanitization

## Usage

1. **Install Dependencies**: The extension automatically includes LangGraph and related dependencies
2. **Open Command Palette**: Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. **Run Commands**:
   - Type "LangGraph Demo" to run the basic workflow
   - Type "AI Workflow Demo" to run the AI-powered workflow

## Technical Implementation

### Fallback Support
The extension includes fallback mock implementations in case LangGraph dependencies are not available, ensuring the extension can still demonstrate the workflow concept.

### Error Handling
Comprehensive error handling for:
- Missing language models
- Failed AI requests  
- Workflow execution errors
- File system operations

### Output Channels
Results are displayed in VS Code output channels:
- "LangGraph Demo" for basic workflow results
- "AI Workflow" for AI-powered workflow results

## Future Extensions

This proof of concept can be extended to include:

1. **Complex OpenAPI Workflows**: Full implementation of the spec comparison and mapper generation workflow
2. **Tool Integration**: Adding LangChain tools for file operations, web scraping, etc.
3. **Advanced AI Agents**: Multi-agent systems using LangGraph's agent patterns
4. **VS Code Integration**: Deep integration with VS Code's workspace, editor, and debugging APIs

## Development

### Building
```bash
npm run compile
```

### Testing
```bash
npm test
```

### Packaging
```bash
vsce package
```

## Troubleshooting

### Common Issues

#### "No language models available" error
- **Solution**: Install and enable GitHub Copilot or another compatible VS Code language model
- **Check**: VS Code Settings → Extensions → GitHub Copilot

#### Extension not appearing in Command Palette
- **Solution**: Reload VS Code window (`Cmd+R` or `Ctrl+R`)
- **Alternative**: Restart VS Code completely

#### LangGraph import errors
- **Solution**: The extension includes fallback mock implementations
- **Check**: Ensure all dependencies are installed with `npm install`

### Debug Mode

To enable verbose logging:
1. Open VS Code Developer Tools (`Help → Toggle Developer Tools`)
2. Check the Console tab for detailed error messages
3. Look for "CodeArtemis" or "LangGraph" related logs

## Dependencies

### Runtime Dependencies
- `@langchain/langgraph`: ^0.0.34 - State graph orchestration framework
- `@langchain/core`: ^0.2.31 - Core LangChain abstractions and message types  
- `@langchain/community`: ^0.2.32 - Additional LangChain integrations and tools
- `js-yaml`: ^4.1.0 - YAML parsing for OpenAPI specifications and config files

### Development Dependencies  
- `@types/vscode`: ^1.104.0 - VS Code API type definitions
- `typescript`: ^5.9.2 - TypeScript compiler and language support
- `eslint`: ^9.34.0 - Code linting and style enforcement

## Performance Notes

- **Startup Time**: Extension activates on-demand when commands are invoked
- **Memory Usage**: LangGraph workflows maintain minimal state footprint
- **AI Model Calls**: Respects VS Code's AI model rate limiting and quotas
- **Async Operations**: All workflows run asynchronously to avoid blocking the UI

## Contributing

This is a proof of concept project. To extend functionality:

1. **Add New Workflow Nodes**: Extend the StateGraph with additional processing steps
2. **Integrate More AI Tools**: Add LangChain tools for web scraping, file analysis, etc.  
3. **Enhanced VS Code Integration**: Leverage more VS Code APIs (workspace, editor, debugging)
4. **Custom AI Agents**: Implement specialized agents for different development tasks

## License

This project is a proof of concept and demonstration of LangGraph integration with VS Code.

---

**🚀 Ready to explore AI-powered development workflows? Install CodeArtemis and run your first LangGraph workflow in VS Code!**