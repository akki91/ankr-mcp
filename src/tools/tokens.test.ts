import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getTokenBalancesOnNetwork,
  getCurrencies,
  getTokenPrice,
  getTokenHolders,
  getTokenHoldersCount,
  getTokenTransfers,
  getTokenPriceHistory,
  explainTokenPrice,
  TokenBalancesOnNetworkSchema,
  GetCurrenciesSchema,
  GetTokenPriceSchema,
  GetTokenHoldersSchema,
  GetTokenHoldersCountSchema,
  GetTokenTransfersSchema,
  GetTokenPriceHistorySchema,
  ExplainTokenPriceSchema,
} from './tokens';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

beforeEach(() => {
  vi.resetAllMocks();
  process.env.ANKR_API_TOKEN = 'test-token';
});

describe('Token Schemas', () => {
  it('validates TokenBalancesOnNetworkSchema', () => {
    const valid = TokenBalancesOnNetworkSchema.parse({ network: 'eth', address: '0x123' });
    expect(valid.network).toBe('eth');
    expect(valid.address).toBe('0x123');
  });

  it('rejects invalid TokenBalancesOnNetworkSchema', () => {
    expect(() => TokenBalancesOnNetworkSchema.parse({ network: 123 })).toThrow();
  });

  it('validates GetCurrenciesSchema', () => {
    const valid = GetCurrenciesSchema.parse({ blockchain: 'eth' });
    expect(valid.blockchain).toBe('eth');
  });

  it('validates GetTokenPriceSchema with optional contractAddress', () => {
    const withContract = GetTokenPriceSchema.parse({ blockchain: 'eth', contractAddress: '0xabc' });
    expect(withContract.contractAddress).toBe('0xabc');

    const withoutContract = GetTokenPriceSchema.parse({ blockchain: 'eth' });
    expect(withoutContract.contractAddress).toBeUndefined();
  });

  it('validates GetTokenHoldersSchema', () => {
    const valid = GetTokenHoldersSchema.parse({ blockchain: 'eth', contractAddress: '0xabc' });
    expect(valid.blockchain).toBe('eth');
  });

  it('validates GetTokenTransfersSchema', () => {
    const valid = GetTokenTransfersSchema.parse({ address: ['0x123', '0x456'] });
    expect(valid.address).toHaveLength(2);
  });

  it('validates GetTokenPriceHistorySchema', () => {
    const valid = GetTokenPriceHistorySchema.parse({
      blockchain: 'eth',
      fromTimestamp: 1000000,
      toTimestamp: 2000000
    });
    expect(valid.fromTimestamp).toBe(1000000);
  });

  it('validates ExplainTokenPriceSchema', () => {
    const valid = ExplainTokenPriceSchema.parse({ blockchain: 'eth', tokenAddress: '0xabc' });
    expect(valid.tokenAddress).toBe('0xabc');
  });
});

describe('getTokenBalancesOnNetwork', () => {
  it('calls ankr_getAccountBalance with correct params', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { assets: [], totalBalanceUsd: '0' } }
    });

    const result = await getTokenBalancesOnNetwork('eth', '0x123');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://rpc.ankr.com/multichain/test-token',
      {
        jsonrpc: '2.0',
        method: 'ankr_getAccountBalance',
        params: { blockchain: 'eth', walletAddress: '0x123' },
        id: 1
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    expect(result).toEqual({ assets: [], totalBalanceUsd: '0' });
  });

  it('throws when ANKR_API_TOKEN is not set', async () => {
    delete process.env.ANKR_API_TOKEN;
    await expect(getTokenBalancesOnNetwork('eth', '0x123')).rejects.toThrow('ANKR_API_TOKEN');
  });
});

describe('getCurrencies', () => {
  it('calls ankr_getCurrencies with correct params', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { currencies: ['ETH', 'USDC'] } }
    });

    const result = await getCurrencies('eth');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'ankr_getCurrencies', params: { blockchain: 'eth' } }),
      expect.any(Object)
    );
    expect(result).toEqual({ currencies: ['ETH', 'USDC'] });
  });
});

describe('getTokenPrice', () => {
  it('calls ankr_getTokenPrice for native coin', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { usdPrice: '3000.50' } }
    });

    const result = await getTokenPrice('eth');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'ankr_getTokenPrice', params: { blockchain: 'eth' } }),
      expect.any(Object)
    );
    expect(result.usdPrice).toBe('3000.50');
  });

  it('calls ankr_getTokenPrice with contractAddress', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { usdPrice: '1.00' } }
    });

    await getTokenPrice('eth', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: { blockchain: 'eth', contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' }
      }),
      expect.any(Object)
    );
  });
});

describe('getTokenHolders', () => {
  it('calls ankr_getTokenHolders with pagination', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { holders: ['0xaaa', '0xbbb'], nextPageToken: 'abc' } }
    });

    const result = await getTokenHolders('eth', '0xcontract', 100, 'page1');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: { blockchain: 'eth', contractAddress: '0xcontract', pageSize: 100, pageToken: 'page1' }
      }),
      expect.any(Object)
    );
    expect(result.holders).toHaveLength(2);
  });
});

describe('getTokenHoldersCount', () => {
  it('calls ankr_getTokenHoldersCount', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { holderCountHistory: [{ holderCount: 1000, totalAmount: '500000' }] } }
    });

    const result = await getTokenHoldersCount('eth', '0xcontract');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'ankr_getTokenHoldersCount' }),
      expect.any(Object)
    );
    expect(result.holderCountHistory[0].holderCount).toBe(1000);
  });
});

describe('getTokenTransfers', () => {
  it('calls ankr_getTokenTransfers with all params', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { transfers: [] } }
    });

    const result = await getTokenTransfers({
      address: ['0x123'],
      blockchain: ['eth'],
      fromTimestamp: 1000,
      toTimestamp: 2000,
      descOrder: true,
      pageSize: 50
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'ankr_getTokenTransfers',
        params: {
          address: ['0x123'],
          blockchain: ['eth'],
          fromTimestamp: 1000,
          toTimestamp: 2000,
          descOrder: true,
          pageSize: 50
        }
      }),
      expect.any(Object)
    );
    expect(result).toEqual({ transfers: [] });
  });
});

describe('getTokenPriceHistory', () => {
  it('calls ankr_getTokenPriceHistory', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { quotes: [{ timestamp: 1000, usdPrice: '3000' }] } }
    });

    const result = await getTokenPriceHistory({
      blockchain: 'eth',
      fromTimestamp: 1000,
      toTimestamp: 2000,
      interval: 3600
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'ankr_getTokenPriceHistory' }),
      expect.any(Object)
    );
    expect(result.quotes).toHaveLength(1);
  });
});

describe('explainTokenPrice', () => {
  it('calls ankr_explainTokenPrice', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { pairs: [], priceUsd: '1.00' } }
    });

    const result = await explainTokenPrice({ blockchain: 'eth', tokenAddress: '0xabc' });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'ankr_explainTokenPrice',
        params: { blockchain: 'eth', tokenAddress: '0xabc' }
      }),
      expect.any(Object)
    );
    expect(result.priceUsd).toBe('1.00');
  });
});
