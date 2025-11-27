import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface VariableExpenseItem {
  id?: string;
  title: string;
  amount: number;
}

interface DetailedVariableExpensesModalProps {
  currentValue: number;
  currentMode: 'rough' | 'detailed';
  currentItems: VariableExpenseItem[];
  onSave: (mode: 'rough' | 'detailed', value: number, items: VariableExpenseItem[]) => void;
  onClose: () => void;
}

export function DetailedVariableExpensesModal({
  currentValue,
  currentMode,
  currentItems,
  onSave,
  onClose,
}: DetailedVariableExpensesModalProps) {
  const [mode, setMode] = useState<'rough' | 'detailed'>(currentMode);
  const [roughValue, setRoughValue] = useState(currentValue);
  const [items, setItems] = useState<VariableExpenseItem[]>(
    currentItems.length > 0 ? currentItems : [{ title: '', amount: 0 }]
  );

  const detailedTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const displayValue = mode === 'detailed' ? detailedTotal : roughValue;

  const handleAddItem = () => {
    setItems([...items, { title: '', amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: 'title' | 'amount', value: string | number) => {
    const newItems = [...items];
    if (field === 'title') {
      newItems[index].title = value as string;
    } else {
      newItems[index].amount = Number(value);
    }
    setItems(newItems);
  };

  const handleSave = () => {
    if (mode === 'detailed') {
      const validItems = items.filter(item => item.title.trim() && item.amount > 0);
      onSave(mode, detailedTotal, validItems);
    } else {
      onSave(mode, roughValue, []);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">変動費を編集</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-purple-600 mb-2">
              ¥{displayValue.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">/ 月</div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('rough')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                mode === 'rough'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ざっくり入力
            </button>
            <button
              onClick={() => setMode('detailed')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                mode === 'detailed'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              詳細入力
            </button>
          </div>

          {mode === 'rough' ? (
            <div>
              <input
                type="range"
                min={0}
                max={200000}
                step={5000}
                value={roughValue}
                onChange={(e) => setRoughValue(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>¥0</span>
                <span>¥200,000</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 mb-3">
                外食・コンビニ・趣味・ゲーム課金など、項目ごとに入力してください
              </p>
              {items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                    placeholder="項目名（例: 外食）"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="number"
                    value={item.amount || ''}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    placeholder="金額"
                    className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddItem}
                className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-slate-600 hover:text-purple-600"
              >
                <Plus className="w-4 h-4" />
                項目を追加
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition-colors font-medium"
          >
            <Save className="w-5 h-5" />
            保存
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors font-medium"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
