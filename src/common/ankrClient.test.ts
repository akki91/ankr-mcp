import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { ankrRequest } from './ankrClient';
import {
  AnkrAuthenticationError,
  AnkrValidationError,
  AnkrResourceNotFoundError,
  AnkrRateLimitError,
} from './ankrErrors';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

beforeEach(() => {
  vi.resetAllMocks();
  process.env.ANKR_API_TOKEN = 'test-token';
});

describe('ankrRequest', () => {
  it('makes a JSON-RPC POST request to the correct endpoint', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { result: { foo: 'bar' } }
    });

    const result = await ankrRequest('ankr_testMethod', { key: 'value' });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://rpc.ankr.com/multichain/test-token',
      {
        jsonrpc: '2.0',
        method: 'ankr_testMethod',
        params: { key: 'value' },
        id: 1
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    expect(result).toEqual({ foo: 'bar' });
  });

  it('throws AnkrAuthenticationError when ANKR_API_TOKEN is missing', async () => {
    delete process.env.ANKR_API_TOKEN;

    await expect(ankrRequest('ankr_test', {})).rejects.toThrow(AnkrAuthenticationError);
    await expect(ankrRequest('ankr_test', {})).rejects.toThrow('ANKR_API_TOKEN');
  });

  it('throws on JSON-RPC error response', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { error: { message: 'Invalid params' } }
    });

    await expect(ankrRequest('ankr_test', {})).rejects.toThrow('Invalid params');
  });

  it('throws AnkrAuthenticationError on 401', async () => {
    const axiosError = {
      isAxiosError: true,
      response: { status: 401, data: { message: 'Unauthorized' } },
      message: 'Request failed'
    };
    mockedAxios.post.mockRejectedValue(axiosError);
    mockedAxios.isAxiosError.mockReturnValue(true);

    await expect(ankrRequest('ankr_test', {})).rejects.toThrow(AnkrAuthenticationError);
  });

  it('throws AnkrAuthenticationError on 403', async () => {
    const axiosError = {
      isAxiosError: true,
      response: { status: 403, data: { message: 'Forbidden' } },
      message: 'Request failed'
    };
    mockedAxios.post.mockRejectedValue(axiosError);
    mockedAxios.isAxiosError.mockReturnValue(true);

    await expect(ankrRequest('ankr_test', {})).rejects.toThrow(AnkrAuthenticationError);
  });

  it('throws AnkrResourceNotFoundError on 404', async () => {
    const axiosError = {
      isAxiosError: true,
      response: { status: 404, data: { message: 'Not found' } },
      message: 'Request failed'
    };
    mockedAxios.post.mockRejectedValue(axiosError);
    mockedAxios.isAxiosError.mockReturnValue(true);

    await expect(ankrRequest('ankr_test', {})).rejects.toThrow(AnkrResourceNotFoundError);
  });

  it('throws AnkrValidationError on 422', async () => {
    const axiosError = {
      isAxiosError: true,
      response: { status: 422, data: { message: 'Invalid input', details: {} } },
      message: 'Request failed'
    };
    mockedAxios.post.mockRejectedValue(axiosError);
    mockedAxios.isAxiosError.mockReturnValue(true);

    await expect(ankrRequest('ankr_test', {})).rejects.toThrow(AnkrValidationError);
  });

  it('throws AnkrRateLimitError on 429', async () => {
    const axiosError = {
      isAxiosError: true,
      response: { status: 429, data: { message: 'Too many requests' } },
      message: 'Request failed'
    };
    mockedAxios.post.mockRejectedValue(axiosError);
    mockedAxios.isAxiosError.mockReturnValue(true);

    await expect(ankrRequest('ankr_test', {})).rejects.toThrow(AnkrRateLimitError);
  });

  it('throws generic error on other status codes', async () => {
    const axiosError = {
      isAxiosError: true,
      response: { status: 500, data: { message: 'Internal server error' } },
      message: 'Request failed'
    };
    mockedAxios.post.mockRejectedValue(axiosError);
    mockedAxios.isAxiosError.mockReturnValue(true);

    await expect(ankrRequest('ankr_test', {})).rejects.toThrow('Ankr API Error (500)');
  });

  it('re-throws non-axios errors', async () => {
    mockedAxios.post.mockRejectedValue(new TypeError('Network error'));
    mockedAxios.isAxiosError.mockReturnValue(false);

    await expect(ankrRequest('ankr_test', {})).rejects.toThrow(TypeError);
  });
});
