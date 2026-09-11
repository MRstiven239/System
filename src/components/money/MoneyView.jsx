import { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { totalBalance, periodFinancials } from '../../domain/budget';
import { RangePicker } from '../layout/RangePicker';
import { Modal } from '../common/Modal';

import { FinancialSummary } from './FinancialSummary';
import { BalanceChartInteractive } from './BalanceChartInteractive';
import { AccountCards } from './AccountCards';
import { TransactionListFiltered } from './TransactionListFiltered';
import { FinancialInsights } from './FinancialInsights';
import { AccountFormModal } from './AccountFormModal';
import { TransactionFormModal } from './TransactionFormModal';
import { ChevronDown, ArrowRightLeft, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export function MoneyView({ 
  accounts, 
  transactions, 
  loaded,
  addAccount, 
  updateAccount, 
  deleteAccount, 
  addExpense, 
  addIncome, 
  addTransfer, 
  deleteTransaction 
}) {
  const theme = useTheme();
  
  const [range, setRange] = useState('month');
  
  // UI state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [txType, setTxType] = useState('expense');
  
  // Modals state
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState(null);
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);
  
  // Calculated metrics for FinancialSummary
  const currentTotalBalance = totalBalance(accounts, transactions);
  
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();
  
  // Fake a previous balance by subtracting this month's net flow
  const thisMonthStats = periodFinancials(transactions, thisMonthStart, thisMonthEnd);
  const previousBalance = currentTotalBalance - thisMonthStats.netBalance;

  if (!loaded) {
    return <p style={{ color: theme.inkMuted }} className="text-sm text-center py-16">Cargando tus finanzas…</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8 animate-fade-in-up">
        <h2 style={{ color: theme.ink, fontSize: '32px', fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
          Tu Dinero
        </h2>
        <div className="relative z-50">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{ background: theme.surfaceAlt, color: theme.ink, border: `1px solid ${theme.border}` }}
            className="px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span>+</span> Movimiento <ChevronDown size={16} />
          </button>
          
          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0" 
                onClick={() => setIsDropdownOpen(false)} 
              />
              <div 
                className="absolute top-full right-0 mt-2 p-2 rounded-xl shadow-xl flex flex-col gap-1 w-48 animate-fade-in" 
                style={{ background: theme.surfaceAlt, border: `1px solid ${theme.borderHover}` }}
              >
              <button 
                onClick={() => { setTxType('income'); setIsCreatingTransaction(true); setIsDropdownOpen(false); }} 
                className="text-left px-3 py-2 rounded-lg hover:bg-black/5 flex items-center gap-2" 
                style={{ color: theme.ink }}
              >
                <ArrowDownToLine size={16} style={{ color: theme.income }} /> + Ingreso
              </button>
              <button 
                onClick={() => { setTxType('expense'); setIsCreatingTransaction(true); setIsDropdownOpen(false); }} 
                className="text-left px-3 py-2 rounded-lg hover:bg-black/5 flex items-center gap-2" 
                style={{ color: theme.ink }}
              >
                <ArrowUpFromLine size={16} style={{ color: theme.expense }} /> - Gasto
              </button>
              <button 
                onClick={() => { setTxType('transfer'); setIsCreatingTransaction(true); setIsDropdownOpen(false); }} 
                className="text-left px-3 py-2 rounded-lg hover:bg-black/5 flex items-center gap-2" 
                style={{ color: theme.ink }}
              >
                <ArrowRightLeft size={16} /> ⇄ Transferencia
              </button>
            </div>
            </>
          )}
        </div>
      </div>

      <FinancialSummary 
        currentBalance={currentTotalBalance}
        previousBalance={previousBalance}
        totalIncome={thisMonthStats.totalIncome}
        totalExpenses={thisMonthStats.totalExpenses}
        savingsRate={thisMonthStats.savingsRate}
      />

      {/* Prioritized AccountCards just under FinancialSummary */}
      <div className="mt-8">
        <AccountCards 
          accounts={accounts} 
          transactions={transactions}
          onAddAccount={() => setIsCreatingAccount(true)} 
          onDeleteAccount={deleteAccount}
          onEditAccount={(acc) => setAccountToEdit(acc)}
        />
      </div>

      <div className="flex justify-between items-end mt-8 border-b pb-4" style={{ borderColor: theme.border }}>
        <h3 style={{ color: theme.ink }} className="text-lg font-semibold">Evolución</h3>
        <RangePicker range={range} onChange={setRange} />
      </div>

      <BalanceChartInteractive accounts={accounts} transactions={transactions} range={range} />

      <FinancialInsights transactions={transactions} />

      <TransactionListFiltered 
        transactions={transactions} 
        accounts={accounts} 
        onDelete={deleteTransaction} 
      />

      {/* Modals */}
      {isCreatingAccount && (
        <AccountFormModal 
          onClose={() => setIsCreatingAccount(false)}
          onSubmit={(data) => {
            addAccount(data);
            setIsCreatingAccount(false);
          }}
        />
      )}

      {accountToEdit && (
        <AccountFormModal 
          initialData={accountToEdit}
          onClose={() => setAccountToEdit(null)}
          onSubmit={(data) => {
            updateAccount(accountToEdit.id, data);
            setAccountToEdit(null);
          }}
        />
      )}

      {isCreatingTransaction && (
        <TransactionFormModal 
          accounts={accounts}
          initialType={txType}
          onClose={() => setIsCreatingTransaction(false)}
          onSubmit={(data) => {
            if (data.type === 'transfer') {
              addTransfer(data);
            } else if (data.type === 'expense') {
              addExpense(data);
            } else {
              addIncome(data);
            }
            setIsCreatingTransaction(false);
          }}
        />
      )}

    </div>
  );
}
