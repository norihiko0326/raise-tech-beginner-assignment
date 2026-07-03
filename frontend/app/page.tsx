'use client';

import { useState, useEffect } from 'react';
import { addMonths, format } from 'date-fns';
import { Header } from '@/components/Header';
import { SummaryBox } from '@/components/SummaryBox';
import { TransactionList } from '@/components/TransactionList';
import { TransactionDialog } from '@/components/TransactionDialog';
import { ActionButtons } from '@/components/ActionButtons';
import { useTransactions } from '@/hooks/useTransactions';
import { useSummary } from '@/hooks/useSummary';
import { useCategories } from '@/hooks/useCategories';
import { transactionApi } from '@/lib/api';
import { Transaction, TransactionInput } from '@/types';

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const monthStr = format(currentMonth, 'yyyy-MM');
  const { data: transactions, loading: txLoading, refetch: refetchTransactions } = useTransactions(monthStr);
  const { data: summary, loading: sumLoading } = useSummary(monthStr);
  const { data: categories } = useCategories();

  const handlePrevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleOpenDialog = () => {
    setSelectedTransaction(undefined);
    setIsDialogOpen(true);
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleSaveTransaction = async (data: TransactionInput) => {
    try {
      if (selectedTransaction) {
        await transactionApi.update(selectedTransaction.id, data);
        showToast('記録を更新しました', 'success');
      } else {
        await transactionApi.create(data);
        showToast('記録を追加しました', 'success');
      }
      await refetchTransactions();
    } catch (err) {
      showToast('保存に失敗しました', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <SummaryBox summary={summary} loading={sumLoading} />

        <TransactionList
          transactions={transactions}
          loading={txLoading}
          onTransactionClick={handleTransactionClick}
        />

        <ActionButtons onNewTransaction={handleOpenDialog} />
      </main>

      <TransactionDialog
        isOpen={isDialogOpen}
        transaction={selectedTransaction}
        categories={categories}
        onSave={handleSaveTransaction}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedTransaction(undefined);
        }}
      />

      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white z-50 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
