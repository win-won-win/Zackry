import { CheckCircle2, TrendingUp, Wallet, PieChart } from 'lucide-react';
import { HouseholdBudget } from '../../lib/supabase';

interface Step10SummaryProps {
  budget: Partial<HouseholdBudget>;
  onSave: () => void;
  onAdjust?: () => void;
}

export function Step10Summary({ budget, onSave, onAdjust }: Step10SummaryProps) {
  const income = budget.monthly_income || 0;
  const fixedCosts =
    (budget.rent || 0) +
    (budget.utilities || 0) +
    (budget.internet || 0) +
    (budget.mobile || 0) +
    (budget.car || 0) +
    (budget.insurance || 0) +
    (budget.kids || 0) +
    (budget.savings || 0) +
    (budget.subscriptions_total || 0);
  const remaining = income - fixedCosts;

  const categories = [
    { label: '家', amount: budget.rent || 0, color: 'bg-blue-500' },
    { label: '光熱費', amount: budget.utilities || 0, color: 'bg-green-500' },
    { label: 'ネット', amount: budget.internet || 0, color: 'bg-cyan-500' },
    { label: '携帯', amount: budget.mobile || 0, color: 'bg-purple-500' },
    { label: '車', amount: budget.car || 0, color: 'bg-orange-500' },
    { label: '保険', amount: budget.insurance || 0, color: 'bg-pink-500' },
    { label: '子ども', amount: budget.kids || 0, color: 'bg-yellow-500' },
    { label: '積立', amount: budget.savings || 0, color: 'bg-indigo-500' },
    { label: 'サブスク', amount: budget.subscriptions_total || 0, color: 'bg-red-500' },
  ].filter((cat) => cat.amount > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              完了！
            </h1>
            <p className="text-slate-600">
              あなたのざっくりお金の流れが見えました
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm font-medium text-slate-700">手取り</div>
              </div>
              <div className="text-3xl font-bold text-slate-900">
                ¥{income.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600 mt-1">/ 月</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm font-medium text-slate-700">固定費合計</div>
              </div>
              <div className="text-3xl font-bold text-slate-900">
                ¥{fixedCosts.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600 mt-1">/ 月</div>
            </div>

            <div className={`bg-gradient-to-br ${
              remaining >= 0 ? 'from-green-50 to-emerald-50' : 'from-red-50 to-pink-50'
            } rounded-xl p-6`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${
                  remaining >= 0 ? 'bg-green-600' : 'bg-red-600'
                } rounded-lg flex items-center justify-center`}>
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm font-medium text-slate-700">残り</div>
              </div>
              <div className={`text-3xl font-bold ${
                remaining >= 0 ? 'text-slate-900' : 'text-red-600'
              }`}>
                ¥{remaining.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600 mt-1">ざっくり自由に使える</div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">カテゴリ別内訳</h3>
            <div className="space-y-3">
              {categories.map((cat) => {
                const percentage = fixedCosts > 0 ? (cat.amount / fixedCosts) * 100 : 0;
                return (
                  <div key={cat.label} className="flex items-center gap-3">
                    <div className="w-20 text-sm font-medium text-slate-700">{cat.label}</div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <div className="h-6 bg-slate-200 rounded-full overflow-hidden flex-1 mr-3">
                          <div
                            className={`h-full ${cat.color} transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 w-24 text-right">
                          ¥{cat.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onSave}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              この内容で保存して、毎月の画面へ
            </button>
            {onAdjust && (
              <button
                onClick={onAdjust}
                className="w-full px-6 py-3 bg-white text-slate-700 border-2 border-slate-300 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-colors font-medium"
              >
                一部を調整したい
              </button>
            )}
          </div>

          {remaining < 0 && (
            <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-sm text-red-700 text-center">
                固定費が収入を超えています。内容を見直すことをおすすめします。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
