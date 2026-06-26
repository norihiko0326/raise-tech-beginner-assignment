'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/types';
import { categoriesApi } from '@/lib/api';

export const useCategories = () => {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const result = await categoriesApi.getList();
      setData(result);
      setError(null);
    } catch (err) {
      setError('カテゴリ取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { data, loading, error, refetch: fetch };
};
