import { useState } from 'react';
import { Smartphone, ArrowRight, ArrowLeft, Check, ExternalLink, ChevronsUp } from 'lucide-react';
import { MOBILE_CARRIERS } from '../../data/presets';
import { CharacterWithBubble } from './CharacterWithBubble';

interface Step4MobileProps {
  initialValue: number;
  onNext: (carriers: string[], amount: number) => void;
  onBack?: () => void;
}

export function Step4Mobile({ initialValue, onNext, onBack }: Step4MobileProps) {
  const [step, setStep] = useState<'amount' | 'carrier-list' | 'carrier-detail'>('amount');
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);
  const [amount, setAmount] = useState(initialValue);
  const [max, setMax] = useState(20000);

  const handleCarrierToggle = (carrierId: string) => {
    if (selectedCarriers.includes(carrierId)) {
      setSelectedCarriers(selectedCarriers.filter((id) => id !== carrierId));
    } else {
      setSelectedCarriers([...selectedCarriers, carrierId]);
    }
  };

  const handleShowCarrierList = () => {
    setStep('carrier-list');
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
  };

  const handleMore = () => {
    setMax(max * 2);
  };

  const handleNext = () => {
    onNext(selectedCarriers, amount);
  };

  if (step === 'carrier-list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="mb-8 flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-slate-500">質問 4 / 12</div>
                <div className="text-xs text-slate-400">あと1分くらいで終わります</div>
              </div>
            </div>

            <CharacterWithBubble message="どの携帯会社を使っていますか？" />

            <div className="mb-8">
              <p className="text-slate-600">選択すると各キャリアのページに飛びます（複数でもOK）</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {MOBILE_CARRIERS.map((carrier) => {
                return (
                  <a
                    key={carrier.id}
                    href={carrier.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 rounded-lg border-2 bg-white border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="text-left">
                      <div className="font-medium group-hover:text-blue-700">{carrier.label}</div>
                      {carrier.group && (
                        <div className="text-xs text-slate-500">{carrier.group}</div>
                      )}
                    </div>
                    <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                  </a>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('amount')}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="w-5 h-5" />
                戻る
              </button>
            </div>
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
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-slate-500">質問 4 / 12</div>
              <div className="text-xs text-slate-400">あと1分くらいで終わります</div>
            </div>
          </div>

          <CharacterWithBubble message="携帯代（合計）は、だいたい月いくらですか？" />

          <div className="mb-8">
            <p className="text-slate-600 text-sm">
              格安SIMだと1,000〜3,000円、大手キャリアだと5,000〜8,000円くらいが相場です
            </p>
          </div>

          <div className="mb-8">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                ¥{amount.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">/ 月</div>
            </div>

            <div className="mb-4">
              <input
                type="range"
                min="0"
                max={max}
                step="1000"
                value={amount}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>¥0</span>
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

            <div className="text-center mb-6">
              <button
                onClick={handleShowCarrierList}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                詳しく調べたい方はこちらから
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="px-6 py-3 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
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
