import { useState } from 'react';
import { ArrowLeft, LogOut, RotateCcw, User, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SettingsPageProps {
  onBack: () => void;
  onReset: () => void;
}

export function SettingsPage({ onBack, onReset }: SettingsPageProps) {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      alert('ログアウトに失敗しました。');
    }
  };

  const handleReset = () => {
    if (window.confirm('すべての入力内容がリセットされ、最初から入力し直すことになります。\n本当にリセットしますか？')) {
      onReset();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            戻る
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">設定</h1>

          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                アカウント情報
              </h2>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-600" />
                  <div>
                    <div className="text-sm text-slate-600">メールアドレス</div>
                    <div className="font-medium text-slate-900">{user?.email}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold text-lg shadow-lg"
              >
                <RotateCcw className="w-5 h-5" />
                すべてリセット
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold text-lg shadow-lg"
              >
                <LogOut className="w-5 h-5" />
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
