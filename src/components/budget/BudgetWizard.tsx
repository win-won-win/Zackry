import { useState } from 'react';
import { Step0Income } from './Step0Income';
import { SliderStep } from './SliderStep';
import { YesNoSliderStep } from './YesNoSliderStep';
import { Step4Mobile } from './Step4Mobile';
import { Step9Subscriptions } from './Step9Subscriptions';
import { Step10Summary } from './Step10Summary';
import { getDefaultValue } from '../../data/budgetDefaults';
import { Home, Zap, Wifi, Car, Shield, Baby, TrendingUp, ShoppingCart, CreditCard } from 'lucide-react';
import { HouseholdBudget } from '../../lib/supabase';

interface BudgetWizardProps {
  onComplete: (budget: Partial<HouseholdBudget>) => void;
  onSubscriptionsDetailed: (currentBudget: Partial<HouseholdBudget>) => void;
}

export function BudgetWizard({ onComplete, onSubscriptionsDetailed }: BudgetWizardProps) {
  const TOTAL_QUESTIONS = 12;
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState<Partial<HouseholdBudget>>({
    monthly_income: 0,
    rent: 0,
    utilities: 0,
    internet: 0,
    mobile: 0,
    car: 0,
    insurance: 0,
    kids: 0,
    savings: 0,
    subscriptions_total: 0,
    variable_expenses: 0,
    debt_repayment: 0,
    mobile_carriers: [],
    has_car: false,
    has_kids: false,
    subscriptions_mode: 'rough',
    variable_expenses_mode: 'rough',
    rent_mode: 'rough',
    utilities_mode: 'rough',
    internet_mode: 'rough',
    mobile_mode: 'rough',
    car_mode: 'rough',
    insurance_mode: 'rough',
    kids_mode: 'rough',
    savings_mode: 'rough',
    debt_repayment_mode: 'rough',
  });

  const handleStep0 = (income: number, memo?: string) => {
    setBudget({
      monthly_income: income,
      monthly_income_memo: memo,
      rent: 0,
      utilities: 0,
      internet: 0,
      mobile: 0,
      car: 0,
      insurance: 0,
      kids: 0,
      savings: 0,
      subscriptions_total: 0,
      variable_expenses: 0,
      debt_repayment: 0,
      mobile_carriers: [],
      has_car: false,
      has_kids: false,
      subscriptions_mode: 'rough',
      variable_expenses_mode: 'rough',
      rent_mode: 'rough',
      utilities_mode: 'rough',
      internet_mode: 'rough',
      mobile_mode: 'rough',
      car_mode: 'rough',
      insurance_mode: 'rough',
      kids_mode: 'rough',
      savings_mode: 'rough',
      debt_repayment_mode: 'rough',
    });
    setStep(1);
  };

  const handleStep1 = (value: number) => {
    setBudget({ ...budget, rent: value });
    setStep(2);
  };

  const handleStep2 = (value: number) => {
    setBudget({ ...budget, utilities: value });
    setStep(3);
  };

  const handleStep3 = (value: number) => {
    setBudget({ ...budget, internet: value });
    setStep(4);
  };

  const handleStep4 = (carriers: string[], amount: number) => {
    setBudget({ ...budget, mobile: amount, mobile_carriers: carriers });
    setStep(5);
  };

  const handleStep5 = (value: number) => {
    setBudget({ ...budget, has_car: value > 0, car: value });
    setStep(6);
  };

  const handleStep6 = (value: number) => {
    setBudget({ ...budget, insurance: value });
    setStep(7);
  };

  const handleStep7 = (value: number) => {
    setBudget({ ...budget, has_kids: value > 0, kids: value });
    setStep(8);
  };

  const handleStep8 = (value: number) => {
    setBudget({ ...budget, savings: value });
    setStep(9);
  };

  const handleStep9 = (value: number) => {
    setBudget({ ...budget, variable_expenses: value });
    setStep(10);
  };

  const handleStep10 = (value: number) => {
    setBudget({ ...budget, debt_repayment: value });
    setStep(11);
  };

  const handleStep11Rough = (amount: number) => {
    setBudget({ ...budget, subscriptions_total: amount, subscriptions_mode: 'rough' });
    setStep(12);
  };

  const handleStep11Detailed = () => {
    const currentBudget = { ...budget, subscriptions_mode: 'detailed' as const };
    setBudget(currentBudget);
    onSubscriptionsDetailed(currentBudget);
  };

  const handleStep12Save = () => {
    onComplete({ ...budget, completed_wizard: true });
  };

  const income = budget.monthly_income || 0;

  if (step === 0) {
    return <Step0Income onComplete={handleStep0} totalSteps={TOTAL_QUESTIONS} />;
  }

  if (step === 1) {
    const maxRent = Math.min(Math.floor(income * 0.7), 200000);
    const defaultRent = getDefaultValue(income, 'rent');
    return (
      <SliderStep
        stepNumber={2}
        totalSteps={TOTAL_QUESTIONS}
        title="家賃 または 住宅ローンは、だいたい月いくらですか？"
        icon={Home}
        iconColor="bg-blue-600"
        min={0}
        max={maxRent}
        step={5000}
        initialValue={defaultRent}
        hint="一般的には手取りの2〜3割と言われています"
        onNext={handleStep1}
        onBack={() => setStep(0)}
      />
    );
  }

  if (step === 2) {
    const defaultUtilities = getDefaultValue(income, 'utilities');
    return (
      <SliderStep
        stepNumber={3}
        totalSteps={TOTAL_QUESTIONS}
        title="電気・ガス・水道などの光熱費は、だいたい月いくらですか？"
        icon={Zap}
        iconColor="bg-yellow-600"
        min={0}
        max={50000}
        step={1000}
        initialValue={defaultUtilities}
        hint="一人暮らしだと7,000〜12,000円、家族世帯だと15,000〜25,000円くらいです"
        onNext={handleStep2}
        onBack={() => setStep(1)}
      />
    );
  }

  if (step === 3) {
    const defaultInternet = getDefaultValue(income, 'internet');
    return (
      <SliderStep
        stepNumber={4}
        totalSteps={TOTAL_QUESTIONS}
        title="自宅のインターネット回線（Wi-Fi）は、だいたい月いくらですか？"
        icon={Wifi}
        iconColor="bg-cyan-600"
        min={0}
        max={15000}
        step={500}
        initialValue={defaultInternet}
        hint="光回線の相場は4,000〜6,000円くらいです"
        onNext={handleStep3}
        onBack={() => setStep(2)}
      />
    );
  }

  if (step === 4) {
    const defaultMobile = getDefaultValue(income, 'mobile');
    return (
      <Step4Mobile
        initialValue={defaultMobile}
        stepNumber={5}
        totalSteps={TOTAL_QUESTIONS}
        onNext={handleStep4}
        onBack={() => setStep(3)}
      />
    );
  }

  if (step === 5) {
    const defaultCar = getDefaultValue(income, 'car');
    return (
      <SliderStep
        stepNumber={6}
        totalSteps={TOTAL_QUESTIONS}
        title="車にかかるお金（ローン・駐車場・ガソリンなど）を合計すると、だいたい月いくらですか？"
        icon={Car}
        iconColor="bg-orange-600"
        min={0}
        max={100000}
        step={5000}
        initialValue={defaultCar}
        hint="車を持っていない人は 0 でOKです。都内・駐車場込みだと20,000〜50,000円くらいの方が多いです"
        onNext={handleStep5}
        onBack={() => setStep(4)}
      />
    );
  }

  if (step === 6) {
    const defaultInsurance = getDefaultValue(income, 'insurance');
    return (
      <SliderStep
        stepNumber={7}
        totalSteps={TOTAL_QUESTIONS}
        title="生命保険・医療保険など、保険に月いくらくらい払っていますか？（合計でOK）"
        icon={Shield}
        iconColor="bg-green-600"
        min={0}
        max={50000}
        step={1000}
        initialValue={defaultInsurance}
        hint="まったく入っていない人は 0 でOKです"
        onNext={handleStep6}
        onBack={() => setStep(5)}
      />
    );
  }

  if (step === 7) {
    const defaultKids = getDefaultValue(income, 'kids');
    return (
      <SliderStep
        stepNumber={8}
        totalSteps={TOTAL_QUESTIONS}
        title="お子さん関連の毎月の固定費（保育園・学校・習い事など）は、だいたい月いくらくらいですか？"
        icon={Baby}
        iconColor="bg-pink-600"
        min={0}
        max={100000}
        step={5000}
        initialValue={defaultKids}
        hint="お子さんがいない人は 0 でOKです。保育園・塾・習い事などを含めた金額です"
        onNext={handleStep7}
        onBack={() => setStep(6)}
      />
    );
  }

  if (step === 8) {
    const defaultSavings = getDefaultValue(income, 'savings');
    return (
      <SliderStep
        stepNumber={9}
        totalSteps={TOTAL_QUESTIONS}
        title="毎月の自動積立や投資（つみたてNISAなど）はありますか？"
        icon={TrendingUp}
        iconColor="bg-indigo-600"
        min={0}
        max={100000}
        step={5000}
        initialValue={defaultSavings}
        hint="まだやってない人は 0 でOKです"
        onNext={handleStep8}
        onBack={() => setStep(7)}
      />
    );
  }

  if (step === 9) {
    const defaultVariableExpenses = getDefaultValue(income, 'variable_expenses');
    return (
      <SliderStep
        stepNumber={10}
        totalSteps={TOTAL_QUESTIONS}
        title="毎月の変動費（食事・交際費・娯楽・ゲーム課金など）は、だいたい月いくらですか？"
        icon={ShoppingCart}
        iconColor="bg-purple-600"
        min={0}
        max={200000}
        step={5000}
        initialValue={defaultVariableExpenses}
        hint="外食・コンビニ・趣味・ゲーム課金・友達との遊びなど、固定費以外の変動するお金です"
        onNext={handleStep9}
        onBack={() => setStep(8)}
      />
    );
  }

  if (step === 10) {
    const defaultDebtRepayment = getDefaultValue(income, 'debt_repayment');
    return (
      <SliderStep
        stepNumber={11}
        totalSteps={TOTAL_QUESTIONS}
        title="毎月の返済額（奨学金・ローン・借入など）は、だいたい月いくらですか？"
        icon={CreditCard}
        iconColor="bg-red-600"
        min={0}
        max={100000}
        step={5000}
        initialValue={defaultDebtRepayment}
        hint="奨学金・カーローン・その他の借入の返済額です。ない人は 0 でOK"
        onNext={handleStep10}
        onBack={() => setStep(9)}
      />
    );
  }

  if (step === 11) {
    const defaultSubscriptions = getDefaultValue(income, 'subscriptions');
    return (
      <Step9Subscriptions
        initialValue={defaultSubscriptions}
        stepNumber={12}
        totalSteps={TOTAL_QUESTIONS}
        onRough={handleStep11Rough}
        onDetailed={handleStep11Detailed}
        onBack={() => setStep(10)}
      />
    );
  }

  if (step === 12) {
    return (
      <Step10Summary
        budget={budget}
        onSave={handleStep12Save}
        onAdjust={() => setStep(1)}
      />
    );
  }

  return null;
}
