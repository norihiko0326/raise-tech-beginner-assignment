'use client';

import { format, addMonths } from 'date-fns';
import { ja } from 'date-fns/locale';

interface HeaderProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  onPrevMonth,
  onNextMonth,
}) => {
  const monthStr = format(currentMonth, 'yyyy年M月', { locale: ja });

  return (
    <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-800">家計簿</h1>
      <div className="flex items-center gap-4">
        <button
          onClick={onPrevMonth}
          className="px-3 py-1 text-lg font-semibold text-gray-700 hover:bg-gray-100 rounded"
        >
          ◀
        </button>
        <span className="text-lg font-semibold text-gray-800 w-32 text-center">
          {monthStr}
        </span>
        <button
          onClick={onNextMonth}
          className="px-3 py-1 text-lg font-semibold text-gray-700 hover:bg-gray-100 rounded"
        >
          ▶
        </button>
      </div>
    </header>
  );
};
