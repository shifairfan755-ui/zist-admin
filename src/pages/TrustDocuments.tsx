import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function TrustDocuments() {
  const [docName, setDocName] = useState("");
  const [docDate, setDocDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [docs, setDocs] = useState<any[]>([]);

  // LOAD TRUST DOCUMENTS
  const loadDocs = async () => {
    const { data, error } = await supabase
      .from("global_documents")
      .select("*")
      .eq("category", "trust_docs")
      .order("uploaded_at", { ascending: false });

    if (!error) setDocs(data);
  };

  useEffect(() => {
    loadDocs();
  }, []);

  // UPLOAD DOCUMENT
  const uploadDoc = async () => {
    if (!file || !docName || !docDate)
      return alert("Please fill all fields");

    const filePath = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("trust_docs")
      .upload(filePath, file);

    if (uploadError) return alert("Upload failed");

    const file_url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/trust_docs/${filePath}`;

    const { error: insertError } = await supabase
      .from("global_documents")
      .insert([
        {
          document_name: docName,
          doc_date: docDate,
          file_name: file.name,
          file_path: filePath,
          file_url,
          uploaded_at: new Date().toISOString(),
          category: "trust_docs",
        },
      ]);

    if (insertError) return alert(insertError.message);

    alert("Uploaded!");
    loadDocs();
    setDocName("");
    setDocDate("");
    setFile(null);
  };

  // DELETE DOCUMENT
  const deleteDocument = async (doc: any) => {
    if (!confirm("Delete this document?")) return;

    await supabase.storage.from("trust_docs").remove([doc.file_path]);

    await supabase
      .from("global_documents")
      .delete()
      .eq("id", doc.id);

    loadDocs();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Trust Documents
      </h1>

      {/* Upload Form */}
      <div className="bg-white p-6 shadow rounded-lg">
        <label>Document Name</label>
        <input
          className="border p-3 rounded w-full mb-4"
          value={docName}
          onChange={(e) => setDocName(e.target.value)}
          placeholder="Example: Aadhaar Card"
        />

        <label>Document Date</label>
        <input
          type="date"
          className="border p-3 rounded w-full mb-4"
          value={docDate}
          onChange={(e) => setDocDate(e.target.value)}
        />

        <label>Select File</label>
        <input
          type="file"
          className="border p-3 rounded w-full mb-4"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={uploadDoc}
          className="px-6 py-3 bg-green-600 text-white rounded-lg"
        >
          Upload
        </button>
      </div>

      {/* Document List */}
      <h2 className="mt-10 text-xl font-semibold">Uploaded Trust Documents</h2>

      <table className="w-full mt-4 bg-white shadow rounded-lg">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-2">File</th>
            <th className="p-2">Document Name</th>
            <th className="p-2">Document Date</th>
            <th className="p-2">Uploaded</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {docs.map((doc) => (
            <tr key={doc.id} className="border-b">
              <td className="p-2">{doc.file_name}</td>
              <td className="p-2">{doc.document_name}</td>
              <td className="p-2">{doc.doc_date || "-"}</td>

              <td className="p-2">
                {new Date(doc.uploaded_at).toLocaleString()}
              </td>

              <td className="p-2 flex gap-4">
                {/* Preview */}
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => window.open(doc.file_url, "_blank")}
                >
                  Preview
                </button>

                {/* Download */}
                <button
                  className="text-green-600 hover:underline"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = doc.file_url;
                    a.download = doc.file_name;
                    a.click();
                  }}
                >
                  Download
                </button>

                {/* Delete */}
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => deleteDocument(doc)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
