import { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Sliders } from 'lucide-react';
import { CharacterWithBubble } from './CharacterWithBubble';

interface Step9SubscriptionsProps {
  initialValue: number;
  onRough: (amount: number) => void;
  onDetailed: () => void;
  onBack?: () => void;
}

export function Step9Subscriptions({ initialValue, onRough, onDetailed, onBack }: Step9SubscriptionsProps) {
  const [mode, setMode] = useState<'select' | 'rough'>('select');
  const [amount, setAmount] = useState(initialValue);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
  };

  const handleRoughNext = () => {
    onRough(amount);
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="mb-8 flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-slate-500">質問 9 / 12</div>
                <div className="text-xs text-slate-400">もうすぐ終わります！</div>
              </div>
            </div>

            <CharacterWithBubble message="動画・音楽・クラウド・AI・学習などのサブスクも固定費の一部です。ここはどうしますか？" />

            <div className="space-y-4 mb-8">
              <button
                onClick={() => setMode('rough')}
                className="w-full p-6 bg-white border-2 border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                    <Sliders className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 mb-1">ざっくりでいい（スライダーのみ）</div>
                    <div className="text-sm text-slate-600">だいたいの金額を入力するだけでOK</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </button>

              <button
                onClick={onDetailed}
                className="w-full p-6 bg-white border-2 border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                    <Sparkles className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 mb-1">ちゃんと選びたい（詳細ウィザードへ）</div>
                    <div className="text-sm text-slate-600">Netflix、Spotify、ChatGPTなど個別に選択</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </button>
            </div>

            {onBack && (
              <button
                onClick={onBack}
                className="w-full px-6 py-3 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium flex items-center justify-center gap-2"
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
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-slate-500">質問 9 / 10</div>
              <div className="text-xs text-slate-400">もうすぐ終わります！</div>
            </div>
          </div>

          <CharacterWithBubble message="サブスクに月いくらくらい使っていますか？" />

          <div className="mb-8">
            <p className="text-slate-600">だいたいでOKです！</p>
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
                max="30000"
                step="1000"
                value={amount}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>¥0</span>
                <span>¥30,000</span>
              </div>
            </div>

            <div className="text-sm text-slate-500 text-center bg-slate-50 rounded-lg p-3">
              動画・音楽・クラウドなどを合わせて3,000〜10,000円くらいの方が多いです
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setMode('select')}
              className="px-6 py-3 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleRoughNext}
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
