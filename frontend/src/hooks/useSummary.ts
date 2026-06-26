'use client';

import { useState, useEffect } from 'react';
import { Summary } from '@/types';
import { summaryApi } from '@/lib/api';

export const useSummary = (yearMonth: string) => {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const result = await summaryApi.get(yearMonth);
      setData(result);
      setError(null);
    } catch (err) {
      setError('サマリー取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [yearMonth]);

  return { data, loading, error, refetch: fetch };
};
