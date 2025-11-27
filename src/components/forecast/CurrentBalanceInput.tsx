import { useState } from 'react';
import { Wallet, ArrowRight, ChevronsUp } from 'lucide-react';

interface CurrentBalanceInputProps {
  onNext: (balance: number) => void;
  onSkip: () => void;
}

const BALANCE_PRESETS = [0, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000];

export function CurrentBalanceInput({ onNext, onSkip }: CurrentBalanceInputProps) {
  const [balance, setBalance] = useState(100000);
  const [maxBalance, setMaxBalance] = useState(10000000);

  const handlePresetClick = (amount: number) => {
    setBalance(amount);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBalance(Number(e.target.value));
  };

  const handleMore = () => {
    setMaxBalance(maxBalance + 10000000);
  };

  const handleNext = () => {
    onNext(balance);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-slate-500">年間収支予測</div>
              <div className="text-xs text-slate-400">現在の残高を入力</div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              いま、全部ひっくるめて<br />手元にいくらくらいありますか？
            </h2>
            <p className="text-sm md:text-base text-slate-600">
              銀行＋現金の合計でOKです。<br />
              口座ごとに分けなくて大丈夫です。ざっくり「このくらい」でOKです。
            </p>
          </div>

          <div className="mb-6">
            <div className="text-center mb-4">
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">
                ¥{balance.toLocaleString()}
              </div>
            </div>

            <div className="mb-4">
              <input
                type="range"
                min="0"
                max={maxBalance}
                step="10000"
                value={balance}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>¥0</span>
                <span>¥{(maxBalance / 10000).toFixed(0)}万</span>
              </div>
            </div>

            {balance >= maxBalance * 0.9 && (
              <div className="mb-4 flex justify-center">
                <button
                  onClick={handleMore}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm"
                >
                  <ChevronsUp className="w-4 h-4" />
                  もっと！
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BALANCE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetClick(preset)}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    balance === preset
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {preset === 0 ? '¥0' : `${preset >= 10000 ? preset / 10000 : preset / 1000}万`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-base md:text-lg shadow-lg hover:shadow-xl"
            >
              1年分の予想を見る
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onSkip}
              className="w-full px-6 py-3 bg-white text-slate-700 border-2 border-slate-300 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-colors font-medium text-sm"
            >
              スキップ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
