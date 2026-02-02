import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "../supabaseClient";

export default function BulkDocumentUpload() {
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    "Beneficiary Documents",
    "BOT Minutes",
    "Trust Documents",
    "Bank Documents",
    "Donor Documents",
    "Soft Loan Documents",
    "Other Documents",
  ];

  // Correct bucket + table mapping
  const categoryConfig: any = {
    "Beneficiary Documents": {
      storage: "beneficiary-docs",
      table: "documents",
    },
    "BOT Minutes": {
      storage: "bot_minutes",
      table: "bot_minutes",
    },
    "Trust Documents": {
      storage: "trust_docs",
      table: "trust_documents",
    },
    "Bank Documents": {
      storage: "bank_docs",
      table: "bank_documents",
    },
    "Donor Documents": {
      storage: "donor_docs",
      table: "donor_documents",
    },
    "Soft Loan Documents": {
      storage: "softloan_docs",
      table: "softloan_documents",
    },
    "Other Documents": {
      storage: "other_docs",
      table: "other_documents",
    },
  };

  // Drag & Drop handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Detect Beneficiary ID + Date (Only for beneficiary documents)
  const detectInfo = (fileName: string) => {
    if (category !== "Beneficiary Documents") return null;

    const idMatch = fileName.match(/\d+/);
    const dateMatch = fileName.match(/\d{4}-\d{2}-\d{2}/);

    return {
      beneficiaryId: idMatch ? idMatch[0] : null,
      date: dateMatch ? dateMatch[0] : null,
    };
  };

  const startUpload = async () => {
    if (!category || files.length === 0) return;

    const { storage, table } = categoryConfig[category];
    setLoading(true);
    setResults([]);

    const uploadResults: any[] = [];

    for (const file of files) {
      try {
        const filePath = `${Date.now()}-${file.name}`;

        // Upload to correct Supabase bucket
        const { error: uploadError } = await supabase.storage
          .from(storage)
          .upload(filePath, file);

        if (uploadError) throw new Error(uploadError.message);

        // Extract ID & date (beneficiary docs)
        let info = detectInfo(file.name);
        let beneficiaryExists = true;

        if (category === "Beneficiary Documents") {
          if (!info?.beneficiaryId) beneficiaryExists = false;
          else {
            const { data } = await supabase
              .from("beneficiaries")
              .select("id")
              .eq("id", info.beneficiaryId)
              .single();

            if (!data) beneficiaryExists = false;
          }
        }

        // Insert record into correct table
        const insertPayload: any = {
          file_name: file.name,
          file_path: filePath,
          uploaded_at: new Date().toISOString(),
        };

        if (category === "Beneficiary Documents") {
          insertPayload.beneficiary_id = info?.beneficiaryId || null;
          insertPayload.doc_date = info?.date || null;
        }

        const { error: insertError } = await supabase
          .from(table)
          .insert([insertPayload]);

        if (insertError) throw new Error(insertError.message);

        uploadResults.push({
          file: file.name,
          status: beneficiaryExists ? "success" : "warning",
          message: beneficiaryExists
            ? "Uploaded Successfully"
            : "Uploaded, but Beneficiary Not Found",
        });
      } catch (err: any) {
        uploadResults.push({
          file: file.name,
          status: "error",
          message: err.message,
        });
      }
    }

    setResults(uploadResults);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Bulk Document Upload (Drag & Drop)
      </h1>

      {/* CARD */}
      <div className="bg-white p-6 shadow-lg rounded-xl border">

        {/* CATEGORY */}
        <label className="font-semibold mb-2 block">Select Category</label>
        <select
          className="w-full border p-2 rounded-lg mb-6"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">-- Choose Category --</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {/* DRAG & DROP BOX */}
        <div
          {...getRootProps()}
          className={`border-2 p-10 rounded-xl text-center cursor-pointer transition 
            ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}
          `}
        >
          <input {...getInputProps()} />
          <p className="text-gray-600">
            {isDragActive
              ? "Drop the files here..."
              : "Drag & drop files here, or click to select"}
          </p>
        </div>

        {/* FILE PREVIEW LIST */}
        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Files Selected:</h3>

            {files.map((file, idx) => {
              const info = detectInfo(file.name);

              return (
                <div
                  key={idx}
                  className="flex justify-between border-b py-2 text-sm"
                >
                  <span>{file.name}</span>

                  {category === "Beneficiary Documents" && (
                    <span className="text-blue-600">
                      ID: {info?.beneficiaryId || "?"} — Date: {info?.date || "?"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* UPLOAD BUTTON */}
        <button
          onClick={startUpload}
          disabled={loading}
          className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          {loading ? "Uploading..." : "Start Upload"}
        </button>
      </div>

      {/* RESULTS */}
      {results.length > 0 && (
        <div className="mt-8 bg-white shadow p-6 rounded-xl border">
          <h3 className="text-xl font-bold mb-4">Upload Results</h3>

          {results.map((r, i) => (
            <div key={i} className="flex justify-between border-b py-2">
              <span>{r.file}</span>
              <span
                className={
                  r.status === "success"
                    ? "text-green-600"
                    : r.status === "warning"
                    ? "text-orange-600"
                    : "text-red-600"
                }
              >
                {r.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
