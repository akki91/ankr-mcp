import { z } from 'zod';
import { ankrRequest } from '../common/ankrClient';

// Schemas

export const GetBlockchainStatsSchema = z.object({
  blockchain: z.array(z.string()).optional().describe('Blockchain(s) to get stats for. Omit for all chains.')
});

export const GetBlocksSchema = z.object({
  blockchain: z.string().describe('The blockchain network'),
  fromBlock: z.union([z.number(), z.string()]).optional().describe('Starting block (number, hex, "earliest", or "latest")'),
  toBlock: z.union([z.number(), z.string()]).optional().describe('Ending block (number, hex, "earliest", or "latest")'),
  decodeLogs: z.boolean().optional().describe('Decode event logs'),
  decodeTxData: z.boolean().optional().describe('Decode transaction input data'),
  descOrder: z.boolean().optional().describe('Sort in descending order'),
  includeLogs: z.boolean().optional().describe('Include event logs in response'),
  includeTxs: z.boolean().optional().describe('Include transactions in response')
});

export const GetLogsSchema = z.object({
  blockchain: z.array(z.string()).optional().describe('Blockchain(s) to query'),
  address: z.array(z.string()).optional().describe('Contract address(es) to filter logs'),
  fromBlock: z.union([z.number(), z.string()]).optional().describe('Starting block'),
  toBlock: z.union([z.number(), z.string()]).optional().describe('Ending block'),
  fromTimestamp: z.number().optional().describe('UNIX start timestamp'),
  toTimestamp: z.number().optional().describe('UNIX end timestamp'),
  topics: z.array(z.array(z.string())).optional().describe('Event topic filters (array of arrays)'),
  decodeLogs: z.boolean().optional().describe('Decode event logs'),
  descOrder: z.boolean().optional().describe('Sort in descending order'),
  pageSize: z.number().optional().describe('Number of results per page'),
  pageToken: z.string().optional().describe('Pagination token for next page')
});

export const GetTransactionsByHashSchema = z.object({
  transactionHash: z.string().describe('The transaction hash to look up'),
  blockchain: z.array(z.string()).optional().describe('Blockchain(s) to search in'),
  decodeLogs: z.boolean().optional().describe('Decode event logs'),
  decodeTxData: z.boolean().optional().describe('Decode transaction input data'),
  includeLogs: z.boolean().optional().describe('Include event logs in response')
});

export const GetTransactionsByAddressSchema = z.object({
  address: z.string().describe('Wallet or contract address'),
  blockchain: z.array(z.string()).optional().describe('Blockchain(s) to query'),
  fromBlock: z.union([z.number(), z.string()]).optional().describe('Starting block'),
  toBlock: z.union([z.number(), z.string()]).optional().describe('Ending block'),
  fromTimestamp: z.number().optional().describe('UNIX start timestamp'),
  toTimestamp: z.number().optional().describe('UNIX end timestamp'),
  includeLogs: z.boolean().optional().describe('Include event logs'),
  descOrder: z.boolean().optional().describe('Sort in descending order'),
  pageSize: z.number().optional().describe('Number of results per page'),
  pageToken: z.string().optional().describe('Pagination token for next page')
});

export const GetInteractionsSchema = z.object({
  address: z.string().describe('Wallet address to check interactions for')
});

export const GetAccountBalanceHistoricalSchema = z.object({
  walletAddress: z.string().describe('Wallet address to get historical balance for'),
  blockHeight: z.number().optional().describe('Block height (0 or omit for latest)'),
  blockchain: z.array(z.string()).optional().describe('Blockchain(s) to query'),
  onlyWhitelisted: z.boolean().optional().describe('Only return CoinGecko-listed tokens (default: true)'),
  pageSize: z.number().optional().describe('Number of results per page'),
  pageToken: z.string().optional().describe('Pagination token for next page')
});

export const GetInternalTransactionsByBlockNumberSchema = z.object({
  blockchain: z.string().describe('The blockchain network'),
  blockNumber: z.number().optional().describe('Block number to get internal transactions for'),
  onlyWithValue: z.boolean().optional().describe('Only return transactions that transfer value')
});

export const GetInternalTransactionsByParentHashSchema = z.object({
  blockchain: z.string().describe('The blockchain network'),
  parentTransactionHash: z.string().describe('Hash of the parent transaction'),
  onlyWithValue: z.boolean().optional().describe('Only return transactions that transfer value')
});

// Functions

export async function getBlockchainStats(blockchain?: string[]) {
  const params: Record<string, any> = {};
  if (blockchain) params.blockchain = blockchain;
  return ankrRequest('ankr_getBlockchainStats', params);
}

export async function getBlocks(args: z.infer<typeof GetBlocksSchema>) {
  const params: Record<string, any> = { blockchain: args.blockchain };
  if (args.fromBlock !== undefined) params.fromBlock = args.fromBlock;
  if (args.toBlock !== undefined) params.toBlock = args.toBlock;
  if (args.decodeLogs !== undefined) params.decodeLogs = args.decodeLogs;
  if (args.decodeTxData !== undefined) params.decodeTxData = args.decodeTxData;
  if (args.descOrder !== undefined) params.descOrder = args.descOrder;
  if (args.includeLogs !== undefined) params.includeLogs = args.includeLogs;
  if (args.includeTxs !== undefined) params.includeTxs = args.includeTxs;
  return ankrRequest('ankr_getBlocks', params);
}

export async function getLogs(args: z.infer<typeof GetLogsSchema>) {
  const params: Record<string, any> = {};
  if (args.blockchain) params.blockchain = args.blockchain;
  if (args.address) params.address = args.address;
  if (args.fromBlock !== undefined) params.fromBlock = args.fromBlock;
  if (args.toBlock !== undefined) params.toBlock = args.toBlock;
  if (args.fromTimestamp !== undefined) params.fromTimestamp = args.fromTimestamp;
  if (args.toTimestamp !== undefined) params.toTimestamp = args.toTimestamp;
  if (args.topics) params.topics = args.topics;
  if (args.decodeLogs !== undefined) params.decodeLogs = args.decodeLogs;
  if (args.descOrder !== undefined) params.descOrder = args.descOrder;
  if (args.pageSize) params.pageSize = args.pageSize;
  if (args.pageToken) params.pageToken = args.pageToken;
  return ankrRequest('ankr_getLogs', params);
}

export async function getTransactionsByHash(args: z.infer<typeof GetTransactionsByHashSchema>) {
  const params: Record<string, any> = { transactionHash: args.transactionHash };
  if (args.blockchain) params.blockchain = args.blockchain;
  if (args.decodeLogs !== undefined) params.decodeLogs = args.decodeLogs;
  if (args.decodeTxData !== undefined) params.decodeTxData = args.decodeTxData;
  if (args.includeLogs !== undefined) params.includeLogs = args.includeLogs;
  return ankrRequest('ankr_getTransactionsByHash', params);
}

export async function getTransactionsByAddress(args: z.infer<typeof GetTransactionsByAddressSchema>) {
  const params: Record<string, any> = { address: args.address };
  if (args.blockchain) params.blockchain = args.blockchain;
  if (args.fromBlock !== undefined) params.fromBlock = args.fromBlock;
  if (args.toBlock !== undefined) params.toBlock = args.toBlock;
  if (args.fromTimestamp !== undefined) params.fromTimestamp = args.fromTimestamp;
  if (args.toTimestamp !== undefined) params.toTimestamp = args.toTimestamp;
  if (args.includeLogs !== undefined) params.includeLogs = args.includeLogs;
  if (args.descOrder !== undefined) params.descOrder = args.descOrder;
  if (args.pageSize) params.pageSize = args.pageSize;
  if (args.pageToken) params.pageToken = args.pageToken;
  return ankrRequest('ankr_getTransactionsByAddress', params);
}

export async function getInteractions(address: string) {
  return ankrRequest('ankr_getInteractions', { address });
}

export async function getAccountBalanceHistorical(args: z.infer<typeof GetAccountBalanceHistoricalSchema>) {
  const params: Record<string, any> = { walletAddress: args.walletAddress };
  if (args.blockHeight !== undefined) params.blockHeight = args.blockHeight;
  if (args.blockchain) params.blockchain = args.blockchain;
  if (args.onlyWhitelisted !== undefined) params.onlyWhitelisted = args.onlyWhitelisted;
  if (args.pageSize) params.pageSize = args.pageSize;
  if (args.pageToken) params.pageToken = args.pageToken;
  return ankrRequest('ankr_getAccountBalanceHistorical', params);
}

export async function getInternalTransactionsByBlockNumber(args: z.infer<typeof GetInternalTransactionsByBlockNumberSchema>) {
  const params: Record<string, any> = { blockchain: args.blockchain };
  if (args.blockNumber !== undefined) params.blockNumber = args.blockNumber;
  if (args.onlyWithValue !== undefined) params.onlyWithValue = args.onlyWithValue;
  return ankrRequest('ankr_getInternalTransactionsByBlockNumber', params);
}

export async function getInternalTransactionsByParentHash(args: z.infer<typeof GetInternalTransactionsByParentHashSchema>) {
  const params: Record<string, any> = {
    blockchain: args.blockchain,
    parentTransactionHash: args.parentTransactionHash
  };
  if (args.onlyWithValue !== undefined) params.onlyWithValue = args.onlyWithValue;
  return ankrRequest('ankr_getInternalTransactionsByParentHash', params);
}
