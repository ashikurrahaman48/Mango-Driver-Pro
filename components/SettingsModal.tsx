
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { AppMode, SystemInfo, Theme, HardwareInfo } from '../types';
import { getSystemInfo } from '../services/geminiService';
import Spinner from './Spinner';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  isConnected: boolean;
  hardwareInfo: HardwareInfo | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentMode, onModeChange, isConnected, hardwareInfo, onConnect, onDisconnect }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [showHostInfo, setShowHostInfo] = useState(false);
  const [hostSystemInfo, setHostSystemInfo] = useState<SystemInfo | null>(null);
  const [isDetectingHost, setIsDetectingHost] = useState(false);

  useEffect(() => {
    if (isOpen && showHostInfo && !hostSystemInfo) {
      setIsDetectingHost(true);
      getSystemInfo().then(info => {
        setHostSystemInfo(info);
        setIsDetectingHost(false);
      });
    }
    if (!isOpen) {
        // Reset state on close to avoid flash of old content
        setTimeout(() => {
            setShowHostInfo(false);
            setHostSystemInfo(null);
        }, 200);
    }
  }, [isOpen, showHostInfo, hostSystemInfo]);

  if (!isOpen) return null;
  
  const HostSystemInfoPanel = () => {
    if (isDetectingHost) {
        return (
            <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg mt-3 flex items-center justify-center h-32">
                <Spinner className="w-6 h-6 mr-3 text-slate-600 dark:text-slate-300"/>
                <span className="text-slate-600 dark:text-slate-300">{t('detecting')}</span>
            </div>
        );
    }
    if (!hostSystemInfo) return null;
    return (
        <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg mt-3 space-y-2 text-sm animate-fadeIn">
            <InfoRow label={t('sysInfoOS')} value={hostSystemInfo.os} />
            <InfoRow label={t('sysInfoCPU')} value={hostSystemInfo.cpu} />
            <InfoRow label={t('sysInfoRAM')} value={hostSystemInfo.ram} />
            <InfoRow label={t('sysInfoBoard')} value={hostSystemInfo.motherboard} />
             <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </div>
    );
  };
  
  const HardwareMonitorPanel = () => {
    return (
        <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg mt-3 space-y-2 text-sm">
            { isConnected && hardwareInfo ? (
                 <div className="space-y-2 animate-fadeIn">
                    <InfoRow label={t('hwInfoDevice')} value={hardwareInfo.deviceName} />
                    <InfoRow label={t('hwInfoFirmware')} value={hardwareInfo.firmwareVersion} />
                    <InfoRow label={t('hwInfoID')} value={hardwareInfo.hardwareId} isMono />
                </div>
            ) : (
                <p className="text-center text-slate-500 dark:text-slate-400 py-6">{t('noDeviceConnected')}</p>
            )}
        </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6 m-4 border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('settings')}</h2>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors p-1.5 rounded-full" aria-label="Close settings">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="space-y-6">
            <SettingsSection title={t('theme')}>
                <div className="grid grid-cols-2 gap-2">
                    <ThemeButton selectedTheme={theme} onClick={() => setTheme('light')} label={t('lightTheme')} value="light" />
                    <ThemeButton selectedTheme={theme} onClick={() => setTheme('dark')} label={t('darkTheme')} value="dark" />
                </div>
            </SettingsSection>
            
            <SettingsSection title={t('appMode')}>
                <div className="grid grid-cols-2 gap-2">
                    <ModeButton mode="offline" current={currentMode} onClick={onModeChange} t={t} />
                    <ModeButton mode="online" current={currentMode} onClick={onModeChange} t={t} />
                </div>
            </SettingsSection>
            
            <SettingsSection title={t('language')}>
              <div className="space-y-2">
                <LanguageButton lang="en" current={language} setLang={setLanguage} label="English" />
                <LanguageButton lang="bn" current={language} setLang={setLanguage} label="Bengali (বাংলা)" />
              </div>
            </SettingsSection>

            <SettingsSection title={t('hardwareMonitor')} status={isConnected ? t('statusConnected') : t('statusDisconnected')} statusColor={isConnected ? 'text-green-500' : 'text-amber-500'}>
                <button 
                    onClick={isConnected ? onDisconnect : onConnect} 
                    className={`w-full text-center px-4 py-2 font-semibold text-white rounded-md transition-colors duration-200 ${isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isConnected ? t('disconnectDevice') : t('connectDevice')}
                </button>
                <HardwareMonitorPanel />
            </SettingsSection>

            <SettingsSection title={t('systemDetector')}>
              <button onClick={() => setShowHostInfo(!showHostInfo)} className="w-full text-center px-4 py-2 font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200">
                {showHostInfo ? t('hideSystemInfo') : t('showSystemInfo')}
              </button>
              {showHostInfo && <HostSystemInfoPanel />}
            </SettingsSection>
        </div>
      </div>
    </div>
  );
};

const SettingsSection = ({ title, status, statusColor, children }: { title: string, status?: string, statusColor?: string, children: React.ReactNode }) => (
    <div>
        <div className="flex justify-between items-baseline mb-3">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
            {status && <p className={`text-sm font-medium ${statusColor}`}>{status}</p>}
        </div>
        {children}
    </div>
)

const InfoRow = ({ label, value, isMono = false }: { label: string, value: string, isMono?: boolean }) => (
     <div className="flex justify-between">
        <span className="text-slate-500 dark:text-slate-400">{label}:</span>
        <span className={`font-medium text-right text-slate-800 dark:text-slate-200 ${isMono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
);

const LanguageButton = ({ lang, current, setLang, label }: { lang: 'en' | 'bn', current: string, setLang: (l: 'en' | 'bn') => void, label: string }) => (
    <label className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors border-2 ${current === lang ? 'bg-orange-500/10 border-orange-500' : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
      <input type="radio" name="language" value={lang} checked={current === lang} onChange={() => setLang(lang)} className="w-5 h-5 accent-orange-500"/>
      <span className="ml-3 font-medium text-slate-800 dark:text-slate-100">{label}</span>
    </label>
);

const ModeButton = ({ mode, current, onClick, t }: { mode: AppMode, current: AppMode, onClick: (m: AppMode) => void, t: (k: string) => string }) => (
    <div onClick={() => onClick(mode)} className={`p-3 rounded-lg cursor-pointer text-center transition-all border-2 ${current === mode ? 'border-orange-500 bg-orange-500/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
        <p className="font-semibold text-slate-800 dark:text-slate-100">{t(mode + 'Mode')}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t(mode + 'ModeDescription')}</p>
    </div>
);

const ThemeButton = ({ selectedTheme, onClick, label, value }: { selectedTheme: Theme, onClick: () => void, label: string, value: Theme }) => (
    <div onClick={onClick} className={`p-3 rounded-lg cursor-pointer text-center transition-all border-2 ${selectedTheme === value ? 'border-orange-500 bg-orange-500/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
         <p className="font-semibold text-slate-800 dark:text-slate-100">{label}</p>
    </div>
);

export default SettingsModal;
