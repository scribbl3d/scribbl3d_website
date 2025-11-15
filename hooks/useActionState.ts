import { useState, useCallback } from "react";

type ActionState<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
};

export function useActionState<T>() {
  const [state, setState] = useState<ActionState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const setData = useCallback((data: T) => {
    setState({ data, error: null, isLoading: false });
  }, []);

  const setError = useCallback((error: string) => {
    setState({ data: null, error, isLoading: false });
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  return { ...state, setData, setError, setLoading };
}
