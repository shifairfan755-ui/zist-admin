import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBeneficiaries = async () => {
    const { data, error } = await supabase
      .from("beneficiaries")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setBeneficiaries(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const confirmDelete = confirm("Are you sure? This cannot be undone.");
    if (!confirmDelete) return;

    await supabase.from("beneficiaries").delete().eq("id", id);
    alert("Deleted successfully");
    fetchBeneficiaries();
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  const badgeStyles = {
    Active: "bg-green-200 text-green-800",
    Pending: "bg-yellow-200 text-yellow-800",
    Completed: "bg-blue-200 text-blue-800",
    "In Progress": "bg-purple-200 text-purple-800",
    Rejected: "bg-red-200 text-red-800",
    "On Hold": "bg-gray-300 text-gray-800",
    Verified: "bg-blue-300 text-blue-900",
    New: "bg-pink-200 text-pink-800",
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">
        Beneficiaries
      </h1>

      {/* IMPORT BUTTON */}
      <div className="flex justify-end mb-4">
        <Link
          to="/import-data"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Import Beneficiaries
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border">
        <table className="w-full border">
          <thead className="bg-purple-100">
            <tr className="text-left">
              <th className="p-2">Ben No</th>
              <th className="p-2">Full Name</th>
              <th className="p-2">Category</th>
              <th className="p-2">Status</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {beneficiaries.map((b) => (
              <tr key={b.id} className="border-t hover:bg-purple-50">
                <td className="p-2">{b.ben_no}</td>
                <td className="p-2 font-semibold">{b.full_name}</td>

                {/* CATEGORY BADGE */}
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      badgeStyles[b.category] || "bg-gray-200"
                    }`}
                  >
                    {b.category}
                  </span>
                </td>

                {/* STATUS BADGE */}
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      badgeStyles[b.current_status] || "bg-gray-200"
                    }`}
                  >
                    {b.current_status}
                  </span>
                </td>

                <td className="p-2">{b.phone}</td>

                {/* ACTION BUTTONS */}
                <td className="p-2 flex gap-4">
                  {/* VIEW PROFILE */}
                  <Link
                    to={`/beneficiary/${b.id}`}
                    className="text-purple-600 underline"
                  >
                    View
                  </Link>

                  {/* EDIT BENEFICIARY */}
                  <Link
                    to={`/edit-beneficiary/${b.id}`}
                    className="text-blue-600 underline"
                  >
                    Edit
                  </Link>

                  {/* DELETE */}
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="text-red-600 underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {beneficiaries.length === 0 && (
          <p className="text-center p-6 text-gray-500">No beneficiaries found.</p>
        )}
      </div>
    </div>
  );
}
