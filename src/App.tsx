import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { BudgetWizard } from './components/budget/BudgetWizard';
import { BudgetSummaryView } from './components/budget/BudgetSummaryView';
import { EditCategoryModal } from './components/budget/EditCategoryModal';
import { CategoryWizard } from './components/CategoryWizard';
import { ServiceWizard } from './components/ServiceWizard';
import { MobileWizard } from './components/MobileWizard';
import { SummaryScreen } from './components/SummaryScreen';
import { Dashboard } from './components/Dashboard';
import { CurrentBalanceInput } from './components/forecast/CurrentBalanceInput';
import { ForecastWizard } from './components/forecast/ForecastWizard';
import { ForecastSummary } from './components/forecast/ForecastSummary';
import { SettingsPage } from './components/SettingsPage';
import { supabase, Subscription, HouseholdBudget } from './lib/supabase';
import { TopCategoryId } from './data/presets';

type View =
  | 'welcome'
  | 'budget-wizard'
  | 'subscription-category-wizard'
  | 'subscription-service-wizard'
  | 'subscription-mobile-wizard'
  | 'subscription-summary'
  | 'budget-summary'
  | 'subscriptions-dashboard'
  | 'forecast-balance-input'
  | 'forecast-wizard'
  | 'forecast-summary'
  | 'settings';

interface SelectedService {
  serviceId: string;
  categoryId: TopCategoryId;
  serviceName: string;
  planId: string | null;
  planName: string | null;
  approxMonthlyJPY: number;
  billingCycle: 'monthly' | 'yearly';
  customName?: string;
}

interface MobileSubscription {
  carrierId: string;
  carrierName: string;
  approxMonthlyJPY: number;
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState<View>('welcome');
  const [budget, setBudget] = useState<HouseholdBudget | null>(null);
  const [pendingBudget, setPendingBudget] = useState<Partial<HouseholdBudget> | null>(null);
  const [editingCategory, setEditingCategory] = useState<keyof HouseholdBudget | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<TopCategoryId[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [mobileSubscriptions, setMobileSubscriptions] = useState<MobileSubscription[]>([]);
  const [allSubscriptions, setAllSubscriptions] = useState<Partial<Subscription>[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardKey, setWizardKey] = useState(0);
  const [forecastBalance, setForecastBalance] = useState(0);
  const [forecastEvents, setForecastEvents] = useState<Array<{
    label: string;
    year: number;
    month: number;
    amount: number;
    type: 'income' | 'expense';
    category: string;
  }>>([]);
  const [budgetSummaryDefaultTab, setBudgetSummaryDefaultTab] = useState<'monthly' | 'forecast'>('monthly');

  useEffect(() => {
    if (user) {
      checkBudgetStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkBudgetStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('household_budgets')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.completed_wizard) {
        setBudget(data);
        await loadForecastData();
        setBudgetSummaryDefaultTab('forecast');
        setView('budget-summary');
      } else {
        setView('budget-wizard');
      }
    } catch (error) {
      console.error('Error checking budget status:', error);
      setView('budget-wizard');
    } finally {
      setLoading(false);
    }
  };

  const loadForecastData = async () => {
    try {
      const { data: forecastData, error: forecastError } = await supabase
        .from('year_forecasts')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (forecastError && forecastError.code !== 'PGRST116') {
        throw forecastError;
      }

      if (forecastData) {
        setForecastBalance(forecastData.current_balance);

        const { data: eventsData, error: eventsError } = await supabase
          .from('future_events')
          .select('*')
          .eq('user_id', user!.id)
          .order('year', { ascending: true })
          .order('month', { ascending: true });

        if (eventsError) throw eventsError;

        setForecastEvents(eventsData || []);
        setBudgetSummaryDefaultTab('forecast');
      }
    } catch (error) {
      console.error('Error loading forecast data:', error);
    }
  };

  const handleBudgetWizardComplete = async (completedBudget: Partial<HouseholdBudget>) => {
    try {
      const { data, error } = await supabase
        .from('household_budgets')
        .upsert(
          {
            user_id: user!.id,
            ...completedBudget,
            completed_wizard: true,
          },
          {
            onConflict: 'user_id',
          }
        )
        .select()
        .single();

      if (error) throw error;

      setBudget(data);
      setView('budget-summary');
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('予算の保存に失敗しました。もう一度お試しください。');
    }
  };

  const handleSubscriptionsDetailed = (currentBudget: Partial<HouseholdBudget>) => {
    setPendingBudget(currentBudget);
    setView('subscription-category-wizard');
  };

  const handleCategoryComplete = (categories: TopCategoryId[]) => {
    setSelectedCategories(categories);
    if (categories.length === 0) {
      handleMobileSkip();
    } else {
      setView('subscription-service-wizard');
    }
  };

  const handleServiceComplete = async (services: SelectedService[]) => {
    setSelectedServices(services);
    await saveAllSubscriptions(services, []);
  };

  const handleMobileComplete = async (mobiles: MobileSubscription[]) => {
    setMobileSubscriptions(mobiles);
    await saveAllSubscriptions(selectedServices, mobiles);
  };

  const handleMobileSkip = async () => {
    await saveAllSubscriptions(selectedServices, []);
  };

  const saveAllSubscriptions = async (services: SelectedService[], mobiles: MobileSubscription[]) => {
    try {
      const { error: deleteError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', user!.id);

      if (deleteError) throw deleteError;

      const subscriptionsToSave: Partial<Subscription>[] = [
        ...services.map((service) => ({
          user_id: user!.id,
          service_id: service.serviceId,
          custom_name: service.customName || null,
          category_id: service.categoryId,
          plan_id: service.planId,
          amount_jpy: null,
          approx_monthly_jpy: service.approxMonthlyJPY,
          billing_cycle: service.billingCycle,
          accuracy: 'rough' as const,
          first_billing_date: null,
          next_billing_date: null,
          is_active: true,
          tags: [],
        })),
        ...mobiles.map((mobile) => ({
          user_id: user!.id,
          service_id: `mobile-${mobile.carrierId}`,
          custom_name: mobile.carrierName,
          category_id: 'other' as TopCategoryId,
          plan_id: null,
          amount_jpy: null,
          approx_monthly_jpy: mobile.approxMonthlyJPY,
          billing_cycle: 'monthly' as const,
          accuracy: 'rough' as const,
          first_billing_date: null,
          next_billing_date: null,
          is_active: true,
          tags: ['mobile'],
        })),
      ];

      setAllSubscriptions(subscriptionsToSave);

      if (subscriptionsToSave.length > 0) {
        const { error } = await supabase.from('subscriptions').insert(subscriptionsToSave);
        if (error) throw error;
      }

      const totalSubscriptions = subscriptionsToSave.reduce(
        (sum, sub) => sum + (sub.approx_monthly_jpy || 0),
        0
      );

      const updatedBudget = {
        ...pendingBudget,
        subscriptions_total: totalSubscriptions,
        subscriptions_mode: 'detailed' as const,
      };

      setPendingBudget(updatedBudget);
      setView('subscription-summary');
    } catch (error) {
      console.error('Error saving subscriptions:', error);
      alert('サブスクの保存に失敗しました。もう一度お試しください。');
    }
  };

  const handleSubscriptionSummaryComplete = async () => {
    if (pendingBudget) {
      await handleBudgetWizardComplete(pendingBudget);
    }
  };

  const handleEditCategory = async (category: keyof HouseholdBudget, value: number, memo: string) => {
    try {
      const memoField = `${category}_memo` as keyof HouseholdBudget;
      const { data, error } = await supabase
        .from('household_budgets')
        .update({
          [category]: value,
          [memoField]: memo || null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user!.id)
        .select()
        .single();

      if (error) throw error;

      setBudget(data);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('更新に失敗しました。もう一度お試しください。');
    }
  };

  const handleEditSubscriptions = () => {
    setBudgetSummaryDefaultTab('monthly');
    if (budget?.subscriptions_mode === 'detailed') {
      setPendingBudget(budget);
      setView('subscription-category-wizard');
    } else {
      setView('subscriptions-dashboard');
    }
  };

  const handleBackToBudgetSummary = () => {
    setBudgetSummaryDefaultTab('monthly');
    setView('budget-summary');
    checkBudgetStatus();
  };

  const handleResetBudget = async () => {
    if (!budget) return;

    const confirmReset = window.confirm(
      'すべての入力内容がリセットされ、最初から入力し直すことになります。\n本当にリセットしますか？'
    );

    if (!confirmReset) return;

    try {
      // Increment reset count and mark wizard as incomplete
      const { error } = await supabase
        .from('household_budgets')
        .update({
          completed_wizard: false,
          reset_count: budget.reset_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user!.id);

      if (error) throw error;

      // Reset local state and restart wizard
      setBudget(null);
      setWizardKey(prev => prev + 1);
      setView('budget-wizard');
    } catch (error) {
      console.error('Error resetting budget:', error);
      alert('リセットに失敗しました。もう一度お試しください。');
    }
  };

  const handleStartForecast = async () => {
    setLoading(true);
    try {
      const { data: forecastData, error: forecastError } = await supabase
        .from('year_forecasts')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (forecastError && forecastError.code !== 'PGRST116') {
        throw forecastError;
      }

      if (forecastData) {
        setForecastBalance(forecastData.current_balance);

        const { data: eventsData, error: eventsError } = await supabase
          .from('future_events')
          .select('*')
          .eq('user_id', user!.id)
          .order('year', { ascending: true })
          .order('month', { ascending: true });

        if (eventsError) throw eventsError;

        setForecastEvents(eventsData || []);
        setView('budget-summary');
      } else {
        setView('forecast-balance-input');
      }
    } catch (error) {
      console.error('Error loading forecast data:', error);
      setView('forecast-balance-input');
    } finally {
      setLoading(false);
    }
  };

  const handleForecastBalanceNext = async (balance: number) => {
    setForecastBalance(balance);

    if (!budget) {
      setView('forecast-wizard');
      return;
    }

    try {
      const fixedTotal =
        (budget.rent || 0) +
        (budget.utilities || 0) +
        (budget.internet || 0) +
        (budget.mobile || 0) +
        (budget.car || 0) +
        (budget.insurance || 0) +
        (budget.kids || 0) +
        (budget.savings || 0) +
        (budget.subscriptions_total || 0) +
        (budget.debt_repayment || 0);

      const { data: existingForecast } = await supabase
        .from('year_forecasts')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (existingForecast) {
        await supabase
          .from('year_forecasts')
          .update({
            current_balance: balance,
            base_income: budget.monthly_income || 0,
            base_fixed_total: fixedTotal,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user!.id);

        await loadForecastData();
        setBudgetSummaryDefaultTab('forecast');
        setView('budget-summary');
      } else {
        setView('forecast-wizard');
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      setView('forecast-wizard');
    }
  };

  const handleForecastBalanceSkip = () => {
    setForecastBalance(0);
    setView('forecast-wizard');
  };

  const handleForecastWizardComplete = async (events: typeof forecastEvents) => {
    setForecastEvents(events);

    if (!budget) return;

    try {
      const fixedTotal =
        (budget.rent || 0) +
        (budget.utilities || 0) +
        (budget.internet || 0) +
        (budget.mobile || 0) +
        (budget.car || 0) +
        (budget.insurance || 0) +
        (budget.kids || 0) +
        (budget.savings || 0) +
        (budget.subscriptions_total || 0) +
        (budget.debt_repayment || 0);

      const { data: forecastData, error: forecastError } = await supabase
        .from('year_forecasts')
        .upsert(
          {
            user_id: user!.id,
            current_balance: forecastBalance,
            base_income: budget.monthly_income || 0,
            base_fixed_total: fixedTotal,
            forecast_months: 12,
          },
          {
            onConflict: 'user_id',
          }
        )
        .select()
        .single();

      if (forecastError) throw forecastError;

      if (events.length > 0) {
        const { error: deleteError } = await supabase
          .from('future_events')
          .delete()
          .eq('year_forecast_id', forecastData.id);

        if (deleteError) throw deleteError;

        const eventsToInsert = events.map(event => ({
          user_id: user!.id,
          year_forecast_id: forecastData.id,
          label: event.label,
          year: event.year,
          month: event.month,
          amount: event.amount,
          type: event.type || 'expense',
          category: event.category,
        }));

        const { error: eventsError } = await supabase
          .from('future_events')
          .insert(eventsToInsert);

        if (eventsError) throw eventsError;
      }

      await loadForecastData();
      setView('budget-summary');
    } catch (error) {
      console.error('Error saving forecast:', error);
      alert('予測の保存に失敗しました。もう一度お試しください。');
    }
  };

  const handleSaveEvents = async (updatedEvents: typeof forecastEvents) => {
    setForecastEvents(updatedEvents);

    if (!budget || !user) return;

    try {
      const { data: forecastData, error: forecastError } = await supabase
        .from('year_forecasts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (forecastError) throw forecastError;
      if (!forecastData) return;

      const { error: deleteError } = await supabase
        .from('future_events')
        .delete()
        .eq('year_forecast_id', forecastData.id);

      if (deleteError) throw deleteError;

      if (updatedEvents.length > 0) {
        const eventsToInsert = updatedEvents.map(event => ({
          user_id: user.id,
          year_forecast_id: forecastData.id,
          label: event.label,
          year: event.year,
          month: event.month,
          amount: event.amount,
          type: event.type || 'expense',
          category: event.category,
        }));

        const { error: eventsError } = await supabase
          .from('future_events')
          .insert(eventsToInsert);

        if (eventsError) throw eventsError;
      }
    } catch (error) {
      console.error('Error saving events:', error);
      alert('予定の保存に失敗しました。もう一度お試しください。');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <WelcomeScreen
        onStart={() => setView('budget-wizard')}
      />
    );
  }

  if (view === 'budget-wizard') {
    return (
      <BudgetWizard
        key={wizardKey}
        onComplete={handleBudgetWizardComplete}
        onSubscriptionsDetailed={handleSubscriptionsDetailed}
      />
    );
  }

  if (view === 'subscription-category-wizard') {
    return <CategoryWizard onComplete={handleCategoryComplete} />;
  }

  if (view === 'subscription-service-wizard') {
    return (
      <ServiceWizard
        selectedCategories={selectedCategories}
        onComplete={handleServiceComplete}
        onBack={() => setView('subscription-category-wizard')}
      />
    );
  }

  if (view === 'subscription-mobile-wizard') {
    return (
      <MobileWizard onComplete={handleMobileComplete} onSkip={handleMobileSkip} />
    );
  }

  if (view === 'subscription-summary') {
    return (
      <SummaryScreen
        subscriptions={allSubscriptions}
        onGoToDashboard={handleSubscriptionSummaryComplete}
      />
    );
  }

  if (view === 'subscriptions-dashboard') {
    return <Dashboard onAddSubscription={handleBackToBudgetSummary} />;
  }

  if (view === 'forecast-balance-input') {
    return (
      <CurrentBalanceInput
        onNext={handleForecastBalanceNext}
        onSkip={handleForecastBalanceSkip}
      />
    );
  }

  if (view === 'forecast-wizard') {
    if (!budget) return null;
    const fixedTotal =
      (budget.rent || 0) +
      (budget.utilities || 0) +
      (budget.internet || 0) +
      (budget.mobile || 0) +
      (budget.car || 0) +
      (budget.insurance || 0) +
      (budget.kids || 0) +
      (budget.savings || 0) +
      (budget.subscriptions_total || 0);

    return (
      <ForecastWizard
        currentBalance={forecastBalance}
        monthlyIncome={budget.monthly_income || 0}
        monthlyFixed={fixedTotal}
        onComplete={handleForecastWizardComplete}
        onBack={() => setView('forecast-balance-input')}
      />
    );
  }

  if (view === 'forecast-summary') {
    if (!budget) return null;
    const fixedTotal =
      (budget.rent || 0) +
      (budget.utilities || 0) +
      (budget.internet || 0) +
      (budget.mobile || 0) +
      (budget.car || 0) +
      (budget.insurance || 0) +
      (budget.kids || 0) +
      (budget.savings || 0) +
      (budget.subscriptions_total || 0);

    return (
      <ForecastSummary
        currentBalance={forecastBalance}
        monthlyIncome={budget.monthly_income || 0}
        monthlyFixed={fixedTotal}
        events={forecastEvents}
        onBack={() => setView('budget-summary')}
        onEditBalance={() => setView('forecast-balance-input')}
        onSaveEvents={handleSaveEvents}
      />
    );
  }

  if (view === 'budget-summary' && budget) {
    const getCategoryConfig = (category: keyof HouseholdBudget) => {
      const configs: Record<string, { min: number; max: number; step: number }> = {
        monthly_income: { min: 0, max: 1000000, step: 10000 },
        rent: { min: 0, max: 200000, step: 5000 },
        utilities: { min: 0, max: 50000, step: 1000 },
        internet: { min: 0, max: 15000, step: 500 },
        mobile: { min: 0, max: 20000, step: 1000 },
        car: { min: 0, max: 100000, step: 5000 },
        insurance: { min: 0, max: 50000, step: 1000 },
        kids: { min: 0, max: 100000, step: 5000 },
        savings: { min: 0, max: 100000, step: 5000 },
        variable_expenses: { min: 0, max: 200000, step: 5000 },
        debt_repayment: { min: 0, max: 100000, step: 5000 },
      };
      return configs[category] || { min: 0, max: 100000, step: 1000 };
    };

    return (
      <>
        <BudgetSummaryView
          budget={budget}
          onEdit={setEditingCategory}
          onEditSubscriptions={handleEditSubscriptions}
          onReset={handleResetBudget}
          onStartForecast={handleStartForecast}
          onOpenSettings={() => setView('settings')}
          forecastBalance={forecastBalance}
          forecastEvents={forecastEvents}
          onSaveEvents={handleSaveEvents}
          onEditBalance={() => {
            setBudgetSummaryDefaultTab('forecast');
            setView('forecast-balance-input');
          }}
          defaultTab={budgetSummaryDefaultTab}
        />
        {editingCategory && typeof budget[editingCategory] === 'number' && (
          <EditCategoryModal
            category={editingCategory}
            currentValue={budget[editingCategory] as number}
            currentMemo={budget[`${editingCategory}_memo` as keyof HouseholdBudget] as string | undefined}
            {...getCategoryConfig(editingCategory)}
            onSave={(value, memo) => handleEditCategory(editingCategory, value, memo)}
            onClose={() => setEditingCategory(null)}
          />
        )}
      </>
    );
  }

  if (view === 'settings') {
    return (
      <SettingsPage
        onBack={() => {
          setBudgetSummaryDefaultTab('monthly');
          setView('budget-summary');
        }}
        onReset={handleResetBudget}
      />
    );
  }

  return null;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
