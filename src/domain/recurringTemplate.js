// RecurringTemplate domain — pure functions

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function createRecurringTemplate({
  name,
  type,        // 'expense' | 'income'
  amount,
  icon,        // emoji opcional
  category,    // string opcional
  dayOfMonth,  // número opcional (1-31)
  accountId,   // cuenta predeterminada opcional
  defaultAccountId,
}) {
  const accId = accountId || defaultAccountId || null;
  return {
    id: makeId(),
    name,
    type,
    amount: Math.abs(Number(amount)),
    icon: icon || (type === 'expense' ? '💸' : '💚'),
    category: category || '',
    dayOfMonth: dayOfMonth ? Number(dayOfMonth) : null,
    accountId: accId,
    defaultAccountId: accId,
    createdAt: Date.now(),
  };
}
