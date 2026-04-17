import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-hot-toast";

export default function Applications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  const fetchApplications = async () => {
    const { data } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    setApplications(data || []);
  };

  useEffect(() => {
    (async () => {
      await fetchApplications();
      setLoading(false);
    })();
  }, [location.pathname]);

  const deleteApplication = async (id: string) => {
    if (!confirm("Delete this application?")) return;

    await supabase.from("applications").delete().eq("id", id);
    setApplications((prev) => prev.filter((a) => a.id !== id));
    toast.success("Application deleted");
  };

  const filtered = applications.filter((a) =>
    (
      (a.applicant_name || "") +
      (a.application_no || "") +
      (a.phone || "")
    )
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-3xl font-bold text-blue-700">Applications</h1>

        <Link
          to="/applications/new"
          className="bg-green-600 text-white px-4 py-2 rounded shadow"
        >
          + New Application
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search..."
        className="border p-3 rounded w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-100">
            <tr>
              <th className="p-2">APP No</th>
              <th className="p-2">Name</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((app) => (
              <tr key={app.id} className="border-t">
                <td className="p-2">{app.application_no}</td>
                <td className="p-2">{app.applicant_name}</td>
                <td className="p-2">{app.phone}</td>

                <td className="p-2 flex gap-3">
                  <Link
                    to={`/applications/view/${app.id}`}
                    className="text-blue-600"
                  >
                    View
                  </Link>

                  <Link
                    to={`/applications/edit/${app.id}`}
                    className="text-green-600"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => deleteApplication(app.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
