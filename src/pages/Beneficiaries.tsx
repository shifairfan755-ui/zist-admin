import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const { role } = useAuth();

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  async function loadBeneficiaries() {
    const { data, error } = await supabase
      .from("beneficiaries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Beneficiaries load error:", error);
      return;
    }

    setBeneficiaries(data || []);
  }

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this beneficiary?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("beneficiaries")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Delete failed");
      console.error(error);
      return;
    }

    loadBeneficiaries();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Beneficiaries</h1>

        {role === "admin" && (
          <Link
            to="/beneficiaries/add"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Add Beneficiary
          </Link>
        )}
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Ben No</th>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {beneficiaries.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No beneficiaries found.
                </td>
              </tr>
            ) : (
              beneficiaries.map((b) => (
                <tr key={b.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{b.ben_no}</td>
                  <td className="p-3 font-medium">{b.full_name}</td>
                  <td className="p-3">{b.category}</td>
                  <td className="p-3">{b.phone}</td>

                  <td className="p-3 space-x-4">
                    {/* ✅ FIXED ROUTES */}
                    <Link
                      to={`/beneficiaries/view/${b.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>

                    {role === "admin" && (
                      <>
                        <Link
                          to={`/beneficiaries/edit/${b.id}`}
                          className="text-green-600 hover:underline"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() => handleDelete(b.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
