import { useState } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface CategoryItem {
  id?: string;
  title: string;
  amount: number;
}

interface DetailedCategoryModalProps {
  category: string;
  categoryLabel: string;
  currentValue: number;
  currentMemo?: string;
  currentMode: 'rough' | 'detailed';
  currentItems: CategoryItem[];
  min: number;
  max: number;
  step: number;
  colorClass: string;
  onSave: (mode: 'rough' | 'detailed', value: number, memo: string, items: CategoryItem[]) => void;
  onClose: () => void;
}

export function DetailedCategoryModal({
  category,
  categoryLabel,
  currentValue,
  currentMemo = '',
  currentMode,
  currentItems,
  min,
  max,
  step,
  colorClass,
  onSave,
  onClose,
}: DetailedCategoryModalProps) {
  const [mode, setMode] = useState<'rough' | 'detailed'>(currentMode);
  const [roughValue, setRoughValue] = useState(currentValue);
  const [memo, setMemo] = useState(currentMemo || '');
  const [items, setItems] = useState<CategoryItem[]>(
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
      onSave(mode, detailedTotal, memo, validItems);
    } else {
      onSave(mode, roughValue, memo, []);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">{categoryLabel}を編集</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="text-center mb-6">
            <div className={`text-5xl font-bold ${colorClass} mb-2`}>
              ¥{displayValue.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">/ 月</div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('rough')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                mode === 'rough'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ざっくり入力
            </button>
            <button
              onClick={() => setMode('detailed')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                mode === 'detailed'
                  ? 'bg-blue-600 text-white'
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
                min={min}
                max={max}
                step={step}
                value={roughValue}
                onChange={(e) => setRoughValue(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>¥{min.toLocaleString()}</span>
                <span>¥{max.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 mb-3">
                項目ごとに入力してください
              </p>
              {items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                    placeholder="項目名（例: 駐車場代）"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={item.amount || ''}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    placeholder="金額"
                    className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-slate-600 hover:text-blue-600"
              >
                <Plus className="w-4 h-4" />
                項目を追加
              </button>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            メモ（任意）
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="詳細や備考など"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
            rows={3}
            maxLength={200}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
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
