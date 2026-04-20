import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getNFTsByOwner,
  getNFTMetadata,
  getNFTHolders,
  getNFTTransfers,
  GetNFTsByOwnerSchema,
  GetNFTMetadataSchema,
  GetNFTHoldersSchema,
  GetNFTTransfersSchema,
} from './nfts';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

beforeEach(() => {
  vi.resetAllMocks();
  process.env.ANKR_API_TOKEN = 'test-token';
});

describe('NFT Schemas', () => {
  it('validates GetNFTsByOwnerSchema', () => {
    const valid = GetNFTsByOwnerSchema.parse({ walletAddress: '0x123' });
    expect(valid.walletAddress).toBe('0x123');
  });

  it('validates GetNFTsByOwnerSchema with optional fields', () => {
    const valid = GetNFTsByOwnerSchema.parse({
      walletAddress: '0x123',
      blockchain: ['eth', 'polygon'],
      pageSize: 20
    });
    expect(valid.blockchain).toEqual(['eth', 'polygon']);
    expect(valid.pageSize).toBe(20);
  });

  it('validates GetNFTMetadataSchema', () => {
    const valid = GetNFTMetadataSchema.parse({
      blockchain: 'eth',
      contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
      tokenId: '1234'
    });
    expect(valid.tokenId).toBe('1234');
  });

  it('validates GetNFTHoldersSchema', () => {
    const valid = GetNFTHoldersSchema.parse({
      blockchain: 'eth',
      contractAddress: '0xabc'
    });
    expect(valid.blockchain).toBe('eth');
  });

  it('validates GetNFTTransfersSchema', () => {
    const valid = GetNFTTransfersSchema.parse({
      address: ['0x123'],
      blockchain: ['eth'],
      descOrder: true
    });
    expect(valid.address).toEqual(['0x123']);
    expect(valid.descOrder).toBe(true);
  });
});

describe('getNFTsByOwner', () => {
  it('calls ankr_getNFTsByOwner with correct params', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { assets: [{ name: 'Bored Ape', tokenId: '1' }] } }
    });

    const result = await getNFTsByOwner({ walletAddress: '0x123', blockchain: ['eth'] });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://rpc.ankr.com/multichain/test-token',
      {
        jsonrpc: '2.0',
        method: 'ankr_getNFTsByOwner',
        params: { walletAddress: '0x123', blockchain: ['eth'] },
        id: 1
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    expect(result.assets[0].name).toBe('Bored Ape');
  });

  it('calls without optional params', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { assets: [] } }
    });

    await getNFTsByOwner({ walletAddress: '0x123' });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: { walletAddress: '0x123' }
      }),
      expect.any(Object)
    );
  });
});

describe('getNFTMetadata', () => {
  it('calls ankr_getNFTMetadata', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        result: {
          metadata: {
            name: 'CryptoPunk #1234',
            image: 'https://example.com/image.png',
            attributes: [{ trait_type: 'Background', value: 'Blue' }]
          }
        }
      }
    });

    const result = await getNFTMetadata({
      blockchain: 'eth',
      contractAddress: '0xbc4ca',
      tokenId: '1234'
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'ankr_getNFTMetadata',
        params: { blockchain: 'eth', contractAddress: '0xbc4ca', tokenId: '1234' }
      }),
      expect.any(Object)
    );
    expect(result.metadata.name).toBe('CryptoPunk #1234');
  });

  it('includes forceFetch when provided', async () => {
    mockedAxios.post.mockResolvedValue({ data: { result: {} } });

    await getNFTMetadata({
      blockchain: 'eth',
      contractAddress: '0xabc',
      tokenId: '1',
      forceFetch: true
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: { blockchain: 'eth', contractAddress: '0xabc', tokenId: '1', forceFetch: true }
      }),
      expect.any(Object)
    );
  });
});

describe('getNFTHolders', () => {
  it('calls ankr_getNFTHolders', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { holders: ['0xaaa', '0xbbb', '0xccc'] } }
    });

    const result = await getNFTHolders('eth', '0xbc4ca', 1000);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'ankr_getNFTHolders',
        params: { blockchain: 'eth', contractAddress: '0xbc4ca', pageSize: 1000 }
      }),
      expect.any(Object)
    );
    expect(result.holders).toHaveLength(3);
  });
});

describe('getNFTTransfers', () => {
  it('calls ankr_getNftTransfers with all params', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { transfers: [{ from: '0x1', to: '0x2', tokenId: '5' }] } }
    });

    const result = await getNFTTransfers({
      address: ['0x123'],
      blockchain: ['eth'],
      fromTimestamp: 1000,
      toTimestamp: 2000,
      descOrder: true,
      pageSize: 10
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'ankr_getNftTransfers',
        params: {
          address: ['0x123'],
          blockchain: ['eth'],
          fromTimestamp: 1000,
          toTimestamp: 2000,
          descOrder: true,
          pageSize: 10
        }
      }),
      expect.any(Object)
    );
    expect(result.transfers[0].tokenId).toBe('5');
  });
});
