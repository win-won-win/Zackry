import { useState } from 'react';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import {
  TOP_CATEGORIES,
  SERVICE_PRESETS,
  TopCategoryId,
  ServicePreset,
  PlanPreset,
  FAN_AMOUNT_OPTIONS,
  FAN_TYPES,
  OTHER_AMOUNT_OPTIONS
} from '../data/presets';

interface SelectedService {
  serviceId: string;
  categoryId: TopCategoryId;
  serviceName: string;
  planId: string | null;
  planName: string | null;
  approxMonthlyJPY: number;
  billingCycle: 'monthly' | 'yearly';
  customName?: string;
}

interface ServiceWizardProps {
  selectedCategories: TopCategoryId[];
  onComplete: (services: SelectedService[]) => void;
  onBack: () => void;
}

export function ServiceWizard({ selectedCategories, onComplete, onBack }: ServiceWizardProps) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [currentServiceIndex, setCurrentServiceIndex] = useState<number | null>(null);
  const [allSelectedServices, setAllSelectedServices] = useState<SelectedService[]>([]);
  const [customFanName, setCustomFanName] = useState('');
  const [customOtherName, setCustomOtherName] = useState('');

  const currentCategoryId = selectedCategories[currentCategoryIndex];
  const currentCategory = TOP_CATEGORIES.find((c) => c.id === currentCategoryId);
  const servicesForCategory = SERVICE_PRESETS.filter((s) => s.topCategoryId === currentCategoryId);

  const isServiceSelectionStep = currentServiceIndex === null;
  const isLastCategory = currentCategoryIndex === selectedCategories.length - 1;

  const handleServiceToggle = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const handleNextFromServiceSelection = () => {
    if (selectedServices.length === 0) {
      moveToNextCategory();
    } else {
      setCurrentServiceIndex(0);
    }
  };

  const handlePlanSelect = (service: ServicePreset, plan: PlanPreset, billingCycle: 'monthly' | 'yearly') => {
    const newService: SelectedService = {
      serviceId: service.id,
      categoryId: currentCategoryId,
      serviceName: service.name,
      planId: plan.id,
      planName: plan.name,
      approxMonthlyJPY: plan.approxMonthlyJPY,
      billingCycle,
    };

    setAllSelectedServices([...allSelectedServices, newService]);
    moveToNextService();
  };

  const handleFanAdd = (type: string, amount: number) => {
    const newService: SelectedService = {
      serviceId: 'fan-custom',
      categoryId: 'fan',
      serviceName: customFanName || type,
      planId: null,
      planName: null,
      approxMonthlyJPY: amount,
      billingCycle: 'monthly',
      customName: customFanName || type,
    };

    setAllSelectedServices([...allSelectedServices, newService]);
    setCustomFanName('');
    setSelectedServices([]);
    moveToNextCategory();
  };

  const handleOtherAdd = (amount: number) => {
    const newService: SelectedService = {
      serviceId: 'other-custom',
      categoryId: 'other',
      serviceName: customOtherName || 'その他',
      planId: null,
      planName: null,
      approxMonthlyJPY: amount,
      billingCycle: 'monthly',
      customName: customOtherName || 'その他',
    };

    setAllSelectedServices([...allSelectedServices, newService]);
    setCustomOtherName('');
    setSelectedServices([]);
    moveToNextCategory();
  };

  const moveToNextService = () => {
    const nextIndex = (currentServiceIndex ?? -1) + 1;
    if (nextIndex < selectedServices.length) {
      setCurrentServiceIndex(nextIndex);
    } else {
      moveToNextCategory();
    }
  };

  const moveToNextCategory = () => {
    setSelectedServices([]);
    setCurrentServiceIndex(null);

    if (isLastCategory) {
      onComplete(allSelectedServices);
    } else {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
    }
  };

  const handleSkipService = () => {
    moveToNextService();
  };

  if (currentCategoryId === 'fan' && isServiceSelectionStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                ファン会員・推し活のサブスクはありますか？
              </h2>
              <p className="text-slate-600">種類と金額を選択してください</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  サービス名（任意）
                </label>
                <input
                  type="text"
                  value={customFanName}
                  onChange={(e) => setCustomFanName(e.target.value)}
                  placeholder="例: ○○のファンクラブ"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  金額を選択
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {FAN_AMOUNT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFanAdd(customFanName || 'ファン会員', option.value)}
                      className="px-4 py-3 bg-white border-2 border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors font-medium"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={onBack}
                  className="px-6 py-3 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={moveToNextCategory}
                  className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  スキップ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentCategoryId === 'other' && isServiceSelectionStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                その他のサブスク・固定費はありますか？
              </h2>
              <p className="text-slate-600">サービス名と金額を入力してください</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  サービス名
                </label>
                <input
                  type="text"
                  value={customOtherName}
                  onChange={(e) => setCustomOtherName(e.target.value)}
                  placeholder="例: セキュリティソフト"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  おおよその金額
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {OTHER_AMOUNT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleOtherAdd(option.value)}
                      disabled={!customOtherName}
                      className="px-4 py-3 bg-white border-2 border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={onBack}
                  className="px-6 py-3 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={moveToNextCategory}
                  className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  スキップ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isServiceSelectionStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                どのサービスを使っていますか？
              </h2>
              <p className="text-slate-600">
                {currentCategory?.label} - 当てはまるものをタップしてください
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {servicesForCategory.map((service) => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <button
                    key={service.id}
                    onClick={() => handleServiceToggle(service.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <span className="font-medium">{service.name}</span>
                    {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="px-6 py-3 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextFromServiceSelection}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {selectedServices.length > 0 ? '次へ' : 'スキップ'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentServiceId = selectedServices[currentServiceIndex!];
  const currentService = servicesForCategory.find((s) => s.id === currentServiceId);

  if (!currentService) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {currentService.name} のプランはどれですか？
            </h2>
            <p className="text-slate-600">だいたいでOKです</p>
          </div>

          <div className="space-y-3 mb-8">
            {currentService.plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handlePlanSelect(currentService, plan, plan.billingCycle)}
                className="w-full flex items-center justify-between px-6 py-4 bg-white border-2 border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div>
                  <div className="font-semibold text-slate-900">{plan.name}</div>
                  {plan.note && <div className="text-sm text-slate-500 mt-1">{plan.note}</div>}
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">¥{plan.approxMonthlyJPY.toLocaleString()}</div>
                  <div className="text-sm text-slate-500">
                    {plan.billingCycle === 'monthly' ? '/ 月' : '/ 月相当'}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                if (currentServiceIndex === 0) {
                  setCurrentServiceIndex(null);
                } else {
                  setCurrentServiceIndex((currentServiceIndex ?? 0) - 1);
                }
              }}
              className="px-6 py-3 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleSkipService}
              className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
            >
              よくわからない（スキップ）
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
