#!/usr/bin/env node
import {Server} from "@modelcontextprotocol/sdk/server/index.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {z} from 'zod';
import {zodToJsonSchema} from 'zod-to-json-schema';
import * as tokens from './tools/tokens';
import * as nfts from './tools/nfts';
import * as query from './tools/query';

import {VERSION} from "./common/version.js";

import {
    AnkrError,
    AnkrValidationError,
    AnkrResourceNotFoundError,
    AnkrAuthenticationError,
    AnkrRateLimitError,
    isAnkrError
} from './common/ankrErrors';

const server = new Server(
    {
        name: "ankr-mcp",
        version: VERSION,
    },
    {
        capabilities: {
            resources: {},
            tools: {},
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            // Token Tools
            {
                name: "get_token_balances",
                description: "Gets all token balances for a wallet address on a specific blockchain. Returns coin and token balances with USD values.",
                inputSchema: zodToJsonSchema(tokens.TokenBalancesOnNetworkSchema)
            },
            {
                name: "get_currencies",
                description: "Gets a list of all currencies (tokens) available on a specific blockchain.",
                inputSchema: zodToJsonSchema(tokens.GetCurrenciesSchema)
            },
            {
                name: "get_token_price",
                description: "Gets the current USD price for a specific token. Omit contractAddress for native coin price.",
                inputSchema: zodToJsonSchema(tokens.GetTokenPriceSchema)
            },
            {
                name: "get_token_holders",
                description: "Gets the list of holder addresses for a specific token. Premium API.",
                inputSchema: zodToJsonSchema(tokens.GetTokenHoldersSchema)
            },
            {
                name: "get_token_holders_count",
                description: "Gets the number of token holders with historical count data. Premium API.",
                inputSchema: zodToJsonSchema(tokens.GetTokenHoldersCountSchema)
            },
            {
                name: "get_token_transfers",
                description: "Gets token transfer history for one or more addresses across blockchains. Premium API.",
                inputSchema: zodToJsonSchema(tokens.GetTokenTransfersSchema)
            },
            {
                name: "get_token_price_history",
                description: "Gets historical token price data over time. Premium API.",
                inputSchema: zodToJsonSchema(tokens.GetTokenPriceHistorySchema)
            },
            {
                name: "explain_token_price",
                description: "Gets a breakdown of how a token's price is derived (liquidity pools, pairs). Premium API.",
                inputSchema: zodToJsonSchema(tokens.ExplainTokenPriceSchema)
            },
            // NFT Tools
            {
                name: "get_nfts_by_owner",
                description: "Gets all NFTs owned by a specific wallet address across blockchains.",
                inputSchema: zodToJsonSchema(nfts.GetNFTsByOwnerSchema)
            },
            {
                name: "get_nft_metadata",
                description: "Gets metadata (name, description, image, traits) for a specific NFT by contract address and token ID.",
                inputSchema: zodToJsonSchema(nfts.GetNFTMetadataSchema)
            },
            {
                name: "get_nft_holders",
                description: "Gets all wallet addresses that hold NFTs from a specific collection. Premium API.",
                inputSchema: zodToJsonSchema(nfts.GetNFTHoldersSchema)
            },
            {
                name: "get_nft_transfers",
                description: "Gets NFT transfer history for specified address(es). Premium API.",
                inputSchema: zodToJsonSchema(nfts.GetNFTTransfersSchema)
            },
            // Query Tools
            {
                name: "get_blockchain_stats",
                description: "Gets blockchain statistics including total transactions, block time, and native coin price.",
                inputSchema: zodToJsonSchema(query.GetBlockchainStatsSchema)
            },
            {
                name: "get_blocks",
                description: "Gets full block data for a specified block range on a blockchain.",
                inputSchema: zodToJsonSchema(query.GetBlocksSchema)
            },
            {
                name: "get_logs",
                description: "Gets historical event log data for a block range, with optional filtering by address and topics.",
                inputSchema: zodToJsonSchema(query.GetLogsSchema)
            },
            {
                name: "get_transactions_by_hash",
                description: "Gets details of a transaction by its hash. Can search across multiple blockchains.",
                inputSchema: zodToJsonSchema(query.GetTransactionsByHashSchema)
            },
            {
                name: "get_transactions_by_address",
                description: "Gets all transactions for a wallet or contract address. Premium API.",
                inputSchema: zodToJsonSchema(query.GetTransactionsByAddressSchema)
            },
            {
                name: "get_interactions",
                description: "Gets a list of all blockchains a wallet address has interacted with.",
                inputSchema: zodToJsonSchema(query.GetInteractionsSchema)
            },
            {
                name: "get_account_balance_historical",
                description: "Gets the historical balance of a wallet at a specific block height. Premium/Early Access API.",
                inputSchema: zodToJsonSchema(query.GetAccountBalanceHistoricalSchema)
            },
            {
                name: "get_internal_transactions_by_block",
                description: "Gets internal transactions (contract-to-contract calls) within a specific block. Premium API.",
                inputSchema: zodToJsonSchema(query.GetInternalTransactionsByBlockNumberSchema)
            },
            {
                name: "get_internal_transactions_by_parent_hash",
                description: "Gets internal transactions triggered by a specific parent transaction. Premium API.",
                inputSchema: zodToJsonSchema(query.GetInternalTransactionsByParentHashSchema)
            }
        ]
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (!request.params.arguments) {
            throw new Error("Arguments are required");
        }
        const args = request.params.arguments;

        switch (request.params.name) {
            // Token Tools
            case "get_token_balances": {
                const parsed = tokens.TokenBalancesOnNetworkSchema.parse(args);
                const result = await tokens.getTokenBalancesOnNetwork(parsed.network, parsed.address);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            case "get_currencies": {
                const parsed = tokens.GetCurrenciesSchema.parse(args);
                const result = await tokens.getCurrencies(parsed.blockchain);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            case "get_token_price": {
                const parsed = tokens.GetTokenPriceSchema.parse(args);
                const result = await tokens.getTokenPrice(parsed.blockchain, parsed.contractAddress);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            case "get_token_holders": {
                const parsed = tokens.GetTokenHoldersSchema.parse(args);
                const result = await tokens.getTokenHolders(parsed.blockchain, parsed.contractAddress, parsed.pageSize, parsed.pageToken);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            case "get_token_holders_count": {
                const parsed = tokens.GetTokenHoldersCountSchema.parse(args);
                const result = await tokens.getTokenHoldersCount(parsed.blockchain, parsed.contractAddress, parsed.pageSize, parsed.pageToken);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            case "get_token_transfers": {
                const parsed = tokens.GetTokenTransfersSchema.parse(args);
                const result = await tokens.getTokenTransfers(parsed);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            case "get_token_price_history": {
                const parsed = tokens.GetTokenPriceHistorySchema.parse(args);
                const result = await tokens.getTokenPriceHistory(parsed);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            case "explain_token_price": {
                const parsed = tokens.ExplainTokenPriceSchema.parse(args);
                const result = await tokens.explainTokenPrice(parsed);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            // NFT Tools
            case "get_nfts_by_owner": {
                const parsed = nfts.GetNFTsByOwnerSchema.parse(args);
                const result = await nfts.getNFTsByOwner(parsed);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            case "get_nft_metadata": {
                const parsed = nfts.GetNFTMetadataSchema.parse(args);
                const result = await nfts.getNFTMetadata(parsed);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            case "get_nft_holders": {
                const parsed = nfts.GetNFTHoldersSchema.parse(args);
                const result = await nfts.getNFTHolders(parsed.blockchain, parsed.contractAddress, parsed.pageSize, parsed.pageToken);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            case "get_nft_transfers": {
                const parsed = nfts.GetNFTTransfersSchema.parse(args);
                const result = await nfts.getNFTTransfers(parsed);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            // Query Tools
            case "get_blockchain_stats": {
                const parsed = query.GetBlockchainStatsSchema.parse(args);
                const result = await query.getBlockchainStats(parsed.blockchain);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            case "get_blocks": {
                const parsed = query.GetBlocksSchema.parse(args);
                const result = await query.getBlocks(parsed);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            case "get_logs": {
                const parsed = query.GetLogsSchema.parse(args);
                const result = await query.getLogs(parsed);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            case "get_transactions_by_hash": {
                const parsed = query.GetTransactionsByHashSchema.parse(args);
                const result = await query.getTransactionsByHash(parsed);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            case "get_transactions_by_address": {
                const parsed = query.GetTransactionsByAddressSchema.parse(args);
                const result = await query.getTransactionsByAddress(parsed);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            case "get_interactions": {
                const parsed = query.GetInteractionsSchema.parse(args);
                const result = await query.getInteractions(parsed.address);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            case "get_account_balance_historical": {
                const parsed = query.GetAccountBalanceHistoricalSchema.parse(args);
                const result = await query.getAccountBalanceHistorical(parsed);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            case "get_internal_transactions_by_block": {
                const parsed = query.GetInternalTransactionsByBlockNumberSchema.parse(args);
                const result = await query.getInternalTransactionsByBlockNumber(parsed);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            case "get_internal_transactions_by_parent_hash": {
                const parsed = query.GetInternalTransactionsByParentHashSchema.parse(args);
                const result = await query.getInternalTransactionsByParentHash(parsed);
                return { content: [{type: "text", text: JSON.stringify(result, null, 2)}] };
            }
            default:
                throw new Error(`Unknown tool: ${request.params.name}`);
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
        }
        if (isAnkrError(error)) {
            throw new Error(formatAnkrError(error));
        }
        throw error;
    }
});

function formatAnkrError(error: AnkrError): string {
    let message = `Ankr API Error: ${error.message}`;

    if (error instanceof AnkrValidationError) {
        message = `Validation Error: ${error.message}`;
        if (error.response) {
            message += `\nDetails: ${JSON.stringify(error.response)}`;
        }
    } else if (error instanceof AnkrResourceNotFoundError) {
        message = `Not Found: ${error.message}`;
    } else if (error instanceof AnkrAuthenticationError) {
        message = `Authentication Failed: ${error.message}`;
    } else if (error instanceof AnkrRateLimitError) {
        message = `Rate Limit Exceeded: ${error.message}\nResets at: ${error.resetAt.toISOString()}`;
    }

    return message;
}


async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("ANKR MCP Server running on stdio");
}

runServer().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
