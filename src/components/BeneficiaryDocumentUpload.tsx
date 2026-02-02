import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function BeneficiaryDocumentUpload({ beneficiaryId, refresh }) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleUpload = async () => {
    if (!file) {
      alert("Please choose a file");
      return;
    }

    setUploading(true);

    // Sanitize filename
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    // Path inside bucket
    const filePath = `${beneficiaryId}/${Date.now()}_${safeName}`;

    // Upload to the correct bucket
    const { error: uploadError } = await supabase.storage
      .from("beneficiary-docs")   // FIXED BUCKET NAME
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload Error:", uploadError);
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    // Save record in database
    const { error: dbError } = await supabase.from("documents").insert([
      {
        beneficiary_id: beneficiaryId,
        file_path: filePath,
        notes,
        date,
      },
    ]);

    if (dbError) {
      console.error("DB Error:", dbError);
      alert("Failed to save document record.");
    } else {
      alert("Document uploaded successfully!");
      refresh();
      setFile(null);
      setNotes("");
      setDate("");
    }

    setUploading(false);
  };

  return (
    <div className="mb-4 p-4 bg-gray-100 rounded-xl border">
      <h3 className="font-bold text-lg mb-2">Upload Document</h3>

      <input
        type="file"
        className="mb-2 block"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <input
        type="date"
        className="mb-2 p-2 border rounded w-full"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <input
        type="text"
        className="mb-2 p-2 border rounded w-full"
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
