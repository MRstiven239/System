import { useCallback } from 'react';
import { usePersistedState } from './usePersistedState';
import {
  createAccount,
  createExpense,
  createIncome,
  createTransfer,
} from '../domain/budget';

const ACCOUNTS_KEY = 'budget-accounts-v1';
const TRANSACTIONS_KEY = 'budget-transactions-v1';

/**
 * Owns all budget state: accounts and transactions.
 * Follows the exact same pattern as useHabits — components never mutate
 * data directly, they call these functions.
 */
export function useBudget() {
  const [accounts, setAccounts, { loaded: accountsLoaded }] = usePersistedState(ACCOUNTS_KEY, []);
  const [transactions, setTransactions, { loaded: txLoaded, saveError }] = usePersistedState(
    TRANSACTIONS_KEY,
    []
  );

  const loaded = accountsLoaded && txLoaded;

  // ─── Accounts ──────────────────────────────────────────────────────────────

  const addAccount = useCallback(
    (formData) => {
      setAccounts((prev) => [...prev, createAccount(formData)]);
    },
    [setAccounts]
  );

  const updateAccount = useCallback(
    (id, formData) => {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, ...formData, initialBalance: Number(formData.balance) ?? a.initialBalance } : a
        )
      );
    },
    [setAccounts]
  );

  const deleteAccount = useCallback(
    (id) => {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      // Also remove transactions tied to this account
      setTransactions((prev) =>
        prev.filter((tx) => tx.accountId !== id && tx.toAccountId !== id)
      );
    },
    [setAccounts, setTransactions]
  );

  // ─── Transactions ───────────────────────────────────────────────────────────

  const addExpense = useCallback((data) => {
    setTransactions((prev) => [...prev, createExpense(data.name, data.amount, data.accountId, data.category)]);
  }, [setTransactions]);

  const addIncome = useCallback((data) => {
    setTransactions((prev) => [...prev, createIncome(data.name, data.amount, data.accountId, data.category)]);
  }, [setTransactions]);

  const addTransfer = useCallback(
    (formData) => {
      setTransactions((prev) => [...prev, createTransfer(formData)]);
    },
    [setTransactions]
  );

  const deleteTransaction = useCallback(
    (id) => {
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    },
    [setTransactions]
  );

  return {
    accounts,
    transactions,
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
