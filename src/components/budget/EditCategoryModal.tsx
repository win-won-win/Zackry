import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface EditCategoryModalProps {
  category: string;
  currentValue: number;
  currentMemo?: string;
  min: number;
  max: number;
  step: number;
  onSave: (value: number, memo: string) => void;
  onClose: () => void;
}

export function EditCategoryModal({
  category,
  currentValue,
  currentMemo = '',
  min,
  max,
  step,
  onSave,
  onClose,
}: EditCategoryModalProps) {
  const [value, setValue] = useState(currentValue);
  const [memo, setMemo] = useState(currentMemo || '');

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value));
  };

  const handleSave = () => {
    onSave(value, memo);
    onClose();
  };

  const categoryLabels: Record<string, string> = {
    monthly_income: '平均手取り',
    rent: '家賃・住宅ローン',
    utilities: '光熱費',
    internet: 'インターネット',
    mobile: '携帯代',
    car: '車関連',
    insurance: '保険',
    kids: '子ども関連',
    savings: '積立・投資',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {categoryLabels[category] || category}を編集
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              ¥{value.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">/ 月</div>
          </div>

          <div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={handleSliderChange}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>¥{min.toLocaleString()}</span>
              <span>¥{max.toLocaleString()}</span>
            </div>
          </div>
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
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Save className="w-5 h-5" />
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
