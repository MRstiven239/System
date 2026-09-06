// RecurringTemplate domain — pure functions

function makeIdSimple() {
  return Math.random().toString(36).substring(2, 9);
}

export function createRecurringTemplate({
  name,
  type,        // 'expense' | 'income'
  amount,
  icon,        // emoji opcional
  category,    // string opcional
  dayOfMonth,  // número opcional (1-31)
  accountId,   // cuenta predeterminada opcional
}) {
  return {
    id: makeIdSimple(),
    name,
    type,
    amount: Math.abs(Number(amount)),
    icon: icon || (type === 'expense' ? '💸' : '💚'),
    category: category || '',
    dayOfMonth: dayOfMonth ? Number(dayOfMonth) : null,
    accountId: accountId || null,
    createdAt: Date.now(),
  };
}
