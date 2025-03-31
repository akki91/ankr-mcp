import { z } from 'zod';
import axios from 'axios';
import {
  AnkrValidationError,
  AnkrResourceNotFoundError,
  AnkrAuthenticationError,
  AnkrRateLimitError
} from '../common/ankrErrors'





type Asset = {
  amount: number;
  network: string;
  token: {
    network: string;
    logo: string;
    name: string;
    symbol: string;
    address: string;
    decimals: number;
    totalSupply: number;
    underlyingTokens: any[];
    verified: boolean;
    type: string;
  };
  price: number;
  decimalAmount: number;
  dollarValue: number;
};

type AssetsResponse = Promise<{
  assets: Asset[];
  totalDollarValue: number;
}>;

// Schema for token balances on network request
export const TokenBalancesOnNetworkSchema = z.object({
  network: z.string().describe('The blockchain network (e.g., "ethereum", "base")'),
  address: z.string().describe('The address to check token balances for')
});




/**
 * Fetches all token balances for a given address on a specific network.
 * 
 * @param network - The blockchain network (e.g., "base", "ethereum") 
 * @param address - The address to check token balances for
 * @returns An object containing token balances and total dollar value
 */
export async function getTokenBalancesOnNetwork(
  network: string,
  address: string
): AssetsResponse {

  const token = process.env.ANKR_API_TOKEN
  const endpoint = `https://rpc.ankr.com/multichain/${token}`;
 // console.log(JSON.stringify(endpoint));

  if (!token) {
    throw new AnkrAuthenticationError('ANKR_API_TOKEN environment variable is not set');
  }



  try {

    const data = {
      jsonrpc: "2.0",
      method: "ankr_getAccountBalance",
      params: {
        blockchain: network,
        walletAddress: address
      },
      id: 1
    };

    const response = await axios.post(
      endpoint,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },

      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 'unknown';
      const errorMessage = error.response?.data?.message || error.message;
      if (statusCode === 401 || statusCode === 403) {
        throw new AnkrAuthenticationError(`Authentication Failed: ${errorMessage}`);
      } else if (statusCode === 404) {
        throw new AnkrResourceNotFoundError(`Address or network not found: ${address} on ${network}`);
      } else if (statusCode === 422) {
        throw new AnkrValidationError(`Validation Error: ${errorMessage}`, error.response?.data);
      } else if (statusCode === 429) {
        const resetAt = new Date();
        resetAt.setSeconds(resetAt.getSeconds() + 60);
        throw new AnkrRateLimitError(`Rate Limit Exceeded: ${errorMessage}`, resetAt);
      }
      
      throw new Error(`Ankr API Error (${statusCode}): ${errorMessage}`);
    }
    throw new Error(`Failed to get token balances: ${error instanceof Error ? error.message : String(error)}`);
  }
}
