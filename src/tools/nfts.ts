import { z } from 'zod';
import { ankrRequest } from '../common/ankrClient';

// Schemas

export const GetNFTsByOwnerSchema = z.object({
  walletAddress: z.string().describe('Wallet address or ENS name to get NFTs for'),
  blockchain: z.array(z.string()).optional().describe('Blockchain(s) to query (e.g., ["eth", "polygon"])'),
  pageSize: z.number().optional().describe('Number of results per page (default 10, max 50)'),
  pageToken: z.string().optional().describe('Pagination token for next page'),
  filter: z.array(z.object({
    contractAddress: z.string().optional(),
    tokenId: z.string().optional()
  })).optional().describe('Filter by contract address and/or token ID')
});

export const GetNFTMetadataSchema = z.object({
  blockchain: z.string().describe('The blockchain network (e.g., "eth", "polygon")'),
  contractAddress: z.string().describe('NFT contract address'),
  tokenId: z.string().describe('Specific NFT token ID'),
  forceFetch: z.boolean().optional().describe('Force fetch from contract instead of database')
});

export const GetNFTHoldersSchema = z.object({
  blockchain: z.string().describe('The blockchain network'),
  contractAddress: z.string().describe('NFT collection contract address'),
  pageSize: z.number().optional().describe('Number of results per page (max 10000)'),
  pageToken: z.string().optional().describe('Pagination token for next page')
});

export const GetNFTTransfersSchema = z.object({
  address: z.array(z.string()).describe('One or more wallet addresses'),
  blockchain: z.array(z.string()).optional().describe('Blockchain(s) to query'),
  fromBlock: z.union([z.number(), z.string()]).optional().describe('Starting block number'),
  toBlock: z.union([z.number(), z.string()]).optional().describe('Ending block number'),
  fromTimestamp: z.number().optional().describe('UNIX start timestamp'),
  toTimestamp: z.number().optional().describe('UNIX end timestamp'),
  descOrder: z.boolean().optional().describe('Sort in descending order'),
  pageSize: z.number().optional().describe('Number of results per page (max 10000)'),
  pageToken: z.string().optional().describe('Pagination token for next page')
});

// Functions

export async function getNFTsByOwner(args: z.infer<typeof GetNFTsByOwnerSchema>) {
  const params: Record<string, any> = { walletAddress: args.walletAddress };
  if (args.blockchain) params.blockchain = args.blockchain;
  if (args.pageSize) params.pageSize = args.pageSize;
  if (args.pageToken) params.pageToken = args.pageToken;
  if (args.filter) params.filter = args.filter;
  return ankrRequest('ankr_getNFTsByOwner', params);
}

export async function getNFTMetadata(args: z.infer<typeof GetNFTMetadataSchema>) {
  const params: Record<string, any> = {
    blockchain: args.blockchain,
    contractAddress: args.contractAddress,
    tokenId: args.tokenId
  };
  if (args.forceFetch !== undefined) params.forceFetch = args.forceFetch;
  return ankrRequest('ankr_getNFTMetadata', params);
}

export async function getNFTHolders(
  blockchain: string,
  contractAddress: string,
  pageSize?: number,
  pageToken?: string
) {
  const params: Record<string, any> = { blockchain, contractAddress };
  if (pageSize) params.pageSize = pageSize;
  if (pageToken) params.pageToken = pageToken;
  return ankrRequest('ankr_getNFTHolders', params);
}

export async function getNFTTransfers(args: z.infer<typeof GetNFTTransfersSchema>) {
  const params: Record<string, any> = { address: args.address };
  if (args.blockchain) params.blockchain = args.blockchain;
  if (args.fromBlock !== undefined) params.fromBlock = args.fromBlock;
  if (args.toBlock !== undefined) params.toBlock = args.toBlock;
  if (args.fromTimestamp !== undefined) params.fromTimestamp = args.fromTimestamp;
  if (args.toTimestamp !== undefined) params.toTimestamp = args.toTimestamp;
  if (args.descOrder !== undefined) params.descOrder = args.descOrder;
  if (args.pageSize) params.pageSize = args.pageSize;
  if (args.pageToken) params.pageToken = args.pageToken;
  return ankrRequest('ankr_getNftTransfers', params);
}
