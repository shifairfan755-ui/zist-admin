import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "../lib/supabaseClient";

export default function UploadDocuments() {
  const [category, setCategory] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Category → Storage + Table
  const categoryConfig: any = {
    "Beneficiary Documents": {
      storage: "beneficiary-docs",
      table: "beneficiary_documents",
      autoBeneficiary: true,
    },
    "BOT Minutes": {
      storage: "bot_minutes",
      table: "bot_minutes",
    },
    "Trust Documents": {
      storage: "trust_docs",
      table: "global_documents",
    },
    "Bank Documents": {
      storage: "bank_docs",
      table: "global_documents",
    },
    "Donor Documents": {
      storage: "donor_files",
      table: "donor_files",
      donor: true,
    },
    "Soft Loan Documents": {
      storage: "softloan_docs",
      table: "soft_loan_installments",
    },
    "Other Documents": {
      storage: "other_docs",
      table: "other_documents",
    },
  };

  // Drag and Drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Detect Beneficiary ID from filename
  const detectInfo = (fileName: string) => {
    const id = fileName.match(/\d+/);
    const date = fileName.match(/\d{4}-\d{2}-\d{2}/);

    return {
      ben_no: id ? id[0] : null,
      detectedDate: date ? date[0] : null,
    };
  };

  // Start Upload
  const startUpload = async () => {
    if (!category || files.length === 0) return alert("Please select category & upload files");
    if (!documentName) return alert("Enter document name");
    if (!documentDate) return alert("Enter document date");

    const { storage, table, autoBeneficiary } = categoryConfig[category];
    setLoading(true);
    setResults([]);

    const uploadResults: any[] = [];

    for (const file of files) {
      try {
        const filePath = `${Date.now()}-${file.name}`;

        // 1) Upload to Storage
        const { error: uploadError } = await supabase.storage
          .from(storage)
          .upload(filePath, file);

        if (uploadError) throw new Error(uploadError.message);

        // 2) Prepare DB insert payload
        const payload: any = {
          file_path: filePath,
          uploaded_at: new Date().toISOString(),
          document_name: documentName,
          document_date: documentDate,
          description: description || null,
        };

        // Auto beneficiary ID only for Beneficiary Docs
        if (autoBeneficiary) {
          const info = detectInfo(file.name);

          const { data: ben } = await supabase
            .from("beneficiaries")
            .select("id")
            .eq("ben_no", info.ben_no)
            .maybeSingle();

          payload.beneficiary_id = ben?.id || null;
          payload.date = info.detectedDate || null;
        }

        // 3) Insert into table
        const { error: insertError } = await supabase
          .from(table)
          .insert([payload]);

        if (insertError) throw new Error(insertError.message);

        uploadResults.push({
          file: file.name,
          status: "success",
        });
      } catch (err: any) {
        uploadResults.push({
          file: file.name,
          status: "error",
          message: err.message,
        });
      }
    }

    setLoading(false);
    setResults(uploadResults);

    // Clear form
    setFiles([]);
    setDocumentName("");
    setDocumentDate("");
    setDescription("");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Upload New Document
      </h1>

      <div className="bg-white shadow-lg p-6 border rounded-xl space-y-6">

        {/* Category */}
        <div>
          <label className="font-semibold">Category</label>
          <select
            className="w-full border p-3 rounded-lg"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">-- Choose --</option>
            {Object.keys(categoryConfig).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Document Name */}
        <div>
          <label className="font-semibold">Document Name</label>
          <input
            type="text"
            className="w-full border p-3 rounded-lg"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="e.g. Trust Meeting Minutes - Jan 2024"
          />
        </div>

        {/* Document Date */}
        <div>
          <label className="font-semibold">Document Date</label>
          <input
            type="date"
            className="w-full border p-3 rounded-lg"
            value={documentDate}
            onChange={(e) => setDocumentDate(e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="font-semibold">Description (optional)</label>
          <textarea
            className="w-full border p-3 rounded-lg"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter short notes about this document..."
          />
        </div>

        {/* Drag & Drop */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-10 rounded-xl text-center cursor-pointer ${
            isDragActive ? "bg-blue-50 border-blue-600" : "bg-gray-50"
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-600">
            {isDragActive ? "Drop files here..." : "Drag & drop files or click to browse"}
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-4 bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Files Selected:</h3>
            {files.map((file, i) => (
              <div key={i} className="py-2 border-b text-sm">
                {file.name}
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={startUpload}
          disabled={loading}
          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          {loading ? "Uploading..." : "Upload Documents"}
        </button>

      </div>

      {/* Upload Results */}
      {results.length > 0 && (
        <div className="mt-6 bg-white shadow p-6 rounded-xl border">
          <h3 className="text-xl font-bold mb-4">Upload Results</h3>
          {results.map((r, i) => (
            <div key={i} className="flex justify-between border-b py-2">
              <span>{r.file}</span>
              <span
                className={
                  r.status === "success" ? "text-green-600" : "text-red-600"
                }
              >
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
