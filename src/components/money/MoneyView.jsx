import { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { totalBalance, periodFinancials } from '../../domain/budget';
import { useRecurringTemplates } from '../../hooks/useRecurringTemplates';
import { SectionHeader } from '../layout/SectionHeader';
import { RangePicker } from '../layout/RangePicker';
import { Modal } from '../common/Modal';

import { FinancialSummary } from './FinancialSummary';
import { BalanceChartInteractive } from './BalanceChartInteractive';
import { AccountCards } from './AccountCards';
import { RecurringTemplateList } from './RecurringTemplateList';
import { RecurringTemplateForm } from './RecurringTemplateForm';
import { RegisterTemplateModal } from './RegisterTemplateModal';
import { TransactionListFiltered } from './TransactionListFiltered';
import { FinancialInsights } from './FinancialInsights';
import { AccountFormModal } from './AccountFormModal';
import { TransactionFormModal } from './TransactionFormModal';

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
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useRecurringTemplates();
  
  const [range, setRange] = useState('month');
  
  // Modals state
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [templateToRegister, setTemplateToRegister] = useState(null);
  const [templateToEdit, setTemplateToEdit] = useState(null);
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
      <div className="flex justify-between items-center">
        <SectionHeader 
          title="Tu Dinero" 
          subtitle="Un jardín financiero saludable necesita riego constante y poda cuidadosa." 
        />
        <button 
          onClick={() => setIsCreatingTransaction(true)}
          style={{ background: theme.ink, color: theme.pageBg }}
          className="px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2 -mt-4"
        >
          <span>+</span> Movimiento
        </button>
      </div>

      <FinancialSummary 
        currentBalance={currentTotalBalance}
        previousBalance={previousBalance}
        totalIncome={thisMonthStats.totalIncome}
        totalExpenses={thisMonthStats.totalExpenses}
        savingsRate={thisMonthStats.savingsRate}
      />

      <div className="flex justify-between items-end mt-8 border-b pb-4" style={{ borderColor: theme.border }}>
        <h3 style={{ color: theme.ink }} className="text-lg font-semibold">Evolución</h3>
        <RangePicker range={range} onChange={setRange} />
      </div>

      <BalanceChartInteractive accounts={accounts} transactions={transactions} range={range} />

      <AccountCards 
        accounts={accounts} 
        transactions={transactions}
        onAddAccount={() => setIsCreatingAccount(true)} 
        onDeleteAccount={deleteAccount}
        onEditAccount={(acc) => setAccountToEdit(acc)}
      />

      <RecurringTemplateList 
        templates={templates} 
        onCreate={() => setIsCreatingTemplate(true)}
        onRegister={(t) => setTemplateToRegister(t)}
        onEdit={(t) => setTemplateToEdit(t)}
        onDelete={deleteTemplate}
      />

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

      {isCreatingTemplate && (
        <Modal onClose={() => setIsCreatingTemplate(false)}>
          <h3 style={{ fontFamily: 'Fraunces, serif', color: theme.ink }} className="text-xl font-bold mb-6">
            Nuevo movimiento fijo
          </h3>
          <RecurringTemplateForm 
            onCancel={() => setIsCreatingTemplate(false)}
            onSubmit={(data) => {
              addTemplate(data);
              setIsCreatingTemplate(false);
            }}
          />
        </Modal>
      )}

      {templateToEdit && (
        <Modal onClose={() => setTemplateToEdit(null)}>
          <h3 style={{ fontFamily: 'Fraunces, serif', color: theme.ink }} className="text-xl font-bold mb-6">
            Editar movimiento fijo
          </h3>
          <RecurringTemplateForm 
            template={templateToEdit}
            onCancel={() => setTemplateToEdit(null)}
            onSubmit={(data) => {
              updateTemplate(templateToEdit.id, data);
              setTemplateToEdit(null);
            }}
          />
        </Modal>
      )}

      {templateToRegister && (
        <Modal onClose={() => setTemplateToRegister(null)}>
          <RegisterTemplateModal 
            template={templateToRegister}
            transactions={transactions}
            accounts={accounts}
            onCancel={() => setTemplateToRegister(null)}
            onConfirm={(data) => {
              if (data.type === 'expense') {
                addExpense(data);
              } else {
                addIncome(data);
              }
              setTemplateToRegister(null);
            }}
          />
        </Modal>
      )}

    </div>
  );
}
