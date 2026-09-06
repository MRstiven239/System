import { useMemo, useState } from 'react';
import { ThemeContext } from './theme/ThemeContext';
import { useThemeChoice } from './hooks/useThemeChoice';
import { useHabits } from './hooks/useHabits';
import { useBudget } from './hooks/useBudget';
import { useCalendarNavigation } from './hooks/useCalendarNavigation';
import { useHabitModal } from './hooks/useHabitModal';
import { useGrowthPulse } from './hooks/useGrowthPulse';
import { useGoals } from './hooks/useGoals';
import { useReflections } from './hooks/useReflections';
import { today as getToday } from './domain/dates';
import { DANGER } from './theme/semanticColors';

import { AppLayout } from './components/layout/AppLayout';
import { AmbientBackground } from './components/common/AmbientBackground';
import { HomeView } from './components/home/HomeView';
import { GoalsView } from './components/goals/GoalsView';
import { ReflectionsView } from './components/reflections/ReflectionsView';
import { SettingsView } from './components/settings/SettingsView';

// Components for Garden (new)
import { GardenView } from './components/garden/GardenView';
import { Modal } from './components/common/Modal';
import { HabitForm } from './components/habit-form/HabitForm';
import { HabitModal } from './components/habit-modal/HabitModal';

// Components for Budget (new)
import { MoneyView } from './components/money/MoneyView';

/**
 * The composition root.
 */
function AppContent({ theme, themeKey, setThemeKey }) {
  const { habits, loaded, saveError, addHabit, updateHabit, deleteHabit, toggleCompletion } = useHabits();
  const budget = useBudget();
  const { range, setRange } = useCalendarNavigation('month');
  const modal = useHabitModal();
  const { bump, pulseKeyFor } = useGrowthPulse();
  const goalsData = useGoals();
  const reflectionsData = useReflections();
  
  const [isCreating, setIsCreating] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const today = useMemo(() => getToday(), []);
  const modalHabit = habits.find((h) => h.id === modal.openHabitId) || null;

  function handleToggleDay(habitId, dateKey) {
    const habit = habits.find((h) => h.id === habitId);
    const wasCompleted = habit ? habit.completions.includes(dateKey) : false;
    toggleCompletion(habitId, dateKey);
    if (!wasCompleted) bump(habitId);
  }

  return (
    <>
      <AmbientBackground />
      <AppLayout activeSection={activeSection} onSectionChange={setActiveSection}>
        {/* ── Home ─────────────────────────────────────────────── */}
        {activeSection === 'home' && (
          <HomeView 
            habits={habits}
            accounts={budget.accounts}
            transactions={budget.transactions}
            goals={goalsData.goals}
            reflections={reflectionsData.reflections}
            today={today}
            onNavigate={setActiveSection}
          />
        )}

        {/* ── Garden tab ─────────────────────────────────────────────── */}
        {activeSection === 'garden' && (
          <GardenView
            habits={habits}
            range={range}
            setRange={setRange}
            loaded={loaded}
            saveError={saveError}
            today={today}
            setIsCreating={setIsCreating}
            handleToggleDay={handleToggleDay}
            modalOpen={modal.open}
          />
        )}

        {/* ── Budget tab ─────────────────────────────────────────────── */}
        {activeSection === 'money' && (
          <MoneyView
            accounts={budget.accounts}
            transactions={budget.transactions}
            loaded={budget.loaded}
            addAccount={budget.addAccount}
            updateAccount={budget.updateAccount}
            deleteAccount={budget.deleteAccount}
            addExpense={budget.addExpense}
            addIncome={budget.addIncome}
            addTransfer={budget.addTransfer}
            deleteTransaction={budget.deleteTransaction}
          />
        )}

        {/* ── Goals ─────────────────────────────────────────────── */}
        {activeSection === 'goals' && (
          <GoalsView 
            goals={goalsData.goals}
            loaded={goalsData.loaded}
            addGoal={goalsData.addGoal}
            updateGoal={goalsData.updateGoal}
            deleteGoal={goalsData.deleteGoal}
            toggleChecklistItem={goalsData.toggleChecklistItem}
            accounts={budget.accounts}
            transactions={budget.transactions}
            habits={habits}
          />
        )}

        {/* ── Reflections ─────────────────────────────────────────────── */}
        {activeSection === 'reflections' && (
          <ReflectionsView 
            reflections={reflectionsData.reflections}
            loaded={reflectionsData.loaded}
            addReflection={reflectionsData.addReflection}
            updateReflection={reflectionsData.updateReflection}
            deleteReflection={reflectionsData.deleteReflection}
          />
        )}

        {/* ── Settings ─────────────────────────────────────────────── */}
        {activeSection === 'settings' && (
          <SettingsView themeKey={themeKey} setThemeKey={setThemeKey} />
        )}

        {/* ── Garden modals (only relevant in garden tab) ──────────────── */}
        {isCreating && (
          <Modal onClose={() => setIsCreating(false)}>
            <h3 style={{ fontFamily: 'Fraunces, serif', color: theme.ink }} className="text-lg font-semibold mb-4">
              Nuevo hábito
            </h3>
            <HabitForm
              defaultColor={theme.palette[0]}
              onCancel={() => setIsCreating(false)}
              onSubmit={(data) => {
                addHabit(data);
                setIsCreating(false);
              }}
              submitLabel="Crear hábito"
            />
          </Modal>
        )}

        {modalHabit && (
          <HabitModal
            habit={modalHabit}
            today={today}
            pulseKey={pulseKeyFor(modalHabit.id)}
            isEditing={modal.isEditing}
            isConfirmingDelete={modal.isConfirmingDelete}
            onClose={modal.close}
            onStartEditing={modal.startEditing}
            onCancelEditing={modal.cancelEditing}
            onAskDeleteConfirmation={modal.askDeleteConfirmation}
            onCancelDeleteConfirmation={modal.cancelDeleteConfirmation}
            onUpdate={(id, data) => {
              updateHabit(id, data);
              modal.cancelEditing();
            }}
            onDelete={(id) => {
              deleteHabit(id);
              modal.close();
            }}
          />
        )}
      </AppLayout>
    </>
  );
}

export default function App() {
  const { theme, themeKey, setThemeKey } = useThemeChoice();

  return (
    <ThemeContext.Provider value={theme}>
      <AppContent theme={theme} themeKey={themeKey} setThemeKey={setThemeKey} />
    </ThemeContext.Provider>
  );
}

