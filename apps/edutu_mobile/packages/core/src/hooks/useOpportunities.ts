import { useCallback, useEffect, useMemo, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { fetchOpportunities } from '../services/opportunities';
import { Opportunity } from '../types/opportunity';

interface UseOpportunitiesOptions {
  supabase: SupabaseClient;
  userId?: string;
  onSyncSnapshot?: (opportunities: Opportunity[]) => Promise<void>;
  onUpdateN8n?: (opportunities: Opportunity[], userId: string) => Promise<void>;
}

interface UseOpportunitiesState {
  data: Opportunity[];
  loading: boolean;
  error: string | null;
}

export function useOpportunities(options: UseOpportunitiesOptions) {
  const { supabase, userId, onSyncSnapshot, onUpdateN8n } = options;
  const [{ data, loading, error }, setState] = useState<UseOpportunitiesState>({
    data: [],
    loading: true,
    error: null
  });
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let isActive = true;

    setState((prev) => ({
      ...prev,
      loading: true,
      error: refreshIndex === 0 ? null : prev.error
    }));

    fetchOpportunities({ 
      supabase, 
      force: refreshIndex > 0,
      userId,
      onSyncSnapshot,
      onUpdateN8n
    })
      .then((opportunities) => {
        if (!isActive) {
          return;
        }

        setState({
          data: opportunities,
          loading: false,
          error: null
        });
      })
      .catch((err: unknown) => {
        if (!isActive) {
          return;
        }

        const message =
          err instanceof Error ? err.message : 'Unable to load opportunities';

        setState((prev) => ({
          ...prev,
          loading: false,
          error: message
        }));
      });

    return () => {
      isActive = false;
    };
  }, [refreshIndex, supabase, userId, onSyncSnapshot, onUpdateN8n]);

  const refresh = useCallback(() => {
    setRefreshIndex((value) => value + 1);
  }, []);

  return useMemo(
    () => ({
      data,
      loading,
      error,
      refresh
    }),
    [data, error, loading, refresh]
  );
}
