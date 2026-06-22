'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { categoriesApi } from '@/lib/api';
import { CategoryInput } from '@/types';

export default function CategoriesPage() {
  const { data: categories, refetch } = useCategories();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryInput>({
    name: '',
    icon: '📌',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.name || formData.name.length < 1 || formData.name.length > 20) {
      newErrors.name = '1～20文字で入力してください';
    }
    if (!formData.icon) newErrors.icon = 'アイコンは必須です';

    const exists = categories.some(
      (c) => c.name.toLowerCase() === formData.name.toLowerCase() && !c.is_default
    );
    if (exists) newErrors.name = 'このカテゴリは既に存在します';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      await categoriesApi.create(formData);
      setFormData({ name: '', icon: '📌' });
      setErrors({});
      setIsDialogOpen(false);
      await refetch();
    } catch (err) {
      setErrors({ submit: '保存に失敗しました' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsSaving(true);
    try {
      await categoriesApi.delete(id);
      setDeleteConfirm(null);
      await refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const defaultCategories = categories.filter((c) => c.is_default);
  const userCategories = categories.filter((c) => !c.is_default);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-800">カテゴリ管理</h1>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* 初期カテゴリ */}
        <section className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">初期カテゴリ</h2>
          <div className="space-y-2">
            {defaultCategories.length === 0 ? (
              <p className="text-gray-500">初期カテゴリはありません</p>
            ) : (
              defaultCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-gray-800">{cat.name}</span>
                  </div>
                  <span className="text-gray-500">✓</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ユーザー作成カテゴリ */}
        <section className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              ユーザー作成カテゴリ
            </h2>
            <button
              onClick={() => {
                setIsDialogOpen(true);
                setErrors({});
              }}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              ➕ 追加
            </button>
          </div>
          <div className="space-y-2">
            {userCategories.length === 0 ? (
              <p className="text-gray-500">ユーザー作成カテゴリはありません</p>
            ) : (
              userCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-gray-800">{cat.name}</span>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(cat.id)}
                    disabled={isSaving}
                    className="text-red-600 hover:text-red-800 font-medium text-sm disabled:opacity-50"
                  >
                    削除
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <Link
          href="/"
          className="inline-block bg-gray-600 text-white py-2 px-4 rounded font-medium hover:bg-gray-700 transition"
        >
          ← 戻る
        </Link>
      </main>

      {/* 新規カテゴリダイアログ */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">カテゴリを追加</h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
                className="text-2xl font-bold text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  カテゴリ名 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={isSaving}
                  maxLength={20}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="例：趣味"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  {formData.name.length} / 20
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  アイコン *
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  disabled={isSaving}
                  maxLength={2}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-2xl text-center"
                />
                {errors.icon && (
                  <p className="text-red-500 text-sm mt-1">{errors.icon}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  1～2文字の絵文字を入力してください
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
                  {isSaving ? '追加中...' : '追加'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSaving}
                  className="flex-1 bg-gray-300 text-black py-2 rounded font-medium hover:bg-gray-400 transition disabled:opacity-50"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              本当に削除しますか？
            </h2>
            <p className="text-gray-600 mb-6">
              {
                userCategories.find((c) => c.id === deleteConfirm)?.name
              }
              を削除します。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isSaving}
                className="flex-1 bg-red-600 text-white py-2 rounded font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                {isSaving ? '削除中...' : '削除'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isSaving}
                className="flex-1 bg-gray-300 text-black py-2 rounded font-medium hover:bg-gray-400 transition disabled:opacity-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
