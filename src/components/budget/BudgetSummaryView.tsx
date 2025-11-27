import { useEffect, useState } from 'react';
import { Baby, Calendar, Car, CreditCard, CreditCard as Edit2, DollarSign, Home, LogOut, PieChart, Plus, RotateCcw, Shield, ShoppingCart, Smartphone, Sparkles, Trash2, TrendingUp, TrendingUp as Savings, User, Wallet, Wifi, Zap } from 'lucide-react';
import { Logo } from '../Logo';
import { useAuth } from '../../contexts/AuthContext';
import { AddCustomExpenseModal } from './AddCustomExpenseModal';
import { DetailedCategoryModal } from './DetailedCategoryModal';
import { DetailedVariableExpensesModal } from './DetailedVariableExpensesModal';
import { ForecastSummary } from '../forecast/ForecastSummary';
import { CategoryExpenseItem, CustomExpense, HouseholdBudget, VariableExpenseItem, supabase } from '../../lib/supabase';

interface BudgetSummaryViewProps {
  budget: HouseholdBudget;
  onEdit: (category: keyof HouseholdBudget) => void;
  onEditSubscriptions: () => void;
  onReset: () => void;
  onStartForecast: () => void;
  onOpenSettings: () => void;
  forecastBalance?: number;
  forecastEvents?: any[];
  onSaveEvents?: (events: any[]) => Promise<void>;
  onEditBalance?: () => void;
  defaultTab?: 'monthly' | 'forecast';
}

export function BudgetSummaryView({ budget, onEdit, onEditSubscriptions, onReset, onStartForecast, onOpenSettings, forecastBalance = 0, forecastEvents = [], onSaveEvents, onEditBalance, defaultTab = 'monthly' }: BudgetSummaryViewProps) {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'monthly' | 'forecast'>(defaultTab);
  const [forecastInitialized, setForecastInitialized] = useState(false);
  const [localForecastBalance, setLocalForecastBalance] = useState(forecastBalance);
  const [localForecastEvents, setLocalForecastEvents] = useState(forecastEvents);
  const [forecastLoading, setForecastLoading] = useState(false);

  useEffect(() => {
    setLocalForecastBalance(forecastBalance);
    setLocalForecastEvents(forecastEvents);
    if (forecastBalance > 0 || forecastEvents.length > 0) {
      setForecastInitialized(true);
      if (defaultTab === 'forecast') {
        setActiveTab('forecast');
      }
    }
  }, [forecastBalance, forecastEvents, defaultTab]);

  const handleTabChange = async (tab: 'monthly' | 'forecast') => {
    setActiveTab(tab);
    if (tab === 'forecast' && !forecastInitialized) {
      setForecastLoading(true);
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
          setLocalForecastBalance(forecastData.current_balance);

          const { data: eventsData, error: eventsError } = await supabase
            .from('future_events')
            .select('*')
            .eq('user_id', user!.id)
            .order('year', { ascending: true })
            .order('month', { ascending: true });

          if (eventsError) throw eventsError;

          setLocalForecastEvents(eventsData || []);
          setForecastInitialized(true);
        } else {
          onStartForecast();
        }
      } catch (error) {
        console.error('Error loading forecast data:', error);
        onStartForecast();
      } finally {
        setForecastLoading(false);
      }
    }
  };
  const [actualSubscriptionsTotal, setActualSubscriptionsTotal] = useState<number | null>(null);
  const [customExpenses, setCustomExpenses] = useState<CustomExpense[]>([]);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showVariableExpensesModal, setShowVariableExpensesModal] = useState(false);
  const [variableExpenseItems, setVariableExpenseItems] = useState<VariableExpenseItem[]>([]);
  const [actualVariableExpensesTotal, setActualVariableExpensesTotal] = useState<number | null>(null);
  const [editingDetailedCategory, setEditingDetailedCategory] = useState<string | null>(null);
  const [categoryExpenseItems, setCategoryExpenseItems] = useState<Record<string, CategoryExpenseItem[]>>({});
  const [categoryActualTotals, setCategoryActualTotals] = useState<Record<string, number>>({});
  const [isExpensesExpanded, setIsExpensesExpanded] = useState(false);
  const [isIncomeExpanded, setIsIncomeExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [initializedExpansion, setInitializedExpansion] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isCurrentlyMobile = window.innerWidth < 640;
      setIsMobile(isCurrentlyMobile);

      if (!initializedExpansion) {
        setIsExpensesExpanded(!isCurrentlyMobile);
        setIsIncomeExpanded(!isCurrentlyMobile);
        setInitializedExpansion(true);
      }
    };
    checkMobile();

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newIsMobile = window.innerWidth < 640;
        if (isMobile !== newIsMobile) {
          setIsMobile(newIsMobile);
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [isMobile, initializedExpansion]);

  useEffect(() => {
    if (budget.subscriptions_mode === 'detailed') {
      loadActualSubscriptions();
    }
    if (budget.variable_expenses_mode === 'detailed') {
      loadVariableExpenseItems();
    }
    loadCustomExpenses();
    loadAllCategoryItems();
  }, [budget.subscriptions_mode, budget.variable_expenses_mode, budget.id]);

  const loadActualSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('approx_monthly_jpy')
        .eq('user_id', user!.id)
        .eq('is_active', true);

      if (error) throw error;

      const total = data?.reduce((sum, sub) => sum + sub.approx_monthly_jpy, 0) || 0;
      setActualSubscriptionsTotal(total);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      setActualSubscriptionsTotal(null);
    }
  };

  const loadVariableExpenseItems = async () => {
    try {
      const { data, error } = await supabase
        .from('variable_expense_items')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const total = data?.reduce((sum, item) => sum + item.amount, 0) || 0;
      setVariableExpenseItems(data || []);
      setActualVariableExpensesTotal(total);
    } catch (error) {
      console.error('Error loading variable expense items:', error);
      setActualVariableExpensesTotal(null);
    }
  };

  const loadCustomExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_expenses')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomExpenses(data || []);
    } catch (error) {
      console.error('Error loading custom expenses:', error);
    }
  };

  const loadAllCategoryItems = async () => {
    const categories = ['rent', 'utilities', 'internet', 'mobile', 'car', 'insurance', 'kids', 'savings', 'debt_repayment'];

    try {
      const { data, error } = await supabase
        .from('category_expense_items')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const itemsByCategory: Record<string, CategoryExpenseItem[]> = {};
      const totalsByCategory: Record<string, number> = {};

      categories.forEach(cat => {
        const items = data?.filter(item => item.category === cat) || [];
        itemsByCategory[cat] = items;
        totalsByCategory[cat] = items.reduce((sum, item) => sum + item.amount, 0);
      });

      setCategoryExpenseItems(itemsByCategory);
      setCategoryActualTotals(totalsByCategory);
    } catch (error) {
      console.error('Error loading category items:', error);
    }
  };

  const handleAddCustomExpense = async (name: string, amount: number, memo: string) => {
    try {
      const { error } = await supabase
        .from('custom_expenses')
        .insert({
          user_id: user!.id,
          name,
          amount,
          memo: memo || null,
        });

      if (error) throw error;

      setShowAddExpenseModal(false);
      loadCustomExpenses();
    } catch (error) {
      console.error('Error adding custom expense:', error);
      alert('追加に失敗しました。もう一度お試しください。');
    }
  };

  const handleDeleteCustomExpense = async (id: string) => {
    if (!window.confirm('この固定費を削除しますか？')) return;

    try {
      const { error } = await supabase
        .from('custom_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadCustomExpenses();
    } catch (error) {
      console.error('Error deleting custom expense:', error);
      alert('削除に失敗しました。もう一度お試しください。');
    }
  };

  const handleSaveVariableExpenses = async (mode: 'rough' | 'detailed', value: number, items: { title: string; amount: number }[]) => {
    try {
      // Update budget mode and value
      const { error: budgetError } = await supabase
        .from('household_budgets')
        .update({
          variable_expenses_mode: mode,
          variable_expenses: value,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user!.id);

      if (budgetError) throw budgetError;

      // If detailed mode, save items
      if (mode === 'detailed') {
        // Delete existing items
        const { error: deleteError } = await supabase
          .from('variable_expense_items')
          .delete()
          .eq('user_id', user!.id);

        if (deleteError) throw deleteError;

        // Insert new items
        if (items.length > 0) {
          const { error: insertError } = await supabase
            .from('variable_expense_items')
            .insert(items.map(item => ({
              user_id: user!.id,
              title: item.title,
              amount: item.amount,
            })));

          if (insertError) throw insertError;
        }

        loadVariableExpenseItems();
      }

      // Reload budget
      window.location.reload();
    } catch (error) {
      console.error('Error saving variable expenses:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    }
  };

  const handleSaveDetailedCategory = async (category: string, mode: 'rough' | 'detailed', value: number, memo: string, items: { title: string; amount: number }[]) => {
    try {
      const modeField = `${category}_mode` as keyof HouseholdBudget;
      const memoField = `${category}_memo` as keyof HouseholdBudget;

      // Update budget mode, value, and memo
      const { error: budgetError } = await supabase
        .from('household_budgets')
        .update({
          [modeField]: mode,
          [category]: value,
          [memoField]: memo || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user!.id);

      if (budgetError) throw budgetError;

      // If detailed mode, save items
      if (mode === 'detailed') {
        // Delete existing items for this category
        const { error: deleteError } = await supabase
          .from('category_expense_items')
          .delete()
          .eq('user_id', user!.id)
          .eq('category', category);

        if (deleteError) throw deleteError;

        // Insert new items
        if (items.length > 0) {
          const { error: insertError } = await supabase
            .from('category_expense_items')
            .insert(items.map(item => ({
              user_id: user!.id,
              category: category,
              title: item.title,
              amount: item.amount,
            })));

          if (insertError) throw insertError;
        }

        loadAllCategoryItems();
      }

      // Reload budget
      window.location.reload();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    }
  };

  const getCategoryAmount = (category: string) => {
    const modeField = `${category}_mode` as keyof HouseholdBudget;
    const mode = budget[modeField] as 'rough' | 'detailed' | undefined;
    if (mode === 'detailed' && categoryActualTotals[category] !== undefined) {
      return categoryActualTotals[category];
    }
    return (budget[category as keyof HouseholdBudget] as number) || 0;
  };

  const income = budget.monthly_income;
  const subscriptionsAmount = actualSubscriptionsTotal !== null ? actualSubscriptionsTotal : budget.subscriptions_total;
  const variableExpensesAmount = actualVariableExpensesTotal !== null ? actualVariableExpensesTotal : budget.variable_expenses;
  const customExpensesTotal = customExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const fixedCosts =
    getCategoryAmount('rent') +
    getCategoryAmount('utilities') +
    getCategoryAmount('internet') +
    getCategoryAmount('mobile') +
    getCategoryAmount('car') +
    getCategoryAmount('insurance') +
    getCategoryAmount('kids') +
    getCategoryAmount('savings') +
    subscriptionsAmount +
    customExpensesTotal +
    getCategoryAmount('debt_repayment');
  const totalExpenses = fixedCosts + variableExpensesAmount;
  const remaining = income - totalExpenses;

  const categories = [
    { key: 'rent' as const, label: '家', amount: getCategoryAmount('rent'), icon: Home, color: 'from-blue-500 to-blue-600', colorClass: 'text-blue-600' },
    { key: 'utilities' as const, label: '光熱費', amount: getCategoryAmount('utilities'), icon: Zap, color: 'from-yellow-500 to-yellow-600', colorClass: 'text-yellow-600' },
    { key: 'internet' as const, label: 'ネット', amount: getCategoryAmount('internet'), icon: Wifi, color: 'from-cyan-500 to-cyan-600', colorClass: 'text-cyan-600' },
    { key: 'mobile' as const, label: '携帯', amount: getCategoryAmount('mobile'), icon: Smartphone, color: 'from-green-500 to-green-600', colorClass: 'text-green-600' },
    { key: 'car' as const, label: '車', amount: getCategoryAmount('car'), icon: Car, color: 'from-orange-500 to-orange-600', colorClass: 'text-orange-600' },
    { key: 'insurance' as const, label: '保険', amount: getCategoryAmount('insurance'), icon: Shield, color: 'from-purple-500 to-purple-600', colorClass: 'text-purple-600' },
    { key: 'kids' as const, label: '子ども', amount: getCategoryAmount('kids'), icon: Baby, color: 'from-pink-500 to-pink-600', colorClass: 'text-pink-600' },
    { key: 'savings' as const, label: '積立', amount: getCategoryAmount('savings'), icon: Savings, color: 'from-indigo-500 to-indigo-600', colorClass: 'text-indigo-600' },
    { key: 'debt_repayment' as const, label: '返済', amount: getCategoryAmount('debt_repayment'), icon: CreditCard, color: 'from-red-500 to-red-600', colorClass: 'text-red-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="mb-2">
                <Logo
                  imageClassName="h-10 md:h-11"
                  textClassName="text-3xl md:text-4xl"
                />
              </h1>
            </div>
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md"
              title="アカウント設定"
            >
              <User className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 border-b border-slate-200">
            <button
              onClick={() => handleTabChange('monthly')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'monthly'
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span>ざっくり月額管理</span>
              {activeTab === 'monthly' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => handleTabChange('forecast')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'forecast'
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>ざっくり未来予想</span>
              {activeTab === 'forecast' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>
        </header>

        {activeTab === 'monthly' && (
          <>
        <div className="grid grid-cols-1 gap-3 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg min-w-0">
            <button
              onClick={() => setIsIncomeExpanded(!isIncomeExpanded)}
              className="w-full p-3 text-left hover:bg-blue-50/50 transition-colors rounded-2xl"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-600">平均手取り</div>
                    <div className="text-lg font-bold text-slate-900 truncate">
                      ¥{income.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </button>
            {isIncomeExpanded && (
              <div className="px-3 pb-3">
                <div className="pt-3 border-t border-blue-200">
                  {budget.monthly_income_memo && (
                    <div className="text-sm text-slate-700 mb-2 bg-white p-2 rounded">
                      {budget.monthly_income_memo}
                    </div>
                  )}
                  <button
                    onClick={() => onEdit('monthly_income' as keyof HouseholdBudget)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    編集
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsExpensesExpanded(!isExpensesExpanded)}
            className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-3 shadow-lg min-w-0 text-left hover:bg-orange-50/50 transition-colors w-full"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <PieChart className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-600">平均支出</div>
                <div className="text-lg font-bold text-slate-900 truncate">
                  ¥{totalExpenses.toLocaleString()}
                </div>
              </div>
            </div>
          </button>

          <div className={`bg-gradient-to-br ${
            remaining >= 0 ? 'from-green-50 to-emerald-50' : 'from-red-50 to-pink-50'
          } rounded-2xl p-3 shadow-lg min-w-0`}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${
                remaining >= 0 ? 'bg-green-600' : 'bg-red-600'
              } rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-600">平均残額</div>
                <div className={`text-lg font-bold truncate ${
                  remaining >= 0 ? 'text-slate-900' : 'text-red-600'
                }`}>
                  ¥{remaining.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isExpensesExpanded && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">支出の内訳</h2>
          <p className="text-sm text-slate-600 mb-4">カードをタップして金額を調整できます</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => setEditingDetailedCategory(cat.key)}
                  className="bg-white border-2 border-slate-200 rounded-xl p-3 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className={`w-8 h-8 bg-gradient-to-br ${cat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-xs text-slate-600 truncate">{cat.label}</div>
                      <div className="text-base font-bold text-slate-900 truncate ml-auto">
                        ¥{cat.amount.toLocaleString()}
                      </div>
                    </div>
                    <Edit2 className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                  </div>
                </button>
              );
            })}

            <button
              onClick={onEditSubscriptions}
              className="bg-white border-2 border-slate-200 rounded-xl p-3 hover:border-blue-500 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-xs text-slate-600 truncate">サブスク</div>
                  <div className="text-base font-bold text-slate-900 truncate ml-auto">
                    ¥{subscriptionsAmount.toLocaleString()}
                  </div>
                </div>
                <Edit2 className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
              </div>
            </button>

            <button
              onClick={() => setShowVariableExpensesModal(true)}
              className="bg-white border-2 border-slate-200 rounded-xl p-3 hover:border-blue-500 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-xs text-slate-600 truncate">変動費</div>
                  <div className="text-base font-bold text-slate-900 truncate ml-auto">
                    ¥{variableExpensesAmount.toLocaleString()}
                  </div>
                </div>
                <Edit2 className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
              </div>
            </button>

            {customExpenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-white border-2 border-slate-200 rounded-xl p-3 text-left group relative"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs text-slate-600 truncate">{expense.name}</div>
                    <div className="text-base font-bold text-slate-900 truncate ml-auto">
                      ¥{expense.amount.toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCustomExpense(expense.id)}
                    className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-3 hover:border-blue-500 hover:bg-blue-50 transition-all text-center group flex flex-col items-center justify-center"
            >
              <div className="w-8 h-8 bg-slate-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center mb-1 transition-colors">
                <Plus className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="text-xs text-slate-600 group-hover:text-blue-600 font-medium transition-colors">
                固定費を追加
              </div>
            </button>
          </div>
        </div>
        )}

        {remaining < 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
            <p className="text-red-700 text-center font-medium">
              支出が収入を超えています。内容を見直すことをおすすめします。
            </p>
          </div>
        )}

        <div className="bg-slate-50 rounded-xl p-6 text-center">
          <p className="text-sm text-slate-600">
            もっと細かく管理したい方は、
            <a href="https://content.zaim.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
              Zaim
            </a>
            {' '}や{' '}
            <a href="https://moneyforward.com/pfm" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">
              マネーフォワード ME
            </a>
            {' '}などの本格家計簿アプリがおすすめです
          </p>
        </div>
        </>
        )}

        {activeTab === 'forecast' && (
          <div className="-mx-4 md:-mx-8">
            {forecastLoading ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center mx-4 md:mx-8">
                <div className="text-slate-600">読み込み中...</div>
              </div>
            ) : forecastInitialized ? (
              <ForecastSummary
                currentBalance={localForecastBalance}
                monthlyIncome={budget.monthly_income || 0}
                monthlyFixed={
                  (budget.rent || 0) +
                  (budget.utilities || 0) +
                  (budget.internet || 0) +
                  (budget.mobile || 0) +
                  (budget.car || 0) +
                  (budget.insurance || 0) +
                  (budget.kids || 0) +
                  (budget.savings || 0) +
                  (budget.subscriptions_total || 0) +
                  (budget.debt_repayment || 0)
                }
                events={localForecastEvents}
                onBack={() => setActiveTab('monthly')}
                onEditBalance={onEditBalance || (() => {})}
                onSaveEvents={async (events) => {
                  setLocalForecastEvents(events);
                  if (onSaveEvents) {
                    await onSaveEvents(events);
                  }
                }}
                embedded={true}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center mx-4 md:mx-8">
                <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">ざっくり未来予想</h2>
                <p className="text-slate-600 mb-6">
                  今の生活を続けると、1年後・2年後の貯金はどうなる？
                  <br />
                  旅行や大きな買い物の予定も入れて、ざっくり予測してみましょう。
                </p>
                <button
                  onClick={onStartForecast}
                  className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                >
                  ざっくり未来予想を始める
                </button>
              </div>
            )}
          </div>
        )}

        {showAddExpenseModal && (
          <AddCustomExpenseModal
            onSave={handleAddCustomExpense}
            onClose={() => setShowAddExpenseModal(false)}
          />
        )}

        {showVariableExpensesModal && (
          <DetailedVariableExpensesModal
            currentValue={budget.variable_expenses || 0}
            currentMode={budget.variable_expenses_mode || 'rough'}
            currentItems={variableExpenseItems.map(item => ({ id: item.id, title: item.title, amount: item.amount }))}
            onSave={handleSaveVariableExpenses}
            onClose={() => setShowVariableExpensesModal(false)}
          />
        )}

        {editingDetailedCategory && (() => {
          const cat = categories.find(c => c.key === editingDetailedCategory);
          if (!cat) return null;

          const categoryLabels: Record<string, string> = {
            rent: '家賃・住宅ローン',
            utilities: '光熱費',
            internet: 'インターネット',
            mobile: '携帯代',
            car: '車関連',
            insurance: '保険',
            kids: '子ども関連',
            savings: '積立・投資',
            debt_repayment: '返済',
          };

          const categoryConfigs: Record<string, { min: number; max: number; step: number }> = {
            rent: { min: 0, max: 200000, step: 5000 },
            utilities: { min: 0, max: 50000, step: 1000 },
            internet: { min: 0, max: 15000, step: 500 },
            mobile: { min: 0, max: 20000, step: 1000 },
            car: { min: 0, max: 100000, step: 5000 },
            insurance: { min: 0, max: 50000, step: 1000 },
            kids: { min: 0, max: 100000, step: 5000 },
            savings: { min: 0, max: 100000, step: 5000 },
            debt_repayment: { min: 0, max: 100000, step: 5000 },
          };

          const config = categoryConfigs[editingDetailedCategory] || { min: 0, max: 100000, step: 1000 };
          const modeField = `${editingDetailedCategory}_mode` as keyof HouseholdBudget;
          const memoField = `${editingDetailedCategory}_memo` as keyof HouseholdBudget;
          const currentMode = (budget[modeField] as 'rough' | 'detailed') || 'rough';
          const currentMemo = (budget[memoField] as string) || '';
          const currentItems = categoryExpenseItems[editingDetailedCategory] || [];

          return (
            <DetailedCategoryModal
              category={editingDetailedCategory}
              categoryLabel={categoryLabels[editingDetailedCategory] || cat.label}
              currentValue={budget[editingDetailedCategory as keyof HouseholdBudget] as number}
              currentMemo={currentMemo}
              currentMode={currentMode}
              currentItems={currentItems.map(item => ({ id: item.id, title: item.title, amount: item.amount }))}
              min={config.min}
              max={config.max}
              step={config.step}
              colorClass={cat.colorClass}
              onSave={(mode, value, memo, items) => handleSaveDetailedCategory(editingDetailedCategory, mode, value, memo, items)}
              onClose={() => setEditingDetailedCategory(null)}
            />
          );
        })()}
      </div>
    </div>
  );
}
