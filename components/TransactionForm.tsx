
import React, { useState, useRef, useEffect } from 'react';
import { Transaction, TransactionType, AccountType } from '../types';
import Card from './Card';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction, onCancel }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.INCOME);
  const [account, setAccount] = useState<AccountType>(AccountType.CASH);
  const [error, setError] = useState('');
  const descriptionInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    descriptionInputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!description.trim() || isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid description and a positive amount.');
      return;
    }
    setError('');

    onAddTransaction({
      description,
      amount: numericAmount,
      type: transactionType,
      account,
    });

    // Reset form
    setDescription('');
    setAmount('');
    setTransactionType(TransactionType.INCOME);
    setAccount(AccountType.CASH);
    descriptionInputRef.current?.focus();
  };
  
  const incomeLabel = account === AccountType.LOAN ? 'Withdrawal' : 'Income';
  const expenseLabel = account === AccountType.LOAN ? 'Pay Loan' : 'Expense';

  return (
    <Card title="Add New Transaction">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <input
            ref={descriptionInputRef}
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
            placeholder="e.g., Groceries, Salary"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
            placeholder="0.00"
            step="0.01"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</span>
            <div className="mt-2 flex rounded-md shadow-sm">
              <button type="button" onClick={() => setTransactionType(TransactionType.INCOME)} className={`flex-1 py-2 px-4 text-sm font-medium focus:z-10 focus:outline-none ${transactionType === TransactionType.INCOME ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'} border border-gray-300 dark:border-gray-600 rounded-l-md`}>{incomeLabel}</button>
              <button type="button" onClick={() => setTransactionType(TransactionType.EXPENSE)} className={`-ml-px flex-1 py-2 px-4 text-sm font-medium focus:z-10 focus:outline-none ${transactionType === TransactionType.EXPENSE ? 'bg-red-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'} border border-gray-300 dark:border-gray-600 rounded-r-md`}>{expenseLabel}</button>
            </div>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account</span>
            <div className="mt-2 flex rounded-md shadow-sm">
              <button type="button" onClick={() => setAccount(AccountType.BANK)} className={`flex-1 py-2 px-4 text-sm font-medium focus:z-10 focus:outline-none ${account === AccountType.BANK ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'} border border-gray-300 dark:border-gray-600 rounded-l-md`}>Bank</button>
              <button type="button" onClick={() => setAccount(AccountType.CASH)} className={`-ml-px flex-1 py-2 px-4 text-sm font-medium focus:z-10 focus:outline-none ${account === AccountType.CASH ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'} border border-gray-300 dark:border-gray-600`}>Cash</button>
              <button type="button" onClick={() => setAccount(AccountType.LOAN)} className={`-ml-px flex-1 py-2 px-4 text-sm font-medium focus:z-10 focus:outline-none ${account === AccountType.LOAN ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'} border border-gray-300 dark:border-gray-600 rounded-r-md`}>Loan</button>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex items-center justify-end space-x-4 pt-2">
           <button 
              type="button" 
              onClick={onCancel}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
            Cancel
          </button>
          <button 
              type="submit" 
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Transaction
          </button>
        </div>
      </form>
    </Card>
  );
};

export default TransactionForm;
