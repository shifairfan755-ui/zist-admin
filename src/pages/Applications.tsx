import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-hot-toast";

const badgeColors: any = {
  Pending: "bg-yellow-600 text-white",
  "Approved For Verification": "bg-blue-600 text-white",
  "Verification Done": "bg-indigo-600 text-white",
  "Final Call": "bg-purple-600 text-white",
  "Rejected Without Verification": "bg-red-700 text-white",
  "Rejected After Verification": "bg-red-600 text-white",
  "Approved and Disbursed": "bg-green-600 text-white",
};

const statusBg: any = {
  Pending: "bg-yellow-100 text-yellow-800 border border-yellow-400",
  "Rejected Without Verification": "bg-red-100 text-red-800 border border-red-400",
  "Approved For Verification": "bg-blue-100 text-blue-800 border border-blue-400",
  "Verification Done": "bg-indigo-100 text-indigo-800 border border-indigo-400",
  FinalCall: "bg-purple-100 text-purple-800 border border-purple-400",
  "Rejected After Verification": "bg-red-200 text-red-900 border border-red-500",
  "Approved and Disbursed": "bg-green-100 text-green-800 border border-green-400",
};

export default function Applications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState("table");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const location = useLocation(); // FIX refresh after delete

  // Fetch all applications
  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setApplications(data || []);
  };

  // Fetch all photos
  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from("application_photos")
      .select("*");

    if (!error) setPhotos(data || []);
  };

  // Load on page open AND anytime route changes
  useEffect(() => {
    (async () => {
      await fetchApplications();
      await fetchPhotos();
      setLoading(false);
    })();
  }, [location.pathname]); // FIX

  // Thumbnail
  const getPreviewPhoto = (applicationId: string) => {
    const match = photos.find((p) => p.application_id === applicationId);
    return match ? match.photo_url : "/no-photo.png";
  };

  // Delete Application
  const deleteApplication = async (id: string) => {
    const yes = confirm("Are you sure you want to delete this application?");
    if (!yes) return;

    // 1️⃣ Delete photos (optional files)
    const { data: appPhotos } = await supabase
      .from("application_photos")
      .select("*")
      .eq("application_id", id);

    if (appPhotos && appPhotos.length > 0) {
      const filePaths = appPhotos
        .map((x) => x.file_path)
        .filter((x) => x && x.length > 3);

      if (filePaths.length > 0) {
        await supabase.storage.from("application-photos").remove(filePaths);
      }

      await supabase.from("application_photos").delete().eq("application_id", id);
    }

    // 2️⃣ Delete main application
    const { error } = await supabase.from("applications").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete application");
      return;
    }

    // 3️⃣ Remove from UI immediately
    setApplications((prev) => prev.filter((a) => a.id !== id));

    toast.success("Application deleted");
  };

  const filtered = applications.filter((a) =>
    (
      (a.applicant_name || "") +
      (a.application_no || "") +
      (a.phone || "") +
      (a.requested_for || "")
    )
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-3xl font-bold text-blue-700">Applications</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded ${
              viewMode === "table" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Table
          </button>

          <button
            onClick={() => setViewMode("cards")}
            className={`px-4 py-2 rounded ${
              viewMode === "cards" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Cards
          </button>

          <Link
            to="/new-application"
            className="bg-green-600 text-white px-4 py-2 rounded shadow"
          >
            + New Application
          </Link>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search name, APP no, phone, requested for"
        className="border p-3 rounded w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ====================== CARD VIEW ====================== */}
      {viewMode === "cards" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="bg-white p-4 rounded-2xl shadow border hover:shadow-lg transition"
            >
              <img
                src={getPreviewPhoto(app.id)}
                className="h-40 w-full object-cover rounded-xl mb-3"
              />

              <h2 className="text-xl font-bold">{app.applicant_name}</h2>
              <p className="text-gray-600 mb-1">APP: {app.application_no}</p>
              <p className="text-gray-600 text-sm">S/o {app.parentage}</p>

              <p className="mt-2">
                <b>Requested For:</b> {app.requested_for}
              </p>

              <p>
                <b>Amount:</b> ₹{app.amount_requested}
              </p>

              {/* Status */}
              <div className="mt-3">
                <select
                  value={app.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value;

                    await supabase
                      .from("applications")
                      .update({ status: newStatus })
                      .eq("id", app.id);

                    setApplications((prev) =>
                      prev.map((item) =>
                        item.id === app.id
                          ? { ...item, status: newStatus }
                          : item
                      )
                    );
                  }}
                  className={`px-2 py-1 rounded text-sm w-full font-semibold ${statusBg[app.status]}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Rejected Without Verification">
                    Rejected Without Verification
                  </option>
                  <option value="Approved For Verification">
                    Approved For Verification
                  </option>
                  <option value="Verification Done">Verification Done</option>
                  <option value="Final Call">Final Call</option>
                  <option value="Rejected After Verification">
                    Rejected After Verification
                  </option>
                  <option value="Approved and Disbursed">
                    Approved and Disbursed
                  </option>
                </select>
              </div>

              <div className="mt-4 flex gap-4 font-bold">
                <Link to={`/view-application/${app.id}`} className="text-blue-700">
                  View
                </Link>
                <Link to={`/edit-application/${app.id}`} className="text-green-700">
                  Edit
                </Link>
                <button
                  onClick={() => deleteApplication(app.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ====================== TABLE VIEW ====================== */}
      {viewMode === "table" && (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-blue-100">
              <tr>
                <th className="p-2">APP No</th>
                <th className="p-2">Photo</th>
                <th className="p-2">Name</th>
                <th className="p-2">Parentage</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Requested For</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((app) => (
                <tr key={app.id} className="border-t hover:bg-blue-50">

                  <td className="p-2 font-semibold">{app.application_no}</td>

                  <td className="p-2">
                    <img
                      src={getPreviewPhoto(app.id)}
                      className="h-12 w-12 rounded object-cover"
                    />
                  </td>

                  <td className="p-2">{app.applicant_name}</td>
                  <td className="p-2">{app.parentage}</td>
                  <td className="p-2">{app.phone}</td>
                  <td className="p-2">{app.requested_for}</td>
                  <td className="p-2">₹{app.amount_requested}</td>

                  <td className="p-2">
                    <select
                      value={app.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;

                        await supabase
                          .from("applications")
                          .update({ status: newStatus })
                          .eq("id", app.id);

                        setApplications((prev) =>
                          prev.map((item) =>
                            item.id === app.id
                              ? { ...item, status: newStatus }
                              : item
                          )
                        );
                      }}
                      className={`px-2 py-1 rounded text-sm font-semibold ${statusBg[app.status]}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Rejected Without Verification">
                        Rejected Without Verification
                      </option>
                      <option value="Approved For Verification">
                        Approved For Verification
                      </option>
                      <option value="Verification Done">Verification Done</option>
                      <option value="Final Call">Final Call</option>
                      <option value="Rejected After Verification">
                        Rejected After Verification
                      </option>
                      <option value="Approved and Disbursed">
                        Approved and Disbursed
                      </option>
                    </select>
                  </td>

                  <td className="p-2 flex gap-3">
                    <Link to={`/view-application/${app.id}`} className="text-blue-600">
                      View
                    </Link>
                    <Link to={`/edit-application/${app.id}`} className="text-green-600">
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
      )}

    </div>
  );
}
