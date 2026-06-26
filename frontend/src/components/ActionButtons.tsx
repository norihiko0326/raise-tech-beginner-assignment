'use client';

import Link from 'next/link';

interface ActionButtonsProps {
  onNewTransaction: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onNewTransaction,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Link
        href="/chart"
        className="bg-blue-600 text-white py-3 px-2 rounded font-medium hover:bg-blue-700 transition text-center text-sm"
      >
        📊 グラフ
      </Link>
      <button
        onClick={onNewTransaction}
        className="bg-green-600 text-white py-3 px-2 rounded font-medium hover:bg-green-700 transition text-sm"
      >
        ➕ 新規記録
      </button>
      <Link
        href="/categories"
        className="bg-purple-600 text-white py-3 px-2 rounded font-medium hover:bg-purple-700 transition text-center text-sm"
      >
        🔧 カテゴリ
      </Link>
    </div>
  );
};
