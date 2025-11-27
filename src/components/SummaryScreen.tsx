import { useState } from 'react';
import { CheckCircle2, TrendingUp, Calendar } from 'lucide-react';
import { TOP_CATEGORIES } from '../data/presets';
import type { Subscription } from '../lib/supabase';

interface SummaryScreenProps {
  subscriptions: Partial<Subscription>[];
  onGoToDashboard: () => void;
  onGoToDetailEdit?: () => void;
}

export function SummaryScreen({ subscriptions, onGoToDashboard, onGoToDetailEdit }: SummaryScreenProps) {
  const monthlyTotal = subscriptions.reduce((sum, sub) => sum + (sub.approx_monthly_jpy || 0), 0);
  const yearlyTotal = monthlyTotal * 12;

  const categoryTotals = subscriptions.reduce((acc, sub) => {
    const categoryId = sub.category_id || 'other';
    acc[categoryId] = (acc[categoryId] || 0) + (sub.approx_monthly_jpy || 0);
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([id, total]) => ({
      id,
      label: TOP_CATEGORIES.find((c) => c.id === id)?.label || id,
      total,
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              概算完了！
            </h1>
            <p className="text-slate-600">
              今回入力した内容をもとにした概算です
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">推定 月額合計</h2>
            </div>
            <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
              ¥{monthlyTotal.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">年間合計: ¥{yearlyTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">カテゴリ別内訳</h3>
            <div className="space-y-2">
              {sortedCategories.map(({ id, label, total }) => {
                const percentage = (total / monthlyTotal) * 100;
                return (
                  <div key={id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{label}</span>
                        <span className="text-sm font-semibold text-slate-900">
                          ¥{total.toLocaleString()}
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
          </div>

          <div className="space-y-3">
            <button
              onClick={onGoToDashboard}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              このままダッシュボードへ（ざっくりでOK）
            </button>
            {onGoToDetailEdit && (
              <button
                onClick={onGoToDetailEdit}
                className="w-full px-6 py-3 bg-white text-slate-700 border-2 border-slate-300 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-colors font-medium"
              >
                もっと正確にしたい（詳細設定へ）
              </button>
            )}
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 text-center">
              登録したサブスク: {subscriptions.length}件
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
