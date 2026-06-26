'use client';

import { Summary } from '@/types';

interface SummaryBoxProps {
  summary: Summary | null;
  loading: boolean;
}

export const SummaryBox: React.FC<SummaryBoxProps> = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <p className="text-center text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <p className="text-center text-gray-500">データを読み込んでください</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">収入</p>
          <p className="text-2xl font-bold text-blue-600">
            ¥{summary.income.toLocaleString('ja-JP')}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">支出</p>
          <p className="text-2xl font-bold text-red-600">
            ¥{summary.expense.toLocaleString('ja-JP')}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">残高</p>
          <p
            className={`text-2xl font-bold ${
              summary.balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            ¥{summary.balance.toLocaleString('ja-JP')}
          </p>
        </div>
      </div>
    </div>
  );
};
