
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Backup, Driver } from '../types';
import { BackupIcon } from '../constants';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: Driver[];
  onRestore: (drivers: Driver[]) => void;
  onNotify: (message: string, type: 'success' | 'error') => void;
}

const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose, drivers, onRestore, onNotify }) => {
  const { t } = useLanguage();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [backupName, setBackupName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      try {
        const storedBackups = JSON.parse(localStorage.getItem('driverBackups') || '[]');
        setBackups(storedBackups);
      } catch (error) {
        console.error("Failed to parse backups from localStorage", error);
        setBackups([]);
      }
    }
  }, [isOpen]);

  const handleCreateBackup = () => {
    if (!backupName.trim()) {
        onNotify(t('backupError'), 'error');
        return;
    }
    const newBackup: Backup = {
      id: `backup-${Date.now()}`,
      name: backupName,
      date: new Date().toISOString(),
      drivers: drivers.filter(d => d.status === 'Up-to-date' || d.status === 'Installed'),
    };
    const updatedBackups = [...backups, newBackup];
    setBackups(updatedBackups);
    localStorage.setItem('driverBackups', JSON.stringify(updatedBackups));
    setBackupName('');
    onNotify(t('backupCreated', {name: newBackup.name}), 'success');
  };

  const handleRestore = (backupId: string) => {
    const backupToRestore = backups.find(b => b.id === backupId);
    if (backupToRestore) {
      onRestore(backupToRestore.drivers);
      onNotify(t('backupRestored', { name: backupToRestore.name }), 'success');
      onClose();
    }
  };

  const handleDelete = (backupId: string) => {
    const backupToDelete = backups.find(b => b.id === backupId);
    const updatedBackups = backups.filter(b => b.id !== backupId);
    setBackups(updatedBackups);
    localStorage.setItem('driverBackups', JSON.stringify(updatedBackups));
    if(backupToDelete) {
        onNotify(t('backupDeleted', { name: backupToDelete.name }), 'success');
    }
    setConfirmDeleteId(null);
  };
  
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  const ConfirmDeleteDialog = () => {
    if (!confirmDeleteId) return null;
    const backup = backups.find(b => b.id === confirmDeleteId);
    if (!backup) return null;
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 text-center w-full max-w-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('confirmDeleteTitle')}</h3>
                <p className="my-4 text-slate-600 dark:text-slate-300">{t('confirmDeleteMessage', { name: backup.name })}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg transition-colors">
                        {t('cancel')}
                    </button>
                    <button onClick={() => handleDelete(confirmDeleteId)} className="px-4 py-2 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                        {t('delete')}
                    </button>
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg p-6 flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('backupRestore')}</h2>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors p-1.5 rounded-full" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">{t('createBackup')}</h3>
            <div className="flex gap-3">
                <input 
                    type="text"
                    value={backupName}
                    onChange={(e) => setBackupName(e.target.value)}
                    placeholder={t('backupName')}
                    className="flex-grow px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                />
                <button onClick={handleCreateBackup} className="flex-shrink-0 flex items-center px-4 py-2 font-semibold text-white bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 rounded-lg transition-colors shadow-sm">
                    <BackupIcon className="w-5 h-5 mr-2" />
                    {t('create')}
                </button>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto space-y-3 -mr-2 pr-2">
          {backups.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                <p className="font-medium">{t('noBackups')}</p>
            </div>
          ) : (
            backups.slice().reverse().map(backup => (
              <div key={backup.id} className="bg-slate-100 dark:bg-slate-800/60 p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{backup.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(backup.date)} &bull; {backup.drivers.length} drivers</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleRestore(backup.id)} className="px-3 py-1.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors">{t('restore')}</button>
                  <button onClick={() => setConfirmDeleteId(backup.id)} className="px-3 py-1.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">{t('delete')}</button>
                </div>
              </div>
            ))
          )}
        </div>
        <ConfirmDeleteDialog />
      </div>
    </div>
  );
};

export default BackupModal;
