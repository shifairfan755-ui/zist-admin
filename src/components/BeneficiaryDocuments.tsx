import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function BeneficiaryDocuments({ beneficiaryId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("beneficiary_id", beneficiaryId)
      .order("created_at", { ascending: false });

    if (!error) setDocuments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  if (loading) return <p>Loading documents...</p>;

  return (
    <div className="space-y-4">
      {documents.length === 0 && (
        <p className="text-gray-400 text-center p-4">
          No documents uploaded yet.
        </p>
      )}

      {documents.map((doc) => (
        <div
          key={doc.id}
          className="p-4 border rounded-xl flex justify-between items-center bg-gray-50"
        >
          <div>
            <p className="font-semibold">{doc.file_name}</p>
            <p className="text-sm text-gray-600">
              Type: {doc.doc_type}
            </p>
            <p className="text-sm text-gray-600">
              Date: {doc.document_date || "—"}
            </p>
          </div>

          <div className="flex gap-3">
            {/* VIEW / DOWNLOAD */}
            <a
              href={doc.file_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
            >
              View
            </a>

            {/* DELETE */}
            <button
              onClick={async () => {
                if (!confirm("Delete this document?")) return;
                await supabase.from("documents").delete().eq("id", doc.id);
                fetchDocuments();
              }}
              className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
