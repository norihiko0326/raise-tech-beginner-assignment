'use client';

import { useState, useEffect } from 'react';
import { Transaction, TransactionInput, Category } from '@/types';

interface TransactionDialogProps {
  isOpen: boolean;
  transaction?: Transaction;
  categories: Category[];
  onSave: (data: TransactionInput) => Promise<void>;
  onClose: () => void;
}

export const TransactionDialog: React.FC<TransactionDialogProps> = ({
  isOpen,
  transaction,
  categories,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<TransactionInput>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    type: 'expense',
    category: categories[0]?.name || '',
    memo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        memo: transaction.memo || '',
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        type: 'expense',
        category: categories[0]?.name || '',
        memo: '',
      });
    }
    setErrors({});
  }, [transaction, categories, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.date) newErrors.date = '日付は必須です';
    if (formData.amount < 1 || formData.amount > 9999999)
      newErrors.amount = '1～9,999,999円で入力してください';
    if (!formData.category) newErrors.category = 'カテゴリは必須です';
    if (formData.memo && formData.memo.length > 255)
      newErrors.memo = '255文字以内で入力してください';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setErrors({ submit: '保存に失敗しました' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {transaction ? '記録を編集' : '新しく記録'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-2xl font-bold text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              日付 *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              disabled={isSaving}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              金額 *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: +e.target.value })
              }
              disabled={isSaving}
              className="w-full border border-gray-300 rounded px-3 py-2"
              min="1"
              max="9999999"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              種類 *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) =>
                    setFormData({ ...formData, type: 'expense' })
                  }
                  disabled={isSaving}
                  className="mr-2"
                />
                <span className="text-gray-700">支出</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) =>
                    setFormData({ ...formData, type: 'income' })
                  }
                  disabled={isSaving}
                  className="mr-2"
                />
                <span className="text-gray-700">収入</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              カテゴリ *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              disabled={isSaving || categories.length === 0}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              メモ（任意）
            </label>
            <textarea
              value={formData.memo}
              onChange={(e) =>
                setFormData({ ...formData, memo: e.target.value })
              }
              disabled={isSaving}
              className="w-full border border-gray-300 rounded px-3 py-2 h-20 resize-none"
              maxLength={255}
            />
            {errors.memo && (
              <p className="text-red-500 text-sm mt-1">{errors.memo}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {formData.memo.length} / 255
            </p>
          </div>

          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {errors.submit}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 bg-gray-300 text-black py-2 rounded font-medium hover:bg-gray-400 transition disabled:opacity-50"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
