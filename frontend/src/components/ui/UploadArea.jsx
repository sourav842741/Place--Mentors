import { Upload, FileText } from "lucide-react";
import { useCallback } from "react";

export default function UploadArea({ onFileSelect, fileName, className = "" }) {
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/pdf" && file.size <= 5 * 1024 * 1024) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file && file.type === "application/pdf" && file.size <= 5 * 1024 * 1024) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      className={`border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary-soft/10 transition-colors ${className}`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => document.getElementById("pdf-upload").click()}
    >
      <input
        id="pdf-upload"
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />
      <Upload className="w-10 h-10 mx-auto text-text-subtle mb-3" />
      <p className="text-sm font-semibold text-text mb-1">
        Drop your PDF resume here or click to browse
      </p>
      <p className="text-xs text-text-muted mb-4">PDF format only • Max file size 5MB</p>
      {fileName && (
        <div className="bg-primary-soft border border-primary/20 rounded-lg p-2.5 max-w-sm mx-auto">
          <FileText className="w-4 h-4 inline mr-2 text-primary" />
          <span className="text-xs font-semibold text-primary">{fileName}</span>
        </div>
      )}
    </div>
  );
}
