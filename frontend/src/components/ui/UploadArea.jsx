import { Upload, FileText } from 'lucide-react';
import { useCallback } from 'react';

export default function UploadArea({ onFileSelect, fileName, className = '' }) {
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/pdf' && file.size <= 5 * 1024 * 1024) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file && file.type === 'application/pdf' && file.size <= 5 * 1024 * 1024) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      className={`border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all ${className}`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => document.getElementById('pdf-upload').click()}
    >
      <input
        id="pdf-upload"
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />
      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <p className="text-lg font-medium text-gray-900 mb-2">
        Drop your PDF resume here or click to browse
      </p>
      <p className="text-sm text-gray-500 mb-4">PDF only • Max 5MB</p>
      {fileName && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <FileText className="w-4 h-4 inline mr-2 text-green-600" />
          <span className="text-sm font-medium text-green-800">{fileName}</span>
        </div>
      )}
    </div>
  );
}
