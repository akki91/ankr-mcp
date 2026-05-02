[![Verified on MseeP](https://mseep.ai/badge.svg)](https://mseep.ai/app/a9bc2b38-fc54-40a4-aa0f-a9af4a523a8b)

[![MCP Badge](https://lobehub.com/badge/mcp/akki91-ankr-mcp)](https://lobehub.com/mcp/akki91-ankr-mcp)

#  Ankr API MCP Server


MCP (Model Context Protocol) server for blockchain data through the [Ankr](https://www.ankr.com/docs/) API.


## Overview

The Ankr MCP Server fetches on-chain data via the Ankr API. It implements the MCP to allow LLMs to query blockchain data across 20+ chains.

## Features

The server provides 21 tools across all Ankr Advanced API categories:

### Token Operations

- **Get Token Balances** (`get_token_balances`): Gets all token balances for a wallet on a specific blockchain
- **Get Currencies** (`get_currencies`): Lists all available currencies on a blockchain
- **Get Token Price** (`get_token_price`): Gets current USD price for any token
- **Get Token Holders** (`get_token_holders`): Lists holder addresses for a token
- **Get Token Holders Count** (`get_token_holders_count`): Gets historical holder count data
- **Get Token Transfers** (`get_token_transfers`): Gets token transfer history for addresses
- **Get Token Price History** (`get_token_price_history`): Gets historical price data over time
- **Explain Token Price** (`explain_token_price`): Breaks down how a token price is derived

### NFT Operations

- **Get NFTs by Owner** (`get_nfts_by_owner`): Gets all NFTs owned by a wallet
- **Get NFT Metadata** (`get_nft_metadata`): Gets metadata (name, image, traits) for a specific NFT
- **Get NFT Holders** (`get_nft_holders`): Gets all holders of an NFT collection
- **Get NFT Transfers** (`get_nft_transfers`): Gets NFT transfer history

### Query Operations

- **Get Blockchain Stats** (`get_blockchain_stats`): Gets chain statistics (transactions, block time, etc.)
- **Get Blocks** (`get_blocks`): Gets full block data for a block range
- **Get Logs** (`get_logs`): Gets historical event log data
- **Get Transactions by Hash** (`get_transactions_by_hash`): Looks up a transaction by hash
- **Get Transactions by Address** (`get_transactions_by_address`): Gets all transactions for an address
- **Get Interactions** (`get_interactions`): Lists all chains a wallet has interacted with
- **Get Account Balance Historical** (`get_account_balance_historical`): Gets balance at a past block height
- **Get Internal Transactions by Block** (`get_internal_transactions_by_block`): Gets internal txns in a block
- **Get Internal Transactions by Parent Hash** (`get_internal_transactions_by_parent_hash`): Gets internal txns from a parent tx

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

### Sample Chat Prompts

Here are example prompts you can use with this MCP server in Claude or any compatible AI:

#### Token Queries
```
What are the token balances for 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 on Ethereum?
```
```
What's the current price of USDC on Ethereum?
```
```
Show me the price history of ETH over the last 30 days.
```
```
How many holders does the LINK token have on Ethereum?
```
```
Show me recent token transfers for vitalik.eth on Polygon.
```

#### NFT Queries
```
What NFTs does 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 own?
```
```
Get me the metadata for Bored Ape #1234.
```
```
Who holds NFTs from the CryptoPunks collection?
```
```
Show me recent NFT transfers for this wallet on Ethereum.
```

#### Blockchain & Transaction Queries
```
What are the current stats for Ethereum and Polygon?
```
```
Which blockchains has wallet 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 interacted with?
```
```
Look up transaction 0x1234abcd... and decode the logs.
```
```
Show me the latest blocks on Arbitrum with transactions included.
```
```
What were the internal transactions in Ethereum block 19000000?
```
```
What was my wallet balance at block 17000000?
```
## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/akki91/ankr-mcp.git
cd ankr-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

### Running Tests

```bash
npm test
```

### Debug Mode
Debugging for this project is supported using [MCP Inspector](https://github.com/modelcontextprotocol/inspector)

```bash
npm run debug
```


### Sources 
This project is inspired from list of servers created [here](https://github.com/modelcontextprotocol/servers/) 

## Verification
[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/akki91-ankr-mcp-badge.png)](https://mseep.ai/app/akki91-ankr-mcp)
