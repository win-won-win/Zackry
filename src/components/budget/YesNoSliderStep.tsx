import { useState } from 'react';
import { ArrowRight, ArrowLeft, LucideIcon, Circle, CheckCircle2, ChevronsUp } from 'lucide-react';
import { CharacterWithBubble } from './CharacterWithBubble';

interface YesNoSliderStepProps {
  stepNumber: number;
  totalSteps?: number;
  questionTitle: string;
  sliderTitle: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  min: number;
  max: number;
  step: number;
  initialValue: number;
  hint?: string;
  onNext: (hasItem: boolean, value: number) => void;
  onBack?: () => void;
}

interface YesNoSliderStepInternalProps extends YesNoSliderStepProps {
  initialMax: number;
}

export function YesNoSliderStep(props: YesNoSliderStepProps) {
  return <YesNoSliderStepInternal {...props} initialMax={props.max} />;
}

function YesNoSliderStepInternal({
  stepNumber,
  totalSteps = 12,
  questionTitle,
  sliderTitle,
  subtitle,
  icon: Icon,
  iconColor,
  min,
  max: maxProp,
  initialMax,
  step,
  initialValue,
  hint,
  onNext,
  onBack,
}: YesNoSliderStepInternalProps) {
  const [showSlider, setShowSlider] = useState<boolean | null>(null);
  const [value, setValue] = useState(initialValue);
  const [max, setMax] = useState(initialMax);

  const handleYes = () => {
    setShowSlider(true);
  };

  const handleNo = () => {
    onNext(false, 0);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value));
  };

  const handleMore = () => {
    setMax(max * 2);
  };

  const handleNext = () => {
    onNext(true, value);
  };

  if (showSlider === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="mb-8 flex items-center gap-3">
              <div className={`w-12 h-12 ${iconColor} rounded-full flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-slate-500">質問 {stepNumber} / {totalSteps}</div>
                <div className="text-xs text-slate-400">あと{Math.max(1, Math.ceil((totalSteps - stepNumber) / 5))}分くらいで終わります</div>
              </div>
            </div>

            <CharacterWithBubble message={questionTitle} />

            {subtitle && (
              <div className="mb-8">
                <p className="text-slate-600">{subtitle}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleYes}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                <CheckCircle2 className="w-6 h-6" />
                はい
              </button>
              <button
                onClick={handleNo}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-6 bg-white text-slate-700 border-2 border-slate-300 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-colors font-semibold text-lg"
              >
                <Circle className="w-6 h-6" />
                いいえ
              </button>
            </div>

            {onBack && (
              <button
                onClick={onBack}
                className="mt-4 w-full px-6 py-3 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                戻る
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="mb-8 flex items-center gap-3">
            <div className={`w-12 h-12 ${iconColor} rounded-full flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-slate-500">質問 {stepNumber} / {totalSteps}</div>
              <div className="text-xs text-slate-400">あと{Math.max(1, Math.ceil((totalSteps - stepNumber) / 5))}分くらいで終わります</div>
            </div>
          </div>

          <CharacterWithBubble message={sliderTitle} />

          {subtitle && (
            <div className="mb-8">
              <p className="text-slate-600">{subtitle}</p>
            </div>
          )}

          <div className="mb-8">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">
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
              <div className="text-sm text-slate-500 text-center bg-slate-50 rounded-lg p-3">
                {hint}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowSlider(null)}
              className="px-6 py-3 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
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
