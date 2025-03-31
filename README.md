#  Ankr API MCP Server


MCP (Model Context Protocol) server for blockchain data through the [Ankr](https://www.ankr.com/docs/) API.


## Overview

The Ankr MCP Server fetches on-chain data via the Ankr API. It implements the MCP to allow LLMs  blockchain data.

## Features

The server provides the following onchain data operations:

### Token Operations

- **Get Account balance** (`get_token_balances_on_network`): Gets all token balances for a given address on a specific network
    - Parameters: network, wallet/account address
    - Returns: Asset data for that wallet on the chain,

## Installation

```bash
npm install @akki91/ankr-mcp
```

## Usage

### Environment Setup

Set your ANKR API token by logging into ANKR api docs portal.

```bash
export ANKR_API_TOKEN=your_api_token_here
```

### Running the Server

The server can be run directly from the command line:

```bash
npx @akki91/ankr-mcp
```

### Usage with LLM Tools

This server implements the Model Context Protocol (MCP), which allows it to be used as a tool provider for compatible AI models.


### Integration with AI Models

To integrate this server with AI applications that support MCP, add the following to your app's server configuration:


```json
{
  "mcpServers": {
    "ankr-mcp": {
      "command": "npx",
      "args": [
        "@akki91/ankr-mcp"
      ],
      "env": {
        "ANKR_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```
### Integrating Ankr MCP Tools in Claude Desktop

Follow the instructions below to update your settings and ensure that your MCP server is available within Claude Desktop.

#### Step 1: Access Settings in Claude Desktop

1. Launch **Claude Desktop**.
2. From the main menu, navigate to **Settings**.

#### Step 2: Update Developer Settings

1. Open the **Developer Settings**.
2. Edit the configuration file that contains your MCP server definitions.
3. If MCP servers are already listed, append your Ankr MCP configuration to the existing list. Otherwise, copy and paste the entire above configuration for the Ankr MCP server.

#### Step 3: Restart Claude Desktop

1. Close the **Developer Settings** menu.
2. Restart **Claude Desktop** to apply the changes.

#### Step 4: Verify Integration

1. Once Claude Desktop has restarted, click on the **Tools Icon** located just below the chat prompt.
2. Verify that the list of tools provided by the Ankr MCP server is visible and accessible.

By following these steps, your Ankr MCP configuration should now be integrated into Claude Desktop, allowing you to access its tools directly through the interface.

### Sample chat prompt

```
Give me the token balances for wallet adddress X for network Y.
```
## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/akki91/ankr-mcp.git
cd onchain-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

### Debug Mode
Debugging for this project is supported using [MCP Inspector](https://github.com/modelcontextprotocol/inspector)

```bash
npm run debug
```


### Sources 
This project is inspired from list of servers created [here](https://github.com/modelcontextprotocol/servers/) 
