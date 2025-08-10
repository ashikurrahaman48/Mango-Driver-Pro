
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MangoIcon } from '../constants';

const SplashScreen: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className={`fixed inset-0 bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center z-50 animate-fadeOut`}>
        <div className="flex items-center gap-4 animate-fadeInUp">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-3 rounded-2xl shadow-lg shadow-orange-500/20">
             <MangoIcon className="w-12 h-12 text-white"/>
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{t('splashTitle')}</h1>
            <p className="text-xl text-orange-500 dark:text-orange-400 font-semibold">{t('splashSubtitle')}</p>
          </div>
      </div>
      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          90% { opacity: 1; }
          to { opacity: 0; visibility: hidden; }
        }
        .animate-fadeOut {
          animation: fadeOut 3s ease-in-out forwards;
        }
         @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fadeInUp {
            animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
