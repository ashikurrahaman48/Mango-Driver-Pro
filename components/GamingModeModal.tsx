import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Spinner from './Spinner';
import { CheckCircleIcon, BoltIcon } from '../constants';

interface GamingModeModalProps {
  onComplete: () => void;
}

const GamingModeModal: React.FC<GamingModeModalProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const optimizationSteps = [
    { id: 'closingApps', duration: 1200 },
    { id: 'boostingPerformance', duration: 1500 },
    { id: 'optimizingNetwork', duration: 1000 },
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    const runOptimizations = async () => {
      for (let i = 0; i < optimizationSteps.length; i++) {
        setCurrentStep(i);
        await new Promise(resolve => setTimeout(resolve, optimizationSteps[i].duration));
        setCompletedSteps(prev => [...prev, optimizationSteps[i].id]);
      }
      // Final step
      setCurrentStep(optimizationSteps.length);
      await new Promise(resolve => setTimeout(resolve, 800));
      onComplete();
    };

    runOptimizations();
  }, [onComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  const isCompleted = (stepId: string) => completedSteps.includes(stepId);
  const isRunning = (index: number) => !isCompleted(optimizationSteps[index].id) && currentStep === index;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-modal-fade-in">
      <div className="bg-slate-900/70 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 w-full max-w-md p-8 text-white">
        <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-purple-500/20 rounded-full border border-purple-500/50 mb-4">
                <BoltIcon className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold">{t('gamingModeTitle')}</h2>
            <p className="mt-2 text-slate-400">{t('gamingModeDescription')}</p>
        </div>

        <div className="mt-8 space-y-4">
          {optimizationSteps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg">
              <div className="w-6 h-6 flex items-center justify-center">
                {isCompleted(step.id) ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-400 animate-pop-in" />
                ) : isRunning(index) ? (
                  <Spinner className="w-6 h-6 text-purple-400" />
                ) : (
                  <div className="w-6 h-6 border-2 border-slate-600 rounded-full" />
                )}
              </div>
              <span className={`text-lg font-medium ${isCompleted(step.id) ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{t(step.id)}</span>
            </div>
          ))}
        </div>
        
        {currentStep >= optimizationSteps.length && (
            <div className="mt-8 text-center text-green-400 font-semibold text-lg animate-pop-in">
                {t('optimizationComplete')}
            </div>
        )}

      </div>
      <style>{`
        @keyframes modal-fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-modal-fade-in { animation: modal-fade-in 0.3s ease-out forwards; }
        @keyframes pop-in { 
            0% { transform: scale(0.5); opacity: 0; } 
            100% { transform: scale(1); opacity: 1; } 
        }
        .animate-pop-in { animation: pop-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default GamingModeModal;
