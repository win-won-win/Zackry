import { CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './Logo';

interface WelcomeScreenProps {
  onStart: () => void;
  onGmailConnect?: () => void;
}

export function WelcomeScreen({ onStart, onGmailConnect }: WelcomeScreenProps) {
  const { user, signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
      alert('ログインに失敗しました。もう一度お試しください。');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-12">
            <div className="mb-6">
              <Sparkles className="w-12 h-12 md:w-16 md:h-16 mx-auto text-blue-600" />
            </div>
            <h1 className="mb-6">
              <Logo
                align="center"
                className="w-full"
                imageClassName="h-12 md:h-14 lg:h-16"
                textClassName="text-3xl md:text-4xl lg:text-5xl"
              />
            </h1>
            <p className="text-xl md:text-2xl text-slate-700 mb-8 font-semibold">
              タップだけで家計簿作ってみる？
            </p>
            <button
              onClick={handleGoogleSignIn}
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-base md:text-lg shadow-lg hover:shadow-xl"
            >
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
              Googleでログインして始める
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-12">
          <div className="mb-6">
            <Sparkles className="w-12 h-12 md:w-16 md:h-16 mx-auto text-blue-600" />
          </div>
          <h1 className="mb-6">
            <Logo
              align="center"
              className="w-full"
              imageClassName="h-12 md:h-14 lg:h-16"
              textClassName="text-3xl md:text-4xl lg:text-5xl"
            />
          </h1>
          <p className="text-xl md:text-2xl text-slate-700 mb-8 font-semibold">
            タップだけで家計簿作ってみる？
          </p>
          <div className="space-y-4">
            <button
              onClick={onStart}
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-base md:text-lg shadow-lg hover:shadow-xl"
            >
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
              はじめる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
