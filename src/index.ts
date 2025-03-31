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
                name: "get_token_balances_on_network",
                description: "Gets all token balances for a given address on a specific network",
                inputSchema: zodToJsonSchema(tokens.TokenBalancesOnNetworkSchema)
            }
        ]
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (!request.params.arguments) {
            throw new Error("Arguments are required");
        }
        switch (request.params.name) {
            // Token Tools
            case "get_token_balances_on_network": {
                const args = tokens.TokenBalancesOnNetworkSchema.parse(request.params.arguments);
                const result = await tokens.getTokenBalancesOnNetwork(
                    args.network,
                    args.address
                );
                return {
                    content: [{type: "text", text: JSON.stringify(result, null, 2)}],
                };
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
