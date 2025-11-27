import { useState } from 'react';
import { TrendingUp, ArrowRight, ChevronsUp } from 'lucide-react';
import { CharacterWithBubble } from './CharacterWithBubble';

interface Step0IncomeProps {
  onComplete: (income: number, memo?: string) => void;
  initialMemo?: string;
  stepNumber?: number;
  totalSteps?: number;
}

export function Step0Income({ onComplete, initialMemo = '', stepNumber = 1, totalSteps = 12 }: Step0IncomeProps) {
  const [income, setIncome] = useState(250000);
  const [maxIncome, setMaxIncome] = useState(1000000);
  const [memo, setMemo] = useState(initialMemo);


  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncome(Number(e.target.value));
  };

  const handleMoreIncome = () => {
    setMaxIncome(maxIncome + 5000000);
  };

  const handleNext = () => {
    onComplete(income, memo);
  };

  const getCongratulationMessage = () => {
    if (income >= 1000000) {
      return '素晴らしい収入ですね！🎉';
    } else if (income >= 400000) {
      return 'すごいですね！💪';
    }
    return null;
  };

  const congratsMessage = getCongratulationMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-slate-500">質問 {stepNumber} / {totalSteps}</div>
              <div className="text-xs text-slate-400">あと2分くらいで終わります</div>
            </div>
          </div>

          <CharacterWithBubble message="あなたの手取り月収はいくらくらいですか？" />

          <div className="mb-6">
            <p className="text-sm md:text-base text-slate-600">
              手取りベースでOKです。ボーナスは含めなくて大丈夫です。
            </p>
          </div>

          <div className="mb-6">
            <div className="text-center mb-4">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                ¥{income.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">/ 月</div>
              {congratsMessage && (
                <div className="mt-2 text-lg font-medium text-green-600 animate-pulse">
                  {congratsMessage}
                </div>
              )}
            </div>

            <div className="mb-4">
              <input
                type="range"
                min="50000"
                max={maxIncome}
                step="10000"
                value={income}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>¥50,000</span>
                <span>¥{(maxIncome / 10000).toFixed(0)}万</span>
              </div>
            </div>

            {income >= maxIncome * 0.9 && (
              <div className="mb-4 flex justify-center">
                <button
                  onClick={handleMoreIncome}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm"
                >
                  <ChevronsUp className="w-4 h-4" />
                  もっと！
                </button>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              メモ（任意）
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="この項目についてメモを残せます"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={2}
            />
          </div>

          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-base md:text-lg shadow-lg hover:shadow-xl"
          >
            次へ
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
