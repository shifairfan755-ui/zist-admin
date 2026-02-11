import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  DocumentIcon,
} from "@heroicons/react/24/solid";

export default function AllDocuments() {
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortField, setSortField] = useState("uploaded_at");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const { data, error } = await supabase
      .from("global_documents")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (!error) setDocs(data);
  };

  const deleteDocument = async (id, file_path, bucket) => {
    if (!confirm("Delete this document?")) return;

    // 1) Delete DB row
    await supabase.from("global_documents").delete().eq("id", id);

    // 2) Delete file from Storage bucket
    await supabase.storage.from(bucket).remove([file_path]);

    loadDocuments();
  };

  // Filters + Sorting Logic
  const filteredDocs = docs
    .filter((d) => {
      const s = search.toLowerCase();
      return (
        d.file_name?.toLowerCase().includes(s) ||
        d.document_name?.toLowerCase().includes(s) ||
        d.category?.toLowerCase().includes(s)
      );
    })
    .filter((d) => (category === "all" ? true : d.category === category))
    .sort((a, b) => {
      if (sortOrder === "asc")
        return a[sortField] > b[sortField] ? 1 : -1;
      return a[sortField] < b[sortField] ? 1 : -1;
    });

  const categoryColor = {
    beneficiary_docs: "bg-blue-100 text-blue-600",
    trust_docs: "bg-purple-100 text-purple-600",
    bank_docs: "bg-green-100 text-green-600",
    bot_minutes: "bg-red-100 text-red-600",
    donor_files: "bg-orange-100 text-orange-600",
    softloan_docs: "bg-yellow-100 text-yellow-700",
    other_docs: "bg-gray-200 text-gray-700",
  };

  const prettyCategory = (cat) => {
    return cat.replace("_", " ").toUpperCase();
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-extrabold text-blue-600 mb-8">
        All Documents
      </h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <input
          className="border p-3 w-72 rounded-lg shadow-sm"
          placeholder="Search document name, file, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-3 rounded-lg shadow-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="beneficiary_docs">Beneficiary Docs</option>
          <option value="trust_docs">Trust Docs</option>
          <option value="bank_docs">Bank Docs</option>
          <option value="bot_minutes">BOT Minutes</option>
          <option value="donor_files">Donor Docs</option>
          <option value="softloan_docs">Soft Loan Docs</option>
          <option value="other_docs">Other Docs</option>
        </select>

        <select
          className="border p-3 rounded-lg shadow-sm"
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
        >
          <option value="uploaded_at">Sort by Upload Date</option>
          <option value="doc_date">Sort by Document Date</option>
        </select>

        <select
          className="border p-3 rounded-lg shadow-sm"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="desc">DESC</option>
          <option value="asc">ASC</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-left">File</th>
              <th className="p-3 text-left">Document Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Document Date</th>
              <th className="p-3 text-left">Uploaded</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDocs.map((doc) => (
              <tr
                key={doc.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3 flex items-center gap-3">
                  <DocumentIcon className="h-6 w-6 text-gray-500" />
                  {doc.file_name}
                </td>

                <td className="p-3">{doc.document_name || "-"}</td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      categoryColor[doc.category] ||
                      "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {prettyCategory(doc.category)}
                  </span>
                </td>

                <td className="p-3">
                  {doc.doc_date || "-"}
                </td>

                <td className="p-3">
                  {new Date(doc.uploaded_at).toLocaleString()}
                </td>

                <td className="p-3 flex gap-3">
                  {/* Preview */}
                  <a
                    href={doc.file_url}
                    target="_blank"
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <EyeIcon className="h-5 w-5" /> Preview
                  </a>

                  {/* Download */}
                  <a
                    href={doc.file_url}
                    download
                    className="text-green-600 hover:text-green-800 flex items-center gap-1"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" /> Download
                  </a>

                  {/* Delete */}
                  <button
                    onClick={() =>
                      deleteDocument(doc.id, doc.file_path, doc.category)
                    }
                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <TrashIcon className="h-5 w-5" /> Delete
                  </button>
                </td>
              </tr>
            ))}

            {filteredDocs.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No documents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
