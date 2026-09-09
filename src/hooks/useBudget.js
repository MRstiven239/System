import { useCallback } from 'react';
import { usePersistedState } from './usePersistedState';
import {
  createAccount,
  createExpense,
  createIncome,
  createTransfer,
} from '../domain/budget';
import { useAuth } from '../auth/AuthContext';
import {
  saveAccount, deleteAccountInCloud,
  saveTransaction, deleteTransactionInCloud
} from '../storage/supabaseRepository';

const ACCOUNTS_KEY = 'budget-accounts-v1';
const TRANSACTIONS_KEY = 'budget-transactions-v1';

export function useBudget() {
  const [accounts, setAccounts, { loaded: accountsLoaded }] = usePersistedState(ACCOUNTS_KEY, []);
  const [transactions, setTransactions, { loaded: txLoaded, saveError }] = usePersistedState(
    TRANSACTIONS_KEY,
    []
  );
  const { user } = useAuth();

  const loaded = accountsLoaded && txLoaded;

  // ─── Accounts ──────────────────────────────────────────────────────────────

  const addAccount = useCallback(
    (formData) => {
      const newAcc = createAccount(formData);
      setAccounts((prev) => [...prev, newAcc]);
      if (user) saveAccount(user.id, newAcc).catch(e => alert('Error saving account: ' + e.message));
    },
    [setAccounts, user]
  );

  const updateAccount = useCallback(
    (id, formData) => {
      setAccounts((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            const updated = {
              ...a,
              ...formData,
              initialBalance: Number(formData.balance) ?? a.initialBalance,
            };
            if (user) saveAccount(user.id, updated).catch(e => alert('Error updating account: ' + e.message));
            return updated;
          }
          return a;
        })
      );
    },
    [setAccounts, user]
  );

  const deleteAccount = useCallback(
    (id) => {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      setTransactions((prev) =>
        prev.filter((tx) => tx.accountId !== id && tx.toAccountId !== id)
      );
      if (user) deleteAccountInCloud(user.id, id).catch(e => alert('Error deleting account: ' + e.message));
    },
    [setAccounts, setTransactions, user]
  );

  // ─── Transactions ───────────────────────────────────────────────────────────

  const addExpense = useCallback(
    (data) => {
      const newTx = createExpense(data.name, data.amount, data.accountId, data.category);
      setTransactions((prev) => [...prev, newTx]);
      if (user) saveTransaction(user.id, newTx).catch(e => alert('Error saving expense: ' + e.message));
    },
    [setTransactions, user]
  );

  const addIncome = useCallback(
    (data) => {
      const newTx = createIncome(data.name, data.amount, data.accountId, data.category);
      setTransactions((prev) => [...prev, newTx]);
      if (user) saveTransaction(user.id, newTx).catch(e => alert('Error saving income: ' + e.message));
    },
    [setTransactions, user]
  );

  const addTransfer = useCallback(
    (formData) => {
      const newTx = createTransfer(formData);
      setTransactions((prev) => [...prev, newTx]);
      if (user) saveTransaction(user.id, newTx).catch(e => alert('Error saving transfer: ' + e.message));
    },
    [setTransactions, user]
  );

  const deleteTransaction = useCallback(
    (id) => {
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      if (user) deleteTransactionInCloud(user.id, id).catch(e => alert('Error deleting transaction: ' + e.message));
    },
    [setTransactions, user]
  );

  return {
    accounts,
    setAccounts,
    transactions,
    setTransactions,
    loaded,
    saveError,
    addAccount,
    updateAccount,
    deleteAccount,
    addExpense,
    addIncome,
    addTransfer,
    deleteTransaction,
  };
}
