'use client';

import { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { transactionApi } from '@/lib/api';

export const useTransactions = (month?: string) => {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const result = await transactionApi.getList(month);
      setData(result);
      setError(null);
    } catch (err) {
      setError('データ取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [month]);

  return { data, loading, error, refetch: fetch };
};
