'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { chartApi } from '@/lib/api';
import { ChartData } from '@/types';

export default function ChartPage() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await chartApi.getData();
        setData(result);
        setError(null);
      } catch (err) {
        setError('グラフデータの取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-800">グラフ</h1>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="bg-white rounded-lg p-6 text-center text-gray-500">
            読み込み中...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            {error}
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center text-gray-500">
            グラフデータがありません
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => `¥${value.toLocaleString('ja-JP')}`} />
                <Legend />
                <Bar dataKey="income" fill="#1976D2" name="収入" />
                <Bar dataKey="expense" fill="#E53935" name="支出" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/"
            className="inline-block bg-gray-600 text-white py-2 px-4 rounded font-medium hover:bg-gray-700 transition"
          >
            ← 戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
