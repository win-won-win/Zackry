import { useState } from 'react';
import { Calendar, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

interface FutureEvent {
  id: string;
  label: string;
  year: number;
  month: number;
  amount: number;
  type: 'income' | 'expense';
  category: 'travel' | 'gift' | 'hobby' | 'life' | 'other' | 'bonus' | 'salary';
}

interface ForecastWizardProps {
  currentBalance: number;
  monthlyIncome: number;
  monthlyFixed: number;
  onComplete: (events: Omit<FutureEvent, 'id'>[]) => void;
  onBack: () => void;
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

export function ForecastWizard({
  currentBalance,
  monthlyIncome,
  monthlyFixed,
  onComplete,
  onBack,
}: ForecastWizardProps) {
  const [events, setEvents] = useState<FutureEvent[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    label: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    amount: 50000,
    type: 'expense' as 'income' | 'expense',
    category: 'other' as const,
  });

  const handleAddEvent = () => {
    if (!newEvent.label.trim()) return;

    setEvents([
      ...events,
      {
        ...newEvent,
        id: crypto.randomUUID(),
      },
    ]);
    setNewEvent({
      label: '',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      amount: 50000,
      type: 'expense',
      category: 'other',
    });
    setShowAddForm(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const handleComplete = () => {
    onComplete(events.map(({ id, ...rest }) => rest));
  };

  const monthlyNet = monthlyIncome - monthlyFixed;
  const totalEventCost = events.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-slate-500">年間収支予測</div>
              <div className="text-xs text-slate-400">イベントを追加</div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              大きな出費・収入の予定はありますか？
            </h2>
            <p className="text-sm md:text-base text-slate-600">
              旅行・引っ越し・ボーナスなど、予定している大きな出費や収入を入れておくと、より正確な予測ができます。
            </p>
          </div>

          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-500 mb-1">現在の残高</div>
                <div className="font-bold text-lg text-green-600">¥{currentBalance.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">毎月の余り</div>
                <div className="font-bold text-lg text-blue-600">¥{monthlyNet.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {events.length > 0 && (
            <div className="mb-6 space-y-2">
              {events.map((event) => {
                const categories = event.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
                const category = categories.find((c) => c.id === event.category);
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full ${category?.color}`} />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">
                        {event.type === 'income' && <span className="text-green-600 text-xs mr-1">[収入]</span>}
                        {event.type === 'expense' && <span className="text-red-600 text-xs mr-1">[支出]</span>}
                        {event.label}
                      </div>
                      <div className="text-xs text-slate-500">
                        {event.year}年{event.month}月
                      </div>
                    </div>
                    <div className={`font-bold ${event.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {event.type === 'income' ? '+' : '-'}¥{event.amount.toLocaleString()}
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {showAddForm ? (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    種類
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => setNewEvent({ ...newEvent, type: 'expense', category: 'other' })}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        newEvent.type === 'expense'
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      支出
                    </button>
                    <button
                      onClick={() => setNewEvent({ ...newEvent, type: 'income', category: 'bonus' })}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        newEvent.type === 'income'
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      収入
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {newEvent.type === 'income' ? '収入名' : 'イベント名'}
                  </label>
                  <input
                    type="text"
                    value={newEvent.label}
                    onChange={(e) => setNewEvent({ ...newEvent, label: e.target.value })}
                    placeholder={newEvent.type === 'income' ? '例：ボーナス' : '例：沖縄旅行'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">年</label>
                    <input
                      type="number"
                      value={newEvent.year}
                      onChange={(e) => setNewEvent({ ...newEvent, year: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">月</label>
                    <select
                      value={newEvent.month}
                      onChange={(e) => setNewEvent({ ...newEvent, month: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {m}月
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    金額（円）
                  </label>
                  <input
                    type="number"
                    value={newEvent.amount}
                    onChange={(e) => setNewEvent({ ...newEvent, amount: Number(e.target.value) })}
                    step="1000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    カテゴリ
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(newEvent.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() =>
                          setNewEvent({
                            ...newEvent,
                            category: cat.id as FutureEvent['category'],
                          })
                        }
                        className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                          newEvent.category === cat.id
                            ? `${cat.color} text-white`
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleAddEvent}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Save className="w-4 h-4" />
                    追加
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-slate-600 hover:text-blue-600 font-medium"
            >
              <Plus className="w-5 h-5" />
              イベントを追加
            </button>
          )}

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleComplete}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              1年分の予想を見る
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
