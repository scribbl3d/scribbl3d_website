"use client";

import { useState, useEffect, useCallback } from 'react';

interface UseFetchOptions {
    skip?: boolean;
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}

export function useFetch<T = any>(url: string | null, options: UseFetchOptions = {}) {
    const { skip = false, onSuccess, onError } = options;
    
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!url || skip) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(url);
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const result = await res.json();
            setData(result);
            onSuccess?.(result);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('An error occurred');
            setError(error);
            onError?.(error);
        } finally {
            setLoading(false);
        }
    }, [url, skip, onSuccess, onError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refetch,
    };
}
