import { useState } from 'react';
import { Smartphone, ExternalLink, Check } from 'lucide-react';
import { MOBILE_CARRIERS, MOBILE_AMOUNT_OPTIONS, MobileCarrierId } from '../data/presets';

interface MobileSubscription {
  carrierId: MobileCarrierId;
  carrierName: string;
  approxMonthlyJPY: number;
}

interface MobileWizardProps {
  onComplete: (subscriptions: MobileSubscription[]) => void;
  onSkip: () => void;
}

export function MobileWizard({ onComplete, onSkip }: MobileWizardProps) {
  const [step, setStep] = useState<'ask' | 'select-carriers' | 'select-amounts'>('ask');
  const [selectedCarriers, setSelectedCarriers] = useState<MobileCarrierId[]>([]);
  const [currentCarrierIndex, setCurrentCarrierIndex] = useState(0);
  const [carrierAmounts, setCarrierAmounts] = useState<Record<MobileCarrierId, number>>({});

  const handleYes = () => {
    setStep('select-carriers');
  };

  const handleNo = () => {
    onSkip();
  };

  const handleCarrierToggle = (carrierId: MobileCarrierId) => {
    if (selectedCarriers.includes(carrierId)) {
      setSelectedCarriers(selectedCarriers.filter((id) => id !== carrierId));
    } else {
      setSelectedCarriers([...selectedCarriers, carrierId]);
    }
  };

  const handleNextFromCarriers = () => {
    if (selectedCarriers.length === 0) {
      onSkip();
    } else {
      setStep('select-amounts');
      setCurrentCarrierIndex(0);
    }
  };

  const handleAmountSelect = (amount: number) => {
    const currentCarrierId = selectedCarriers[currentCarrierIndex];
    const newAmounts = { ...carrierAmounts, [currentCarrierId]: amount };
    setCarrierAmounts(newAmounts);

    if (currentCarrierIndex < selectedCarriers.length - 1) {
      setCurrentCarrierIndex(currentCarrierIndex + 1);
    } else {
      const subscriptions: MobileSubscription[] = selectedCarriers.map((carrierId) => {
        const carrier = MOBILE_CARRIERS.find((c) => c.id === carrierId);
        return {
          carrierId,
          carrierName: carrier?.label || carrierId,
          approxMonthlyJPY: newAmounts[carrierId] || 3000,
        };
      });
      onComplete(subscriptions);
    }
  };

  if (step === 'ask') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                毎月の"携帯代"も、<br />一緒に入れておきますか？
              </h2>
              <p className="text-slate-600">
                サブスクと一緒に管理すると、全体像が見えやすくなります
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleYes}
                className="flex-1 px-8 py-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                はい、携帯代も入れる
              </button>
              <button
                onClick={handleNo}
                className="flex-1 px-8 py-6 bg-white text-slate-700 border-2 border-slate-300 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-colors font-semibold text-lg"
              >
                今はスキップ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'select-carriers') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                どの携帯会社を使っていますか？
              </h2>
              <p className="text-slate-600">複数選択可能です</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {MOBILE_CARRIERS.map((carrier) => {
                const isSelected = selectedCarriers.includes(carrier.id);
                return (
                  <button
                    key={carrier.id}
                    onClick={() => handleCarrierToggle(carrier.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">{carrier.label}</div>
                      {carrier.group && (
                        <div className="text-xs text-slate-500">{carrier.group}</div>
                      )}
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNextFromCarriers}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {selectedCarriers.length > 0 ? '次へ' : 'スキップ'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCarrierId = selectedCarriers[currentCarrierIndex];
  const currentCarrier = MOBILE_CARRIERS.find((c) => c.id === currentCarrierId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="mb-8">
            <div className="text-sm text-slate-500 mb-2">
              {currentCarrierIndex + 1} / {selectedCarriers.length}
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {currentCarrier?.label} の月額はいくらくらいですか？
            </h2>
            <p className="text-slate-600 mb-4">だいたいの金額でOKです</p>

            {currentCarrier?.portalUrl && (
              <a
                href={currentCarrier.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                マイページで確認する
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {MOBILE_AMOUNT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAmountSelect(option.value)}
                className="px-4 py-4 bg-white border-2 border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors font-medium text-slate-900"
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleAmountSelect(3000)}
            className="w-full px-4 py-3 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm"
          >
            よくわからない（3,000円として扱う）
          </button>
        </div>
      </div>
    </div>
  );
}
