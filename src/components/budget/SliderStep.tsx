import { useState } from 'react';
import { ArrowRight, ArrowLeft, LucideIcon, ChevronsUp } from 'lucide-react';
import { CharacterWithBubble } from './CharacterWithBubble';

interface SliderStepProps {
  stepNumber: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  min: number;
  max: number;
  step: number;
  initialValue: number;
  initialMemo?: string;
  hint?: string;
  onNext: (value: number, memo?: string) => void;
  onBack?: () => void;
}

export function SliderStep({
  stepNumber,
  totalSteps = 12,
  title,
  subtitle,
  icon: Icon,
  iconColor,
  min,
  max: initialMax,
  step,
  initialValue,
  initialMemo = '',
  hint,
  onNext,
  onBack,
}: SliderStepProps) {
  const [value, setValue] = useState(initialValue);
  const [max, setMax] = useState(initialMax);
  const [memo, setMemo] = useState(initialMemo);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value));
  };

  const handleMore = () => {
    setMax(max * 2);
  };

  const handleNext = () => {
    onNext(value, memo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className={`w-10 h-10 md:w-12 md:h-12 ${iconColor} rounded-full flex items-center justify-center`}>
              <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-slate-500">質問 {stepNumber} / {totalSteps}</div>
              <div className="text-xs text-slate-400">あと{Math.max(1, Math.ceil((totalSteps - stepNumber) / 5))}分くらいで終わります</div>
            </div>
          </div>

          <CharacterWithBubble message={title} />

          {subtitle && (
            <div className="mb-6">
              <p className="text-sm md:text-base text-slate-600">{subtitle}</p>
            </div>
          )}

          <div className="mb-6">
            <div className="text-center mb-4">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                ¥{value.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">/ 月</div>
            </div>

            <div className="mb-4">
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

            <div className="mb-4 flex justify-center">
              <button
                onClick={handleMore}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm"
              >
                <ChevronsUp className="w-4 h-4" />
                もっと！
              </button>
            </div>

            {hint && (
              <div className="text-xs md:text-sm text-slate-500 text-center bg-slate-50 rounded-lg p-3">
                {hint}
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

          <div className="flex gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-3 md:px-6 md:py-3 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-base md:text-lg shadow-lg hover:shadow-xl"
            >
              次へ
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
