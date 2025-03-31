/**
 * Base Ankr error class
 */
export class AnkrError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnkrError';
  }
}

/**
 * Error for invalid inputs
 */
export class AnkrValidationError extends AnkrError {
  response?: any;
  
  constructor(message: string, response?: any) {
    super(message);
    this.name = 'AnkrValidationError';
    this.response = response;
  }
}

/**
 * Error for authentication failures
 */
export class AnkrAuthenticationError extends AnkrError {
  constructor(message: string) {
    super(message);
    this.name = 'AnkrAuthenticationError';
  }
}

/**
 * Error for rate limit issues
 */
export class AnkrRateLimitError extends AnkrError {
  resetAt: Date;
  
  constructor(message: string, resetAt: Date) {
    super(message);
    this.name = 'AnkrRateLimitError';
    this.resetAt = resetAt;
  }
}

/**
 * Error for resource not found
 */
export class AnkrResourceNotFoundError extends AnkrError {
  constructor(message: string) {
    super(message);
    this.name = 'AnkrResourceNotFoundError';
  }
}

export function isAnkrError(error: any): error is AnkrError {
  return error instanceof AnkrError;
}
