
import React from 'react';
import type { Driver, InstallState } from '../types';
import { CheckCircleIcon, WarningIcon } from '../constants';
import Spinner from './Spinner';
import { useLanguage } from '../contexts/LanguageContext';

interface DriverItemProps {
  driver: Driver;
  installState: InstallState;
  isSelected: boolean;
  onToggleSelection: (driverId: string) => void;
}

const DriverItem: React.FC<DriverItemProps> = ({ driver, installState, isSelected, onToggleSelection }) => {
  const { t } = useLanguage();
  const isUpdatable = driver.status === 'Update available' || driver.status === 'Missing';
  const isInstalledOrUpToDate = driver.status === 'Installed' || driver.status === 'Up-to-date';
  const isInstalling = installState.status === 'downloading' || installState.status === 'installing';

  const getBorderColor = () => {
    if (driver.status === 'Missing') return 'border-l-4 border-amber-400';
    if (driver.status === 'Update available') return 'border-l-4 border-blue-500';
    return 'border-l-4 border-transparent';
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString; // Return original string if it's not a valid date
    }
  }

  const ProgressBar = ({ progress }: { progress: number }) => (
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1.5">
      <div className="bg-orange-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
    </div>
  );

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-md border border-slate-200 dark:border-slate-800 ${getBorderColor()}`}>
      <div className="flex items-center w-full sm:w-auto self-start sm:self-center">
        { !isInstalledOrUpToDate && !isInstalling ? (
           <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(driver.id)}
            className="w-5 h-5 accent-orange-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded mr-4 focus:ring-orange-500 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-2"
            aria-label={`Select driver for ${driver.deviceName}`}
          />
        ) : <div className="w-9 h-5"></div> }
      </div>

      <div className="flex-grow">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{driver.deviceName}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('providedBy', { provider: driver.provider })}</p>
        
        <div className="mt-3 flex flex-col sm:flex-row gap-x-6 gap-y-2 text-xs">
            {driver.currentVersion ? (
                <div>
                    <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium text-[10px]">{t('current')}</span>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-200">{driver.currentVersion}</span>
                        <span className="text-slate-400 dark:text-slate-500">{formatDate(driver.currentReleaseDate)}</span>
                    </div>
                </div>
            ) : <div />}
            {isUpdatable && (
                 <div>
                    <span className="text-green-600 dark:text-green-400 uppercase tracking-wider font-medium text-[10px]">{t('latest')}</span>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 px-2 py-0.5 rounded">{driver.latestVersion}</span>
                        <span className="text-slate-400 dark:text-slate-500">{formatDate(driver.latestReleaseDate)}</span>
                    </div>
                </div>
            )}
        </div>
        {driver.hardwareId && <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 font-mono">{t('hardwareId')}: {driver.hardwareId}</p>}
      </div>

      <div className="w-full sm:w-auto flex justify-end sm:justify-center pt-2 sm:pt-0 min-w-[150px] text-right">
        {installState.status === 'downloading' ? (
          <div className="w-full max-w-[150px]">
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold">{t('downloading')} ({installState.progress}%)</span>
            </div>
            <ProgressBar progress={installState.progress} />
          </div>
        ) : installState.status === 'installing' ? (
          <div className="flex items-center text-slate-500 dark:text-slate-400">
            <Spinner className="w-5 h-5 mr-2" />
            <span className="font-semibold">{t('finalizingInstall')}</span>
          </div>
        ) : driver.status === 'Installed' ? (
          <div className="flex items-center text-green-500 dark:text-green-400">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            <span className="font-semibold">{t('installed')}</span>
          </div>
        ) : driver.status === 'Up-to-date' ? (
          <div className="flex items-center text-slate-500 dark:text-slate-400">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            <span className="font-semibold">{t('upToDate')}</span>
          </div>
        ) : driver.status === 'Missing' ? (
            <div className="flex items-center text-amber-500 dark:text-amber-400">
                <WarningIcon className="w-5 h-5 mr-2"/>
                <span className="font-semibold">{t('missing')}</span>
            </div>
        ) : null}
      </div>
    </div>
  );
};

export default DriverItem;
