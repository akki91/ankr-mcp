import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getBlockchainStats,
  getBlocks,
  getLogs,
  getTransactionsByHash,
  getTransactionsByAddress,
  getInteractions,
  getAccountBalanceHistorical,
  getInternalTransactionsByBlockNumber,
  getInternalTransactionsByParentHash,
  GetBlockchainStatsSchema,
  GetBlocksSchema,
  GetLogsSchema,
  GetTransactionsByHashSchema,
  GetTransactionsByAddressSchema,
  GetInteractionsSchema,
  GetAccountBalanceHistoricalSchema,
  GetInternalTransactionsByBlockNumberSchema,
  GetInternalTransactionsByParentHashSchema,
} from './query';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

beforeEach(() => {
  vi.resetAllMocks();
  process.env.ANKR_API_TOKEN = 'test-token';
});

describe('Query Schemas', () => {
  it('validates GetBlockchainStatsSchema with optional blockchain', () => {
    const empty = GetBlockchainStatsSchema.parse({});
    expect(empty.blockchain).toBeUndefined();

    const withChains = GetBlockchainStatsSchema.parse({ blockchain: ['eth', 'bsc'] });
    expect(withChains.blockchain).toEqual(['eth', 'bsc']);
  });

  it('validates GetBlocksSchema', () => {
    const valid = GetBlocksSchema.parse({
      blockchain: 'eth',
      fromBlock: 1000,
      toBlock: 1010,
      includeTxs: true
    });
    expect(valid.blockchain).toBe('eth');
    expect(valid.includeTxs).toBe(true);
  });

  it('validates GetLogsSchema', () => {
    const valid = GetLogsSchema.parse({
      blockchain: ['eth'],
      address: ['0xabc'],
      topics: [['0xtopic1']],
      decodeLogs: true
    });
    expect(valid.topics).toEqual([['0xtopic1']]);
  });

  it('validates GetTransactionsByHashSchema', () => {
    const valid = GetTransactionsByHashSchema.parse({
      transactionHash: '0xabcdef1234567890'
    });
    expect(valid.transactionHash).toBe('0xabcdef1234567890');
  });

  it('validates GetTransactionsByAddressSchema', () => {
    const valid = GetTransactionsByAddressSchema.parse({
      address: '0x123',
      blockchain: ['eth'],
      pageSize: 100
    });
    expect(valid.pageSize).toBe(100);
  });

  it('validates GetInteractionsSchema', () => {
    const valid = GetInteractionsSchema.parse({ address: '0x123' });
    expect(valid.address).toBe('0x123');
  });

  it('validates GetAccountBalanceHistoricalSchema', () => {
    const valid = GetAccountBalanceHistoricalSchema.parse({
      walletAddress: '0x123',
      blockHeight: 15000000
    });
    expect(valid.blockHeight).toBe(15000000);
  });

  it('validates GetInternalTransactionsByBlockNumberSchema', () => {
    const valid = GetInternalTransactionsByBlockNumberSchema.parse({
      blockchain: 'eth',
      blockNumber: 15000000,
      onlyWithValue: true
    });
    expect(valid.onlyWithValue).toBe(true);
  });

  it('validates GetInternalTransactionsByParentHashSchema', () => {
    const valid = GetInternalTransactionsByParentHashSchema.parse({
      blockchain: 'eth',
      parentTransactionHash: '0xhash123'
    });
    expect(valid.parentTransactionHash).toBe('0xhash123');
  });
});

describe('getBlockchainStats', () => {
  it('calls ankr_getBlockchainStats for all chains', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { stats: [{ blockchain: 'eth', totalTransactionsCount: 1000000 }] } }
    });

    const result = await getBlockchainStats();

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://rpc.ankr.com/multichain/test-token',
      { jsonrpc: '2.0', method: 'ankr_getBlockchainStats', params: {}, id: 1 },
      { headers: { 'Content-Type': 'application/json' } }
    );
    expect(result.stats[0].blockchain).toBe('eth');
  });

  it('calls with specific blockchains', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { stats: [] } }
    });

    await getBlockchainStats(['eth', 'bsc']);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ params: { blockchain: ['eth', 'bsc'] } }),
      expect.any(Object)
    );
  });
});

describe('getBlocks', () => {
  it('calls ankr_getBlocks with full params', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { blocks: [{ number: 1000, hash: '0xblock' }] } }
    });

    const result = await getBlocks({
      blockchain: 'eth',
      fromBlock: 1000,
      toBlock: 1000,
      includeTxs: true,
      includeLogs: false,
      decodeLogs: true,
      decodeTxData: true,
      descOrder: false
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'ankr_getBlocks',
        params: {
          blockchain: 'eth',
          fromBlock: 1000,
          toBlock: 1000,
          includeTxs: true,
          includeLogs: false,
          decodeLogs: true,
          decodeTxData: true,
          descOrder: false
        }
      }),
      expect.any(Object)
    );
    expect(result.blocks[0].number).toBe(1000);
  });
});

describe('getLogs', () => {
  it('calls ankr_getLogs', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { logs: [{ address: '0xcontract', data: '0x' }] } }
    });

    const result = await getLogs({
      blockchain: ['eth'],
      address: ['0xcontract'],
      fromBlock: 1000,
      toBlock: 2000,
      decodeLogs: true
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'ankr_getLogs' }),
      expect.any(Object)
    );
    expect(result.logs[0].address).toBe('0xcontract');
  });
});

describe('getTransactionsByHash', () => {
  it('calls ankr_getTransactionsByHash', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        result: {
          transactions: [{
            hash: '0xhash',
            from: '0xsender',
            to: '0xreceiver',
            value: '1000000000000000000'
          }]
        }
      }
    });

    const result = await getTransactionsByHash({
      transactionHash: '0xhash',
      decodeTxData: true,
      includeLogs: true
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'ankr_getTransactionsByHash',
        params: { transactionHash: '0xhash', decodeTxData: true, includeLogs: true }
      }),
      expect.any(Object)
    );
    expect(result.transactions[0].from).toBe('0xsender');
  });
});

describe('getTransactionsByAddress', () => {
  it('calls ankr_getTransactionsByAddress', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { transactions: [], nextPageToken: '' } }
    });

    const result = await getTransactionsByAddress({
      address: '0x123',
      blockchain: ['eth'],
      descOrder: true,
      pageSize: 50
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'ankr_getTransactionsByAddress',
        params: { address: '0x123', blockchain: ['eth'], descOrder: true, pageSize: 50 }
      }),
      expect.any(Object)
    );
    expect(result.transactions).toEqual([]);
  });
});

describe('getInteractions', () => {
  it('calls ankr_getInteractions', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { blockchains: ['eth', 'polygon', 'bsc'] } }
    });

    const result = await getInteractions('0x123');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'ankr_getInteractions',
        params: { address: '0x123' }
      }),
      expect.any(Object)
    );
    expect(result.blockchains).toContain('polygon');
  });
});

describe('getAccountBalanceHistorical', () => {
  it('calls ankr_getAccountBalanceHistorical', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { assets: [], totalBalanceUsd: '5000.00' } }
    });

    const result = await getAccountBalanceHistorical({
      walletAddress: '0x123',
      blockHeight: 15000000,
      blockchain: ['eth']
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'ankr_getAccountBalanceHistorical',
        params: { walletAddress: '0x123', blockHeight: 15000000, blockchain: ['eth'] }
      }),
      expect.any(Object)
    );
    expect(result.totalBalanceUsd).toBe('5000.00');
  });
});

describe('getInternalTransactionsByBlockNumber', () => {
  it('calls ankr_getInternalTransactionsByBlockNumber', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { internalTransactions: [{ from: '0xa', to: '0xb', value: '100' }] } }
    });

    const result = await getInternalTransactionsByBlockNumber({
      blockchain: 'eth',
      blockNumber: 15000000,
      onlyWithValue: true
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'ankr_getInternalTransactionsByBlockNumber',
        params: { blockchain: 'eth', blockNumber: 15000000, onlyWithValue: true }
      }),
      expect.any(Object)
    );
    expect(result.internalTransactions[0].from).toBe('0xa');
  });
});

describe('getInternalTransactionsByParentHash', () => {
  it('calls ankr_getInternalTransactionsByParentHash', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { internalTransactions: [] } }
    });

    const result = await getInternalTransactionsByParentHash({
      blockchain: 'eth',
      parentTransactionHash: '0xparent',
      onlyWithValue: false
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'ankr_getInternalTransactionsByParentHash',
        params: { blockchain: 'eth', parentTransactionHash: '0xparent', onlyWithValue: false }
      }),
      expect.any(Object)
    );
    expect(result.internalTransactions).toEqual([]);
  });
});
