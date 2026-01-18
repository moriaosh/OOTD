  import { useState } from 'react';
  import { FileSpreadsheet, Upload, AlertCircle } from 'lucide-react';
  import * as XLSX from 'xlsx';

  const BulkUpload = ({ onComplete }) => {
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState(null);

    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      setFileError(null);

      if (selectedFile) {
        // Validate file type - only allow Excel and CSV files
        const allowedExtensions = ['.xlsx', '.xls', '.csv'];
        const allowedTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'application/vnd.ms-excel', // .xls
          'text/csv', // .csv
          'application/csv'
        ];

        const fileName = selectedFile.name.toLowerCase();
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
        const hasValidType = allowedTypes.includes(selectedFile.type);

        if (!hasValidExtension && !hasValidType) {
          setFileError('קובץ לא תקין. רק קבצי Excel (xlsx, xls) או CSV מותרים.');
          setFile(null);
          e.target.value = '';
          return;
        }
        // Validate file size (max 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
          setFileError('גודל הקובץ גדול מדי. אנא בחר/י קובץ עד 5MB.');
          setFile(null);
          e.target.value = '';
          return;
        }
        setFile(selectedFile);
      }
    };

    const handleUpload = async () => {
      if (!file) return;

      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map Excel columns to item fields
        const items = jsonData.map(row => ({
          name: row['שם'] || row['name'],
          category: row['קטגוריה'] || row['category'],
          color: row['צבע'] || row['color'],
          season: row['עונה'] || row['season'],
          occasion: row['אירוע'] || row['occasion'],
          notes: row['הערות'] || row['notes'],
          imageUrl: row['קישור תמונה'] || row['imageUrl']
        }));

        const token = localStorage.getItem('ootd_authToken');
        const response = await fetch('/api/closet/bulk-upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ items })
        });

        
        const result = await response.json();
        alert(`${result.created} פריטים נוספו בהצלחה!`);
        onComplete && onComplete();
      } catch (error) {
        console.error('Bulk upload error:', error);
        alert('שגיאה בהעלאה מרובה');
      }
    };

    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">העלאה מרובה מ-Excel</h3>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="mb-2" />
        {fileError && (
          <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>{fileError}</span>
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={!file}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
        >
          <Upload className="w-5 h-5" />
          העלה פריטים
        </button>
      </div>
    );
  };

  export default BulkUpload;