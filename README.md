# 🏹 CodeArtemis

**AI-Powered Development Workflows with LangGraph and VS Code**

CodeArtemis is a Visual Studio Code extension that demonstrates the integration of **LangGraph** (LangChain's workflow orchestration framework) with VS Code's built-in Language Model API. It enables sophisticated, multi-step AI workflows that can automate complex development tasks through intelligent state management and sequential reasoning.

## 🎯 Purpose

### What is CodeArtemis?
CodeArtemis bridges the gap between AI capabilities and practical development workflows. It showcases how modern AI frameworks can be integrated directly into your coding environment to create intelligent, automated processes that go beyond simple code completion.

### Problems It Solves
- **Complex Multi-Step Tasks**: Automates workflows that require multiple AI interactions and decision points
- **API Integration Workflows**: Demonstrates spec comparison, mapper generation, and code transformation
- **AI Workflow Orchestration**: Shows how to chain AI operations with state management
- **Development Process Automation**: Provides patterns for automating repetitive coding tasks

### Key Innovation
Unlike traditional AI coding assistants that work in isolation, CodeArtemis demonstrates how **LangGraph's state management** can orchestrate complex workflows where each step builds upon previous results, creating sophisticated AI-powered development pipelines.

## 🔧 How It Works

### Core Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   VS Code UI    │───▶│   LangGraph      │───▶│  AI Language    │
│   (Commands)    │    │   StateGraph     │    │  Model API      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Workflow State  │
                    │   Management     │
                    └──────────────────┘
```

### Workflow Orchestration
1. **State Graph Definition**: Each workflow is defined as a graph with nodes (processing steps) and edges (transitions)
2. **State Management**: LangGraph maintains workflow state across multiple AI interactions
3. **Sequential Processing**: Each node can modify state and determine the next processing step
4. **AI Integration**: Nodes can call VS Code's Language Model API for intelligent processing
5. **Result Aggregation**: Final results are collected and presented in VS Code output channels

### Example Workflow Flow
```
User Input → Initialize State → AI Processing → State Update → Decision Point → Next Step → Results
```

## 🚀 Features

### 🔹 **LangGraph Demo** (`codeartemis.langgraphDemo`)
Demonstrates basic workflow orchestration with a 3-step process:
- **Step 1**: Initialize workflow state
- **Step 2**: Process data with state transitions  
- **Step 3**: Finalize and generate results

### 🔹 **AI Workflow Demo** (`codeartemis.aiWorkflow`)
Shows AI-powered workflows integrating VS Code's Language Models:
- User input collection
- AI model interaction for content generation
- Secondary AI processing for summarization
- State management across multiple AI calls

### 🔹 **ReactAgent with Tools** (`codeartemis.reactAgent`)
**NEW**: Advanced AI agent that can use tools to solve complex problems:
- **File Operations**: Read/write files, parse YAML, extract code blocks
- **User Interaction**: Get input, open file dialogs, display results
- **Terminal Integration**: Execute commands and build processes
- **Intelligent Problem Solving**: Uses tools autonomously to accomplish tasks

### 🔹 **OpenAPI Workflow** (`codeartemis.openapiWorkflow`)
**NEW**: Sophisticated workflow for API specification processing:
- Compare canonical vs user OpenAPI specifications
- Generate TypeScript mapper code automatically
- Use AI reasoning to handle API differences
- Complete end-to-end code generation pipeline

### 🔹 **Diagnostic Tools**
**NEW**: Built-in testing and troubleshooting commands:
- **Test VS Code Language Model**: Verify GitHub Copilot integration
- **Test ReactAgent Basic Functionality**: Validate ReactAgent setup
- Comprehensive error reporting and debugging

### 🔹 **Extensible Framework**
Ready-to-extend patterns for:
- OpenAPI specification comparison
- Data mapper code generation
- Multi-agent AI interactions
- Complex development task automation

## 📥 Installation

### Prerequisites
- **Visual Studio Code** 1.104.0 or higher
- **Node.js** 18+ 
- **GitHub Copilot** (recommended) or other VS Code Language Model

### Quick Install

#### Option 1: From Source
```bash
# Clone the repository
git clone <your-repo-url>
cd codeartemis

# Install dependencies
npm install

# Build the extension
npm run compile

# Package and install
npx vsce package
code --install-extension codeartemis-0.0.1.vsix
```

#### Option 2: Development Mode
```bash
# Open in VS Code
code .

# Start development mode
npm run watch

# Press F5 to launch Extension Development Host
```

## 🏃‍♂️ How to Run

### ⚡ Quick Start - Test Your Setup
**RECOMMENDED FIRST STEP**: Before trying advanced features, verify your setup:

1. **Open Command Palette**: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. **Run**: `Test VS Code Language Model` 
   - Verifies GitHub Copilot is working
   - Shows available AI models
3. **Then Run**: `Test ReactAgent Basic Functionality`
   - Validates ReactAgent and tools integration
   - Ensures everything is working correctly

### Accessing Commands
1. **Open Command Palette**: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. **Type command name** (see below)
3. **Press Enter** to execute

### Available Commands

#### � **Testing & Diagnostics**
##### �🔸 **"Test VS Code Language Model"** ⭐ **START HERE**
- **Purpose**: Verify GitHub Copilot integration
- **What it does**: Tests direct VS Code Language Model API
- **Use when**: First time setup or troubleshooting issues

##### 🔸 **"Test ReactAgent Basic Functionality"** ⭐ **SECOND STEP**  
- **Purpose**: Validate ReactAgent setup
- **What it does**: Tests ReactAgent with tools integration
- **Use when**: After VS Code LM test passes, before complex workflows

#### 🚀 **Core Features**
##### 🔸 **"LangGraph Demo"**
- **Purpose**: Basic workflow demonstration
- **What it does**: Executes a 3-step state-managed workflow
- **Output**: Step-by-step execution log in "LangGraph Demo" output channel

##### 🔸 **"AI Workflow Demo"**  
- **Purpose**: AI-powered workflow demonstration
- **What it does**: 
  1. Prompts for your question
  2. Sends question to AI model
  3. Generates response summary
  4. Displays full workflow results
- **Output**: Complete interaction log in "AI Workflow" output channel

#### 🛠️ **Advanced Features**
##### 🔸 **"ReactAgent with Tools Demo"** 
- **Purpose**: Interactive AI agent with tool capabilities
- **What it does**: 
  1. Ask questions like "Read the canonical-openapi.yaml and explain it"
  2. Agent automatically uses appropriate tools (file reading, parsing, etc.)
  3. Provides intelligent responses based on tool results
- **Output**: Tool usage and AI responses in "ReactAgent Demo" output channel

##### 🔸 **"OpenAPI ReactAgent Workflow"**
- **Purpose**: Complete OpenAPI specification processing
- **What it does**: 
  1. Reads canonical OpenAPI spec
  2. Prompts for user spec selection
  3. Compares specifications intelligently
  4. Generates TypeScript mapper code
  5. Writes generated code to files
- **Output**: Complete workflow log in "OpenAPI Workflow" output channel

### Viewing Results
1. **Open Output Panel**: `View → Output` or `Cmd+Shift+U`
2. **Select Channel**: Choose appropriate channel from dropdown:
   - "ReactAgent Demo" for tool-based workflows
   - "OpenAPI Workflow" for specification processing
   - "LangGraph Demo" for basic workflows
   - "AI Workflow" for simple AI interactions
3. **Review Results**: See step-by-step workflow execution and AI responses

### Example Usage
```
1. Press Cmd+Shift+P
2. Type "Test ReactAgent Basic Functionality"
3. Verify setup is working correctly
4. Try "ReactAgent with Tools Demo"
5. Enter question: "Read the canonical-openapi.yaml and explain its structure"
6. Watch the workflow execute
7. View results in Output → ReactAgent Demo
```

## 🆕 What's New in This Version

### ReactAgent Integration
- **Custom LLM Proxy**: `VSCodelmChat` class bridges LangChain with VS Code's Language Model API
- **Tool Suite**: 7 specialized tools for file operations, user interaction, and terminal commands
- **Advanced Workflows**: ReactAgent can now solve complex problems using tools autonomously

### New Commands Added
- `Test VS Code Language Model` - Direct API testing and diagnostics
- `Test ReactAgent Basic Functionality` - Validates ReactAgent setup and tool integration  
- `ReactAgent with Tools Demo` - Interactive agent with full tool capabilities
- `OpenAPI ReactAgent Workflow` - Complete API specification processing pipeline

### Enhanced Error Handling
- Comprehensive error reporting and debugging
- Step-by-step diagnostic commands
- Better user feedback and troubleshooting guidance

### Improved Architecture
- Tool-first design enabling AI to interact with VS Code environment
- Separation of concerns between LLM wrapper and workflow orchestration
- Extensible framework for adding new tools and capabilities

### Key Technical Improvements
- **bindTools Method**: Fixed ReactAgent compatibility with VS Code Language Models
- **Async Iterator Handling**: Robust error handling for VS Code API responses
- **Diagnostic Tools**: Built-in testing to verify setup and identify issues
- **Enhanced Debugging**: Detailed logging and error reporting throughout the system
2. Type "AI Workflow Demo"
3. Enter question: "Explain TypeScript generics"
4. Watch the workflow execute
5. View results in Output → AI Workflow
```

## � Troubleshooting

If you encounter any issues:

1. **Start with basic testing**: Run `Test VS Code Language Model` command first to verify your GitHub Copilot integration
2. **Test ReactAgent functionality**: Use `Test ReactAgent Basic Functionality` to validate the complete system
3. **Check the Output panel**: View "AI Workflow" channel for detailed logs
4. **Common issues**:
   - Ensure GitHub Copilot is enabled and authenticated
   - Verify VS Code is version 1.104.0 or later
   - Check that the extension is properly activated

## �📚 Tech Stack

- **[LangGraph](https://github.com/langchain-ai/langgraph)** - Workflow orchestration and state management
- **[LangChain Core](https://github.com/langchain-ai/langchainjs)** - AI application framework
- **[VS Code Language Model API](https://code.visualstudio.com/api/extension-capabilities/language-model)** - GitHub Copilot integration
- **TypeScript** - Type-safe development
- **Node.js** - Runtime environment

## 📖 Documentation

For comprehensive documentation, architecture details, and advanced usage patterns, see:
- **[LANGRAPH_README.md](./LANGRAPH_README.md)** - Complete technical documentation
- **[Sample Files](./docs/)** - Example workflows and patterns
- **[OpenAPI Examples](./canonical-openapi.yaml)** - Reference specifications

## 🔧 Development

### Building
```bash
npm run compile
```

### Testing  
```bash
npm test
```

### Watch Mode
```bash
npm run watch
```

## 🤝 Contributing

This is a proof of concept project. Contributions welcome for:
- New workflow patterns
- Additional AI integrations  
- Enhanced VS Code integration
- Performance optimizations

## 📄 License

MIT License - See LICENSE file for details

---

**🚀 Ready to explore AI-powered development workflows?**  
Install CodeArtemis and experience the future of intelligent code automation in VS Code!
