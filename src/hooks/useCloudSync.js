import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../lib/supabase';
import { storageAdapter } from '../storage';
import {
  fetchHabits, saveHabit, deleteHabitInCloud,
  fetchAccounts, saveAccount, deleteAccountInCloud,
  fetchTransactions, saveTransaction, deleteTransactionInCloud,
  fetchGoals, saveGoal, deleteGoalInCloud,
  fetchReflections, saveReflection, deleteReflectionInCloud,
  fetchRecurringTemplates, saveRecurringTemplate, deleteRecurringTemplateInCloud
} from '../storage/supabaseRepository';

export function useCloudSync({
  habits, setHabits,
  accounts, setAccounts,
  transactions, setTransactions,
  goals, setGoals,
  reflections, setReflections,
  recurringTemplates, setRecurringTemplates
}) {
  const { user } = useAuth();
  const isMigratingRef = useRef(false);

  // 1. Initial Load & Auto Migration from Local to Cloud
  useEffect(() => {
    if (!user || isMigratingRef.current) return;
    let isCancelled = false;

    async function syncOnLogin() {
      try {
        isMigratingRef.current = true;

        // Fetch existing cloud data
        const [
          cloudHabits,
          cloudAccounts,
          cloudTxs,
          cloudGoals,
          cloudReflections,
          cloudTemplates
        ] = await Promise.all([
          fetchHabits(user.id),
          fetchAccounts(user.id),
          fetchTransactions(user.id),
          fetchGoals(user.id),
          fetchReflections(user.id),
          fetchRecurringTemplates(user.id)
        ]);

        if (isCancelled) return;

        const isCloudEmpty =
          cloudHabits.length === 0 &&
          cloudAccounts.length === 0 &&
          cloudGoals.length === 0;

        if (isCloudEmpty) {
          // Check current memory state & IndexedDB / localStorage for local data to upload
          const rawHabits = await storageAdapter.getItem('identity-habits-v1');
          const rawAccounts = await storageAdapter.getItem('budget-accounts-v1');
          const rawTxs = await storageAdapter.getItem('budget-transactions-v1');
          const rawGoals = (await storageAdapter.getItem('goals-v2')) || (await storageAdapter.getItem('goals-v1'));
          const rawReflections = await storageAdapter.getItem('reflections-v1');
          const rawTemplates = await storageAdapter.getItem('recurring-templates-v1');

          const localHabits = rawHabits ? JSON.parse(rawHabits) : (habits || []);
          const localAccounts = rawAccounts ? JSON.parse(rawAccounts) : (accounts || []);
          const localTxs = rawTxs ? JSON.parse(rawTxs) : (transactions || []);
          const localGoals = rawGoals ? JSON.parse(rawGoals) : (goals || []);
          const localReflections = rawReflections ? JSON.parse(rawReflections) : (reflections || []);
          const localTemplates = rawTemplates ? JSON.parse(rawTemplates) : (recurringTemplates || []);

          const hasLocalData =
            localHabits.length > 0 ||
            localAccounts.length > 0 ||
            localGoals.length > 0;

          if (hasLocalData) {
            console.log('Subiendo datos locales a Supabase para:', user.email);
            for (const h of localHabits) await saveHabit(user.id, h);
            for (const a of localAccounts) await saveAccount(user.id, a);
            for (const t of localTxs) await saveTransaction(user.id, t);
            for (const g of localGoals) await saveGoal(user.id, g);
            for (const r of localReflections) await saveReflection(user.id, r);
            for (const tm of localTemplates) await saveRecurringTemplate(user.id, tm);

            const [
              migratedHabits,
              migratedAccounts,
              migratedTxs,
              migratedGoals,
              migratedReflections,
              migratedTemplates
            ] = await Promise.all([
              fetchHabits(user.id),
              fetchAccounts(user.id),
              fetchTransactions(user.id),
              fetchGoals(user.id),
              fetchReflections(user.id),
              fetchRecurringTemplates(user.id)
            ]);

            if (setHabits) setHabits(migratedHabits);
            if (setAccounts) setAccounts(migratedAccounts);
            if (setTransactions) setTransactions(migratedTxs);
            if (setGoals) setGoals(migratedGoals);
            if (setReflections) setReflections(migratedReflections);
            if (setRecurringTemplates) setRecurringTemplates(migratedTemplates);
            return;
          }
        }

        // Supabase is the single source of truth when logged in
        if (setHabits) setHabits(cloudHabits);
        if (setAccounts) setAccounts(cloudAccounts);
        if (setTransactions) setTransactions(cloudTxs);
        if (setGoals) setGoals(cloudGoals);
        if (setReflections) setReflections(cloudReflections);
        if (setRecurringTemplates) setRecurringTemplates(cloudTemplates);
      } catch (err) {
        console.error('Error al sincronizar con Supabase:', err);
        // Expose error visually for debugging
        if (typeof window !== 'undefined') {
          setTimeout(() => alert('SYNC ERROR: ' + err.message + ' ' + JSON.stringify(err)), 1000);
        }
      } finally {
        isMigratingRef.current = false;
      }
    }

    syncOnLogin();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  // 2. Realtime Subscriptions for Instant Cross-Device Sync
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`realtime-sync-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public' }, async (payload) => {
        try {
          console.log('Realtime change received:', payload);
          const [
            freshHabits,
            freshAccounts,
            freshTxs,
            freshGoals,
            freshReflections,
            freshTemplates
          ] = await Promise.all([
            fetchHabits(user.id),
            fetchAccounts(user.id),
            fetchTransactions(user.id),
            fetchGoals(user.id),
            fetchReflections(user.id),
            fetchRecurringTemplates(user.id)
          ]);

          if (setHabits) setHabits(freshHabits);
          if (setAccounts) setAccounts(freshAccounts);
          if (setTransactions) setTransactions(freshTxs);
          if (setGoals) setGoals(freshGoals);
          if (setReflections) setReflections(freshReflections);
          if (setRecurringTemplates) setRecurringTemplates(freshTemplates);
        } catch (err) {
          console.error('Error refreshing realtime payload:', err);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, setHabits, setAccounts, setTransactions, setGoals, setReflections, setRecurringTemplates]);

  // Helpers for explicit cloud writes/deletes
  const syncHabitSave = useCallback((habit) => {
    if (user) saveHabit(user.id, habit).catch(console.error);
  }, [user]);

  const syncHabitDelete = useCallback((habitId) => {
    if (user) deleteHabitInCloud(user.id, habitId).catch(console.error);
  }, [user]);

  const syncAccountSave = useCallback((acc) => {
    if (user) saveAccount(user.id, acc).catch(console.error);
  }, [user]);

  const syncAccountDelete = useCallback((accId) => {
    if (user) deleteAccountInCloud(user.id, accId).catch(console.error);
  }, [user]);

  const syncTransactionSave = useCallback((tx) => {
    if (user) saveTransaction(user.id, tx).catch(console.error);
  }, [user]);

  const syncTransactionDelete = useCallback((txId) => {
    if (user) deleteTransactionInCloud(user.id, txId).catch(console.error);
  }, [user]);

  const syncGoalSave = useCallback((goal) => {
    if (user) saveGoal(user.id, goal).catch(console.error);
  }, [user]);

  const syncGoalDelete = useCallback((goalId) => {
    if (user) deleteGoalInCloud(user.id, goalId).catch(console.error);
  }, [user]);

  const syncReflectionSave = useCallback((ref) => {
    if (user) saveReflection(user.id, ref).catch(console.error);
  }, [user]);

  const syncReflectionDelete = useCallback((refId) => {
    if (user) deleteReflectionInCloud(user.id, refId).catch(console.error);
  }, [user]);

  const syncTemplateSave = useCallback((tmpl) => {
    if (user) saveRecurringTemplate(user.id, tmpl).catch(console.error);
  }, [user]);

  const syncTemplateDelete = useCallback((tmplId) => {
    if (user) deleteRecurringTemplateInCloud(user.id, tmplId).catch(console.error);
  }, [user]);

  return {
    syncHabitSave, syncHabitDelete,
    syncAccountSave, syncAccountDelete,
    syncTransactionSave, syncTransactionDelete,
    syncGoalSave, syncGoalDelete,
    syncReflectionSave, syncReflectionDelete,
    syncTemplateSave, syncTemplateDelete
  };
}
