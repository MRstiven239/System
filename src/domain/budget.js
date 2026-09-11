// Budget domain — pure functions with no React or storage dependencies.
// Every mutation returns a new value; nothing here has side effects.

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

// ─── Account ──────────────────────────────────────────────────────────────────

/**
 * Builds a new account from form data.
 * `balance` is the *initial* balance the user sets when creating the account.
 */
export function createAccount({ name, emoji, balance }) {
  return {
    id: makeId(),
    name,
    emoji: emoji || '🏦',
    initialBalance: Number(balance) || 0,
    createdAt: Date.now(),
  };
}

// ─── Transactions ──────────────────────────────────────────────────────────────

/**
 * An ingreso (income) increases one account's effective balance.
 */
export function createIncome(name, amount, accountId, category = '') {
  return {
    id: makeId(),
    type: 'income',
    name,
    amount: Math.abs(Number(amount)),
    accountId,
    category,
    date: Date.now(),
  };
}

export function createExpense(name, amount, accountId, category = '') {
  return {
    id: makeId(),
    type: 'expense',
    name,
    amount: Math.abs(Number(amount)),
    accountId,
    category,
    date: Date.now(),
  };
}

/**
 * A transfer moves money from one account to another.
 * The *total* balance stays the same; only per-account balances shift.
 */
export function createTransfer({ amount, description, fromAccountId, toAccountId, date }) {
  return {
    id: makeId(),
    type: 'transfer',
    amount: Math.abs(Number(amount)),
    description: description || '',
    accountId: fromAccountId,   // source
    toAccountId,                // destination
    date,
    createdAt: Date.now(),
  };
}

// ─── Balance computation ───────────────────────────────────────────────────────

/**
 * Computes the current effective balance for every account,
 * applying all transactions on top of their initial balances.
 * Returns a Map<accountId, effectiveBalance>.
 */
export function computeBalances(accounts, transactions) {
  const map = new Map(accounts.map((a) => [a.id, a.initialBalance]));

  for (const tx of transactions) {
    if (tx.type === 'expense') {
      map.set(tx.accountId, (map.get(tx.accountId) ?? 0) - tx.amount);
    } else if (tx.type === 'income') {
      map.set(tx.accountId, (map.get(tx.accountId) ?? 0) + tx.amount);
    } else if (tx.type === 'transfer') {
      map.set(tx.accountId, (map.get(tx.accountId) ?? 0) - tx.amount);
      if (tx.toAccountId) {
        map.set(tx.toAccountId, (map.get(tx.toAccountId) ?? 0) + tx.amount);
      }
    }
  }

  return map;
}

/**
 * Total balance across all accounts at the current moment.
 */
export function totalBalance(accounts, transactions) {
  const map = computeBalances(accounts, transactions);
  let sum = 0;
  for (const v of map.values()) sum += v;
  return sum;
}

export function periodFinancials(transactions, startDate, endDate) {
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const t of transactions) {
    if (t.date >= startDate && t.date <= endDate) {
      if (t.type === 'income') totalIncome += t.amount;
      else if (t.type === 'expense') totalExpenses += t.amount;
    }
  }

  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) : 0;

  return { totalIncome, totalExpenses, netBalance, savingsRate };
}

export function findDuplicateInPeriod(transactions, template, periodStart, periodEnd) {
  return transactions.find(t => 
    t.type === template.type &&
    t.name.toLowerCase() === template.name.toLowerCase() &&
    Math.abs(t.amount - template.amount) < 1 &&
    t.date >= periodStart && t.date <= periodEnd
  ) || null;
}

export function balanceHistoryEnriched(accounts, transactions, range = 'month', anchorDate = new Date()) {
  const baseHistory = balanceHistory(accounts, transactions, range, anchorDate);
  // Add income/expense per data point
  return baseHistory.map(point => {
    let income = 0;
    let expense = 0;
    
    // Find transactions on this specific day
    const dayStart = new Date(point.date).setHours(0,0,0,0);
    const dayEnd = new Date(point.date).setHours(23,59,59,999);
    
    for (const t of transactions) {
      if (t.date >= dayStart && t.date <= dayEnd) {
        if (t.type === 'income') income += t.amount;
        if (t.type === 'expense') expense += t.amount;
      }
    }
    
    return { ...point, income, expense, change: income - expense };
  });
}

// ─── Chart data ───────────────────────────────────────────────────────────────

/**
 * Builds the data series for the balance line chart.
 *
 * @param {'week'|'month'|'year'} range
 * @param {string} anchorDate  'YYYY-MM-DD' — the "today" reference point
 * @returns Array of { date: 'YYYY-MM-DD', balance: number }
 *
 * Strategy: start from the total initial balance, then replay transactions
 * chronologically up to each date point.
 */
export function balanceHistory(accounts, transactions, range, anchorDate) {
  const dates = buildDatePoints(range, anchorDate);
  if (dates.length === 0 || accounts.length === 0) return [];

  const initialTotal = accounts.reduce((s, a) => s + a.initialBalance, 0);

  // Sort all transactions by date ascending
  const sorted = [...transactions].sort((a, b) => (a.date < b.date ? -1 : 1));

  return dates.map((dateStr) => {
    // Sum all transactions up to and including this date
    let delta = 0;
    const targetTime = new Date(dateStr + 'T23:59:59.999').getTime();
    for (const tx of sorted) {
      if (tx.date > targetTime) break;
      if (tx.type === 'expense') delta -= tx.amount;
      else if (tx.type === 'income') delta += tx.amount;
      // transfers don't change total balance
    }
    return { date: dateStr, balance: initialTotal + delta };
  });
}

/** Generates the list of date label strings for a given range. */
function buildDatePoints(range, anchorDate) {
  const anchor = new Date(anchorDate + 'T00:00:00');
  const fmt = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  if (range === 'week') {
    // Current calendar week (Monday to Sunday)
    const day = anchor.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const monday = new Date(anchor);
    monday.setDate(monday.getDate() - diffToMonday);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return fmt(d);
    });
  }

  if (range === 'month') {
    // Last 30 days including today
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(anchor);
      d.setDate(d.getDate() - (29 - i));
      return fmt(d);
    });
  }

  if (range === 'year') {
    // Last 12 months: one point per month (last day of each month up to today)
    const points = [];
    for (let m = 11; m >= 0; m--) {
      const d = new Date(anchor.getFullYear(), anchor.getMonth() - m + 1, 0); // last day of month
      // Don't go beyond today
      const capped = d > anchor ? anchor : d;
      points.push(fmt(capped));
    }
    return points;
  }

  return [];
}

/** Short label for a date point depending on range. */
export function dateLabel(dateStr, range) {
  const d = new Date(dateStr + 'T00:00:00');
  if (range === 'week') {
    return ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d.getDay()];
  }
  if (range === 'month') {
    return String(d.getDate());
  }
  if (range === 'year') {
    return ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][d.getMonth()];
  }
  return dateStr;
}

/** Format a COP amount as a readable string. */
export function formatCOP(amount) {
  // Use full format instead of abbreviated
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}
