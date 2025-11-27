import { useState } from 'react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { TOP_CATEGORIES, TopCategoryId } from '../data/presets';

interface CategoryWizardProps {
  onComplete: (selectedCategories: TopCategoryId[]) => void;
}

export function CategoryWizard({ onComplete }: CategoryWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<TopCategoryId[]>([]);

  const currentCategory = TOP_CATEGORIES[currentIndex];
  const progress = ((currentIndex + 1) / TOP_CATEGORIES.length) * 100;

  const handleYes = () => {
    setSelectedCategories([...selectedCategories, currentCategory.id]);
    moveToNext();
  };

  const handleNo = () => {
    moveToNext();
  };

  const moveToNext = () => {
    if (currentIndex < TOP_CATEGORIES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(selectedCategories);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>質問 {currentIndex + 1} / {TOP_CATEGORIES.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {currentCategory.question}
            </h2>
            <p className="text-slate-600">{currentCategory.description}</p>
          </div>

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

          {selectedCategories.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-600 mb-2">選択済み:</p>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((catId) => {
                  const cat = TOP_CATEGORIES.find((c) => c.id === catId);
                  return (
                    <span
                      key={catId}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {cat?.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
