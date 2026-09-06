import { supabase } from '../lib/supabase';

// ─── HABITS ───────────────────────────────────────────────────────────────────

export async function fetchHabits(userId) {
  const { data: habitsData, error: habitsError } = await supabase
    .from('habits')
    .select(`
      *,
      habit_frequency_days(day_of_week),
      habit_completions(date_key)
    `)
    .eq('user_id', userId);

  if (habitsError) {
    console.error('Error fetching habits from Supabase:', habitsError);
    throw habitsError;
  }

  return (habitsData || []).map((h) => ({
    id: h.id,
    name: h.name,
    identity: h.identity || '',
    icon: h.icon,
    color: h.color,
    frequency:
      h.freq_type === 'days'
        ? { type: 'days', days: (h.habit_frequency_days || []).map((d) => d.day_of_week) }
        : h.freq_type === 'weekly'
        ? { type: 'weekly', timesPerWeek: h.times_per_week || 1 }
        : { type: 'daily' },
    startDate: h.start_date,
    completions: (h.habit_completions || []).map((c) => c.date_key),
    createdAt: new Date(h.created_at).getTime(),
  }));
}

export async function saveHabit(userId, habit) {
  const isUUID = habit.id.length === 36 && habit.id.includes('-');
  
  const habitPayload = {
    user_id: userId,
    name: habit.name,
    identity: habit.identity || null,
    icon: habit.icon,
    color: habit.color,
    freq_type: habit.frequency.type,
    times_per_week: habit.frequency.type === 'weekly' ? habit.frequency.timesPerWeek : null,
    start_date: habit.startDate || new Date().toISOString().split('T')[0],
  };

  if (isUUID) {
    habitPayload.id = habit.id;
  }

  const { data, error } = await supabase
    .from('habits')
    .upsert(habitPayload)
    .select()
    .single();

  if (error) {
    console.error('Error saving habit to Supabase:', error);
    throw error;
  }

  const habitId = data.id;

  // Handle frequency days
  if (habit.frequency.type === 'days') {
    await supabase.from('habit_frequency_days').delete().eq('habit_id', habitId);
    const dayRows = (habit.frequency.days || []).map((d) => ({
      habit_id: habitId,
      day_of_week: d,
    }));
    if (dayRows.length > 0) {
      await supabase.from('habit_frequency_days').insert(dayRows);
    }
  }

  // Handle completions
  await supabase.from('habit_completions').delete().eq('habit_id', habitId);
  const completionRows = (habit.completions || []).map((key) => ({
    habit_id: habitId,
    date_key: key,
  }));
  if (completionRows.length > 0) {
    await supabase.from('habit_completions').insert(completionRows);
  }

  return { ...habit, id: habitId };
}

export async function deleteHabitInCloud(userId, habitId) {
  const { error } = await supabase.from('habits').delete().eq('id', habitId).eq('user_id', userId);
  if (error) console.error('Error deleting habit:', error);
}

// ─── ACCOUNTS ─────────────────────────────────────────────────────────────────

export async function fetchAccounts(userId) {
  const { data, error } = await supabase.from('accounts').select('*').eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((a) => ({
    id: a.id,
    name: a.name,
    emoji: a.emoji,
    initialBalance: Number(a.initial_balance) || 0,
    createdAt: new Date(a.created_at).getTime(),
  }));
}

export async function saveAccount(userId, account) {
  const isUUID = account.id.length === 36 && account.id.includes('-');
  const payload = {
    user_id: userId,
    name: account.name,
    emoji: account.emoji,
    initial_balance: account.initialBalance || 0,
  };
  if (isUUID) payload.id = account.id;

  const { data, error } = await supabase.from('accounts').upsert(payload).select().single();
  if (error) throw error;
  return { ...account, id: data.id };
}

export async function deleteAccountInCloud(userId, accountId) {
  await supabase.from('accounts').delete().eq('id', accountId).eq('user_id', userId);
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────

export async function fetchTransactions(userId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;

  return (data || []).map((t) => ({
    id: t.id,
    type: t.type,
    amount: Number(t.amount),
    name: t.name || '',
    category: t.category || '',
    description: t.description || '',
    date: Number(t.date),
    accountId: t.account_id || null,
    fromAccountId: t.from_account_id || null,
    toAccountId: t.to_account_id || null,
    createdAt: new Date(t.created_at).getTime(),
  }));
}

export async function saveTransaction(userId, tx) {
  const isUUID = tx.id.length === 36 && tx.id.includes('-');
  const payload = {
    user_id: userId,
    type: tx.type,
    amount: tx.amount,
    name: tx.name || null,
    category: tx.category || null,
    description: tx.description || null,
    date: tx.date,
    account_id: tx.accountId || null,
    from_account_id: tx.fromAccountId || null,
    to_account_id: tx.toAccountId || null,
  };
  if (isUUID) payload.id = tx.id;

  const { data, error } = await supabase.from('transactions').upsert(payload).select().single();
  if (error) throw error;
  return { ...tx, id: data.id };
}

export async function deleteTransactionInCloud(userId, txId) {
  await supabase.from('transactions').delete().eq('id', txId).eq('user_id', userId);
}

// ─── GOALS ────────────────────────────────────────────────────────────────────

export async function fetchGoals(userId) {
  const { data, error } = await supabase
    .from('goals')
    .select(`
      *,
      goal_checklist_items(*),
      goal_linked_habits(*)
    `)
    .eq('user_id', userId);

  if (error) throw error;

  return (data || []).map((g) => ({
    id: g.id,
    name: g.name,
    icon: g.icon,
    category: g.category,
    description: g.description || '',
    deadline: g.deadline ? Number(g.deadline) : null,
    timeframe: g.timeframe || 'medium',
    measureType: g.measure_type,
    targetAmount: g.target_amount ? Number(g.target_amount) : null,
    targetUnit: g.target_unit || '',
    currentAmount: g.current_amount ? Number(g.current_amount) : 0,
    linkedAccountId: g.linked_account_id || null,
    checklistItems: (g.goal_checklist_items || []).map((item) => ({
      id: item.id,
      text: item.text,
      done: item.is_done,
    })),
    linkedHabits: (g.goal_linked_habits || []).map((lh) => ({
      habitId: lh.habit_id,
      weight: lh.weight,
    })),
    createdAt: new Date(g.created_at).getTime(),
    completedAt: g.completed_at ? new Date(g.completed_at).getTime() : null,
  }));
}

export async function saveGoal(userId, goal) {
  const isUUID = goal.id.length === 36 && goal.id.includes('-');
  const payload = {
    user_id: userId,
    name: goal.name,
    icon: goal.icon,
    category: goal.category,
    description: goal.description || null,
    deadline: goal.deadline || null,
    timeframe: goal.timeframe || 'medium',
    measure_type: goal.measureType,
    target_amount: goal.targetAmount || null,
    target_unit: goal.targetUnit || null,
    current_amount: goal.currentAmount || 0,
    linked_account_id: goal.linkedAccountId || null,
    completed_at: goal.completedAt ? new Date(goal.completedAt).toISOString() : null,
  };
  if (isUUID) payload.id = goal.id;

  const { data, error } = await supabase.from('goals').upsert(payload).select().single();
  if (error) throw error;
  const goalId = data.id;

  // Sync checklist items
  await supabase.from('goal_checklist_items').delete().eq('goal_id', goalId);
  const checklistRows = (goal.checklistItems || []).map((item, idx) => {
    const isItemUUID = item.id && item.id.length === 36 && item.id.includes('-');
    const row = {
      goal_id: goalId,
      text: item.text,
      is_done: !!item.done,
      sort_order: idx,
    };
    if (isItemUUID) row.id = item.id;
    return row;
  });
  if (checklistRows.length > 0) {
    await supabase.from('goal_checklist_items').insert(checklistRows);
  }

  // Sync linked habits
  await supabase.from('goal_linked_habits').delete().eq('goal_id', goalId);
  const linkedHabitRows = (goal.linkedHabits || []).map((lh) => ({
    goal_id: goalId,
    habit_id: lh.habitId,
    weight: lh.weight || 1,
  }));
  if (linkedHabitRows.length > 0) {
    await supabase.from('goal_linked_habits').insert(linkedHabitRows);
  }

  return { ...goal, id: goalId };
}

export async function deleteGoalInCloud(userId, goalId) {
  await supabase.from('goals').delete().eq('id', goalId).eq('user_id', userId);
}

// ─── REFLECTIONS ──────────────────────────────────────────────────────────────

export async function fetchReflections(userId) {
  const { data, error } = await supabase
    .from('reflections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((r) => ({
    id: r.id,
    text: r.content,
    createdAt: new Date(r.created_at).getTime(),
  }));
}

export async function saveReflection(userId, reflection) {
  const isUUID = reflection.id.length === 36 && reflection.id.includes('-');
  const payload = {
    user_id: userId,
    content: reflection.text,
  };
  if (isUUID) payload.id = reflection.id;

  const { data, error } = await supabase.from('reflections').upsert(payload).select().single();
  if (error) throw error;
  return { ...reflection, id: data.id };
}

export async function deleteReflectionInCloud(userId, reflectionId) {
  await supabase.from('reflections').delete().eq('id', reflectionId).eq('user_id', userId);
}

// ─── RECURRING TEMPLATES ──────────────────────────────────────────────────────

export async function fetchRecurringTemplates(userId) {
  const { data, error } = await supabase.from('recurring_templates').select('*').eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((t) => ({
    id: t.id,
    name: t.name,
    type: t.type,
    amount: Number(t.amount),
    icon: t.icon,
    category: t.category,
    dayOfMonth: t.day_of_month,
    defaultAccountId: t.default_account_id,
  }));
}

export async function saveRecurringTemplate(userId, template) {
  const isUUID = template.id.length === 36 && template.id.includes('-');
  const payload = {
    user_id: userId,
    name: template.name,
    type: template.type,
    amount: template.amount,
    icon: template.icon || null,
    category: template.category || null,
    day_of_month: template.dayOfMonth || null,
    default_account_id: template.defaultAccountId || null,
  };
  if (isUUID) payload.id = template.id;

  const { data, error } = await supabase.from('recurring_templates').upsert(payload).select().single();
  if (error) throw error;
  return { ...template, id: data.id };
}

export async function deleteRecurringTemplateInCloud(userId, templateId) {
  await supabase.from('recurring_templates').delete().eq('id', templateId).eq('user_id', userId);
}
