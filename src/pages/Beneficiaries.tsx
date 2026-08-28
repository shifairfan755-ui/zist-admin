import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] =
    useState<any[]>([]);
  const [search, setSearch] = useState("");

  const { role } = useAuth();

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  async function loadBeneficiaries() {
    const { data, error } = await supabase
      .from("beneficiaries")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Beneficiaries load error:",
        error
      );
      return;
    }

    setBeneficiaries(data || []);
  }

  const handleDelete = async (
    id: number
  ) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this beneficiary?"
      );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("beneficiaries")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Delete failed");
      return;
    }

    loadBeneficiaries();
  };

  const filtered =
    beneficiaries.filter((b) => {
      const q = search.toLowerCase();

      return (
        b.full_name
          ?.toLowerCase()
          .includes(q) ||
        b.ben_no
          ?.toString()
          .includes(q) ||
        b.category
          ?.toLowerCase()
          .includes(q) ||
        b.phone
          ?.toString()
          .includes(q)
      );
    });

  return (
    <div className="p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Beneficiaries
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage all registered
            beneficiaries
          </p>
        </div>

        {role === "admin" && (
          <Link
            to="/beneficiaries/add"
            className="w-full md:w-auto text-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            + Add Beneficiary
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search by name, ben no, phone..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white shadow rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-4">
                Ben No
              </th>
              <th className="p-4">
                Name
              </th>
              <th className="p-4">
                Category
              </th>
              <th className="p-4">
                Phone
              </th>
              <th className="p-4">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-500"
                >
                  No beneficiaries found.
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr
                  key={b.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-4">
                    {b.ben_no}
                  </td>

                  <td className="p-4 font-medium">
                    {b.full_name}
                  </td>

                  <td className="p-4">
                    {b.category}
                  </td>

                  <td className="p-4">
                    {b.phone}
                  </td>

                  <td className="p-4 space-x-3">
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
                          onClick={() =>
                            handleDelete(
                              b.id
                            )
                          }
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-500">
            No beneficiaries found.
          </div>
        ) : (
          filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl shadow p-4"
            >
              <div className="font-semibold text-lg text-slate-800">
                {b.full_name}
              </div>

              <div className="mt-3 space-y-1 text-sm text-slate-600">
                <p>
                  <span className="font-medium">
                    Ben No:
                  </span>{" "}
                  {b.ben_no}
                </p>

                <p>
                  <span className="font-medium">
                    Category:
                  </span>{" "}
                  {b.category}
                </p>

                <p>
                  <span className="font-medium">
                    Phone:
                  </span>{" "}
                  {b.phone}
                </p>
              </div>

              <div className="flex gap-3 mt-4 flex-wrap">
                <Link
                  to={`/beneficiaries/view/${b.id}`}
                  className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm"
                >
                  View
                </Link>

                {role === "admin" && (
                  <>
                    <Link
                      to={`/beneficiaries/edit/${b.id}`}
                      className="px-3 py-2 rounded-lg bg-green-50 text-green-700 text-sm"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() =>
                        handleDelete(b.id)
                      }
                      className="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}