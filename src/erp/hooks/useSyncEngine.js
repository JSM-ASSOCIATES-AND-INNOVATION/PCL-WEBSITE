import { useState, useEffect } from 'react';

export function useSyncEngine(cacheKey, fetchFunction, dependencies = []) {
    // 1. Instantly load from cache (0ms delay)
    const [data, setData] = useState(() => {
        const cached = localStorage.getItem(`jsmerp_cache_${cacheKey}`);
        return cached ? JSON.parse(cached) : null;
    });

    // Only show the loading spinner if we have NO cached data at all
    const [isLoading, setIsLoading] = useState(!data);
    const [isSyncing, setIsSyncing] = useState(false); // Background sync status
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const syncWithServer = async () => {
            // If we have data, we are just syncing invisibly. If not, we are hard-loading.
            if (data) setIsSyncing(true);
            else setIsLoading(true);

            try {
                // Run the actual Supabase fetch
                const freshData = await fetchFunction();

                if (isMounted) {
                    // Update state and write to browser memory
                    setData(freshData);
                    localStorage.setItem(`jsmerp_cache_${cacheKey}`, JSON.stringify(freshData));
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    console.error(`Sync Engine Error (${cacheKey}):`, err);
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                    setIsSyncing(false);
                }
            }
        };

        syncWithServer();

        return () => { isMounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    return { data, isLoading, isSyncing, error };
}