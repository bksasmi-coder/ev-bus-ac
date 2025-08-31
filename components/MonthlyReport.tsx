import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, AccountType } from '../types';
import Card from './Card';
import BankIcon from './icons/BankIcon';
import CashIcon from './icons/CashIcon';
import LoanIcon from './icons/LoanIcon';
import BackIcon from './icons/BackIcon';

// @ts-ignore
declare const NepaliDate: any;

interface MonthlyReportProps {
  transactions: Transaction[];
}

const ReportTransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const isIncome = transaction.type === TransactionType.INCOME;
    const amountColor = isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    const sign = isIncome ? '+' : '-';
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ne-NP', { style: 'currency', currency: 'NPR' }).format(amount);
    };

    const gregorianDate = new Date(transaction.date);
    let nepaliDateString = '';
    if (typeof NepaliDate !== 'undefined') {
        try {
            const nepaliDate = new NepaliDate(gregorianDate);
            nepaliDateString = nepaliDate.format('MMMM D, YYYY');
        } catch (e) {
            console.error("Could not convert date:", e);
        }
    }

    const AccountIcon = () => {
        const iconClass = "w-5 h-5 text-gray-500 dark:text-gray-400";
        switch (transaction.account) {
            case AccountType.BANK: return <BankIcon className={iconClass} />;
            case AccountType.CASH: return <CashIcon className={iconClass} />;
            case AccountType.LOAN: return <LoanIcon className={iconClass} />;
            default: return null;
        }
    };

    return (
        <li className="flex items-center justify-between py-3 px-2">
            <div className="flex items-center space-x-4 overflow-hidden">
                <div className="flex-shrink-0">
                   <AccountIcon />
                </div>
                <div className="flex-grow overflow-hidden">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{transaction.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {nepaliDateString} &middot; <span className="capitalize">{transaction.account}</span>
                    </p>
                </div>
            </div>
            <div className={`text-right font-semibold ${amountColor} ml-2`}>
                {sign} {formatCurrency(transaction.amount)}
            </div>
        </li>
    );
};


const MonthlyReport: React.FC<MonthlyReportProps> = ({ transactions }) => {
    const nepaliMonths = useMemo(() => {
        if (typeof NepaliDate !== 'undefined' && Array.isArray(NepaliDate.bsMonths)) {
            return NepaliDate.bsMonths.map((month: string) => month.trim());
        }
        return [];
    }, []);

    const { availableYears, defaultYear, defaultMonth } = useMemo(() => {
        const years = new Set<number>();
        if (typeof NepaliDate === 'undefined') {
            return { availableYears: [], defaultYear: 2080, defaultMonth: 0 };
        }
        transactions.forEach(t => {
            try {
                const nepaliDate = new NepaliDate(new Date(t.date));
                years.add(nepaliDate.getYear());
            } catch (e) {}
        });
        const sortedYears = Array.from(years).sort((a, b) => b - a);
        const now = new NepaliDate();
        if (sortedYears.length === 0) {
            sortedYears.push(now.getYear());
        }
        return {
            availableYears: sortedYears,
            defaultYear: now.getYear(),
            defaultMonth: now.getMonth(),
        };
    }, [transactions]);
    
    const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
    const [selectedMonth, setSelectedMonth] = useState<number>(defaultMonth);

    const groupedTransactionsByDay = useMemo(() => {
        if (typeof NepaliDate === 'undefined') return {};

        const groups: { [key: number]: Transaction[] } = {};

        transactions.forEach(t => {
            try {
                const nepaliTxDate = new NepaliDate(new Date(t.date));
                if (nepaliTxDate.getYear() === selectedYear && nepaliTxDate.getMonth() === selectedMonth) {
                    const day = nepaliTxDate.getDate();
                    if (!groups[day]) {
                        groups[day] = [];
                    }
                    groups[day].push(t);
                }
            } catch (e) {
                // ignore invalid dates
            }
        });

        // Sort transactions within each day's group by original timestamp
        for (const day in groups) {
            groups[day].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }

        return groups;
    }, [transactions, selectedYear, selectedMonth]);

    const transactionsThisMonth = useMemo(() => Object.values(groupedTransactionsByDay).flat(), [groupedTransactionsByDay]);

    const { totalIncome, totalExpenses } = useMemo(() => {
        return transactionsThisMonth.reduce((acc, t) => {
            if (t.type === TransactionType.INCOME) {
                acc.totalIncome += t.amount;
            } else {
                acc.totalExpenses += t.amount;
            }
            return acc;
        }, { totalIncome: 0, totalExpenses: 0 });
    }, [transactionsThisMonth]);
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ne-NP', { style: 'currency', currency: 'NPR' }).format(amount);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Monthly Report (Bikram Sambat)</h2>
            </div>

            <Card title="Select Period">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year (B.S.)</label>
                        <select
                            id="year-select"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="mt-1 block w-full sm:w-1/2 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                    </div>
                    <div>
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Month</span>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {nepaliMonths.map((month, index) => (
                                <button
                                    key={month}
                                    onClick={() => setSelectedMonth(index)}
                                    className={`py-2 px-3 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 ${
                                        selectedMonth === index
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                                    }`}
                                >
                                    {month}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
            
            <Card title={`Summary for ${nepaliMonths[selectedMonth] || ''} ${selectedYear}`}>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Total Income</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Total Expenses</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</span>
                    </div>
                    <hr className="border-gray-200 dark:border-gray-600" />
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-gray-800 dark:text-white">Net {totalIncome - totalExpenses >= 0 ? 'Profit' : 'Loss'}</span>
                        <span className={`font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(totalIncome - totalExpenses)}
                        </span>
                    </div>
                </div>
            </Card>

            <Card title="Transactions This Month">
                {transactionsThisMonth.length > 0 ? (
                    <div className="space-y-6">
                        {Object.keys(groupedTransactionsByDay).sort((a, b) => Number(a) - Number(b)).map(day => (
                            <div key={day}>
                                <h4 className="font-semibold text-md text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                                    {nepaliMonths[selectedMonth] || ''} {day}
                                </h4>
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700 -mx-2">
                                    {groupedTransactionsByDay[Number(day)].map(tx => (
                                        <ReportTransactionItem key={tx.id} transaction={tx} />
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">No transactions for this month.</p>
                    </div>
                )}
            </Card>

        </div>
    );
};

export default MonthlyReport;