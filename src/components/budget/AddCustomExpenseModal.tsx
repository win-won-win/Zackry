import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface AddCustomExpenseModalProps {
  onSave: (name: string, amount: number, memo: string) => void;
  onClose: () => void;
}

export function AddCustomExpenseModal({ onSave, onClose }: AddCustomExpenseModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [memo, setMemo] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      alert('名前を入力してください');
      return;
    }
    if (amount < 0) {
      alert('金額は0以上で入力してください');
      return;
    }
    onSave(name.trim(), amount, memo.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">固定費を追加</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              名前
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：ジム会費、習い事など"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              月額（円）
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">¥</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                min="0"
                step="100"
              />
            </div>
          </div>

          <div>
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
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
