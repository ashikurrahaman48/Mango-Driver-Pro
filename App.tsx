import React, { useState, useCallback, useEffect } from 'react';
import { generateDeviceList, fetchDriverUpdates } from './services/geminiService';
import type { Driver, InstallState, ScanStatus, NotificationType, AppMode, Backup, HardwareInfo, SerialPort } from './types';
import { ChipIcon, ScanIcon, WarningIcon, SettingsIcon, DownloadIcon, BangladeshFlagIcon, BackupIcon, MangoIcon, BoltIcon } from './constants';
import DriverItem from './components/DriverItem';
import Spinner from './components/Spinner';
import Notification from './components/Notification';
import SplashScreen from './components/SplashScreen';
import SettingsModal from './components/SettingsModal';
import BackupModal from './components/BackupModal';
import GamingModeModal from './components/GamingModeModal';
import { useLanguage } from './contexts/LanguageContext';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [installStates, setInstallStates] = useState<Record<string, InstallState>>({});
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isGamingModalOpen, setIsGamingModalOpen] = useState(false);
  const [selectedDrivers, setSelectedDrivers] = useState<Set<string>>(new Set());
  const { t } = useLanguage();
  const [appMode, setAppMode] = useState<AppMode>(() => (localStorage.getItem('appMode') as AppMode) || 'offline');
  const [isGamingModeActive, setIsGamingModeActive] = useState(false);
  
  // Hardware Connection State
  const [port, setPort] = useState<SerialPort | null>(null);
  const [reader, setReader] = useState<ReadableStreamDefaultReader<string> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null);


  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('gaming-mode-active', isGamingModeActive);
  }, [isGamingModeActive]);

  const showNotification = useCallback((message: string, type: NotificationType['type'] = 'info') => {
    setNotification({ id: Date.now(), message, type });
  }, []);
  
  const handleConnectDevice = useCallback(async () => {
    if (!('serial' in navigator)) {
        showNotification(t('serialNotSupported'), 'error');
        return;
    }
    if (port) return;

    try {
        const newPort = await navigator.serial.requestPort();
        await newPort.open({ baudRate: 9600 });
        setPort(newPort);
        setIsConnected(true);
        showNotification(t('deviceConnected'), 'success');

        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = newPort.readable.pipeTo(textDecoder.writable);
        const newReader = textDecoder.readable.getReader();
        setReader(newReader);

        let partialData = '';
        while (true) {
            try {
                const { value, done } = await newReader.read();
                if (done) {
                    break;
                }
                partialData += value;
                // Process complete JSON objects from the stream
                let newlineIndex;
                while ((newlineIndex = partialData.indexOf('\n')) >= 0) {
                    const jsonString = partialData.substring(0, newlineIndex).trim();
                    partialData = partialData.substring(newlineIndex + 1);
                    if (jsonString) {
                        try {
                            const data = JSON.parse(jsonString);
                            setHardwareInfo(data);
                        } catch (e) {
                            console.warn("Received non-JSON data from serial:", jsonString);
                        }
                    }
                }
            } catch (error) {
                console.error("Error reading from serial port:", error);
                showNotification(t('deviceDisconnected'), 'error');
                break;
            }
        }
        await readableStreamClosed.catch(() => {}); // Ignore errors from closing
    } catch (error) {
        if (error instanceof DOMException && error.name === 'NotFoundError') {
            showNotification(t('connectionCancelled'), 'info');
        } else {
            console.error("Failed to connect to device:", error);
            showNotification(t('connectionFailed'), 'error');
        }
    }
  }, [port, t, showNotification]);

  const handleDisconnectDevice = useCallback(async () => {
      if (reader) {
          try {
            await reader.cancel();
          } catch(e) {
            // Ignore cancel error
          }
          reader.releaseLock();
          setReader(null);
      }
      if (port) {
          await port.close();
          setPort(null);
      }
      setIsConnected(false);
      setHardwareInfo(null);
      showNotification(t('deviceDisconnected'), 'info');
  }, [reader, port, t, showNotification]);

  const handleScan = useCallback(async () => {
    setScanStatus('scanning');
    setDrivers([]);
    setInstallStates({});
    setSelectedDrivers(new Set());
    showNotification(t('scanStarted', { mode: t(appMode + 'Mode') }), 'info');

    try {
      const devices = await generateDeviceList();
      showNotification(t('driversFound', { mode: t(appMode + 'Mode') }), 'info');
      const driverUpdates = await fetchDriverUpdates(devices, appMode);
      setDrivers(driverUpdates);
      
      const initialInstallStates: Record<string, InstallState> = {};
      driverUpdates.forEach(driver => {
        initialInstallStates[driver.id] = { status: 'idle', progress: 0 };
      });
      setInstallStates(initialInstallStates);
      
      setScanStatus('complete');
      const updatesAvailable = driverUpdates.filter(d => d.status === 'Update available' || d.status === 'Missing').length;
      showNotification(t('scanComplete', { count: updatesAvailable }), 'success');
    } catch (error) {
      console.error("Scanning failed:", error);
      setScanStatus('error');
      showNotification(t('scanError'), 'error');
    }
  }, [t, appMode, showNotification]);

  const runInstallation = useCallback(async (driverId: string) => {
    // Stage 1: Downloading
    setInstallStates(prev => ({ ...prev, [driverId]: { status: 'downloading', progress: 0 } }));
    
    await new Promise(resolve => {
        const interval = setInterval(() => {
            setInstallStates(prev => {
                const currentProgress = prev[driverId]?.progress || 0;
                if (currentProgress >= 100) {
                    clearInterval(interval);
                    resolve(true);
                    return prev;
                }
                return { ...prev, [driverId]: { status: 'downloading', progress: Math.min(100, currentProgress + Math.floor(Math.random() * 10) + 10) } };
            });
        }, 200);
    });
    setInstallStates(prev => ({ ...prev, [driverId]: { status: 'downloading', progress: 100 } }));

    // Stage 2: Installing
    setInstallStates(prev => ({ ...prev, [driverId]: { status: 'installing', progress: 100 } }));
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // Stage 3: Complete
    const driverToInstall = drivers.find(d => d.id === driverId);
    setDrivers(prevDrivers => 
        prevDrivers.map(d => 
            d.id === driverId 
            ? { ...d, status: 'Installed', currentVersion: d.latestVersion, currentReleaseDate: d.latestReleaseDate } 
            : d
        )
    );
    setInstallStates(prev => ({ ...prev, [driverId]: { status: 'installed', progress: 100 } }));
    showNotification(t('installSuccess', { deviceName: driverToInstall?.deviceName || '' }), 'success');
  }, [drivers, t, showNotification]);

  const handleInstallSelected = useCallback(async () => {
    const driversToInstall = Array.from(selectedDrivers);
    setSelectedDrivers(new Set());
    for (const driverId of driversToInstall) {
      await runInstallation(driverId);
    }
  }, [selectedDrivers, runInstallation]);

  const handleToggleSelection = (driverId: string) => {
    setSelectedDrivers(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(driverId)) {
        newSelection.delete(driverId);
      } else {
        newSelection.add(driverId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = (driverIds: string[]) => {
    setSelectedDrivers(new Set(driverIds));
  };

  const handleSetMode = (mode: AppMode) => {
    setAppMode(mode);
    localStorage.setItem('appMode', mode);
    showNotification(t('modeChange', { mode: t(mode + 'Mode') }), 'info');
  };

  const handleRestore = (backupDrivers: Driver[]) => {
    setDrivers(backupDrivers);
    const initialInstallStates: Record<string, InstallState> = {};
      backupDrivers.forEach(driver => {
        initialInstallStates[driver.id] = { status: 'idle', progress: 0 };
      });
    setInstallStates(initialInstallStates);
    setScanStatus('complete');
  };
  
  const handleGamingModeToggle = () => {
    if (isGamingModeActive) {
      setIsGamingModeActive(false);
      showNotification(t('gamingModeDeactivated'), 'info');
    } else {
      setIsGamingModalOpen(true);
    }
  };

  const handleGamingModeComplete = () => {
    setIsGamingModalOpen(false);
    setIsGamingModeActive(true);
    showNotification(t('gamingModeActive'), 'success');
  };

  if (loading) {
    return <SplashScreen />;
  }
  
  const DriverListSection: React.FC<{ title: string; driverList: Driver[]}> = ({ title, driverList }) => {
    if (driverList.length === 0) return null;

    const updatableIds = driverList.filter(d => d.status === 'Update available' || d.status === 'Missing').map(d => d.id);
    const isUpdatableSection = updatableIds.length > 0;

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{title} ({driverList.length})</h3>
            {isUpdatableSection && (
              <div className="flex items-center gap-3">
                  <button onClick={() => handleSelectAll(updatableIds)} className={`text-sm font-medium transition-colors ${isGamingModeActive ? 'text-purple-500 hover:text-purple-400' : 'text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400'}`}>{t('selectAll')}</button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button onClick={() => setSelectedDrivers(new Set())} className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">{t('deselectAll')}</button>
              </div>
            )}
        </div>
        <div className="space-y-4">
          {driverList.map(driver => (
            <DriverItem 
              key={driver.id} 
              driver={driver} 
              installState={installStates[driver.id] || { status: 'idle', progress: 0 }}
              isSelected={selectedDrivers.has(driver.id)}
              onToggleSelection={handleToggleSelection}
            />
          ))}
        </div>
      </div>
    );
  };
  
  const renderContent = () => {
    switch (scanStatus) {
      case 'scanning':
        return (
          <div className="flex flex-col items-center justify-center text-center py-24">
            <Spinner className={`w-16 h-16 ${isGamingModeActive ? 'text-purple-500' : 'text-orange-500'}`} />
            <h2 className="mt-6 text-2xl font-bold text-slate-800 dark:text-slate-100">{t('scanningTitle')}</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{t('scanningDescription', { mode: t(appMode + 'Mode') })}</p>
          </div>
        );
      case 'complete':
        const missingDrivers = drivers.filter(d => d.status === 'Missing');
        const updateAvailableDrivers = drivers.filter(d => d.status === 'Update available');
        const upToDateDrivers = drivers.filter(d => d.status === 'Up-to-date' || d.status === 'Installed');
        const updatesAvailableCount = missingDrivers.length + updateAvailableDrivers.length;

        return (
          <div>
            <div className="bg-white dark:bg-slate-900 shadow-md rounded-xl p-6 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 border border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('completeTitle')}</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {updatesAvailableCount > 0 
                    ? t('updatesFound', { count: updatesAvailableCount })
                    : t('noUpdatesFound')}
                </p>
              </div>
              <div className="flex gap-3 flex-wrap justify-end">
                <button onClick={handleScan} className="px-5 py-2.5 font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200">
                  {t('rescan')}
                </button>
                {selectedDrivers.size > 0 && (
                    <button onClick={handleInstallSelected} className={`flex items-center justify-center px-5 py-2.5 font-semibold text-white rounded-lg transition-colors duration-200 ${isGamingModeActive ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20' : 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 shadow-lg shadow-orange-500/20 dark:shadow-orange-600/20'}`}>
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        {t('installSelected', { count: selectedDrivers.size })}
                    </button>
                )}
              </div>
            </div>
            
            <DriverListSection title={t('missingDrivers')} driverList={missingDrivers} />
            <DriverListSection title={t('availableUpdates')} driverList={updateAvailableDrivers} />
            <DriverListSection title={t('upToDateDrivers')} driverList={upToDateDrivers} />
          </div>
        );
      case 'error':
        return (
            <div className="flex flex-col items-center justify-center text-center py-24 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50">
                <WarningIcon className="w-16 h-16 text-red-500 dark:text-red-500"/>
                <h2 className="mt-6 text-2xl font-bold text-red-800 dark:text-red-200">{t('errorTitle')}</h2>
                <p className="text-red-700 dark:text-red-300 mb-6 max-w-md">{t('errorDescription')}</p>
                <button onClick={handleScan} className={`flex items-center justify-center px-6 py-3 text-lg font-semibold text-white rounded-lg transition-colors ${isGamingModeActive ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-500 hover:bg-orange-600'}`}>
                    <ScanIcon className="w-6 h-6 mr-2"/>
                    {t('tryAgain')}
                </button>
            </div>
        );
      case 'idle':
      default:
        return (
          <div className="text-center flex flex-col items-center justify-center py-16">
            <ChipIcon className={`w-24 h-24 ${isGamingModeActive ? 'text-purple-500' : 'text-orange-500'}`} />
            <h2 className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{t('idleTitle')}</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-xl">
              {t('idleDescription')}
            </p>
             <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800/50 px-4 py-1.5 rounded-full">{t('platformSupport')}</p>
            <button onClick={handleScan} className={`mt-10 flex items-center justify-center px-8 py-4 text-xl font-semibold text-white rounded-lg transition-colors duration-300 ${isGamingModeActive ? 'bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-500/30' : 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 dark:shadow-orange-600/20 dark:hover:shadow-orange-500/30'}`}>
              <ScanIcon className="w-7 h-7 mr-3" />
              {t('scanNow')}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl shadow-lg transition-all duration-300 ${isGamingModeActive ? 'bg-gradient-to-br from-purple-600 to-indigo-600 shadow-purple-500/30' : 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/20'}`}>
               <MangoIcon className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{t('appTitle')}</h1>
              {isGamingModeActive ? (
                <p className="text-sm font-bold text-purple-500 animate-pulse">{t('gamingModeOn')}</p>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('appSubtitle')}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={handleGamingModeToggle} className={`p-2.5 rounded-full transition-colors duration-200 ${isGamingModeActive ? 'text-purple-500 bg-purple-500/10 hover:bg-purple-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`} aria-label={t('gamingMode')}>
                <BoltIcon className="w-7 h-7" />
            </button>
            <button onClick={() => setIsBackupOpen(true)} className="text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 p-2.5 rounded-full transition-colors duration-200" aria-label={t('backupRestore')}>
                <BackupIcon className="w-7 h-7" />
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 p-2.5 rounded-full transition-colors duration-200" aria-label={t('settings')}>
                <SettingsIcon className="w-7 h-7" />
            </button>
          </div>
        </header>
        <main>
          {renderContent()}
        </main>
         <footer className="text-center mt-16 text-slate-500 dark:text-slate-500 text-xs space-y-4 pt-8 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t(appMode + 'Notice')}</p>
            <div className="text-slate-500 dark:text-slate-400">
                <p>{t('developBy')} | {t('ceo')} | {t('phone')}</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                <span>{t('appVersion')}</span>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <BangladeshFlagIcon className="w-4 h-auto inline-block" />
                <span>{t('madeInBangladesh')}</span>
            </div>
        </footer>
      </div>
      <Notification notification={notification} onClose={() => setNotification(null)} />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        currentMode={appMode}
        onModeChange={handleSetMode}
        isConnected={isConnected}
        hardwareInfo={hardwareInfo}
        onConnect={handleConnectDevice}
        onDisconnect={handleDisconnectDevice}
      />
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        drivers={drivers}
        onRestore={handleRestore}
        onNotify={showNotification}
      />
      {isGamingModalOpen && <GamingModeModal onComplete={handleGamingModeComplete} />}
    </div>
  );
};

export default App;
