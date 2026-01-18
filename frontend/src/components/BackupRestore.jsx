import { useState } from 'react';
import { Download, Upload, AlertCircle } from 'lucide-react';

const BackupRestore = () => {
  const [restoreFile, setRestoreFile] = useState(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [fileError, setFileError] = useState(null);

  const handleBackup = async () => {
    try {
      const token = localStorage.getItem('ootd_authToken');
      const response = await fetch('/api/closet/backup', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const backup = await response.json();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ootd-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      alert('הגיבוי הורד בהצלחה!');
    } catch (error) {
      console.error('Backup error:', error);
      alert('שגיאה ביצירת גיבוי');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError(null);

    if (file) {
      // Validate file type - only allow JSON files
      if (!file.name.endsWith('.json') && file.type !== 'application/json') {
        setFileError('קובץ לא תקין. רק קבצי JSON מותרים לשחזור.');
        setRestoreFile(null);
        e.target.value = '';
        return;
      }
      // Validate file size (max 10MB for backup files)
      if (file.size > 10 * 1024 * 1024) {
        setFileError('גודל הקובץ גדול מדי. אנא בחר/י קובץ עד 10MB.');
        setRestoreFile(null);
        e.target.value = '';
        return;
      }
      setRestoreFile(file);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) {
      alert('אנא בחרי קובץ גיבוי');
      return;
    }

    const confirmMessage = replaceExisting
      ? 'האם את בטוחה? פעולה זו תמחק את כל הנתונים הקיימים ותחליף אותם בגיבוי.'
      : 'האם את בטוחה? פעולה זו תוסיף את הנתונים מהגיבוי לנתונים הקיימים.';

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const fileContent = await restoreFile.text();
      const backup = JSON.parse(fileContent);

      const token = localStorage.getItem('ootd_authToken');
      const response = await fetch('/api/closet/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ backup, replaceExisting })
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        setRestoreFile(null);
        window.location.reload(); // Refresh to show restored data
      } else {
        alert(`שגיאה: ${result.message}`);
      }
    } catch (error) {
      console.error('Restore error:', error);
      alert('שגיאה בשחזור הנתונים. ודאי שהקובץ תקין.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Backup Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleBackup}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Download className="w-5 h-5" />
          גיבוי נתונים
        </button>
        <span className="text-sm text-gray-600">הורידי את כל הנתונים שלך לקובץ JSON</span>
      </div>

      {/* Restore Section */}
      <div className="border-t pt-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="text-sm"
              />
            </div>
            {fileError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{fileError}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="replaceExisting"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="replaceExisting" className="text-sm text-gray-700">
              החלף את כל הנתונים הקיימים (אם לא מסומן, הנתונים יתווספו לקיימים)
            </label>
          </div>

          <button
            onClick={handleRestore}
            disabled={!restoreFile}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-fit"
          >
            <Upload className="w-5 h-5" />
            שחזר נתונים
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;