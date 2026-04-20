import { z } from 'zod';
import { ankrRequest } from '../common/ankrClient';

// Schemas

export const TokenBalancesOnNetworkSchema = z.object({
  network: z.string().describe('The blockchain network (e.g., "ethereum", "base", "polygon")'),
  address: z.string().describe('The wallet address to check token balances for (supports ENS)')
});

export const GetCurrenciesSchema = z.object({
  blockchain: z.string().describe('The blockchain network to get currencies for (e.g., "eth", "bsc", "polygon")')
});

export const GetTokenPriceSchema = z.object({
  blockchain: z.string().describe('The blockchain network (e.g., "eth", "bsc")'),
  contractAddress: z.string().optional().describe('Token contract address. Omit for native coin price.')
});

export const GetTokenHoldersSchema = z.object({
  blockchain: z.string().describe('The blockchain network'),
  contractAddress: z.string().describe('Token contract address'),
  pageSize: z.number().optional().describe('Number of results per page (max 10000)'),
  pageToken: z.string().optional().describe('Pagination token for next page')
});

export const GetTokenHoldersCountSchema = z.object({
  blockchain: z.string().describe('The blockchain network'),
  contractAddress: z.string().describe('Token contract address'),
  pageSize: z.number().optional().describe('Number of results per page'),
  pageToken: z.string().optional().describe('Pagination token for next page')
});

export const GetTokenTransfersSchema = z.object({
  address: z.array(z.string()).describe('One or more wallet addresses to get transfers for'),
  blockchain: z.array(z.string()).optional().describe('Blockchain(s) to filter by'),
  fromBlock: z.union([z.number(), z.string()]).optional().describe('Starting block number or "earliest"/"latest"'),
  toBlock: z.union([z.number(), z.string()]).optional().describe('Ending block number or "earliest"/"latest"'),
  fromTimestamp: z.number().optional().describe('UNIX timestamp to start from'),
  toTimestamp: z.number().optional().describe('UNIX timestamp to end at'),
  descOrder: z.boolean().optional().describe('Sort in descending order'),
  pageSize: z.number().optional().describe('Number of results per page (max 10000)'),
  pageToken: z.string().optional().describe('Pagination token for next page')
});

export const GetTokenPriceHistorySchema = z.object({
  blockchain: z.string().describe('The blockchain network'),
  contractAddress: z.string().optional().describe('Token contract address. Omit for native coin.'),
  fromTimestamp: z.number().optional().describe('UNIX timestamp to start from'),
  toTimestamp: z.number().optional().describe('UNIX timestamp to end at'),
  interval: z.number().optional().describe('Time interval in seconds between price points'),
  limit: z.number().optional().describe('Maximum number of records to return')
});

export const ExplainTokenPriceSchema = z.object({
  blockchain: z.string().describe('The blockchain network'),
  tokenAddress: z.string().optional().describe('Token contract address'),
  blockHeight: z.number().optional().describe('Block number for historical price explanation')
});

// Functions

export async function getTokenBalancesOnNetwork(network: string, address: string) {
  return ankrRequest('ankr_getAccountBalance', {
    blockchain: network,
    walletAddress: address
  });
}

export async function getCurrencies(blockchain: string) {
  return ankrRequest('ankr_getCurrencies', { blockchain });
}

export async function getTokenPrice(blockchain: string, contractAddress?: string) {
  const params: Record<string, any> = { blockchain };
  if (contractAddress) params.contractAddress = contractAddress;
  return ankrRequest('ankr_getTokenPrice', params);
}

export async function getTokenHolders(
  blockchain: string,
  contractAddress: string,
  pageSize?: number,
  pageToken?: string
) {
  const params: Record<string, any> = { blockchain, contractAddress };
  if (pageSize) params.pageSize = pageSize;
  if (pageToken) params.pageToken = pageToken;
  return ankrRequest('ankr_getTokenHolders', params);
}

export async function getTokenHoldersCount(
  blockchain: string,
  contractAddress: string,
  pageSize?: number,
  pageToken?: string
) {
  const params: Record<string, any> = { blockchain, contractAddress };
  if (pageSize) params.pageSize = pageSize;
  if (pageToken) params.pageToken = pageToken;
  return ankrRequest('ankr_getTokenHoldersCount', params);
}

export async function getTokenTransfers(args: z.infer<typeof GetTokenTransfersSchema>) {
  const params: Record<string, any> = { address: args.address };
  if (args.blockchain) params.blockchain = args.blockchain;
  if (args.fromBlock !== undefined) params.fromBlock = args.fromBlock;
  if (args.toBlock !== undefined) params.toBlock = args.toBlock;
  if (args.fromTimestamp !== undefined) params.fromTimestamp = args.fromTimestamp;
  if (args.toTimestamp !== undefined) params.toTimestamp = args.toTimestamp;
  if (args.descOrder !== undefined) params.descOrder = args.descOrder;
  if (args.pageSize) params.pageSize = args.pageSize;
  if (args.pageToken) params.pageToken = args.pageToken;
  return ankrRequest('ankr_getTokenTransfers', params);
}

export async function getTokenPriceHistory(args: z.infer<typeof GetTokenPriceHistorySchema>) {
  const params: Record<string, any> = { blockchain: args.blockchain };
  if (args.contractAddress) params.contractAddress = args.contractAddress;
  if (args.fromTimestamp !== undefined) params.fromTimestamp = args.fromTimestamp;
  if (args.toTimestamp !== undefined) params.toTimestamp = args.toTimestamp;
  if (args.interval !== undefined) params.interval = args.interval;
  if (args.limit !== undefined) params.limit = args.limit;
  return ankrRequest('ankr_getTokenPriceHistory', params);
}

export async function explainTokenPrice(args: z.infer<typeof ExplainTokenPriceSchema>) {
  const params: Record<string, any> = { blockchain: args.blockchain };
  if (args.tokenAddress) params.tokenAddress = args.tokenAddress;
  if (args.blockHeight !== undefined) params.blockHeight = args.blockHeight;
  return ankrRequest('ankr_explainTokenPrice', params);
}
