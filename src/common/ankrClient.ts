import axios from 'axios';
import {
  AnkrAuthenticationError,
  AnkrValidationError,
  AnkrResourceNotFoundError,
  AnkrRateLimitError
} from './ankrErrors';

function getEndpoint(): string {
  const token = process.env.ANKR_API_TOKEN;
  if (!token) {
    throw new AnkrAuthenticationError('ANKR_API_TOKEN environment variable is not set');
  }
  return `https://rpc.ankr.com/multichain/${token}`;
}

export async function ankrRequest(method: string, params: Record<string, any>): Promise<any> {
  const endpoint = getEndpoint();

  try {
    const response = await axios.post(
      endpoint,
      {
        jsonrpc: "2.0",
        method,
        params,
        id: 1
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (response.data.error) {
      throw new Error(`Ankr RPC Error: ${response.data.error.message || JSON.stringify(response.data.error)}`);
    }

    return response.data.result;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 'unknown';
      const errorMessage = error.response?.data?.message || error.message;

      if (statusCode === 401 || statusCode === 403) {
        throw new AnkrAuthenticationError(`Authentication Failed: ${errorMessage}`);
      } else if (statusCode === 404) {
        throw new AnkrResourceNotFoundError(`Not found: ${errorMessage}`);
      } else if (statusCode === 422) {
        throw new AnkrValidationError(`Validation Error: ${errorMessage}`, error.response?.data);
      } else if (statusCode === 429) {
        const resetAt = new Date();
        resetAt.setSeconds(resetAt.getSeconds() + 60);
        throw new AnkrRateLimitError(`Rate Limit Exceeded: ${errorMessage}`, resetAt);
      }

      throw new Error(`Ankr API Error (${statusCode}): ${errorMessage}`);
    }
    throw error;
  }
}
