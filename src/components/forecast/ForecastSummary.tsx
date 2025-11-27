import { useState, useEffect } from 'react';
import { Calendar, ArrowLeft, CreditCard as Edit3, Plus, Trash2, Save, X, ChevronDown, ChevronUp, TrendingDown, TrendingUp } from 'lucide-react';
import { supabase, MonthlyIncomeOverride } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MonthDetailModal } from './MonthDetailModal';
import { AmountSlider } from './AmountSlider';

interface FutureEvent {
  id?: string;
  label: string;
  year: number;
  month: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

interface MonthData {
  month: number;
  year: number;
  balance: number;
  income: number;
  fixed: number;
  eventExpenses: number;
  eventIncome: number;
  net: number;
  eventsList: FutureEvent[];
}

interface ForecastSummaryProps {
  currentBalance: number;
  monthlyIncome: number;
  monthlyFixed: number;
  events: FutureEvent[];
  onBack: () => void;
  onEditBalance: () => void;
  onSaveEvents?: (events: FutureEvent[]) => Promise<void>;
}

const EXPENSE_CATEGORIES = [
  { id: 'travel', label: '旅行', color: 'bg-blue-500' },
  { id: 'gift', label: 'プレゼント・贈り物', color: 'bg-pink-500' },
  { id: 'hobby', label: '趣味', color: 'bg-purple-500' },
  { id: 'life', label: '冠婚葬祭・引っ越し', color: 'bg-orange-500' },
  { id: 'other', label: 'その他', color: 'bg-slate-500' },
] as const;

const INCOME_CATEGORIES = [
  { id: 'bonus', label: 'ボーナス', color: 'bg-green-500' },
  { id: 'salary', label: '臨時収入', color: 'bg-emerald-500' },
  { id: 'other', label: 'その他', color: 'bg-slate-500' },
] as const;

export function ForecastSummary({
  currentBalance,
  monthlyIncome,
  monthlyFixed,
  events: initialEvents,
  onBack,
  onEditBalance,
  onSaveEvents,
}: ForecastSummaryProps) {
  const { user } = useAuth();
  const today = new Date();
  const currentYear = today.getFullYear();
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([currentYear, currentYear + 1]));
  const [events, setEvents] = useState<FutureEvent[]>(initialEvents);
  const [editingEvent, setEditingEvent] = useState<FutureEvent | null>(null);
  const [incomeOverrides, setIncomeOverrides] = useState<Map<string, number>>(new Map());
  const [editingIncome, setEditingIncome] = useState<{ year: number; month: number; value: number } | null>(null);
  const [balanceOverrides, setBalanceOverrides] = useState<Map<string, number>>(new Map());
  const [editingBalance, setEditingBalance] = useState<{ year: number; month: number; value: number } | null>(null);

  useEffect(() => {
    loadIncomeOverrides();
    loadBalanceOverrides();
  }, []);

  const loadIncomeOverrides = async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_income_overrides')
        .select('*')
        .eq('user_id', user!.id);

      if (error) throw error;

      const overridesMap = new Map<string, number>();
      data?.forEach(override => {
        overridesMap.set(`${override.year}-${override.month}`, override.income);
      });
      setIncomeOverrides(overridesMap);
    } catch (error) {
      console.error('Error loading income overrides:', error);
    }
  };

  const loadBalanceOverrides = async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_balance_overrides')
        .select('*')
        .eq('user_id', user!.id);

      if (error) throw error;

      const overridesMap = new Map<string, number>();
      data?.forEach(override => {
        overridesMap.set(`${override.year}-${override.month}`, override.balance);
      });
      setBalanceOverrides(overridesMap);
    } catch (error) {
      console.error('Error loading balance overrides:', error);
    }
  };

  const isPastMonth = (year: number, month: number): boolean => {
    if (year < currentYear) return true;
    if (year === currentYear && month < today.getMonth() + 1) return true;
    return false;
  };

  const getMonthlyIncome = (year: number, month: number): number => {
    const key = `${year}-${month}`;
    return incomeOverrides.get(key) ?? monthlyIncome;
  };

  const calculateForecast = (): MonthData[] => {
    const forecast: MonthData[] = [];
    let balance = currentBalance;
    const currentMonth = today.getMonth() + 1;

    // Get account creation date
    const accountCreatedAt = user?.created_at ? new Date(user.created_at) : today;
    const accountCreationYear = accountCreatedAt.getFullYear();
    const accountCreationMonth = accountCreatedAt.getMonth() + 1;

    // Calculate how many months since account creation
    const monthsSinceCreation = (currentYear - accountCreationYear) * 12 + (currentMonth - accountCreationMonth);

    // Start from account creation date (but not more than 12 months ago)
    const startOffset = Math.max(-monthsSinceCreation, -12);

    // Generate data from account creation + 5 years (60 months) of future data
    for (let i = startOffset; i < 60; i++) {
      const month = ((currentMonth - 1 + i + 1200) % 12) + 1; // +1200 to handle negative numbers
      const year = currentYear + Math.floor((currentMonth - 1 + i) / 12);

      // Skip months before account creation
      if (year < accountCreationYear || (year === accountCreationYear && month < accountCreationMonth)) {
        continue;
      }

      const monthEvents = events.filter((e) => e.year === year && e.month === month);
      const monthExpenses = monthEvents.filter((e) => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
      const monthIncome = monthEvents.filter((e) => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);

      // For past months, use overridden income if available, otherwise use the current monthlyIncome
      // (but this won't update if monthlyIncome changes in the future)
      const baseIncome = getMonthlyIncome(year, month);
      const fixedExpense = monthlyFixed;

      const net = baseIncome + monthIncome - fixedExpense - monthExpenses;
      balance += net;

      // Check if there's a balance override for this month
      const key = `${year}-${month}`;
      const overrideBalance = balanceOverrides.get(key);
      if (overrideBalance !== undefined) {
        balance = overrideBalance;
      }

      forecast.push({
        month,
        year,
        balance,
        income: baseIncome,
        fixed: fixedExpense,
        eventExpenses: monthExpenses,
        eventIncome: monthIncome,
        net,
        eventsList: monthEvents,
      });
    }

    return forecast;
  };

  const forecastData = calculateForecast();

  const getMonthName = (month: number) => {
    return `${month}月`;
  };

  const toggleMonth = (index: number) => {
    const monthData = forecastData[index];
    setSelectedMonth(monthData);
  };

  const handleAddEvent = async (newEvent: Omit<FutureEvent, 'id'>) => {
    const eventWithId = {
      ...newEvent,
      id: crypto.randomUUID(),
    };

    const updatedEvents = [...events, eventWithId];
    setEvents(updatedEvents);

    if (onSaveEvents) {
      await onSaveEvents(updatedEvents);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const updatedEvents = events.filter((e) => e.id !== eventId);
    setEvents(updatedEvents);

    if (onSaveEvents) {
      await onSaveEvents(updatedEvents);
    }
  };

  const handleEditEvent = (event: FutureEvent) => {
    setEditingEvent({ ...event });
  };

  const handleSaveEdit = async () => {
    if (!editingEvent || !editingEvent.label.trim()) return;

    const updatedEvents = events.map((e) =>
      e.id === editingEvent.id ? editingEvent : e
    );
    setEvents(updatedEvents);

    if (onSaveEvents) {
      await onSaveEvents(updatedEvents);
    }

    setEditingEvent(null);
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
  };

  const handleEditIncome = (year: number, month: number) => {
    const currentIncome = getMonthlyIncome(year, month);
    setEditingIncome({ year, month, value: currentIncome });
  };

  const handleSaveIncome = async () => {
    if (!editingIncome) return;

    const { year, month, value } = editingIncome;
    const key = `${year}-${month}`;

    try {
      // Check if override exists
      const { data: existing } = await supabase
        .from('monthly_income_overrides')
        .select('id')
        .eq('user_id', user!.id)
        .eq('year', year)
        .eq('month', month)
        .maybeSingle();

      if (value === monthlyIncome) {
        // If value equals default, delete override
        if (existing) {
          await supabase
            .from('monthly_income_overrides')
            .delete()
            .eq('user_id', user!.id)
            .eq('year', year)
            .eq('month', month);
        }
        const newOverrides = new Map(incomeOverrides);
        newOverrides.delete(key);
        setIncomeOverrides(newOverrides);
      } else {
        // Insert or update override
        if (existing) {
          await supabase
            .from('monthly_income_overrides')
            .update({ income: value, updated_at: new Date().toISOString() })
            .eq('user_id', user!.id)
            .eq('year', year)
            .eq('month', month);
        } else {
          await supabase
            .from('monthly_income_overrides')
            .insert({
              user_id: user!.id,
              year,
              month,
              income: value,
            });
        }
        const newOverrides = new Map(incomeOverrides);
        newOverrides.set(key, value);
        setIncomeOverrides(newOverrides);
      }

      setEditingIncome(null);
    } catch (error) {
      console.error('Error saving income override:', error);
      alert('収入の保存に失敗しました。');
    }
  };

  const handleCancelEditIncome = () => {
    setEditingIncome(null);
  };

  const handleEditBalance = (year: number, month: number, currentBalance: number) => {
    setEditingBalance({ year, month, value: currentBalance });
  };

  const handleSaveBalance = async () => {
    if (!editingBalance) return;

    const { year, month, value } = editingBalance;
    const key = `${year}-${month}`;

    try {
      const { data: existing } = await supabase
        .from('monthly_balance_overrides')
        .select('id')
        .eq('user_id', user!.id)
        .eq('year', year)
        .eq('month', month)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('monthly_balance_overrides')
          .update({ balance: value, updated_at: new Date().toISOString() })
          .eq('user_id', user!.id)
          .eq('year', year)
          .eq('month', month);
      } else {
        await supabase
          .from('monthly_balance_overrides')
          .insert({
            user_id: user!.id,
            year,
            month,
            balance: value,
          });
      }

      const newOverrides = new Map(balanceOverrides);
      newOverrides.set(key, value);
      setBalanceOverrides(newOverrides);
      setEditingBalance(null);
    } catch (error) {
      console.error('Error saving balance override:', error);
      alert('残高の保存に失敗しました。');
    }
  };

  const handleCancelEditBalance = () => {
    setEditingBalance(null);
  };

  const handleBalanceValueChange = (value: number) => {
    setEditingBalance((prev) => (prev ? { ...prev, value } : prev));
  };

  const getCategoryColor = (categoryId: string, type: 'income' | 'expense') => {
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || 'bg-slate-500';
  };

  const getCategoryLabel = (categoryId: string, type: 'income' | 'expense') => {
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const category = categories.find((c) => c.id === categoryId);
    return category?.label || 'その他';
  };

  const toggleYear = (year: number) => {
    const newExpandedYears = new Set(expandedYears);
    if (newExpandedYears.has(year)) {
      newExpandedYears.delete(year);
    } else {
      newExpandedYears.add(year);
    }
    setExpandedYears(newExpandedYears);
  };

  const groupByYear = (data: MonthData[]) => {
    const grouped: Record<number, MonthData[]> = {};
    data.forEach((month) => {
      if (!grouped[month.year]) {
        grouped[month.year] = [];
      }
      grouped[month.year].push(month);
    });
    return grouped;
  };

  const yearGroups = groupByYear(forecastData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 py-8">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-600">スタート残高</div>
              <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                ¥{currentBalance.toLocaleString()}
                <button
                  onClick={onEditBalance}
                  className="p-1 hover:bg-green-100 rounded transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(yearGroups).map(([year, months]) => {
              const yearNum = Number(year);
              const isYearExpanded = expandedYears.has(yearNum);
              return (
              <div key={year} className="border-2 border-slate-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleYear(yearNum)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-3 hover:from-indigo-700 hover:to-blue-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{year}年</h3>
                    {isYearExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>
                {isYearExpanded && (
                  <div className="divide-y divide-slate-200">
                    {months.map((data, idx) => {
                    const absoluteIndex = forecastData.findIndex(d => d.year === data.year && d.month === data.month);
                    const isExpanded = expandedMonth === absoluteIndex;
                    const hasEvents = data.eventExpenses > 0 || data.eventIncome > 0;
                    const isPast = isPastMonth(data.year, data.month);

                    return (
                      <div key={`${year}-${data.month}`} className={`${hasEvents && !isPast ? 'bg-orange-50/50' : ''} ${isPast ? 'bg-slate-100/50' : ''}`}>
                        <button
                          onClick={() => toggleMonth(absoluteIndex)}
                          className={`w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left ${isPast ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`text-sm font-bold w-12 ${isPast ? 'text-slate-500' : 'text-slate-900'}`}>
                              {data.month}月{isPast ? ' (過去)' : ''}
                            </div>
                            <div className="flex items-center gap-1">
                              {data.eventExpenses > 0 && (
                                <div className="relative">
                                  <TrendingDown className="w-5 h-5 text-red-500 animate-pulse" />
                                </div>
                              )}
                              {data.eventIncome > 0 && (
                                <div className="relative">
                                  <TrendingUp className="w-5 h-5 text-green-500 animate-pulse" />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className={`text-xs ${isPast ? 'text-slate-400' : 'text-slate-500'}`}>残高</div>
                              <div
                                className={`text-sm font-bold ${
                                  isPast
                                    ? 'text-slate-500'
                                    : data.balance >= 0
                                      ? 'text-slate-900'
                                      : 'text-red-600'
                                }`}
                              >
                                ¥{data.balance.toLocaleString()}
                              </div>
                            </div>
                            <div
                              className={`text-xs font-medium px-2 py-1 rounded ${
                                isPast
                                  ? 'text-slate-500 bg-slate-200'
                                  : data.net >= 0
                                    ? 'text-green-700 bg-green-100'
                                    : 'text-red-700 bg-red-100'
                              }`}
                            >
                              {data.net >= 0 ? '+' : ''}¥{data.net.toLocaleString()}
                            </div>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 bg-slate-50 border-t border-slate-200 space-y-3">
                            {isPast && (
                              <div className="bg-slate-200 border border-slate-300 rounded-lg p-3 text-sm text-slate-700">
                                <p className="font-medium">📝 過去の月</p>
                                <p className="text-xs mt-1">この月のデータは記録として保存されています。ざっくり月額管理の変更は反映されません。手動で編集することは可能です。</p>
                              </div>
                            )}
                            <div className="space-y-2">
                              {editingIncome?.year === data.year && editingIncome?.month === data.month ? (
                                <div className="bg-blue-50 p-3 rounded border-2 border-blue-300 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">平均手取りを編集</span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={handleSaveIncome}
                                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                      >
                                        <Save className="w-5 h-5" />
                                      </button>
                                      <button
                                        onClick={handleCancelEditIncome}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                      >
                                        <X className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </div>
                                  <AmountSlider
                                    value={editingIncome.value}
                                    onChange={(value) => setEditingIncome({ ...editingIncome, value })}
                                    min={0}
                                    max={1000000}
                                    step={1000}
                                    showValue={true}
                                  />
                                </div>
                              ) : (
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">手取り</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-green-600">
                                      +¥{data.income.toLocaleString()}
                                    </span>
                                    <button
                                      onClick={() => handleEditIncome(data.year, data.month)}
                                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              )}
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600">固定費</span>
                                <span className="font-medium text-red-600">
                                  -¥{data.fixed.toLocaleString()}
                                </span>
                              </div>
                              {data.eventIncome > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">予定の収入</span>
                                  <span className="font-medium text-green-600">
                                    +¥{data.eventIncome.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {data.eventExpenses > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">予定の支出</span>
                                  <span className="font-medium text-orange-600">
                                    -¥{data.eventExpenses.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {editingBalance?.year === data.year && editingBalance?.month === data.month ? (
                                <div className="pt-3 border-t border-slate-300 bg-blue-50 p-3 rounded border-2 border-blue-300 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-700">月末残高を編集</span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={handleSaveBalance}
                                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                      >
                                        <Save className="w-5 h-5" />
                                      </button>
                                      <button
                                        onClick={handleCancelEditBalance}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                      >
                                        <X className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </div>
                                  <AmountSlider
                                    value={editingBalance.value}
                                    onChange={handleBalanceValueChange}
                                    min={0}
                                    max={10000000}
                                    step={10000}
                                    showValue={true}
                                  />
                                </div>
                              ) : (
                                <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-bold">
                                  <span className="text-slate-900">月末残高</span>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={data.balance >= 0 ? 'text-slate-900' : 'text-red-600'}
                                    >
                                      ¥{data.balance.toLocaleString()}
                                    </span>
                                    <button
                                      onClick={() => handleEditBalance(data.year, data.month, data.balance)}
                                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="pt-3 border-t-2 border-orange-200">
                              <h4 className="font-bold text-slate-900 text-sm mb-2">この月の予定</h4>
                              {data.eventsList.length > 0 && (
                                <div className="space-y-2">
                                  {data.eventsList.map((event) => (
                                    <div key={event.id}>
                                      {editingEvent?.id === event.id ? (
                                        <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-300 space-y-3">
                                          <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">名前</label>
                                            <input
                                              type="text"
                                              value={editingEvent.label}
                                              onChange={(e) =>
                                                setEditingEvent({ ...editingEvent, label: e.target.value })
                                              }
                                              className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                                            />
                                          </div>
                                          <div>
                                            <AmountSlider
                                              value={editingEvent.amount}
                                              onChange={(amount) => setEditingEvent({ ...editingEvent, amount })}
                                              min={0}
                                              max={1000000}
                                              step={1000}
                                              label="金額"
                                              showValue={true}
                                            />
                                          </div>
                                          <div className="flex gap-2">
                                            <button
                                              onClick={handleSaveEdit}
                                              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-sm font-medium"
                                            >
                                              <Save className="w-3 h-3" />
                                              保存
                                            </button>
                                            <button
                                              onClick={handleCancelEdit}
                                              className="px-2 py-1 bg-slate-300 text-slate-700 rounded text-sm"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                                          <div className={`w-2 h-2 rounded-full ${getCategoryColor(event.category, event.type)}`} />
                                          <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-900">
                                              {event.type === 'income' && <span className="text-green-600 text-xs mr-1">[収入]</span>}
                                              {event.type === 'expense' && <span className="text-red-600 text-xs mr-1">[支出]</span>}
                                              {event.label}
                                            </div>
                                            <div className="text-xs text-slate-500">{getCategoryLabel(event.category, event.type)}</div>
                                          </div>
                                          <div className={`font-bold text-sm ${event.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {event.type === 'income' ? '+' : '-'}¥{event.amount.toLocaleString()}
                                          </div>
                                          <button
                                            onClick={() => handleEditEvent(event)}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                          >
                                            <Edit3 className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() => event.id && handleDeleteEvent(event.id)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>

      </div>

      {selectedMonth && (
        <MonthDetailModal
          monthData={selectedMonth}
          onClose={() => setSelectedMonth(null)}
          onAddEvent={handleAddEvent}
          onDeleteEvent={handleDeleteEvent}
          onEditIncome={handleEditIncome}
          onEditBalance={handleEditBalance}
          editingIncome={editingIncome}
          editingBalance={editingBalance}
          onSaveIncome={handleSaveIncome}
          onSaveBalance={handleSaveBalance}
          onCancelEditIncome={handleCancelEditIncome}
          onCancelEditBalance={handleCancelEditBalance}
          onIncomeValueChange={(value) => setEditingIncome(editingIncome ? { ...editingIncome, value } : null)}
          onBalanceValueChange={handleBalanceValueChange}
          isPastMonth={isPastMonth(selectedMonth.year, selectedMonth.month)}
        />
      )}
    </div>
  );
}
