import { useEffect, useState } from 'react';
import { TrendingUp, Calendar, LogOut, Plus, Sparkles } from 'lucide-react';
import { supabase, Subscription } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TOP_CATEGORIES } from '../data/presets';

type Props = {
  onAddSubscription?: () => void;
};

export function Dashboard({ onAddSubscription }: Props) {
  const { user, signOut } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyTotal = () => {
    return subscriptions.reduce((total, sub) => total + sub.approx_monthly_jpy, 0);
  };

  const calculateYearlyTotal = () => {
    return calculateMonthlyTotal() * 12;
  };

  const getCategoryTotals = () => {
    const totals: Record<string, number> = {};
    subscriptions.forEach((sub) => {
      totals[sub.category_id] = (totals[sub.category_id] || 0) + sub.approx_monthly_jpy;
    });
    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .map(([id, total]) => ({
        id,
        label: TOP_CATEGORIES.find((c) => c.id === id)?.label || id,
        total,
      }));
  };

  const formatCurrency = (amount: number) => {
    return '¥' + amount.toLocaleString();
  };

  const getServiceName = (sub: Subscription) => {
    return sub.custom_name || sub.service_id.replace(/-jp$/, '').replace(/-/g, ' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    );
  }

  const monthlyTotal = calculateMonthlyTotal();
  const yearlyTotal = calculateYearlyTotal();
  const categoryTotals = getCategoryTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">サブスク管理</h1>
              <p className="text-slate-600">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">ログアウト</span>
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">月額合計</p>
                <p className="text-3xl font-bold text-slate-900">{formatCurrency(monthlyTotal)}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">年間合計: {formatCurrency(yearlyTotal)}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">登録サブスク</p>
                <p className="text-3xl font-bold text-slate-900">{subscriptions.length}件</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">有効なサブスク数</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">カテゴリ別内訳</h2>
          {categoryTotals.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              まだサブスクが登録されていません
            </div>
          ) : (
            <div className="space-y-3">
              {categoryTotals.map(({ id, label, total }) => {
                const percentage = (total / monthlyTotal) * 100;
                return (
                  <div key={id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{label}</span>
                        <span className="text-sm font-semibold text-slate-900">
                          {formatCurrency(total)}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">サブスク一覧</h2>
          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">まだサブスクが登録されていません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((sub) => {
                const category = TOP_CATEGORIES.find((c) => c.id === sub.category_id);
                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                        {getServiceName(sub).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{getServiceName(sub)}</h3>
                        <p className="text-sm text-slate-600">{category?.label}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">
                        {formatCurrency(sub.approx_monthly_jpy)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {sub.billing_cycle === 'monthly' ? '月額' : '月換算'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {onAddSubscription && (
          <div className="flex justify-center">
            <button
              onClick={onAddSubscription}
              className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              サブスクを追加
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
