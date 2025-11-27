import { useState } from 'react';
import { X, Plus, Trash2, TrendingUp, TrendingDown, CreditCard as Edit3, Save } from 'lucide-react';
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

interface MonthDetailModalProps {
  monthData: MonthData;
  onClose: () => void;
  onAddEvent: (event: Omit<FutureEvent, 'id'>) => void;
  onDeleteEvent: (eventId: string) => void;
  onEditIncome: (year: number, month: number) => void;
  editingIncome?: { year: number; month: number; value: number } | null;
  onSaveIncome?: () => void;
  onCancelEditIncome?: () => void;
  onIncomeValueChange?: (value: number) => void;
  isPastMonth?: boolean;
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

export function MonthDetailModal({
  monthData,
  onClose,
  onAddEvent,
  onDeleteEvent,
  onEditIncome,
  editingIncome,
  onSaveIncome,
  onCancelEditIncome,
  onIncomeValueChange,
  isPastMonth = false,
}: MonthDetailModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [eventType, setEventType] = useState<'income' | 'expense'>('expense');
  const [newEvent, setNewEvent] = useState({
    label: '',
    amount: 0,
    category: 'other',
  });

  const handleAddEvent = () => {
    if (!newEvent.label || newEvent.amount <= 0) {
      alert('イベント名と金額を入力してください');
      return;
    }

    onAddEvent({
      label: newEvent.label,
      year: monthData.year,
      month: monthData.month,
      amount: newEvent.amount,
      type: eventType,
      category: newEvent.category,
    });

    setNewEvent({ label: '', amount: 0, category: 'other' });
    setShowAddForm(false);
  };

  const getCategoryLabel = (category: string, type: 'income' | 'expense') => {
    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    return categories.find(c => c.id === category)?.label || category;
  };

  const getCategoryColor = (category: string, type: 'income' | 'expense') => {
    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    return categories.find(c => c.id === category)?.color || 'bg-slate-500';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {monthData.year}年{monthData.month}月
            </h2>
            {isPastMonth && (
              <p className="text-xs text-slate-500 mt-1">📝 過去の月（手動編集のみ反映）</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isPastMonth && (
            <div className="bg-slate-200 border border-slate-300 rounded-lg p-4 text-sm text-slate-700">
              <p className="font-medium">📝 過去の月</p>
              <p className="text-xs mt-1">この月のデータは記録として保存されています。ざっくり月額管理の変更は反映されません。手動で編集することは可能です。</p>
            </div>
          )}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-slate-600">月末残高</div>
              <div className={`text-2xl font-bold ${monthData.balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                ¥{monthData.balance.toLocaleString()}
              </div>
            </div>
            <div className={`text-center text-sm font-medium px-3 py-2 rounded-lg ${
              monthData.net >= 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
            }`}>
              {monthData.net >= 0 ? '+' : ''}¥{monthData.net.toLocaleString()}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">収支内訳</h3>

            {editingIncome?.year === monthData.year && editingIncome?.month === monthData.month ? (
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">手取りを編集</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onSaveIncome}
                      className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={onCancelEditIncome}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <AmountSlider
                  value={editingIncome.value}
                  onChange={(value) => onIncomeValueChange?.(value)}
                  min={0}
                  max={1000000}
                  step={1000}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                <span className="text-sm text-slate-700">手取り</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-600">
                    +¥{monthData.income.toLocaleString()}
                  </span>
                  <button
                    onClick={() => onEditIncome(monthData.year, monthData.month)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg">
              <span className="text-sm text-slate-700">固定費</span>
              <span className="font-semibold text-red-600">
                -¥{monthData.fixed.toLocaleString()}
              </span>
            </div>

            {monthData.eventIncome > 0 && (
              <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-lg">
                <span className="text-sm text-slate-700">予定の収入</span>
                <span className="font-semibold text-green-600">
                  +¥{monthData.eventIncome.toLocaleString()}
                </span>
              </div>
            )}

            {monthData.eventExpenses > 0 && (
              <div className="flex items-center justify-between bg-orange-50 p-3 rounded-lg">
                <span className="text-sm text-slate-700">予定の支出</span>
                <span className="font-semibold text-orange-600">
                  -¥{monthData.eventExpenses.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">予定リスト</h3>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                追加
              </button>
            </div>

            {showAddForm && (
              <div className="bg-slate-50 p-4 rounded-xl space-y-3 border-2 border-blue-300">
                <div className="flex gap-2">
                  <button
                    onClick={() => setEventType('expense')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      eventType === 'expense'
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    支出
                  </button>
                  <button
                    onClick={() => setEventType('income')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      eventType === 'income'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    収入
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {eventType === 'expense' ? '支出' : '収入'}名
                  </label>
                  <input
                    type="text"
                    value={newEvent.label}
                    onChange={(e) => setNewEvent({ ...newEvent, label: e.target.value })}
                    placeholder="例: 家族旅行"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <AmountSlider
                    value={newEvent.amount}
                    onChange={(amount) => setNewEvent({ ...newEvent, amount })}
                    min={0}
                    max={1000000}
                    step={1000}
                    label="金額"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">カテゴリ</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {(eventType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddEvent}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    追加
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewEvent({ label: '', amount: 0, category: 'other' });
                    }}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}

            {monthData.eventsList.length > 0 ? (
              <div className="space-y-2">
                {monthData.eventsList.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-2 h-2 rounded-full ${getCategoryColor(event.category, event.type)}`} />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{event.label}</div>
                        <div className="text-xs text-slate-500">
                          {getCategoryLabel(event.category, event.type)}
                        </div>
                      </div>
                      <div className={`font-semibold ${event.type === 'income' ? 'text-green-600' : 'text-orange-600'}`}>
                        {event.type === 'income' ? '+' : '-'}¥{event.amount.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => event.id && onDeleteEvent(event.id)}
                      className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                予定はありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
