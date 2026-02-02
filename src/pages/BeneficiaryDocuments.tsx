import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function BeneficiaryDocuments() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("uploaded_at");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  const perPage = 20;

  // Load beneficiary documents WITH JOIN
  const loadDocs = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("beneficiary_documents")
      .select(
        `
        id,
        file_path,
        uploaded_at,
        beneficiary_id,
        beneficiaries (
          full_name,
          ben_no
        )
      `
      )
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const mapped = data.map((d: any) => ({
      ...d,
      full_name: d.beneficiaries?.full_name || "Unknown",
      ben_no: d.beneficiaries?.ben_no || "--",
      bucket: "beneficiary-docs",
    }));

    setDocs(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const previewFile = async (filePath: string) => {
    const { data } = await supabase.storage
      .from("beneficiary-docs")
      .download(filePath);

    const url = URL.createObjectURL(data);
    window.open(url, "_blank");
  };

  const downloadFile = async (filePath: string) => {
    const { data } = await supabase.storage
      .from("beneficiary-docs")
      .download(filePath);

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filePath;
    a.click();
  };

  const deleteFile = async (id: any, filePath: string) => {
    if (!confirm("Are you sure?")) return;

    await supabase.storage.from("beneficiary-docs").remove([filePath]);
    await supabase.from("beneficiary_documents").delete().eq("id", id);

    loadDocs();
  };

  // Filter
  const filtered = docs.filter((doc) => {
    const s = search.toLowerCase();
    return (
      doc.file_path.toLowerCase().includes(s) ||
      doc.full_name.toLowerCase().includes(s) ||
      doc.ben_no.toString().includes(s)
    );
  });

  // Sort
  const sorted = filtered.sort((a, b) => {
    let A = a[sortBy] || "";
    let B = b[sortBy] || "";

    if (sortDir === "asc") return A > B ? 1 : -1;
    return A < B ? 1 : -1;
  });

  // Pagination
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Beneficiary Documents
      </h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          className="border p-3 rounded-lg flex-1"
          placeholder="Search name, ID, file..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-3 rounded-lg"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="uploaded_at">Sort by Upload Date</option>
          <option value="full_name">Sort by Name</option>
          <option value="ben_no">Sort by Beneficiary ID</option>
          <option value="file_path">Sort by File</option>
        </select>

        <select
          className="border p-3 rounded-lg"
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value)}
        >
          <option value="desc">DESC</option>
          <option value="asc">ASC</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg p-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="p-2">Beneficiary</th>
              <th className="p-2">File</th>
              <th className="p-2">Uploaded</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-400">
                  No documents found
                </td>
              </tr>
            ) : (
              paginated.map((doc, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2">
                    {doc.full_name} ({doc.ben_no})
                  </td>
                  <td className="p-2">{doc.file_path}</td>
                  <td className="p-2">
                    {new Date(doc.uploaded_at).toLocaleString()}
                  </td>

                  <td className="p-2 flex gap-4">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => previewFile(doc.file_path)}
                    >
                      Preview
                    </button>

                    <button
                      className="text-green-600 hover:underline"
                      onClick={() => downloadFile(doc.file_path)}
                    >
                      Download
                    </button>

                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => deleteFile(doc.id, doc.file_path)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>

          <span>Page {page}</span>

          <button
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            disabled={paginated.length < perPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
