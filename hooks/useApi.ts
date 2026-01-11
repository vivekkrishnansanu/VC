/**
 * Custom React Hooks
 * 
 * Reusable hooks for common functionality.
 */

import { useState, useCallback } from 'react';
import { ApiResponse } from '@/types';

// ============================================================================
// API Hook
// ============================================================================

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useApi<T = any>(options?: UseApiOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (
    url: string,
    requestOptions?: RequestInit
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...requestOptions,
        headers: {
          'Content-Type': 'application/json',
          ...requestOptions?.headers,
        },
      });

      const result: ApiResponse<T> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Request failed');
      }

      setData(result.data || null);
      options?.onSuccess?.(result.data);
      return result.data || null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options?.onError?.(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return { execute, loading, error, data, setData };
}
