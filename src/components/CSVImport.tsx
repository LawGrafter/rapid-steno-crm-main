import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Lead } from '../types';

interface CSVImportProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FieldMapping {
  [key: string]: string;
}

interface CSVRow {
  [key: string]: string;
}

const CSVImport: React.FC<CSVImportProps> = ({ isOpen, onClose }) => {
  const { addLeadsBulk } = useCRM();
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  const [previewData, setPreviewData] = useState<CSVRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available fields for mapping
  const availableFields = [
    { key: 'first_name', label: 'First Name', required: false },
    { key: 'last_name', label: 'Last Name', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'state', label: 'State', required: false },
    { key: 'gender', label: 'Gender', required: false },
    { key: 'exam_category', label: 'Exam Category', required: false },
    { key: 'how_did_you_hear', label: 'How did you hear about us?', required: false },
    { key: 'status', label: 'Status', required: false },
    { key: 'plan', label: 'Plan', required: false },
    { key: 'referral_code', label: 'Referral Code', required: false },
    { key: 'notes', label: 'Notes', required: false },
    { key: 'tags', label: 'Tags', required: false },
    { key: 'amount_paid', label: 'Amount Paid', required: false },
    { key: 'subscription_plan', label: 'Subscription Plan', required: false }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setUploadStatus({ type: 'error', message: 'File size too large. Please upload a file smaller than 10MB.' });
      return;
    }

    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadStatus({ type: 'error', message: 'Please upload a CSV file.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
      setUploadStatus({ type: 'success', message: `Successfully loaded ${file.name}` });
    };
    reader.onerror = () => {
      setUploadStatus({ type: 'error', message: 'Error reading file. Please try again.' });
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return;

    // Simple CSV parser that handles basic escaping
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            // Escaped quote
            current += '"';
            i++; // Skip next quote
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          // End of field
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      // Add the last field
      result.push(current.trim());
      return result;
    };

    // Parse headers
    const headerLine = lines[0];
    const csvHeaders = parseCSVLine(headerLine);
    setHeaders(csvHeaders);

    // Parse all data rows for import
    const allDataRows: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: CSVRow = {};
      csvHeaders.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      allDataRows.push(row);
    }
    setCsvData(allDataRows);

    // Parse preview data (first 5 rows)
    const previewRows: CSVRow[] = [];
    for (let i = 1; i < Math.min(lines.length, 6); i++) {
      const values = parseCSVLine(lines[i]);
      const row: CSVRow = {};
      csvHeaders.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      previewRows.push(row);
    }
    setPreviewData(previewRows);

    // Auto-map fields based on common names
    const autoMapping: FieldMapping = {};
    csvHeaders.forEach(header => {
      const lowerHeader = header.toLowerCase();
      const field = availableFields.find(f => 
        lowerHeader.includes(f.key.toLowerCase()) ||
        lowerHeader.includes(f.label.toLowerCase().replace(/\s+/g, ''))
      );
      if (field) {
        autoMapping[header] = field.key;
      }
    });
    setFieldMapping(autoMapping);
  };

  const handleFieldMappingChange = (csvHeader: string, fieldKey: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [csvHeader]: fieldKey
    }));
  };

  const transformData = (): Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] => {
    return csvData.map(row => {
      const transformed: any = {
        name: '',
        status: 'New',
        is_trial_active: true,
        is_subscription_active: false,
        amount_paid: 0
      };

      // Map fields based on fieldMapping
      Object.entries(fieldMapping).forEach(([csvHeader, fieldKey]) => {
        const value = row[csvHeader];
        if (value) {
          if (fieldKey === 'amount_paid') {
            transformed[fieldKey] = parseFloat(value) || 0;
          } else if (fieldKey === 'tags') {
            transformed[fieldKey] = value.split(',').map((tag: string) => tag.trim()).filter(Boolean);
          } else {
            transformed[fieldKey] = value;
          }
        }
      });

      // Generate name from first_name and last_name if available
      if (transformed.first_name || transformed.last_name) {
        transformed.name = `${transformed.first_name || ''} ${transformed.last_name || ''}`.trim();
      }

      // Set default values
      if (!transformed.name && (transformed.first_name || transformed.last_name)) {
        transformed.name = `${transformed.first_name || ''} ${transformed.last_name || ''}`.trim();
      }

      return transformed;
    });
  };

  const handleImport = async () => {
    if (csvData.length === 0) {
      setUploadStatus({ type: 'error', message: 'No data to import' });
      return;
    }

    // Validate that at least one field is mapped
    const mappedFields = Object.values(fieldMapping).filter(Boolean);
    if (mappedFields.length === 0) {
      setUploadStatus({ type: 'error', message: 'Please map at least one field before importing' });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: 'info', message: 'Importing leads...' });

    try {
      const transformedData = transformData();
      
      // Validate transformed data
      const validData = transformedData.filter(lead => {
        // At minimum, we need a name or first_name/last_name
        return lead.name || lead.first_name || lead.last_name;
      });

      if (validData.length === 0) {
        setUploadStatus({ type: 'error', message: 'No valid leads found. Please ensure you have mapped name fields.' });
        return;
      }

      if (validData.length !== transformedData.length) {
        setUploadStatus({ type: 'info', message: `Found ${validData.length} valid leads out of ${transformedData.length} total rows. Proceeding with import...` });
      }

      const result = await addLeadsBulk(validData);

      if (result.error) {
        setUploadStatus({ type: 'error', message: `Import failed: ${result.error.message || result.error}` });
      } else {
        setUploadStatus({ type: 'success', message: `Successfully imported ${validData.length} leads!` });
        // Reset form after successful import
        setTimeout(() => {
          resetForm();
          onClose();
        }, 2000);
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: `Import failed: ${error}` });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setCsvData([]);
    setHeaders([]);
    setFieldMapping({});
    setPreviewData([]);
    setUploadStatus({ type: null, message: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const a = document.createElement('a');
    a.href = '/leads_import_template.csv';
    a.download = 'leads_import_template.csv';
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Import Leads from CSV</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Section */}
        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Upload your CSV file</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Choose File
            </button>
            <div className="mt-4">
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mx-auto"
              >
                <Download className="w-4 h-4" />
                <span>Download Template</span>
              </button>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Import Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Download the template to see the expected format</li>
              <li>• At minimum, include First Name or Last Name for each lead</li>
              <li>• Tags should be separated by semicolons (e.g., "legal;court-reporting")</li>
              <li>• Dates should be in YYYY-MM-DD format</li>
              <li>• Amount Paid should be a number (e.g., 500 for ₹500)</li>
              <li>• Maximum file size: 10MB</li>
            </ul>
          </div>
        </div>

        {/* Field Mapping */}
        {headers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Map CSV Fields</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {headers.map(header => (
                <div key={header} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    CSV Column: {header}
                  </label>
                  <select
                    value={fieldMapping[header] || ''}
                    onChange={(e) => handleFieldMappingChange(header, e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Skip this column</option>
                    {availableFields.map(field => (
                      <option key={field.key} value={field.key}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        {previewData.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Preview (First 5 rows)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    {headers.map(header => (
                      <th key={header} className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index}>
                      {headers.map(header => (
                        <td key={header} className="border border-gray-300 px-3 py-2 text-sm">
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Status Message */}
        {uploadStatus.type && (
          <div className={`mb-4 p-4 rounded-lg flex items-center space-x-2 ${
            uploadStatus.type === 'success' ? 'bg-green-100 text-green-800' :
            uploadStatus.type === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {uploadStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : uploadStatus.type === 'error' ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
            <span>{uploadStatus.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {csvData.length > 0 && (
              <span>Ready to import {csvData.length} leads</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isUploading}
            >
              Reset
            </button>
            <button
              onClick={handleImport}
              disabled={isUploading || csvData.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Import {csvData.length} Leads</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVImport; 