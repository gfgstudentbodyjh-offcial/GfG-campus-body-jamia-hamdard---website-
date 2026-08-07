import { useState, useRef, useCallback } from 'react';

/**
 * Custom Hook: useAsyncMutation
 * Enforces: IDLE -> PENDING -> SUCCESS/ERROR -> IDLE
 * Guarantees ONE click = ONE API mutation request.
 */
export function useAsyncMutation(asyncFn, options = {}) {
  const [isPending, setIsPending] = useState(false);
  const isLockRef = useRef(false);

  const execute = useCallback(async (...args) => {
    if (isLockRef.current) return null;

    isLockRef.current = true;
    setIsPending(true);

    try {
      const result = await asyncFn(...args);
      if (options.onSuccess) options.onSuccess(result);
      return result;
    } catch (err) {
      if (options.onError) options.onError(err);
      throw err;
    } finally {
      isLockRef.current = false;
      setIsPending(false);
    }
  }, [asyncFn, options]);

  return {
    execute,
    isPending
  };
}
