'use client';

import { Transaction } from '@/types';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onTransactionClick: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  loading,
  onTransactionClick,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 h-96 flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
      <div className="h-96 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            この月のデータはありません
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => onTransactionClick(tx)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">
                    {format(parseISO(tx.date), 'yyyy/MM/dd(eee)', {
                      locale: ja,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tx.icon}</span>
                    <span className="text-gray-700 font-medium">
                      {tx.category}
                    </span>
                    {tx.memo && (
                      <span className="text-sm text-gray-500">
                        ({tx.memo})
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-bold ${
                      tx.type === 'income' ? 'text-blue-600' : 'text-red-600'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}¥
                    {tx.amount.toLocaleString('ja-JP')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
